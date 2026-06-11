/**
 * WAVE-01 — wave planning: group not-done tasks into parallel waves where no two tasks in a wave
 * touch the same bound-check FILE (the no-shared-files rule), capped at the configured wave size
 * (~6 — the rate-limit wipeout lesson). Pure planning; the CLI does the git work.
 */

export interface WaveTask {
  id: string;
  boundChecks: string[];
  status: string;
}

/** Files a task's bound checks live in: "file::name" → file; "Class#m" → Class.java. */
export function filesForTask(t: { boundChecks: string[] }): Set<string> {
  const files = new Set<string>();
  for (const ref of t.boundChecks) {
    if (ref.includes("::")) files.add(ref.split("::")[0]!);
    else {
      const maven = ref.match(/^([A-Za-z_][A-Za-z0-9_]*)#/);
      if (maven) files.add(`${maven[1]}.java`);
      else files.add(ref);
    }
  }
  return files;
}

export function planWaves<T extends WaveTask>(tasks: T[], waveSize: number): T[][] {
  const pending = tasks.filter((t) => t.status !== "done");
  const waves: T[][] = [];
  const waveFiles: Array<Set<string>> = [];
  for (const t of pending) {
    const mine = filesForTask(t);
    let placed = false;
    for (let w = 0; w < waves.length; w++) {
      const overlap = [...mine].some((f) => waveFiles[w]!.has(f));
      if (!overlap && waves[w]!.length < waveSize) {
        waves[w]!.push(t);
        for (const f of mine) waveFiles[w]!.add(f);
        placed = true;
        break;
      }
    }
    if (!placed) {
      waves.push([t]);
      waveFiles.push(new Set(mine));
    }
  }
  return waves;
}
