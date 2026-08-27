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
): RunField {
  const schema = collapseNullable(derefSchema(rawSchema, defs));
  const type = schemaTypeOf(schema);

  if (type === 'array') {
    const item = gatingNode(name, (schema.items as JsonSchema) ?? {}, true, defs);
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
        gatingNode(childName, childSchema ?? {}, req.has(childName), defs),
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
    );
    return { ...node, gating: inputMustBeFilled(input) };
  });
}
