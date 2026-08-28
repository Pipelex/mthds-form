/**
 * Bridges the `MethodRunner`'s field values to the rest of the host.
 *
 * The method-store keeps inputs in the *simplified* format and runs send the
 * *full* RJSF form shape - both already handled by `inflate/deflateAllInputs`.
 * The only gap is that a few field controls use a friendlier value than RJSF: a
 * scalar is the bare scalar where the full shape is the content model its
 * concept declares (`{ text }`, `{ number }`, `{ yes_no }`), and a file is
 * `{ url, filename }`. `fromRjsf`/`toRjsf` translate just those, so store
 * reads/writes and run payloads stay byte-for-byte compatible with the proven
 * playground path.
 *
 * Which property a scalar wraps into is NOT decided here - it arrives on the
 * descriptor as `contentKey`, derived from the contract by `buildRunFields`.
 *
 * Pure module - no React, unit-tested.
 */
import type { PipeInputFormDescriptor } from 'mthds/protocol';

import type { RunField } from './descriptor';
import { buildRunFields } from './derive';
import { ownProp } from './own-property';
import { isFilled } from './readiness';
import { isOptionalInput, isPluralInput } from './contracts';
import { deflateAllInputs, inflateAllInputs } from './wire-format';
import type { PipeIOContract, PipeInputContract } from './contracts';

type Dict = Record<string, unknown>;
type InputSchemas = Record<string, PipeInputContract>;

// ─── RJSF full shape  ↔  RunField value ──────────────────────────────────────

/**
 * Put a scalar back inside the content model its concept declares:
 * `"hi"` → `{ text: "hi" }`, `2` → `{ number: 2 }`, `false` → `{ yes_no: false }`.
 *
 * The property name comes from the DESCRIPTOR (`contentKey`, stamped by
 * `buildRunFields` - the only reader of JSON Schema). This module holds no
 * taxonomy of its own, which is the point: the version that did held a list of
 * concepts that wrap, `native.Number` was missing from it, and every run
 * carrying a number was rejected by the gate against `NumberContent`.
 *
 * A field with no `contentKey` keeps its value plain. That is not an oversight
 * either - a child property of a structured concept, or a custom concept whose
 * schema is a bare string, IS its value, and wrapping it double-nests it
 * (`{ text: { text } }`) into a payload no schema accepts.
 */
function wrapContent(field: RunField, value: unknown): unknown {
  return field.contentKey === undefined ? value : { [field.contentKey]: value };
}

/**
 * The inverse. A value that is already bare passes through untouched: persisted
 * `inputData` predates the number and yes/no wrappers, and an inputs.json
 * written by hand or by an agent says `2`, not `{number: 2}`.
 */
function unwrapContent(field: RunField, value: unknown): unknown {
  const key = field.contentKey;
  if (key === undefined || !value || typeof value !== 'object' || Array.isArray(value))
    return value;
  return ownProp(value as Record<string, unknown>, key);
}

/** How deep a nested `{ text: … }` / `{ content: … }` chain we bother unwrapping. */
const MAX_UNWRAP_DEPTH = 8;

/**
 * Pull a plain string out of whatever the store hands a text field.
 *
 * Persisted `inputData` carries historical corruptions - a double-wrapped
 * `{ text: { text } }`, a `{ concept, content }` envelope that was never
 * deflated - and the old fallback ran `String()` over them, which renders the
 * literal `"[object Object]"` into the textarea. That is worse than showing
 * nothing: it looks exactly like content the user typed, and one keystroke
 * later it is content the user typed. So unwrap the envelopes we know, and give
 * up with `undefined` (an empty field) rather than displaying garbage.
 *
 * Genuine primitives still stringify - a number or a boolean in a text slot is
 * a value, not a wrapper.
 *
 * The envelope names here are the HISTORICAL corruptions, not the wrapper key:
 * the declared wrapper is stripped by `unwrapContent` first, off the field's
 * `contentKey`, exactly as the number and boolean paths do. A text wrapper
 * whose property is not literally `text` would otherwise read back empty - and
 * one save later, BE empty.
 */
function textFromStored(value: unknown, depth = 0): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value !== 'object' || depth >= MAX_UNWRAP_DEPTH) return undefined;
  const envelope = value as { text?: unknown; content?: unknown };
  if ('text' in envelope) return textFromStored(envelope.text, depth + 1);
  if ('content' in envelope) return textFromStored(envelope.content, depth + 1);
  return undefined;
}

/** RJSF full form value → the runner's field value. */
function fromRjsf(field: RunField, value: unknown): unknown {
  switch (field.kind) {
    case 'text':
    case 'prose':
      return textFromStored(unwrapContent(field, value));
    case 'number': {
      // The control holds `number | undefined`. A numeric STRING is tolerated
      // because that is what a hand-written inputs.json tends to carry; anything
      // else empties the field rather than feeding NaN to a number input.
      const raw = unwrapContent(field, value);
      if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
      if (typeof raw === 'string' && raw.trim() !== '') {
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : undefined;
      }
      return undefined;
    }
    case 'boolean': {
      // Strictly a real boolean, deliberately: pipelex declares `YesNoContent.
      // yes_no` with `strict=True` precisely to refuse "yes"/1/"true", and
      // coercing here would smuggle back in what the runtime closed off.
      const raw = unwrapContent(field, value);
      return typeof raw === 'boolean' ? raw : undefined;
    }
    case 'unknown':
      // The escape hatch is a raw-JSON textarea, so a structured value belongs
      // there as JSON - `String(value)` would have shown "[object Object]" and
      // thrown the actual value away.
      if (typeof value === 'string') return value;
      if (value == null) return undefined;
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value, null, 2);
        } catch {
          return undefined;
        }
      }
      return String(value);
    case 'document':
    case 'image': {
      if (value && typeof value === 'object') {
        const o = value as { url?: unknown; filename?: unknown };
        return o.url
          ? { url: String(o.url), filename: o.filename as string | undefined }
          : undefined;
      }
      return typeof value === 'string' && value ? { url: value } : undefined;
    }
    case 'object': {
      const obj = (value && typeof value === 'object' ? value : {}) as Dict;
      const out: Dict = {};
      for (const child of field.fields) out[child.name] = fromRjsf(child, ownProp(obj, child.name));
      return out;
    }
    case 'list': {
      const arr = Array.isArray(value) ? value : [];
      return arr.map((item) => fromRjsf(field.item, item));
    }
    default:
      return value;
  }
}

/**
 * The runner's field value → RJSF full form value (what runs/store expect).
 *
 * `collapseEmpty` is what a SINGULAR slot does and a LIST ITEM must not: an
 * untouched structure in a singular slot is absent, but an item exists only
 * because the user added it, so adding IS the touch. Only the structure case
 * reads the flag.
 */
function toRjsf(field: RunField, value: unknown, collapseEmpty = true): unknown {
  switch (field.kind) {
    case 'text':
    case 'prose':
      return wrapContent(field, typeof value === 'string' ? value : '');
    case 'number':
      // An untouched number stays ABSENT rather than becoming an empty wrapper.
      // The gate then does the right thing on both counts: it prunes an absent
      // optional input, and it reports a required one as missing by name -
      // where `{number: undefined}` would read as a malformed value instead.
      return typeof value === 'number' && Number.isFinite(value)
        ? wrapContent(field, value)
        : undefined;
    case 'boolean':
      // `false` is a value, not an absence - hence the type test rather than a
      // truthiness one.
      return typeof value === 'boolean' ? wrapContent(field, value) : undefined;
    case 'unknown':
      return typeof value === 'string' ? value : '';
    case 'document':
    case 'image': {
      const url = value && typeof value === 'object' ? (value as { url?: unknown }).url : value;
      const filename =
        value && typeof value === 'object' ? (value as { filename?: unknown }).filename : undefined;
      return { url: url ? String(url) : '', ...(filename ? { filename } : {}) };
    }
    case 'object': {
      const obj = (value && typeof value === 'object' ? value : {}) as Dict;
      const out: Dict = {};
      for (const child of field.fields) out[child.name] = toRjsf(child, ownProp(obj, child.name));
      // A structure nobody put anything into stays ABSENT, exactly as an
      // untouched number does above - it does NOT become a shell of empty
      // children. Materializing that shell made an OPTIONAL structured input
      // unrunnable whenever its concept declared a required child: readiness
      // ignored the input (correctly - the method said it may be omitted), Run
      // lit up, and the gate then judged an object the kernel had invented
      // against the concept's full schema and rejected the run for a child the
      // user was never asked to fill.
      //
      // Emptiness is `isFilled`, the SAME predicate readiness and the wire
      // payload use, so the three cannot disagree about whether this input is
      // there. Which also says what the touch is NOT: opening the optional
      // disclosure is local view state the value never sees, so a section
      // opened and left blank collapses exactly like one never opened. What
      // keeps a structure is a VALUE in it - and then the whole shell survives,
      // empty children and all, so a required child left blank still fails, and
      // loudly.
      return collapseEmpty && !isFilled(out) ? undefined : out;
    }
    case 'list': {
      const arr = Array.isArray(value) ? value : [];
      // An item is NEVER absent: it is in the array because the user added it,
      // and `ListField`'s "Add" seeds an object item with `{}`. Letting it
      // collapse the way an untouched singular slot does put `undefined` in the
      // array, which ajv rejects as `must be object` - blocking an empty item
      // the item schema allowed, and turning a required-child complaint into a
      // type error that names nothing the user can act on.
      return arr.map((item) => toRjsf(field.item, item, false));
    }
    default:
      return value;
  }
}

// ─── Store  ↔  RunField values ──────────────────────────────────────────────

/** Seed the runner's form values from the method-store's simplified inputData. */
export function runValuesFromStore(
  inputData: Dict | undefined,
  fields: RunField[],
  inputSchemas: InputSchemas,
): Dict {
  const full = inflateAllInputs(inputData ?? {}, inputSchemas);
  const out: Dict = {};
  for (const field of fields) out[field.name] = fromRjsf(field, ownProp(full, field.name));
  return out;
}

/**
 * The runner's form values in **schema shape** - the same shape an RJSF panel
 * holds, and therefore the shape `gate.ts` validates against the per-input
 * JSON Schemas.
 *
 * Deliberately stops short of `deflateAllInputs`: deflation is the STORE's
 * compact form, and ajv validates the full one.
 */
export function rjsfDataFromRunValues(values: Dict, fields: RunField[]): Dict {
  const full: Dict = {};
  for (const field of fields) full[field.name] = toRjsf(field, ownProp(values, field.name));
  return full;
}

/** Convert the runner's form values back to the store's simplified inputData. */
export function storeInputDataFromRunValues(
  values: Dict,
  fields: RunField[],
  inputSchemas: InputSchemas,
): Dict {
  return deflateAllInputs(rjsfDataFromRunValues(values, fields), inputSchemas);
}

/**
 * Build the `{ concept, content }` map a run expects from the form values.
 *
 * The two ways a method says "this may be nothing" land differently on the wire,
 * and both matter:
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
export function apiInputsFromRunValues(
  values: Dict,
  fields: RunField[],
  inputSchemas: InputSchemas,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of fields) {
    const schema = ownProp(inputSchemas, field.name);
    if (!schema) continue;
    const value = ownProp(values, field.name);
    if (isOptionalInput(schema) && !isFilled(value)) continue;
    if (isPluralInput(schema) && !isFilled(value)) {
      out[field.name] = [];
      continue;
    }
    out[field.name] = { concept: schema.concept_ref, content: toRjsf(field, value) };
  }
  return out;
}

// ─── Pipe output → result entries ────────────────────────────────────────────

/** One named output pulled out of a run's working memory, ready to render. */
export interface OutputEntry {
  /** The output variable key (mono). */
  key: string;
  conceptRef?: string;
  value: unknown;
}

/**
 * The slice of a serialized pipe output this module actually reads. Structural
 * on purpose: the SDK's `DictPipeOutput` is the host's wire type, and the kernel
 * must not depend on `@pipelex/sdk` - the guard below verifies the shape at
 * runtime anyway.
 */
interface PipeOutputWithWorkingMemory {
  working_memory: {
    root: Record<string, unknown>;
    aliases?: Record<string, string>;
  };
}

function hasWorkingMemoryRoot(value: unknown): value is PipeOutputWithWorkingMemory {
  return (
    !!value &&
    typeof value === 'object' &&
    'working_memory' in value &&
    !!(value as { working_memory?: { root?: unknown } }).working_memory &&
    typeof (value as { working_memory: { root?: unknown } }).working_memory.root === 'object'
  );
}

/** The concept code of a working-memory entry (`{concept}` may be obj/str/absent). */
function entryConceptRef(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const raw = (data as { concept?: unknown; concept_code?: unknown }).concept;
  if (raw && typeof raw === 'object')
    return (
      ((raw as { concept_code?: string }).concept_code ?? (raw as { code?: string }).code) ||
      undefined
    );
  if (typeof raw === 'string') return raw;
  return (data as { concept_code?: string }).concept_code || undefined;
}

/**
 * Split a run's pipe output into the main result and any intermediate outputs,
 * excluding the inputs. The main output's identity comes from the working
 * memory's `main_stuff` alias (the authoritative pointer to the output variable)
 * - so its label is the REAL stuff name, not a positional guess. Falls back to
 * the last produced stuff only when the alias is absent.
 */
export function outputsFromPipeOutput(
  pipeOutput: unknown,
  inputKeys: string[],
): { main: OutputEntry; intermediates: OutputEntry[] } | null {
  if (!hasWorkingMemoryRoot(pipeOutput)) return null;
  const wm = pipeOutput.working_memory as {
    root: Record<string, unknown>;
    aliases?: Record<string, string>;
  };
  const entries = Object.entries(wm.root).filter(([key]) => !inputKeys.includes(key));
  if (entries.length === 0) return null;

  const toEntry = ([key, data]: [string, unknown]): OutputEntry => ({
    key,
    conceptRef: entryConceptRef(data),
    value: (data as { content?: unknown })?.content ?? data,
  });

  // The real main-output name: `aliases.main_stuff` → its root key.
  const mainKey = wm.aliases?.['main_stuff'];
  const mainEntry: [string, unknown] =
    mainKey && Object.prototype.hasOwnProperty.call(wm.root, mainKey)
      ? [mainKey, wm.root[mainKey]]
      : entries[entries.length - 1]!;
  const intermediates = entries.filter(([key]) => key !== mainEntry[0]).map(toEntry);

  return { main: toEntry(mainEntry), intermediates };
}

/**
 * Recover the inputs a run was executed with from its working memory. The run's
 * `working_memory.root` holds every named stuff - inputs AND outputs - keyed by
 * variable name; we pull the entries whose keys are declared inputs and deflate
 * their `content` (the full form shape) back into the store's simplified
 * `inputData`. Lets the runner repopulate the form for a past/shared run - the
 * inputs that produced the result. Returns `null` when no inputs are present.
 */
export function inputDataFromWorkingMemory(
  workingMemory: unknown,
  inputSchemas: InputSchemas,
): Dict | null {
  const root = (workingMemory as { root?: Record<string, unknown> } | null | undefined)?.root;
  if (!root || typeof root !== 'object') return null;
  const full: Dict = {};
  let found = false;
  for (const key of Object.keys(inputSchemas)) {
    const entry = ownProp(root, key);
    if (entry && typeof entry === 'object' && 'content' in entry) {
      full[key] = (entry as { content: unknown }).content;
      found = true;
    }
  }
  if (!found) return null;
  return deflateAllInputs(full, inputSchemas);
}

/**
 * Field descriptors for a method's main pipe - the wire descriptor mapped over
 * the contract, or `[]` while either artifact has not arrived yet. The
 * descriptor comes back from `validate` beside `pipe_io_contracts` when the
 * request opts in with `views: ["input_form"]`; `getPipeInputForm` is the
 * lookup that matches `getPipeIOContract`.
 */
export function fieldsForContract(
  contract: PipeIOContract | undefined,
  descriptor: PipeInputFormDescriptor | undefined,
): RunField[] {
  return contract?.inputs && descriptor ? buildRunFields(descriptor, contract.inputs) : [];
}

/**
 * Immutably set a value at a dotted/indexed path (`a.0.b`). Used to write an
 * uploaded file's URL back to a field anywhere in the (possibly nested) tree.
 */
export function setValueAtPath(root: Dict, path: string[], value: unknown): Dict {
  const head = path[0];
  if (head === undefined) return root;
  const rest = path.slice(1);
  if (rest.length === 0) return { ...root, [head]: value };

  const nextSeg = rest[0] as string;
  const child = root[head];
  if (/^\d+$/.test(nextSeg)) {
    const arr = Array.isArray(child) ? child.slice() : [];
    const idx = Number(nextSeg);
    arr[idx] =
      rest.length === 1 ? value : setValueAtPath((arr[idx] as Dict) ?? {}, rest.slice(1), value);
    return { ...root, [head]: arr };
  }
  return { ...root, [head]: setValueAtPath((child as Dict) ?? {}, rest, value) };
}
