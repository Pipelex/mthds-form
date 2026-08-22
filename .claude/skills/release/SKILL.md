---
name: release
description: >
  Automates the mthds-form release workflow: bumps the version in package.json, renames the CHANGELOG.md `[Unreleased]` section into a version heading, runs the full gate (checks, tests, build, and the two bundle assertions), creates a `release/vX.Y.Z` branch, commits, pushes, and opens a PR to `main` — merging that PR is what publishes `@pipelex/mthds-form` to npm. Use whenever the user says "release", "cut a release", "bump the version", "prepare a release", "make a release", "ship it", "publish to npm", "create a release branch", or any variation of shipping a new version of this package, even if they do not name the package. The user can pass changelog content inline (e.g. "/release added a presentation seam on the controls"), which becomes the entry for this version.
---

# mthds-form Release Workflow

This skill handles the full release cycle for the `@pipelex/mthds-form` npm package.

**Merging the release PR into `main` is what publishes.** `.github/workflows/release.yml` runs on every push to `main`: it re-runs the gate, rebuilds, re-asserts the two bundle invariants, publishes to npm with provenance, creates the `vX.Y.Z` git tag and opens the GitHub release. That job is idempotent — a push to `main` that does not move the version is a deliberate no-op — so nothing here needs to publish anything. This skill's job ends when the PR is open.

## Files touched

- **`package.json`** — the `version` field
- **`CHANGELOG.md`** — the `## [Unreleased]` heading becomes `## [vX.Y.Z] - YYYY-MM-DD`
- **`package-lock.json`** — regenerated via `npm install`

## Workflow

### 1. Pre-flight checks

Read the current version from `package.json`, read `CHANGELOG.md`, and run `npm view @pipelex/mthds-form version` to learn what is actually on npm. Then run `git status` and `git log origin/main..HEAD` to assess the working tree.

**Check first whether a version was already bumped but never published.** Because a bump can land on `dev` in an ordinary feature commit, `package.json` may already carry a version ahead of npm's latest, with the matching `## [vX.Y.Z]` heading already written. When that is the case the release *is* that version: skip the bump entirely (steps 2, 5 and 6), name the branch after the version already in `package.json`, and go straight to the gate and the PR. Bumping again here would silently skip a version that has a changelog entry and no artifact — the one mistake in this flow that cannot be undone by editing a file, since the skipped number has already been announced to readers.

Otherwise:

- If there are **uncommitted changes** (staged or unstaged), warn the user and ask whether to commit them as part of the release, stash them, or abort.
- If there are **unpushed commits** on the current branch, list them so the user is aware — these will be included in the release branch.

### 2. Determine the bump type

Ask the user which kind of bump they want — **patch**, **minor** or **major** — unless they already specified it. Show the current version and what the new version would be for each option so the choice is concrete. Anything visible on the wire (what the derivation emits, what a control deflates to) is a minor at minimum while the package is pre-1.0, never a patch.

### 3. Run the gate

Run `make all`. That is check (lint, format, typecheck), then tests, then the build — note that `make check` here does **not** include tests, which is why the target to run is `make all` rather than the pair.

Then re-run the two assertions the publish job runs, against the `dist/` that `make all` just produced:

```bash
if grep -rq "from 'react" dist/core/ dist/chunk-*.js; then echo "FAIL: React reached the headless core bundle"; fi
head -n 1 dist/react/index.js | grep -q 'use client' && echo "ok: 'use client' survived the bundle"
```

These two are worth a local minute because they cannot fail in a way source review would catch: React reaches the headless `.` entry through a shared chunk rather than through an import, and esbuild drops the `'use client'` prologue that `tsup.config.ts` then re-asserts. Both are re-checked on `main` by the publish job, but discovering them there means a broken release commit is already merged.

If anything fails, stop and report the errors. Help the user fix them rather than skipping the gate.

### 4. Ensure we're on the right branch

The release branch is `release/vX.Y.Z`, where X.Y.Z is the **new** version, and it is the one branch in this workspace that targets `main` instead of `dev`. All release edits happen on it. The name is not cosmetic: `.github/workflows/changelog-check.yml` parses it on the PR and fails the release if it is malformed or disagrees with `package.json`.

- If already on `release/vX.Y.Z` matching the new version, stay on it.
- If on `dev` (the usual case), `main`, or any other branch, create and switch to `release/vX.Y.Z` from the current HEAD.
- If on a `release/` branch for a **different** version, warn the user and ask how to proceed.

### 5. Finalize the changelog

A `## [vX.Y.Z]` heading in this changelog is a receipt for a published npm version, so it is written exactly once, at the moment the release is cut.

Two CI gates hold that discipline rather than trusting it, so a heading forgotten here stops the release rather than shipping without one: the release PR fails if `CHANGELOG.md` carries no `## [vX.Y.Z]` heading for the version in `package.json`, and the publish job re-checks before `npm publish` and refuses to ship a version that has none. The date suffix is optional to both; write it anyway.

1. Rename the existing `## [Unreleased]` heading to `## [vX.Y.Z] - YYYY-MM-DD`, keeping everything under it. Do not leave an empty `[Unreleased]` behind — the next piece of work re-creates it.
2. If there is no `[Unreleased]` section, insert the new heading **immediately above the first `## [v` heading**. Today that is directly under the `# Changelog` title, since the file carries no introductory prose; anchoring on the first version heading rather than on the title is what keeps this correct if a preamble is ever added back.
3. If the user passed changelog content when invoking the skill, **merge** it with whatever is under `[Unreleased]` — never discard either source. Sort the combined content under the usual headings (`### Added`, `### Changed`, `### Fixed`), inferring them from the content.
4. Changes to files under `wip/` are working notes, not release-facing — leave them out.
5. If the release has no content at all, neither from `[Unreleased]` nor from the invocation, ask the user what to include before proceeding.
6. Match the voice of the entries already in the file: each bullet leads with what changed in bold, then says why it changed. Never write a count ("all 12 controls") — write "every control".

The result should look like:

```markdown
# Changelog

<the preamble paragraphs>

## [vX.Y.Z] - YYYY-MM-DD

### Changed

- ...

## [vPREVIOUS] - PREVIOUS-DATE

...
```

### 6. Bump the version in package.json

Edit the `version` field to the new version string. Only that field.

### 7. Regenerate the lockfile

Run `npm install` so `package-lock.json` records the new version. If it fails, stop and report the error.

### 8. Commit and push

Stage the release changes — at minimum `package.json`, `CHANGELOG.md` and `package-lock.json`, plus anything the user chose to include back in step 1. Commit with:

```
bump version to X.Y.Z
```

**On the already-bumped path from step 1 there is no bump to describe, so that message would be false.** The commit then carries only whatever the user chose to include, and its message should say what that actually is — a plain `chore:` or `docs:` line naming the work, with a body noting that the version and the changelog entry landed earlier and giving the commit they landed in. If nothing was included, there is nothing to commit at all: the branch is its parent, and the release is the PR alone.

Push with `-u` to set up tracking.

### 9. Open a PR

Open a pull request against **`main`** (not `dev` — release branches are the exception to the workspace rule):

- **Title:** `Release vX.Y.Z`
- **Body:**

```markdown
## Release vX.Y.Z

Bumps version from `A.B.C` to `X.Y.Z`.

### Changelog

<the changelog entries for this version>
```

Report the PR URL back to the user.

### 10. Tell the user what merging does

Close by stating plainly that merging the PR publishes to npm, tags `vX.Y.Z` and creates the GitHub release, and that **`main` should then be merged back into `dev`** — the bump and the changelog entry live only on `main` until it is, and the next release cut from `dev` would otherwise start from a stale version and re-open the "already bumped" case from step 1 in reverse.

## Important details

- Versions are semver, `MAJOR.MINOR.PATCH`, and the package is pre-1.0: breaking changes are noted in the changelog as "breaking", with no deprecation period.
- Always confirm the bump type before editing anything.
- A failing gate blocks the release. Fix the cause; do not work around the check.
- Use today's real date, in `YYYY-MM-DD`, for the changelog heading.
