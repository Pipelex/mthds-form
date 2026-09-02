# Storybook

`make storybook` (or `make st`) serves the stories on port 6006; `make build-storybook` produces the static build. The stories also run as tests — `make test` executes them in headless Chromium as a third vitest project — so a story is regression coverage whether or not anyone opens it.

## What it is for, and what it is not

The `src/react/__tests__/` suites already assert the DOM facts: an input has an accessible name, a button is disabled mid-upload, a value round-trips. Those are the assertions that belong in jsdom, and Storybook does not repeat them.

What nothing else in this repo can answer is whether a control **renders correctly, in both themes, across every input shape the standard can produce**. That is the question the stories exist for. Read a failing story as "this looks wrong", and a failing unit test as "this behaves wrong"; when the two disagree, the unit test is the contract.

## The sections

Three, mirroring what the package is:

| Section       | What is in it                                                                                                                                                                                              |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inputs**    | Every input kind in isolation (`Scalars`, `Files`, `Unknown`), the state axis on a representative concept (`Field States`), and composition — deep nesting, lists of objects, files in a list (`Nesting`). |
| **Outputs**   | A pipe's result, rendered read-only from its output descriptor: a scalar, a flat structure, a nested one, a plural result, and an absent one.                                                              |
| **Toolchain** | The pieces that need no descriptor — currently the concept pill across all nine categories.                                                                                                                |

Order is set explicitly in `.storybook/preview.tsx` (`options.storySort`), not left alphabetical.

**A story isolates one comparison, and its doc comment names what varies.** A canvas with three near-identical dropzones and no statement of the difference is not a comparison, it is a coincidence — that is what the first `Files/Image` story was, and it is the failure mode a fixture-driven catalog invites, because putting more slots on a pipe is free. Prefer several small carrier pipes over one that shows everything.

**A state story shows one slot.** `Uploading` on a three-slot form puts two idle dropzones beside the control the story is about, and a reader cannot tell which part of the canvas is the subject. So state stories render a single-slot carrier — `one_document`, `one_image` — and the multi-slot form stays for the stories whose subject _is_ the form. When a state needs isolating, add a single-slot pipe to the case's `.slots.json` rather than filtering fields in the story: the fixture stays the thing that decides what renders.

The state axis is factored **out** of the per-kind stories rather than multiplied into them: `Field States` walks one representative concept through defaults, the three presence markers, filled, invalid and disabled, and each kind's own file carries only the states where that kind behaves differently. Crossing every kind with every state produces a folder nobody can scan, which is the one thing the catalog exists not to be.

## Outputs

An output is a concept ref exactly like an input is, so its stories are driven by the same `RunField` — mapped by `buildResultField`, which delegates to the mapper `buildRunFields` uses and differs only in not stamping slot facts.

What differs is presentation: a result is **read, not edited**, so `ResultField` renders values with labels rather than controls with values. Rendering a result as a disabled form would say "you may not change this" where the truth is "this is what came back".

### What the corpus covers

A renderer that has only ever met one shape is a renderer nobody has tested, so the result pipes span the surface rather than repeat it: every native scalar (a wrapping content model and a multi-property one), a flat structure, one and **four** levels of nesting, a list long enough to scroll, and both file-bearing kinds.

Two of the carriers are not `PipeLLM`, and the language is why: a `PipeLLM` may not resolve to a concept containing images. So the image case is a `PipeImgGen` and the page case a `PipeExtract` over a committed PDF (`data/inputs/`) — which is what makes `native.Page[]`, the richest shape the standard defines, a real capture rather than an argument. Its tree is `list → object → object → prose + list of images + image`, and it is the case that proves `native.Page` needs no renderer arm of its own: it works by recursion into the arms that exist.

### The lists corpus

`data/structures/lists.mthds` is a second result case whose whole subject is **element shape**, because a list's layout is decided from its element's descriptor and from nothing else. One pipe per branch: scalars (chips), prose scalars (lines), a short record (a table), a twelve-column record (a table that scrolls), a record carrying prose (cards), a record carrying records that carry lists (cards containing tables containing chips), a document (rows) and an image (a gallery). The stories are `Outputs/Lists`.

It is a separate case rather than more pipes in `results` because the branches ARE the subject: a corpus that only ever met one of them proves nothing about the others, and the layout rules are the part most likely to be got wrong by someone who has only seen a two-row table.

The gallery pins an image model explicitly (`options = { model = "$gen-image-testing" }`): the deck's default image backend refuses more than one image per call, so an `Image[3]` output needs one that does not.

### Files, and the one payload the corpus cannot produce

`Outputs/Media` is the section for results carrying files, and it is the one place a story supplies its own payload. The reason is worth stating, because it is the exception that proves the rule rather than a corner cut.

A run's file-bearing results carry `pipelex-storage://` references, which resolve only through the host's own resolver. A browser looking at Storybook cannot fetch one — so a corpus payload would show grey tiles and a preview button that could not fire, which is a case the section already covers on purpose (`A storage reference → no preview`). What it could not show is the other case: what this looks like when a URL IS fetchable, which is where a host in production mostly lives.

So `data/inputs/` holds the served files — the corpus's own extraction PDF, and three real generated images downscaled to a size worth committing (the originals a run wrote are around two megabytes each). `.storybook/main.ts` serves that directory.

The **descriptor is still the corpus's own**, and that is the half that matters: `results.nested_media_result` is generated from `data/structures/results.mthds` like every other, so the kinds are the engine's. That pipe carries no `run` block and cannot — the language forbids a `PipeLLM` resolving to a concept containing images, and no other operator produces a structure — which is exactly why the payload is supplied and the descriptor is not.

### The three artifacts

Sourced differently, and all three generated:

- **The descriptor** is `output_form`, generated like every input fixture and off the same engine builders. It was a local simulation while the standard lacked the artifact; it is now a read. See [result-view.md](result-view.md).
- **The payload schema** rides on the output contract, beside the input schemas, where the standard puts it: `CONTRACTS[ref].output.json_schema`. It is the schema of the **payload**, not of a caller's argument, and that is what makes it usable — a `native.Text` result is `TextContent {text}` and a `Concept[]` result is `ListContent {items}`, so the renderer reads the wrapping property's NAME off it and unwraps by name. `buildResultField` **requires** it.
- **The payloads** are what the pipes actually returned, written by `make fixtures-runs` from real `pipelex run bundle` executions into `src/__stories__/_generated/<case>.payloads.ts`. A payload is the one artifact no projection can produce, and that is not ceremony: two shapes in these are invisible from every descriptor — a `date` arrives in the serializer's typed envelope `{date, __class__, __module__}`, and a plural payload is `{items: [...]}` rather than a bare array. Both were written wrong by hand before a real run corrected them.

The story assertions read their expected values **out of the payload they render** rather than naming them. A live model does not answer the same way twice — the sentiment case came back `neutral` on one sweep and `positive` on the next, both defensible — so a hard-coded string asserts the model's mood instead of the renderer, and fails on the next sweep for a reason nobody should have to investigate.

## What a file slot accepts

Not a wire fact. The descriptor states the kind is `document` or `image` and stops there, because which bytes a runtime can decode is a property of the runtime, not of the method. `src/core/file-formats.ts` holds the answer, and both the label under a dropzone and the filter it enforces read that one table, so they cannot disagree.

| Slot       | Accepts                                                           |
| ---------- | ----------------------------------------------------------------- |
| `document` | PDF, JPG, PNG — the extract model reads an image as a single page |
| `image`    | PNG, JPG, WEBP                                                    |

The asymmetry is real rather than an oversight: WEBP passes as an image and is refused as a document, which is what the extract gateway answers.

**The list was measured, not read off an enum**, and that distinction is the whole lesson of how it got wrong twice. There is no single list in the runtime to copy: what a slot accepts is `{"pdf","docx","pptx"} & set(model.inputs)` per model, and no shipped model declares `docx` or `pptx`. The header of `file-formats.ts` records the runs. A stale entry there is worse than none — it refuses a file the runtime would have taken.

## What the corpus cannot reach

Two gaps, both structural rather than oversights, and both better stated than quietly missing.

**Text and number constraints.** `minLength`, `maxLength`, `pattern` and numeric bounds are read from **pydantic metadata on a reflected Python structure class** (`MinLen`, `MaxLen`, `Gt`/`Ge`/`Lt`/`Le`), not from anything a `.mthds` structure can declare — `ConceptStructureBlueprint` has no such slots. So a structures-only corpus cannot produce a constrained `text` or a bounded `number`, and the catalog does not pretend otherwise. Covering them would mean a fixture whose concepts are backed by Python classes, which is a different corpus.

**The `unknown` kind.** It is the standard's escape hatch for a field kind **newer than the pinned `mthds` peer**, so by definition no bundle authored here can produce one — the peer would have to not know a kind it does know. `unknown.stories.tsx` simulates the drift instead of inventing a fixture: it takes a real generated descriptor, rewrites one node's `kind` to a value this version does not have, and runs it through `buildRunFields` like every other story. That exercises the actual degradation path — the total mapping in `derive.ts` falling through with the field's name intact — rather than asserting against a hand-written `RunField`.

## Every story renders in both themes

Dark mode is the `.dark` class convention ([theming.md](theming.md), Tailwind `darkMode: 'class'`). The `ThemePair` decorator in `.storybook/theme-pair.tsx` renders each story **twice, side by side** — one light pane, one `.dark` pane — and that is the default view rather than a toolbar toggle, because a toggle hides half the answer behind a click. The toolbar is still there for anyone who wants one pane full width.

Two consequences worth knowing before writing a story:

- **A `play` function sees the story twice.** Assert with `getAllByText(...)` and a length of two, not `getByText`, which throws on the second match.
- **The decorator's own chrome must clear the a11y bar too.** `a11y` runs at `test: 'error'` here (a consumer's Storybook can afford `todo`; this repo owns the controls). A violation in the decorator is reported against whichever story was running, so decorator chrome uses `--muted-foreground` at full opacity rather than a dimmed `--foreground` — the latter blends against the pane background to a colour that fails WCAG AA contrast at caption size.

## Styling: source, not the prebuilt sheet

`.storybook/preview.tsx` loads `src/styles/theme.css` and `src/styles/tailwind-entry.css`, and `.storybook/main.ts` runs the Tailwind plugin over them through an inline postcss pass.

This is deliberately **not** what a consumer's Storybook does. A consumer with no Tailwind build loads the prebuilt `dist/styles.css`; this repo has a Tailwind build, and pointing its own Storybook at the prebuilt artifact would defeat the purpose — a control styled with a utility that is not in the last built `styles.css` would render unstyled in the very Storybook meant to catch that.

The Tailwind plugin is declared inline in `viteFinal` rather than through a root `postcss.config.cjs`, because the Tailwind CLI behind `npm run build:css` would pick up a root postcss config too and run the plugin twice over the same entry.

Note that `tailwind.config.cjs` scans `src/react/**` only, and that stays true: story chrome uses inline styles over the theme tokens, never Tailwind utilities. Widening those content globs to cover story code would put utilities into a consumer's stylesheet that no control uses.

## Fixtures are generated, never written

**Never hand-write an `input_form` or a `pipe_io_contracts` entry.** A hand-authored one is self-consistent by construction, so nothing here could catch it getting the standard's field taxonomy subtly wrong — and a story built on it would then assert the wrong thing confidently. Every fixture in `src/__stories__/_generated/` is a projection of a real bundle, produced by the same builders the hosted `/validate` calls.

### What an author writes

Two files per case, in `data/structures/`:

```
<case>.mthds        concepts and structures ONLY - no [pipe.*] table
<case>.slots.json   the input SLOTS to project, grouped into carrier pipes
```

`make fixtures` (or `make fixtures ONLY=<case>`) turns them into `src/__stories__/_generated/<case>.ts`, exporting a `CONTRACTS` and an `INPUT_FORM` typed against `mthds/protocol`. They are **annotated, not cast** — a fixture that drifts out of the standard's shape is a compile error rather than a silent lie.

### Why the pipes are synthesized

`input_form` is keyed by `pipe_ref` and projected from a **pipe's declared input slots**. A structure on its own has no slots, so there is nothing to project. But every axis the catalog has to vary — presence marker, multiplicity, whether the slot gates the run — is a property of a _slot_, not of a structure, which is why `<case>.slots.json` exists and why it is not inferable from the bundle.

Making the author write the carrier pipe too would mean writing boilerplate with three non-obvious rules attached, each of which the engine **rejects** rather than ignores:

1. every declared input must be referenced in the prompt;
2. a `@slot` sigil must stand alone on its line (inline is `$slot`);
3. an optional slot must be referenced guarded, as `@?slot`.

None of that is interesting to a story. `synthesizeCarrier` owns it, and the guard in `corpus.test.ts` fails if an authored bundle declares a pipe anyway.

### The slot spec

```json
{
  "description": "shown in the generated module's header",
  "pipes": [
    {
      "code": "presence_axis",
      "slots": [
        { "name": "body", "concept": "Text" },
        { "name": "nickname", "concept": "Text", "presence": "optional" },
        { "name": "tags", "concept": "Tag", "multiplicity": "variable" },
        { "name": "corners", "concept": "Point", "multiplicity": "fixed", "itemCount": 4 }
      ]
    }
  ]
}
```

A pipe may also carry `output` (the concept its carrier resolves to, `Text` by default), `type` (the carrier's pipe type, `PipeLLM` by default), `prompt` (an authored prompt, for a carrier that must actually _do_ something when the payload pass runs it) and `run` (the input values that pass sends). A pipe with no slots is rejected **unless** it states its own prompt, which is the narrow exception that lets a case reach an operator taking no input at all.

`presence` is `plain` | `optional` | `force`; `multiplicity` is `single` | `variable` | `fixed`. The generator rejects the pairings the standard forbids **at authoring time**, because the alternative is a parser error against a file the author never wrote: a marker may not ride a plural slot (`PipeInputContract` says a plural slot is always `plain`), and a fixed count is always at least two, since `Concept[1]` is a way of writing `Concept`.

### Two passes, and only one of them costs anything

```
make fixtures        the DESCRIPTORS - what each pipe DECLARES   (offline, free)
make fixtures-runs   the PAYLOADS    - what running it produced  (real runs, billed)
```

They are separate targets and neither implies the other, because asking for descriptors must never silently spend inference budget and asking for payloads must never silently re-derive anything else.

The descriptor pass needs the sibling `../pipelex` checkout's venv **interpreter**, addressed through `PIPELEX_PYTHON` — `dump-validate-views.py` imports pipelex as a **library**, because no CLI surfaces these views yet. A near-identical copy of that script lives in the graph-rendering sibling package; both retire when the agent CLI can emit the views itself.

The payload pass needs the **CLI**, addressed through `PIPELEX_BIN`, plus working inference credentials (a gateway key in `~/.pipelex/.env`). It runs each pipe the way a user does and reads back the `main_stuff.json` the command wrote, so what a story renders is what the shipped command produces rather than what an in-process reimplementation of it produces. Each pass asserts only the executable it invokes, up front — a machine can have one without the other, and finding out halfway through a paid sweep is the wrong time.

A pipe is run only if its slot spec gives it a `run` block naming its input values (or, for a slotless operator like `PipeImgGen`, its own `prompt`). The one edit the generator makes to what came back is dropping a machine-local `file://` `public_url`: a run writes generated files under the working directory and reports the absolute path back, which names somebody's home directory, in an open-source repo, and resolves on no other machine. What remains is the durable `pipelex-storage://` reference — which is exactly what a host with no storage resolver sees.

Both passes are dev-only: the emitted `.ts` files are committed, so `make storybook` and `make test` need nothing but node.

### The guard

`src/__stories__/__tests__/corpus.test.ts` (the `corpus` vitest project, node) asserts the corpus and the generated tree describe the same set. It cannot assert the _content_ is current — only a regeneration can — but a case added, renamed or removed without regenerating is the shape this actually fails as, and nothing else would notice.

It carries three more that are about the output half specifically: every generated module exports an `OUTPUT_FORM`; every output contract states a `json_schema`, and it is an object rather than a bare array whatever the multiplicity; and no payload module carries a machine-local path. The **plural wrap** — a plural output described as a `list` — is pinned upstream now, in both client mirrors and in the engine that produces it, which is where a producer obligation belongs; it shipped wrong once here while the artifact was still simulated, describing a `LineItem[]` output as an `object`.

## Where story code lives, and why it matters

Stories live in `src/__stories__/`, **outside both entry trees**. `tsup.config.ts` globs `src/core/*.ts` and `src/react/index.ts`, and `scripts/assert-bundle.mjs` walks what those entries reach — so a story helper placed inside either tree would enter a shipped chunk and count against the [dependency budget](dependency-budget.md). Keeping story code in its own directory is what keeps the bundle invariants meaningful.

Lint restates the two budget rules that must still hold for story code (`eslint.config.mjs`): the framework bans, and `mthds` staying types-only. The core-barrel rule deliberately does not apply — a story is a consumer, and a consumer imports from the entry point as published.
