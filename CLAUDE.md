# mthds-form — repo guide

`@pipelex/mthds-form`: the MTHDS input form as a library. Two entry points — `.` is the headless kernel, `./react` is the control set. Read [README.md](README.md) for what it is, then [docs/architecture.md](docs/architecture.md) before changing anything structural.

## The three rules that are not negotiable

**1. The descriptor is the currency, and `buildRunFields` is the only thing that reads JSON Schema.** Every heuristic — the native-concept sets, the url-bearing-object test, the depth rule — is private to `src/core/derive.ts` and `src/core/native-concepts.ts`, and neither is re-exported. If a change makes a heuristic visible to a consumer (exporting a concept set, adding a schema passthrough to `RunField`, letting a control sniff a shape), it destroys the seam the whole package is built around. [docs/derivation-swap.md](docs/derivation-swap.md) explains what that seam is for.

**2. The dependency budget is a hard list, not a preference.** [docs/dependency-budget.md](docs/dependency-budget.md) has it. Lint enforces it across `src/`, bans React from `src/core/`, and bans *value* imports of the `../core` barrel from `src/react/` (type imports are erased, so they stay allowed). `make assert-bundle` then walks each built entry's chunk graph — React must not reach `.`, ajv must not reach `./react` — which catches the violations that arrive through a shared chunk rather than a source import, and asserts that `dist/core/index.js` stays a pure re-export barrel, which is what lets a consumer tree-shake ajv out of the core entry. Adding a dependency means updating that table in the same change.

**3. The public API is the two index files.** `src/core/index.ts` and `src/react/index.ts`. Deep paths are not exported and not stable — that is what lets the derivation, the taxonomy, and the vendored primitives change without a breaking release.

## Traps

- **esbuild drops directive prologues.** Every control file carries `'use client'` in source and none of it survives bundling, so `tsup.config.ts` re-asserts the directive on the React entry in `onSuccess` and CI asserts it is there. Do not remove either. The core entry must never get one — it has to stay importable from a server component.
- **Do not name a host framework's lint rule in source.** An `// eslint-disable-next-line @next/next/...` comment that travelled in from a consuming app is itself a lint error here, because the rule does not exist in this repo. If a host's rule objects to kernel code, the host scopes that rule off the package.
- **Behaviour changes that are visible on the wire are not patches.** The taxonomy carries recorded drift (a `native.Date` input renders as prose and deflates as `{concept, content: {text}}`; `native.HTML` likewise). Fixing those changes what goes over the wire and belongs with the derivation swap. The characterization suites will fail loudly if one is changed by accident — read the diff rather than updating the snapshot.
- **The prebuilt `styles.css` carries Tailwind's preflight.** It is for hosts with no Tailwind build. A Tailwind host that loads it gets a second reset. See [docs/theming.md](docs/theming.md).

## Conventions

- **Package manager: npm.** Matching `mthds-ui`, the sibling package this repo's toolchain was copied from.
- **Gates:** `make check` (lint + format + typecheck) and `make test`. `make all` adds the build and `make assert-bundle`, which reads `dist/` and so only means anything after one. Run both before calling a change done.
- **Files are kebab-case**; one control per file.
- **Tests** are two suites, and `vitest.config.ts` keeps them apart on purpose. The core's unit suites (`src/core/__tests__/`) run in **node**, so a stray `document` reference in headless code fails there instead of passing quietly under a global jsdom. The control suites (`src/react/__tests__/`) run in **jsdom** with `@testing-library/react`, because what gets filed against a control is a DOM fact — an input with no accessible name, a button still live during an upload — and nothing short of rendering asserts it. The environment comes from the project's `include`, so a control test needs no `// @vitest-environment` pragma to get jsdom. The DOM stack is devDependencies and ships in nothing. Stories still live in the consuming app and move here with Storybook.
- **Docs live in `docs/`, one topic per file, updated in the same change as the code.** A change to a documented contract that does not touch `docs/` is incomplete.
- **This repo is open source — never name a closed-source repo in it,** in source comments, docs, changelogs, config or tests. Say "a host" or "a consumer" instead; a reader outside the company cannot follow a name they have no access to, and it leaks internal structure into a published package.
- **Versioning:** a `## [vX.Y.Z]` changelog heading is a receipt for a published npm release, never a commit counter. Work accumulates under `## [Unreleased]`; cut and rename it when you actually publish, keeping `package.json` in agreement. The `/release` skill (`.claude/skills/release/`) performs that cut — bump, changelog rename, gate, release branch, PR to `main` — and merging that PR is what publishes. CI enforces the pairing rather than trusting it: the release PR fails without a `## [vX.Y.Z]` heading matching `package.json`, and the publish job refuses to publish a version that has none.
