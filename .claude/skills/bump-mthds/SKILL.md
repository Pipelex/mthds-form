---
name: bump-mthds
description: >
  Move this package's `mthds` floor — the types-only peer that supplies the MTHDS
  protocol wire types through `mthds/protocol` — to the latest version published on
  npm, or to a version the user names. It edits both sites (`peerDependencies` and
  `devDependencies`), refreshes `package-lock.json`, runs the gate, and records the
  change under `## [Unreleased]`. Use whenever the user says "bump mthds", "bump the
  mthds peer", "bump the mthds version", "update mthds", "mthds to latest", "raise the
  mthds floor", "adopt the new protocol types", "the peer is capped at 0.x", or any
  variation of moving this repo's upstream MTHDS dependency — including when they only
  say "bump the dependency" while talking about the protocol surface. This is NOT the
  package's own release version: for "cut a release", "publish", or "bump the version"
  meaning `@pipelex/mthds-form` itself, use the `release` skill instead.
---

# Bump the `mthds` floor

`@pipelex/mthds-form` rests on exactly one upstream package: **`mthds`**, the MTHDS standard's TypeScript client. The kernel reads it only through the `mthds/protocol` subpath and only with `import type` — `src/core/contracts.ts` re-exports the standard's contract declarations instead of restating them, so bumping this floor is how the package adopts a newer protocol surface. Nothing named `mthds` survives into `dist/`; what moves is the shape the types describe.

## The floor lives at two sites, and they move together

| Site | What it claims |
| --- | --- |
| `peerDependencies.mthds` | what a consumer must resolve — the number that matters outside this repo |
| `devDependencies.mthds` | what this repo typechecks, tests and builds against |

Keep them the same string. A peer wider than the dev entry is a claim nobody verified: the package would be telling consumers a version is fine while never having compiled against it. That asymmetry is the failure this skill exists to prevent, and it has already been filed once as a bug — a peer left at `^0.23.0` excluded the `0.24.0` every other TypeScript consumer had moved to.

**Range style is a caret, matching what is already there.** `mthds` is pre-1.0, so `^0.24.0` resolves to `>=0.24.0 <0.25.0` — a single minor. That narrowness is deliberate: each pre-1.0 minor may move the protocol surface, so the floor names the minor this repo has actually typechecked against. Do not widen it to `>=X.Y.Z` to be accommodating; a range admitting an untested surface is the thing the caret is preventing.

**`package-lock.json` is part of the change, not tidying after it.** Its root entry mirrors both blocks, and `.github/workflows/release.yml` publishes with `npm ci --ignore-scripts`, which refuses a lockfile that disagrees with `package.json`. An uncommitted lockfile turns this bump into a failed publish later.

## Workflow

### 1. Establish where you are and where you are going

```bash
node -p "const p=require('./package.json'); JSON.stringify({peer:p.peerDependencies.mthds, dev:p.devDependencies.mthds})"
npm view mthds version
```

The target is the version the user named, or npm's `latest` when they said "latest" or named nothing. Two cases end the skill early: if the target already equals both sites, say so and stop — there is nothing to do. If the target is lower than the current floor, that is a downgrade; confirm the user means it before proceeding.

### 2. Look at what actually changed upstream

`npm view` reports a number, not a surface. Since the whole point of the floor is which protocol types the kernel compiles against, read the diff before you trust a green gate — it is also what lets you write a changelog entry that says something.

```bash
TMP=$(mktemp -d) && (cd "$TMP" \
  && npm pack mthds@<OLD> --silent >/dev/null && npm pack mthds@<NEW> --silent >/dev/null \
  && for t in *.tgz; do mkdir "${t%.tgz}" && tar xzf "$t" -C "${t%.tgz}"; done)
diff -ru "$TMP"/mthds-<OLD>/package/dist/protocol "$TMP"/mthds-<NEW>/package/dist/protocol
```

An empty diff means the bump is inert for this package and the changelog entry should say exactly that. A non-empty one tells you which names moved, and whether any of them is one `src/core/contracts.ts` re-exports.

### 3. Apply the edit to both sites, then re-resolve

```bash
npm pkg set peerDependencies.mthds="^<NEW>" devDependencies.mthds="^<NEW>"
npm install
```

`npm install` is what refreshes the lockfile root entry and installs the new types under `node_modules/`, so the gate in the next step reads the version you just declared rather than the one that happened to be on disk. Confirm it landed — `node -p "require('./node_modules/mthds/package.json').version"` — because a stale tree is how a bump passes locally and fails in CI.

### 4. Run the gate

```bash
make check && make test
```

`make check` typechecks the kernel against the new declarations. `make test` is the part that earns its place here: `src/core/__tests__/protocol-peer.test.ts` asserts type **identity** between every re-exported contract name and the standard's, not merely assignability — so a version that quietly narrows or reshapes a type fails there instead of surfacing as a rendering bug in a host. Read a failure as a real signal about the new surface, never as a test to update.

If nothing failed, `make all` is unnecessary: a types-only import is erased before a bundle exists, so the build and `make assert-bundle` cannot be affected by a version move on its own. Run the full `make all` only if you had to change source to adapt.

### 5. Adapt the kernel if the surface moved

A bump that breaks the gate is doing its job. Fix `src/core/contracts.ts` and whatever reads it, keeping the package's exported names stable — consumers import `InputPresence`, which aliases the standard's `PresenceMarker`, and that kind of alias is how a rename upstream stays a non-event here. If the new surface changes what goes over the wire, that is a breaking change for consumers and needs saying plainly in the changelog. Update `docs/contract-mirror.md` in the same change whenever the contract shape it documents has moved.

### 6. Record it under `## [Unreleased]`

The peer range is consumer-visible packaging, so it belongs in `CHANGELOG.md` under `## [Unreleased]` → `### Changed` — not under a new version heading, since a heading is a receipt for a published release and this skill publishes nothing. Write what the new surface gives the package, not just the digits:

```markdown
- **Packaging: the `mthds` peer moves to `^0.24.0`.** <what the new protocol surface brings, or that it is inert for this package.> Both sites move together — the peer a consumer resolves and the devDependency this repo typechecks against — so the range never claims a surface the package has not compiled against.
```

### 7. Report

Summarise `OLD → NEW` at both sites, whether the protocol diff was empty, and what the gate did. Then stop: do not commit, branch, or release — those are the user's call, and cutting a version is the `release` skill's job.

Two follow-ups worth naming if they apply:

- **Consumers pinning `@pipelex/mthds-form`** may need their own floors moved once this ships. That work belongs to those repos — file it rather than reaching into them (`ledger new --owner <repo> …`, or invoke the `/ledger` skill).
- **If a ledger item tracked this floor**, close it with the evidence this run produced: the two version strings and the gate result.
