/**
 * FEAT-EMOJI-01 — the emoji vocabulary, centralized. Emoji are an event-type grammar: every
 * renderer reads ONE map instead of scattering literals, so adding a type is a one-line change
 * and CI logs can degrade to greppable ASCII (--plain · NO_EMOJI=1 · auto when not a TTY).
 *
 * Persisted markdown artifacts (LEDGER.md, TRACKING.md, PR bodies, approval files) keep emoji as
 * CONTENT — plain mode applies to terminal decoration only.
 */

/** The set that was already in use across renderers before this map existed (frozen). */
export const BASELINE_EMOJI = [
  "✅",
  "❌",
  "⚪",
  "🟢",
  "🔴",
  "🟣",
  "⬜",
  "🚧",
  "🔨",
  "🏁",
  "🔗",
  "🔁",
  "💾",
  "🛡️",
  "🎯",
  "📊",
  "🔏",
  "📋",
  "📝",
  "⚠",
  "🎉",
  "▶️",
  "⛔",
  "◇",
  "🔓",
  "❓",
  "🧾",
] as const;

export const EMOJI = {
  /** a check starts executing */
  checkRun: "🧪",
  /** evidence tables / verify summaries */
  report: "📋",
  /** mode routing + stack inference */
  route: "🧭",
  /** spec tasks created/synced */
  specSync: "✍️",
  /** verify build phase */
  build: "📦",
  /** durations in verify summaries */
  duration: "⏱️",
  /** drift re-runs */
  drift: "♻️",
  /** init scaffold lines */
  scaffold: "🧰",
  /** research-mode banner */
  research: "🔍",
  /** PR body generated */
  pr: "🚀",
  /** learnings-flush pre-flight */
  flush: "📝",
  /** stale worktree visibility */
  cleanup: "🧹",
} as const;

export type EmojiKey = keyof typeof EMOJI;

const PLAIN: Record<EmojiKey, string> = {
  checkRun: "[test]",
  report: "[report]",
  route: "[route]",
  specSync: "[spec]",
  build: "[build]",
  duration: "[time]",
  drift: "[drift]",
  scaffold: "[init]",
  research: "[research]",
  pr: "[pr]",
  flush: "[notes]",
  cleanup: "[cleanup]",
};

/** Pure resolution: --plain flag > NO_EMOJI env (1/0) > TTY auto-detection. */
export function resolvePlain(input: {
  argv: string[];
  env: Record<string, string | undefined>;
  isTTY: boolean;
}): boolean {
  if (input.argv.includes("--plain")) return true;
  if (input.env.NO_EMOJI === "1") return true;
  if (input.env.NO_EMOJI === "0") return false;
  return !input.isTTY;
}

export function plainMode(): boolean {
  return resolvePlain({ argv: process.argv, env: process.env, isTTY: Boolean(process.stdout.isTTY) });
}

export function labelWith(key: EmojiKey, plain: boolean): string {
  return plain ? PLAIN[key] : EMOJI[key];
}

/** The call sites' one-liner: the emoji for a TTY, the ASCII tag for CI/logs. */
export function label(key: EmojiKey): string {
  return labelWith(key, plainMode());
}
