# Human backlog — dev-spec-kit (your actions, stepwise)

Things only you can do — publishing, registration, reviews. Agent/contributor work is in
[backlog.md](backlog.md). Ordered so each step unblocks the next.

1. **Publish revitify first.** dev-spec-kit bundles it via a local link; publishing revitify is what
   unblocks a clean dependency here. See `revitify/human-backlog.md`.

2. **Swap dev-spec-kit's dependency** (after step 1): point `package.json` `revitify` at the published
   version, `pnpm install`, push a PR, confirm CI. *(Ask me — I can do this once revitify is on npm.)*

3. **Publish dev-spec-kit to npm** (name `dev-spec-kit` confirmed free):
   1. `npm login`
   2. `npm publish --access public`

4. **Brand (optional).** If going public under the `devspeckit` brand: register `devspeckit.ai` /
   `.dev` / `.io` and claim the GitHub `devspeckit` org/handle.

5. **Review + merge open Dependabot PRs.** Each runs CI; merge the green ones. Verify the GitHub Actions
   major bumps (`checkout` v7, `setup-node` v6, `pnpm/action-setup` v6) don't break the workflow.

6. **Merge release PRs.** When release-please opens a "chore: release vX.Y.Z" PR (after a `feat:`/`fix:`),
   merge it to cut the version + tag + GitHub Release. Then the proofs are stale → re-prove (step in
   [backlog.md](backlog.md)) — ping me to do it.

7. **(Optional) AI-review gate.** Add an `ANTHROPIC_API_KEY` secret + a Claude review workflow if you
   want AI review *required* on PRs. Currently CI-only, by your choice.
