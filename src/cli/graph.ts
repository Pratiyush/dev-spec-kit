import pc from "picocolors";
import { materialize } from "./materialize.js";
import { summarize } from "../engine/graph/build.js";
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
  console.log("");
}
