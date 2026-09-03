---
status: active
item: L-260903-35eb46
---

# Generative UI over json-render — plan for the first step

**Written 2026-09-03, ratified by Louis the same day.** Schedules [`design.md`](design.md); read that first. This is a conviction step with an exit: it ends at Checkpoint 3, where Louis decides whether json-render goes further. Nothing ships from the generative layer in this step and no release is cut. The kickoff gesture is on the item: `cd _mthds-form--generative-ui && ledger claim L-260903-35eb46 --renew`.

## Decisions

Proposed by the rewrite and ratified at kickoff on 2026-09-03. Two were amended in the ratification (D-1 and D-6) and one was added (D-7); the design's "Ratification" section carries the reasoning.

- **D-1 (amended)** Every hero renders the same fixture from **three sources of a spec**, beside the kernel's own rendering of it: `Projected`, a deterministic projection of the descriptor and the floor; `Authored`, written by Claude Code from the very brief and catalog prompt the model receives, and the ceiling of what the catalog can express by hand; `Generated`, produced by the Pipelex designer method and captured by a fixture pass. Every source is validated the same way and carries its provenance. The comparison between the three is the evidence the checkpoint reads.
- **D-2** The generator is a Pipelex method (`PipeLLM`, `Text` output carrying JSONL) that takes the catalog prompt and the brief as inputs. It pins `claude-5-sonnet`; the pass takes a `MODEL=` override for comparisons, and the fixture's provenance records which model produced it. The agent path is the `Authored` source, driven by hand in this step; a skill wrapping the same two artifacts is a follow-up.
- **D-3** The Tailwind v4 migration happens on the branch as one commit and is not released in this step. The host webapp's own migration item is filed at kickoff and assigned to Thomas, and the release of this package's v4 line is sequenced behind it.
- **D-4** The json-render packages and zod are devDependencies for the whole step. Where the layer ships from is decided after the checkpoint.
- **D-5** The escape hatch exists on both sides (`MthdsField`, `MthdsResult`) and the result state is loaded by stated kind through the kernel's readers.
- **D-6 (amended)** Three heroes, each a group of four adjacent stories (`Kernel`, `Projected`, `Authored`, `Generated`), plus a streaming replay. The input hero moves to a new carrier pipe, `structured.invoice_with_source`, so one page carries the file slot, the date and the list that criterion 3 names. `Tabs` is left out of the catalog. The `className` prop is omitted from every catalog definition.
- **D-7** The step runs to Checkpoint 3 without a pause: one commit per phase on the branch, the plan updated at every checkpoint, and an early stop only if Checkpoint 2 fails badly.

## Facts verified at kickoff

Checked on 2026-09-03 so the phases below rest on them rather than on the brief's memory.

- **Versions on npm:** `@json-render/{core,react,shadcn}` 0.20.0, `zod` 4.5.4, `tailwindcss` 4.3.3 with `@tailwindcss/cli` and `@tailwindcss/vite` at the same version, `tailwind-merge` 3.6.0, `tw-animate-css` 1.4.0. `@json-render/shadcn` peers on `tailwindcss ^4`, `zod ^4`, React 19, and depends on the umbrella `radix-ui`, `embla-carousel-react`, `vaul`, `lucide-react` and `tailwind-merge ^3`.
- **Consumers:** the host webapp is on Tailwind 3.4.17 and scans `node_modules/@pipelex/mthds-form/dist/**/*.js` from its own config, with `tailwind-merge` 2 and `tailwindcss-animate`; the two starters and the graph playground are on 3.4.16; the MCP views are on 4.2.4 with `@source` on `dist/`.
- **The shadcn catalog's containers:** `Tabs` binds its active `value` through `$bindState` but renders every child under the tab list regardless of which tab is active, so panels would need a `visible` condition per child; `Accordion` takes `items: [{title, content: string}]` and cannot hold a subtree; `Collapsible` holds children with `defaultOpen` only. The nesting device for the Company hero is therefore `Card` plus `Collapsible`, and `Tabs` stays out (D-6).
- **The shadcn `Table` is `rows: string[][]`,** which cannot bind, confirming `DataTable` as a custom component. `catalog.prompt()` takes `customRules` and a `mode` (`standalone` emits JSONL only), and `defineSchema` carries `defaultRules` that speak of sample data; the custom rules override them.
- **The toolchain:** Node 24 on this machine strips types natively and `tsx` resolves, so `scripts/generate-fixtures.mjs` can import `src/__stories__/generative/catalog.ts` directly for `catalog.prompt()` without a build step. The `pipelex` venv and `~/.pipelex/.env` are in place for the payload and spec passes. No image tooling is installed (no ImageMagick, no Pillow), which shapes the Phase 0 visual check below.
- **The tree:** `wip/generative-ui/` is untracked. The Tailwind upgrade tool refuses a dirty tree, so the campaign documents are the branch's first commit.

## Phase 0 — Tailwind v4 on the branch

The prerequisite for using `@json-render/shadcn` as shipped. Mechanical, dry-run in the parked brief, and deliberately one commit so it can be kept or dropped on its own merits.

- [x] Commit the campaign documents first, on their own, so the upgrade tool sees a clean tree and the ratification is on record before any code moves. Landed as `8007fbb`.
- [x] **Take the visual baseline before touching anything.** Build the Storybook, serve `storybook-static`, and with the repo's own Playwright screenshot every story listed in `index.json` in the `pair` view into the scratchpad. The comparison tooling (`pixelmatch` and `pngjs`) is installed in the scratchpad, never in the repo. This is the only way "visually unchanged" can be asserted rather than believed on this machine. Done at `8007fbb`; see "Pause 1" below for where the shots and the scripts are.
- [x] Run `npx @tailwindcss/upgrade@latest` and keep its rewrites: the config folded into an `@theme inline` block in `src/styles/tailwind-entry.css`, the control classes renamed (`outline-none` to `outline-hidden`, bare `rounded` to `rounded-sm`, `max-h-[--radix-…]` to the parenthesis form, and whatever else it finds), `tailwindcss` moved to v4, `tailwind.config.cjs` deleted along with its line in `.npmignore` and every other reference.
- [x] Reproduce the preflight changes deliberately rather than discover them in the diff: bare `border` defaulting to `currentColor` (make the popover and tooltip borders explicit, or add the shadcn base rule), buttons losing `cursor: pointer`, the placeholder colour moving to `currentColor` at half opacity, and the default `ring` width and colour. The screenshot diff is the check on this list, not the list on itself.
- [x] The source scan survives as `@import 'tailwindcss' source(none); @source '../react';` so the shipped stylesheet still carries only what the controls use. `build:css` moves to `@tailwindcss/cli`. `tailwind-merge` goes to v3 so `cn` merges v4 class names. `tw-animate-css` replaces `tailwindcss-animate`.
- [x] Storybook gets its own superset entry, `.storybook/tailwind.css`, importing the source entry and adding `@source` for `src/__stories__` and for `node_modules/@json-render/shadcn/dist`; `@tailwindcss/vite` replaces the inline postcss plugin in `.storybook/main.ts`. The comments in `main.ts` and `theme-pair.tsx` that describe the v3 arrangement (the inline postcss pass, the `tailwind.config.cjs` scan) are rewritten to describe the v4 one.
- [x] Gates green: `make check`, `make test`, `make all`. Then the screenshot pass again, and the diff: every existing story pixel-identical in both themes, or each difference named with its story and either fixed or recorded as accepted with the reason.
- [x] Docs in the same commit: `docs/theming.md` (Tailwind hosts must be on v4, the `@source` line, `tw-animate-css` in place of the plugin, the token contract unchanged, the v3 `content` example removed), `docs/dependency-budget.md` (`tailwind-merge` v3), `CHANGELOG.md` under `## [Unreleased]` with the v4 requirement recorded as breaking and the sentence that the release waits on the consumers.
- [x] File the webapp's migration item: `ledger new --owner <the webapp> --type task --discovered-from L-260903-35eb46`, then `ledger assign <id> thomas`. The body states the scan-based coupling (the webapp compiles this package's classes with its own v3 build from `dist`), the class rewrites that misrender under v3, the `tailwind-merge` and animate-plugin changes that travel with the upgrade, and that this package's v4 release is sequenced behind it. Link it from this plan by id once filed.

#### Pause 1 — 2026-09-03, before the upgrade tool runs

Paused here deliberately, on a clean tree at `8007fbb`, so a cold session can pick Phase 0 up at the third checkbox. The kickoff gesture is unchanged: `cd _mthds-form--generative-ui && ledger claim L-260903-35eb46 --renew`.

**The baseline.** Every story of the v3 Storybook, screenshotted full-page in the `pair` view at a 1280px viewport with animations and transitions disabled, lives at `/private/tmp/claude-501/-Users-lchoquel-repos-Pipelex--mthds-form--generative-ui/62cbe408-ef39-4e6a-a901-2e508fd7062c/scratchpad/shots/v3/`, one PNG per story id. Two consecutive passes were diffed against each other and every story came back pixel-identical, so any difference the v4 pass shows is real rather than noise. Beside the shots are the two scripts and their `node_modules` (`pixelmatch`, `pngjs`, and a scratch copy of the json-render packages used only for reading their API):

- `shoot.mjs <storybook-static> <out-dir>` serves the static build on a local port, reads `index.json`, and screenshots each story after `window.__STORYBOOK_PREVIEW__.currentRender.phase` reaches `finished` (the phase name in Storybook 10; waiting for `completed` times out on every story). It imports Playwright from this repo's `node_modules`.
- `diff.mjs <before> <after> <diff-out>` compares the two directories with pixelmatch at threshold 0.1, pads on size mismatch, writes a diff image per changed story, and prints one line per story.

The v4 pass is: `make build-storybook`, then `node shoot.mjs <repo>/storybook-static shots/v4`, then `node diff.mjs shots/v3 shots/v4 diffs/v3-v4`. If the scratchpad is gone, the baseline is reproducible from `8007fbb` in about four minutes: build the Storybook there and shoot it.

**Facts learned about json-render while reading its 0.20.0 build, for Phase 1.**

- `catalog.prompt()` composes: a system line, the JSONL format and an example, an "INITIAL STATE" section that says in capitals the model MUST emit `/state` patches for every bound path, the component and action lists, the expression syntax, then numbered rules made of the template's base rules, the schema's `defaultRules`, and finally `customRules`. The React schema's `defaultRules` carry three rules about realistic sample data. So "the custom rules override them" is not enough on its own: a rule appended at position twenty argues with a CRITICAL above it. The device is to define our own schema with `defineSchema`, reusing the React schema's builder shape and `builtInActions` verbatim, with our own `defaultRules` (keep the integrity, placement and named-slot rules, drop the three sample-data ones) and, if the INITIAL STATE section still misleads the first generation, our own `promptTemplate` (the schema option exists and receives `formatZodType`). The prompt hash is computed over the final string either way.
- `resolveBindings` populates `bindings.<prop>` for any prop whose value is `{ $bindState }` or `{ $bindItem }`, whatever the prop is called, and `useBoundProp(propValue, bindings?.value)` returns the resolved value plus a setter that writes to the state store. So `MthdsField` can bind a `value` prop at `/inputs/<name>` exactly as the shadcn `Input` does.
- The shadcn wrappers: `Input`, `Textarea` and `Switch` label through `props.name` as the DOM id, so the ThemePair double render duplicates ids; `Select` renders its `Label` with no `htmlFor` at all, so its trigger has no accessible name. Both are axe candidates for the open question on the input hero. `Card` is `rounded-xl border py-6 shadow-sm` with a `@container` header, `Collapsible` holds local open state seeded from `defaultOpen`, `Button` maps `primary | secondary | danger` onto shadcn variants, `Heading` and `Text` are plain elements with size classes.
- `validateSpec` and `formatSpecIssues` are exported from `@json-render/core`; `catalog.validate(spec)` additionally checks props against each component's zod schema and returns a `ZodError`. `catalog._specType` is the type an authored spec is written against.
- Node 24 imports `.ts` directly, but there is no `tsx` binary in this repo, so `scripts/generate-fixtures.mjs` will import `catalog.ts` through Node's own type stripping, which forbids enums, namespaces and parameter properties in that module.

**The upgrade tool's first move,** for whoever resumes: `npx @tailwindcss/upgrade@latest` from the worktree root on the clean tree, then `git diff --stat` before reading anything, so what it rewrote and what it refused is on record before any hand edit.

### Checkpoint 0 — recorded 2026-09-03

Landed as `14fb91f`, one commit, on top of the two campaign-document commits. The webapp's migration item is L-260903-b75a65, assigned to thomas; the package's v4 release is sequenced behind it, and the changelog entry says so.

**What the tool did, and what was undone by hand.** `npx @tailwindcss/upgrade@latest` on the clean tree rewrote eight control files, deleted `tailwind.config.cjs`, moved `tailwindcss` to 4.3.3 and folded the config into a `@theme` block. Every class rename was kept. Two of its choices were reverted: the block became `@theme inline` (a plain `@theme` defines `--color-border: hsl(var(--border))` once on `:root`, where `var(--border)` is resolved and frozen, so the `.dark` pane of the ThemePair decorator would never reach it — the two-themes-on-one-page arrangement depends on `inline`), and the compatibility layer it added to keep v3's default border colour was dropped in favour of naming `border-border` on the one element that relied on the default, the select popover. The plan's expectation that bare `rounded` would be renamed to `rounded-sm` was wrong on both counts: the tool does not rename it, and under this theme both compile to a quarter rem, so nothing moved. It also did not know `tailwindcss-animate`; `tw-animate-css` replaced it by hand, with the same class names.

**The screenshot verdict.** The first v4 pass differed from the v3 baseline on 33 of 66 stories, all by fractions of a percent, all vertical shifts of one to four pixels, no colour changes. The attribution was done by swapping stylesheets inside the v4 build at screenshot time, not by reasoning: the compiled v3 sheet reproduces the baseline (the residual is the handful of stories exercising renamed classes the v3 sheet cannot know), the v4 sheet reproduces the 33 exactly, and the v4 sheet with v3's `space-y` rule shape restored brings it to 13. So twenty stories were v4's `space-y` rewrite — the margin now sits on the previous sibling's bottom instead of the next sibling's top, under a zero-specificity `:where()` selector — and the last thirteen were one preflight change: v4 zeroes the browser's default `td` padding, and the row-toggle cell had been getting its 1px from that default. Three source changes restore the intent under v4 (the optional-fields and paste-a-URL rows are block-level `flex`, so the parent's strut no longer pads their line box; the row-toggle cell names `pt-px`), after which 14 stories remain, every one an accepted difference:

| Stories | What changed | Why it is accepted |
| --- | --- | --- |
| `inputs-field-states--*` (five), `inputs-scalars--disabled`, `inputs-scalars--number-boolean-date`, `inputs-nesting--filled-deep` | the card holding an optional-fields toggle is about two pixels shorter; the toggle's text has not moved | under v3 the inline-flex toggle sat in a line box with the parent's strut and the box carried the strut's descent below the text; block-level, the row is exactly its own height |
| `inputs-files--native-vs-refined-*`, `inputs-files--required-vs-optional` | the same, for the paste-a-URL row under a second file field | same mechanism |
| `outputs-results--native-text` | a markdown heading sits four pixels lower | its `mt-3` was overridden by v3's higher-specificity `space-y` rule and now applies as written |
| `outputs-results--absent-fields`, `outputs-results--absent-result` | the absent-value dash has the `space-y` gap above it | `margin-top` on an inline element is a no-op, so v3 lost the gap; v4 puts it on the block above, where it works |

No other story differs by a pixel. The before-and-after viewer is at `temp/tailwind-v4/index.html` in the worktree (gitignored locally through `.git/info/exclude`; the scratchpad path in Pause 1 still holds the raw shots and the three probe scripts).

**Gates.** `make check`, `make test` (all suites, the browser-run stories with `a11y` at `error` included) and `make all` green before the commit; `dist/styles.css` is 34 KB minified, from the `source(none)` scan.

**Facts for the phases ahead.** Tailwind 4.3 changed its default `--font-sans` from `ui-sans-serif, system-ui, …` to `-apple-system, BlinkMacSystemFont, …`; it was suspected for the shifts and cleared by injecting the old stack, which changed nothing, so it is not compensated for. The `.storybook/tailwind.css` superset entry carries `@source '../src/__stories__'` already; the `@source` for `node_modules/@json-render/shadcn/dist` waits for Phase 1 to install the package, since a directive on a missing path is not something to leave in a build.

## Phase 1 — The generative layer in the story tree

Everything under `src/__stories__/generative/`, outside both entry globs, so `assert-bundle` never sees it and the shipped surface is untouched.

- [ ] Add `@json-render/core`, `@json-render/react`, `@json-render/shadcn` and `zod` v4 as devDependencies. Add them, with `radix-ui`, to `optimizeDeps.include` in `.storybook/main.ts` so the first generative story does not trigger a mid-run re-optimisation.
- [ ] Add the input hero's carrier: `invoice_with_source` in `data/structures/structured.slots.json`, slots `invoice: Invoice` and `source: Document`. `make fixtures ONLY=structured` regenerates the descriptor; the existing structured stories select their pipes by ref and do not move.
- [ ] `catalog.ts`: `defineCatalog` over the picked shadcn subset from `@json-render/shadcn/catalog` (`Card`, `Stack`, `Grid`, `Separator`, `Heading`, `Text`, `Badge`, `Alert`, `Collapsible`, `Progress`, `Input`, `Textarea`, `Select`, `Switch`, `Button`) with `className` omitted from each, plus the four custom definitions (`MthdsField`, `MthdsResult`, `DataTable`, `Metric`). Zod only, node-importable, erasable syntax only so Node can strip it; this module is what the fixture pass and `make briefs` call `catalog.prompt()` on.
- [ ] `rules.ts`: the custom rules as one exported list, so the catalog prompt the model receives and the one Claude Code reads are the same string, and its hash is computed in one place.
- [ ] `registry.tsx`: `defineRegistry` binding `shadcnComponents` for the subset and implementing the four custom components. `MthdsField` wraps `FieldRenderer` behind `useBoundProp`; `MthdsResult` wraps `ResultField` reading state at the named path; `DataTable` renders bound rows through the vendored primitives; `Metric` is a labelled figure. One `run` action whose handler the story supplies.
- [ ] `brief.ts`: `RunField[]` to the Markdown brief for an input page, and a result `RunField` plus one payload to the brief for a result page. Pure, no React, and the only place the model's view of the descriptor is rendered.
- [ ] `project-spec.ts`: the deterministic floor, pure and React-free. `projectInputSpec(fields)`: text to `Input`, prose to `Textarea`, number to `Input` with `type: number`, boolean to `Switch`, enum to `Select`, object to `Card` plus `Stack` recursing, everything else to `MthdsField`; every value bound at `/inputs/<path>`. `projectResultSpec(field)`: object to `Card` of label and value pairs, list of structures to `DataTable`, enum to `Badge`, number to `Metric`, everything else (date, document, image, markup, prose) to `MthdsResult`; every value bound at `/result/<path>`.
- [ ] `state.ts`: `payloadToState(field, payload)` by stated kind, over the kernel's `native-content` readers, and the `/inputs` seed from authored defaults.
- [ ] `stream.ts`: a spec to JSONL patch lines, root first, parents before children, for the replay story and for the harness's validation of what the model emitted. Any of the three sources can be replayed through it.
- [ ] `make briefs`: `scripts/generate-fixtures.mjs --briefs` writes, for each hero, `wip/generative-ui/briefs/<pipe>.md` carrying the brief and the full catalog prompt with its hash. Committed, because it is the record of exactly what both the model and Claude Code were given, and it is what a future skill would be handed.
- [ ] A node test under `src/__stories__/__tests__/` renders `catalog.prompt()` and asserts every custom component appears in it with its description, that no picked definition still carries `className`, and that `projectInputSpec` over every corpus input pipe and `projectResultSpec` over every corpus output pipe validate against the catalog.

### Checkpoint 1

The catalog, registry and projection exist; a unit-test spec of three elements renders through the registry in jsdom, and every corpus pipe projects to a valid spec. Nothing model-generated yet. Record the shape of the brief as it stands, because Phase 2 iterates on it.

## Phase 2 — The generation harness, the first captured spec, and the first authored one

The pass that turns the descriptor into a spec, built on the existing fixture generator so that a spec is produced the way a payload is; and, beside it, the first spec written by hand from the same inputs.

- [ ] `data/generative/ui-designer.mthds`: one `PipeLLM`, inputs `catalog_rules: Text` and `brief: Text`, output `Text`, `model = "claude-5-sonnet"`. The prompt says what the design says: lay out what you understand, delegate by naming the path, bind everything, inline nothing, no `className`, one root.
- [ ] `scripts/generate-fixtures.mjs --specs`: for each hero, render the brief from the committed descriptors and payloads, call `catalog.prompt()` with the custom rules, run the method through `pipelex run bundle` exactly as the payload pass does (honouring `MODEL=` as an override of the pin), compile the text with `compileSpecStream`, validate with `validateSpec`, check every element type against the catalog, and fail loudly with `formatSpecIssues` on any issue. Write `src/__stories__/_generated/<case>.specs.ts` keyed by pipe ref, exporting the raw JSONL and the compiled spec, with the payload files' provenance header plus the model and the hash of the catalog prompt.
- [ ] `make fixtures-specs`, documented in the Makefile the way `fixtures-runs` is: costs inference, needs credentials, `ONLY=<case>` narrows it, `MODEL=<id>` overrides the pin.
- [ ] Run it for the first hero, `results.nested_result` (the invoice), and iterate the brief and the method's prompt until the spec validates without a hand edit. Every repair round is a change to the method or the brief, committed, never to the fixture.
- [ ] Write the first `Authored` spec, `src/__stories__/generative/authored/results.nested_result.ts`, from the committed brief and catalog prompt and nothing else: a `Spec` typed against `catalog._specType`, so a misnamed prop fails `tsc` before any test runs, with a provenance header naming the source (Claude Code), the date, the brief file and the catalog prompt hash. It obeys the same rules the model is given; a rule the author found necessary to break is a finding about the catalog, recorded at the checkpoint rather than worked around.

### Checkpoint 2

The first captured spec renders in Storybook from a real generation, and the first authored spec renders beside it. Record the model, how many repair rounds the first spec took and what each changed, what the brief looks like now, and the first reading of the three sources side by side. This is the point at which criterion 2 of the checkpoint (the model produces the spec unaided) is first known, and if it is failing badly the step can stop here with a clear finding.

## Phase 3 — The heroes

Three, each a group of four adjacent stories over the very same fixture, so the sidebar shows the kernel's rendering, the floor, the ceiling and the model's output one click apart. `Generative` is appended to `storySort.order` in `.storybook/preview.tsx`; within a hero the order is `Kernel`, `Projected`, `Authored`, `Generated`.

- [ ] **`Generative/Results/Invoice`** — `results.nested_result`. The reference as a heading, the total as a `Metric`, paid as a `Badge`, the issue date through the loader, the lines as a `DataTable`. The first hero because everyone reads an invoice and it exercises the typed-envelope date and a list of structures.
- [ ] **`Generative/Results/Company`** — `results.deep_result`. Four levels of nesting: divisions, teams, members. Whatever layout the model chooses (cards per division, collapsibles per team, badges for roles) is the test of whether a model handles depth gracefully; a `MthdsResult` delegation of a subtree the model declined to lay out is a valid outcome, and the story says so.
- [ ] **`Generative/Inputs/Invoice`** — `structured.invoice_with_source`. A heading with the pipe's description, the short fields grouped, the status as a `Select`, the address as a card, the source document, the date and the lines through `MthdsField`, an alert naming what gates the run, a Run button firing `validateForm` then `run`. A state receipt under the form shows `/inputs`, and the play assertion checks `computeReadiness` over that state agrees with the kernel form on the same values.
- [ ] **`Generative/Streamed`** — the `Generated` invoice spec replayed from JSONL through `createSpecStreamCompiler` behind a Replay button, so the progressive fill is visible.
- [ ] The corpus test grows: every spec from every source validates, every element type is in the catalog, every `MthdsField` path in an input spec names a field the descriptor has, and the catalog prompt hash stamped on each `Authored` and `Generated` spec matches the current prompt. A stale hash is the signal that the catalog moved under a fixture: the `Generated` one is regenerated, the `Authored` one is re-read against the new prompt and re-stamped.
- [ ] Check what axe says on the first input story at `a11y: 'error'`, since the shadcn inputs label by `props.name` and `ThemePair` renders every story twice. If it objects, a story-level parameter renders one theme for that story, and the finding is recorded in `docs/storybook.md`.

### Checkpoint 3 — the decision

All three heroes render from all three sources in both themes. Louis judges them against the four criteria in the design, reading the sources against each other: if `Generated` is close to `Authored`, the model is not the problem; if `Authored` is dull too, the catalog is the limit and the finding is about the vocabulary rather than the package; if `Projected` is nearly as good as either, the layer has not earned its place over the kernel. Record the verdict and the reasoning here, whichever way it goes, and if the answer is "go further", file the follow-up items the design lists and open the next plan under this campaign. If it is "another package" or "build our own", say what the heroes showed and decide the fate of the Phase 0 commit.

## Phase 4 — Docs, closing the step

Written before the checkpoint so the decision is made on a documented layer, and kept whichever way it goes: the record of what was tried is the deliverable if json-render is not adopted.

- [ ] `docs/generative-ui.md`: the three artifacts, rule 1 restated for a model, the two state trees, the catalog and the two escape hatches, the three sources and what each is for, design time versus run time, the fixture pass and the briefs, what ships now (nothing) and what is the follow-up.
- [ ] `docs/storybook.md`: the `Generative` section in the section table, the Storybook Tailwind entry, the third fixture pass, the four-story convention per hero and the provenance rule for authored specs.
- [ ] `docs/dependency-budget.md`: the devDependency note for the json-render packages and zod, and the sentence that the story tree is where they may be imported from until the layer ships.
- [ ] `CHANGELOG.md` under `## [Unreleased]`: the Storybook section and the fixture pass; the v4 entry from Phase 0 already there.

## Out of scope for this step

Recorded so nothing below is absorbed silently: a `./generative` entry or a sibling package; any release of this package; hosted generation and caching of the spec per method version; the MCP app view; code export; the agent skill for the `Authored` path; a zod mirror of `RunField` for `MthdsField`; adoption in the host webapp's method app; the starters' and the playground's Tailwind migrations; intent hints in the kernel's controls (`L-260823-d905b9`).
