/**
 * Shared test-report plumbing — emit machine-readable results from ONE runner invocation and read
 * them back. Two consumers:
 *   - the per-check runner (runner.ts): turn a name-filtered run into a trustworthy pass/fail,
 *     where a zero-match is a FAILURE, not the exit-0 silent pass vitest/jest give by default.
 *   - batch stamping (verify --stamp): run a whole suite once, then attribute each test back to the
 *     criterion that bound it — instead of one cold runner start per criterion.
 *
 * vitest's JSON reporter mirrors jest's shape, so one parser serves both.
 */

export type AssertionStatus = "passed" | "failed" | "skipped" | "pending" | "todo" | "disabled";

export interface AssertionResult {
  /** the bare `it(...)`/`test(...)` name. */
  title: string;
  /** describe-chain + title joined (what `--testNamePattern` matches against). */
  fullName: string;
  status: AssertionStatus;
  /** absolute path of the file the test lives in. */
  file?: string;
  failureMessages?: string[];
}

export interface TestReport {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  assertions: AssertionResult[];
}

/** Reporter family — they differ only in the CLI flags that emit JSON to a file. */
export type Reporter = "vitest" | "jest";

/** Args that make a runner write a jest-shaped JSON report to `path` while keeping human output. */
export function reportArgs(reporter: Reporter, path: string): string[] {
  switch (reporter) {
    case "vitest":
      // keep `default` so a failure still prints a human-readable tail; `json` goes to the file.
      return ["--reporter=default", "--reporter=json", `--outputFile=${path}`];
    case "jest":
      return ["--json", `--outputFile=${path}`];
  }
}

/**
 * Escape a test name so it is matched LITERALLY by a `--testNamePattern` regex. Without this a name
 * like "rejects 1+1" or "save (draft)" is read as a regex and silently mis-matches.
 * The leading-`-` CLI-parse hazard is handled separately by passing `--testNamePattern=<value>`
 * (equals form), never `-t <value>`.
 */
export function escapeTestNamePattern(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split a check ref "file::name" into [file, name]; name is undefined for a whole-file ref. */
export function splitRef(ref: string): [string, string | undefined] {
  const i = ref.indexOf("::");
  return i === -1 ? [ref, undefined] : [ref.slice(0, i), ref.slice(i + 2)];
}

/** Parse a jest/vitest JSON report into the normalized shape both consumers use. */
export function parseTestReport(raw: string): TestReport {
  const j = JSON.parse(raw) as {
    numTotalTests?: number;
    numPassedTests?: number;
    numFailedTests?: number;
    testResults?: Array<{
      name?: string;
      assertionResults?: Array<{
        title?: string;
        fullName?: string;
        ancestorTitles?: string[];
        status?: string;
        failureMessages?: string[];
      }>;
    }>;
  };
  const assertions: AssertionResult[] = [];
  for (const tr of j.testResults ?? []) {
    for (const a of tr.assertionResults ?? []) {
      const title = a.title ?? "";
      assertions.push({
        title,
        fullName: a.fullName ?? [...(a.ancestorTitles ?? []), title].join(" "),
        status: (a.status as AssertionStatus) ?? "skipped",
        ...(tr.name ? { file: tr.name } : {}),
        ...(a.failureMessages && a.failureMessages.length ? { failureMessages: a.failureMessages } : {}),
      });
    }
  }
  return {
    numTotalTests: j.numTotalTests ?? 0,
    numPassedTests: j.numPassedTests ?? 0,
    numFailedTests: j.numFailedTests ?? 0,
    assertions,
  };
}

export interface CheckVerdict {
  passed: boolean;
  /** how many tests actually executed under the filter (passed + failed; excludes skipped). */
  ran: number;
  /** set when the verdict is a failure, explaining why (becomes the proof's diagnostic tail). */
  reason?: string;
}

/**
 * Decide a single bound check's verdict from its report + exit code. THE trust rule: a run where
 * zero tests executed is NEVER a pass — that means the `::name` ref is dangling or misnamed, and an
 * exit-0 zero-match would otherwise mint a green proof that proves nothing.
 */
export function interpretCheckRun(report: TestReport, exitCode: number): CheckVerdict {
  const ran = report.numPassedTests + report.numFailedTests;
  if (ran === 0) {
    return {
      passed: false,
      ran,
      reason:
        "no test executed for this ref — 0 tests matched (a name-filtered run that matches nothing is NOT a pass; the binding is dangling or the test was renamed)",
    };
  }
  if (exitCode !== 0 || report.numFailedTests > 0) {
    return { passed: false, ran, reason: `${report.numFailedTests} test(s) failed` };
  }
  return { passed: true, ran };
}
