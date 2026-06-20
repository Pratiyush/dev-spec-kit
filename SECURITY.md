# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue or PR.

- Email **pratiyush1@gmail.com** with details and, if possible, a minimal reproduction.
- Alternatively, use GitHub's [private vulnerability reporting](https://github.com/Pratiyush/dev-spec-kit/security/advisories/new).

You'll get an acknowledgement as soon as possible. Please give a reasonable window to investigate and
ship a fix before any public disclosure.

## Scope

dev-spec-kit runs locally and shells out to your project's test runners and to `git`/`gh`. Reports of
particular interest:

- command injection via config (`verify.runners` templates), spec `@check` refs, or intake files;
- the PreToolUse guard hooks being bypassable in a way that lets a non-green change reach a PR;
- the anti-tamper lock / `unlock` governance being circumventable without a journaled event.

## Supported versions

dev-spec-kit is pre-1.0; fixes land on `main`. Until a tagged release exists, build from `main` for
the latest security fixes.
