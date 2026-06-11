import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ZodError } from "zod";
import { parseConfig, type RivetConfig } from "../config/schema.js";

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

export function loadConfig(projectDir: string): RivetConfig {
  const path = join(projectDir, ".rivet", "config.json");
  if (!existsSync(path)) return parseConfig({});
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    throw new InputError(`invalid .rivet/config.json: ${(e as Error).message}`);
  }
  try {
    return parseConfig(raw);
  } catch (e) {
    if (e instanceof ZodError) {
      const first = e.issues[0];
      const where = first?.path.join(".") || "(root)";
      throw new InputError(`invalid .rivet/config.json at ${where}: ${first?.message ?? "schema violation"}`);
    }
    throw e;
  }
}
