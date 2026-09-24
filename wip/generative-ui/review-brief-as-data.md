---
status: active
item: L-260917-af969e
---

# The `feature/Brief-as-data` review — round one, and what it left open

**Written 2026-09-17.** The record of the first `/rev` pass on `feature/Brief-as-data` against `dev`, run at profile 4 with the bar at `open` over commit `ffe5860`, and the trace for what it deferred. The pass itself is on the ledger item (`ledger review-round L-260917-af969e`); this note exists because a deferral with nowhere to chase is a dropped finding, and because the deferral below was never verified — it rests on a reviewer's word, and whoever picks it up reads the code first.

## What ran

cubic and two Codex runs (review, then adversarial) as background processes, and the official code-review skill at `medium` in a subagent; one verifier subagent over the four findings the bar would fix, and it confirmed all four — one of them by rendering a hand-built descriptor through the method's own template and replaying the two patches it listed, in both orders, through the branch's own state reducer.

## Fixed, with the decision Louis took on 2026-09-17 to apply all four

- `bda5fee` — the brief seeds the outermost default only, as `seedInputs` does: a member beneath a defaulted structure carries no `default` of its own in the data, so the "Defaults" list never hands a model two patches on one subtree, and its own default stays in its notes. Raised by all four reviewers, and reachable — an authored bundle cannot state a structure default, but a reflected Python structure can and the wire allows it. The same commit makes the relative walk label every list's item as the top-level walk does, which adds one "each item is a text" line to the deep result's record and stales no capture, since the prompt hash covers the method and the catalog and not the projection.
- `2d38ef6` — the specs pass writes a case's module after every hero rather than after the sweep, so a `die` mid-sweep keeps the pages already paid for; the loss was pre-existing at `compileOrDie` and the two `die`s of `designPage`, and the branch had added a third trigger. And the brief record's data now follows an HTML-comment line no rendered brief produces, read from the end of the file, where the bare `---` it used to be is a line a multi-line description can put in the brief — proved from a real bundle — cutting the record short and failing a paid run against the wrong text.

## Deferred, unverified

Sorted as "real but not important" at the `open` bar and went to no verifier. The claim is the reviewer's; the pointer is where to start.

- **The as-run dump lands in the record directory.** Claim: when a run's laid-out brief differs from the record, `scripts/generate-fixtures.mjs` writes `<pipeRef>.<id>.as-run.md` into `wip/generative-ui/briefs/`, the tracked directory the records live in, and nothing removes it — `make briefs` rewrites `<pipeRef>.md` only — so a later reader can mistake it for a record. The `.rejected.jsonl` that `compileOrDie` writes beside it has the same shape. To check: whether `.gitignore` covers either name (a first look found no entry); if not, the scratch directory, or a name the next `make briefs` cleans, is the place, and the message that names the file moves with it.

## Rejected

Nothing: every finding the reviewers raised was confirmed by the verifier or deferred as above.
