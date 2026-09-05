---
status: superseded
superseded_by: wip/generative-layer/design.md
item: L-260903-35eb46
---

# Integration — the layer ships, the layout is stored per method version, the host renders it over the form

**Superseded on 2026-09-04** by the workspace program `wip/generative-layer/` (`design.md` and `plan.md`, epic `L-260904-611e88`), which reverses one decision here and amends another: the study branch is a spike and does not merge, so the layer is ported into a clean worktree off `dev` against the acceptance suite the study captured; and the stored layout is served as a `views` token on the hosted validate of a registered method rather than on a product route. The text below stays as written, as the record of what was proposed first.

**Written 2026-09-04, for Louis's ratification, to be read after [`plan-the-whole-chain.md`](plan-the-whole-chain.md) has run.** This is the plan for taking the generative layer out of the study and into the product: the package's official method form, the hosted plane that stores what the designer method produces, and the host app that renders it. It is written before the whole-chain experiment so that the decisions it asks for are on the table while that experiment is read, and it is the campaign's last document in this repo's `wip/`: the integration spans repos, so when it starts it gets an epic in the ledger with one child per repo and a program directory of its own, and this plan stays as the record of what was decided and why.

## What integration means, in one paragraph

A generated layout becomes a stored artifact, produced once per method version by a job in the hosted plane that runs the designer method over the brief rendered from the method's descriptor, validated against the catalog and stored with its provenance beside the method version, exactly as a captured spec fixture is committed today. The host app's run page renders it through a shipped entry of this package, over the method's tokens, with the kernel owning every input, and falls back to the kernel's own form whenever there is no layout that fits. The run and the result go through what the host already has; a branded result page is the step after.

## The decisions, and the recommendation on each

**1. What ships.** A `./generative` entry of this package, rather than a sibling package: the layer is written against the kernel's descriptor and controls, its whole value is that seam, and a sibling package would restate the dependency budget and the bundle assertion for one consumer. The entry carries the catalogs and their prompt renderers, the brief renderer, the validator, `GenerativePage` with the registry (the two escape hatches, `MthdsField` and the state bindings, are the entry's reason to exist), the fixture and provenance types, and a `layoutFits(descriptor, spec)` predicate that is the corpus test's path checks as a runtime function. The designer method's bundle ships in the package as data, because the prompt hash names a pair, the prompt and the validator that accepts what the prompt asks for, and the method that carries the prompt to a model has to move with them; the hosted job runs the package's bundle at the package's version. The brand pipeline (Terrazzo, the site-facts extractor, the brand producer) stays a tool in this repo and ships in nothing: a brand reaches a host as a stylesheet setting the theme contract, which is what the theme contract exists for.

**2. The catalog the product uses first.** The brand catalog, with the product's own tokens, since it is the one whose pages read as a product page; the base catalog stays the layer's own and the study's comparison ground. A host that wants another vocabulary defines a catalog against the same escape hatches, and the prompt hash keeps its layouts apart.

**3. The fallback rule, which is the product's safety.** The run page renders the kernel's own form when there is no stored layout for the method version, the catalog and the current prompt hash; when the stored layout no longer validates against the catalog the entry ships; when `layoutFits` says a delegated path or a bound path no longer resolves in the descriptor; and when the layout errors at render. The layout is an enhancement over a form that always renders, generation is never in the request path, and the page never waits for a model. The host counts how often the fallback renders, because that number is the only measure of the job's coverage.

**4. Where the layout is generated and stored.** A job in the hosted plane at method publish, and a backfill whenever the package's prompt hash moves, running the designer method through the runner with the brief rendered by the package's own renderer from the same descriptor the validate route projects. The layout is stored beside the method version with its provenance (producer, model, seed, the prompt hash, the catalog, the date, the repair rounds) and served on the route the host already reads a method version from. It is not a token on the validate route: that route projects a declaration, and a layout is a model's answer over one, with a provenance a projection does not have. Its latency, about half a minute per call with the repair bound, is what forbids the request path and what makes publish time the place.

**5. The result page.** First the kernel's viewer under the tokens, which is what the whole-chain experiment paints and what the host renders today; then a branded result catalog, with its own experiment, since the brand catalog's vocabulary is an input page's and a result page has shapes of its own (a document, a gallery, a table, a report). A method whose output is dynamic has no result descriptor until it runs, so its result page is always the viewer's.

**6. The brand.** The product's own tokens are committed data, produced once and re-produced by the brand producer when the site changes. A customer's brand, from their site's URL and the facts they state, is an organisation setting and a later step; nothing in this integration depends on it, because the page reads the theme contract and a brand is a stylesheet.

## The budget, and rule 1 on a shipped surface

`@json-render/core`, `@json-render/react` and `zod` join the dependency table for the `./generative` entry. `@json-render/shadcn` and the `radix-ui` umbrella do not: the shipped registry vendors the few renderers it uses, as the controls vendor their primitives, and the layer's own `Tabs` takes the radix package it needs rather than the umbrella. `make assert-bundle` gains the rules for a third entry: json-render and zod reach neither `.` nor `./react`; React may reach `./generative` and ajv may not; `mthds` reaches none of the three. The lint blocks follow, and the entry's modules move out of the story tree into `src/generative/`, which puts them inside the entry globs `assert-bundle` walks.

Rule 1 has to hold on the shipped surface exactly as it holds in the study: `GenerativePage` takes `RunField[]`, a spec and a store, and no schema passes through it; `MthdsField` renders through `FieldRenderer` and knows a path and nothing else; the validator reads the catalog and never a descriptor's schema. The zod mirror of `RunField` the design named is not needed for the first integration, since the prompt describes `MthdsField` by its path prop alone; it stays a recorded follow-up.

The host must be on Tailwind v4 to compile the entry's classes, which `L-260903-b75a65` already tracks ahead of the package's v4 release.

## The phases

### Phase I — the entry, in this repo

The layer moves from `src/__stories__/generative/` to `src/generative/`, the stories stay where they are and import it as a consumer would. The entry in `tsup.config.ts` and the `exports` map, the budget table, the lint blocks, the bundle assertion's third entry, the designer method as shipped data with a test that its prompt hash is the package's. `docs/generative-ui.md`'s "What ships" rewritten, `docs/dependency-budget.md`'s table extended, the changelog, and a release, since a consumer cannot integrate a story tree.

**Checkpoint A.** A consumer installs the released package and renders a captured layout over a descriptor with no story code, and the bundle assertion proves the three entries reach only what the table allows.

### Phase II — the stored layout, in the hosted plane

The job at publish, the backfill on a prompt-hash move, the storage beside the method version with the provenance, the route serving it, and the runner running the package's designer method at the package's version. The item names the member the work lands in.

**Checkpoint B.** A method published on the hosted plane has a layout stored with its provenance, the route serves it, and a second publish of the same version does not regenerate it.

### Phase III — the run page, in the host app

The run page renders the layout when it fits and the form when it does not, under the product's tokens; the run goes through the lifecycle the page already uses; the result through the kernel's viewer; the fallback counted. The page's copy is the author's, as the whole-chain experiment asserts.

**Checkpoint C.** A method's run page in the product, seen both ways: with a layout, and with the fallback after the layout is made stale on purpose.

### Phase IV — the branded result, later

Its own experiment first, on the pattern of the join: the result vocabulary defined, the rules stated, the designer method handed the catalog, the pages read against the viewer. Not part of the integration's go.

## Ledger

When Louis says go: an epic for the integration with a `plan:` ref back at the program's plan, and three children, one per repo, each naming its owner and member; this repo's child is Phase I. The two ledger items already open in this repo that the integration touches are `L-260903-7ec51b` (the kernel's list, date and file controls inside a branded page) and `L-260823-d905b9` (intent hints in the kernel's controls), neither of which the integration waits on.

## Go/no-go, stated before the work

1. **The entry ships nothing the table forbids**, and the bundle assertion proves it on all three entries.
2. **A stored layout renders in the product** over the descriptor the validate route projects for that method version, with the kernel owning the inputs.
3. **The fallback renders the kernel's form** in every case rule 3 names, and the product counts it.
4. **A publish costs one generation** per catalog, and a re-publish of the same version costs none.
5. **Rule 1 holds on the shipped surface**: no schema reaches a control, and the corpus test's checks run in the product as `layoutFits`.

## Out of scope

The MCP app view, code export, the agent skill for the authored path, a customer's brand as an organisation setting, the zod mirror of `RunField`, the critic loop, and any layout the model writes that is not a validated data file.
