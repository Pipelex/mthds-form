---
status: active
item: L-260906-69a996
---

# The `feature/Improve-gen-ui` review — round one, and what it left open

**Written 2026-09-16.** The record of the first `/rev` pass on `feature/Improve-gen-ui` against `dev`, run at profile 4 with the bar at `open` over commit `81e6ecb`, and the trace for what it deferred. The pass itself is on the ledger item (`ledger review-round L-260906-69a996`); this note exists because a deferral with nowhere to chase is a dropped finding, and because the deferrals below were never verified — they rest on a reviewer's word, and whoever picks one up reads the code first.

## What ran

cubic and two Codex runs (review, then adversarial) as background processes, and the official code-review skill at `medium` in a subagent; one verifier subagent over everything the bar would fix. The Codex adversarial run approved with no findings and said it could not run vitest inside its sandbox, so its approval rests on reading alone. The verifier confirmed every finding it was given.

## Fixed, with the decision Louis took on 2026-09-16 to apply all of them

- `8a87858` — `layoutFits`: a list-taking prop reads a list path (an `AppBar` whose links read a structure passed both gates and rendered nothing; a text there threw), and a bare `${name}` in a `$template` resolves through the repeat above it as json-render resolves it, so a template showing a structure member or naming a member the item lost is caught the way an `$item` is. The staleness half of that was already on `dev`.
- `a57bead` — the validator reads what a component renders off the catalog's `renders` table (`COMPONENT_RENDERINGS`) and never off a component's name: a host catalog with neither a `Heading` nor a component that renders an h1 is no longer asked for one, a host `Card` that renders no heading is no longer refused as an h3, and a second `AppBar` or `Footer` is refused because the same table says they render the page's banner and contentinfo. Three reviewers raised the first half; one raised the landmarks.
- `99761e1` — the payload pass writes the case's module after every run rather than after the case, so a sweep that dies on one pipe keeps the runs before it on disk and `PIPE=<code>` has something to merge into; and a run with any unpriced record reports no cost rather than the sum of the rest.
- `71ff27b` — the `props-signature` docstring quotes signatures the function prints.

## Deferred, unverified

Each of these sorted as "real but not important" at the `open` bar and went to no verifier. The claim is the reviewer's; the pointer is where to start.

- **F — the one-h1 rule on a result page.** Claim: a result layout is hosted beside a `ResultPanel` that renders its own h2 on the host page, so an h1 inside it lands under an h2. To check: render a result story (`results.deep_result`, `results.nested_result`) and read the heading order of the whole document, host chrome included; axe's `heading-order` flags a jump of more than one level, not an h1 after an h2, so the gate may be silent either way. If the rule is wrong for result pages, the change is in `validate.ts` section 5 and in the method's rule 13, which moves the prompt hash.
- **H — the published bundle is one file.** Claim: the package ships `layout-design.mthds` as one file where a bundle is a directory's closure, so a second `.mthds` file beside it in `methods/` would not travel to a consumer. Latent while the bundle is one file; the place to look is `package.json`'s `files` and `exports` and the copy step in `tsup.config.ts`.
- **I — the extraction PDF's public URL has no preflight.** Claim: the payload pass addresses the extraction fixture by an external URL and starts a paid sweep without checking that the URL resolves. The place to look is `scripts/generate-fixtures.mjs`, where a bare path is already refused up front; a `HEAD` request before the sweep would be the same shape.
- **J — the binding chain has no depth cap.** Claim: `checkBinding` in `validate.ts` follows `onSuccess` and `onError` as far as they go with no bound. A parsed JSON tree holds no cycle, so this is a stack-depth question about a model emitting a chain thousands deep, and may be a guard against a state that cannot occur; the depth check at the top of `checkAgainstCatalog` covers the element tree and not the bindings.
- **K — the `Card` description speaks in the prescriptive voice.** Claim: the override in `components.ts` says "Use for forms/content boxes, NOT for page headers", where the catalog's own header says a description states what a component is and never where it must go. A wording change alone; deferred because any description edit moves `PROMPT_HASH` and re-captures every fixture, so it folds into the next method edit rather than costing a sweep on its own.

## Rejected

- **M — exports removed without a release note.** The `./generative` entry has never been published, so nothing outside this repo depended on them; a note would document a break nobody can experience.
