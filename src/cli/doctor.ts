import { execSync } from "node:child_process";
import pc from "picocolors";
import { GRAPHIFY_INSTALL_HINT } from "../engine/graphify/index.js";
import { specHealth } from "./workflow.js";
import { label } from "./emoji.js";

export interface Check {
  name: string;
  ok: boolean;
  detail: string;
  required: boolean;
  hint?: string;
}

export type Probe = (cmd: string) => string | null;

/** Run a command and return trimmed stdout, or null if it fails / is missing. */
function realProbe(cmd: string): string | null {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function firstLine(s: string | null): string {
  return s ? (s.split("\n")[0] ?? s) : "missing";
}

/**
 * The prerequisite matrix — pure, probe-injectable (testable).
 * Dogfood lesson (notepad session): graphify is OPTIONAL-with-consequences, never a required red —
 * Rivet runs fully without it (graph/dashboard-map features stay off), so setup can never stall on
 * a permission classifier refusing the install.
 */
export function doctorChecks(probe: Probe = realProbe): Check[] {
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  const graphifyPresent = !!probe("graphify --version") || !!probe("graphify --help");
  return [
    {
      name: "Node.js",
      ok: nodeMajor >= 22,
      detail: process.version,
      required: true,
      hint: "Install Node.js >= 22",
    },
    { name: "git", ok: !!probe("git --version"), detail: firstLine(probe("git --version")), required: true },
    {
      name: "Python 3.10+",
      ok: !!probe("python3 --version"),
      detail: firstLine(probe("python3 --version")),
      required: false,
      hint: "Only needed for graphify (the code-graph layer)",
    },
    {
      name: "graphify",
      ok: graphifyPresent,
      detail: graphifyPresent
        ? "installed (external provider available)"
        : "missing — graph features run on the bundled revitify provider; external graphify is opt-in (graphify.provider) and only then are its extras disabled (Rivet still fully works)",
      required: false,
      hint: GRAPHIFY_INSTALL_HINT,
    },
    {
      name: "Java (JDK)",
      ok: !!probe("java -version 2>&1"),
      detail: firstLine(probe("java -version 2>&1")),
      required: false,
      hint: "Needed for Java/Spring/Quarkus targets",
    },
    {
      name: "Maven",
      ok: !!probe("mvn -v"),
      detail: firstLine(probe("mvn -v")),
      required: false,
      hint: "Needed for Maven-based Java targets",
    },
  ];
}

/** `rivet doctor` — verify prerequisites; only REQUIRED misses fail the exit code. */
/**
 * FEAT-FLUSH-01 (worktree half) — isolation worktrees (.claude/worktrees/, wave .worktrees/)
 * pile up invisibly. Pure parser over `git worktree list --porcelain`; doctor LISTS them with a
 * cleanup hint. Visibility only — removal stays human.
 */
export function parseStaleWorktrees(porcelain: string): string[] {
  return porcelain
    .split("\n")
    .filter((l) => l.startsWith("worktree "))
    .map((l) => l.slice("worktree ".length).trim())
    .filter((p) => p.includes("/.claude/worktrees/") || p.includes("/.worktrees/"));
}

export function runDoctor(): void {
  const checks = doctorChecks();
  console.log(pc.bold("\nRivet doctor — prerequisite check\n"));
  let missingRequired = 0;
  for (const c of checks) {
    const mark = c.ok ? pc.green("✓") : c.required ? pc.red("✗") : pc.yellow("•");
    console.log(`  ${mark} ${c.name.padEnd(16)} ${pc.dim(c.detail)}`);
    if (!c.ok && c.hint) console.log(`      ${pc.dim("→ " + c.hint)}`);
    if (!c.ok && c.required) missingRequired++;
  }
  const stale = parseStaleWorktrees(realProbe("git worktree list --porcelain") ?? "");
  if (stale.length > 0) {
    console.log(`\n  ${label("cleanup")} ${stale.length} isolation worktree(s) lying around:`);
    for (const p of stale) console.log(pc.dim(`      ${p}`));
    console.log(
      pc.dim("      → clean up when merged: git worktree remove <path>  (wave dirs: rivet wave done <id>)"),
    );
  }
  // FEAT-LINT-01 (feedback #1: "fold into rivet doctor") — spec drift is a health problem too.
  let orphans = 0;
  const health = specHealth(process.cwd());
  if (health.hasSpecs) {
    console.log(`\n  ${label("report")} spec health`);
    orphans = health.dangling.length + health.parseWarnings.length;
    if (orphans === 0 && health.unbound.length === 0) {
      console.log(pc.green("      ✓ every @check ref resolves; every obligation is bound"));
    } else {
      for (const w of health.parseWarnings) console.log(pc.red(`      ✗ SPEC ${w}`));
      for (const d of health.dangling) {
        const why = d.reason === "file-missing" ? "file not found" : "test renamed?";
        console.log(pc.red(`      ✗ ORPHANED ${d.ref}`) + pc.dim(`  (${why}; ${d.owner})`));
      }
      for (const c of health.unbound) {
        console.log(pc.yellow(`      ⚠ UNCOVERED ${c.id}`) + pc.dim("  (no @check)"));
      }
      console.log(pc.dim("      → run `rivet spec lint` / `rivet spec tasks` to fix"));
    }
  }
  console.log("");
  if (missingRequired > 0 || orphans > 0) {
    if (missingRequired > 0) console.log(pc.red(`${missingRequired} required prerequisite(s) missing.`));
    if (orphans > 0) console.log(pc.red(`${orphans} orphaned @check ref(s) — the spec has drifted.`));
    process.exitCode = 1;
  } else {
    console.log(pc.green("All required prerequisites present; spec is in sync."));
  }
}
