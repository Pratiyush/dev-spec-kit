import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * STEER-01 — the laws layer made real (Kiro-steering shape, Rivet vocabulary).
 * Three scopes: ALWAYS (.rivet/laws.md + scoped files without/with inclusion:always),
 * FILE-MATCH (.rivet/laws/<x>.md with `inclusion: fileMatch` + `pattern:` regex over the file path),
 * MANUAL (`inclusion: manual` + `name:` — loaded only when summoned). Personal defaults
 * (~/.rivet/laws.md) come FIRST and the project overrides by coming after. `#[[file:path]]`
 * injects external docs inline (size-capped). Laws are data; this engine only assembles them.
 */

export interface LawSection {
  source: string;
  body: string;
}

export interface EffectiveLaws {
  sections: LawSection[];
  warnings: string[];
}

interface ScopedFile {
  inclusion: "always" | "fileMatch" | "manual";
  pattern?: string;
  name?: string;
  body: string;
}

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;
const INCLUDE = /#\[\[file:([^\]]+)\]\]/g;
const INCLUDE_CAP = 8 * 1024;

function parseScoped(text: string): ScopedFile {
  const m = text.match(FRONTMATTER);
  if (!m) return { inclusion: "always", body: text };
  const fm: Record<string, string> = {};
  for (const line of m[1]!.split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) fm[kv[1]!] = kv[2]!.trim();
  }
  const inclusion = (
    ["always", "fileMatch", "manual"].includes(fm.inclusion ?? "") ? fm.inclusion : "always"
  ) as ScopedFile["inclusion"];
  const scoped: ScopedFile = { inclusion, body: text.slice(m[0].length) };
  if (fm.pattern !== undefined) scoped.pattern = fm.pattern;
  if (fm.name !== undefined) scoped.name = fm.name;
  return scoped;
}

function expandIncludes(body: string, projectDir: string, source: string, warnings: string[]): string {
  return body.replace(INCLUDE, (_match, rel: string) => {
    const path = join(projectDir, rel.trim());
    if (!existsSync(path)) {
      warnings.push(`${source}: #[[file:${rel.trim()}]] not found — left unexpanded`);
      return `(missing include: ${rel.trim()})`;
    }
    const content = readFileSync(path, "utf8");
    return content.length > INCLUDE_CAP ? content.slice(0, INCLUDE_CAP) + "\n…(truncated)" : content;
  });
}

export interface LoadLawsOptions {
  /** File path the work touches — activates fileMatch-scoped laws. */
  file?: string;
  /** Manual law names to summon. */
  summon?: string[];
  /** Personal defaults path (default ~/.rivet/laws.md); injectable for tests. */
  personalPath?: string;
}

export function loadLaws(projectDir: string, opts: LoadLawsOptions = {}): EffectiveLaws {
  const warnings: string[] = [];
  const sections: LawSection[] = [];

  const personalPath = opts.personalPath ?? join(homedir(), ".rivet", "laws.md");
  if (existsSync(personalPath)) {
    sections.push({ source: "personal", body: readFileSync(personalPath, "utf8") });
  }

  const projectLaws = join(projectDir, ".rivet", "laws.md");
  if (existsSync(projectLaws)) {
    sections.push({
      source: "project",
      body: expandIncludes(readFileSync(projectLaws, "utf8"), projectDir, "laws.md", warnings),
    });
  }

  const scopedDir = join(projectDir, ".rivet", "laws");
  if (existsSync(scopedDir)) {
    for (const f of readdirSync(scopedDir)
      .filter((f) => f.endsWith(".md"))
      .sort()) {
      const scoped = parseScoped(readFileSync(join(scopedDir, f), "utf8"));
      const active =
        scoped.inclusion === "always" ||
        (scoped.inclusion === "fileMatch" &&
          opts.file !== undefined &&
          scoped.pattern !== undefined &&
          new RegExp(scoped.pattern).test(opts.file)) ||
        (scoped.inclusion === "manual" &&
          (opts.summon ?? []).includes(scoped.name ?? f.replace(/\.md$/, "")));
      if (active) {
        sections.push({
          source: `laws/${f}`,
          body: expandIncludes(scoped.body, projectDir, `laws/${f}`, warnings),
        });
      }
    }
  }

  return { sections, warnings };
}
