/**
 * Converts between the simplified inputs.json format and the full RJSF form format.
 *
 * The inputs.json file uses a SIMPLIFIED format for users:
 * - Text:       "my text"                     (instead of { text: "my text" })
 * - Document:   "file.pdf" or { url: "..." }  (instead of { url: "...", ... })
 * - Image:      same as Document
 * - Text[]:     ["t1", "t2"]
 * - Document[]: ["f1.pdf"] or [{ url: "..." }]
 * - Custom:     { concept, content }           (no simplification)
 *
 * The RJSF form uses the FULL concept structure from the json_schema.
 *
 * Two directions:
 * - deflate: form (full) → inputs.json (simplified) - for writing inputs.json / API calls
 * - inflate: inputs.json (simplified) → form (full)  - for populating the form from inputs.json
 */

import { asCalendarDate } from './date-format';
import { isWireDocumentLikeConcept, isWireTextConcept, splitListConcept } from './native-concepts';
import { hasOwnProp, ownProp } from './own-property';
import { collectSchemaDefs, resolveSchemaIndirection, schemaTypeOf } from './schema-utils';

/** The wire-format view of the native-concept taxonomy (which concept codes use
 *  simplified formats) lives in `native-concepts.ts` - including the record of
 *  where it drifts from the field mapper's view. */
function isListConcept(conceptCode: string): { isList: boolean; baseConcept: string } {
  const { base, isList } = splitListConcept(conceptCode);
  return { isList, baseConcept: base ?? '' };
}

const isTextConcept = isWireTextConcept;
const isDocumentLikeConcept = isWireDocumentLikeConcept;

// ─── Deflate: form (full) → inputs.json (simplified) ──────────────────────

/**
 * Convert a single form value to the simplified inputs.json format.
 * Used when writing inputs.json and when calling the run API.
 *
 * Rules:
 * - Text { text: "hello" } → "hello"
 * - Document { url: "file.pdf", ... } → "file.pdf" (if only url) or { url, ... }
 * - Image: same as Document
 * - Page: same as Document
 * - List types → array of deflated items
 * - Custom → { concept, content }
 */
export function deflateInput(value: unknown, conceptCode: string): unknown {
  const { isList, baseConcept } = isListConcept(conceptCode);

  if (isList) {
    const items = Array.isArray(value) ? value : [];
    // pipelex accepts Sequence[str] for list inputs, not list of dicts.
    // Always simplify list items to their scalar form (URL string for docs, plain string for text).
    return items.map((item) => deflateListItem(item, baseConcept));
  }

  return deflateSingleValue(value, baseConcept);
}

/** Deflate a single item within a list - always reduces to the simplest scalar form. */
function deflateListItem(value: unknown, concept: string): unknown {
  if (isTextConcept(concept)) {
    if (value && typeof value === 'object' && 'text' in value) {
      return (value as { text: string }).text;
    }
    return typeof value === 'string' ? value : String(value ?? '');
  }

  if (isDocumentLikeConcept(concept)) {
    // Always extract just the URL for list items - pipelex resolves metadata at runtime
    if (value && typeof value === 'object' && 'url' in value) {
      return (value as { url: string }).url;
    }
    if (typeof value === 'string') return value;
    return '';
  }

  // Custom structured concept → { concept, content }.
  //
  // IDEMPOTENT ON PURPOSE - see `unwrapAllWrappers`. Wrapping unconditionally
  // corrupted persisted inputs: a host panel seeds the form with the RAW
  // stored value when the input schemas aren't loaded yet (no dry run yet),
  // so the form could hold an ALREADY-wrapped value; the next change deflated
  // it again and saved `{ concept, content: { concept, content: {...} } }`.
  // Wrapping exactly once, whatever we're handed, makes that unreachable.
  return { concept, content: unwrapAllWrappers(value) };
}

function deflateSingleValue(value: unknown, concept: string): unknown {
  if (isTextConcept(concept)) {
    // { text: "hello" } → "hello"
    if (value && typeof value === 'object' && 'text' in value) {
      return (value as { text: string }).text;
    }
    // Already a string (passthrough)
    return typeof value === 'string' ? value : String(value ?? '');
  }

  if (isDocumentLikeConcept(concept)) {
    // Always extract just the URL - pipelex resolves metadata at runtime.
    // A bare dict without a 'concept' key is rejected by StuffFactory.
    if (value && typeof value === 'object' && 'url' in value) {
      return (value as { url: string }).url;
    }
    // Already a string URL (passthrough)
    if (typeof value === 'string') return value;
    return '';
  }

  // Custom structured concept → { concept, content }.
  //
  // IDEMPOTENT ON PURPOSE - see `unwrapAllWrappers`. Wrapping unconditionally
  // corrupted persisted inputs: a host panel seeds the form with the RAW
  // stored value when the input schemas aren't loaded yet (no dry run yet),
  // so the form could hold an ALREADY-wrapped value; the next change deflated
  // it again and saved `{ concept, content: { concept, content: {...} } }`.
  // Wrapping exactly once, whatever we're handed, makes that unreachable.
  return { concept, content: unwrapAllWrappers(value) };
}

// ─── Inflate: inputs.json (simplified) → form (full) ──────────────────────

/**
 * Convert a simplified inputs.json value to the full form structure.
 * Used when populating the RJSF form from inputs.json.
 *
 * Rules:
 * - "hello" → { text: "hello" } (for Text concepts)
 * - "file.pdf" → { url: "file.pdf" } (for Document/Image/Page concepts)
 * - { url: "..." } → passthrough (already full)
 * - ["t1", "t2"] → inflated array of items
 * - { concept, content } → content (for custom concepts)
 */
export function inflateInput(value: unknown, conceptCode: string): unknown {
  const { isList, baseConcept } = isListConcept(conceptCode);

  if (isList) {
    // The sandbox may write the wrapped form at the LIST level:
    // { concept: "native.Document", content: [item, item] } - pipelex accepts it.
    // Unwrap before the array check, otherwise the wrapper itself gets treated
    // as a single list item and inflates to one empty entry.
    const unwrapped = isWrappedForm(value) ? value.content : value;
    // Handle: array (correct), single object (legacy/form default), or null/undefined
    let items: unknown[];
    if (Array.isArray(unwrapped)) {
      items = unwrapped;
    } else if (unwrapped != null && typeof unwrapped === 'object') {
      // Single object instead of array (e.g., {"url": ""} from form default) - wrap it
      items = [unwrapped];
    } else {
      items = [];
    }
    return items.map((item) => inflateSingleValue(item, baseConcept));
  }

  return inflateSingleValue(value, baseConcept);
}

/** Known optional fields on DocumentContent (from pipelex Pydantic model). */
const DOCUMENT_FIELDS = new Set(['url', 'public_url', 'mime_type', 'filename', 'title', 'snippet']);

/** Returns true if the object looks like a DocumentContent (has any known doc field). */
function looksLikeDocument(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).some((k) => DOCUMENT_FIELDS.has(k));
}

/**
 * Detect the fully-qualified wrapper form `{ concept: "...", content: ... }`.
 * pipelex accepts this for any concept (native or custom), and the mthds-inputs
 * agent skill writes it by default for disambiguation. We unwrap before applying
 * concept-specific inflation so the form populates correctly.
 */
function isWrappedForm(value: unknown): value is { concept: string; content: unknown } {
  return (
    !!value &&
    typeof value === 'object' &&
    'concept' in value &&
    'content' in value &&
    typeof (value as { concept: unknown }).concept === 'string'
  );
}

function inflateSingleValue(value: unknown, concept: string): unknown {
  // Unwrap { concept, content } for native concepts - the content IS the value.
  // For custom concepts we unwrap below (historical behaviour) but after concept-specific checks.
  if (isWrappedForm(value) && (isTextConcept(concept) || isDocumentLikeConcept(concept))) {
    return inflateSingleValue(value.content, concept);
  }

  if (isTextConcept(concept)) {
    // "hello" → { text: "hello" }
    if (typeof value === 'string') {
      return { text: value };
    }
    // Already full structure { text: "..." }
    if (value && typeof value === 'object' && 'text' in value) {
      return value;
    }
    return { text: '' };
  }

  if (isDocumentLikeConcept(concept)) {
    // "file.pdf" → { url: "file.pdf" }
    if (typeof value === 'string') {
      return { url: value };
    }
    // Already full structure { url: "..." }
    if (value && typeof value === 'object' && 'url' in value) {
      return value;
    }
    // Object without url key but with other document fields (e.g. from RJSF defaults)
    // Ensure the required url field is present
    if (value && typeof value === 'object' && looksLikeDocument(value as Record<string, unknown>)) {
      return { ...(value as Record<string, unknown>), url: '' };
    }
    return { url: '' };
  }

  // Custom structured: unwrap { concept, content } → content.
  //
  // Unwrap REPEATEDLY. `deflateSingleValue` used to wrap unconditionally, so a
  // form change made while the input schemas weren't loaded yet re-wrapped an
  // already-wrapped value and persisted `{ concept, content: { concept,
  // content: {...} } }` to DynamoDB. Unwrapping a single level left the FORM
  // holding `{ concept, content }` - properties no schema declares, so RJSF
  // matched nothing and rendered every field empty, with the real values
  // sitting one level deeper. Deflate is idempotent now, but the corrupted
  // shape survives in persisted inputData, so this heals it on read.
  return unwrapAllWrappers(value);
}

/** Strip every `{ concept, content }` layer - one, or the double wrap a
 *  non-idempotent deflate persisted. */
function unwrapAllWrappers(value: unknown): unknown {
  let current = value;
  while (isWrappedForm(current)) {
    current = current.content;
  }
  // A `{ content }` with no `concept` is the historical half-wrapper.
  if (current && typeof current === 'object' && !Array.isArray(current) && 'content' in current) {
    return (current as { content: unknown }).content;
  }
  return current;
}

// ─── Schema helpers ─────────────────────────────────────────────────────

interface InputSchema {
  concept_ref: string;
  json_schema?: Record<string, unknown>;
}

/**
 * The validation API returns concept_ref WITHOUT the [] suffix for list inputs.
 * The array-ness is only encoded in json_schema.type === "array".
 * This helper resolves the correct concept ref by checking the schema.
 */
export function resolveConceptCode(schema: InputSchema): string {
  const code = schema.concept_ref;
  // Defensive: a malformed/partial contract entry (missing concept) must
  // degrade, never throw and blank the whole input panel.
  if (!code) return '';
  if (!code.endsWith('[]') && (schema.json_schema as Record<string, unknown>)?.type === 'array') {
    return code + '[]';
  }
  return code;
}

// ─── Batch helpers for full inputData objects ────────────────────────────

/**
 * Deflate all inputs from form format to simplified inputs.json format.
 * Used by InputConfigPanel when preparing data for the run API.
 */
export function deflateAllInputs(
  formData: Record<string, unknown>,
  inputSchemas: Record<string, InputSchema>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [stuffName, schema] of Object.entries(inputSchemas)) {
    result[stuffName] = deflateInput(ownProp(formData, stuffName), resolveConceptCode(schema));
  }
  return result;
}

/**
 * Heal values against their json_schema: the run-form bridge used to
 * double-wrap plain string properties as `{ text: "..." }` (fixed in
 * run-values.ts, but the corrupted shape survives in persisted inputData -
 * store and server copies). Wherever the schema expects a string but the
 * value is a lone `{ text: string }` wrapper, unwrap it. Walks nested
 * objects and arrays, resolving `#/$defs/...` refs against the root schema;
 * anything already valid passes through untouched.
 */
export function healStringWrappers(
  value: unknown,
  rawSchema: Record<string, unknown> | undefined,
  defs?: Record<string, Record<string, unknown>>,
): unknown {
  if (!rawSchema || value == null) return value;

  // Resolve $ref / nullable-anyOf indirection (Pydantic emits `{$ref}` for
  // nested models and `anyOf: [T, {type:'null'}]` for optionals). The `$defs`
  // walk deliberately keeps its historical no-array-traversal mode - see
  // `CollectDefsOptions` in schema-utils.
  const allDefs = defs ?? collectSchemaDefs(rawSchema, {}, { traverseArrays: false });
  const schema = resolveSchemaIndirection(rawSchema, allDefs);
  const type = schemaTypeOf(schema);

  // A `format: date` field takes a calendar date ALONE. `DateContent` in pipelex
  // enforces that with a `mode="before"` validator (`_reject_lax_temporal`) that
  // deliberately closes pydantic's lax coercion - a datetime string on `date`
  // would silently drop its time and offset (DT3, "no silent midnight"), so the
  // runner answers a 500, not a coercion.
  //
  // An agent-written or hand-written inputs.json says `"2026-07-06T00:00:00Z"`
  // anyway - that is how every system exports a date. So NORMALIZE it here to
  // the day it denotes rather than forwarding it to fail at the runner: the
  // padding is noise, and dropping noise is not the fidelity loss DT3 forbids.
  // A value carrying a REAL time (15:40) returns null and is left untouched -
  // it must fail, because silently discarding it is precisely the corruption
  // the rule exists to prevent.
  if (type === 'string' && schema.format === 'date' && typeof value === 'string') {
    return asCalendarDate(value) ?? value;
  }

  if (type === 'string') {
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length === 1 &&
      typeof (value as { text?: unknown }).text === 'string'
    ) {
      return (value as { text: string }).text;
    }
    return value;
  }
  if (type === 'object' && typeof value === 'object' && !Array.isArray(value)) {
    const props = schema.properties as Record<string, Record<string, unknown>> | undefined;
    if (!props) return value;
    const out = { ...(value as Record<string, unknown>) };
    for (const [key, propSchema] of Object.entries(props)) {
      if (hasOwnProp(out, key)) out[key] = healStringWrappers(out[key], propSchema, allDefs);
    }
    return out;
  }
  if (type === 'array' && Array.isArray(value)) {
    const items = schema.items as Record<string, unknown> | undefined;
    return value.map((item) => healStringWrappers(item, items, allDefs));
  }
  return value;
}

/** Nothing left worth sending, once this value has itself been pruned. */
function isEmptyAfterPruning(value: unknown): boolean {
  if (value === '' || value === null || value === undefined) return true;
  // An object whose every property was itself pruned away carries nothing, and
  // that is what an untouched OPTIONAL STRUCTURED input looks like by the time
  // it reaches here - a shell of empty children, emptied out. Keeping the `{}`
  // handed it to ajv against the concept's full schema, which rejected the run
  // for a required child of an input the method said may be omitted. Dropping
  // it is the same judgement the wire payload already makes one step later
  // (`apiInputsFromSchemaData` omits it as unfilled); making the prune agree is
  // what stops the gate from failing a run it was about to omit anyway.
  //
  // An empty ARRAY is deliberately NOT empty: a plural slot is never absent in
  // MTHDS - its empty form IS the empty list - so dropping it would invent an
  // absence the method cannot express.
  return typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0;
}

/**
 * Drop optional properties the user never filled, so an untouched field cannot
 * fail validation or reach the API as an empty string.
 *
 * RJSF fills EVERY unset string property with `""` on mount. That is harmless
 * for a plain string, but `prepareSchemaForRjsf` collapses pydantic's
 * `anyOf: [T, null]` by dropping the null branch, so an optional *constrained*
 * field - `DateContent.time`, declared `datetime.time | None` and rendered
 * `{ type: "string", format: "time" }` - is left demanding a well-formed time.
 * `""` is not one, and the run was blocked on a field the user never opened.
 *
 * Pruning is the semantically correct repair, not a validation dodge: for
 * pipelex an absent optional field IS `None`, and `""` would fail pydantic at
 * the runner just as it fails ajv here. Only properties absent from their
 * parent's `required` are dropped - an empty REQUIRED field must still fail, so
 * the user is told about it.
 *
 * What counts as empty is `isEmptyAfterPruning`, and it includes an optional
 * STRUCTURE the user never opened, on exactly the same grounds.
 */
export function pruneEmptyOptionals(
  value: unknown,
  rawSchema: Record<string, unknown> | undefined,
  defs?: Record<string, Record<string, unknown>>,
): unknown {
  if (!rawSchema || value == null) return value;

  const allDefs = defs ?? collectSchemaDefs(rawSchema, {}, { traverseArrays: false });
  const schema = resolveSchemaIndirection(rawSchema, allDefs);
  const type = schemaTypeOf(schema);

  if (type === 'array' && Array.isArray(value)) {
    const items = schema.items as Record<string, unknown> | undefined;
    return value.map((item) => pruneEmptyOptionals(item, items, allDefs));
  }
  if (type !== 'object' || typeof value !== 'object' || Array.isArray(value)) return value;

  const props = schema.properties as Record<string, Record<string, unknown>> | undefined;
  if (!props) return value;
  const required = new Set(Array.isArray(schema.required) ? (schema.required as string[]) : []);
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const propSchema = ownProp(props, key);
    if (!propSchema) {
      out[key] = raw;
      continue;
    }
    const pruned = pruneEmptyOptionals(raw, propSchema, allDefs);
    if (isEmptyAfterPruning(pruned) && !required.has(key)) continue;
    out[key] = pruned;
  }
  return out;
}

/**
 * Inflate all inputs from simplified inputs.json format to form format.
 * Used by onInputUpdate when receiving inputs.json changes from the sandbox.
 */
export function inflateAllInputs(
  simplifiedData: Record<string, unknown>,
  inputSchemas: Record<string, InputSchema>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [stuffName, value] of Object.entries(simplifiedData)) {
    const schema = ownProp(inputSchemas, stuffName);
    if (schema) {
      result[stuffName] = healStringWrappers(
        inflateInput(value, resolveConceptCode(schema)),
        schema.json_schema,
      );
    } else {
      // Unknown input - pass through unchanged
      result[stuffName] = value;
    }
  }
  return result;
}
