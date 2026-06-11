import type { Requirement } from "./spec/ears.js";
import type { RivetConfig } from "../config/schema.js";
import type { Mode } from "./route/classify.js";

/**
 * GATE-PACKS-01 — the 17-gate proposal's CONTENT as config-driven packs (menu, never mandate).
 * A pack = required spec sections + required check kinds + triggers. Packs apply when explicitly
 * required (gates.require) or when a trigger matches; a TRIGGERED pack also FLOORS the routing
 * mode to full-spec (ECC orch-pipeline: "anything touching a security trigger is at least standard").
 */

export interface PackDef {
  sections: string[];
  kinds: string[];
  triggers: string[];
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function triggered(text: string, config: RivetConfig): string[] {
  const out: string[] = [];
  for (const [name, pack] of Object.entries(config.gates.packs)) {
    if (pack.triggers.some((t) => new RegExp(`\\b${escapeRe(t)}`, "i").test(text))) out.push(name);
  }
  return out.sort();
}

/** Packs in force for this text: explicit require ∪ trigger-matched. */
export function requiredPacks(text: string, config: RivetConfig): string[] {
  return [...new Set([...config.gates.require, ...triggered(text, config)])].sort();
}

/** Evaluate one pack against a spec: missing sections and missing check kinds are violations. */
export function evaluatePack(specText: string, requirements: Requirement[], name: string, pack: PackDef): string[] {
  const violations: string[] = [];
  for (const section of pack.sections) {
    const re = new RegExp(`^#{1,6}\\s+.*${escapeRe(section)}`, "im");
    if (!re.test(specText)) violations.push(`pack '${name}': missing required section '${section}'`);
  }
  const present = new Set(requirements.flatMap((r) => r.criteria.flatMap((c) => c.checks.map((ch) => ch.kind))));
  for (const kind of pack.kinds) {
    if (!present.has(kind as never)) violations.push(`pack '${name}': missing required check kind '${kind}'`);
  }
  return violations;
}

/** Security floor: a TRIGGERED pack forces full-spec regardless of how small the ask looks. */
export function applyGateFloor(
  text: string,
  mode: Mode,
  config: RivetConfig,
): { mode: Mode; reason: string; packs: string[] } {
  const packs = triggered(text, config);
  if (packs.length > 0 && mode !== "full-spec") {
    return {
      mode: "full-spec",
      reason: `gate trigger floors this to full-spec (packs: ${packs.join(", ")}) — security-sensitive scope is never quick`,
      packs,
    };
  }
  return { mode, reason: "", packs };
}
