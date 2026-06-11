import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

/**
 * SKILL-QA-01: prose rots silently — these checks make skill drift mechanical. Every shipped skill
 * must have sane frontmatter, RFC-2119 teeth, and reference ONLY commands and artifacts that exist.
 * (LLM-judged compliance scenarios are a future layer; this is the structural floor.)
 */

const SKILLS_DIR = join(process.cwd(), "skills");
const skillDirs = readdirSync(SKILLS_DIR).filter((d) => existsSync(join(SKILLS_DIR, d, "SKILL.md")));

/** The real CLI vocabulary — update when commands change, or this suite fails (that's the point). */
const COMMANDS = new Set([
  "doctor", "init", "task", "check", "status", "graph", "spec", "approve", "pr", "route",
  "guard", "unlock", "trace", "drift", "affected", "log", "resume",
]);
const SUBCOMMANDS = new Set(["create", "start", "done", "run", "build", "tasks", "pr"]);
const KNOWN_ARTIFACTS = [
  ".rivet/", // the project root marker itself ("if .rivet/ is missing, run rivet init")
  ".rivet/specs/", ".rivet/config.json", ".rivet/journal.jsonl", ".rivet/graph.json",
  ".rivet/approvals/", ".rivet/pr-body.md", ".rivet/intake/", ".rivet/constitution.md",
  ".rivet/learnings.md", ".rivet/RESUME.md", ".rivet/unlock.json", ".rivet/cache/",
];

describe("every shipped skill passes structural QA", () => {
  for (const dir of skillDirs) {
    const path = join(SKILLS_DIR, dir, "SKILL.md");
    const text = readFileSync(path, "utf8");

    it(`${dir}: frontmatter name matches dir, description is substantial`, () => {
      const fm = text.match(/^---\nname: (.+)\ndescription: ([\s\S]+?)\n---/);
      expect(fm, `${dir} frontmatter`).toBeTruthy();
      expect(fm![1]!.trim()).toBe(basename(dir));
      expect(fm![2]!.trim().length).toBeGreaterThan(80);
    });

    it(`${dir}: has RFC-2119 teeth (MUST/NEVER present)`, () => {
      expect(text).toMatch(/\b(MUST|NEVER|SHALL)\b/);
    });

    it(`${dir}: every referenced rivet command exists in the CLI`, () => {
      for (const m of text.matchAll(/\brivet\s+([a-z-]+)(?:\s+([a-z-]+))?/g)) {
        const cmd = m[1]!;
        expect(COMMANDS.has(cmd), `'rivet ${cmd}' referenced in ${dir} but not a real command`).toBe(true);
        const sub = m[2];
        if (sub && (cmd === "task" || cmd === "check" || cmd === "graph" || cmd === "spec" || cmd === "guard")) {
          expect(SUBCOMMANDS.has(sub), `'rivet ${cmd} ${sub}' in ${dir} not a real subcommand`).toBe(true);
        }
      }
    });

    it(`${dir}: every referenced .rivet artifact is a known one`, () => {
      for (const m of text.matchAll(/\.rivet\/[A-Za-z0-9._/-]*/g)) {
        const ref = m[0]!;
        expect(
          KNOWN_ARTIFACTS.some((k) => ref === k || ref.startsWith(k) || k.startsWith(ref + "/") || ref + "/" === k),
          `'${ref}' referenced in ${dir} is not a known Rivet artifact`,
        ).toBe(true);
      }
    });
  }

  it("the QA suite saw a sane number of skills", () => {
    expect(skillDirs.length).toBeGreaterThanOrEqual(6); // workflow, spec-author, intake, review, retro, finish
  });
});
