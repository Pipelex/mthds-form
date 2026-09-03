---
status: active
item: L-260903-35eb46
---

# The join — a method-made layout under method-made tokens

**Written 2026-09-04, for Louis's ratification.** The third step of the generative-UI campaign, and the one that answers the question Louis asked after Checkpoint 7: does the system, deterministic software plus Pipelex methods and nothing else, make a method's app look like a proper web app rather than a form, with no coding agent in the loop? The record of what has been seen so far is the closing section of [`plan-brand-as-data.md`](plan-brand-as-data.md), "What has been seen working"; this file stands on its own after that section, and a cold session reads it and then the code. The worktree is `_mthds-form--generative-ui` on `feature/Generative-ui`, the item is `L-260903-35eb46`, and the gesture is `ledger claim L-260903-35eb46 --renew` from inside it.

## The question, and the gap it names

Each half of the chain has been shown to work with no agent in it. The designer method writes a layout from the descriptor's brief, and every capture validated on its first call (Checkpoint 3 and Phase 5 in [`plan.md`](plan.md)); the brand method writes a brand from a site's facts, and both brands validated on their first call in under forty seconds (Checkpoint 7). What has never been seen is the two halves in one page. The page that reads as a product page renders `pipelex-trip.spec.ts`, which a Claude Code subagent wrote by hand against the brand catalog, and the method's own layouts were only ever painted in the stock theme, where Louis read them as "not in the right ballpark" (Checkpoint 4). The claim is therefore supported for each half and unproven for the whole. Two experiments close the gap, ordered by cost: the first needs no inference and gives the floor, the second is the real test.

## Facts a cold session needs

Verified on 2026-09-04 against the code, so the steps below name real seams.

- **The prompt is bound to one catalog.** `catalogPrompt()` in `src/__stories__/generative/catalog.ts` renders the base catalog with `CUSTOM_RULES`. The template in `schema.ts` carries the design direction and the seed procedure for whichever catalog it renders, so `brandCatalog.prompt({ mode: 'standalone', customRules })` yields a brand-catalog prompt with the same direction and a different vocabulary. The brand catalog (`brand/brand-catalog.ts`) is the base catalog plus `AppBar`, `Hero`, `Workspace`, `Section`, `Rail`, `SummaryRow`, `Cta` and `Footer`, each already described for a prompt, and it names no brand.
- **The rules say `Button` where the brand catalog says `Cta`.** `CUSTOM_RULES` (`rules.ts`) says an input page has exactly one Button firing `validateForm` then `run`; the brand catalog's `Cta` description says the same of itself. A brand prompt needs that rule restated for the Cta, and the grammar of a product page stated as rules: AppBar once and first, Hero once under it carrying the only h1, the work and the Rail inside the Workspace, the Rail made of SummaryRows bound to paths and ending with the one Cta, Footer once and last.
- **The validator is bound to the base catalog.** `validateAgainstCatalog(spec)` in `validate.ts` imports `catalog`. Its checks (every prop per component, one child per tab or step, two per split, no Button as a panel, heading order in render order) are catalog-agnostic in substance and need the catalog as a parameter.
- **A fixture knows no catalog.** `SpecFixture` (`spec-fixture.ts`) carries producer, model, seed, critic and `promptHash`; `fixtureId` is producer, model, seededness and critic; `storeFixture` in `scripts/generate-fixtures.mjs` replaces by pipe ref and id. A brand-catalog fixture with the same producer and model would overwrite the base one, and the corpus test (`src/__stories__/__tests__/generative.test.ts`) validates every `SPECS` entry against the base catalog and compares its hash with `currentPromptHash()`. Brand-catalog fixtures therefore need their own module per case and their own hash.
- **The brand page takes any spec.** `BrandPage` (`brand/brand-page.tsx`) takes `brand`, `fields` and `spec`; `brandRegistry` is `generativeRenderers` plus the brand components, with `Input` and `Textarea` redrawn on the kernel's control surface. A base-catalog spec renders in it unchanged, painted from the brand's tokens.
- **What exists to join.** Trip layouts from the method in `src/__stories__/_generated/trips.specs.ts`: `claude-4.8-opus` and `gpt-5.5`, each plain and with a seed, and `claude-5-sonnet`, all against prompt hash `74ecce11615e`. Brands from the method: `data/brands/pipelex/pipelex-method--claude-4.8-opus/` and `data/brands/mthds/pipelex-method--claude-4.8-opus/`, both against contract hash `27d1d3c2bc39`, with the hand-written pipelex brand beside them. The hand-written brand spec has an AppBar, a Hero, a Workspace, a rail of SummaryRows reading input paths with `$state`, the delegated inputs through `MthdsField`, one Cta and a Footer.
- **The designer pin.** `data/generative/ui-designer.mthds` pins `claude-5-sonnet` at temperature 0.5 with `max_tokens` raised for the deep hero; `MODEL=`, `TEMPERATURE=` and `SEED=` override on the pass and `ONLY=<pipe code>` narrows it. The trip brief is `wip/generative-ui/briefs/trips.plan_trip.md`, rendered by `make briefs` with the prompt appended.
- **The shots.** The shoot script is machine-local, `temp/generative/brand/shoot.mjs` (`THEME=light|dark ROUND=<r> [ONLY=<prefix>] node temp/generative/brand/shoot.mjs storybook-static <out dir>`), after `npm run build-storybook`.

## The plan

### Experiment A — the cheap look: the method's layouts under the method's tokens

No inference. Each trip layout the method already wrote, rendered in `BrandPage` under each method-made brand. It shows how much of "a proper web app" the tokens do on their own to a base-catalog page, and it is the floor for reading Experiment B. The base catalog has no chrome, so the page will have no logo, no hero and no footer by construction; whatever it lacks beyond that is the tokens' limit rather than the vocabulary's.

- A story per brand and per layout, in the brand story files, titled by what produced each artifact: `layout Pipelex method · claude-4.8-opus · tokens Pipelex method · claude-4.8-opus`. The hand-written spec's stories stay as they are, as the reference.
- The play: the tokens reach the paint (the run button's computed colour is the token's accent, the page is set in the token's typeface) and the kernel owns the inputs (a typed budget reaches `/inputs/request/budget`, the readiness on the receipt agrees with `computeReadiness`). No logo assertion, since the base catalog has none.
- Both themes shot for every story under `temp/generative/join/a--*`, read beside the `c7--*` shots of the hand-written spec under the same tokens.

### Experiment B — the real one: the designer method handed the brand catalog

One inference call per run. The method that wrote the layouts is given the brand catalog's prompt and the same trip brief, its answer is validated against the brand catalog exactly as every capture is validated, and the fixture is rendered under each method-made brand. If that page reads as a product page, the claim holds with no agent anywhere in the chain.

- **The brand prompt.** `brandCatalogPrompt()` beside the brand catalog: `brandCatalog.prompt({ mode: 'standalone', customRules: BRAND_RULES })`, where `BRAND_RULES` is `CUSTOM_RULES` with the Button rule restated for the Cta and the product-page grammar appended. Its hash is `promptHashOf(brandCatalogPrompt())`, separate from the layer's, and the corpus test asserts the prompt lists every brand component and carries both rule sets in order.
- **The brief.** `make briefs` writes, for each input hero, the same brief with the brand prompt appended, as `wip/generative-ui/briefs/<pipeRef>.brand.md`, so the record of what the model was handed is complete for either catalog.
- **The pass.** `make fixtures-specs CATALOG=brand ONLY=plan_trip MODEL=<id>`: `--catalog brand` picks the brand prompt, validates with the brand catalog, stamps the brand hash, records `catalog: 'brand'` on the fixture, and writes `src/__stories__/_generated/<case>.brand.specs.ts`, so the base module, its corpus test and its stories are untouched. A rejected answer is kept as `<pipeRef>.brand.<id>.rejected.jsonl` beside the briefs and the command fails; the repair is to the rules or the method, never the fixture.
- **The validator.** `validateAgainstCatalog(spec, catalog)`, defaulting to the base catalog, the existing checks unchanged. A product-page check (one AppBar first, one Hero, one Cta, one Footer last) is added only if a run breaks the grammar the rules state, so the first run measures the prompt rather than the guard.
- **The corpus test.** A `brand` describe over every `*.brand.specs.ts` module: validates against the brand catalog, compares the hash with the brand prompt's, round-trips the JSONL, checks every delegated path resolves in the descriptor.
- **The runs.** `claude-4.8-opus` first, the model that wrote both brands and the cleanest trip wizard at Phase 5. If it validates and reads, `claude-5-sonnet` and `gpt-5.5` (at its own temperature) for the comparison, so the reading can say which model did what, as Phase 5's could.
- **The stories.** Per brand, one story per brand-catalog fixture, titled the same way with the prompt variant named: `layout Pipelex method · claude-4.8-opus · brand catalog · tokens Pipelex method · claude-4.8-opus`. `fixtureLabel` names the catalog when it is not the base one. The play is the brand play in full: one logo per pane, the Cta's computed colour is the accent, the kernel owns the inputs, the readiness agrees.
- Both themes shot under `temp/generative/join/b--*`.

### Checkpoints

- **Checkpoint 8, the floor.** Experiment A's shots read beside the hand-written spec's: what the tokens do on their own to a method-made wizard, and what only the chrome vocabulary can add. No decision hangs on it; B runs regardless, and this is the reading B is measured against.
- **Checkpoint 9, the answer.** Experiment B read against the criteria below, and the answer to Louis's question written in plain words: confirmed, confirmed under stated conditions, or not confirmed and where the limit is.

### Go/no-go, stated before the work

1. The method's brand-catalog spec validates on the first call or after one repair round, and every repair is a change to the rules or the method, committed, never to the fixture.
2. The page carries the product page's grammar from the rules alone: the AppBar with the logo first, the Hero with the only h1, the work and the rail, exactly one Cta firing `validateForm` then `run`, the Footer last; the play proves it.
3. The kernel owns the inputs: the delegated inputs render through `MthdsField` at their paths, a typed budget reaches `/inputs/request/budget` as a number, and the readiness on the receipt agrees with `computeReadiness`.
4. One spec, both brands, both themes: the same fixture reads as pipelex.com under the pipelex tokens and as mthds.ai under the mthds tokens, judged by Louis on the shots.
5. No agent edited anything on the way: the brief from `make briefs`, the spec from the pass, the tokens from `make brand-from-site` as already committed, the stylesheet from `make brands`, the page from Storybook; every artifact carries a provenance naming its producer.
6. Louis's judgment: the page reads as a product page in the brand. The criterion that matters and the only subjective one, read with Checkpoint 3's rule: the method's page close to the hand-written one clears the method; the hand-written one dull too indicts the brand catalog, which is ours; Experiment A nearly as good as B says the chrome vocabulary is not earning its place and the tokens are doing the work.

What each failure means. If 1 fails repeatedly, the brand catalog's prompt is one the model does not get right, and the finding is about the grammar as stated. If 2 fails while 1 holds, the rules are not enough and the validator gains the product-page check. If 6 fails while 1 to 5 hold, the limit is the vocabulary or the direction, both ours, and worth one more round before the question is answered with a no.

### Order of work

- [x] **Experiment A.** The joined stories in both brand story files, the play, `make check` and `make test`, `npm run build-storybook`, the shots in both themes, Checkpoint 8 written.
- [ ] **The brand prompt.** `BRAND_RULES`, `brandCatalogPrompt()` and its hash; `make briefs` writing the brand brief per input hero; the corpus test's assertions on the prompt.
- [ ] **The seams.** The validator taking a catalog; `catalog` on `SpecFixture` and in `fixtureLabel`; `--catalog` on the specs pass writing `<case>.brand.specs.ts`; the corpus test's `brand` describe over those modules.
- [ ] **The runs.** `make fixtures-specs CATALOG=brand ONLY=plan_trip MODEL=claude-4.8-opus`; the repair rounds, if any, as committed rule changes; then the two other models if the first holds.
- [ ] **The stories.** One per brand-catalog fixture per brand, with the full brand play; the gates; the shots; Checkpoint 9 written with the answer.
- [ ] **The record.** `docs/generative-ui.md` (a section on the join after "The brand as data"), `docs/storybook.md` (`CATALOG=` on the specs pass, the brand briefs), the changelog; a "Phase 7 — recorded" paragraph in `plan.md`; a ledger note on the item; the PR against `dev` updated with `Advances L-260903-35eb46`.

Checkpoint 8 and Checkpoint 9 are the handoff points: each closes a coherent unit and the next opens a new area of the code. A pause block goes under the checkpoint it follows, as in the earlier plans.

### Costs

Experiment A costs nothing but a build and a screenshot pass. Experiment B costs one call to the designer method per model, each about the length of a Phase 5 capture, and needs the same credentials `make fixtures-specs` always needed. No brand is re-run: the two committed brands are the fixtures.

### Out of scope for this step

The critic loop over the shots (Phase 5's, still unrun, and not what the question asks). New brands and new brand runs. The per-mode stated accent Checkpoint 7 named, unless the dark shots make it the thing that decides criterion 4. A result page in the brand catalog: its vocabulary is an input page's today, and a branded result page is the step after this one. New agent-made specs: the question is about a chain with no agent, and the one hand-written brand spec is kept only as the ceiling to read against. The kernel controls' own chrome inside a brand (`L-260903-7ec51b`). Hosted generation and caching per method version, the `./generative` entry and the agent skill: the archive plan's follow-ups, unchanged.

## Checkpoint 8 — the floor (2026-09-04)

Experiment A ran as planned and cost nothing: the five trip layouts the method wrote against the base catalog (`claude-4.8-opus` plain and seeded, `gpt-5.5` plain and seeded, `claude-5-sonnet`) each render in `BrandPage` under each method-made brand, as `stories.join(tokens, layout)` in both brand story files, titled `layout Pipelex method · <model> · tokens Pipelex method · claude-4.8-opus`. The play holds on every story: the run button's computed colour is the token's accent, the page is set in the token's typeface, a typed budget reaches `/inputs/request/budget`, and the readiness on the receipt agrees with `computeReadiness`. The shots are `temp/generative/join/a--*`, both themes, beside the reference stories shot in the same build.

**One harness fact surfaced first.** A base-catalog layout carries no container: the brand components give themselves the page's width (`max-w-6xl`), the base catalog has no notion of a page's width, and the first shots ran edge to edge at 1440 pixels while the receipt under them sat centred. That is neither the tokens' limit nor the vocabulary's, so `BrandPage` gained `contained`, which a story sets for a layout that brings no chrome, and the shots were retaken. It is recorded because it is the kind of thing that would otherwise be read as a finding.

**What the tokens do on their own.** Everything they can reach, they reach: the accent is on the step indicator and the Next button, the kernel's controls are painted exactly as on the reference page (the same input surface, the same date and list controls, the same dropzone), the typeface is the brand's, and the dark canvas is the site's. Under the mthds tokens the near-black accent and Roboto make the wizard read as mthds.ai's monochrome; under the pipelex tokens the teal and Inter read as pipelex.com's. Nothing on these pages is off-brand.

**What only the chrome vocabulary can add,** and the reading is not close. The predicted absences hold by construction: no bar, no logo, no hero, no footer. Two more separate the pages from the reference and were not predicted. The page has no weight: the base catalog's `Heading` at h1 is the size of a section title, where the reference's `Hero` sets a 44-pixel headline over a lede, so the method's page opens like a settings screen and the reference opens like a landing page. And the work is boxed: every `gpt-5.5` layout and the seeded `claude-4.8-opus` one put their work in `Card`s, which under the brand's card token read as grey panels on the light canvas, where the reference's `Section` is flat with a hairline and its one boxed thing is the rail. The step wizard, the strongest app gesture the base catalog has, does not compensate: a numbered indicator over one panel at a time is a form with pagination once the chrome is missing.

**Where the floor is.** A method-made layout under method-made tokens is recognisably the brand's palette on a well-made form. It is not a product page, and the gap is the vocabulary, not the tokens; Experiment B is measured against the reference under the same tokens, and criterion 6's third reading (A nearly as good as B) is already unlikely on this evidence. One layout defect seen on the way is the model's, not the join's: the seeded `gpt-5.5` layout's rail prints a `$template` sentence over empty state ("Budget:", "days, mostly ."), which was there in the stock theme too.

