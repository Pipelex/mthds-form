# The run gate

A run has two verdicts on it, and they are not the same call.

**In the browser**, `computeReadiness` decides whether the Run button is live. It answers one question — is every input the run needs actually there? — over the descriptors the form is rendering.

**On the server**, `gateRunInputs` decides whether the run may start. It is a strict *superset*: it validates shapes against the contract's JSON Schemas and builds the wire payload, on top of asking readiness's own question. That asymmetry is deliberate. A run endpoint is public, the browser's checks are trivially bypassed, and the server is the trust boundary; readiness is UX.

What the two must never do is **disagree about whether an input is there**. When they do, the form offers a run its own gate refuses — or, worse, the server starts a paid run behind a button that was disabled. Every bug this package has shipped in that family had the same shape: two pieces of the kernel answering "is this input present?" differently, with no host able to correct it from outside.

## Use `gateRunInputs`

```ts
import { gateRunInputs, getPipeIOContract } from '@pipelex/mthds-form';

const contract = getPipeIOContract(PIPE_IO_CONTRACTS, 'quotes', 'extract_brief');
const gate = gateRunInputs(contract, requestBody);

if (!gate.ok) {
  // gate.missingInputs — variable names the caller left empty or short
  // gate.errors       — RunInputError[], when the scan cannot name anything
  // gate.preparedData — the repaired data the verdict was reached on
  return reject(gate);
}
await startRun(gate.inputs);
```

`data` is typed `unknown` because that is what arrives at a public endpoint: no framework enforces a declared parameter type, so the argument is whatever the caller put in the body. Normalizing it is the gate's first step rather than a wrapper around the gate — a `null` body would otherwise throw *after* validation had already judged it, past the point where a verdict could come back.

The result is a verdict, never a throw. A rejection is an ordinary outcome here, and frameworks routinely strip a thrown message to an opaque digest in production builds.

## Why the assembly is the kernel's job

The gate is four exported steps — `buildRunInputsSchema` → `prepareRunInputs` → `validateRunInputs` → `apiInputsFromSchemaData` — and they stay exported, because a host rendering its own panel needs the schema or the verdict on its own. But **assembling them is not a host's job**, for two reasons that are invisible until they bite.

**The schema is not the whole rule.** ajv's `required` asserts only that a key is *present*, and a content model carries no `minLength`. So a required input that arrived empty — `{document: {url: ""}}`, `{text: {text: ""}}` — satisfies the schema. That is the natural payload, not a contrived one: `rjsfDataFromRunValues({}, fields)` emits exactly that when nothing is selected. Without a re-check the server would be *more permissive than the button in front of it*.

**Picking the re-check is where it goes wrong.** There are four look-alike predicates, and only two of them are the ones the Run button reads. The obvious pair, `inputMustBeFilled` + `isFilled`, agrees on every native concept and diverges on a structured one **in both directions** — `isFilled` on an object is `some(child filled)` where `fieldFilled` is `every(required child filled)`. That accepts a half-filled struct the browser refuses (a paid run past a disabled button) *and* rejects a filled all-optional struct the browser accepts. A host whose methods happen to use only native concepts has no test that can catch either, which is exactly the position a host is in on the day it adopts.

`gateRunInputs` runs `computeReadiness`'s *own* two functions over the same derived fields, so the rules are shared by construction rather than by resemblance. [`src/core/__tests__/gate-agreement.test.ts`](../src/core/__tests__/gate-agreement.test.ts) asserts it by running both sides over one table — including the structured fixtures a host does not have — which is the only form of that claim worth trusting.

## Which `*Filled` to reach for

| | |
| --- | --- |
| `computeReadiness(fields, values)` | the answer for a **form** — is the Run button live, and what is still missing |
| `gateRunInputs(contract, data)` | the answer for a **server** — may this run start, and what is the payload |
| `isFilled(value)` | the **leaf** predicate: is there anything here at all? The one to reach for outside gating — deciding whether an optional section starts folded, say |
| `fieldFilled(field, value)` | `isFilled` applied to one descriptor, honouring what that field's concept demands inside it (required children, a declared item count) |
| `mustBeFilled(field)` | whether a field gates at all — the contract's answer, stamped onto the descriptor as `gating` |

`isFilled` stays exported because its standalone use is legitimate. The other two are exported because `computeReadiness` is built from them and a bespoke surface may need the same pieces. None of them is a server gate, and hand-assembling one out of them is the mistake `gateRunInputs` exists to remove.

## What counts as present

The rule is one predicate, `isFilled`, read in four places — the value bridge, the prune, the payload builder, and `fieldFilled`. [architecture.md](architecture.md) § "What absence looks like" states it in full. Three consequences are worth having in front of you when reading a verdict:

- **A structure must be touched.** An input the method demands is missing until a value goes somewhere inside it, even when its concept declares no required child. Opening the section is view state the value never sees.
- **A touched *optional* input is held to its concept.** It is out of the reckoning while untouched and in it the moment something is filled, because the gate then validates it whole. So the readiness count moves from 3 of 3 to 3 of 4 when the user starts filling an optional structure, and to 4 of 4 when they finish.
- **A declared item count gates.** A `Concept[N]` list is satisfied only by `N` filled items; a variable `Concept[]` list never gates, because its empty form is the legitimate value `[]`. The count reaches the descriptor as `ListRunField.itemCount`, read off the same `minItems` ajv reads.

## Schema caching

`gateRunInputs` keeps one schema object per contract in a `WeakMap`. This is not a micro-optimization: validation runs through a module-level ajv whose compiled-schema cache is keyed on **schema object identity** and is never evicted. Building a fresh schema per call misses that cache every time and retains another compiled validator — on a public endpoint, unbounded growth driven by the cheapest request there is, an empty body rejected in a fraction of a millisecond. The map is weakly keyed so it never pins a contract that goes out of scope; the number of retained validators is then bounded by the number of distinct contracts rather than by traffic.

## Rendering the rejection

The verdict is the contract; its rendering is not. `describeValidationError(error, translate, gate.preparedData)` is one presentation of a `RunInputError` and a host is free to write another — it takes an injected `Translate` so the kernel stays i18n-agnostic. A consumer branches on the structured fields, never on message text.

A message that names a field names the field's **identifier** — the one written in the method — never the schema `title` a pydantic contract carries alongside it. That is the one deliberate divergence from RJSF's error transform, which substitutes the title because in an RJSF form the title *is* the rendered label. Here the controls label a field by its identifier, so quoting `'Audience'` at someone whose bundle says `audience` sends them looking for a field that does not exist.
