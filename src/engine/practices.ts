import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * FEAT-INITPACKS-01 — per-platform best-practice packs, seeded by `dev-spec-kit init --platforms` as
 * SCOPED LAW FILES (.dev-spec-kit/laws/*.md, the STEER-01 fileMatch mechanism). Standards arrive
 * pre-wired to enforcement: every pack ends with a "Bind these as dev-spec-kit checks" section showing
 * the verify.runners / kindRunners wiring, so the tools run under `dev-spec-kit verify` and are bindable
 * as @check kinds. Hard constraint stated in every file: free or open-source tools only.
 */

export interface PracticePack {
  file: string;
  body: string;
}

const CONSTRAINT = "> Constraint: every tool below is **free or open-source** — no paid licenses, ever.";

const TS_PACK = `---
inclusion: fileMatch
pattern: \\.tsx?$
---
# Best practices — TypeScript

${CONSTRAINT}

## Compiler is the first linter
- \`tsconfig.json\` MUST set: \`strict: true\`, \`noImplicitAny\`, \`noUnusedLocals\`,
  \`noUncheckedIndexedAccess\` — indexing returns \`T | undefined\`; handle it, don't assert it away.
- ESM (\`"type": "module"\`); no \`require\` in new code.

## Lint + format (free, standard)
- **ESLint** (typescript-eslint recommended config) — correctness, not style debates.
- **Prettier** — formatting is automated, never reviewed.
- No silent \`catch\` blocks: every catch either handles, rethrows, or logs with context.

## Tests & dependencies
- **Vitest** co-located tests (\`foo.test.ts\` next to \`foo.ts\` or in \`test/\`); every bug fix
  starts with the failing test.
- **npm audit** on dependencies — runs in \`dev-spec-kit verify\` via the audit kind below.

## Bind these as dev-spec-kit checks
\`\`\`jsonc
// .dev-spec-kit/config.json → verify
"kindRunners": {
  "lint":  { "cmd": "npx", "args": ["eslint", "."] },
  "audit": { "cmd": "npm", "args": ["audit", "--audit-level=high"] }
}
// spec criteria can then bind: @check kind=lint ref=eslint  ·  @check kind=audit ref=npm-audit
\`\`\`
`;

const ELECTRON_PACK = `---
inclusion: always
---
# Best practices — Electron (security baseline)

${CONSTRAINT}

## Non-negotiable BrowserWindow settings
- \`contextIsolation: true\` — ALWAYS. The renderer never shares a JS context with internals.
- \`nodeIntegration: false\` — the renderer gets NO Node. Capabilities are granted, never inherited.
- Preload scripts expose a minimal API via \`contextBridge.exposeInMainWorld\` ONLY — no leaking
  \`ipcRenderer\` wholesale.
- Validate EVERY IPC message in the main process (sender frame + payload schema); treat the
  renderer as untrusted input.
- Ship a strict **CSP**; no remote content loaded into privileged windows by default.
- Releases are **signed/notarized** per OS.

## Tests
- **Playwright** drives Electron for E2E (free, first-class Electron support).

## Bind these as dev-spec-kit checks
\`\`\`jsonc
"kindRunners": {
  "e2e": { "cmd": "npx", "args": ["playwright", "test"] }
}
// @check kind=e2e ref=e2e/launch.spec.ts::app boots with contextIsolation
\`\`\`
`;

const JAVA_PACK = `---
inclusion: fileMatch
pattern: \\.java$
---
# Best practices — Java / Spring Boot

${CONSTRAINT}

## Static quality (all free)
- **Checkstyle** — coding standards.
- **SpotBugs** — real bugs in compiled bytecode.
- **PMD** — code smells, complexity, dead code.
- **JaCoCo** — coverage on JUnit runs.
- **ArchUnit** — architecture rules as tests; e.g. controllers MUST NOT call repositories
  directly (service layer is the only path), no package cycles.
- **OWASP Dependency-Check** — vulnerable libraries.

## Tests
- **JUnit 5** units · **Mockito** mocking · **Testcontainers** for real-dependency integration
  tests (DB, queues) — never mock what you can run in a container.

## Bind these as dev-spec-kit checks
\`\`\`jsonc
"runners": {
  "java-maven": { "cmd": "mvn", "args": ["-B", "test", "-Dtest={ref}"] }
},
"kindRunners": {
  "lint":  { "cmd": "mvn", "args": ["-B", "checkstyle:check", "spotbugs:check", "pmd:check"] },
  "audit": { "cmd": "mvn", "args": ["-B", "org.owasp:dependency-check-maven:check"] }
}
// ArchUnit rules are plain JUnit tests: @check kind=unit ref=ArchitectureTest#layering
\`\`\`
`;

const PYTHON_PACK = `---
inclusion: fileMatch
pattern: \\.py$
---
# Best practices — Python

${CONSTRAINT}

## Toolchain (all free)
- **ruff** — lint AND format (one fast tool; replaces flake8+isort+black).
- **mypy --strict** — type safety; new modules start strict, never loosen to "fix" an error.
- **pytest** with coverage; fixtures over setup methods; every bug fix starts with a failing test.
- **pip-audit** — vulnerable dependencies.

## Bind these as dev-spec-kit checks
\`\`\`jsonc
"runners": {
  "python-pytest": { "cmd": "python3", "args": ["-m", "pytest", "{ref}"] }
},
"kindRunners": {
  "lint":  { "cmd": "python3", "args": ["-m", "ruff", "check", "."] },
  "audit": { "cmd": "python3", "args": ["-m", "pip_audit"] }
}
\`\`\`
`;

const GATES_PACK = `---
inclusion: always
---
# Best practices — quality gates (any platform)

${CONSTRAINT}

## Pre-commit (the cheapest gate)
- **Husky** runs checks before every commit; **lint-staged** scopes them to changed files —
  fast enough that nobody bypasses it.

## Central dashboards — OPTIONAL, never required
- **SonarQube Community Edition** (free): smells, bugs, duplication for Java + TS.
- **GitHub CodeQL** (free for public repos; check terms for private): deep SAST.
- These are optional add-ons; dev-spec-kit's verify gate is the required floor.

## Bind these as dev-spec-kit checks
\`\`\`jsonc
// the pre-commit hook simply runs what verify runs:
//   .husky/pre-commit → npx lint-staged   (and dev-spec-kit verify before push/PR)
\`\`\`
`;

const POLYGLOT_PACK = `---
inclusion: always
---
# Best practices — polyglot project

${CONSTRAINT}

- Each language keeps its OWN runner under \`verify.runners\` / \`verify.kindRunners\` — never
  funnel one language's tests through another's toolchain.
- Boundaries between languages carry **shared contracts** (OpenAPI/JSON Schema/protobuf) with
  contract checks on BOTH sides (\`@check kind=api\`).
- **ONE CI gate** covers all languages: \`dev-spec-kit verify\` runs every configured kind — a PR is
  green only when every language is green. No per-language merge buttons.

## Bind these as dev-spec-kit checks
\`\`\`jsonc
"verify": {
  "runners":     { "node-vitest": { "cmd": "npx", "args": ["vitest", "run"] },
                   "python-pytest": { "cmd": "python3", "args": ["-m", "pytest"] } },
  "kindRunners": { "api": { "cmd": "npx", "args": ["vitest", "run", "test/contracts"] } }
}
\`\`\`
`;

const FAMILY: Record<string, string> = {
  "java-maven": "java",
  "java-gradle": "java",
  spring: "java",
  quarkus: "java",
  node: "node",
  typescript: "node",
  electron: "node",
  react: "node",
  next: "node",
  angular: "node",
  python: "python",
};

/** Which packs apply to a platform set (pure — testable selection). */
export function practicesFor(platforms: string[]): PracticePack[] {
  const packs: PracticePack[] = [];
  const has = (p: string) => platforms.includes(p);
  const families = new Set(platforms.map((p) => FAMILY[p]).filter(Boolean));
  if (families.has("node")) packs.push({ file: "best-practices-typescript.md", body: TS_PACK });
  if (has("electron")) packs.push({ file: "best-practices-electron.md", body: ELECTRON_PACK });
  if (families.has("java")) packs.push({ file: "best-practices-java.md", body: JAVA_PACK });
  if (families.has("python")) packs.push({ file: "best-practices-python.md", body: PYTHON_PACK });
  if (platforms.length > 0) packs.push({ file: "best-practices-quality-gates.md", body: GATES_PACK });
  if (families.size > 1) packs.push({ file: "best-practices-polyglot.md", body: POLYGLOT_PACK });
  return packs;
}

/** Seed the packs as scoped law files. Idempotent: existing files are skipped unless force. */
export function seedPractices(
  cwd: string,
  platforms: string[],
  force: boolean,
): { seeded: string[]; skipped: string[] } {
  const lawsDir = join(cwd, ".dev-spec-kit", "laws");
  mkdirSync(lawsDir, { recursive: true });
  const seeded: string[] = [];
  const skipped: string[] = [];
  for (const pack of practicesFor(platforms)) {
    const path = join(lawsDir, pack.file);
    if (existsSync(path) && !force) {
      skipped.push(pack.file);
      continue;
    }
    writeFileSync(path, pack.body);
    seeded.push(pack.file);
  }
  return { seeded, skipped };
}
