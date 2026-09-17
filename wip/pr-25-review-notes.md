# PR #25 review follow-ups

The second review round against this branch, on [PR #25](https://github.com/Pipelex/mthds-form/pull/25) — the branch that makes the prose say `mthds` is an ordinary dependency rather than a peer. Three reviewers at profile 3 (cubic, Codex at `gpt-6-astra`/high, the official code-review at medium), **no findings between them**, which is what a diff carrying no executable change should produce: every source hunk is a comment or a docstring, the rest is `docs/`, the `bump-mthds` skill, two story doc blocks, and the `protocol-peer.test.ts` → `protocol-types.test.ts` rename with its assertions untouched.

One item was raised as an explicit non-finding, verified, and **deferred in full** under the round-2 bar.

## A sentence is duplicated verbatim in the published v0.6.0 changelog entry

Reported by the official code-review as a non-finding it declined to file, and independently verified here.

**Where:** `CHANGELOG.md:269`, the Storybook bullet of `## [v0.6.0]`. The sentence beginning **"Story fixtures are generated, never written"** and ending "so a fixture that drifts out of the standard's shape is a compile error." appears **twice, back to back, identical**. Because the file is not hard-wrapped, both copies sit on the one line, which is why `grep -c` on the phrase answers 1 and reading the line answers 2 — worth knowing for whoever picks this up.

**Why it was deferred rather than fixed.** It is pre-existing, cosmetic, and outside this branch's diff, so it clears none of round 2's bar: it is not a defect the previous pass introduced, and shipping without the fix costs nothing. Fixing it here would also widen a branch that is otherwise strictly about one wording change, and it edits a published release receipt — a `## [vX.Y.Z]` heading is a record of what was published, so a session correcting one should mean to.

**What fixing it looks like, when someone does.** Delete the second copy of the sentence. Nothing reads the changelog programmatically at that heading; the only gate near it is the release workflow's check that a `## [vX.Y.Z]` heading matches `package.json`, which reads the heading rather than the prose beneath it.
