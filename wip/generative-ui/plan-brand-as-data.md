---
status: active
item: L-260903-35eb46
---

# The brand as data — plan for the second step of the generative-UI campaign

**Written 2026-09-03, ratified by Louis the same day.** This file stands on its own: a session that starts cold reads it and nothing else, then the code. The first step's full record, its decisions, its five checkpoints and its redirect, is [`plan.md`](plan.md), and the reasoning is [`design.md`](design.md); both stay as the archive and are not needed to work. The worktree is `_mthds-form--generative-ui` on `feature/Generative-ui`, the item is `L-260903-35eb46`, and the gesture is `ledger claim L-260903-35eb46 --renew` from inside it.

## Where we come from, in five checkpoints

- **Checkpoint 0 — Tailwind v4, pixel-faithful** (`14fb91f`). The package moved to Tailwind 4.3 on the branch as one commit; the differences against the v3 baseline were attributed by swapping stylesheets and every remaining one is accepted and tabled. The release of the v4 line waits for the host webapp's own migration. Facts that still matter: the theme block is `@theme inline` so two themes render side by side on one page, and `tw-animate-css` replaced `tailwindcss-animate`.
- **Checkpoint 1 — the generative layer exists** under `src/__stories__/generative/`, in the story tree and outside both shipped entries. A catalog over a shadcn subset plus our own components; two escape hatches, `MthdsField` and `MthdsResult`, that take a `/inputs` or `/result` PATH and render the kernel's own control for it, resolved against the descriptor the host holds (rule 1 for a model: a spec names a path and nothing about what a field is); a deterministic projection of the descriptor as the floor; a validator of our own that checks every prop; and a brief per hero, generated from the corpus, that carries the state paths, the delegated ones, the defaults, the run rule and the catalog prompt with its hash.
- **Checkpoint 2 — a model, unaided, produced a valid spec on its first call.** The producer is a Pipelex method, `data/generative/ui-designer.mthds`, given the catalog prompt and the brief; the fixture pass captures its JSONL with provenance. On the invoice result the generated page was within a few elements of the one written by hand and well clear of the projection. Findings that changed the layer: a prompt example is a value the model copies, so the catalog names no value a brief could fail to carry; a vertical `Stack` stretches its children; run-to-run variance is a design review, not a diff.
- **Checkpoint 3 — three heroes, both themes, four sources each; verdict: go further.** The company result carried four levels of depth, with the model delegating a subtree per item through a relative path inside a repeat; every capture validated on its first call; readiness computed by the kernel agreed with every generated form. Louis's question sharpened: not "can a model lay out a form" but how far a model can make the input side look like a web app.
- **Phase 5 and Checkpoint 4 — the app, not the form; then the redirect.** The prompt gained a design direction and a creative seed, the catalog gained the vocabulary of an app (`Tabs`, `Steps`, `Split`, `Segmented`, `NumberInput`, `Icon`), a trip-request hero was added, and specs were captured from the method on `claude-5-sonnet`, `claude-4.8-opus` and `gpt-5.5` and from Claude Code subagents, every one named by what produced it, every one valid first call. Louis stopped the comparison: it was not testing what he wanted. One prototype followed, a page for the trip request in the Pipelex brand, spec written by hand by a Fable 5.1 subagent (`68ba9c7`, `src/__stories__/generative/prototype/`). It reads as a product page; what limits it is the kernel's list, date and file controls' studio chrome (filed as `L-260903-7ec51b`), and the fact that the brand itself, colours, type, logo, was applied through hand-written CSS outside the spec. Conclusions that hold: json-render is kept, because the layout is validated JSON a product can store per method; it carries no taste, in any catalog; the look of a control belongs to the registry and to the host's theme tokens; the missing layer is the design system as validated data.

## Facts a cold session needs

- **The layer.** `src/__stories__/generative/`: `catalog.ts` (the components and actions; `catalogPrompt()`), `rules.ts` and `direction.ts` (the prompt's rules and its design direction), `schema.ts` (the prompt template; its hash is `74ecce11615e` and it must not move in this step), `registry.tsx` (what each component renders as; `GenerativePage`, which takes a `registry`), `validate.ts`, `brief.ts`, `project-spec.ts` (the floor), `spec-fixture.ts` (provenance: `producer`, `model`, `seed`, `critic`, `promptHash`), `authoring.ts`, `heroes.ts` (four heroes: `results.nested_result`, `results.deep_result`, `structured.invoice_with_source`, `trips.plan_trip`), `hero-page.tsx`, `source-stories.tsx`, `play-helpers.ts`, `state.ts`, `stream.ts`; the stories `inputs-invoice`, `inputs-trip`, `results-invoice`, `results-company`, `streamed`; captured specs in `src/__stories__/_generated/*.specs.ts`, hand-written ones in `authored/`, the branded prototype in `prototype/` (`brand-catalog.ts` extends the catalog, `brand-registry.tsx`, `brand-page.tsx`, `pipelex-brand.css`, `pipelex-trip.spec.ts`, the story). Tests: `src/__stories__/__tests__/generative.test.ts` (node) and `generative/__tests__/registry.test.tsx` (jsdom).
- **The data.** Structures in `data/structures/*.mthds` with a `.slots.json` beside each; `make fixtures` projects them into `src/__stories__/_generated/`. The designer method is `data/generative/ui-designer.mthds`. Briefs are generated into `wip/generative-ui/briefs/` by `make briefs`.
- **The commands.** `make fixtures-specs` runs the method through the Pipelex CLI (`../pipelex/.venv/bin/pipelex`, 0.55.0, or `PIPELEX_BIN`; `MODEL=`, `TEMPERATURE=`, `SEED=`, `ONLY=`; `gpt-5.5` needs `TEMPERATURE=1`); `npx tsx scripts/generate-fixtures.mjs --capture <jsonl> --pipe <ref> --producer <p> --model <m>` records a spec another producer made. `make storybook` to look, `make build-storybook` to shoot; the screenshot walker and the comparison viewers are machine-local under `temp/generative/` (gitignored through `.git/info/exclude`). Storybook globals: `themeView` (`pair`, `light`, `dark`) and `play` (`on`, `off`); a story may set `parameters.themeView`.
- **The gates.** `make check`, `make test` (there is no `make agent-test` in this repo), `npm run build && make assert-bundle`. Every generative story runs in Chromium with `a11y` at `error`; `color-contrast` is the one rule off.
- **The theme contract, as it stands.** `src/styles/theme.css` states the shadcn semantic tokens as HSL triplets under `:root` and `.dark`; `src/styles/tailwind-entry.css` maps them in `@theme inline` as `hsl(var(--x))`; the kernel controls and the shadcn subset both read them, which is why a token layer re-skins everything. `.storybook/theme-pair.tsx` renders both themes; `.storybook/preview-head.html` loads Inter for the prototype.
- **The Pipelex brand, as read off pipelex.com on 2026-09-03:** [`pipelex-design-system.md`](pipelex-design-system.md), beside this file. The logos are public: `https://d2cinlfp2qnig1.cloudfront.net/logo/Pipelex-logo-wot-1119x352.png` (white, for a dark canvas) and `Pipelex-logo-bot-1119x352.png` (black, for a light one).
- **The house rules that bite here.** No closed-source repo is named in this repo. Every producer is named by what it is (the method and its model, a Claude Code subagent and its model, the session by hand), never "authored" or "generated". A dependency, even a dev one, is recorded in `docs/dependency-budget.md` in the same change. Docs move with the code; the changelog accumulates under `## [Unreleased]`. A change to the prompt moves its hash and is out of this step.

## The plan

**Written 2026-09-03 on Louis's redirect, ratified by him the same day; continues on this branch, in this worktree.** The use case, in his words: a person has built a method that implies an input form, and to put their brand on it they hand over a logo, a colour palette, a font, whatever can be pulled off their website; what renders in Storybook is that brand on the method's page. The rule that governs the phase: **the model writes data files only.** No TypeScript, no CSS. Each file is validated against a schema and recorded with its producer, exactly as the layout spec is. Anything the data cannot express is not on the page: the blur orbs, the canvas gradient and the hand-written `pipelex-brand.css` of the prototype go, and nothing replaces them by hand.

### The two artifacts of a brand

Beside the layout spec per method, two files per brand under `data/brands/<slug>/`, with the producer's JSONL beside them as the specs pass does:

- **`tokens.json`, DTCG.** The theme contract as tokens, each with a `light` and a `dark` mode (Terrazzo's `$extensions.mode`): the shadcn semantic colours the controls read (background, foreground, card and its foreground, popover and its foreground, primary and its foreground, secondary and its foreground, muted and its foreground, accent and its foreground, destructive and its foreground, border, input, ring), the radius, the font families (sans and mono), and a shadow only if a control or a brand component consumes one. Colours in any DTCG colour space; the build decides how they are written.
- **`brand.json`, the manifest**, validated by a zod schema written once: the brand name, the website it was read from, one logo URL per scheme (light and dark), and the font source when the family is a webfont the host must load (a Google Fonts family name, or none). A URL and a name are data; a `<link>` and an `@font-face` are the host's, written once.

The contract the producer writes against is generated, never hand-written: `make briefs` gains `wip/generative-ui/briefs/brand-contract.md`, the list of token ids with what each one paints, rendered from the same table the theme reads, so the producer and the build cannot disagree on a name.

### The pipeline, ours, written once

`scripts/build-brands.mjs`, run as `make brands`: for each brand, `@terrazzo/parser` parses and lints the tokens (both modes required, every colour valid, no duplicate values, descriptions present), `@terrazzo/plugin-css` emits the custom properties with `modeSelectors` for `.dark` and variable names that ARE the theme contract's, scoped under `.brand-<slug>`, into `src/__stories__/_generated/brands/<slug>.css`, committed like the specs modules. A brand that fails validation gets the repair loop the specs have (the validator's messages back to the producer, a bounded number of rounds, every round recorded) and, past the bound, a rejected file beside the brief. The Terrazzo packages are devDependencies imported from the story tree and the scripts only; `docs/dependency-budget.md` records them, and `make assert-bundle` keeps proving nothing reached the entries.

**The one package change, and the prerequisite for all of it: the theme contract moves from HSL triplets to full colours.** `src/styles/theme.css` states `--primary: #00bb95` (or an `oklch()`), and `@theme inline` in `src/styles/tailwind-entry.css` maps `--color-primary: var(--primary)`. This is modern shadcn's own convention under Tailwind v4, a contained edit to two files and to `docs/theming.md`, and a breaking change for hosts that set the triplets, noted as such in the changelog. It is done first, on its own commit, with every gate green, because nothing in the phase works without it and because it must be judged on its own.

### The producer

A Pipelex method, `brand.tokens_from_site` in `data/generative/`, on `claude-4.8-opus` and nothing else in this phase: the phase compares nothing, it proves one path. Its inputs are the brand contract (the generated brief) and **site facts**: what a script pulled off the website deterministically, `scripts/extract-site-facts.mjs`, which fetches the page and its stylesheets and records, as data, the colour scheme, every colour custom property and the colour utilities by frequency, the font families and font links, the radii in use, and the image candidates for a logo. The method's judgment is the mapping, which colour is primary and which is the surface, what the light mode of a dark-only site is, and it writes the two files. Provenance is the specs' record: producer, model, date, the hash of the brief. The first brand is Pipelex, from pipelex.com, because the facts were already read by hand on 2026-09-03 (`temp/generative/prototype/pipelex-design-system.md`) and the script must reproduce them; a second, light-first site is run only if the first holds, to show the mapping is not tuned to one page.

### The rendering

The prototype page, re-based on the data: the brand components keep their structure and lose their hand styling (the `Logo` reads the manifest through a brand provider and carries no URL in the spec, `AppBar`, `Hero` and `Glass` paint from tokens only), the kernel controls take the tokens as they do today, and the story becomes one per brand, `Generative/Brand/<name> · trip planner`, titled with the producer, rendered in both themes by `ThemePair` from the two modes of one file. The trip planner's layout spec is the one already on the branch; this phase changes nothing about how a layout is produced.

### Checkpoints

- **Checkpoint 5, the pipeline.** After the contract change and the build script: a Pipelex token file written by the Claude Code session by hand, labelled as such, renders the trip planner in both themes with no hand-written CSS on the page. Louis judges the contract change and whether the page still looks like the prototype without its orbs.
- **Checkpoint 6, the producer.** The method's files for pipelex.com, validated and rendered; the reading against the criteria below; Louis decides whether tokens become the second validated artifact beside the spec.

### Go/no-go, stated before the work

1. The model-written token file validates on the first call or after one repair round.
2. Light and dark come from the one file, and both read as the brand.
3. The generated CSS restyles every kernel control and every brand component with nothing hand-written on the page.
4. The loop, extract, generate, validate, build, screenshot, runs in under a minute per brand.
5. The two files, the JSONL and the provenance are enough for a cold session to rebuild the page.

### Order of work

- [ ] **Retire what the data cannot express.** Remove the orbs, the canvas gradient and `pipelex-brand.css` from the prototype; keep the page and its story rendering through the stock tokens until the brand build exists.
- [ ] **The theme contract as full colours.** `theme.css`, `tailwind-entry.css`, `docs/theming.md`, the changelog's breaking note; `make check`, `make test`, `npm run build`, `make assert-bundle`; one commit.
- [ ] **The brand artifacts and the build.** The manifest schema, the brand contract brief in `make briefs`, the Terrazzo config, `scripts/build-brands.mjs` and `make brands`, the `_generated/brands/` output, the brand provider and the re-based brand components, the story per brand; the session's hand-written Pipelex tokens as the first brand. Checkpoint 5.
- [ ] **The producer.** `scripts/extract-site-facts.mjs`, the method `brand.tokens_from_site`, the capture with provenance and the repair loop, the Pipelex brand from pipelex.com; the second site if the first holds. Checkpoint 6.
- [ ] **The record.** `docs/generative-ui.md` ("The brand as data", replacing "The branded prototype"), `docs/theming.md`, `docs/dependency-budget.md`, `docs/storybook.md`, the changelog; the findings under "Phase 6 — recorded" and this plan's Checkpoint 6 written for Louis's reading.

### Out of scope for this phase

The orbs and any effect a token does not name; gradients until a component consumes a gradient token; imagery beyond the logo; component-level style variants in the catalog; design-token-kit as the pipeline (a `dtokens check` second opinion is allowed as an optional gate, dev-only, droppable); rebuilding the CSS in the browser from tokens a model adjusts live (possible with Terrazzo's parser, noted, not built); hosting the brand files; the kernel controls' chrome (`L-260903-7ec51b`).

## Checkpoints, to be written

### Checkpoint 5 — the pipeline

Written when the hand-written Pipelex tokens render the trip planner in both themes with no hand-written CSS on the page.

### Checkpoint 6 — the producer

Written when the method's own files for pipelex.com render; the reading against the five criteria, and Louis's decision.
