# PR #1 review — deferred items

Two review-bot findings on `.github/workflows/release.yml` were verified as real but deferred, because each is a policy decision rather than a defect fix. The correctness issues from the same review (unrecoverable partial releases, changelog-heading mismatch, section-end off-by-one) were fixed in the PR directly.

## 1. SHA-pin the release job's dependencies

- **Reporter:** greptile-apps (P2, security) — [thread](https://github.com/Pipelex/mthds-form/pull/1#discussion) `PRRT_kwDOT_vMqM6bRDeu`
- **Where:** `.github/workflows/release.yml` — `actions/checkout@v4`, `actions/setup-node@v4`, `npm install -g npm@latest`, in a job holding `contents: write` and `id-token: write`.
- **Why deferred:** the finding is factually correct — mutable major-version tags and an unpinned npm mean the publishing toolchain can change underneath us. But `@v4` tags plus `npm@latest` is the deliberate convention shared across this package's sibling repos, and the npm upgrade exists specifically to get trusted-publishing support, which needs a recent npm. Pinning only this repo would fragment the convention without reducing much exposure; pinning everywhere is an org-level decision that also needs tooling (Dependabot/Renovate) to keep SHAs moving.
- **Open question:** adopt SHA-pinned actions (and a pinned npm version) across all repos' privileged workflows, with automated pin updates? Decide once, org-wide.

## 2. Hard-fail the release when the version has no changelog heading

- **Reporter:** chatgpt-codex-connector (P2) — thread `PRRT_kwDOT_vMqM6bREbw`
- **Where:** `.github/workflows/release.yml`, changelog extraction in the `github-release` job.
- **Why deferred:** today a missing `## [vX.Y.Z]` heading is warn-and-fallback (generic release notes), and that check runs only after the irreversible `npm publish`. Codex proposes validating before publish and failing the release when the heading is absent. That would enforce the documented discipline ("a version heading is a receipt for a published artifact") but turns a soft convention into a hard release gate — a workflow-behaviour decision the maintainer should make, and one that would ideally land in the sibling repos' identical workflows at the same time. The concrete instance that prompted the comment (0.1.0's notes sitting under `## [Unreleased]` while 0.1.0 was already on npm) was fixed in the PR by renaming the heading.
- **Open question:** should the publish job assert `grep -q "^## \[v$VERSION\]" CHANGELOG.md` before `npm publish` and fail otherwise?
