---
status: active
item: L-260904-c6d660
---

# The `./generative` entry review — the fixes before PR #21 merges

**Written 2026-09-05; the decision to apply every finding was Louis's the same day.** This is the fix plan for the review of PR #21 (`feature/Generative-entry` against `dev`), the PR that closes the Phase 1 item. The review ran at the highest effort and every finding was re-read against the source before it was accepted; the verdicts below are this repo's, not the reviewer's. The bar was stated up front: this is the first version of a new feature, and it ships clean and solid, so nothing here is deferred. Every item is small, and together they make the two gates agree with their own documentation, which is the property a first version most needs.

**Kickoff gesture, from a fresh session:** `cd _mthds-form--generative-entry && ledger claim L-260904-c6d660 --renew`, then read this document top to bottom before touching anything. Everything below cites the file and line as they stood at `5031e27`; re-locate by symbol if the line has moved.

## How the work is cut

Four commits, grouped by module, each leaving `make check` and `make test` green. The order matters only in that the first is the one a host feels most and the last is hygiene. Each commit's message says what the fix protects against, in the voice the branch's other commits use, and the changelog is folded rather than appended (see "Changelog" at the end).

1. **The gates agree with their docs** — items 1, 3, 5, 6, 12 (all in `src/generative/layout-fits.ts`, `validate.ts`, the definitions and their tests).
2. **The page carries the brand, and the scope memo is honest** — items 2, 7, 13 (`page.tsx`, `brand-context.tsx`, `product-registry.tsx`, the docs snippet, the story harness).
3. **The catalog controls mint unique ids** — item 4, with a new jsdom test project for the generative tree.
4. **Hygiene** — items 8, 9, 10, 11 (one helper, one shared pair of functions, three sentences).

### Checkpoint A — after commit 1

The gates are the load-bearing half. Before moving on, record here: which of the new tests were red before the fix (each should have been), and whether the corpus test (`src/__stories__/__tests__/generative.test.ts`) still accepts every captured layout after items 3, 5 and 12 tightened or loosened a rule. If a captured layout is now refused, **the repair is not to the layout** — see `docs/generative-ui.md` § "Where the corpus lives" — so stop and decide whether the rule or the fixture pass is wrong.

### Checkpoint B — after commit 4

Run the full gate: `make check`, `make test`, `make all` (which builds and runs `make assert-bundle`). Record the SHAs of the four commits below, push to the PR branch, and re-trigger the bots (`@codex review`, `@greptileai review`, each as its own comment). Then the second-round bar applies from `CLAUDE.md`: extreme necessity only.

## Commit 1 — the gates agree with their docs

### 1. `layoutFits` throws on a malformed spec

**Where:** `src/generative/layout-fits.ts:166` (`layoutProblems`) and `:234` (`layoutFits`); the walk that throws first is `parentMapOf` at `src/generative/paths.ts:87`, whose `for (const child of element.children ?? [])` throws `TypeError` on `children: 5`, and `Object.entries(spec.elements)` throws on a null map.

**Why it is real:** `validateAgainstCatalog` (`validate.ts:182`) wraps `checkAgainstCatalog` in a try/catch precisely because "a host calls this to decide whether it is safe to render, so a throw leaves it with no verdict". `layoutFits` makes the same promise in its header comment and keeps none of it. The docs say a host "runs both" without ordering them, and `validate.ts:233` says outright that the two predicates "are exported separately, so neither may assume the other ran first". A JSONL line such as `{"op":"add","path":"/elements/a/children","value":5}` compiles through `specFromJsonl`, which degrades deliberately, and then throws inside the fit gate.

**Fix:** the same shape as `validateAgainstCatalog`. Rename the current body to `collectLayoutProblems` (module-private) and make `layoutProblems` the boundary: try, and on a throw return one line, `the layout is not a well-formed spec: ${String(error)}`. `layoutFits` stays `layoutProblems(...).length === 0`. Update the header comment to state the promise as the validator's does.

**Test:** in `src/generative/__tests__/layout-fits.test.ts`, an `it.each` mirroring the malformed table at `validate.test.ts:242` — null repeat, `children: 5`, `props: 5`, a null element, no `elements` map — asserting `layoutProblems` returns a non-empty list and `layoutFits` returns false, never throws.

### 3. A `repeat`'s `statePath` is never checked for staleness

**Where:** `layout-fits.ts:119` (`repeatPaths`, which feeds coverage only) and `:79` (`readPaths`, which walks `element.props` and `element.visible` but not `element.repeat`).

**Why it is real:** a result page carrying `repeat: { statePath: "/result/lines" }` whose output member is renamed passes `layoutProblems` — the result-page branch checks hatch paths and `staleReads`, and neither sees the repeat — so the page renders an empty repeat and the host never falls back. This is the exact staleness the module's header says it exists to catch. On an input page an optional list has the same hole; a required one is rescued only by the coverage half, for the wrong reason.

**Fix:** a repeat is a read. Add a loop over the elements that carry a `repeat`, resolving each through `repeatBasePathOf(spec, key, parents)` — the same call the hatches resolve through, which handles both an absolute `statePath` and a relative `{ $item }` one, and already carries the cycle guard. Filter by the owned root as `staleReads` does (a repeat over scratch state is the layout's business). When the resolved item path does not resolve against the descriptor, push a dedicated line: `${key}: repeats over ${statePath}, which no input has` (or `no result has`, on the result-page branch). Do this on both branches; the result-page branch currently returns early, so the loop goes before the `if (!descriptor.inputs)` split or is called from both.

**Tests:** three, beside `layout-fits.test.ts:114` ("lays a list out as a repeat"): a result page whose repeat names a member the result no longer has is refused; an input page whose repeat over an *optional* list names a gone member is refused; a repeat over `/ui/rows` is left alone.

### 5. The bound-path check rejects the scratch state the read side allows

**Where:** `layout-fits.ts:204`, the `for (const path of bound)` loop, which applies no root filter.

**Why it is real:** `staleReads` (`:113`) filters reads to the owned root and its comment says "a layout may hold scratch state of its own … that is its business"; `validate.ts:404` says the same for `setState`; `docs/generative-ui.md` says it twice. But a `Switch` bound to `/ui/showDetails` — the natural way to drive a `visible` condition — hits `inputFieldAtPath(inputs, '/ui/showDetails')`, which returns `undefined` for any path outside `/inputs`, and the layout is refused with `/ui/showDetails is bound, and no input has it`. The host then silently falls back on a layout that was fine. The two halves of the same gate disagree about the same rule, and the rule is already decided in three places: **scratch state is allowed**.

**Fix:** one rule for a `$bindState` path, on both pages, phrased on the same two owned roots `validate.ts` uses (`INPUTS_ROOT`, `RESULT_ROOT`):

- under `/inputs`: on an input page it must resolve against `inputs` (today's check, kept); on a result page it is refused — keep the existing wording, "a result page writes nothing";
- under `/result`: refused on either page, with a line that says why — `${path} is bound; a layout may not write into /result, which the run fills`;
- anywhere else: scratch, ignored.

The result-page branch's current "binds anything at all" check becomes the first two bullets applied with no `inputs`.

**Tests:** beside `layout-fits.test.ts:219` ("leaves the layout's own scratch state alone", which today covers only a `$state` read): a `Switch` with `{ $bindState: '/ui/showDetails' }` fits an input page and fits a result page; a `$bindState` under `/result` is refused on an input page with the new wording.

### 6. `Workspace` silently drops a third child

**Where:** `src/generative/product-registry.tsx:113` — `const [work, rail] = React.Children.toArray(children)` binds two and drops the rest; `validate.ts:380` checks `Split takes exactly two children` for exactly this class of silent loss and has no `Workspace` rule, even though `product-rules.ts:21` states the rule in the prompt.

**Fix:** replace the hardcoded `Split` block in `validate.ts` with a small table and one loop — `const CHILD_COUNTS: Record<string, [number, string]> = { Split: [2, 'left, right'], Workspace: [2, 'work, rail'] }` — producing `${type} takes exactly ${n} children (${roles}); this one has ${count}.` Leave the renderer's destructure alone: the gate refuses first, and a renderer that painted three columns would be inventing a layout the rules forbid.

**Test:** in `validate.test.ts`, a `Workspace` with three children is refused, and the existing `Split` assertion still holds through the table.

### 12. `AccessibleSelect` writes `option-<n>` for an empty option

**Where:** `src/generative/registry.tsx:302`, `value={option || \`option-${index}\`}`.

**Why it is real, and why the obvious fix is wrong:** picking the item writes `option-0` into `/inputs/...`, a value in neither the descriptor's enum nor the layout's options, and the run gate rejects the run naming a value the person never saw. But the fallback is there because Radix `Select.Item` **throws** on an empty-string `value`, so "pass the option verbatim" is not available. The fix is upstream of the renderer.

**Fix:** tighten the definitions so an empty option never reaches a renderer: `options: z.array(z.string().min(1))` on `Select` (`src/generative/shadcn-definitions.ts:177`), `Radio` (`:191`) and `Segmented` (`src/generative/components.ts:235`, keeping its `.min(2).max(6)`). A blank dropdown row or a blank pill is not a choice a person can make, so the validator refusing it is the right verdict. Then delete the `|| \`option-${index}\`` fallback in `AccessibleSelect` so what is written is always exactly the option. Note the prompt hash: changing a definition changes `catalogPrompt()` only if the rendered prompt text changes — check `PROMPT_HASH` after the edit and, if it moved, that is a deliberate re-pin with the fixture pass to follow, not a silent one (see `docs/storybook.md` § "The passes"). If the hash moves, say so at Checkpoint A.

**Test:** in `validate.test.ts`, a `Select` with `options: ['', 'a']` is refused with the zod message; a `Segmented` likewise. And a short note in the brief renderer's neighbourhood is worth a glance: if an MTHDS enum can carry `""`, `renderInputBrief` should say so rather than let the model copy it into `options`. Read `src/generative/brief.ts` for how choices are rendered before deciding; a one-line filter there is fine if it is needed, and nothing if it is not.

## Commit 2 — the page carries the brand, and the scope memo is honest

### 2. The default registry throws when no `BrandProvider` is above it

**Where:** `src/generative/page.tsx:41` defaults `registry` to `generativeRegistry`; its `AppBar` (`product-registry.tsx:51`) calls `useBrand()`, which throws at `brand-context.tsx:30`. `GenerativePageProps` has no brand, the page provides none, and the documented snippet (`docs/generative-ui.md:73`) omits it. Every captured layout opens with an `AppBar` (the product rules require it), so a host copying the snippet gets a thrown render. The stories work only because `src/__stories__/generative/layout-page.tsx:61` wraps in `BrandProvider` — a requirement stated nowhere a host reads.

**Fix:**

- Add `brand?: BrandManifest` to `GenerativePageProps` with a doc comment: "The brand the product chrome renders — the app bar's logo pair and name, the web font. Required by this entry's own registry; a host registry without brand components may omit it." When present, `GenerativePage` wraps its tree in `<BrandProvider manifest={brand}>` itself.
- Keep `useBrand` throwing — a loud failure at the right place is a feature — but make the message name the cure: `useBrand: no brand in scope. Pass \`brand\` to GenerativePage, or wrap the tree in BrandProvider.`
- Add one sentence to `generativeRegistry`'s JSDoc in `product-registry.tsx`: its `AppBar` reads the brand, so the page it renders in needs one.
- Update the snippet in `docs/generative-ui.md` § "Rendering a page" to pass `brand={manifest}` and add a sentence after it saying which components need it and that a host bringing its own registry decides.
- Switch the story harness (`layout-page.tsx`) to the prop and drop its own wrapper, so the one documented path is the one every story exercises. The `brand.scope` class on the outer `div` stays; it is the token scope, not the manifest.

Do **not** make `brand` required: a host rendering a registry with no brand chrome should not have to invent a manifest.

**Test:** with the new jsdom project from commit 3 in place (or added here, whichever lands first), `GenerativePage` over a minimal spec whose root is an `AppBar` renders with `brand` and, without it, throws an error whose message contains `Pass \`brand\` to GenerativePage`. If commit 2 lands before the project exists, add the project in this commit instead; the plan does not care which commit carries it, only that the assertion exists.

### 7. `actions: { run: async () => {} }` is a dead no-op

**Where:** `product-registry.tsx:405`. Verified against `@json-render/react`'s `defineRegistry`: actions are kept only in the `handlers` factory and `executeAction` it returns; the `registry` object carries components only. `product-registry.tsx` destructures `{ registry }` and discards the rest, so this `run` is unreachable, and the real one is what `GenerativePage` passes as `JSONUIProvider handlers` (`page.tsx:51`).

**Fix:** delete the `actions` line. Add one sentence to the export's JSDoc: `run` is supplied by `GenerativePage` (or by a host's own `JSONUIProvider` handlers); the registry declares components only. Do **not** re-export the handlers factory — that would be a second, unwired way to do what the page already does. Confirm `defineRegistry`'s type accepts the call without `actions` (it is optional in the `.d.ts`).

### 13. `useMemo(() => scope, [four members])` freezes any future member

**Where:** `page.tsx:47`. The memo body returns the whole `scope` object while the dependency array names four members by hand; a fifth member added to `DescriptorScope` (public API, `registry.tsx:120`) would be frozen at its first value with no lint to notice (`react-hooks` is not configured here).

**Fix:** destructure and rebuild — `const { inputs, result, env, idPrefix } = scope; const stableScope = React.useMemo(() => ({ inputs, result, env, idPrefix }), [inputs, result, env, idPrefix]);`. One honest note for the commit message: this becomes a *type* error for a future required member and merely legible for an optional one; the literal naming every member is what a reader adding one will see. Keep the existing comment about why the memo exists.

## Commit 3 — the catalog controls mint unique ids

### 4. DOM ids minted from `props.name` alone collide

**Where:** `registry.tsx:283` (`AccessibleSelect`), `:685` (`Segmented`'s `labelId`), `:745` (`NumberInput`); `product-registry.tsx:325` (`BrandInput`), `:363` (`BrandTextarea`). Each builds `${idPrefix ?? 'gen'}-<kind>-${props.name}`. Inside a `repeat` — a shape `layoutFits` explicitly accepts as coverage (`layout-fits.test.ts:114`) — every row renders the same id, so clicking row three's label focuses row one's input and axe reports duplicate ids, which the Storybook a11y gate runs at error. Two controls sharing a `name` anywhere on a page collide the same way, and no validator rule forbids that.

**Why the fix already exists:** `src/generative/ui/shadcn.tsx:369` has `useControlId(name)` returning `jr-${name}-${React.useId()}`, with a long comment on why `useId` and not a counter, and every shadcn renderer in that file uses it. The five controls above predate it. Nothing anywhere depends on the `gen-select-…` scheme (grepped `src` and `docs`); `MthdsField`'s path-derived id (`domIdFor`, `registry.tsx:190`) is a different contract — the upload seam — and stays exactly as it is.

**Fix:** export `useControlId` from `ui/shadcn.tsx` and use it in all five controls. `idPrefix` is no longer part of those ids; it still governs the hatches, which is what its doc comment on `DescriptorScope` describes. Keep `name={props.name}` on the input elements.

**Test:** a new vitest project, because today `src/generative/**/*.test.ts` runs in node and a duplicate id is a DOM fact. Add to `vitest.config.ts` a `generative-dom` project — `environment: 'jsdom'`, `include: ['src/generative/**/*.test.tsx']`, the same `setupFiles` as the `react` project — and a `src/generative/__tests__/controls.test.tsx` that renders `GenerativePage` over a spec with a `NumberInput` inside a `repeat` over a two-item list and asserts every `id` in the document is unique and each label's `htmlFor` points at its own input. The same file is where item 2's brand assertion lives. Update the `vitest.config.ts` header at the same time (item 9 below), since it now describes one more project.

## Commit 4 — hygiene

### 10. RFC 6901 escaping is written three times

**Where:** `src/generative/stream.ts:114` (`escapePointer`) duplicates `paths.ts:24` (`escapeSegment`); the inline unescape in `reachesPrototype` (`stream.ts:78`) duplicates `paths.ts:28` (`unescapeSegment`). One of the three copies is the prototype-pollution guard, where a divergence in unescape order would silently reopen the hole the module exists to close.

**Fix:** export `escapeSegment` and `unescapeSegment` from `paths.ts` (module-level export, **not** from `index.ts` — the public API is the three index files) and import them in `stream.ts`; delete the local copies. `stream.test.ts` already covers both directions.

### 11. Only `Heading` guards a prototype-key prop lookup

**Where:** `ui/shadcn.tsx:224` uses `Object.hasOwn(HEADING, props.level)`; `:242` (`TEXT`), `:268` (`AVATAR_SIZE`), `:295` (`BADGE`), `:321` (`ALERT`) and `registry.tsx:450` (`SPLIT_COLUMNS`) do the unguarded lookup. The blast radius is small — `variant: "constructor"` yields a function, which `cn` drops and a bare `className` gets a React warning for — and both gates already refuse the shape (a literal fails the zod enum, an expression is refused by `isClosedVocabulary`). But the reasoning that produced the `Heading` fix is identical, and consistency is cheaper than the question.

**Fix:** a three-line helper in `ui/shadcn.tsx` — `function pick<T>(table: Record<string, T>, key: string | null | undefined, fallback: string): T` returning `Object.hasOwn(table, key) ? table[key] : table[fallback]` — used by all six lookups, `Heading` included so there is one form. Export it for `registry.tsx`'s `Split`, or move `SPLIT_COLUMNS` beside the others; either is fine.

### 9. The `vitest.config.ts` header hardcodes a count

**Where:** `vitest.config.ts:10`, "Four suites, because …", which the branch made stale by adding the `generative` project, and which commit 3 makes staler. Workspace `CLAUDE.md` § "Writing Style" forbids the count.

**Fix:** rewrite the header without a number: the core in node, the controls in jsdom, the generative tree in both (node for its gates, jsdom for its controls — say why, as the existing text does for the first two), the stories in a browser, and the corpus as a fact about the repository's files. Fold this into commit 3 if that is where the new project lands.

### 8. The budget doc misstates what a form-only host pays

**Where:** `docs/dependency-budget.md:29`, "a host that only renders a form pays for none of it", and `:86`, "does a consumer of the other entry point have to install this? If yes, it does not belong in `dependencies`". Both contradict the doc's own § "The chunk graph is part of the budget", which says plainly that the manifest is installed by every consumer, that the budget is about *shipped* bytes, and that ajv is the precedent — and explains why an optional peer is the worse trade.

**Decision:** this is **not a packaging change**. json-render, zod and `@radix-ui/react-tabs` stay in `dependencies`, for the reason the doc already gives for ajv. Fix the two sentences: line 29 says *ships* none of it; § "Adding a dependency" asks whether a consumer of the other entry point has to *ship* this, and points at the chunk-graph section for the distinction. One more sentence there, if it reads naturally: what a consumer installs is the manifest's question, answered the same way for every dependency in the table.

## Changelog

The entry is unreleased, so the `## [Unreleased]` section already describes what `./generative` does; these fixes change what it does, and the section is **folded, not appended**. Specifically: the sentence about `layoutFits` reading every form the prompt teaches gains a repeat's `statePath`; the sentence about scratch state gains "bound or read"; the validator's list of refusals gains the `Workspace` child count and the non-empty option; and the "Rendering a page" paragraph, if the changelog has one, gains `brand`. No `### Fixed` heading — nothing here was ever released to be fixed.

## What the review found and this plan declines

Nothing. Every finding was either confirmed as written or corrected in its remedy (item 12's fix moves upstream of the renderer; item 8's is a doc edit rather than a manifest change; item 13's type-error claim is narrowed). The reviewer's finding on the review itself — that `mthds`-style install-weight reasoning should apply to the four new dependencies — is answered by the existing chunk-graph section, and the doc edit in item 8 is what makes that answer findable.

## Record

Fill in at the checkpoints: the SHA of each commit, whether `PROMPT_HASH` moved under item 12 and what followed if it did, and the bot rounds after the push.

### Pause 1 — 2026-09-05, after commit 3

**State.** Three of the four commits are on `feature/Generative-entry`, the tree is clean, and nothing is pushed yet. Each commit left `make check` green and the five non-browser vitest projects green (`core`, `react`, `generative`, `generative-dom`, `corpus`); the `storybook` browser project has **not** been run this session and is part of Checkpoint B.

| Commit | SHA | Items |
|---|---|---|
| 1. The gates agree with their own documentation | `49c7b33` | 1, 3, 5, 6, 12 |
| 2. The page carries the brand, and the registry states what it does not do | `d322868` | 2, 7, 13, plus the `generative-dom` vitest project and item 9's header rewrite |
| 3. The catalog controls mint unique ids | `21a174c` | 4 |
| 4. The escape is spelled once, and every closed map is read one way | `45b1332` | 8, 10, 11 |

**Checkpoint A.** Seventeen assertions were red before commit 1: three of the five malformed shapes threw inside `layoutProblems` (`children: 5`, a null element, no `elements` map) and the two that the walk survives (`repeat: null`, `props: 5`) were already refused, by coverage, which is why the table's descriptor carries a required input. The repeat, bound-path, `Workspace`, empty-option and brief assertions were all red. `PROMPT_HASH` **did not move**: `.min(1)` on the option definitions changes no rendered prompt text, so no fixture pass followed. The corpus test accepts every captured layout after items 3, 5 and 12.

**Where the plan and the code disagreed, and what was done.**

- **Item 7.** json-render's `actions` is not optional for a catalog that declares an action — `CatalogHasActions<C>` makes it required, and deleting the line is a type error. The no-op is gone as asked; the absence is stated through the call's own parameter type (`Parameters<typeof defineRegistry<typeof catalog>>[1]`, named `RegistryOptions` in `product-registry.tsx`) with the reason beside it. If a reader dislikes the cast, the alternative is keeping a handler the review called dead, which is the worse reading.
- **Item 2.** A host without a brand never got a thrown render. json-render wraps every element in `ElementErrorBoundary`, which catches the throw, logs it to the console and renders `null`, so the app bar was simply missing — quieter than the review said. The fix is unchanged; the jsdom test asserts what actually happens (no banner, and an `Error` whose message names the cure among the console reports), and the prop doc, the guide and the changelog say the same.
- **Item 12's brief note.** The standard puts no floor on a choice (`choices: list[str]` in pipelex's structure blueprint), so an enum can carry `""`. `isDelegatedInput` now marks such an enum delegated, with `src/generative/__tests__/brief.test.ts` pinning it, so the projection, the brief and the validator keep agreeing on which inputs the kernel renders.
- **Item 9** landed in commit 2 rather than 3, because the jsdom project was needed for item 2's assertion first — the plan allowed either.

**Kickoff for the next session:** `cd _mthds-form--generative-entry && ledger claim L-260904-c6d660 --renew`, read this block, then do commit 4 — items 8, 10 and 11, in "Commit 4 — hygiene" above. Two notes for it: for item 11, apply `pick` to `SPLIT_GAP` as well as `SPLIT_COLUMNS`, since it is the same closed-map lookup; for item 10, `paths.ts` already exports `repeatListPathOf` beside `repeatBasePathOf` (added by commit 1 for item 3), so the two escape helpers go beside those as module exports, not in `index.ts`. Then Checkpoint B in full: `make check`, `make test` (this is the first run of the `storybook` browser project since the changes — the story harness now passes `brand` as a prop, and the `Select` fallback is gone), `make all`, push, `@codex review` and `@greptileai review` as separate comments on PR #21, and the second-round bar from `CLAUDE.md`. Add commit 4's SHA to the table above and commit this document with it.

### Pause 2 — 2026-09-05, after commit 4 and Checkpoint B

**State.** All four commits are on `feature/Generative-entry`; the table above names them. Commit 4 left the full gate green in the order the checkpoint asks: `make check`, then `make all`, which ran every vitest project — including the `storybook` browser project, its first run since the story harness switched to the `brand` prop and the `Select` fallback went — then the build and `make assert-bundle`. The second review round was requested on PR #21 with `@codex review` and `@greptileai review`, each as its own comment, after the push; the second-round bar from `CLAUDE.md` applies to what comes back.

**Where the plan and the code disagreed, and what was done.**

- **Item 11 grew by four maps and a spelling.** The review named six lookups; the same file held four more maps of the identical shape — `Stack`'s gap, align and justify, `Grid`'s gap (the same map as the stack's) and `Button`'s variant — and guarding six of ten sites would have left standing the question item 11 exists to close, so all of them go through the helper. It is a pair rather than one function: `pickKey` for the two renderers that need the key itself (`Heading`'s tag, `Alert`'s role) and `pick` for the rest, typed so the fallback must be one of the map's own keys. That typing is why the `Record<string, string>` annotations came off the tables — their keys are literal now, and `Stack`'s `keyof typeof GAP` props narrowed to the real union as a side effect. The read inside is `hasOwnProp` rather than `Object.hasOwn`: `src/core/own-property.ts` records that `Object.hasOwn` is ES2022, past the package's ES2020 target, and the three other `Object.hasOwn` outside the kernel (`validate.ts`'s child-count table from commit 1, `state.ts`'s payload bridge, `src/react/utils.ts`'s `isDeepEqual`) took the same spelling in the same commit. None of those is public, so there is no changelog line.
- **Item 11 gained a test the plan did not ask for.** `controls.test.tsx` pins `pick` and `pickKey` against prototype names, and renders a heading and an alert keyed by `constructor` to assert the `h2` and `status` fallbacks. The rendered half discriminates for the heading — a bare `props.level` would mint a `<constructor>` tag — and merely pins the alert, since `cn` already dropped the function a bare lookup returned.
- **Items 8 and 10 landed as written.** No changelog fold for commit 4: nothing in it changes what goes over the wire or what the docs promise.

**What the second round returns goes here**, with the same rule as the first: fixed with the SHA, or deferred with the path.
