import pc from "picocolors";
import { spawnSync } from "node:child_process";
import { materialize, journalFor } from "./materialize.js";
import { TaskStore } from "../engine/state/tasks.js";
import { rollupRequirements, driftTargets } from "../engine/graph/build.js";
import { blastRadius } from "../engine/graph/types.js";
import { runCheck, pickRunner } from "../engine/verify/runner.js";
import { runWithRetry } from "../engine/verify/retry.js";
import { kindForRef } from "../engine/spec/ears.js";
import { graphifyBin } from "../engine/graphify/index.js";
import type { ProofState } from "../engine/graph/types.js";
import { label } from "./emoji.js";
import { refreshDocs } from "./refresh-docs.js";

const LIGHT: Record<ProofState, string> = {
  green: pc.green("● green"),
  red: pc.red("● red"),
  stale: pc.magenta("● stale"),
  unproven: pc.yellow("○ unproven"),
};

/** `rivet trace` — requirement→criterion truth table + the gaps, straight from the graph. */
export function trace(): void {
  const cwd = process.cwd();
  const m = materialize(cwd, { refresh: false, write: false }); // read-only truth table
  if (m.requirements.length === 0) {
    console.log(pc.yellow("no specs in .rivet/specs/ — nothing to trace"));
    return;
  }
  const rollups = rollupRequirements(m.requirements, m.vtg);
  console.log(pc.bold("\nTraceability — generated from the graph, never claimed\n"));
  for (const r of rollups) {
    const badge = r.proven ? pc.green("PROVEN ") : pc.yellow("PENDING");
    console.log(`  ${badge} ${pc.bold(r.id)} ${r.title}`);
    for (const c of r.criteria) {
      const bound = c.bound ? "" : pc.red("  ⚠ NO @check BINDING (unverifiable)");
      console.log(`          ${LIGHT[c.proof]} ${pc.dim(c.id)}${bound}`);
    }
  }
  const unbound = rollups.flatMap((r) => r.criteria.filter((c) => !c.bound));
  const unproven = rollups.filter((r) => !r.proven);
  console.log(
    `\n  ${rollups.length - unproven.length}/${rollups.length} requirement(s) proven · ` +
      `${unbound.length} unbound criteria` +
      (m.codeGraphLoaded ? "" : pc.dim(" · code graph not loaded")),
  );
  if (unproven.length > 0) process.exitCode = 1;
}

/** `rivet drift [--stack <fallback>]` — find red/stale proofs and re-verify them in one move. */
export function drift(opts: { stack?: string; dryRun?: boolean }): void {
  const cwd = process.cwd();
  // --dry-run promised not to touch anything: no graphify re-index, no graph.json write.
  const before = materialize(cwd, opts.dryRun ? { refresh: false, write: false } : { refresh: true });
  const targets = driftTargets(before.vtg, before.tasks);
  if (targets.length === 0) {
    console.log(pc.green("✓ no drift — every proof is green or awaiting its first run"));
    return;
  }
  console.log(pc.bold(`\n${targets.length} drifted proof(s):`));
  for (const t of targets) {
    console.log(
      `  ${t.proof === "red" ? pc.red("RED  ") : pc.magenta("STALE")} ${t.ref}` +
        pc.dim(` (${t.taskIds.join(", ") || "no task"})`),
    );
  }
  if (opts.dryRun) {
    console.log(pc.dim("\n--dry-run: not re-running. Re-verify with: rivet drift"));
    process.exitCode = 1;
    return;
  }

  const store = new TaskStore(journalFor(cwd));
  const config = before.config;
  let reran = 0;
  for (const t of targets) {
    const stack = t.stack ?? opts.stack;
    if (!stack) {
      console.log(pc.yellow(`  ⚠ ${t.ref}: no recorded stack and no --stack fallback — skipped`));
      continue;
    }
    const kind = kindForRef(before.requirements, t.ref) ?? "unit";
    const picked = pickRunner(config, kind, stack);
    process.stdout.write(pc.dim(`  ${label("drift")} re-running ${t.ref} [${kind}] via ${stack} … `));
    const { result, attempts } = runWithRetry(
      () => ({
        ...runCheck({ kind: kind as never, ref: t.ref }, stack, { cwd }, picked.override),
        stack,
        kind,
      }),
      config.verify.flaky === "retry-flag" ? config.build.retryLimit : 0,
    );
    for (const taskId of t.taskIds.length > 0 ? t.taskIds : []) store.recordCheck(taskId, result);
    reran++;
    console.log(
      result.passed ? pc.green(`PASS${result.flaky ? ` (flaky, attempt ${attempts})` : ""}`) : pc.red("FAIL"),
    );
  }

  const after = materialize(cwd, { refresh: false });
  refreshDocs(cwd, config, after); // REQUIREMENT_DOCS-01: re-proofs are exactly when documents change
  const remaining = driftTargets(after.vtg, after.tasks);
  const v = after.vtg.edges.filter((e) => e.kind === "validates");
  const green = v.filter((e) => e.proof === "green").length;
  console.log(
    `\n  re-ran ${reran}/${targets.length} · validates now: ${pc.green(`${green}/${v.length} green`)}` +
      (remaining.length > 0 ? pc.red(` · ${remaining.length} still drifted`) : ""),
  );
  if (remaining.length > 0) process.exitCode = 1;
}

/** `rivet affected <label>` — blast radius: our proven edges + graphify's reverse traversal. */
export function affected(label: string): void {
  const cwd = process.cwd();
  const m = materialize(cwd, { refresh: false, write: false }); // read-only blast radius
  const needle = label.toLowerCase();
  const node = m.vtg.nodes.find(
    (n) => n.kind === "codeNode" && (n.id.toLowerCase() === needle || n.label.toLowerCase().includes(needle)),
  );
  if (node) {
    const edges = blastRadius(m.vtg, node.id);
    console.log(
      pc.bold(`\nProven edges touching ${node.label}:`) + (edges.length === 0 ? pc.dim(" none") : ""),
    );
    for (const e of edges) console.log(`  ${LIGHT[e.proof]} ${e.kind} ${pc.dim(`${e.from} → ${e.to}`)}`);
  } else {
    console.log(pc.yellow(`no code node matching '${label}' in the graph`));
  }
  const bin = graphifyBin();
  if (bin) {
    console.log(pc.bold("\ngraphify reverse traversal:"));
    const res = spawnSync(bin, ["affected", label], { cwd, stdio: ["ignore", "pipe", "pipe"] });
    const out = res.stdout?.toString().trim();
    console.log(
      out ? pc.dim(out.split("\n").slice(0, 20).join("\n")) : pc.dim(res.stderr?.toString().trim() ?? ""),
    );
  }
}
