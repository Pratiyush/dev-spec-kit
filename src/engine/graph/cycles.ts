import type { EdgeKind } from "./types.js";

/**
 * FEAT-CYCLE-01 — dependency-cycle detection (the safe harvest from task-master's
 * validate/fix-dependencies). A cycle in the `dependsOn` edges means a circular dependency that can
 * never resolve — a proof loop with no entry point. Pure DFS three-colouring; returns each cycle as
 * the node-id path that closes it. Operates only on `dependsOn` edges; other edge kinds are ignored.
 */

export interface DepEdge {
  from: string;
  to: string;
  kind: EdgeKind;
}

export function findDependencyCycles(edges: DepEdge[]): string[][] {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (e.kind !== "dependsOn") continue;
    const out = adj.get(e.from);
    if (out) out.push(e.to);
    else adj.set(e.from, [e.to]);
  }
  const color = new Map<string, 0 | 1 | 2>(); // 0 unseen · 1 on-stack · 2 done
  const stack: string[] = [];
  const cycles: string[][] = [];
  const dfs = (u: string): void => {
    color.set(u, 1);
    stack.push(u);
    for (const v of adj.get(u) ?? []) {
      const c = color.get(v) ?? 0;
      if (c === 0) dfs(v);
      else if (c === 1) {
        // back edge to a node still on the stack → the cycle is stack[i..] then back to v
        const i = stack.indexOf(v);
        if (i >= 0) cycles.push([...stack.slice(i), v]);
      }
    }
    stack.pop();
    color.set(u, 2);
  };
  for (const u of adj.keys()) if ((color.get(u) ?? 0) === 0) dfs(u);
  return cycles;
}
