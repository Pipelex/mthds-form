/**
 * The `RunField` descriptor - the consumer-facing currency of the form kernel.
 *
 * A method's inputs arrive from the API as a map of variable name →
 * `PipeInputContract` ({ concept_ref, json_schema }). That JSON Schema is rich
 * (Pydantic-generated) and not pleasant to render directly. `buildRunFields`
 * (in `derive.ts`) normalizes it once into a flat, recursive `RunField[]`
 * descriptor that the presentational field components consume - so the
 * components never touch raw JSON Schema, and stories can describe any input
 * shape declaratively.
 *
 * Pure module: no React, no API calls. Trivially unit-testable.
 */

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
  /** One-line helper text shown under the label. */
  description?: string;
  /** Required inputs always show; optional ones can collapse. */
  required: boolean;
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

export interface TextRunField extends RunFieldCommon {
  kind: 'text';
  placeholder?: string;
}

export interface ProseRunField extends RunFieldCommon {
  kind: 'prose';
  placeholder?: string;
}

export interface DateRunField extends RunFieldCommon {
  kind: 'date';
  /**
   * True when the backing schema is `format: date-time`: the stored value is a
   * full RFC 3339 timestamp (`2026-07-06T00:00:00Z`) so it passes the API's
   * `date-time` validation, even though the control only asks for a day. False
   * for a bare `format: date`, where the value stays `YYYY-MM-DD`.
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
