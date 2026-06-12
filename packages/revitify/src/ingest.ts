import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";
import type { RevitifyGraph, RevitifyNode, RevitifyLink } from "./types.js";

/**
 * Ingestion — code + markdown into nodes/links.
 *
 * TS/JS go through the TypeScript compiler API (real syntax, no regex guessing); Python and Java
 * get best-effort line grammars (top-level symbols + imports); markdown contributes doc nodes per
 * top-level heading. Communities are directory-based: cheap, deterministic, and good enough to
 * color a map (Leiden clustering is graphify's depth — explicitly out of scope for v1).
 */

const DEFAULT_EXCLUDES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "coverage",
  "graphify-out",
  ".rivet",
  "_ref",
  ".claude",
  ".worktrees",
  ".husky",
  "__pycache__",
  "target",
  ".venv",
  "venv",
]);

const TS_EXT = /\.(ts|tsx|mts|cts|js|mjs|cjs|jsx)$/;
const SKIP_TS = /\.d\.ts$/;

export function walkFiles(rootDir: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir).sort()) {
      if (DEFAULT_EXCLUDES.has(entry) || entry.startsWith(".")) continue;
      const path = join(dir, entry);
      const st = statSync(path);
      if (st.isDirectory()) walk(path);
      else if (st.isFile() && st.size < 2_000_000) out.push(path);
    }
  };
  walk(rootDir);
  return out;
}

interface Builder {
  nodes: Map<string, RevitifyNode>;
  links: RevitifyLink[];
  communities: Map<string, number>;
}

function communityOf(b: Builder, rel: string): number {
  const top = rel.includes("/") ? rel.split("/")[0]! : ".";
  if (!b.communities.has(top)) b.communities.set(top, b.communities.size);
  return b.communities.get(top)!;
}

function addNode(
  b: Builder,
  id: string,
  label: string,
  kind: string,
  sourceFile: string,
  line?: number,
): void {
  if (b.nodes.has(id)) return;
  b.nodes.set(id, {
    id,
    label,
    name: label,
    kind,
    source_file: sourceFile,
    ...(line !== undefined ? { source_location: `${sourceFile}:${line}` } : {}),
    community: communityOf(b, sourceFile),
  });
}

function fileNode(b: Builder, rel: string): string {
  addNode(b, `file:${rel}`, rel, "file", rel);
  return `file:${rel}`;
}

/** TS/JS via the compiler API: exported symbols, class members, imports, identifier references. */
function ingestTs(b: Builder, rel: string, content: string): void {
  const fileId = fileNode(b, rel);
  const sf = ts.createSourceFile(rel, content, ts.ScriptTarget.Latest, true);
  const line = (node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

  const symbol = (name: string, node: ts.Node, kind: string) => {
    const id = `sym:${rel}#${name}`;
    addNode(b, id, name, kind, rel, line(node));
    b.links.push({ source: fileId, target: id, relation: "contains" });
    return id;
  };

  const importedNames: string[] = [];
  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
      const spec = stmt.moduleSpecifier.text;
      if (spec.startsWith(".")) {
        const targetRel = normalizeImport(rel, spec);
        b.links.push({ source: fileId, target: `file:${targetRel}`, relation: "imports" });
      }
      const clause = stmt.importClause;
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const el of clause.namedBindings.elements) importedNames.push(el.name.text);
      }
      if (clause?.name) importedNames.push(clause.name.text);
      continue;
    }
    if (ts.isFunctionDeclaration(stmt) && stmt.name) symbol(stmt.name.text, stmt, "function");
    else if (ts.isClassDeclaration(stmt) && stmt.name) {
      const classId = symbol(stmt.name.text, stmt, "class");
      for (const member of stmt.members) {
        if (
          (ts.isMethodDeclaration(member) || ts.isGetAccessor(member)) &&
          member.name &&
          ts.isIdentifier(member.name)
        ) {
          const mId = `sym:${rel}#${stmt.name.text}.${member.name.text}`;
          addNode(b, mId, member.name.text, "method", rel, line(member));
          b.links.push({ source: classId, target: mId, relation: "contains" });
        }
      }
    } else if (ts.isInterfaceDeclaration(stmt)) symbol(stmt.name.text, stmt, "interface");
    else if (ts.isEnumDeclaration(stmt)) symbol(stmt.name.text, stmt, "enum");
    else if (ts.isTypeAliasDeclaration(stmt)) symbol(stmt.name.text, stmt, "type");
    else if (ts.isVariableStatement(stmt)) {
      const exported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (exported) {
        for (const decl of stmt.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) symbol(decl.name.text, decl, "const");
        }
      }
    }
  }
  // Reference edges: this file uses the names it imported (target symbol may live anywhere).
  for (const name of importedNames) {
    b.links.push({ source: fileId, target: `name:${name}`, relation: "references" });
  }
}

/** "./crypto.js" from "src/auth.ts" → "src/crypto.ts" (strip runtime .js, best-effort). */
function normalizeImport(fromRel: string, spec: string): string {
  const dir = fromRel.includes("/") ? fromRel.slice(0, fromRel.lastIndexOf("/")) : "";
  const parts = (dir ? dir.split("/") : []).concat(spec.split("/"));
  const stack: string[] = [];
  for (const p of parts) {
    if (p === "." || p === "") continue;
    if (p === "..") stack.pop();
    else stack.push(p);
  }
  return stack
    .join("/")
    .replace(/\.js$/, ".ts")
    .replace(/\.mjs$/, ".mts")
    .replace(/\.jsx$/, ".tsx");
}

const PY_SYMBOL = /^(?:class|def)\s+([A-Za-z_]\w*)/;
const JAVA_SYMBOL =
  /^\s*(?:public|protected|private|abstract|final|static|\s)*\s*(?:class|interface|enum|record)\s+([A-Za-z_]\w*)/;
const MD_HEADING = /^(#{1,2})\s+(.+)$/;

function ingestLines(b: Builder, rel: string, content: string, re: RegExp, kind: string): void {
  const fileId = fileNode(b, rel);
  content.split("\n").forEach((lineText, i) => {
    const m = lineText.match(re);
    if (!m) return;
    const id = `sym:${rel}#${m[1]}`;
    addNode(b, id, m[1]!, kind, rel, i + 1);
    b.links.push({ source: fileId, target: id, relation: "contains" });
  });
}

function ingestMarkdown(b: Builder, rel: string, content: string): void {
  const fileId = fileNode(b, rel);
  let inFence = false;
  content.split("\n").forEach((lineText, i) => {
    if (/^(```|~~~)/.test(lineText)) inFence = !inFence;
    if (inFence) return;
    const m = lineText.match(MD_HEADING);
    if (!m) return;
    const id = `doc:${rel}#${m[2]!.trim()}`;
    addNode(b, id, m[2]!.trim(), "doc", rel, i + 1);
    b.links.push({ source: fileId, target: id, relation: "contains" });
  });
}

export function ingest(rootDir: string): Pick<RevitifyGraph, "nodes" | "links"> {
  const b: Builder = { nodes: new Map(), links: [], communities: new Map() };
  for (const path of walkFiles(rootDir)) {
    const rel = relative(rootDir, path).split("\\").join("/");
    let content: string;
    try {
      content = readFileSync(path, "utf8");
    } catch {
      continue; // unreadable/binary — never fatal
    }
    if (TS_EXT.test(rel) && !SKIP_TS.test(rel)) ingestTs(b, rel, content);
    else if (rel.endsWith(".py")) ingestLines(b, rel, content, PY_SYMBOL, "function");
    else if (rel.endsWith(".java")) ingestLines(b, rel, content, JAVA_SYMBOL, "class");
    else if (rel.endsWith(".md")) ingestMarkdown(b, rel, content);
  }
  // Resolve name: reference targets to real symbol nodes where unambiguous; drop dangling ones.
  const byName = new Map<string, string[]>();
  for (const n of b.nodes.values()) {
    if (!n.id.startsWith("sym:")) continue;
    (byName.get(n.label) ?? byName.set(n.label, []).get(n.label)!).push(n.id);
  }
  const links = b.links
    .map((l) => {
      if (!String(l.target).startsWith("name:")) return l;
      const candidates = byName.get(String(l.target).slice(5));
      return candidates?.length ? { ...l, target: candidates[0]! } : null;
    })
    .filter((l): l is RevitifyLink => l !== null)
    .filter((l) => b.nodes.has(String(l.source)) || String(l.source).startsWith("file:"))
    .filter((l) => b.nodes.has(String(l.target)) || String(l.target).startsWith("file:"));
  return { nodes: [...b.nodes.values()], links };
}
