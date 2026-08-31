# Storybook

`make storybook` (or `make st`) serves the stories on port 6006; `make build-storybook` produces the static build. The stories also run as tests — `make test` executes them in headless Chromium as a third vitest project — so a story is regression coverage whether or not anyone opens it.

## What it is for, and what it is not

The `src/react/__tests__/` suites already assert the DOM facts: an input has an accessible name, a button is disabled mid-upload, a value round-trips. Those are the assertions that belong in jsdom, and Storybook does not repeat them.

What nothing else in this repo can answer is whether a control **renders correctly, in both themes, across every input shape the standard can produce**. That is the question the stories exist for. Read a failing story as "this looks wrong", and a failing unit test as "this behaves wrong"; when the two disagree, the unit test is the contract.

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

`input_form` is keyed by `pipe_ref` and projected from a **pipe's declared input slots**. A structure on its own has no slots, so there is nothing to project. But every axis the catalog has to vary — presence marker, multiplicity, whether the slot gates the run — is a property of a *slot*, not of a structure, which is why `<case>.slots.json` exists and why it is not inferable from the bundle.

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

`presence` is `plain` | `optional` | `force`; `multiplicity` is `single` | `variable` | `fixed`. The generator rejects the pairings the standard forbids **at authoring time**, because the alternative is a parser error against a file the author never wrote: a marker may not ride a plural slot (`PipeInputContract` says a plural slot is always `plain`), and a fixed count is always at least two, since `Concept[1]` is a way of writing `Concept`.

### What regeneration needs

The sibling `../pipelex` checkout's venv, addressed through `PIPELEX_PYTHON` — `dump-validate-views.py` imports pipelex as a **library**, because no CLI surfaces these two views yet. That is dev-only: the emitted `.ts` files are committed, so `make storybook` and `make test` need nothing but node. A near-identical copy of that script lives in the graph-rendering sibling package; both retire when the agent CLI can emit the views itself.

### The guard

`src/__stories__/__tests__/corpus.test.ts` (the `corpus` vitest project, node) asserts the corpus and the generated tree describe the same set. It cannot assert the *content* is current — only a regeneration can — but a case added, renamed or removed without regenerating is the shape this actually fails as, and nothing else would notice.

## Where story code lives, and why it matters

Stories live in `src/__stories__/`, **outside both entry trees**. `tsup.config.ts` globs `src/core/*.ts` and `src/react/index.ts`, and `scripts/assert-bundle.mjs` walks what those entries reach — so a story helper placed inside either tree would enter a shipped chunk and count against the [dependency budget](dependency-budget.md). Keeping story code in its own directory is what keeps the bundle invariants meaningful.

Lint restates the two budget rules that must still hold for story code (`eslint.config.mjs`): the framework bans, and `mthds` staying types-only. The core-barrel rule deliberately does not apply — a story is a consumer, and a consumer imports from the entry point as published.
