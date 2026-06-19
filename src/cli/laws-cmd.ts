import pc from "picocolors";
import { loadLaws } from "../engine/steering.js";

/** `dev-spec-kit laws` — show the effective laws the agent is bound by, with their sources. */
export function lawsCmd(opts: { for?: string; summon?: string[] }): void {
  const laws = loadLaws(process.cwd(), {
    ...(opts.for ? { file: opts.for } : {}),
    ...(opts.summon ? { summon: opts.summon } : {}),
  });
  if (laws.sections.length === 0) {
    console.log(pc.yellow("no laws found — create .dev-spec-kit/laws.md (dev-spec-kit init does this)"));
    return;
  }
  for (const s of laws.sections) {
    console.log(pc.bold(`\n━━ ${s.source} ━━`));
    console.log(s.body.trim());
  }
  for (const w of laws.warnings) console.log(pc.yellow(`\n⚠ ${w}`));
  console.log("");
}
