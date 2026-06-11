import { execSync } from "node:child_process";
import pc from "picocolors";

interface Check {
  name: string;
  ok: boolean;
  detail: string;
  required: boolean;
  hint?: string;
}

/** Run a command and return trimmed stdout, or null if it fails / is missing. */
function probe(cmd: string): string | null {
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
 * `rivet doctor` — verify the prerequisites Rivet relies on, with install hints for anything missing.
 * Required: Node >= 22, git, Python >= 3.10, graphify. Optional (per target stack): JDK, Maven.
 */
export function runDoctor(): void {
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  const checks: Check[] = [
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
      required: true,
      hint: "graphify needs Python >= 3.10",
    },
    {
      name: "graphify",
      ok: !!probe("graphify --version") || !!probe("graphify --help"),
      detail: probe("graphify --version") ? "installed" : "missing",
      required: true,
      hint: "pip install graphifyy && graphify install   (PyPI package is 'graphifyy'; CLI is 'graphify')",
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
