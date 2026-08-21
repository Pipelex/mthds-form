/**
 * Value readiness - the helpers the runner uses to decide whether the Run
 * button may fire and which inputs are still missing.
 */

import type { RunField } from './descriptor';

/** True when a value is meaningfully filled (not empty / blank / empty container). */
export function isFilled(value: unknown): boolean {
  if (value == null || value === '') return false;
  if (Array.isArray(value)) return value.length > 0 && value.some(isFilled);
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // A file value is { url } - filled when the url is set.
    if ('url' in obj) return isFilled(obj.url);
    return Object.values(obj).some(isFilled);
  }
  return true;
}

/** True when every required field has a value. */
export function fieldFilled(field: RunField, value: unknown): boolean {
  if (field.kind === 'object') {
    if (!value || typeof value !== 'object') return field.fields.every((f) => !f.required);
    const obj = value as Record<string, unknown>;
    return field.fields.every((f) => !f.required || fieldFilled(f, obj[f.name]));
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
 * shows; an optional one may collapse). A **plural** field stays required - it
 * is a first-class input and keeps its place in the form - but it never gates:
 * a plural slot is never "absent" in MTHDS, its empty form IS the empty list,
 * and no method can declare "at least one item".
 *
 * **For a field the app built, the answer comes from `inputMustBeFilled`**
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
 * and therefore nothing to disagree with. Every field the app renders comes from
 * `buildRunFields` and carries `gating`, so the app is on the contract's answer
 * alone.
 */
export function mustBeFilled(field: RunField): boolean {
  return field.gating ?? (field.required && field.kind !== 'list');
}

/** How many gating top-level inputs are satisfied by the current values. */
export function computeReadiness(fields: RunField[], values: Record<string, unknown>): Readiness {
  const gating = fields.filter(mustBeFilled);
  const missing = gating
    .filter((f) => !fieldFilled(f, values[f.name]))
    .map((f) => f.title ?? f.name);
  return { total: gating.length, ready: gating.length - missing.length, missing };
}
