# PR #1 review — deferred items

Two review-bot findings on `.github/workflows/release.yml` were verified as real but deferred, because each is a policy decision rather than a defect fix. The correctness issues from the same review (unrecoverable partial releases, changelog-heading mismatch, section-end off-by-one) were fixed in the PR directly. One of the two deferrals has since been decided and implemented; it is recorded at the bottom.

## 1. SHA-pin the release job's dependencies — still open

- **Reporter:** greptile-apps (P2, security) — [thread](https://github.com/Pipelex/mthds-form/pull/1#discussion) `PRRT_kwDOT_vMqM6bRDeu`
- **Where:** `.github/workflows/release.yml` — `actions/checkout@v4`, `actions/setup-node@v4`, `npm install -g npm@latest`, in a job holding `contents: write` and `id-token: write`.
- **Why deferred:** the finding is factually correct — mutable major-version tags and an unpinned npm mean the publishing toolchain can change underneath us. But `@v4` tags plus `npm@latest` is the deliberate convention shared across this package's sibling repos, and the npm upgrade exists specifically to get trusted-publishing support, which needs a recent npm. Pinning only this repo would fragment the convention without reducing much exposure; pinning everywhere is an org-level decision that also needs tooling (Dependabot/Renovate) to keep SHAs moving.
- **Open question:** adopt SHA-pinned actions (and a pinned npm version) across all repos' privileged workflows, with automated pin updates? Decide once, org-wide.

## 2. Hard-fail the release when the version has no changelog heading — decided, implemented

- **Reporter:** chatgpt-codex-connector (P2) — thread `PRRT_kwDOT_vMqM6bREbw`
- **Decision:** adopted, following the protection the sibling packages already run rather than inventing one. Two gates now exist:
  - **`.github/workflows/changelog-check.yml`** — a PR gate on `release/vX.Y.Z → main`, modelled on the sibling repos' workflow of the same name (`mthds-ui`, `mthds-js`, `pipelex-sdk-js`, and the hardened `pipelex-mcp` variant this one follows most closely: branch ref read through `env:`, anchored grep with the dots escaped). It fails a release PR whose `CHANGELOG.md` carries no `## [vX.Y.Z]` heading. It goes one step past the siblings by reading the version from `package.json` and requiring the branch name to agree — the siblings validate the branch name's version, which vouches for a number the release may not actually be shipping.
  - **A pre-publish assertion in `release.yml`** — the same check immediately after the already-published probe and before `npm ci`, so it fails fast and, decisively, before the irreversible `npm publish`. This is the `pipelex-mcp` precedent ("Verify the changelog has an entry for it"). It is needed on top of the PR gate because the PR gate only sees PRs from a `release/v*` branch, and `release.yml` publishes on *any* push to `main` that moves the version.
- **What deliberately stayed soft:** the changelog extraction in the `github-release` job keeps its warn-and-fallback. That job also runs on the recovery path, backfilling a release for a version npm already holds; failing it there would leave that version permanently without a GitHub release, which is the opposite of what the gate is for.
- **Not adopted:** the siblings' separate `version-check.yml` (asserting the version was bumped relative to `main`) is still absent here. Folding the branch-vs-`package.json` agreement into the changelog gate covers the release path; a bump check on ordinary `dev` PRs would be a separate decision, and this package deliberately allows a bump to land in an ordinary feature commit (see step 1 of the `/release` skill).
