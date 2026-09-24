---
status: active
item: L-260917-daf8b6
---

# `methods/` is read as one closure — deferred from round 1 of `feature/Designer-method-not-data`

**Raised by cubic (P2) in the `/rev` pass of 2026-09-17 on `feature/Designer-method-not-data` at `3767de2`, verified the same day, and deferred rather than fixed.** This note is the trace that deferral owes. Nothing here is a defect in the branch; it is a hardening the layout invites and does not yet need.

## What was raised

`scripts/pipelex/layout-design.ts`'s `readBundle()` lists `methods/` recursively and submits every `.mthds` file it finds as `mthds_contents`, and `pinnedModel` and `withOverrides` read every one of them. cubic's remedy was a directory dedicated to this bundle, or an explicit dependency closure rooted at `layout-design.mthds`.

## What verification established

The mechanism is exactly as described, and it is deliberate — a bundle is one closure, so a file that imports a sibling needs that sibling submitted with it, and `scripts/codegen-check.mjs` lists the same directory with the same call so that the gate and the run agree on what the bundle is.

Two of the finding's specifics did not survive. Nothing is *rewritten*: `withOverrides` edits strings in memory, and `scripts/pipelex/` contains no write call at all. And conflicting model pins are not silent: `pinnedModel` throws `the designer method pins different models (…)` before a request leaves, so a second bundle pinning a different model aborts the run rather than corrupting it.

Most of the finding's weight rests on "silently", and for a committed file that word does not hold. The verifier reproduced the gate in a scratch tree rather than reasoning about it: with one bundle, `codegen-check` reports `2 artifact(s) current (crate 34f56f969c9c, engine 0.59.0)` and exits 0; after `printf 'domain = "unrelated"\n' > methods/unrelated.mthds`, it reports `stale-source: methods/unrelated.mthds — added to the bundle since the types were generated` and exits 1. `npm run codegen:check` is part of `make check`, which CI runs, so a second method committed into `methods/` cannot land quietly.

## Why it was deferred

There is no defect in the tree as it stands: `methods/` holds one file, and the case the finding describes is caught loudly by a gate that runs in CI. The remedy would restructure a layout that was specified deliberately, and moving the bundle into its own directory means moving the sidecar's `bundle_dir`, which is `/pipelex-integrate`'s to regenerate rather than a hand edit. Paying that to harden against a state a gate already refuses is the wrong trade today.

What was fixed instead, in the same pass, is the signposting: `readBundle`'s doc comment and `docs/generative-ui.md` now say what a second method in `methods/` does and which gate says so, so the red arrives as an instruction rather than a mystery.

## The residual, and what would settle it

One window is genuinely open, and neither the gate nor CI sees it: an **uncommitted** `.mthds` sitting in `methods/` during a local `make fixtures-specs` run is submitted with the bundle. It makes the payload larger, and it may draw a duplicate-domain or duplicate-pipe-code rejection from the engine — that last part is unverified, because confirming it costs a paid run.

Take this up when a second method actually arrives in `methods/`, which is the moment the gate will insist on it anyway. The shape then is a directory per method — `methods/layout-design/layout-design.mthds` — with `bundle_dir` moved by `/pipelex-integrate`. A filter by filename inside `readBundle()` is the wrong answer at any point: it would quietly drop the sibling a real closure needs, trading a loud gate for a silent one.
