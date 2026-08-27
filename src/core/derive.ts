/**
 * The ONE derivation function: wire input-form descriptor → `RunField[]`.
 *
 * `buildRunFields` maps the standard's per-pipe descriptor STRUCTURALLY onto
 * the kernel's `RunField` shape. It decides nothing: what a field IS - its
 * kind, its constraints, its refinement chain, whether Run gates on it - is
 * stated by the wire, derived by the engine from the resolved library. The
 * heuristics that used to live here (native-concept sets, the url-bearing
 * object test, the depth-based prose/label rule) are deleted, not bypassed;
 * docs/derivation-swap.md is the record of that swap and of every behaviour
 * that moved with it.
 *
 * The contract is still consulted, for exactly two facts the wire deliberately
 * does not carry:
 *
 * - **`contentKey`** - the single property a native scalar's value sits inside
 *   on the wire (`TextContent {text}`, `NumberContent {number}`). A renderer
 *   holds the bare scalar; the value bridge wraps by this name. It is read off
 *   the contract's `json_schema` because it is a fact about the PAYLOAD shape,
 *   which is the schema's job - the descriptor describes the form, never the
 *   payload.
 * - **Nested list bounds** - the wire puts `item_count` only on a top-level
 *   fixed `[N]` slot, but the model behind a structured concept may state
 *   `minItems`/`maxItems` on an array property of its own, and ajv enforces
 *   them. Reading them off the schema is what keeps readiness from being more
 *   permissive than the gate.
 *
 * Both are structural reads (a property count, two keywords ajv itself
 * enforces), not judgements - the mapper stays honest about owning no taxonomy.
 */

import type { PipeInputFormDescriptor } from 'mthds/protocol';
import type { InputForm, InputFormField, InputFormItem } from 'mthds/protocol';

import { buildPipeRef, type PipeInputContract } from './contracts';
import type { RunField, RunFieldCommon } from './descriptor';
import { ownProp } from './own-property';
import { collectSchemaDefs, resolveSchemaNode, type JsonSchema } from './schema-utils';

/**
 * Look up a pipe's input-form descriptor by pipe code, tolerant of both key
 * conventions - the exact mirror of `getPipeIOContract`, because the standard
 * keys `input_form` by the same `pipe_ref` set as `pipe_io_contracts` and a
 * host tracks the same bare codes either way.
 */
export function getPipeInputForm(
  inputForm: InputForm | null | undefined,
  domain: string | null | undefined,
  pipeCode: string | null | undefined,
): PipeInputFormDescriptor | undefined {
  if (!inputForm || !pipeCode) return undefined;
  if (domain) {
    const byRef = ownProp(inputForm, buildPipeRef(domain, pipeCode));
    if (byRef) return byRef;
  }
  return ownProp(inputForm, pipeCode);
}

/**
 * The single property a scalar content model holds its value in - `TextContent
 * {text}`, `NumberContent {number}`, `YesNoContent {yes_no}`.
 *
 * A wrapper is a schema declaring EXACTLY ONE property. A multi-property
 * content model (`DateContent {date, time}`, `HtmlContent {inner_html,
 * css_class}`) is not one and deliberately answers `undefined` - those travel
 * as the structures they are, which the wire now also says by giving them
 * `kind: "object"`. Reading the declared shape rather than keeping a list of
 * wrapping concepts is what covers a concept nobody remembered to add.
 */
function scalarWrapperKey(schema: JsonSchema | undefined): string | undefined {
  const props = schema?.properties as Record<string, JsonSchema> | undefined;
  const keys = props ? Object.keys(props) : [];
  return keys.length === 1 ? keys[0] : undefined;
}

function numOrUndef(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

/** Resolve one schema node the same way the gate's validator will see it -
 *  to the FIXPOINT, so a nullable `$ref` (pydantic's Optional concept-typed
 *  field) yields its definition rather than an unresolved reference. */
function resolveSchema(
  schema: JsonSchema | undefined,
  defs: Record<string, JsonSchema>,
): JsonSchema | undefined {
  return schema ? resolveSchemaNode(schema, defs) : undefined;
}

/** The slots every wire node carries, mapped onto the descriptor's names. */
function commonOf(node: InputFormItem, name: string): RunFieldCommon {
  return {
    name,
    title: node.title,
    conceptRef: node.concept_ref,
    refines: node.refines,
    description: node.description,
    required: node.required,
    defaultValue: node.default_value,
    examples: node.examples,
    hints: node.hints,
  };
}

/**
 * Map one wire node onto a `RunField`, walking the aligned `json_schema` node
 * beside it. The schema walk supplies only `contentKey` and list bounds (see
 * the module header); a missing or misaligned schema degrades to their absence,
 * never to a different field.
 */
function mapNode(
  node: InputFormItem,
  name: string,
  rawSchema: JsonSchema | undefined,
  defs: Record<string, JsonSchema>,
): RunField {
  const schema = resolveSchema(rawSchema, defs);
  const common = commonOf(node, name);

  switch (node.kind) {
    case 'text':
    case 'prose':
      return {
        ...common,
        contentKey: scalarWrapperKey(schema),
        kind: node.kind,
        minLength: node.min_length,
        maxLength: node.max_length,
        pattern: node.pattern,
        format: node.format,
      };
    case 'date':
      return { ...common, kind: 'date', datetime: node.datetime };
    case 'number':
      return {
        ...common,
        contentKey: scalarWrapperKey(schema),
        kind: 'number',
        integer: node.integer,
        // The kernel collapses the exclusive bounds: a number control clamps,
        // it does not express open intervals. ajv still enforces the exact
        // keyword off the schema, so nothing is lost - only unrendered.
        min: node.minimum ?? node.exclusive_minimum,
        max: node.maximum ?? node.exclusive_maximum,
      };
    case 'boolean':
      return { ...common, contentKey: scalarWrapperKey(schema), kind: 'boolean' };
    case 'enum':
      // The wire carries the authored `choices` verbatim (`unknown[]`); the
      // control set renders and stores strings, as it always has.
      return { ...common, kind: 'enum', options: node.choices.map(String) };
    case 'document':
      // `accept` is a renderer-side affordance the wire deliberately does not
      // state - a presentation default keyed on the WIRE's kind, not a guess.
      return { ...common, kind: 'document', accept: 'PDF, DOCX, TXT' };
    case 'image':
      return { ...common, kind: 'image', accept: 'PNG, JPG, WEBP' };
    case 'object': {
      const props = schema?.properties as Record<string, JsonSchema> | undefined;
      return {
        ...common,
        kind: 'object',
        fields: node.fields.map((child: InputFormField) =>
          mapNode(child, child.name, props ? ownProp(props, child.name) : undefined, defs),
        ),
      };
    }
    case 'list': {
      // The item keeps the parent's name (unused for labels - the index labels
      // items), exactly as the wire's `item` carries no `name` of its own.
      const item = mapNode(node.item, name, schema?.items as JsonSchema | undefined, defs);
      const itemCount = node.item_count ?? numOrUndef(schema?.minItems);
      const maxItemCount = numOrUndef(schema?.maxItems) ?? node.item_count;
      return {
        ...common,
        kind: 'list',
        item,
        ...(itemCount === undefined ? {} : { itemCount }),
        ...(maxItemCount === undefined ? {} : { maxItemCount }),
      };
    }
    case 'unknown':
      return { ...common, kind: 'unknown' };
  }
  // Version drift: the wire states a kind this build's pinned peer does not
  // define. The switch above is exhaustive over `InputFormItem`, so
  // `satisfies never` keeps the build LOUD when the PEER grows a kind - and
  // this return keeps the mapper TOTAL when a SERVER is ahead of the peer,
  // which no type can rule out. The standard's own escape hatch is the honest
  // answer (`unknown` exists so a derivation can be total truthfully): the
  // field keeps its name and falls back to raw entry against the contract's
  // `json_schema`. Returning nothing produced a field with no `name` at all -
  // unaddressable by the value bridge and unnameable by readiness.
  node satisfies never;
  return { ...common, kind: 'unknown' };
}

/**
 * Map a pipe's wire input-form descriptor onto the kernel's field descriptors,
 * with the pipe's input contracts beside it for the two schema-derived facts.
 *
 * The order is the DESCRIPTOR's - authored input order, the fact the contract's
 * `inputs` map deliberately does not carry. `required`, `presence` and `gating`
 * are taken from the wire verbatim: the standard's top-level type ties
 * `required` to the presence marker, and `gating` is the producer-derived
 * answer `mustBeFilled` reads - the kernel re-derives none of them.
 */
export function buildRunFields(
  descriptor: PipeInputFormDescriptor,
  inputs: Record<string, PipeInputContract>,
): RunField[] {
  return descriptor.fields.map((node) => {
    const input = ownProp(inputs, node.name);
    const defs: Record<string, JsonSchema> = {};
    if (input) collectSchemaDefs(input.json_schema, defs, { traverseArrays: true });
    const field = mapNode(node, node.name, input?.json_schema as JsonSchema | undefined, defs);
    return { ...field, presence: node.presence, gating: node.gating };
  });
}
