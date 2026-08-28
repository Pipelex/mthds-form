/**
 * The gate's own field tree - structural, schema-derived, and private.
 *
 * `gateRunInputs` re-applies the Run button's emptiness rule with
 * `mustBeFilled`/`fieldFilled`, which read a `RunField` tree. The RENDER tree
 * is built from the wire input-form descriptor - but the gate must not require
 * that artifact: the descriptor is a presentation view, and the workspace
 * doctrine is that a machine consumer never needs it to validate a payload -
 * `json_schema` keeps that job. A server holds contracts; it may never have
 * asked for the view.
 *
 * So the gate walks the contract's `json_schema` into the MINIMAL tree the
 * emptiness predicates read: `object` nodes with their required children,
 * `list` nodes with their declared bounds, and opaque leaves. This is not a
 * revival of the deleted heuristics - it reads exactly the keywords ajv itself
 * enforces (`type`, `properties`, `required`, `items`, `minItems`, `maxItems`)
 * and decides nothing about what a field IS. No kind here ever reaches a
 * renderer: the tree exists for one call inside `gateRunInputs` and is not
 * exported from the package.
 *
 * Agreement with the browser's readiness (which runs over the render tree) is
 * held by construction - both trees take required children and list bounds
 * from the same model the engine derived both artifacts from - and asserted in
 * `gate-agreement.test.ts`, which runs both sides over one table.
 */

import { inputMustBeFilled, isOptionalInput, type PipeInputContract } from './contracts';
import type { RunField } from './descriptor';
import {
  collapseNullable,
  collectSchemaDefs,
  derefSchema,
  schemaTypeOf,
  type JsonSchema,
} from './schema-utils';

function numOrUndef(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

function gatingNode(
  name: string,
  rawSchema: JsonSchema,
  required: boolean,
  defs: Record<string, JsonSchema>,
  active: ReadonlySet<string>,
): RunField {
  // Resolve `$ref` / nullable-`anyOf` layers to a fixpoint - one pass of
  // either helper cannot see through pydantic's Optional concept-typed shape,
  // `anyOf: [{$ref}, {type:'null'}]` - keeping the set of references OPEN ON
  // THIS PATH. A reference met again while still open is a self-referencing
  // model: expanding it has no floor, so the node degrades to the opaque leaf
  // instead of overflowing the stack - the gate returns a verdict, never a
  // throw. Open on this path, not seen anywhere: two siblings referencing one
  // definition are ordinary composition and both expand in full. The degrade
  // is OPEN, and deliberately so: ajv - which resolves recursion natively,
  // bounded by the data - has already enforced PRESENCE of required children
  // at every depth, but presence is all it enforces, so a required scalar
  // that is present-but-blank below the cycle point is caught by neither
  // side. That residual leniency is a recorded follow-up, not a safety
  // property; failing CLOSED here would refuse every legitimate recursive
  // payload, which is the worse defect.
  let schema = rawSchema;
  let path = active;
  for (;;) {
    const ref = schema.$ref;
    if (typeof ref === 'string') {
      if (path.has(ref)) return { name, required, kind: 'unknown' };
      path = new Set(path).add(ref);
    }
    const next = collapseNullable(derefSchema(schema, defs));
    if (next === schema) break;
    schema = next;
  }
  const type = schemaTypeOf(schema);

  if (type === 'array') {
    const item = gatingNode(name, (schema.items as JsonSchema) ?? {}, true, defs, path);
    const itemCount = numOrUndef(schema.minItems);
    const maxItemCount = numOrUndef(schema.maxItems);
    return {
      name,
      required,
      kind: 'list',
      item,
      ...(itemCount === undefined ? {} : { itemCount }),
      ...(maxItemCount === undefined ? {} : { maxItemCount }),
    };
  }
  if (type === 'object') {
    const props = (schema.properties as Record<string, JsonSchema>) ?? {};
    const req = new Set(Array.isArray(schema.required) ? (schema.required as string[]) : []);
    return {
      name,
      required,
      kind: 'object',
      fields: Object.entries(props).map(([childName, childSchema]) =>
        gatingNode(childName, childSchema ?? {}, req.has(childName), defs, path),
      ),
    };
  }
  // Everything else is a leaf to the emptiness rule: `fieldFilled` answers it
  // with `isFilled` alone, whatever kind it carries. `unknown` states that
  // honestly.
  return { name, required, kind: 'unknown' };
}

/**
 * The tree `gateRunInputs`' emptiness re-check runs over, one node per input,
 * with `gating` stamped from the contract - the same `inputMustBeFilled` the
 * Run button's `required` list is built from.
 */
export function gatingFieldsFromInputs(inputs: Record<string, PipeInputContract>): RunField[] {
  return Object.entries(inputs).map(([name, input]) => {
    const defs: Record<string, JsonSchema> = {};
    collectSchemaDefs(input.json_schema, defs, { traverseArrays: true });
    const node = gatingNode(
      name,
      (input.json_schema as JsonSchema) ?? {},
      !isOptionalInput(input),
      defs,
      new Set(),
    );
    return { ...node, gating: inputMustBeFilled(input) };
  });
}
