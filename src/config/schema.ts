import { z } from "zod";

/**
 * The Rivet per-project configuration — the "config-driven policy engine".
 *
 * Every gate, autonomy level, and quality bar from the design interview is a knob here. Rivet ships
 * opinionated defaults (TDD, reuse-first, gates on, even quick-mode writes a test) but EVERYTHING is
 * overridable in one file (`.rivet/config.json`). See the plan for the rationale behind each default.
 */
export const RivetConfigSchema = z
  .object({
    /** Schema version, for forward-compatible migrations. */
    version: z.literal(1).default(1),

    project: z
      .object({
        name: z.string().default("untitled"),
        /** Stacks present in this project; drives which check-runners are wired. */
        stacks: z
          .array(
            z.enum([
              "java-maven",
              "java-gradle",
              "spring",
              "quarkus",
              "node",
              "typescript",
              "react",
              "next",
              "angular",
              "python",
            ]),
          )
          .default([]),
      })
      .default({}),

    /** The front door: how a request is routed into a workflow. */
    mode: z
      .object({
        /** Route small→quick, big→full automatically, or let the user pick. */
        routing: z.enum(["auto", "pick", "auto-override"]).default("auto-override"),
        /** Show the chosen mode + reason before proceeding. */
        confirmFirst: z.boolean().default(true),
        /** Offer a research-only "investigate and report" mode. */
        researchMode: z.boolean().default(true),
        /** User-defined custom modes: name -> description / workflow reference. */
        custom: z.record(z.string()).default({}),
      })
      .default({}),

    /** Where work comes from. */
    intake: z
      .object({
        sources: z.array(z.enum(["raw", "github", "gitlab", "jira"])).default(["raw", "github"]),
        /** How a Jira epic maps to our hierarchy. */
        jiraEpic: z.enum(["mirror", "replan", "ask"]).default("ask"),
        /** Write progress back to the source ticket. */
        writeBack: z.boolean().default(false),
      })
      .default({}),

    /** Idea -> spec. */
    spec: z
      .object({
        style: z.enum(["checklist", "stories", "both"]).default("both"),
        /** Who authors acceptance criteria. */
        acceptanceCriteria: z.enum(["tool-drafts", "user-writes"]).default("tool-drafts"),
        /** Criteria syntax. EARS = WHEN/IF ... THEN ... SHALL. */
        criteriaFormat: z.enum(["ears", "plain", "mixed"]).default("ears"),
        breakdownDepth: z
          .enum(["feature-story-task-subtask", "task-subtask"])
          .default("feature-story-task-subtask"),
        estimates: z.boolean().default(true),
        autoDependencies: z.boolean().default(true),
        diagram: z.boolean().default(true),
        /** Hunt for missing edge cases / error handling and propose extra tasks. */
        gapHunting: z.enum(["off", "propose", "auto"]).default("propose"),
        /** Warn + suggest splitting big/risky changes before starting. */
        riskWarn: z.boolean().default(true),
        /** Living plan that updates mid-build (with approval) vs frozen once approved. */
        livingPlan: z.enum(["frozen", "update-ask", "update-auto"]).default("update-ask"),
        /** When the request is vague: clarify first, or guess and flag assumptions. */
        onVague: z.enum(["clarify", "guess-flag"]).default("clarify"),
      })
      .default({}),

    /** How code is written. */
    build: z
      .object({
        /** Tests-first (TDD) vs code-first. */
        tests: z.enum(["tdd", "code-first", "either"]).default("tdd"),
        /** Restrict edits to the active task's declared files (off = trust + verify). */
        fileFence: z.boolean().default(false),
        /** Self-retry budget on a failing check before escalating. */
        retryLimit: z.number().int().min(0).default(3),
        /** Run checks after every change vs at end of task. */
        checkFrequency: z.enum(["per-change", "per-task"]).default("per-task"),
        whenStuck: z.enum(["ask", "grind", "bounded-then-ask"]).default("bounded-then-ask"),
        codeStyle: z.enum(["match-repo", "style-guide", "both"]).default("both"),
        reuse: z.enum(["prefer", "fresh-ok", "prefer-flag"]).default("prefer"),
        comments: z.enum(["minimal", "moderate", "heavy"]).default("moderate"),
        commitCadence: z.enum(["per-step", "per-task"]).default("per-task"),
        /** New dependencies: ask, auto, or ask-for-big-only. */
        newDeps: z.enum(["ask", "auto", "ask-big"]).default("ask-big"),
      })
      .default({}),

    /** What "done" means — the verification policy. This is the moat, made configurable. */
    verify: z
      .object({
        /** Which kinds of proof a criterion may bind to. */
        kinds: z
          .array(z.enum(["unit", "integration", "api", "e2e", "visual", "parity"]))
          .default(["unit", "integration", "api", "e2e"]),
        /** Coverage gate as a percentage; null = judge by criteria coverage, not a number. */
        coverage: z.union([z.number().min(0).max(100), z.null()]).default(null),
        /** A task cannot be marked done while bound checks fail. */
        blockDoneOnFail: z.boolean().default(true),
        /** Every acceptance criterion must bind to >= 1 executed check. */
        everyCriterionNeedsCheck: z.boolean().default(true),
        /** Spin up the app for end-to-end checks. */
        runApp: z.boolean().default(false),
        /** Visual/UI check method. */
        ui: z.enum(["off", "screenshot", "browser", "both"]).default("off"),
        /** Run checks in an isolated sandbox vs directly on the machine. */
        sandbox: z.enum(["sandbox", "local"]).default("local"),
        security: z.enum(["off", "pre-pr", "on-demand"]).default("on-demand"),
        lintTypes: z.enum(["part-of-done", "separate"]).default("part-of-done"),
        flaky: z.enum(["retry-flag", "quarantine"]).default("retry-flag"),
        /**
         * Custom check-runner commands, keyed by stack name — the tool's code never changes for a
         * new stack; only this input does. Args support {ref}, {file}, {name} placeholders
         * (use the combined `--flag={name}` form so name-less refs drop cleanly).
         * Overrides built-ins when the key matches; unknown keys define brand-new stacks.
         */
        runners: z.record(z.object({ cmd: z.string(), args: z.array(z.string()) })).default({}),
      })
      .default({}),

    review: z
      .object({
        separateReviewer: z.boolean().default(true),
        angles: z
          .array(z.enum(["correctness", "security", "performance", "style"]))
          .default(["correctness", "security", "performance", "style"]),
        /** Blind diff-only pass and/or full-context pass. */
        passes: z.enum(["blind", "context", "both"]).default("both"),
        /** Auto-fix findings, list them for the human, or auto-fix only small ones. */
        fixFindings: z.enum(["auto", "list", "auto-small"]).default("list"),
      })
      .default({}),

    pr: z
      .object({
        autoBody: z.boolean().default(true),
        branchPattern: z.string().default("{type}/{slug}"),
        merge: z.enum(["auto-on-green", "manual"]).default("manual"),
        waitForCI: z.boolean().default(true),
        /** Commit author: "user" = always the human; never co-author the AI by default. */
        commitAuthor: z.enum(["user", "co-author"]).default("user"),
        cleanupAfterMerge: z.boolean().default(true),
      })
      .default({}),

    memory: z
      .object({
        /** Exact mid-task resume vs clean restart on crash. */
        crashResume: z.enum(["exact", "restart"]).default("exact"),
        journal: z.enum(["full", "milestones"]).default("full"),
        /** Detect plan <-> code drift. */
        driftDetection: z.boolean().default(true),
      })
      .default({}),

    parallel: z
      .object({
        enabled: z.boolean().default(true),
        /** Max concurrent worktree tasks (~6 avoids rate-limit wipeouts). */
        waveSize: z.number().int().min(1).default(6),
        isolation: z.enum(["worktree", "shared"]).default("worktree"),
        onFileClash: z.enum(["serialize", "warn", "both"]).default("serialize"),
        coordinator: z.boolean().default(true),
      })
      .default({}),

    dashboard: z
      .object({
        enabled: z.boolean().default(true),
        form: z.enum(["web", "editor", "both"]).default("web"),
        updates: z.enum(["live", "on-demand"]).default("on-demand"),
        notify: z
          .object({
            channels: z.array(z.enum(["desktop", "slack", "email"])).default([]),
            on: z.array(z.enum(["gates", "done"])).default([]),
          })
          .default({}),
      })
      .default({}),

    rules: z
      .object({
        /** Use a constitution/rules file. */
        constitution: z.boolean().default(true),
        /** On conflict with a rule: refuse or warn. */
        onConflict: z.enum(["refuse", "warn"]).default("warn"),
        /** Inherit a personal default rules file, then override per-project. */
        inheritPersonal: z.boolean().default(true),
      })
      .default({}),

    learning: z
      .object({
        capture: z.boolean().default(true),
        /** Promote confirmed lessons into rules (with approval) — the /retro loop. */
        promoteToRules: z.enum(["off", "ask", "auto"]).default("ask"),
        /** Turn a fixed bug into a permanent regression test. */
        bugToTest: z.boolean().default(true),
        scope: z.enum(["project", "global", "both"]).default("both"),
        retro: z.enum(["per-feature", "on-demand"]).default("per-feature"),
        warnOnRepeat: z.boolean().default(true),
        /** Share learnings with a team (export/import) vs personal only. */
        share: z.enum(["personal", "team"]).default("personal"),
      })
      .default({}),

    /**
     * GATE-PACKS-01 + GATE-FACTS-01 — the 17-gate proposal's content as a config MENU, never a
     * mandate. Packs are user-editable data: required spec sections, required check kinds, and
     * security triggers that FLOOR the routing mode to full-spec. `require` lists packs enforced on
     * every spec (empty by default — ceremony stays proportional). `facts` opt-in enables the
     * DENY→FORCE→ALLOW investigative edit gate.
     */
    gates: z
      .object({
        facts: z.enum(["off", "on"]).default("off"),
        require: z.array(z.string()).default([]),
        packs: z
          .record(
            z.object({
              sections: z.array(z.string()).default([]),
              kinds: z.array(z.enum(["unit", "integration", "api", "e2e", "visual", "parity"])).default([]),
              triggers: z.array(z.string()).default([]),
            }),
          )
          .default({
            security: {
              sections: ["Security"],
              kinds: [],
              triggers: ["auth", "login", "password", "token", "secret", "payment", "crypt", "session", "permission", "sql"],
            },
            contracts: { sections: ["API Contract"], kinds: ["api"], triggers: [] },
            nfr: { sections: ["NFR"], kinds: [], triggers: [] },
            rollback: { sections: ["Rollback"], kinds: [], triggers: [] },
          }),
      })
      .default({}),

    graphify: z
      .object({
        /** graphify output directory (gitignored, derived). */
        outDir: z.string().default("graphify-out"),
        /** How the code graph is kept fresh, using graphify's own tooling. */
        freshness: z
          .enum(["post-commit-hook", "update-on-run", "watch", "manual"])
          .default("update-on-run"),
      })
      .default({}),
  })
  .default({});

export type RivetConfig = z.infer<typeof RivetConfigSchema>;

/** The fully-resolved default config (every field populated). */
export function defaultConfig(): RivetConfig {
  return RivetConfigSchema.parse({});
}

/** Parse + validate a raw config object, applying defaults for anything omitted. */
export function parseConfig(raw: unknown): RivetConfig {
  return RivetConfigSchema.parse(raw ?? {});
}
