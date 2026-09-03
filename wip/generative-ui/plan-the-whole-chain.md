---
status: draft
item: L-260903-35eb46
---

# The whole chain — an authored method in, a run and its result out

**Written 2026-09-04, for Louis's ratification.** The fourth step of the generative-UI campaign and the last experiment before integration is considered. It follows [`plan-the-join.md`](plan-the-join.md), whose Checkpoint 9 answered the campaign's question and whose closing section records the two conditions fixed; this file stands on its own after that section, and a cold session reads it and then the code. The worktree is `_mthds-form--generative-ui` on `feature/Generative-ui`, the item is `L-260903-35eb46`, and the gesture is `ledger claim L-260903-35eb46 --renew` from inside it.

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

- [ ] **The authored case.** `data/methods/<name>/` with the three bundles and their `case.json`; the fixtures pass loads an authored case as it is; the heroes gain the three; `make fixtures`, `make briefs`.
- [ ] **The layouts.** `make fixtures-specs CATALOG=brand` per hero on the pinned model; the stories and the generalized play; shots at the desktop width; Checkpoint 10.
- [ ] **The run.** The SDK in the story tree with its budget line; the `run` action through the lifecycle with the upload seam; the result state in `BrandPage` over the kernel's viewer; the key handling and the no-key path.
- [ ] **The reading.** The runs, the result shots, the phone-width shots; Checkpoint 11.
- [ ] **The record.** `docs/generative-ui.md` (the authored case, the run closed, the result in place), `docs/storybook.md` (the authored case beside the structures case, the key), `docs/dependency-budget.md` (the SDK line), the changelog, this plan's checkpoints, `plan.md`'s Phase 8 paragraph, the ledger note.

## Costs

Three descriptor projections, free. Three designer calls on the pinned model, each about the time of a Phase 5 capture. Three method runs on the cookbook's sample inputs, which cost what those methods cost; the slide designer generates images and is the expensive one. One session to Checkpoint 10, a second to Checkpoint 11.

## Out of scope for this step

A branded result catalog, which is the integration plan's. The critic loop over shots. New brands, and the mthds brand for these pages beyond one shot. Hosted generation and storage of the layout. A method whose output is `Dynamic`, such as the cookbook's document question answering, since its result has no descriptor until it runs; that is a fact the integration plan must carry, not a case for this step. The method's inputs template as a source of sample values for the play.
