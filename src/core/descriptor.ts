/**
 * The `RunField` descriptor - the consumer-facing currency of the form kernel.
 *
 * A method's inputs arrive from the API as two sibling artifacts: the wire
 * input-form descriptor (`input_form`, the ordered presentation view the MTHDS
 * standard specifies) and the `pipe_io_contracts` entry whose `json_schema`
 * stays the validation contract. `buildRunFields` (in `derive.ts`) maps the
 * wire descriptor structurally onto this `RunField[]` shape - so the
 * presentational field components never touch either wire artifact directly,
 * and stories can describe any input shape declaratively.
 *
 * Pure module: no React, no API calls. Trivially unit-testable.
 */

import type { InputPresence } from './contracts';

export type RunFieldKind =
  | 'text' // short single-line string
  | 'prose' // long free-text (textarea)
  | 'date' // a calendar date (schema `format: date` or `date-time`)
  | 'number' // integer or float
  | 'boolean' // true/false
  | 'enum' // pick one of a fixed set
  | 'document' // a file (PDF, docx…) by upload or URL
  | 'image' // a file rendered with a preview
  | 'object' // a structured concept with nested fields
  | 'list' // an array of one element type
  | 'unknown'; // anything we can't map → raw JSON escape hatch

export interface RunFieldCommon {
  /** The variable identifier as written in the method (rendered in mono). */
  name: string;
  /** Human label; falls back to `name` when absent. */
  title?: string;
  /** The concept this input carries, e.g. `native.Document`, `demo.Invoice`. */
  conceptRef?: string;
  /**
   * The concept's refinement chain, immediate parent first, walked to its end
   * (`['legal.BaseClause', 'native.Text']`). Straight off the wire descriptor;
   * absent when the concept refines nothing. "Does this refine `native.X`?" is
   * a membership test on this list, never shape sniffing.
   */
  refines?: string[];
  /** One-line helper text shown under the label. */
  description?: string;
  /** Required inputs always show; optional ones can collapse. */
  required: boolean;
  /**
   * The authored presence marker of the pipe's input slot, verbatim - set on
   * TOP-LEVEL fields only, like `gating`. `required` is its two-valued
   * projection (`presence !== 'optional'`); the marker itself is carried so a
   * renderer can distinguish the authored `!` assertion from a plain slot.
   */
  presence?: InputPresence;
  /**
   * The value applied when the caller omits the field - present only when a
   * default was AUTHORED, never the `null` a schema projection attaches to an
   * optional field. A defaulted field always arrives `required: false`.
   */
  defaultValue?: unknown;
  /** Example values for the field, when the wire carries any. */
  examples?: unknown[];
  /**
   * The node's effective intent hints - the flat `string → string` merge the
   * language defines, carried verbatim. Non-normative: a renderer that ignores
   * them stays correct, and nothing in the kernel's gating reads them.
   */
  hints?: Record<string, string>;
  /**
   * Whether Run waits for this input - set on TOP-LEVEL fields only, straight
   * from `inputMustBeFilled` (see `mustBeFilled` in `readiness.ts` for why this
   * is not the same question as `required`). Nested fields leave it undefined;
   * they are gated through their parent's `fieldFilled`.
   */
  gating?: boolean;
  /**
   * The single property this field's value sits inside on the wire, when its
   * concept declares a scalar content model: `native.Text` is `TextContent
   * {text}`, `native.Number` is `NumberContent {number}`, `native.YesNo` is
   * `YesNoContent {yes_no}`. The control still holds the plain scalar; the
   * value bridge wraps into this property on the way out and unwraps on the way
   * back in.
   *
   * A property NAME, never a schema - the descriptor stays the only currency
   * and `buildRunFields` stays the only reader of JSON Schema. Absent whenever
   * the value is already the whole content (a structured concept, a file, a
   * child property of a structure): wrapping those would double-nest them.
   */
  contentKey?: string;
}

/**
 * The constraint slots the two text kinds share, mapped from the wire's
 * `min_length` / `max_length` / `pattern` / `format`. `format` is the open
 * string set carrying schema formats the `date` kind does not absorb
 * (`'time'`, `'uri'`, …); a renderer may hint on it and ignore it safely.
 */
export interface TextConstraints {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

export interface TextRunField extends RunFieldCommon, TextConstraints {
  kind: 'text';
  placeholder?: string;
}

export interface ProseRunField extends RunFieldCommon, TextConstraints {
  kind: 'prose';
  placeholder?: string;
}

export interface DateRunField extends RunFieldCommon {
  kind: 'date';
  /**
   * The wire's `datetime` flag - true when the value carries a time of day
   * (the backing schema is `format: date-time`): the stored value is a full
   * RFC 3339 timestamp (`2026-07-06T00:00:00Z`) so it passes the API's
   * `date-time` validation, even though the control only asks for a day. False
   * for a bare calendar date, where the value stays `YYYY-MM-DD`.
   */
  datetime: boolean;
}

export interface NumberRunField extends RunFieldCommon {
  kind: 'number';
  integer: boolean;
  min?: number;
  max?: number;
}

export interface BooleanRunField extends RunFieldCommon {
  kind: 'boolean';
}

export interface EnumRunField extends RunFieldCommon {
  kind: 'enum';
  options: string[];
}

export interface FileRunField extends RunFieldCommon {
  kind: 'document' | 'image';
  /** Accept hint shown to the user, e.g. "PDF, PNG, JPG". */
  accept?: string;
}

export interface ObjectRunField extends RunFieldCommon {
  kind: 'object';
  fields: RunField[];
}

export interface ListRunField extends RunFieldCommon {
  kind: 'list';
  /** The element descriptor (its `name` is unused; the index labels items). */
  item: RunField;
  /**
   * The FEWEST items the slot accepts. Absent for a variable `Concept[]` list,
   * which demands none.
   *
   * On a top-level slot this is the wire descriptor's `item_count` (present
   * exactly on a fixed `[N]` slot); an engine emits `minItems`/`maxItems` = N
   * on the same slot's schema, so the number `fieldFilled` gates on and the
   * keyword ajv reads agree by construction.
   *
   * The wire never puts `item_count` on a NESTED list, but the model behind a
   * structured concept may state `minItems` on an array property of its own -
   * so on nested nodes this is read off the schema, which is the direction
   * that cannot leave readiness more permissive than the gate.
   */
  itemCount?: number;
  /**
   * The MOST items the slot accepts, off the schema's `maxItems` (which a
   * fixed `[N]` slot also states as N).
   *
   * A separate field because it is a separate fact, and conflating them is a
   * bug that hides: `itemCount` was read as a minimum by readiness and as a
   * maximum by the control that stops offering `Add`, which agree only while
   * a contract states both bounds equal. A list told "at least two" was then
   * presented as a list of exactly two.
   */
  maxItemCount?: number;
}

export interface UnknownRunField extends RunFieldCommon {
  kind: 'unknown';
}

export type RunField =
  | TextRunField
  | ProseRunField
  | DateRunField
  | NumberRunField
  | BooleanRunField
  | EnumRunField
  | FileRunField
  | ObjectRunField
  | ListRunField
  | UnknownRunField;

/** The short, friendly category label for a concept_ref (drives the pill dot). */
export type ConceptCategory =
  'text' | 'date' | 'document' | 'image' | 'number' | 'boolean' | 'choice' | 'structured' | 'list';

export function conceptCategory(field: RunField): ConceptCategory {
  switch (field.kind) {
    case 'text':
    case 'prose':
      return 'text';
    case 'date':
      return 'date';
    case 'document':
      return 'document';
    case 'image':
      return 'image';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'enum':
      return 'choice';
    case 'list':
      return 'list';
    default:
      return 'structured';
  }
}
