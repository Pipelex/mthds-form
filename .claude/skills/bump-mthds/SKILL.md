---
name: bump-mthds
description: >
  Move this package's `mthds` floor — the types-only dependency that supplies the
  MTHDS protocol wire types through `mthds/protocol` — to the latest version
  published on npm, or to a version the user names. It edits the one site that
  declares it (`dependencies`), refreshes `package-lock.json`, runs the gate, and
  records the change under `## [Unreleased]`. Use whenever the user says "bump
  mthds", "bump the mthds peer", "bump the mthds version", "update mthds", "mthds to
  latest", "raise the mthds floor", "adopt the new protocol types", "the mthds range
  is capped at 0.x", or any variation of moving this repo's upstream MTHDS dependency
  — including when they only say "bump the dependency" while talking about the
  protocol surface. This is NOT the package's own release version: for "cut a
  release", "publish", or "bump the version" meaning `@pipelex/mthds-form` itself,
  use the `release` skill instead.
---

# Bump the `mthds` floor

`@pipelex/mthds-form` rests on exactly one upstream package: **`mthds`**, the MTHDS standard's TypeScript client. The kernel reads it only through the `mthds/protocol` subpath and only with `import type` — `src/core/contracts.ts` re-exports the standard's contract declarations instead of restating them, so bumping this floor is how the package adopts a newer protocol surface. Nothing named `mthds` survives into `dist/`; what moves is the shape the types describe.

## The floor lives at one site

`dependencies.mthds` in `package.json`, and nowhere else. That single entry is both what this repo typechecks, tests and builds against **and** what a consumer resolves, so the two can never disagree — which is the whole reason it is one entry rather than two.

It was two, briefly: a `peerDependencies` range plus a `devDependencies` range, kept in step by hand. That arrangement is gone, and if a future change proposes bringing it back, [docs/dependency-budget.md](../../../docs/dependency-budget.md) has the reasoning — a peer is a promise the host must keep, pnpm does not keep it, and an absent `mthds` degrades every re-exported protocol type to its widest arm without failing anything. The old shape also had its own failure mode this skill was written to prevent: a peer range wider than the dev range is a claim nobody verified, and it was filed once as a bug when a peer left at `^0.23.0` excluded the `0.24.0` every other TypeScript consumer had moved to.

**Range style is a caret, matching what is already there.** `mthds` is pre-1.0, so `^0.24.0` resolves to `>=0.24.0 <0.25.0` — a single minor. That narrowness is deliberate: each pre-1.0 minor may move the protocol surface, so the floor names the minor this repo has actually typechecked against. Do not widen it to `>=X.Y.Z` to be accommodating; a range admitting an untested surface is the thing the caret is preventing.

**`package-lock.json` is part of the change, not tidying after it.** Its root entry mirrors that declaration, and `.github/workflows/release.yml` publishes with `npm ci --ignore-scripts`, which refuses a lockfile that disagrees with `package.json`. An uncommitted lockfile turns this bump into a failed publish later.

## Workflow

### 1. Establish where you are and where you are going

```bash
node -p "require('./package.json').dependencies?.mthds ?? 'NOT DECLARED IN dependencies'"
node -p "require('./node_modules/mthds/package.json').version"
npm view mthds version
```

**Three separate commands, because the first must always answer.** The declared floor is a fact about the manifest, so reading it must not depend on a populated `node_modules` — a fresh worktree has none, and that is exactly where this skill gets invoked. Nor may the range be read through `JSON.stringify`, which drops a key whose value is `undefined` and would report an absent declaration as silence. The second command says what is actually installed and is allowed to fail: `MODULE_NOT_FOUND` there means nothing has been installed yet, which is information rather than an error.

The target is the version the user named, or npm's `latest` when they said "latest" or named nothing. Two cases end the skill early: if the target already equals the declared floor, say so and stop — there is nothing to do. If the target is lower than the current floor, that is a downgrade; confirm the user means it before proceeding.

If the first command prints `NOT DECLARED IN dependencies`, do not invent a site. Something has moved the declaration, and the rest of this skill is describing a manifest that no longer exists — say so and stop.

### 2. Look at what actually changed upstream

`npm view` reports a number, not a surface. Since the whole point of the floor is which protocol types the kernel compiles against, read the diff before you trust a green gate — it is also what lets you write a changelog entry that says something.

```bash
TMP=$(mktemp -d) && (cd "$TMP" \
  && npm pack mthds@<OLD> --silent >/dev/null && npm pack mthds@<NEW> --silent >/dev/null \
  && for t in *.tgz; do mkdir "${t%.tgz}" && tar xzf "$t" -C "${t%.tgz}"; done)
diff -ru "$TMP"/mthds-<OLD>/package/dist/protocol "$TMP"/mthds-<NEW>/package/dist/protocol
```

An empty diff means the bump is inert for this package and the changelog entry should say exactly that. A non-empty one tells you which names moved, and whether any of them is one `src/core/contracts.ts` re-exports.

### 3. Apply the edit, then re-resolve

```bash
npm pkg set dependencies.mthds="^<NEW>"
npm install
```

`npm install` is what refreshes the lockfile root entry and installs the new types under `node_modules/`, so the gate in the next step reads the version you just declared rather than the one that happened to be on disk. Confirm it landed — `node -p "require('./node_modules/mthds/package.json').version"` — because a stale tree is how a bump passes locally and fails in CI.

### 4. Run the gate

```bash
make check && make test
```

`make check` typechecks the kernel against the new declarations. `make test` is the part that earns its place here: `src/core/__tests__/protocol-types.test.ts` asserts type **identity** between every re-exported contract name and the standard's, not merely assignability — so a version that quietly narrows or reshapes a type fails there instead of surfacing as a rendering bug in a host. Read a failure as a real signal about the new surface, never as a test to update.

If nothing failed, `make all` is unnecessary: a types-only import is erased before a bundle exists, so the build and `make assert-bundle` cannot be affected by a version move on its own. Run the full `make all` only if you had to change source to adapt.

### 5. Adapt the kernel if the surface moved

A bump that breaks the gate is doing its job. Fix `src/core/contracts.ts` and whatever reads it, keeping the package's exported names stable — consumers import `InputPresence`, which aliases the standard's `PresenceMarker`, and that kind of alias is how a rename upstream stays a non-event here. If the new surface changes what goes over the wire, that is a breaking change for consumers and needs saying plainly in the changelog. Update `docs/contract-mirror.md` in the same change whenever the contract shape it documents has moved.

### 6. Record it under `## [Unreleased]`

The `mthds` range is consumer-visible packaging, so it belongs in `CHANGELOG.md` under `## [Unreleased]` → `### Changed` — not under a new version heading, since a heading is a receipt for a published release and this skill publishes nothing. Write what the new surface gives the package, not just the digits:

```markdown
- **Packaging: the `mthds` floor moves to `^0.24.0`.** <what the new protocol surface brings, or that it is inert for this package.> The floor is a single `dependencies` entry, so the version a consumer resolves is by construction the one this repo typechecked against.
```

### 7. Report

Summarise `OLD → NEW`, whether the protocol diff was empty, and what the gate did. Then stop: do not commit, branch, or release — those are the user's call, and cutting a version is the `release` skill's job.

Two follow-ups worth naming if they apply:

- **Consumers pinning `@pipelex/mthds-form`** may need their own floors moved once this ships. That work belongs to those repos — file it rather than reaching into them (`ledger new --owner <repo> …`, or invoke the `/ledger` skill).
- **If a ledger item tracked this floor**, close it with the evidence this run produced: the two version strings and the gate result.
