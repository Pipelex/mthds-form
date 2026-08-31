# Plan — a Storybook of its own

## Why

The form stories currently living in `@pipelex/mthds-ui`'s `FORM` section are testing **this package**, not that one. `RunPanel` over there contributes panel chrome, graph theme tokens and a submit gate; every input control on screen — text, file dropzone, list add/remove, structured nesting — is ours. A regression in `number-field.tsx` is presently caught (if at all) by a story in a downstream consumer, which is the wrong place to notice it and the wrong place to fix it.

This repo already anticipates the move. `CLAUDE.md`, under Conventions: *"Stories still live in the consuming app and move here with Storybook."* This is that.

## What the stories are built from

**Decision (taken):** fixtures are **generated from `.mthds` files that contain only structures**. No hand-written `RunField[]`, no hand-written wire artifacts.

Three sourcing options were weighed — hand-authored `RunField[]` (lightest, but never exercises `buildRunFields`, which is half the kernel), hand-authored wire artifacts in TS (no Python, but the artifacts can drift from the standard silently), and generation from real bundles. Generation won on the grounds that it is the only one where a fixture *cannot* misrepresent the standard.

The mechanism, and the one wrinkle in it: `input_form` is keyed by `pipe_ref` and projected from a **pipe's declared input slots**. A structure on its own has no slots, so `build_input_form` has nothing to walk. The resolution is that the author never writes a pipe and the generator synthesizes one:

```
data/structures/<case>.mthds          # concepts + structures ONLY, authored
   -> generator synthesizes a carrier pipe per exercised slot
        [pipe.carrier_<slot>]  inputs = { <slot> = "<ConceptRef>" }
   -> ../pipelex/.venv/bin/python scripts/dump-validate-views.py
        calls build_pipe_io_contracts + build_input_form
   -> src/__stories__/_generated/<case>.ts   # typed InputForm + PipeIOContracts
   -> story: buildRunFields(form[ref], contract[ref]) -> RunField[] -> <FieldRenderer/>
```

Consequences to accept up front:

- The repo gains a **dev-time Python dependency**: a sibling `../pipelex` checkout with its venv, addressed through `PIPELEX_PYTHON`. Dev-only — it never enters `package.json` and never reaches a consumer. A contributor who only edits a control never runs it.
- The generated `.ts` files are **committed**, so `make storybook` works with no Python present. Only regeneration needs it.
- Both halves of the kernel are exercised by every story — the derivation (`buildRunFields`) and the rendering — which is the reason this path was chosen.
- `dump-validate-views.py` is **duplicated** from a consumer's copy, not shared. Both die together when pipelex's agent CLI can emit the two views itself. Cross-reference the sibling copy in both file headers so neither is retired alone.

**Carrier-pipe synthesis is the one piece of new machinery.** Two sub-questions to settle in Phase 2, both cheap to reverse:

1. **Where the slot spec comes from.** Either a small sidecar per case (`<case>.slots.toml`: slot name → concept ref → presence marker → multiplicity) or a comment convention inside the `.mthds`. The sidecar is recommended: presence markers and multiplicity (`!`, optional, `Concept[]`, `Concept[3]`) are properties of a **slot**, not of a structure, and they are precisely the axes the catalog folder must vary. Pretending they are inferable from a structure would silently cap the coverage. Note the type-level consequence recorded in `docs/contract-mirror.md`: `PipeInputContract` is a union discriminated on `multiplicity`, so a marker combined with a plural slot will not typecheck — correctly, the language forbids it — and the sidecar schema should refuse that pairing at authoring time rather than at generation time.
2. **Whether one bundle carries one slot or many.** Recommended: **one bundle per story file**, many slots inside it, one carrier pipe per slot. Keeps the generated module aligned with the story module, and keeps a broken bundle from taking down unrelated stories.

## Phases

### Phase 0 — Repo, baseline — **DONE**

Cloned at `ec2e7da` (v0.5.0 merge). `npm install && make check && make test` green: 20 test files, 478 tests, core suite in node and react suite in jsdom.

**What the plan got wrong before reading the repo, corrected here:**

- **There IS a Makefile**, and it is already close to `mthds-ui`'s vocabulary (`install build build-css lint format format-check typecheck test t test-watch test-coverage check c assert-bundle all pack clean`). Phase 1 extends it rather than creating it.
- **File naming is kebab-case**, one control per file. Story files follow: `text-field.stories.tsx`, not `TextField.stories.tsx`.
- **`docs/` is one topic per file, updated in the same change as the code.** A documented-contract change that does not touch `docs/` is incomplete here.
- **This repo is open source and must never name a closed-source repo** — in source, docs, changelogs, config or tests. Say "a host" or "a consumer". `@pipelex/mthds-ui` is published and already named in `docs/dependency-budget.md`, so it may be named; the app it is consumed from may not.
- **The dependency budget does not block Storybook.** `docs/dependency-budget.md` is explicit that `devDependencies` "are a different question and are not on the table: they ship in nothing". The Storybook stack joins the DOM test stack on that footing. Extend the sentence that names the DOM stack so the doc stays the answer rather than a snapshot.
- **`make assert-bundle` is a real gate** (`scripts/assert-bundle.mjs`) walking each built entry's chunk graph. Storybook must not perturb it; if a story helper is ever placed under `src/core/` or `src/react/`, it enters the shipped graph. **Story code lives in `src/__stories__/`, outside both entry trees**, and `tsup.config.ts`'s entry globs must not pick it up.

**Checkpoint.** Phase 1 opens a new area (build tooling).

### Phase 1 — Storybook toolchain and `make storybook`

- Add Storybook 10 + `@storybook/react-vite`, **pinned to the same versions `@pipelex/mthds-ui` uses** (`^10.3.3`, `storybook ^10.3.3`, vitest `^4.1.0`, `playwright ^1.58.2`) so the two Storybooks do not drift into different majors. Addons: `addon-vitest`, `addon-a11y`, `addon-docs`. Add `eslint-plugin-storybook` and wire it into `eslint.config.mjs`.
- Extend the Makefile: `storybook` (`st`), `build-storybook`, and later `fixtures`. Keep npm scripts as the implementation underneath; the Makefile stays a facade.
- **The styling lane differs from the consumer's Storybook, deliberately.** `mthds-ui` loads the *prebuilt* `theme.css` + `styles.css` because it runs no Tailwind of its own. This repo **does** run Tailwind (`tailwind.config.cjs`, `src/styles/tailwind-entry.css`), so its Storybook must consume the **source** entry through the Vite Tailwind pipeline. Otherwise a control styled with a utility absent from the last built `styles.css` renders unstyled in the very Storybook meant to catch that. Also note `docs/theming.md`: the prebuilt sheet carries Tailwind's preflight, so loading both here would apply a second reset.
- **Light/dark on every story.** The theming convention is the `.dark` class (`theme.css`; Tailwind `darkMode: 'class'`). Build one shared decorator — `ThemePair` — rendering the story **twice, side by side**: a light pane and a `.dark` pane, each on its own `--background`, each captioned. Side-by-side rather than a toolbar toggle, because the goal is seeing the possibilities at a glance and a toggle hides half the answer behind a click. Keep a toolbar `globalType` as well for anyone wanting one pane full-width.
- **A third vitest project.** `vitest.config.ts` currently declares `core` (node) and `react` (jsdom), each with its own `environment`, and its header explains why they are kept apart. Storybook's browser project is a third of the same kind — add it as a project rather than as a second config file; that file's header records what happened last time two vitest configs coexisted.
- **a11y baseline.** `mthds-ui` runs `addon-a11y` at `test: "todo"`. Set it to `"error"` here: this repo owns the controls, and a labelling regression is its bug to catch. `docs/architecture.md`-level rationale — the react suite already asserts accessible names, so the stories should not be allowed to regress what the unit tests pin.

**Deliverable:** `make storybook` opens a working Storybook with zero stories, `make check` and `make test` still green. Verify visually before proceeding.

**Checkpoint.**

### Phase 2 — The structures corpus and the generator

- `data/structures/` — the authored `.mthds` files (structures only) plus their slot sidecars.
- `scripts/generate-fixtures.mjs` — new, and far smaller than the consumer's: no graph specs, no live runs, no HTML renders. Reads each case, synthesizes carrier pipes, invokes the Python dump, writes `src/__stories__/_generated/<case>.ts` exporting a typed `InputForm` + `PipeIOContracts` pair.
- `scripts/dump-validate-views.py` — ported near-unchanged from the consumer's copy. Keep its docstring; add the sibling-copy note.
- Guard `PIPELEX_PYTHON` up front with an actionable message. A generator failing halfway leaves a mixed-version tree.
- `make fixtures`, and `make fixtures ONLY=<case>`.
- A test asserting every case in `data/structures/` has a matching generated module and vice versa, so a case added without regeneration fails CI rather than silently producing no story.

**Checkpoint.** From here it is story authoring; the machinery is done.

### Phase 3 — Folder 1: **Field Kinds** — one story per input type

The catalog: *"here is every input type we have, in isolation, with nothing else on screen"*. One story file per kind, `ThemePair` on every story.

`RunFieldKind` is a closed union and is therefore the exhaustive checklist — `text`, `prose`, `date`, `number`, `boolean`, `enum`, `document`, `image`, `object`, `list`, `unknown`. Where a kind carries a discriminating flag, the story shows each face:

| Story file | Shows |
|---|---|
| `text-field.stories.tsx` | single-line; placeholder; `minLength`/`maxLength`; `pattern`; an unabsorbed `format` (`uri`, `time`) |
| `prose-field.stories.tsx` | multi-line; short vs long content; length constraints |
| `date-field.stories.tsx` | `datetime: false` (bare `YYYY-MM-DD`) and `datetime: true` (RFC 3339) — different enough in stored value and control behaviour that both must be visible |
| `number-field.stories.tsx` | `integer: true` / `false`; `min`/`max`; the exclusive-bound cases the recent bound-rounding fixes landed for |
| `boolean-field.stories.tsx` | the inline toggle row — its label sits inline, unlike every other field, and that is worth seeing beside the others |
| `enum-field.stories.tsx` | few options; many options (overflow behaviour of the vendored radix select) |
| `file-field.stories.tsx` (document) | empty dropzone; `accept` hint; mid-upload; filled from a stored reference resolved through `env.resolveUrl` |
| `file-field.stories.tsx` (image) | the same states plus the preview render |
| `object-field.stories.tsx` | the minimal structured field — a flat object of two scalars. Deep nesting is Phase 5's job, not this folder's |
| `list-field.stories.tsx` | variable-length list of a scalar; fixed `[N]`; `itemCount` minimum with `maxItemCount` absent; both bounds; add/remove affordances at each bound. `itemCount` and `maxItemCount` are separate fields for a reason recorded in `descriptor.ts` — a list told "at least two" was once presented as exactly two — so both bounds get their own story |
| `unknown-field.stories.tsx` | the fallback control: what a consumer sees when the standard grows a kind this version does not know. Easy to forget; the one that will be on screen the day it matters |

**A second axis, factored out rather than multiplied in.** Rather than crossing every kind with every state, add one `field-states.stories.tsx` walking a representative kind through `required` / `optional` (collapsed and expanded) / authored `!` presence marker / `gating: true` vs `false` / `defaultValue` / `examples` / `hints` / validation `error` / `disabled` / mid-upload. Then each kind's own file carries only the states where it behaves **differently** from the representative. Multiplying the axes in would make the catalog unreadable, which is the one thing it exists not to be.

### Phase 4 — Folder 2: **Concepts** — one concept, many fields

Where folder 1 isolates, folder 2 shows a realistic single structure: one concept whose structure declares many properties of mixed kinds, including lists.

- A handful of authored structures, each a plausible domain object — an invoice, a person, a job posting, a support ticket — sized so the whole form is legible in one screenshot.
- Deliberately cover: mixed scalars in one object; an array property with `minItems`; an optional beside a required; a property carrying a default; a property whose concept `refines` a native concept. That last one matters — `refines` is a first-class descriptor field carrying the whole refinement chain, and nothing currently shows it.
- A **list of that concept** (`Concept[]`) as its own story. N repeats is a materially different layout problem from one instance, and it is where spacing and add/remove chrome break.
- One story per structure, plus an "all structures stacked" overview so visual consistency across them is checkable at a glance.

### Phase 5 — Folder 3: **Complex** — nesting and the hard cases

The stress folder: correctness under composition, and the layouts most likely to be ugly.

- Object in object in object — three levels at least. Indentation, border treatment and label hierarchy all degrade at depth.
- List of objects where each object itself contains a list.
- Object containing a file field — the upload plumbing threads through `FieldEnv` and must survive recursion. `docs/upload-seam.md` is the contract it must not violate.
- A fixed-count list of objects.
- Optional object whose children are required — the collapse/expand interaction with inner gating.
- Wide: a structure with many properties. Then deep and wide together.
- A kitchen sink — every kind in one form, the single canvas answering *"what does a maximal method's form look like?"*.

### Phase 6 — Extra viewpoints

Per-story canvases alone do not give an overview.

- **A Docs page (MDX) fronting the catalog**, listing every `RunFieldKind` with a live one-line example and prose on when the standard produces it. This becomes the reference a consumer reads instead of the type definitions.
- **A gallery story** rendering every kind as a compact grid in both themes — the one screenshot answering "do these look like one system?".
- **A concept-category story** exercising `conceptCategory()` and the pill dot it drives, across all nine categories (`text`, `date`, `document`, `image`, `number`, `boolean`, `choice`, `structured`, `list`).
- Wire `addon-vitest` play functions onto the interaction-bearing stories (list add/remove, optional expand/collapse, file drop) so the visual folders double as browser-level regression coverage.

### Phase 7 — Retire the migrated stories from the consumer

Only once the equivalents here exist and are green.

- **Stays in `mthds-ui`:** `GraphWithRunPanel.stories.tsx`, and whatever genuinely exercises that repo's own contributions — the submit gate and error summary, readiness, host-supplied translation, host-disabled fields, panel chrome and graph theme tokens.
- **Moves here:** everything really about a control — `File Input`, `Image And Structured`, `Structured Inputs`, `Plural Input`, `Required And Optional`, `Optional Survives Being Cleared`, `Cleared Optional Can Fold Away Again`, `Decimal Number Submits`, and the upload trio.
  Judgement call on the upload stories: the *lifecycle* is host-driven and belongs to the panel; the *control's appearance while uploading* belongs here. Split them rather than moving them wholesale.
- Shrink the consumer's contracts fixture corpus to what its surviving stories need. Do not delete its `make fixtures-contracts` — the panel-level stories still need real wire artifacts.
- Update the consumer's `CLAUDE.md` and `docs/run-form-panel.md` to say where field-level coverage now lives.

### Phase 8 — CI and documentation

- CI: `check` + `test` + `build-storybook` on every PR, and the storybook vitest project alongside the two existing ones.
- `docs/storybook.md` — the three folders and what each is for, the fixture pipeline, how to add a case, the `PIPELEX_PYTHON` prerequisite.
- `CLAUDE.md` — the never-hand-write-fixtures rule, carrier-pipe synthesis, the `ThemePair` requirement on every story, and the rule that story code stays outside both entry trees.
- `docs/dependency-budget.md` — extend the devDependencies sentence to name the Storybook stack beside the DOM test stack.
- Consider Chromatic. Three folders of theme-paired stories is exactly the shape where visual diffing pays for itself, and without it nothing enforces that the stories are actually looked at.

## Risks

- **The Python dependency is the weakest link.** Dev-only, outputs committed — but a contributor without a `../pipelex` checkout cannot add a case. The guard message must say precisely what to do. Revisit the moment the agent CLI can emit the views.
- **Carrier-pipe synthesis is new code with no upstream.** If it drifts from how a real method declares slots, the fixtures become subtly unrepresentative — the exact failure the never-hand-write rule exists to prevent, reintroduced one layer up. Mitigate by asserting a couple of synthesized bundles against equivalent real ones.
- **Story count grows fast** across three folders × every kind × two themes. Keep the state axis factored out (Phase 3) or the catalog stops being scannable.
- **Two Storybooks now exist** across two repos. Addon and version drift between them is a real maintenance cost; pin deliberately and bump together.
- **`make assert-bundle` must stay meaningful.** Story code outside the entry trees is the rule that keeps it so; a story helper that drifts into `src/react/` would enter the shipped chunk graph.
