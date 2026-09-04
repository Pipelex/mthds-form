---
status: active
item: L-260903-35eb46
---

# The whole chain — an authored method in, a run and its result out

**Written 2026-09-04, ratified by Louis the same day.** The fourth step of the generative-UI campaign and the last experiment before integration is considered. It follows [`plan-the-join.md`](plan-the-join.md), whose Checkpoint 9 answered the campaign's question and whose closing section records the two conditions fixed; this file stands on its own after that section, and a cold session reads it and then the code. The worktree is `_mthds-form--generative-ui` on `feature/Generative-ui`, the item is `L-260903-35eb46`, and the gesture is `ledger claim L-260903-35eb46 --renew` from inside it.

## The question, and the gap it names

Every experiment so far started from a descriptor the fixtures pass projected off carrier pipes it synthesized itself, from structures an author wrote in `data/structures/`, each carrier described in the bundle as "synthesized, not authored". And every page ended at a run button whose action is a no-op: `actions: { run: async () => {} }` in both registries, with `BrandPage` recording the state the press would have sent and nothing more. So two things have never been seen, and Louis named both. A method someone actually wrote has never entered the chain, so nothing has shown that the brief reads well when its text is an author's pipe and concept descriptions rather than a hero's curated summary, or that the layout holds on slots a real method declares. And the page has never done what it is for: no run has left it, and no result has come back to be shown.

The question this step answers: does the chain, unchanged, take a method nobody tuned a brief for from its bundle to a product page that runs it and shows what came back?

## Facts a cold session needs

- **The chain and its passes.** `make fixtures` projects the descriptors through `scripts/dump-validate-views.py`, which loads a bundle through the library and calls the same builders the hosted validate route calls; `make briefs` renders a brief per hero, the brand one as `<pipeRef>.brand.md`; `make fixtures-specs CATALOG=brand` runs the designer method on a named model and writes `<case>.brand.specs.ts`; `make brands` compiles the committed brands; Storybook paints. Nothing in the chain reads the bundle's pipes except the builders.
- **The case model of the fixtures pass** is two files per case in `data/structures/`: `<case>.mthds` carrying structures only and `<case>.slots.json` grouping the slots into carrier pipes the script synthesizes. The heroes are listed in `src/__stories__/generative/heroes.ts`, keyed by `pipeRef`, each with a `summary` the brief carries as the page's description.
- **The result side exists in the kernel.** `buildResultField` (core) and `StuffViewer` (`./react`) render a stuff from the output descriptor, and `make fixtures-runs` captures real payloads because two shapes are invisible from every descriptor: a date arrives in the serializer's typed envelope and a plural result arrives as `{items: [...]}`. The generative layer has no result vocabulary in the brand catalog; the base catalog's result heroes render through the kernel's viewer and a projection.
- **The play and the brand page.** `tripPlays` in `brand/trip-plays.ts` is written for the trip planner: it types a budget and reads it back off the receipt. `BrandPage` takes any spec and the brand's tokens, with `contained` for a layout that brings no chrome.
- **The story tree may take devDependencies the shipped graph may not.** `docs/dependency-budget.md` says which and why; `mthds` is types-only everywhere in `src/`, stories included, so a run cannot go through the standard's client from a story.
- **The source of authored methods** is the public cookbook, `pipelex-cookbook` on GitHub, MIT. Each example carries its bundle, an `inputs.json` and its sample files, so a run has real inputs to hand.
- **The run goes through the hosted API**, which is what the host app calls; `@pipelex/sdk` carries the run lifecycle (start, status, results) and the upload of file inputs, and a key comes from the person running the demo. The open-source runner image (`pipelex/pipelex-api` on Docker Hub) is the alternative when there is no key.
- **The rule from the last step stands.** No iteration on what the method produces for look and feel; technical repairs only, and every one recorded. The one lever that is ours is the brief, since it is rendered by our code from the author's text.

## The plan

### Step one — authored cases beside the structures cases

The fixtures pass gains a second kind of case, and the split is the point: a structures case synthesizes its carriers because the axes a story varies are properties of a slot; an authored case has its pipes already, written by a person, and nothing is synthesized. An authored case is `data/methods/<name>/bundle.mthds`, copied verbatim from the cookbook with a header comment naming the origin and the licence, and `data/methods/<name>/case.json` naming which pipes are heroes, normally the main pipe alone. The script loads the bundle as it is, projects the descriptors through the same builders, and adds the heroes to the list with the pipe's own description as the summary, since that is what the author wrote and what a host would have.

Three methods, chosen by the shape of their inputs and their result so that the reading is not tuned to one: `extract_invoice` (one document in, a list of invoices out), `design_slides` (one structure of texts with choices and optionals in, an HTML page out), and `summarize_people` (a list of records in, a list of rows out). `research_report` is the alternate if one of the three does not load. Their inputs come from the example's own `inputs.json` and files.

### Step two — the layouts, on the unchanged chain

`make fixtures` and `make briefs` on the new cases, then `make fixtures-specs CATALOG=brand ONLY=<pipe>` on the pinned model, `claude-4.8-opus`, for each hero; a second model only if the first three validate first call, since the question is the chain and not the model. No rule, prompt or method change; the brief's rendering may be repaired if a real bundle exposes a gap in it (a missing domain description, a pipe description that is a sentence fragment), and every repair is recorded in the checkpoint.

The stories: a `Generative/Methods/<name>` file per method, each a joined story under the pipelex tokens, titled by what produced each half as the brand stories are. The play generalizes `paintsFromTheTokens` from the trip planner's budget to the method's fields: it types into the first text input the descriptor declares, reads it back off the receipt, and asserts the readiness; the logo, the one h1, the run button's colour in both panes and the typeface stay as they are.

### Step three — the run closed

The `run` action does what its name says. Pressing the Cta hands the `/inputs` tree the kernel gathered to the hosted API through the run lifecycle, from the story, with a key read from `STORYBOOK_PIPELEX_API_KEY` at build time and never committed; file inputs go up through the kernel's upload seam (`FieldEnv`) to the API's storage before the run starts, which the invoice case needs. Without a key the action says so on the receipt and the page stays as it is, so every story still renders in CI and the play never runs anything. `@pipelex/sdk` joins the story tree's devDependencies, importable from the story tree only, with its line in the budget document; a plain `fetch` on the protocol's routes is the fallback if the SDK's install weight or its own `mthds` closure trips the bundle assertion.

The result renders in place. `BrandPage` gains a result state under the Workspace: once the run completes, the kernel's `StuffViewer` paints the returned stuff over `buildResultField` of the pipe's output descriptor, under the same tokens, with its download and copy controls. No new catalog vocabulary: the first look at the whole chain uses the viewer the package already ships, and a branded result page is the integration plan's question.

The gesture is manual and that is the point: a served Storybook with the key, the Cta pressed, the run watched, the result read.

### Step four — the reading

Shots of the three pages in both themes at the desktop width used so far and at a phone width, since the host app is used narrower and every shot so far was at one width; and a shot of each result view after a real run, machine-local under `temp/generative/chain/`.

## Checkpoints

**Checkpoint 10, the authored page**, after step two: the three methods loaded and projected, the briefs read, the layouts validated, the pages painted, criteria 1 to 3 and 5 read at the desktop width. A natural handoff, since step three opens the API and the SDK.

**Checkpoint 11, the run and its result**, after step four: the run closed on the three methods, the results painted, criteria 4 and 6 read, the phone width read, and the answer to the step's question written for Louis's reading.

## Go/no-go, stated before the work

1. **The authored methods project through the unchanged builders.** The fixtures pass's authored mode is the only code change before a layout is asked for, and the bundles are byte-identical to the cookbook's past the header.
2. **Every layout validates within the repair bound** on the pinned model, with no rule, prompt or method change.
3. **The page's copy is the author's.** The headline, the ledes and the section titles say what the bundle says, and the page states no fact the bundle does not: no invented product name unless the brief carries one, no promised feature the method has no pipe for.
4. **The run completes from the page and the result renders in place**, through the kernel's viewer, for a list of structures, an HTML page and a list of rows, with the payload in the shapes the payload pass corrected.
5. **The page reads as a product page** on a method nobody tuned a brief for, read with Checkpoint 3's rule, at the desktop width and at the phone width.
6. **The cost is one designer call per method per model**, and the run costs what the method costs.

The readings: all six hold and the chain is proven end to end, which is what Louis wants to see before integration is considered. Criterion 1 or 2 fails and the fault is technical, ours, fixed and re-run. Criterion 3 or 5 fails and the lever is the brief, which is our rendering of the author's text: one iteration of the brief is allowed, recorded, and the layouts re-run. Criterion 4 fails and the fault is in the run lifecycle or the viewer, ours again.

## Order of work

- [x] **The authored case.** `data/methods/<name>/` with the three bundles and their `case.json`; the fixtures pass loads an authored case as it is; the heroes gain the three; `make fixtures`, `make briefs`.
- [x] **The layouts.** `make fixtures-specs CATALOG=brand` per hero on the pinned model; the stories and the generalized play; shots at the desktop width; Checkpoint 10.
- [ ] **The run.** The SDK in the story tree with its budget line; the `run` action through the lifecycle with the upload seam; the result state in `BrandPage` over the kernel's viewer; the key handling and the no-key path.
- [ ] **The reading.** The runs, the result shots, the phone-width shots; Checkpoint 11.
- [ ] **The record.** `docs/generative-ui.md` (the authored case, the run closed, the result in place), `docs/storybook.md` (the authored case beside the structures case, the key), `docs/dependency-budget.md` (the SDK line), the changelog, this plan's checkpoints, `plan.md`'s Phase 8 paragraph, the ledger note.

## Costs

Three descriptor projections, free. Three designer calls on the pinned model, each about the time of a Phase 5 capture. Three method runs on the cookbook's sample inputs, which cost what those methods cost; the slide designer generates images and is the expensive one. One session to Checkpoint 10, a second to Checkpoint 11.

## Out of scope for this step

A branded result catalog, which is the integration plan's. The critic loop over shots. New brands, and the mthds brand for these pages beyond one shot. Hosted generation and storage of the layout. A method whose output is `Dynamic`, such as the cookbook's document question answering, since its result has no descriptor until it runs; that is a fact the integration plan must carry, not a case for this step. The method's inputs template as a source of sample values for the play.

## Checkpoint 10 — the authored page, read 2026-09-04

**What landed.** The fixtures pass has a second kind of case: `data/methods/<case>/` holds `bundle.mthds`, the cookbook's file verbatim past a four-line header naming the origin commit and the licence, `case.json` naming the origin, the licence, a title, the hero pipes and the example's `inputs.json`, and the example's own files (`restaurant_invoice.pdf`, `people.csv`; the slide designer has none). `scripts/generate-fixtures.mjs` discovers a case by its `case.json`, checks the header carries the origin and each hero is a pipe of the bundle, loads the bundle as it is and projects it through the same builders; the module it emits carries two more exports, `PIPE_DESCRIPTIONS` and `DOMAIN_DESCRIPTION`, which the projection script now reads off the loaded pipes and the parsed blueprint because no validate artifact carries an author's prose. A hero states its `source`, and an authored method's hero states no `summary`: `heroSummary` opens its brief with the pipe's description as the author wrote it. The corpus test pairs every case of both kinds with its module, checks each method's provenance and its heroes against the list, and the projection sweep takes every pipe of the three bundles, not only the heroes. The three cases are `extract_invoice` (hero `invoice_extraction.process_invoice`), `design_slides` (`slide_designer.generate_design_proposals_from_rough_brief`) and `summarize_people` (`summarize_people.summarize_people`); `research_report` was not needed.

**Technical repairs, all ours, none to a rule, a prompt or a method.**

- `dump-validate-views.py` boots with `needs_model_specs=True` beside `needs_inference=False`. Inference off leaves only the local extractors in the deck and the loader checks a pipe's pinned `model` handle at load time, so `design_slides`, which pins an image model on its `PipeImgGen`, failed to load before any builder ran: `ModelChoiceNotFoundError: Model handle 'nano-banana-pro' was not found in the model deck`. The specs come from the cached remote config, nothing is called, no credential is needed, and the structures cases pin nothing.
- `extract_invoice` imports `github.com/Pipelex/methods/documents` by address. The cookbook satisfies that with the package vendored under its own `.mthds/methods/`, which pipelex finds by walking up from the bundle's path; from this repo the loader fell back to a stale global install under `~/.mthds/methods/` and failed with `Pipe 'documents.extract_text_pages' not found`. The package is vendored at the same relative place, `data/methods/.mthds/methods/documents/`, copied from the cookbook with a README naming its origin, so a case loads here as it loads there, on any machine, with nothing fetched. Both discoverers take a directory under `data/methods/` for a case only when it carries a `case.json`.
- The descriptor emitter never formatted its modules; the committed ones had been formatted by hand and the format gate caught the regenerated ones. It runs prettier on the way out, as the specs emitter always did.
- The trip-specific number test in the corpus became the rule it stood for: every bound number path is a `NumberInput`, with the trip's budget asserted present.

**The layouts.** `make fixtures-specs CATALOG=brand ONLY=<pipe> MODEL=claude-4.8-opus`, once per hero: each validated on the first call, no repair round, in the first run and again in the second (below). Criterion 2 holds; criterion 6 holds by construction, one designer call per method per model, and no second model was tried since the question is the chain.

**The stories and the play.** `Generative/Methods/<title>`, one file per method (`brand/method-*.stories.tsx`), sharing `method-page.tsx`; one joined story each, `layout Pipelex method · claude-4.8-opus · brand catalog · tokens Pipelex method · claude-4.8-opus`. The brand play's core moved from `trip-plays.ts` to `brand-plays.ts` and takes the spec and a text target rather than a layout id and the budget: `firstTextTarget` walks the method's fields in the brief's order, into structures and never into a list, and returns the first `text` or `prose` input; `methodPlays` types into it and reads it back off the receipt, or types nothing when the method declares none, and reads the receipt as seeded. Of the three, only the slide designer has such an input (`/inputs/brief/topic`); the invoice has one document and the people case has its texts inside the list, which is a fact about those methods and not a case the play invents around. The logo per pane, the one h1, the run button's colour in both panes and the typeface are asserted as before; `revealInput` also knows the ids the brand catalog's inputs mint. The trip plays are the same core with the budget as the target. The story plays pass in Chromium for the three methods.

**Criterion 1 holds:** the bundles are byte-identical to the cookbook's past the header (`cmp` on each), and the builders are untouched.

**Criterion 3, the reading that cost the one brief iteration.** The first run's pages carried the author's text in the headline, the ledes and the section titles — "Read an invoice", "Turn a brief into design proposals", "Turn a roster into readable summaries", every section a slot the bundle declares — and three things the bundle does not say: an invented product name in each AppBar ("Invoice Reader", "Slide Studio", "People Digest"), invented navigation ("Documents · History", "Themes · Decks · History", "Records · History"), and one promise, the invoice footer's "Your document is processed once and not stored." The cause is not the designer's: the brand catalog's AppBar asks for the name of the app and a few links, and the brief handed it neither, so it made them up — as it had on the trip planner ("Wander", "Trip studio"), which Checkpoint 9 read past. The lever is the brief, and the one iteration the plan allows went there: an authored method's brief carries a `## Name` section stating the method's name as a host lists it (the case's title — a host has a name for every method it lists; a synthesized carrier has none and its brief gains nothing), that it is the app's name wherever the layout asks for one and no other is invented, that links, if any, name the page's own sections, and that the page states nothing the method does not, naming storage, privacy, speed and what happens after the run. The trip briefs are unchanged by it. The second run: AppBars "Invoice extraction · The invoice", "Slide designer · The brief · Direction · Audience", "People summaries · The people"; footers carrying the method's name and nothing else; the headlines still the author's ("Pull the numbers off your invoice", "Turn a rough brief into design proposals", "Summarize everyone on the list"). Criterion 3 holds on the second run, with the iteration recorded here and in the docs.

**Criterion 5 at the desktop width holds** on the second run's shots, both themes (`temp/generative/chain/c10b--*`; the first run's are `c10--*`): each is a product page in the brand's grammar — bar, hero, numbered sections, the rail with the one Cta and its hint, the footer — and the delegated inputs sit under the tokens as the trip's did. Two facts of the pages, not defects: the invoice page has one section and a lot of canvas under it, because the method has one input; and the people page's readiness reads `0/0 · ready` with an empty list, because nothing gates that run in the bundle. The phone width is Checkpoint 11's.

**Decisions taken.** An author's prose reaches the brief from the projection (`PIPE_DESCRIPTIONS`), never by hand, so a brief can only say what the bundle says. A methods hero carries no summary of ours. The brief's Name section is rendered only for a hero with a name, so the structures briefs do not move. The play types nothing rather than typing into a list row. `data/methods/.mthds/methods/` is the one place a bundle's dependencies live in this repo.

**Open for step three.** The hosted API sends no CORS headers and answers the OPTIONS preflight with 401, so a browser cannot call it from Storybook directly; the run will go through a dev-server proxy in `.storybook/main.ts` that injects the key server-side, so the key never reaches the client bundle and CI, with no key, renders the page and runs nothing. `MthdsField` needs an id-to-path translation for the kernel's upload seam, since the kernel's controls compose DOM ids and the store is keyed by path.
