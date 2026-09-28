---
status: active
item: L-260928-50baa2
---

# Plan: a saved file is named after the root once

The design is [design.md](design.md). The work is one change in the kernel's naming, the tests and documents that describe it, and a patch release; the console that reported it follows under its own item. Work in the worktree `_mthds-form--file-name-repeats-root` on `fix/File-name-repeats-root`.

## Phase 1 — the kernel names a file below its root (L-260928-50baa2)

### The naming

- [x] `src/core/save-plan.ts`, `nameFor`: build the stem from the base name and the path's segments *after the first*, joined with dashes; when there are none, which is a file that is the whole result, the stem is the base name alone. Keep `safeName(base) || 'result'` and every other branch (the file's own `filename`, the `data:` extension rule) as they are.
- [x] `src/core/save-plan.ts`, the comments: `SaveFileCommon.name` (`report-output-figures-0-image.png` becomes `report-figures-0-image.png`), `SavePlanOptions.baseName` (it names the whole stuff, so a file below the root is `<baseName>-<place>` and a file that is the root is `<baseName>.<ext>`), and `nameFor`'s own comment (`report-report-attachments-2` becomes `report-attachments-2`, and say why the root segment is left out: the base name already stands for it, as it does in `<baseName>.json`).
- [x] `src/react/result-location.tsx`: state on `ResultLocation.path` and on `ResultRoot` that the first segment must be the root node's name because the saved name drops it, and replace the example `report-output-figures-0-image.png` with `report-figures-0-image.png`.
- [x] `src/react/result-field.tsx`, `FileDownloadButton`: return nothing when there is no `ResultLocation`, and plan with `location.baseName`, removing the unreachable `?? file.path` fallback.
- [x] `src/generative/registry.tsx`, `MthdsResult`: the comment's example of what goes wrong without the place becomes `image.png` rather than `image-image.png`. The code is unchanged.
- [x] `src/react/stuff-viewer.tsx`, `downloadBaseName`: say that the base name names the whole stuff, so a one-file result saves as `<baseName>.<ext>`, and that it should be distinct per stuff, since two panels given the same base name save their unnamed files under the same names.

### The tests

Update the assertions that pin the doubled name, and add the ones the report calls for. Read each failing diff before changing it: every change should be the root segment disappearing and nothing else.

- [x] `src/core/__tests__/save-plan.test.ts`: the one-image result is `output.png`, the one-page result with base `memo` is `memo.html`, the nested chart with base `quarter` is `quarter-chart.png`, the page with base `r` is `r-summary.html`. Add a case where the base name differs from the root's name (base `generate_portrait`, root `output`, one image) that expects `generate_portrait.png`, and a list-rooted case (`output.0`, `output.1`) that expects `output-0.png` and `output-1.png`. Check the `unavailable` names follow the same rule.
- [x] `src/react/__tests__/result-downloads.test.tsx`: `report-output-…` becomes `report-…` throughout, including the `downloadIncomplete` line and the per-file button labels, and the standalone `ResultField` case clicks `output-1-scan.pdf`. Add the reported case: a `StuffViewer` over a result that is one image, with no `name` and no `downloadBaseName`, where both the header's Download and the image's own button plan `output.png`; then the same with `name="portrait"` giving `portrait.png`.
- [x] `src/generative/__tests__/controls.test.tsx`: the repeat's buttons are `Download report-figures-0-image.png` and `Download report-figures-1-image.png`.
- [x] Search the stories and tests for any other derived name that begins with its root twice (a pattern like `-output-` or a base followed by its own root) and bring it along.

### The documents

- [x] `docs/result-view.md`, § "Saving a result": the naming paragraph says a file is named by the base name and its place below the root (`report-figures-1.png`), and a file that is the whole result by the base name alone (`output.png`), because the base name already stands for the root, as the JSON copy's name does. The per-file button paragraph's label example becomes `Download report-figures-0.png`, and the paragraph on the generative hatch still says why it passes its whole place.
- [x] `CHANGELOG.md`, under `## [Unreleased]`, `### Fixed`: a saved file no longer repeats the result's name. A result that is one image saved as `output-output.png` and now saves as `output.png`; a figure inside a report saved as `report-report-figures-0.png` and now saves as `report-figures-0.png`. A caller's `downloadBaseName` or `name` now names a one-file result outright. It applies to the header's Download, each file's own button, the generative result hatch and `planStuffSave`/`planFileSave`.

### Checkpoint 1

- [x] `make check` and the whole suite, then `make all`, which ends in `make assert-bundle` (this repo has no `agent-test` target, so `make all` ran the suite).
- [ ] `/rev`, at the depth it derives.
- [ ] Open the PR to `dev`, titled `fix/File-name-repeats-root · L-260928-50baa2`, its body two or three sentences and `Closes L-260928-50baa2`; merge and land with `/ledger-land --merge`.
- [ ] Record here the SHA the fix merged as, and any decision the review changed.

## Phase 2 — the fix is published as v0.12.1

- [ ] `/release` cuts v0.12.1: a patch, since the change is a fix to a name with no API, type or wire change. If anything else has landed under `## [Unreleased]` by then, let that decide the version instead.
- [ ] After the release PR merges and publishes, `/ledger-land` it, and record the published version here.

## Phase 3 — the console saves under the new names (L-260928-36c8f1, pipelex-mcp)

Not this repo's work, and tracked by its own item, which this item blocks. `@pipelex/mthds-ui` depends on the kernel at `^0.12.0` and keeps it external, so the console reaches v0.12.1 by refreshing its lockfile, with no `@pipelex/mthds-ui` release in between. Its item covers the refresh, the deploy, the measurement on claude.ai and ChatGPT that the saved file is `output.png`, and passing the executed pipe's code as `downloadBaseName` so the file is named after the pipe.

## Out of scope

- A stored file whose reference has no extension saves without one, since `nameFor` never derives an extension from the stated `mime_type`. Nothing observed lacks an extension; see the design's "Noticed along the way".
- `@pipelex/mthds-ui`'s standalone GraphViewer bundle inlines the kernel and picks the fix up at its next release, which is not cut for this alone.
