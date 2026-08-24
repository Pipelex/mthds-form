/**
 * The gate every run passes through, whichever surface starts it.
 *
 * A host may offer more than one place to run a method - a schema-driven
 * inputs panel (an RJSF form) and a standalone run page (a bespoke field
 * renderer), say. **Only the rendering of inputs differs.** Everything between
 * "the user pressed Run" and "the payload goes on the wire" lives here, so
 * those surfaces cannot drift:
 *
 *   1. `buildRunInputsSchema` - the combined JSON Schema, whose `required` list
 *      is `inputMustBeFilled` (optional `?` and plural `[]` never block).
 *   2. `prepareRunInputs` - heal legacy wrappers, then prune empty optionals.
 *   3. `validateRunInputs` - ajv, plus the missing-input scan that names the
 *      VARIABLE at fault.
 *   4. `apiInputsFromSchemaData` - the `{concept, content}` payload, built from
 *      the PREPARED data so the pruning reaches the wire too.
 *
 * This module is pure: no React, no toasts, no i18n. Each caller renders the
 * verdict in its own idiom.
 */
import { inputMustBeFilled, isPluralInput } from './contracts';
import { isFilled } from './readiness';
import { validateRunInputsSchema, type RunInputError } from './gate-validator';
import { healStringWrappers, pruneEmptyOptionals } from './wire-format';
import { prepareSchemaForRjsf } from './normalize-schema';
import type { PipeInputContract } from './contracts';

type Dict = Record<string, unknown>;

/**
 * Combine the per-input schemas into one object schema.
 *
 * Each input variable becomes a property, titled with the variable name and
 * described with the concept code. Only the inputs the method actually demands
 * land in `required` - an optional (`?`) or plural (`[]`) input must not block
 * the form (see `inputMustBeFilled`).
 */
export function buildRunInputsSchema(inputs: Record<string, PipeInputContract>): Dict {
  const properties: Dict = {};
  const required: string[] = [];

  for (const [varName, input] of Object.entries(inputs)) {
    const inputSchema = { ...input.json_schema } as Dict;
    inputSchema.title = varName;
    if (input.concept_ref && input.concept_ref !== varName) {
      inputSchema.description = input.concept_ref;
    }
    properties[varName] = inputSchema;
    if (inputMustBeFilled(input)) required.push(varName);
  }

  return prepareSchemaForRjsf({ type: 'object', properties, required });
}

/**
 * Last-gate repair, in two passes against the exact schema ajv validates.
 *
 * 1. **HEAL** - persisted `inputData` may still carry the legacy double-wrapped
 *    `{ text: { text } }` shape (or a form's state may lag a store fix).
 * 2. **PRUNE** - RJSF fills every unset string with `""` on mount, which an
 *    optional CONSTRAINED field rejects (`DateContent.time` is `format: "time"`)
 *    - blocking a run on a field the user never opened. An absent optional field
 *    is what pipelex means by `None` anyway, so dropping it is the semantically
 *    correct repair, not a validation dodge.
 */
export function prepareRunInputs(data: Dict, schema: Dict): Dict {
  return pruneEmptyOptionals(healStringWrappers(data, schema), schema) as Dict;
}

export interface RunInputsVerdict {
  isValid: boolean;
  /** Variable names the scan could pin a missing required field on. */
  missingInputs: string[];
  /** Raw ajv errors, for when the scan cannot name anything. */
  errors: RunInputError[];
}

/**
 * Validate PREPARED data against the combined schema.
 *
 * `missingInputs` is reported by VARIABLE NAME - the name on the node the user
 * clicks - never by `concept_ref`, which used to produce "Missing required
 * fields in: native.Text" and named neither the input at fault nor, when several
 * inputs share a concept, which of them. Inputs the method declared omittable
 * are skipped: an empty `?` input is not a missing one.
 *
 * The scan can come up empty even on an invalid form (a wrong value shape, a
 * nested mismatch); `errors` is what the caller falls back to then, so a failure
 * is never undiagnosable.
 */
export function validateRunInputs(
  preparedData: Dict,
  inputs: Record<string, PipeInputContract>,
  schema: Dict,
): RunInputsVerdict {
  const errors = validateRunInputsSchema(preparedData, schema);
  if (errors.length === 0) return { isValid: true, missingInputs: [], errors: [] };

  const missingInputs: string[] = [];
  for (const [varName, input] of Object.entries(inputs)) {
    if (!inputMustBeFilled(input)) continue;
    const varData = preparedData[varName];
    const inputSchema = input.json_schema as Dict;
    const requiredFields = (inputSchema.required as string[]) || [];
    if (requiredFields.length === 0) continue;
    if (!varData || typeof varData !== 'object') {
      missingInputs.push(varName);
      continue;
    }
    const record = varData as Dict;
    if (requiredFields.some((f) => record[f] === undefined || record[f] === '')) {
      missingInputs.push(varName);
    }
  }

  return { isValid: false, missingInputs, errors };
}

/**
 * Build the `{ concept, content }` map a run expects, from PREPARED data.
 *
 * The two ways a method says "this may be nothing" land differently on the wire:
 * - an **optional (`?`)** input left blank is OMITTED, so the runtime records a
 *   real absence the method can branch on - sending `{ text: "" }` would look
 *   like the caller supplied an empty string;
 * - a **plural (`[]`)** input keeps its key, because a plural slot is never
 *   absent - its empty form IS the empty list, and the runtime requires the key.
 *   When that list is EMPTY it is sent BARE, without the envelope: the envelope
 *   is the runtime's "explicit form", which bypasses the top-down shaper and
 *   hands the value to the bottom-up factory, and that factory types a list from
 *   its first item - so an empty list there raises "Cannot create Stuff from
 *   empty list in content". The bare form keeps the shaper, which reads the
 *   DECLARED concept and builds the empty list correctly. (pipelex/#1096 makes
 *   the envelope agree; the bare form runs today and stays correct after.)
 */
export function apiInputsFromSchemaData(
  preparedData: Dict,
  inputs: Record<string, PipeInputContract>,
): Dict {
  const out: Dict = {};
  for (const [varName, input] of Object.entries(inputs)) {
    const raw = preparedData[varName];
    if (input.optional === true && !isFilled(raw)) continue;
    if (isPluralInput(input) && !isFilled(raw)) {
      out[varName] = [];
      continue;
    }
    const content = isPluralInput(input) && !Array.isArray(raw) ? [] : raw;
    out[varName] = { concept: input.concept_ref, content };
  }
  return out;
}
