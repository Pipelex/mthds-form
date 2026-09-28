---
status: draft
item: L-260928-50baa2
---

# A saved file is named after the root once, not twice

A file in a result that states no name of its own is saved as `<baseName>-<place>`, where the place is the file's dotted path in the result with its dots turned into dashes. The place always begins with the root node's name, and the base name defaults to that same name, so the one image a pipe outputs saves as `output-output.png` and a figure inside a report saves as `report-report-figures-0.png`. This document records what the verification found, the rule that replaces the current one, and why the fix belongs in the kernel's naming rather than in the path or in a host.

## What the verification found

The item's account holds at `d378f38` (v0.12.0), and the defect is not only reachable: the suites pin it.

- `nameFor` in `src/core/save-plan.ts` builds the stem as `${safeName(base) || 'result'}-${file.path.replace(/\./g, '-')}`.
- `collectStuffFiles` in `src/core/stuff-files.ts` starts every path at `[field.name]`, the root node's name.
- `StuffViewer` renders `<ResultRoot baseName={baseName} path={[field.name]}>` with `baseName` defaulting to `downloadBaseName ?? named.name ?? 'result'`, a standalone `ResultField` renders `<ResultRoot baseName={props.field.name} path={[props.field.name]}>`, and the generative result hatch (`MthdsResult` in `src/generative/registry.tsx`) renders `<ResultRoot baseName={scope.result.name} path={[scope.result.name, …]}>`. On all three surfaces the first path segment is the root's name, and the base name stands for the root.
- The suites assert the doubled names as intended behaviour: `src/core/__tests__/save-plan.test.ts` expects `output-output.png` for a result that is one image and `memo-output.html` for a result that is one page; `src/react/__tests__/result-downloads.test.tsx` clicks `output-output-1-scan.pdf`; `src/generative/__tests__/controls.test.tsx` expects `report-report-figures-0-image.png`.

The doubling is also visible when a caller names the panel. The graph data panel in `@pipelex/mthds-ui` passes `name={stuff.name}`, which becomes the base name, while the path still starts at the descriptor's own root name, so a stuff called `portrait` produced by an output slot saves its image as `portrait-output.png`.

## The rule

**The base name stands for the root, so the root never appears a second time.** A file with no name of its own is named by the base name followed by its place *below* the root:

| The file | Before | After |
| --- | --- | --- |
| The result is one image, default base | `output-output.png` | `output.png` |
| The result is one page, base `memo` | `memo-output.html` | `memo.html` |
| A figure inside a report, default base | `report-report-figures-0.png` | `report-figures-0.png` |
| A figure, base `quarter` | `quarter-report-chart.png` | `quarter-chart.png` |
| A list of records rooted at `output` | `output-output-1-scan.pdf` | `output-1-scan.pdf` |
| An image in a generative repeat | `report-report-figures-0-image.png` | `report-figures-0-image.png` |
| A graph stuff named `portrait` | `portrait-output.png` | `portrait.png` |

This is already how the JSON copy is named: it is `<baseName>.json`, not `<baseName>-<root>.json`, because the base name is the name of the whole stuff. The fix makes a file's name agree with its neighbour's. A file whose place is the root itself, which is the one-file result, is therefore named by the base name alone, and a caller's `downloadBaseName` or `name` then names a one-file output outright.

**The drop is unconditional.** The item proposes dropping the root segment "when the base names that root". Read as a test of spelling (drop it only when `baseName === path[0]`), that would leave `generate_portrait-output.png` for a caller that passes `downloadBaseName="generate_portrait"`, which is exactly the name the item's own note wants to avoid, and it would make a file's name depend on whether two strings happen to match. The base name *always* names the root, whichever of the caller, the panel's `name` or the descriptor supplied it, so the root segment is always redundant and is always dropped.

## Where the fix goes

**In `nameFor`, and nowhere else.** Every surface that names a file reaches it through `planStuffSave` or `planFileSave`: the header's Download in `StuffViewer`, each file's own button in `ResultField` (standalone or inside a panel), the generative hatch, and a host that plans its own saves through the core entry. Changing the stem there fixes all of them at once, the graph data panel of `@pipelex/mthds-ui` included, and it keeps the promise that a file saves under one name whichever control saved it.

**The path keeps its root.** The alternative is to start `StuffFile.path` below the root. That would change a public field for a naming concern: `SaveFile.path` is documented as "where it sat in the result, dotted (`output.figures.0.image`); the root's name for the JSON copy", a host may key on it, and `planStuffSave`'s one-file test compares `found[0].path === field.name`. The path answers *where the file sat*; the name answers *what to call it*. Only the second is wrong.

**The first segment is the root by construction.** Both builders put the root's name first: `collectStuffFiles` starts at `[field.name]`, and `ResultRoot` is documented to receive the root name first, which `StuffViewer`, `ResultField` and the hatch all honour. A name segment is a field name or a list index, and a field name is an identifier that holds no dot, which the current stem already relies on when it turns every dot into a dash. So `nameFor` drops the path's first dotted segment and joins the rest. The comments on `ResultLocation` and `ResultRoot` state this invariant as the reason the root name comes first, since the naming now depends on it.

**Not in a host.** A host could pass a base name, but no host can remove a segment the kernel puts in the path, and a host fix would not reach the graph data panel, which names files through the kernel as well.

## What still holds

**Uniqueness.** Every file in one plan sits under the same root, so removing that common first segment keeps derived names distinct from one another. A derived name cannot take the JSON copy's name: a file below the root is `<base>-<place>…`, and the only file named `<base>.<ext>` is the one-file result, which is planned without a JSON copy whenever it can be saved. `distinctNames` still reserves the JSON copy's name for a name the payload states.

**One name per file across controls.** The file button reads the same `ResultLocation` path the descriptor walk builds and plans through the same `nameFor`, so the header's Download and a file's own button still agree, now on `output.png`.

**The generative hatch still needs its place.** Its comment warns that a `ResultField` left to root itself would save every entry of a repeat under one name. That remains true (the name would now be `image.png` rather than `image-image.png`), so the hatch keeps passing the subtree's whole place, and only the example in its comment changes.

## A consequence for callers

Because the base name now names the stuff outright, two panels given the *same* base name save their unnamed files under the same names: a console that passed one pipe's code to both an input panel and an output panel would save `generate_portrait.png` twice. The browser suffixes a duplicate download, but a host bridge writing into a folder would not. The `downloadBaseName` documentation says a base name should be distinct per stuff, as the default (the stuff's own name) already is.

## Noticed along the way

- **An unreachable fallback.** `FileDownloadButton` plans with `baseName: location?.baseName ?? file.path`, but it is only ever drawn for a file read inside a result location (`useStuffFile` returns nothing without one, and the page arm requires one), so the fallback never runs. If it did, it would name a file after its own dotted path. The fix makes the absence impossible rather than wrong: the button draws nothing without a location.
- **A stored file named without an extension.** `nameFor` takes a stored file's extension from its reference's URL path and never from the `mime_type` the payload states, so a reference with no extension would save as a bare `output`. The reported case carried `.png` on its reference, and nothing observed so far lacks one, so this is recorded rather than changed here.

## Release and reach

The change is a fix to a name, with no API, type or wire change, and nothing else is waiting under `## [Unreleased]`, so it ships as a patch, **v0.12.1**. `@pipelex/mthds-ui` depends on `@pipelex/mthds-form` at `^0.12.0` and its build keeps the kernel external, so its main entries pick up the patch without a release of their own; a consumer reaches it by refreshing its lockfile. The `pipelex-mcp` console, where the defect was reported, needs that refresh and a deploy, and it can then pass the executed pipe's code as `downloadBaseName` to save `generate_portrait.png`; that is its own item (L-260928-36c8f1), blocked by this one. `@pipelex/mthds-ui`'s standalone GraphViewer bundle inlines the kernel, so it carries the fix only from its next release, which no one needs to cut for this alone.
