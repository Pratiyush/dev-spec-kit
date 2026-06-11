import { execSync } from "node:child_process";
import pc from "picocolors";
import { GRAPHIFY_INSTALL_HINT } from "../engine/graphify/index.js";

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
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
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
      detail: graphifyPresent ? "installed" : "missing — graph features disabled (Rivet still fully works)",
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
  console.log("");
  if (missingRequired > 0) {
    console.log(pc.red(`${missingRequired} required prerequisite(s) missing.`));
    process.exitCode = 1;
  } else {
    console.log(pc.green("All required prerequisites present."));
  }
}
