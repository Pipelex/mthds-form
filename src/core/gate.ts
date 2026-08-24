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
 *      is `inputMustBeFilled` (optional `?` and variable-plural `[]` never
 *      block; a fixed-count `[N]` list does).
 *   2. `prepareRunInputs` - heal legacy wrappers, then prune empty optionals.
 *   3. `validateRunInputs` - ajv, plus the missing-input scan that names the
 *      VARIABLE at fault.
 *   4. `apiInputsFromSchemaData` - the `{concept, content}` payload, built from
 *      the PREPARED data so the pruning reaches the wire too.
 *
 * **`gateRunInputs` is that whole chain as one call**, and it is what a server
 * should use. The four steps stay exported because a host that renders its own
 * panel needs the schema and the verdict separately, but assembling them is not
 * a host's job: the step between validation and the payload is an emptiness
 * check with four look-alike predicates to choose from, only two of which are
 * the ones the Run button reads, and choosing the near-miss pair produces a
 * server that is more permissive than the button in front of it.
 *
 * This module is pure: no React, no toasts, no i18n. Each caller renders the
 * verdict in its own idiom.
 */
import { inputMustBeFilled, isOptionalInput, isPluralInput } from './contracts';
import { buildRunFields } from './derive';
import { fieldFilled, isFilled, mustBeFilled } from './readiness';
import { validateRunInputsSchema, type RunInputError } from './gate-validator';
import { healStringWrappers, pruneEmptyOptionals } from './wire-format';
import { prepareSchemaForRjsf } from './normalize-schema';
import { ownProp } from './own-property';
import type { PipeIOContract, PipeInputContract } from './contracts';

type Dict = Record<string, unknown>;

/**
 * Combine the per-input schemas into one object schema.
 *
 * Each input variable becomes a property, titled with the variable name and
 * described with the concept code. Only the inputs the method actually demands
 * land in `required` - an optional (`?`) or variable-plural (`[]`) input must
 * not block the form (see `inputMustBeFilled`).
 *
 * The per-input schema travels verbatim, which is how a fixed-count (`[N]`)
 * list's declared count reaches ajv: pipelex states it as `minItems`/`maxItems`
 * on the array wrapper, so the count is enforced here without the kernel
 * restating it.
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
    const varData = ownProp(preparedData, varName);
    // A demanded input that is not there at all is missing whatever its concept
    // declares inside. The check has to come BEFORE the required-children one:
    // a struct whose concept demands no child used to fall out of the scan
    // here, so the run was refused by the combined schema's `required` list
    // while the scan named nothing and the caller could only quote ajv.
    if (varData == null) {
      missingInputs.push(varName);
      continue;
    }
    const inputSchema = input.json_schema as Dict;
    const requiredFields = (inputSchema.required as string[]) || [];
    if (requiredFields.length === 0) continue;
    if (typeof varData !== 'object') {
      missingInputs.push(varName);
      continue;
    }
    const record = varData as Dict;
    if (
      requiredFields.some((f) => {
        const child = ownProp(record, f);
        return child === undefined || child === '';
      })
    ) {
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
 *
 * A fixed-count (`[N]`) list takes that same empty-list path, and an empty one
 * is not a payload the method can accept. It is unreachable through the gate,
 * which demands the input and rejects a short list on `minItems`; building the
 * payload straight from unvalidated data is what would reach it, and inventing
 * a different absence here would only hide that.
 */
export function apiInputsFromSchemaData(
  preparedData: Dict,
  inputs: Record<string, PipeInputContract>,
): Dict {
  const out: Dict = {};
  for (const [varName, input] of Object.entries(inputs)) {
    const raw = ownProp(preparedData, varName);
    if (isOptionalInput(input) && !isFilled(raw)) continue;
    if (isPluralInput(input) && !isFilled(raw)) {
      out[varName] = [];
      continue;
    }
    const content = isPluralInput(input) && !Array.isArray(raw) ? [] : raw;
    out[varName] = { concept: input.concept_ref, content };
  }
  return out;
}

// ─── The whole chain, as one call ────────────────────────────────────────────

/** The gate's verdict: the payload to send, or why the run may not start. */
export type RunInputsGateResult =
  | { ok: true; inputs: Dict }
  | {
      ok: false;
      /** Variable names the caller left empty or short. */
      missingInputs: string[];
      /** Raw ajv errors, for when the scan cannot name anything. */
      errors: RunInputError[];
      /** The repaired data the verdict was reached on - what
       *  `describeValidationError` needs to quote the value it received. */
      preparedData: Dict;
    };

/**
 * One schema object per contract, for the lifetime of the process.
 *
 * `buildRunInputsSchema` is a pure function of the contract, so rebuilding it is
 * *semantically* free - but validation runs through a module-level ajv whose
 * compiled-schema cache is keyed on **schema object identity** and is never
 * evicted. A fresh object per call therefore misses every time and retains
 * another compiled validator. On a publicly callable server endpoint that is
 * unbounded growth driven by the cheapest request there is: an empty body,
 * rejected in a fraction of a millisecond, costing nothing to send.
 *
 * Weakly keyed so the map never pins a contract that goes out of scope. The
 * schema a run has been gated against is pinned for the process lifetime anyway
 * by ajv's own cache; the point is that the NUMBER of them is bounded by the
 * number of distinct contracts rather than by traffic.
 */
const SCHEMA_CACHE = new WeakMap<PipeIOContract, Dict>();

function schemaForContract(contract: PipeIOContract): Dict {
  const cached = SCHEMA_CACHE.get(contract);
  if (cached) return cached;
  const schema = buildRunInputsSchema(contract.inputs);
  SCHEMA_CACHE.set(contract, schema);
  return schema;
}

/**
 * Gate a run: repair the caller's data, validate it against the contract,
 * refuse anything the Run button would have refused, and build the payload.
 *
 * Returns a verdict rather than throwing. A server endpoint must not throw
 * across the boundary to its client - frameworks routinely strip the message to
 * an opaque digest in a production build - and a rejection here is an ordinary
 * outcome, not an exceptional one.
 *
 * **`data` is `unknown` because that is what it is.** A run endpoint is public
 * and no framework enforces a declared parameter type, so the argument is
 * whatever the caller put in the body. Normalizing it is the gate's first step
 * rather than a wrapper around the gate: the chain indexes the payload by
 * variable name without first checking it is indexable, so a `null` body would
 * throw *after* ajv had already reported `must be object` and before any
 * verdict came back. An empty object walks the normal path instead and names
 * every input the caller left out.
 *
 * **The schema alone is not the rule.** ajv's `required` asserts only that a
 * key is PRESENT, and a content model carries no `minLength` - so a required
 * input that arrived empty (`{document: {url: ""}}`, `{text: {text: ""}}`)
 * satisfies the schema. That is the natural payload, not a contrived one:
 * `rjsfDataFromRunValues({}, fields)` emits exactly that when nothing is
 * selected. So the gate re-applies the emptiness rule using
 * `computeReadiness`'s OWN two functions over the same derived fields, which is
 * the only way to be sure the two sides cannot disagree.
 *
 * Picking a pair that merely looks equivalent is not enough, and this is the
 * whole reason the assembly lives here rather than in each host: the obvious
 * choice, `inputMustBeFilled` + `isFilled`, agrees on every leaf kind and
 * diverges on a structured concept in BOTH directions - `isFilled` on an object
 * is `some(child filled)` where `fieldFilled` is `every(required child
 * filled)`. That accepts a half-filled struct the browser refuses (a paid run
 * past a disabled button) and rejects a filled all-optional struct the browser
 * accepts. A host whose methods happen to use only native concepts has no test
 * that can catch either.
 */
export function gateRunInputs(contract: PipeIOContract, data: unknown): RunInputsGateResult {
  const payload =
    typeof data === 'object' && data !== null && !Array.isArray(data) ? (data as Dict) : {};
  const schema = schemaForContract(contract);
  const preparedData = prepareRunInputs(payload, schema);

  const verdict = validateRunInputs(preparedData, contract.inputs, schema);
  if (!verdict.isValid) {
    return {
      ok: false,
      missingInputs: verdict.missingInputs,
      errors: verdict.errors,
      preparedData,
    };
  }

  const missingInputs = buildRunFields(contract.inputs)
    .filter(mustBeFilled)
    .filter((field) => !fieldFilled(field, ownProp(preparedData, field.name)))
    .map((field) => field.name);
  if (missingInputs.length) return { ok: false, missingInputs, errors: [], preparedData };

  return { ok: true, inputs: apiInputsFromSchemaData(preparedData, contract.inputs) };
}
