# The generative layer

`@pipelex/mthds-form/generative` renders a **layout**: a data file, written once for a method, that says how that method's page should look. It is the third entry point, it is optional, and a host that never imports it pays nothing for it.

The reason it is a separate entry rather than a feature of `./react` is the [dependency budget](dependency-budget.md): a layout is compiled and validated, which costs json-render and zod, and a host rendering an ordinary form should not carry either.

## Three artifacts, and what each is allowed to say

| Artifact           | Who makes it                             | What it states                                                               |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------------------- |
| The **descriptor** | this package's kernel, from the method   | what every input and result field _is_ — kind, requiredness, bounds, choices |
| The **layout**     | a model, once per method version         | which path goes where on the page, in what component, with what copy         |
| The **state**      | the person filling the form, and the run | two JSON trees, `/inputs` and `/result`                                      |

The line between the first two is the package's first rule, and it is the whole design: **a layout names a path and nothing more.** It does not restate a field's kind, its requiredness, its enum, or its bounds — it says "put `/inputs/request/city` in an `Input` labelled City, in the second section". Everything a page needs to _know_ still comes from the descriptor, derived fresh from the method every time it is read. That is what makes a layout safe to store: it cannot go out of date about facts it never stated.

Nothing here calls a model. The two things that do — producing a layout, and running the method — are the host's, on either side of this seam.

## The wire format

A layout arrives as **JSONL**: one RFC-6902 JSON patch per line, root first and parents before children, so a renderer can paint a partial tree at every line while a model is still streaming. A stored layout is that text exactly as it was emitted; a host compiles it before it validates it.

```ts
import { specFromJsonl, specToJsonl, jsonlLines } from '@pipelex/mthds-form/generative';

const spec = specFromJsonl(storedLayout);
```

Keeping the JSONL rather than only the compiled spec is deliberate: it is the producer's actual output, and it is what a regression is read against.

## The two checks, and the fallback rule

A host runs both before it renders, and falls back to the kernel's plain form if either says no.

```ts
import {
  PROMPT_HASH,
  formatProblems,
  layoutFits,
  validateAgainstCatalog,
  catalog,
} from '@pipelex/mthds-form/generative';
```

**`validateAgainstCatalog(spec, catalog)`** asks whether the layout is written in the vocabulary this entry renders: every element type known, every prop declared and correctly typed, one panel per tab or step, no heading level skipped. It answers with problems, not exceptions — `formatProblems` renders them for a log.

**`layoutFits(descriptor, spec)`** asks whether the layout still fits the method, in two directions:

- _Staleness_ — every path the layout **mentions** is a path the descriptor still has. A method renames an input and a delegated path resolves to nothing while a bound path writes into a corner of the state the run never reads. Neither fails loudly on its own.
- _Coverage_ — every path the descriptor **requires** is one the layout offers somewhere: bound to a control, laid out as a repeat, or delegated at that path or an ancestor of it. A layout that simply omits a required input is not stale and validates perfectly; it renders a page the person cannot complete, and the run gate then refuses the run for an input with no box on screen. A structure counts as covered when what it _requires_ is covered, so a layout may still leave out an optional member.

The **prompt hash** is the third condition and the cheapest. `PROMPT_HASH` is the first twelve hex digits of the SHA-256 of the catalog prompt this entry ships; every stored layout records the hash it was produced against. A layout whose hash is not this one is not rendered, because the vocabulary it was written in is no longer the vocabulary this entry renders. It is a pinned constant rather than a computation, so the entry stays importable from a browser and a host can compare it synchronously.

So the fallback rule, in full: **the kernel's plain form renders when there is no layout, a stale prompt hash, an invalid layout, `layoutFits` false, or a render error.** A produced page is an enhancement over a form that always works, never a replacement for one.

## The two escape hatches

A catalog cannot render everything a method can declare — a file upload, a date, a document, prose, markup. Rather than approximate them, a layout hands them back:

- **`MthdsField`** at an `/inputs/...` path renders the kernel's own control for that field.
- **`MthdsResult`** at a `/result/...` path renders the kernel's own read-only view of that subtree.

Each takes a `path` literal and nothing else. That is what keeps rule 1 intact: the hatch does not describe the field, it points at it, and the kernel reads the descriptor as it always does. Inside a repeat the path is relative to the item, which is how one subtree of every item is delegated.

## Rendering a page

```tsx
import { GenerativePage, seedInputs, payloadToState } from '@pipelex/mthds-form/generative';

<GenerativePage
  spec={spec}
  store={store}
  scope={{ inputs: fields, env }}
  onRun={(state) => start(state)}
  loading={streaming}
/>;
```

The store is **controlled**: the host creates it, seeds it with `seedInputs` (which seeds only the defaults the method authored), and reads it back to start the run. So what the page writes is exactly what the kernel's readiness is computed from, and generation is nowhere in the request path. `payloadToState` loads what a run returned into the `/result` tree — a date arrives in the serializer's typed envelope and a plural result as `{items: [...]}`, and this is what turns both into what a layout binds to.

`scope` is what the escape hatches resolve against: `inputs` for an input page, `result` for a result page, plus the `env` the controls need (upload, disabled, a storage resolver) and an `idPrefix` when two pages share a screen.

## Producing a layout

The producer is outside this package, but the package ships what a producer needs.

The **catalog prompt** (`catalogPrompt()`) is the full system prompt: every component with its props, the rules, the design direction. The **brief** (`renderInputBrief`, `renderResultBrief`) is the per-method half — the paths, their kinds, which of them are delegated, what gates the run — rendered from the descriptor and nothing else.

The **designer method** ships as data at `@pipelex/mthds-form/ui-designer.mthds`: a `.mthds` bundle taking `catalog_rules`, `brief` and an optional `seed`, which a host hands to a runner. It ships as a file rather than as a string baked into a module because it is still being iterated on — a newer method is then a package upgrade rather than a code change — and because nothing in the entry may read it, which is what keeps the entry importable from a browser.

```ts
import { createRequire } from 'node:module';
const method = createRequire(import.meta.url).resolve('@pipelex/mthds-form/ui-designer.mthds');
```

A produced layout is stored with its provenance: who produced it, on which model, with which seed, against which prompt hash, from which brief. `SpecFixture` is that record's shape, and `fixtureLabel` renders it — deliberately by **what made the page**, never by a role like "authored" or "generated".

## Where the corpus lives

The layouts in this repo are real: produced by the designer method through the real CLI over briefs rendered from real methods, validated on the way in, and committed with their provenance under `src/__stories__/_generated/<case>.specs.ts`. `make briefs` writes what a producer was handed; `make fixtures-specs` produces layouts; `--capture` takes in one another producer wrote, under the same discipline. None of them repairs a layout that does not validate — the repair is to the prompt, the method or the producer. See [storybook.md](storybook.md) § "The passes, and which of them cost anything".

`src/__stories__/__tests__/generative.test.ts` is what those layouts are for: every one of them is asked whether it still compiles from its own JSONL, validates against the catalog, fits its descriptor in both directions, and was produced against the prompt this entry ships.
