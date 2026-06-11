import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";
import { materialize, journalFor } from "./materialize.js";
import { summarize, rollupRequirements } from "../engine/graph/build.js";
import { writeBoards } from "./boards.js";
import { requiredPacks, evaluatePack } from "../engine/gatepacks.js";
import { graphifyInstalled, GRAPHIFY_INSTALL_HINT } from "../engine/graphify/index.js";

/**
 * `rivet graph build` — materialize the Verified Traceability Graph:
 * parse specs -> fold journal -> (re)index the code graph via graphify -> overlay proof states ->
 * write committed .rivet/graph.json and print a traffic-light summary.
 */
export function graphBuild(opts: { refresh?: boolean }): void {
  const cwd = process.cwd();
  if (!graphifyInstalled()) {
    console.log(pc.yellow("graphify not installed — building spec/test overlay only"));
    console.log(pc.dim(`  → ${GRAPHIFY_INSTALL_HINT}`));
  }
  const m = materialize(cwd, { refresh: opts.refresh !== false });
  if (m.requirements.length === 0) console.log(pc.yellow("no specs found in .rivet/specs/"));

  const s = summarize(m.vtg);
  console.log(pc.bold("\nVerified Traceability Graph") + pc.dim(" → .rivet/graph.json"));
  console.log(
    `  ${s.requirements} requirement(s) · ${s.criteria} criteria · ${s.tests} test(s) · ${s.codeNodes} code node(s)`,
  );
  const v = s.validates;
  console.log(
    `  validates: ${pc.green(`● ${v.green} green`)}  ${pc.red(`● ${v.red} red`)}  ` +
      `${pc.magenta(`● ${v.stale} stale`)}  ${pc.yellow(`○ ${v.unproven} unproven`)}`,
  );
  if (v.stale > 0) {
    console.log(pc.magenta(`  drift: ${v.stale} proof(s) predate HEAD — re-verify with: rivet drift`));
    process.exitCode = 1;
  }
  if (v.red > 0) process.exitCode = 1;

  for (const w of m.specWarnings) console.log(pc.yellow(`  ⚠ ${w}`));

  // Config enforcement: every acceptance criterion must bind to an executable check.
  const unbound = m.requirements.flatMap((r) => r.criteria.filter((c) => c.checks.length === 0).map((c) => c.id));
  if (unbound.length > 0) {
    const msg = `  ${unbound.length} criteria with NO @check binding (unverifiable): ${unbound.join(", ")}`;
    if (m.config.verify.everyCriterionNeedsCheck) {
      console.error(pc.red("✗" + msg) + pc.dim("  [verify.everyCriterionNeedsCheck]"));
      process.exitCode = 1;
    } else {
      console.log(pc.yellow("⚠" + msg));
    }
  }

  // GATE-PACKS-01: packs in force (explicit require ∪ triggered by spec text) must be satisfied.
  const specsDir = join(cwd, ".rivet", "specs");
  const specText = existsSync(specsDir)
    ? readdirSync(specsDir)
        .filter((f) => f.endsWith(".md"))
        .sort()
        .map((f) => readFileSync(join(specsDir, f), "utf8"))
        .join("\n")
    : "";
  const packNames = requiredPacks(specText, m.config);
  if (packNames.length > 0) {
    const violations = packNames.flatMap((n) => {
      const pack = m.config.gates.packs[n];
      return pack ? evaluatePack(specText, m.requirements, n, pack) : [];
    });
    if (violations.length > 0) {
      for (const v of violations) console.error(pc.red(`  ✗ ${v}`) + pc.dim("  [gates]"));
      process.exitCode = 1;
    } else {
      console.log(pc.dim(`  gate packs in force: ${packNames.join(", ")} — satisfied`));
    }
  }
  // BOARDS-01: every graph build refreshes the generated boards — they can never drift from truth.
  writeBoards(cwd, m.tasks, journalFor(cwd).read(), rollupRequirements(m.requirements, m.vtg));
  console.log(pc.dim("  boards → .rivet/LEDGER.md · .rivet/TRACKING.md"));
  console.log("");
}
