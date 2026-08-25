/**
 * The ONE derivation function: `PipeInputContract` map → `RunField[]`.
 *
 * Everything heuristic stays module-private behind `buildRunFields`: the
 * native-concept taxonomy, `isDocumentObject`, the depth-based prose/label
 * rule, the `accept` strings, list splitting. Nothing here is exported except
 * the function itself - so the M1 milestone can swap the source of the
 * descriptor (server-derived) without touching consumers.
 */

import { inputMustBeFilled, isOptionalInput, type PipeInputContract } from './contracts';
import type { RunField, RunFieldCommon } from './descriptor';
import {
  FIELD_DOCUMENT_CONCEPTS,
  FIELD_TEXT_CONCEPTS,
  HTML_CONCEPTS,
  IMAGE_CONCEPTS,
  NUMBER_CONCEPTS,
  splitListConcept,
  TEXT_WRAPPER_CONCEPTS,
  YES_NO_CONCEPTS,
} from './native-concepts';
import {
  collapseNullable,
  collectSchemaDefs,
  derefSchema,
  schemaTypeOf,
  type JsonSchema,
} from './schema-utils';

// Native concepts arrive as their pydantic wrapper schema (e.g. native.Text is
// `TextContent {text}`, native.Document is `DocumentContent {url,…}`), NOT a bare
// primitive - so we map them by concept_ref, before the generic schema-type
// dispatch, or they'd all render as nested objects. The taxonomy lives in
// `native-concepts.ts`, which also records where this mapper's view drifts from
// the wire format's.

/**
 * A url-bearing object renders as a document field. This is `Boolean(
 * schema.properties?.url)` and nothing more: the historical description check
 * ("storage url" / "document url") was followed by `|| 'url' in props`, which
 * made it unreachable. Stated honestly as the heuristic it is - M1 replaces it
 * with the server-derived descriptor; narrowing it to the description match is
 * a recorded M1 option, not a K1 change.
 */
function isDocumentObject(schema: JsonSchema): boolean {
  const props = schema.properties as Record<string, JsonSchema> | undefined;
  return Boolean(props?.url);
}

interface MapCtx {
  defs: Record<string, JsonSchema>;
  depth: number;
}

/**
 * The single property a pydantic scalar content model holds its value in -
 * `TextContent {text}`, `NumberContent {number}`, `YesNoContent {yes_no}`.
 *
 * A native scalar's value does NOT sit at the top of its declared schema, and
 * this is where that is discovered: from the CONTRACT, not from a hand-kept
 * list of which concepts wrap. Keeping such a list is what broke `native.Number`
 * - the render taxonomy knew the concept, the wrapper taxonomy did not, so a
 * number reached the gate bare and failed against `NumberContent`. Reading the
 * declared shape covers a concept nobody remembered to add.
 *
 * A wrapper is a schema declaring EXACTLY ONE property. A multi-property content
 * model (`DateContent {date, time}`, `HtmlContent {inner_html, css_class}`) is
 * not one and deliberately answers `undefined`; so does a contract that declares
 * no properties at all. The returned `schema` is the WRAPPED property's, which
 * is where its constraints live.
 */
function scalarWrapper(
  schema: JsonSchema,
  ctx: MapCtx,
): { key: string; schema: JsonSchema } | undefined {
  const props = schema.properties as Record<string, JsonSchema> | undefined;
  const entries = props ? Object.entries(props) : [];
  const only = entries.length === 1 ? entries[0] : undefined;
  if (!only) return undefined;
  const [key, propSchema] = only;
  return { key, schema: collapseNullable(derefSchema(propSchema ?? {}, ctx.defs)) };
}

/** Build the recursive RunField for a single resolved schema node. */
function mapSchema(
  name: string,
  conceptRef: string | undefined,
  rawSchema: JsonSchema,
  required: boolean,
  ctx: MapCtx,
): RunField {
  const schema = collapseNullable(derefSchema(rawSchema, ctx.defs));
  // The LABEL is always the stuff name (the variable key) - that's what
  // identifies the input in the method. We deliberately do NOT use
  // `schema.title`, which is the pydantic model name (TextContent, ImageContent,
  // DocumentContent…) and would mask the stuff name. The concept pill carries
  // the type instead. `title` stays undefined here so FieldShell falls back to
  // `name`; list items still pass `title: ''` to suppress the per-row label.
  const common: RunFieldCommon = {
    name,
    conceptRef,
    description: typeof schema.description === 'string' ? schema.description : undefined,
    required,
  };

  const { base, isList } = splitListConcept(conceptRef);

  // List concepts (native.Text[], demo.Invoice[]) and array schemas.
  if (isList || schemaTypeOf(schema) === 'array') {
    const itemsSchema = (schema.items as JsonSchema) ?? {};
    const item = mapSchema(name, base, itemsSchema, true, { ...ctx, depth: ctx.depth + 1 });
    // A declared count (`Concept[N]`) reaches the descriptor from the schema
    // keywords ajv itself reads - see `ListRunField.itemCount`. BOTH bounds
    // travel, because they are two facts: a `[N]` slot states them equal, but
    // this mapper also walks nested arrays, whose model may have stated only
    // one. Carrying a single number forced readiness and the control to read it
    // as a minimum and a maximum respectively.
    const itemCount = numOrUndef(schema.minItems);
    const maxItemCount = numOrUndef(schema.maxItems);
    return {
      ...common,
      kind: 'list',
      item,
      ...(itemCount === undefined ? {} : { itemCount }),
      ...(maxItemCount === undefined ? {} : { maxItemCount }),
    };
  }

  // Enum (a custom concept may refine a native with a fixed value set).
  if (Array.isArray(schema.enum)) {
    return { ...common, kind: 'enum', options: schema.enum.map(String) };
  }

  // Native concepts: map by concept_ref regardless of the wrapper schema shape.
  if (base) {
    if (FIELD_DOCUMENT_CONCEPTS.has(base))
      return { ...common, kind: 'document', accept: 'PDF, DOCX, TXT' };
    if (IMAGE_CONCEPTS.has(base)) return { ...common, kind: 'image', accept: 'PNG, JPG, WEBP' };

    // The three native scalars render as a bare control but travel inside the
    // content model their concept declares. `contentKey` carries that property
    // name to the value bridge, which is how the control can hold `2` while the
    // wire carries `{number: 2}`.
    const wrapper = scalarWrapper(schema, ctx);

    if (FIELD_TEXT_CONCEPTS.has(base) || HTML_CONCEPTS.has(base)) {
      // `Date` declares two properties, so no wrapper is found for it and the
      // `{text}` fallback answers instead - the recorded drift, kept until the
      // derivation swap (see `native-concepts.ts`).
      const contentKey = wrapper?.key ?? (TEXT_WRAPPER_CONCEPTS.has(base) ? 'text' : undefined);
      return ctx.depth === 0
        ? { ...common, contentKey, kind: 'prose' }
        : { ...common, contentKey, kind: 'text' };
    }
    if (NUMBER_CONCEPTS.has(base))
      return {
        ...common,
        contentKey: wrapper?.key,
        kind: 'number',
        // `NumberContent.number` is `int | float`, an unresolvable union, so the
        // control stays a float input. Constraints are read off the WRAPPED
        // property - the wrapper object never carries them, which is why the
        // outer schema always answered `undefined`.
        integer: false,
        min: numOrUndef(wrapper?.schema.minimum ?? schema.minimum),
        max: numOrUndef(wrapper?.schema.maximum ?? schema.maximum),
      };
    if (YES_NO_CONCEPTS.has(base)) return { ...common, contentKey: wrapper?.key, kind: 'boolean' };
  }

  // A custom concept whose schema looks like DocumentContent (refines Document).
  if (isDocumentObject(schema)) {
    return { ...common, kind: 'document', accept: 'PDF, DOCX, TXT' };
  }

  const type = schemaTypeOf(schema);
  switch (type) {
    case 'string': {
      if (base && (FIELD_DOCUMENT_CONCEPTS.has(base) || base === 'native.Document'))
        return { ...common, kind: 'document', accept: 'PDF, DOCX, TXT' };
      // A `date` structure field compiles to a `format: date`/`date-time`
      // string. Render it as a real date picker so the user picks a day - no
      // hand-typed timestamps - and stores a value the API accepts.
      if (schema.format === 'date' || schema.format === 'date-time')
        return { ...common, kind: 'date', datetime: schema.format === 'date-time' };
      // A top-level Text input is usually the main prompt (roomy textarea); the
      // same concept nested in a concept/list is usually a short attribute
      // (name, label) and reads better as a single line.
      const long =
        base && FIELD_TEXT_CONCEPTS.has(base)
          ? ctx.depth === 0
          : typeof schema.maxLength === 'number'
            ? schema.maxLength > 120
            : false;
      return long
        ? { ...common, kind: 'prose' }
        : { ...common, kind: 'text', placeholder: undefined };
    }
    case 'integer':
      return {
        ...common,
        kind: 'number',
        integer: true,
        min: numOrUndef(schema.minimum),
        max: numOrUndef(schema.maximum),
      };
    case 'number':
      return {
        ...common,
        kind: 'number',
        integer: false,
        min: numOrUndef(schema.minimum),
        max: numOrUndef(schema.maximum),
      };
    case 'boolean':
      return { ...common, kind: 'boolean' };
    case 'object': {
      const props = (schema.properties as Record<string, JsonSchema>) ?? {};
      const req = new Set(Array.isArray(schema.required) ? (schema.required as string[]) : []);
      const fields = Object.entries(props).map(([fieldName, fieldSchema]) =>
        mapSchema(fieldName, undefined, fieldSchema, req.has(fieldName), {
          ...ctx,
          depth: ctx.depth + 1,
        }),
      );
      return { ...common, kind: 'object', fields };
    }
    default:
      // A bare `native.Text` concept may arrive as `{type:'string'}` (handled
      // above) but a custom concept with no resolvable shape lands here.
      if (base && FIELD_TEXT_CONCEPTS.has(base))
        return ctx.depth === 0 ? { ...common, kind: 'prose' } : { ...common, kind: 'text' };
      return { ...common, kind: 'unknown' };
  }
}

function numOrUndef(v: unknown): number | undefined {
  return typeof v === 'number' ? v : undefined;
}

/**
 * Convert the API's per-input contracts into the runner's field descriptors.
 * The map's insertion order is preserved (required-first is the caller's job).
 */
export function buildRunFields(inputs: Record<string, PipeInputContract>): RunField[] {
  return Object.entries(inputs).map(([name, input]) => {
    const defs: Record<string, JsonSchema> = {};
    collectSchemaDefs(input.json_schema, defs, { traverseArrays: true });
    // A top-level input is required unless the method declared it optional (`?`).
    const field = mapSchema(name, input.concept_ref, input.json_schema, !isOptionalInput(input), {
      defs,
      depth: 0,
    });
    // Whether Run gates on it is a SEPARATE question, and it is answered by the
    // contract, not by the shape we mapped it to - see `mustBeFilled`.
    return { ...field, gating: inputMustBeFilled(input) };
  });
}
