# Storybook

`make storybook` (or `make st`) serves the stories on port 6006; `make build-storybook` produces the static build. The stories also run as tests — `make test` executes them in headless Chromium as a third vitest project — so a story is regression coverage whether or not anyone opens it.

## What it is for, and what it is not

The `src/react/__tests__/` suites already assert the DOM facts: an input has an accessible name, a button is disabled mid-upload, a value round-trips. Those are the assertions that belong in jsdom, and Storybook does not repeat them.

What nothing else in this repo can answer is whether a control **renders correctly, in both themes, across every input shape the standard can produce**. That is the question the stories exist for. Read a failing story as "this looks wrong", and a failing unit test as "this behaves wrong"; when the two disagree, the unit test is the contract.

## The sections

Four — three mirroring what the package is, and one that is a study over it:

| Section        | What is in it                                                                                                                                                                                                                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inputs**     | Every input kind in isolation (`Scalars`, `Files`, `Unknown`), the state axis on a representative concept (`Field States`), and composition — deep nesting, lists of objects, files in a list (`Nesting`).                                                                                                                                                                   |
| **Outputs**    | A pipe's result, rendered read-only from its output descriptor: a scalar, a flat structure, a nested one, a plural result, and an absent one.                                                                                                                                                                                                                                |
| **Toolchain**  | The pieces that need no descriptor — currently the concept pill across all nine categories.                                                                                                                                                                                                                                                                                  |
| **Generative** | A study, shipping nothing: four heroes, each rendered by the kernel's own view, by a deterministic projection into a json-render catalog, and by every producer of a spec — the designer method on named models, Claude Code subagents, the session writing by hand — each story titled with what made it; plus a streamed replay. See [generative-ui.md](generative-ui.md). |

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

`.storybook/preview.tsx` loads `src/styles/theme.css` and `.storybook/tailwind.css`, and `.storybook/main.ts` compiles the latter with the `@tailwindcss/vite` plugin.

This is deliberately **not** what a consumer's Storybook does. A consumer with no Tailwind build loads the prebuilt `dist/styles.css`; this repo has a Tailwind build, and pointing its own Storybook at the prebuilt artifact would defeat the purpose — a control styled with a utility that is not in the last built `styles.css` would render unstyled in the very Storybook meant to catch that.

`.storybook/tailwind.css` is a superset entry: it imports the package's own `src/styles/tailwind-entry.css` and adds `@source` directives for the story tree. The package's entry scans `src/react` only, through `source(none)` and one `@source`, so the shipped sheet carries nothing a control does not use; widening the scan to story code happens in this file, which ships nowhere. Story chrome still uses inline styles over the theme tokens rather than utilities, so that it cannot be mistaken for a control.

## Fixtures are generated, never written

**Never hand-write an `input_form` or a `pipe_io_contracts` entry.** A hand-authored one is self-consistent by construction, so nothing here could catch it getting the standard's field taxonomy subtly wrong — and a story built on it would then assert the wrong thing confidently. Every fixture in `src/__stories__/_generated/` is a projection of a real bundle, produced by the same builders the hosted `/validate` calls.

### What an author writes

Two files per case, in `data/structures/`:

```
<case>.mthds        concepts and structures ONLY - no [pipe.*] table
<case>.slots.json   the input SLOTS to project, grouped into carrier pipes
```

`make fixtures` (or `make fixtures ONLY=<case>`) turns them into `src/__stories__/_generated/<case>.ts`, exporting a `CONTRACTS` and an `INPUT_FORM` typed against `mthds/protocol`. They are **annotated, not cast** — a fixture that drifts out of the standard's shape is a compile error rather than a silent lie.

### The other kind of case: an authored method

A structures case exists to vary the axes of a slot, which is why its carriers are synthesized. The other thing a story has to be read on is a method somebody actually wrote, whose pipes are not ours to synthesize — and that is a different kind of case, in `data/methods/<case>/`:

```
bundle.mthds        the author's bundle, VERBATIM past a header naming the origin and the licence
case.json           the origin URL, the licence, a title, the hero pipes, the example's inputs file
inputs.json         the example's own inputs, with its files beside it
```

The generator discovers a case by its `case.json`, checks that the header carries the origin and that every hero is a pipe of the bundle, loads the bundle as it is, and projects it through the same builders into the same module shape, plus two exports no validate artifact carries: `PIPE_DESCRIPTIONS`, each pipe's `description` as the author wrote it, and `DOMAIN_DESCRIPTION`. Those are what the generative study's brief opens with for such a case, because a host has them too and nothing of ours should stand in for an author's words. The committed cases are examples from the public Pipelex cookbook (MIT), each chosen for the shape of its inputs and its result; nothing about them is synthesized, and the corpus test checks the provenance of each.

A bundle that imports a method package by address (`github.com/Pipelex/methods/documents`) needs the package on disk: pipelex finds one by walking up from the bundle's path to a `.mthds/methods/` directory, which is how the cookbook satisfies its own imports. Such packages are vendored under `data/methods/.mthds/methods/`, copied as the cookbook carries them, so a case loads here exactly as it loads there, on any machine, with nothing fetched and nothing read from a global install. That directory is not a case: a directory under `data/methods/` is a case only when it carries a `case.json`.

The projection script boots pipelex with the model specs loaded and inference off. Inference off leaves only the local extractors in the deck, and the loader checks a pipe's pinned model handle at load time, so an authored method that pins an image model would fail to load before any builder ran; the specs come from the cached remote config, and nothing is called.

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

### Three passes, and only two of them cost anything

```
make fixtures        the DESCRIPTORS - what each pipe DECLARES     (offline, free)
make fixtures-runs   the PAYLOADS    - what running it produced    (real runs, billed)
make fixtures-specs  the SPECS       - what a model laid out for it (real runs, billed)
```

They are separate targets and neither implies the other, because asking for descriptors must never silently spend inference budget and asking for payloads must never silently re-derive anything else.

The descriptor pass needs the sibling `../pipelex` checkout's venv **interpreter**, addressed through `PIPELEX_PYTHON` — `dump-validate-views.py` imports pipelex as a **library**, because no CLI surfaces these views yet. A near-identical copy of that script lives in the graph-rendering sibling package; both retire when the agent CLI can emit the views itself.

The payload pass needs the **CLI**, addressed through `PIPELEX_BIN`, plus working inference credentials (a gateway key in `~/.pipelex/.env`). It runs each pipe the way a user does and reads back the `main_stuff.json` the command wrote, so what a story renders is what the shipped command produces rather than what an in-process reimplementation of it produces. Each pass asserts only the executable it invokes, up front — a machine can have one without the other, and finding out halfway through a paid sweep is the wrong time.

A pipe is run only if its slot spec gives it a `run` block naming its input values (or, for a slotless operator like `PipeImgGen`, its own `prompt`). The one edit the generator makes to what came back is dropping a machine-local `file://` `public_url`: a run writes generated files under the working directory and reports the absolute path back, which names somebody's home directory, in an open-source repo, and resolves on no other machine. What remains is the durable `pipelex-storage://` reference — which is exactly what a host with no storage resolver sees.

The specs pass is the generative study's, and it is documented with the study in [generative-ui.md](generative-ui.md): for each hero it renders a brief from the committed descriptors and payloads (`make briefs` writes the same briefs under `wip/generative-ui/briefs/`, prompt and hash included, as the record of what the model was handed), runs the designer method through the CLI, validates what came back against the catalog and writes `src/__stories__/_generated/<case>.specs.ts` with the model, the date and the prompt hash. `ONLY=<pipe code>` narrows it to one hero and `MODEL=<id>` overrides the method's pin. A spec that does not validate is kept beside its brief and fails the pass; the fix is to the method or the brief, never to the fixture. `CATALOG=brand` hands the method the brand study's product-page catalog instead: its prompt is a different text with its own hash, `make briefs` writes the brief the method was handed as `<pipeRef>.brand.md` beside the base one, the answer is validated against that catalog, and the fixtures go to `<case>.brand.specs.ts` with `catalog: 'brand'` on each, so nothing about the base corpus moves.

The brands pass, `make brands`, is the study's too and is documented with it: it validates every `data/brands/<brand>/<producer>/` against the brand contract, compiles the tokens through Terrazzo into a scoped stylesheet, and writes `src/__stories__/_generated/brands/` — one stylesheet per brand and producer, an `index.css`, and `brands.ts` with every brand's provenance. Free and offline, like the descriptor pass; producing a brand's data is the separate, paid step. `src/__stories__/__tests__/brands.test.ts` is its guard, rebuilding every brand from its data and failing on a committed stylesheet the data no longer produces.

A brand's data is produced by `make brand-from-site BRAND=<slug> URL=<url>`, the producer's loop, documented with the study as well: it pulls the site's facts with `scripts/extract-site-facts.mjs`, runs the brand method through the real CLI, validates the answer exactly as `make brands` does with a bounded number of repair rounds, writes `data/brands/<brand>/<producer>/` beside the facts, and rebuilds. `ACCENT=` (with `ACCENT_DARK=` when the dark mode's differs), `LOGO_ON_LIGHT=` and `LOGO_ON_DARK=` state what the site does not show; a stated fact outranks a reading, the build checks the brand honours it, and the provenance records it. It costs inference and needs the CLI and credentials, like the payload and specs passes.

Every one of these passes is dev-only: the emitted files are committed, so `make storybook` and `make test` need nothing but node.

### The guard

`src/__stories__/__tests__/corpus.test.ts` (the `corpus` vitest project, node) asserts the corpus and the generated tree describe the same set. It cannot assert the _content_ is current — only a regeneration can — but a case added, renamed or removed without regenerating is the shape this actually fails as, and nothing else would notice.

It carries three more that are about the output half specifically: every generated module exports an `OUTPUT_FORM`; every output contract states a `json_schema`, and it is an object rather than a bare array whatever the multiplicity; and no payload module carries a machine-local path. The **plural wrap** — a plural output described as a `list` — is pinned upstream now, in both client mirrors and in the engine that produces it, which is where a producer obligation belongs; it shipped wrong once here while the artifact was still simulated, describing a `LineItem[]` output as an `object`.

### The generative heroes, and the provenance every spec carries

A hero is a group of adjacent stories over one fixture. The first two are fixed — the package's own form or result view, then the deterministic projection into the catalog, the floor — and every other story is one captured spec, titled with what produced it and never with a role: `Pipelex method · claude-4.8-opus`, `Claude Code subagent · claude-opus-5 · with a seed`, `Claude Code session, by hand · claude-fable-5-1`. The title is computed from the fixture's provenance by `fixtureLabel`, so a story cannot be named something its record does not say. A story file names the fixture ids it shows through `fixtureStories`; an id that has not been captured yet renders a notice that says so, so the rest of the hero stays reachable while a capture is still running, and the comparison viewer reads the titles off the built Storybook's index.

The method's specs are fixtures like a payload: produced by the pass, committed, never edited. A subagent's spec enters through the fixture script's `--capture` command under the same validation. The session's own are written by hand under `src/__stories__/generative/authored/`, typed against the catalog per component so a misnamed prop fails `tsc`, and each module header names the model, the date, the brief and the prompt hash — and records the choices, because the reading compares them with the models'. The corpus test validates every producer's spec exactly the same way and compares each hash with the current prompt: a prompt change regenerates the captured specs and re-reads the hand-written ones.

A brand story is the same arrangement one level up: `brandStories` names the producer ids a brand's story file shows, titles each by the brand's provenance through the same `fixtureLabel`, and renders a notice for a producer the build has not produced yet. Its `of` stories render the hand-written brand spec under each producer's tokens; its `join` stories render a captured layout under a producer's tokens, titled by what produced each half (`layout Pipelex method · claude-4.8-opus · brand catalog · tokens Pipelex method · claude-4.8-opus`), with a notice for a layout no pass has captured yet. The components are the same in every brand story; only the data differs.

An authored method has its own story file under `Generative/Methods/<title>` (`brand/method-*.stories.tsx`, sharing `method-page.tsx`): the same page, the same brand build, only the method differs. There is no hand-written layout for a method — nobody tuned one — so its stories are the joined ones alone, each a layout the designer method captured under tokens the brand method wrote. A hero of that kind states no summary; its brief opens with the pipe's description off `PIPE_DESCRIPTIONS`.

A method page can also RUN, from a served Storybook given a key:

```
STORYBOOK_PIPELEX_API_KEY=... STORYBOOK_PIPELEX_BASE_URL=https://api.pipelex.com make storybook
```

The key never reaches the client: `.storybook/main.ts` reads it, deletes it from the environment before Storybook copies `STORYBOOK_*` variables into `import.meta.env`, and adds a dev-server proxy from `/v1` to the API that injects the `Authorization` header itself, so the page calls its own origin. The one flag the client learns is `STORYBOOK_PIPELEX_RUN`, set for a served Storybook with a key and for nothing else — a static build has no proxy, and `make build-storybook` renders every method page and runs nothing, whatever the environment said; the test run, likewise. Each method story file reads its case's bundle (and any package it vendors under `.mthds/methods/`) as text through Vite's `?raw` import and hands the page a run target; the call to action starts the method through the runtime's SDK from `brand/method-run.ts`, the one file lint lets import it, and the brand `Workspace` paints the result under the work column through the kernel's viewer. Pressing run with no key says so on the receipt, whose run line otherwise carries the run id, the polls and the elapsed time, or the failure as the API stated it. The play never presses run.

The input heroes' stories show, under the page, a receipt a host never would — the `/inputs` tree and the kernel's readiness over it — and their play functions type into whichever control the producer chose, opening the step, tab or section that hides it, and read the value back off the receipt, which is the assertion that a bound input writes through to the tree the run receives. The brand plays share one core (`brand-plays.ts`) that takes the spec and a text target: the trip planner's target is its budget, chosen because it must arrive as a number; a method's is the first `text` or `prose` input its descriptor declares outside a list, found by `firstTextTarget`, and a method that declares none types nothing and has its receipt read as seeded, which is a fact about the method rather than a case the play invents around.

## Where story code lives, and why it matters

Stories live in `src/__stories__/`, **outside both entry trees**. `tsup.config.ts` globs `src/core/*.ts` and `src/react/index.ts`, and `scripts/assert-bundle.mjs` walks what those entries reach — so a story helper placed inside either tree would enter a shipped chunk and count against the [dependency budget](dependency-budget.md). Keeping story code in its own directory is what keeps the bundle invariants meaningful.

Lint restates the two budget rules that must still hold for story code (`eslint.config.mjs`): the framework bans, and `mthds` staying types-only. The core-barrel rule deliberately does not apply — a story is a consumer, and a consumer imports from the entry point as published. The runtime's SDK is admitted in exactly one named file, the generative study's run helper, so that a second import site is a lint error rather than a precedent.
