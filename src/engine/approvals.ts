import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { Journal } from "./state/journal.js";
import type { Task, TaskStore } from "./state/tasks.js";
import { gitTreeHash, isDirty } from "./git.js";
import { identityLabel, proofStamp } from "./verify/stamp.js";

/**
 * Recorded human approval — a signed, dated artifact in the repo, not a chat message.
 *
 * `rivet approve` requires the named tasks to be DONE (their checks already proved green by the
 * done-gate); the artifact then records WHO approved WHAT, WHEN, at WHICH commit, with the evidence
 * inline. Approval is the human gate ON TOP of verification, never a substitute for it.
 */

export interface ApprovalInput {
  projectDir: string;
  taskIds: string[];
  store: TaskStore;
  journal: Journal;
  /** Approver name; defaults to git user.name. */
  approver?: string;
  note?: string;
}

export class ApprovalError extends Error {}

export function createApproval(input: ApprovalInput): { path: string; markdown: string } {
  const tasks: Task[] = input.taskIds.map((id) => {
    const t = input.store.get(id);
    if (!t) throw new ApprovalError(`unknown task: ${id}`);
    if (t.status !== "done") {
      throw new ApprovalError(`task ${id} is '${t.status}' — only DONE (proven) tasks can be approved`);
    }
    return t;
  });

  const approver = input.approver ?? gitConfig(input.projectDir, "user.name") ?? "unknown";
  const sha = gitHead(input.projectDir);
  // FIX-PROOF-04: the approval records the CODE TREE it was granted against — the same identity
  // every proof carries — never just whatever commit happened to be HEAD.
  const tree = gitTreeHash(input.projectDir);
  const treeLabel = identityLabel({
    ...(sha ? { sha } : {}),
    ...(tree ? { tree, dirty: isDirty(input.projectDir) } : {}),
  });
  const date = new Date().toISOString();

  const lines: string[] = [
    `# Approval — ${input.taskIds.join(", ")}`,
    "",
    `- **Approved by:** ${approver}`,
    `- **At:** ${date}`,
    `- **Code tree:** ${treeLabel || "(no git identity)"}`,
    ...(input.note ? [`- **Note:** ${input.note}`] : []),
    "",
    "## Evidence",
    "",
  ];
  for (const t of tasks) {
    lines.push(`### ${t.id} — ${t.title} (${t.status})`);
    for (const ref of t.boundChecks) {
      const r = t.results[ref];
      lines.push(
        r
          ? `- ${r.passed ? "✅" : "❌"} \`${ref}\`${proofStamp(r)} (${r.at})`
          : `- ⚠️ \`${ref}\` — no recorded run`,
      );
    }
    lines.push("");
  }
  const markdown = lines.join("\n");

  const dir = join(input.projectDir, ".rivet", "approvals");
  mkdirSync(dir, { recursive: true });
  const slug = input.taskIds.join("-").replace(/[^A-Za-z0-9_-]+/g, "_");
  const path = join(dir, `${date.slice(0, 10)}-${slug}.md`);
  writeFileSync(path, markdown + "\n");

  input.journal.append("approval.recorded", {
    taskIds: input.taskIds,
    approver,
    sha,
    ...(tree ? { tree } : {}),
    path,
  });
  return { path, markdown };
}

/** List approval artifact filenames (for the PR body). */
export function listApprovals(projectDir: string): string[] {
  const dir = join(projectDir, ".rivet", "approvals");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
}

function gitHead(cwd: string): string | undefined {
  const res = spawnSync("git", ["rev-parse", "HEAD"], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() : undefined;
}

function gitConfig(cwd: string, key: string): string | undefined {
  const res = spawnSync("git", ["config", key], { cwd, stdio: ["ignore", "pipe", "ignore"] });
  return res.status === 0 ? res.stdout.toString().trim() || undefined : undefined;
}
