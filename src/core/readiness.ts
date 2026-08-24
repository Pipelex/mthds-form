/**
 * Value readiness - the helpers the runner uses to decide whether the Run
 * button may fire and which inputs are still missing.
 */

import type { RunField } from './descriptor';
import { hasOwnProp, ownProp } from './own-property';

/**
 * How deep `isFilled` walks a value before it stops looking, and the answer it
 * gives when it does.
 *
 * The walk is over CALLER-SUPPLIED data - a request body on a public run
 * endpoint, or a form's state - so its depth is whatever the caller sent, and
 * the schema is no bound on it: `pruneEmptyOptionals` copies a property the
 * schema does not declare straight through, so a key ajv never walks reaches
 * this function unwalked. Unbounded, a value a few thousand levels deep threw
 * `RangeError` out of the middle of a host's server gate - a gate whose whole
 * contract is that it returns a verdict instead of throwing.
 *
 * **The cap answers `false`, and that direction is the deliberate half.** Past
 * the cap this function cannot tell whether there is anything down there, and
 * the kernel's rule throughout is that an unanswerable absence fails closed.
 * The cost of the other choice is a run the method cannot use, started (and
 * billed) on a payload no schema validated. The cost of this one is nearly
 * nothing: `isFilled` combines branches with `some`, so a refused over-deep
 * branch only loses its own vote - a real value anywhere beside it still reads
 * filled - and no concept structure declares nesting anywhere near this deep,
 * so a value that reaches the cap is not one the method had a slot for.
 */
const MAX_FILLED_DEPTH = 64;

/** True when a value is meaningfully filled (not empty / blank / empty container). */
export function isFilled(value: unknown): boolean {
  return walkFilled(value, 0, undefined);
}

/**
 * `isFilled`'s walk, carrying the depth and the objects already judged.
 *
 * `seen` is a cycle guard first - a value that references itself would
 * otherwise recurse to the cap on every branch - and a memo second. Both uses
 * are the same fact: an object reached twice within ONE call answered `false`
 * the first time, because a `true` short-circuits every `some` above it and the
 * walk never gets back down here. So the set can only ever hold empty
 * subtrees, which is also what makes it safe to keep entries after unwinding -
 * without that, a value shaped like a diamond chain costs exponential time.
 */
function walkFilled(value: unknown, depth: number, seen: Set<object> | undefined): boolean {
  if (value == null) return false;
  // Whitespace is not a value. The Run button lit up over a required text input
  // holding three spaces, ajv passed it (a content model carries no
  // `minLength`), and the run reached the runtime with nothing in it. The same
  // test is what makes a blank OPTIONAL input a real absence on the wire rather
  // than a supplied empty string - see `apiInputsFromSchemaData`.
  if (typeof value === 'string') return value.trim() !== '';
  // No concept in the taxonomy holds a function, so one here arrived by a route
  // that is already wrong - most plausibly an inherited `Object.prototype`
  // member read off a plain object by a colliding input name. `ownProp` closes
  // that route at every lookup; this branch is the backstop for the ones that
  // arrive by another.
  if (typeof value === 'function') return false;
  if (typeof value !== 'object') return true;

  if (depth >= MAX_FILLED_DEPTH) return false;
  const visited = seen ?? new Set<object>();
  if (visited.has(value)) return false;
  visited.add(value);

  if (Array.isArray(value)) return value.some((item) => walkFilled(item, depth + 1, visited));
  const obj = value as Record<string, unknown>;
  // A file value is { url } - filled when the url is set.
  if (hasOwnProp(obj, 'url')) return walkFilled(obj.url, depth + 1, visited);
  return Object.values(obj).some((child) => walkFilled(child, depth + 1, visited));
}

/**
 * True when a slot holds something AND every required field inside it has a
 * value.
 *
 * The two halves are both load-bearing, and the first one is the one that is
 * easy to leave out. A structure is satisfied only if there is something in it:
 * a struct whose concept declares no required child used to be *vacuously*
 * satisfied by an absent value - every child passed the `!f.required` test, so
 * `every` returned true over a value that was not there. Readiness reported
 * nothing missing and the Run button lit up, while the value bridge omitted the
 * untouched structure and the gate then rejected the run on the combined
 * schema's `required` list, naming an input the form had just declared ready.
 *
 * `isFilled` is the SAME predicate `toRjsf` uses to decide whether a structure
 * collapses to an absence (`values.ts`), which is what makes the two halves
 * agree by construction rather than by parallel edits: readiness calls an input
 * present exactly when the bridge keeps it. Absence is what a singular slot
 * expresses, so a required one has to be touched - the button stays dark until
 * the user puts a value somewhere inside, and then the whole shell travels,
 * empty children and all, so a required child left blank still fails loudly.
 *
 * Its own recursion follows the DESCRIPTOR, not the value, so it needs no depth
 * cap of its own: a `RunField` tree only exists because `buildRunFields`
 * finished walking a contract's schema, which bounds it. `isFilled` is where
 * the caller's data is walked, and where the cap lives.
 */
export function fieldFilled(field: RunField, value: unknown): boolean {
  if (field.kind === 'object') {
    if (!isFilled(value)) return false;
    const obj = (value ?? {}) as Record<string, unknown>;
    return field.fields.every((f) => !f.required || fieldFilled(f, ownProp(obj, f.name)));
  }
  // A list the method gave a count to (`Concept[N]`) is satisfied only by that
  // many items, each of them filled. Answering it by `isFilled` alone - "is
  // there anything in the array?" - left the button live on a `[3]` slot
  // holding two, and the gate then refused it on the very count the method
  // declared. `itemCount` comes off the same `minItems` ajv reads, so the two
  // halves phrase one rule. A VARIABLE list keeps the emptiness answer and
  // never gates anyway (see `mustBeFilled`), which is why the count, not the
  // kind, is what this branch turns on.
  if (field.kind === 'list' && field.itemCount !== undefined) {
    if (!Array.isArray(value) || value.length < field.itemCount) return false;
    return value.every((item) => fieldFilled(field.item, item));
  }
  return isFilled(value);
}

export interface Readiness {
  total: number;
  ready: number;
  missing: string[];
}

/**
 * True when the user must put a value in this field before the run can start.
 *
 * Distinct from `required`, which also drives layout (a required field always
 * shows; an optional one may collapse). A **variable-plural** field stays
 * required - it is a first-class input and keeps its place in the form - but it
 * never gates: a plural slot is never "absent" in MTHDS, its empty form IS the
 * empty list, and no method can declare "at least one item". A **fixed-count**
 * list (`[N]`) is the exception the wire now states, and it gates like any other
 * slot - there the method HAS ruled the empty form out.
 *
 * **For a field this package built, the answer comes from `inputMustBeFilled`**
 * (`contracts.ts`) - the SAME predicate the method viewer's Run button, its ajv
 * `required` list and its missing-inputs toast all read. `buildRunFields`
 * stamps it onto `gating`. This used to be re-derived here as
 * `required && kind !== 'list'`: the same rule expressed against the MAPPED
 * field instead of the contract, and the two could disagree - `kind` is `'list'`
 * for a `conceptRef` ending in `[]` OR an array schema, while the contract's
 * plural test is the array schema alone, so a plural input carrying a non-array
 * schema gated on one surface and not the other.
 *
 * The shape heuristic survives only as the fallback for a **hand-authored**
 * `RunField` - story fixtures and unit tests, which have no contract to consult
 * and therefore nothing to disagree with. Every field a host renders comes from
 * `buildRunFields` and carries `gating`, so a host is on the contract's answer
 * alone. (The fallback cannot see a fixed count either - one more thing only the
 * contract knows.)
 */
export function mustBeFilled(field: RunField): boolean {
  return field.gating ?? (field.required && field.kind !== 'list');
}

/**
 * How many top-level inputs stand between the current values and a run.
 *
 * Two kinds count, and the second is easy to miss. An input the method DEMANDS
 * counts always (`mustBeFilled`). An input the method left optional counts once
 * the user has put something in it - because a structure that has been touched
 * owes its concept every field the concept declares, and the gate enforces
 * exactly that. Left out, an optional struct opened and half-filled was ignored
 * here and refused there: the button stayed live and the run came back rejected
 * on a required child, which is the same disagreement the demanded case had.
 *
 * So an optional input moves INTO the denominator the moment it is touched, and
 * out of `missing` as soon as it is complete: 3 of 3 while it is untouched, 3
 * of 4 once it is started, 4 of 4 once it is done. `total` answers "how many
 * things stand between me and Run", which is the number a host is displaying.
 */
export function computeReadiness(fields: RunField[], values: Record<string, unknown>): Readiness {
  const gating = fields.filter((f) => mustBeFilled(f) || isFilled(ownProp(values, f.name)));
  const missing = gating
    .filter((f) => !fieldFilled(f, ownProp(values, f.name)))
    .map((f) => f.title ?? f.name);
  return { total: gating.length, ready: gating.length - missing.length, missing };
}
