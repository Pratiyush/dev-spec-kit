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
  "doctor",
  "init",
  "task",
  "check",
  "status",
  "verify",
  "graph",
  "spec",
  "approve",
  "pr",
  "route",
  "guard",
  "unlock",
  "trace",
  "drift",
  "affected",
  "log",
  "resume",
]);
const SUBCOMMANDS = new Set([
  "create",
  "start",
  "done",
  "run",
  "build",
  "tasks",
  "pr",
  "lint",
  "draft-tests",
]);
const KNOWN_ARTIFACTS = [
  ".dev-spec-kit/", // the project root marker itself ("if .dev-spec-kit/ is missing, run dev-spec-kit init")
  ".dev-spec-kit/specs/",
  ".dev-spec-kit/config.json",
  ".dev-spec-kit/journal.jsonl",
  ".dev-spec-kit/graph.json",
  ".dev-spec-kit/approvals/",
  ".dev-spec-kit/pr-body.md",
  ".dev-spec-kit/intake/",
  ".dev-spec-kit/laws.md",
  ".dev-spec-kit/learnings.md",
  ".dev-spec-kit/RESUME.md",
  ".dev-spec-kit/unlock.json",
  ".dev-spec-kit/cache/",
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

    it(`${dir}: every referenced dev-spec-kit command exists in the CLI`, () => {
      // Match only backtick-wrapped command refs (`dev-spec-kit <cmd>`) — the doc convention for a
      // real command. Bare prose ("dev-spec-kit reviews your diff") is the product name, not a command.
      for (const m of text.matchAll(/`dev-spec-kit\s+([a-z-]+)(?:\s+([a-z-]+))?/g)) {
        const cmd = m[1]!;
        expect(COMMANDS.has(cmd), `'dev-spec-kit ${cmd}' referenced in ${dir} but not a real command`).toBe(
          true,
        );
        const sub = m[2];
        if (
          sub &&
          (cmd === "task" || cmd === "check" || cmd === "graph" || cmd === "spec" || cmd === "guard")
        ) {
          expect(SUBCOMMANDS.has(sub), `'dev-spec-kit ${cmd} ${sub}' in ${dir} not a real subcommand`).toBe(
            true,
          );
        }
      }
    });

    it(`${dir}: every referenced .dev-spec-kit artifact is a known one`, () => {
      for (const m of text.matchAll(/\.dev-spec-kit\/[A-Za-z0-9._/-]*/g)) {
        const ref = m[0]!;
        expect(
          KNOWN_ARTIFACTS.some(
            (k) => ref === k || ref.startsWith(k) || k.startsWith(ref + "/") || ref + "/" === k,
          ),
          `'${ref}' referenced in ${dir} is not a known dev-spec-kit artifact`,
        ).toBe(true);
      }
    });
  }

  it("the QA suite saw a sane number of skills", () => {
    expect(skillDirs.length).toBeGreaterThanOrEqual(6); // workflow, spec-author, intake, review, retro, finish
  });
});
