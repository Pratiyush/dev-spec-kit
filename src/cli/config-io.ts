import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ZodError } from "zod";
import { parseConfig, type DevSpecKitConfig } from "../config/schema.js";
import { BUILTIN_STACKS } from "../engine/verify/runner.js";

/**
 * FIX-ROBUST-01: user-editable inputs never crash the tool. All config reads go through here;
 * malformed JSON or schema violations become one clean InputError naming the file and the problem.
 */

export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

export function loadConfig(projectDir: string): DevSpecKitConfig {
  const path = join(projectDir, ".dev-spec-kit", "config.json");
  if (!existsSync(path)) return parseConfig({});
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    throw new InputError(`invalid .dev-spec-kit/config.json: ${(e as Error).message}`);
  }
  try {
    return parseConfig(raw);
  } catch (e) {
    if (e instanceof ZodError) {
      const first = e.issues[0];
      const where = first?.path.join(".") || "(root)";
      let msg = `invalid .dev-spec-kit/config.json at ${where}: ${first?.message ?? "schema violation"}`;
      // Dogfood lesson: a RUNNER stack filed under project.platforms must get a pointer home.
      const received = (first as { received?: unknown } | undefined)?.received;
      if (
        first?.path[0] === "project" &&
        (first.path[1] === "platforms" || first.path[1] === "stacks") &&
        typeof received === "string" &&
        (BUILTIN_STACKS as readonly string[]).includes(received)
      ) {
        msg +=
          `\n  ↳ '${received}' is a RUNNER stack — use it with \`dev-spec-kit check run --stack ${received}\` ` +
          `or define it in verify.runners. project.platforms describes the codebase (typescript, react, spring, …).`;
      }
      throw new InputError(msg);
    }
    /* c8 ignore start -- rethrow for a non-Zod error (a real bug, surfaced rather than swallowed). */
    throw e;
  }
  /* c8 ignore stop */
}
