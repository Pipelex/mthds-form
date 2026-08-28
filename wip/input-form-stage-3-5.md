# Input-form Stage 3.5 — the contract types move to the standard

The repo-local tracker for this package's item in the workspace input-form program (`wip/input-form/plan.md` at the workspace root, item 3.5, ledger `L-260826-1502c1`). The program's own plan is the authority on sequencing and on the decisions; this file records what the change did *here*, and what the next agent in this repo needs.

## What this item was for

Stage 4 of that program — the derivation swap — is the goal. Its first line is a type annotation naming the wire descriptor, and the kernel could not write it, because until MTHDS v0.9.0 no published package declared the input-form descriptor or `pipe_io_contracts` in TypeScript. The kernel's own `contracts.ts` said as much, calling itself "the canonical TS home for this shape until the protocol specs a generated one".

The standard specified both artifacts and its TypeScript client published them, so this item retires that placeholder: the kernel imports the declarations instead of restating them, and takes the standard's client as a types-only peer so the descriptor types are within reach when the swap begins.

## Decision applied

**D-4 of the program plan:** `@pipelex/mthds-form` takes `mthds` as a peer dependency, types only — `import type` from `mthds/protocol`, erased at build, with `assert-bundle` banning it from both entries' chunk graphs. Every host that reaches this package through a Pipelex SDK already has `mthds` installed, so the peer costs those hosts nothing. If it ever proves costly for a host that has neither, the recorded alternative is splitting `mthds/protocol` into a types-only package of its own; that alternative is written into [`docs/dependency-budget.md`](../docs/dependency-budget.md) so it survives without this file.

**D-7:** the item ships no release. The warrant is a `## [Unreleased]` changelog entry; the version is cut with the rest of Stage 3 at the program's release cascade.

## What changed

- `src/core/contracts.ts` keeps the predicates (`isOptionalInput`, `isPluralInput`, `isFixedCountInput`, `inputMustBeFilled`) and the `pipe_ref` lookup, and re-exports the shapes from `mthds/protocol`. The declarations it replaced are deleted, not left beside the re-exports. `InputPresence` is kept as an alias of the standard's `PresenceMarker` so no consumer renames an import.
- `mthds` is a **required** peer (and a devDependency, so the repo typechecks and builds against what a consumer resolves). Required rather than optional because a consumer of the headless entry alone still resolves the re-exported types through it.
- Lint restricts `mthds` to `import type` across `src/`. That allowance lives on the typescript-eslint extension rather than the base rule, so every lint block now uses the extension and the base rule is off everywhere.
- `scripts/assert-bundle.mjs` bans `mthds` from both entries. Its ban list was restructured so each ban carries its own reason rather than one reason per entry, since the entries' bans are now about different things.
- `src/core/__tests__/protocol-peer.test.ts` is new: type identity for every re-exported name, and the descriptor import the swap will open with.
- Docs: `docs/contract-mirror.md` rewritten, `docs/dependency-budget.md` gains the peer line with its reason and its fallback, `docs/architecture.md`, `README.md` and `CLAUDE.md` follow.

## What the standard's types made visible

Adopting them was not purely mechanical, and this is the part worth carrying forward.

**An input contract is a union discriminated on `multiplicity`**, not the flat interface this package mirrored. Two rules that were prose here are now the type: `item_count` is non-`null` exactly on the `fixed` arm, and a presence marker may not be combined with a multiplicity suffix. The second one immediately caught two hand-built fixtures describing `Concept[]?` and `Concept[N]?` — shapes the language forbids outright ("markers MUST NOT be combined with multiplicity"), which no reviewer here had ever noticed.

The optional-plural fixture is retired; the two tests that exercise the combination now build it inline with a cast that says why. They are kept rather than deleted, and deliberately: this package does not parse-check the contract an API hands it, so a producer violating the standard's closed shape still reaches the predicates, and the invariant that matters is that both halves of the gate keep agreeing about it. That is a robustness claim, not a claim that the shape is legal.

## For the agent who takes the swap (Stage 4.1)

- The import works today, and a test proves it: `import type { PipeInputFormDescriptor } from 'mthds/protocol'`.
- `PipeInputFormDescriptor.fields` holds `InputFormTopLevelField`, which requires `presence` and `gating`. The shared `InputFormField` node does not require them, because it is also the nested named-field shape. Taking the looser type at the swap would silently lose the two facts the kernel currently re-derives.
- The descriptor's `item_count` is **absent** when it does not apply — the deliberate opposite of the contract's always-on-the-wire `null`. Each artifact states its own rule; do not generalise one onto the other.
- Nothing about the derivation changed here. `derive.ts` and `native-concepts.ts` are exactly as they were, including the recorded drift `docs/derivation-swap.md` describes, which is the swap's business and not this item's.
- `FIELD_KINDS` is the one runtime value `mthds/protocol` exports, and importing it is the one way to breach the types-only peer by accident. If the swap wants an exhaustiveness guard over `kind`, ask the question at the type level or restate the vocabulary locally.

## What the peer cost, measured

The program's Checkpoint 2 records this, because it is the evidence D-4's fallback would be judged on. Measured by installing into empty projects:

- A host that **already has `mthds`** (every host arriving through a Pipelex SDK) pays **nothing**: adding this package pulled exactly the same package set as the version without the peer.
- A host with **neither** pays about **16 MB across 57 packages** on disk — `mthds` is the standard's CLI, so its closure comes along (`zod`, `axios`, the analytics client), none of it reachable from the types. That is the number the recorded fallback (splitting `mthds/protocol` into a types-only package) would be weighed against.
- Either way the host **ships none of it**: no `.js` file in `dist/` contains the string `mthds`, only the `.d.ts` files do.

One failure mode is worth knowing and is not obvious. Under `skipLibCheck: true` — the near-universal host setting — an absent peer does not error: the re-exported names silently become `any`, and a host assigning nonsense to an `InputPresence` compiles clean. Only `skipLibCheck: false` reports it, as `TS2307` against files inside `node_modules`. Declaring the peer **required**, so npm installs it automatically, is what keeps that from arising; marking it optional would trade a loud install-time fact for a silent compile-time one.

## Evidence the guards work

Both enforcement layers were perturbed rather than trusted: a value import of `FIELD_KINDS` added to `src/core/contracts.ts` fails lint with the peer's message, and — built through anyway — makes `assert-bundle` exit non-zero with `core/index.js reaches mthds/protocol`. The same import placed in `src/react/index.ts` fails the `./react` entry the same way. Both perturbations were reverted and the suite re-verified green.
