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

Compiling is the first thing that touches untrusted text, and it happens before either gate can return a verdict, so it defends itself rather than relying on one. `specFromJsonl` applies the patches a line at a time: a line whose path would walk onto a prototype is dropped — and so is one whose `from`, on a `copy` or a `move`, would, since the applier copies a reference rather than a clone and a later line can then reach the prototype through a perfectly ordinary path — and so is a line the patch applier refuses. What survives is a partial spec the two gates then judge on its merits — which is a verdict a host can act on, where a throw would have arrived instead of one.

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

**`validateAgainstCatalog(spec, catalog)`** asks whether the layout is written in the vocabulary this entry renders: every element type known, every prop declared and correctly typed, one panel per tab or step, exactly two children in a `Split` or a `Workspace` (their renderers lay out two and would drop a third in silence), no empty option in a choice (no dropdown row or pill can offer nothing, and the run gate would refuse whatever a renderer wrote in its place), no heading level skipped, every element reachable from the root, no element its own descendant, and the element tree no deeper than this entry renders. It answers with problems, not exceptions — `formatProblems` renders them for a log — and that holds for a spec malformed in ways json-render's own walk throws on, because a host calling this to decide whether rendering is safe has no use for an exception.

The depth cap is there for the same reason and is worth knowing about: every walk in the gate recurses, so without it a deep enough chain overflows the stack inside the check, and whether it does depends on the engine rather than on the layout. A stored artifact should get one verdict wherever it is checked, so the limit is the entry's rather than the stack's.

It also reads the `on` field, which says as much about a page as its props do. Every action a layout binds must be one the catalog or the runtime has, and every event it binds must be one the component's definition declares it emits — an action nothing handles, or an event nothing fires (`on.click` on a `Cta`, which emits `press`), renders a button that does nothing, and a page whose only call to action is dead validates perfectly otherwise, so nothing else would catch it. And a layout may **not write into `/inputs` or `/result`**: every destination a state-writing action names is refused there — `setState`'s, `pushState`'s and `removeState`'s `statePath`, but also the `statePath` `validateForm` writes its verdict to and the `clearStatePath` `pushState` empties after it appends — because those two trees are the host's: `/inputs` filled by the person through the controls and by `seedInputs`, `/result` by the run. A destination is judged as the runtime will read it, which supplies a missing leading slash rather than refusing the path, and it must be a literal, never an expression. A layout that could write a value into the run payload would be stating a value rather than naming a path, which is rule 1 inverted. Scratch state of the layout's own, at any other path, is its business.

**`layoutFits(descriptor, spec)`** asks whether the layout still fits the method, in two directions:

- _Staleness_ — every path the layout **mentions** is a path the descriptor still has. A method renames an input and a delegated path resolves to nothing while a bound path writes into a corner of the state the run never reads. Neither fails loudly on its own. Mentioning covers every form the prompt teaches, not just the binding: the `path` of a hatch, `{ "$bindState": … }`, `{ "$state": … }`, the condition inside a `$cond`, the interpolations in a `$template`, the element's own top-level `visible` condition, the list a `repeat` lays out — resolved through the repeats above it when it is written relative — and, inside a repeat, the item-relative `{ "$item": … }` and `{ "$bindItem": … }`, resolved against the repeat's list the same way, so a renamed member of a repeated item is as stale as a renamed input and a `$bindItem` under `/result` is as refused as a `$bindState` there; one outside any repeat resolves to nothing and is refused as such. The `visible` one is why the list matters — a `visible` comparing against a path the method no longer has never holds, so it hides its element for good, and a required input bound inside it still counts as offered while nobody can see it. The `repeat` one is the same silence on a result page: a repeat over a list the method renamed renders nothing, and there is no coverage on that side to miss it. Only paths under the tree the descriptor owns are asked about, bound or read; a layout's own scratch state — a `Switch` bound to `/ui/showDetails` to drive a `visible` condition, say — is its business. The one binding no page may make is into `/result`, which the run fills: `layoutFits` refuses it as the validator refuses a `setState` there.
- _Coverage_ — every path the descriptor **requires** is one the layout offers somewhere: bound to a control, laid out as a repeat, or delegated at that path or an ancestor of it. A layout that simply omits a required input is not stale and validates perfectly; it renders a page the person cannot complete, and the run gate then refuses the run for an input with no box on screen. A structure counts as covered when what it _requires_ is covered, so a layout may still leave out an optional member.

Like the validator, it answers with problems and never throws, whatever shape the layout arrived in: a malformed spec is one line naming what the walk tripped on. The two are exported separately and a host may run them in either order, so neither assumes the other refused the shape first.

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
  brand={manifest}
  onRun={(state) => start(state)}
  loading={streaming}
/>;
```

`brand` is the manifest the product chrome renders — the app bar's logo pair and name, the web font — and this entry's own registry needs one, because every product page opens with an `AppBar` and that component reads the brand in scope. Without one it throws, and what a host sees is quieter than a thrown render: json-render wraps each element in a boundary that catches the throw, so the bar is simply missing from the page, with the cure named in the error the console reports. The page puts the manifest in scope itself when it is given one; a host may instead wrap the tree in `BrandProvider`, and a host rendering a registry of its own with no brand components may pass nothing.

The store is **controlled**: the host creates it, seeds it with `seedInputs` (which seeds only the defaults the method authored), and reads it back to start the run. So what the page writes is exactly what the kernel's readiness is computed from, and generation is nowhere in the request path. `onRun` may be an inline closure over the host's own state, as above: the page calls whichever one the latest render passed, over whichever store it passed — json-render registers its handlers once at mount, so the page keeps its one handler stable and routes it to the current pair itself. `payloadToState` loads what a run returned into the `/result` tree — a date arrives in the serializer's typed envelope and a plural result as `{items: [...]}`, and this is what turns both into what a layout binds to.

`scope` is what the escape hatches resolve against: `inputs` for an input page, `result` for a result page, plus the `env` the controls need (upload, disabled, a storage resolver) and an `idPrefix` when two pages share a screen.

### Uploads, which arrive by a different id here

`env.onDropFile` is handed the DOM id of the field the file landed on, and on a generative page that id is not the dotted value path [the upload seam](upload-seam.md) describes for a plain form. `MthdsField` mints it from the store path it was given — `/inputs/request/city` becomes `gen-inputs-request-city`, with the `idPrefix` in front of it and the kernel's own `.`-joined suffix for a field nested inside the delegated one. `pathFromDomId` is the inverse, and it is what a host writes back through:

```ts
import { pathFromDomId } from '@pipelex/mthds-form/generative';

env = {
  onDropFile: (id, file) => {
    const path = pathFromDomId(idPrefix, id);
    if (path) upload(file).then((value) => store.set(path, value));
  },
};
```

Kept beside `domIdFor` in the same module so the two cannot drift, and exact for any name: the id escapes its own separator, so `/inputs/a-b` and `/inputs/a/b` do not mint the same one. That used to rest on an assumption about MTHDS names, which nothing in this package can enforce — a name reaches the descriptor from a JSON Schema property — and the cost of it being wrong was an upload written to a different, plausible-looking path with no error anywhere.

## Producing a layout

The producer is outside this package, but the package ships what a producer needs.

The **catalog prompt** (`catalogPrompt()`) is the full system prompt: every component with its props, the rules, the design direction. The **brief** (`renderInputBrief`, `renderResultBrief`) is the per-method half — the paths, their kinds, which of them are delegated, what gates the run — rendered from the descriptor and nothing else. An input is marked delegated when the catalog's own inputs cannot enter it: a file, a date, a list, and a choice that carries an empty option, since the standard puts no floor on a choice while the catalog refuses an empty one — a model told to list the brief's choices exactly would otherwise write a layout the validator refuses.

The **designer method** ships as data at `@pipelex/mthds-form/ui-designer.mthds`: a `.mthds` bundle taking `catalog_rules`, `brief` and an optional `seed`, which a host hands to a runner. It ships as a file rather than as a string baked into a module because it is still being iterated on — a newer method is then a package upgrade rather than a code change — and because nothing in the entry may read it, which is what keeps the entry importable from a browser.

```ts
import { createRequire } from 'node:module';
const method = createRequire(import.meta.url).resolve('@pipelex/mthds-form/ui-designer.mthds');
```

A produced layout is stored with its provenance: who produced it, on which model, with which seed, against which prompt hash, from which brief. `SpecFixture` is that record's shape, and `fixtureLabel` renders it — deliberately by **what made the page**, never by a role like "authored" or "generated".

## Where the corpus lives

The layouts in this repo are real: produced by the designer method through the real CLI over briefs rendered from real methods, validated on the way in, and committed with their provenance under `src/__stories__/_generated/<case>.specs.ts`. `make briefs` writes what a producer was handed; `make fixtures-specs` produces layouts; `--capture` takes in one another producer wrote, under the same discipline. None of them repairs a layout that does not validate — the repair is to the prompt, the method or the producer. See [storybook.md](storybook.md) § "The passes, and which of them cost anything".

`src/__stories__/__tests__/generative.test.ts` is what those layouts are for: every one of them is asked whether it still compiles from its own JSONL, validates against the catalog, fits its descriptor in both directions, and was produced against the prompt this entry ships.
