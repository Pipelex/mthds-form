/**
 * The native-concept taxonomy, stated ONCE - with each call path's historical
 * view exported explicitly, because the three copies this consolidates had
 * DRIFTED and K1 preserves each path's observable behavior exactly (see
 * `concept-taxonomy-characterization.test.ts`).
 *
 * The drift, recorded for M1 (where the server-derived descriptor retires this
 * module entirely):
 *
 * | concept | field mapper (render)     | wire format (deflate/inflate) | value bridge (`{text}` wrap) |
 * | ------- | ------------------------- | ----------------------------- | ---------------------------- |
 * | Text    | text/prose                | bare string                   | wraps                        |
 * | Date    | text/prose (NOT a picker) | CUSTOM `{concept, content}`   | wraps                        |
 * | HTML    | text/prose                | CUSTOM `{concept, content}`   | wraps                        |
 * | Page    | document                  | document-like (bare URL)      | -                            |
 *
 * A `Date` input therefore ships as `{concept: "native.Date", content: {text}}`
 * today - consistent end-to-end, but not DateContent. Changing that is a
 * wire-visible fix and belongs to M1, not K1.
 */

/** Both spellings a concept ref uses: bare (`Text`) and namespaced (`native.Text`). */
function nativeSet(...names: string[]): ReadonlySet<string> {
  return new Set(names.flatMap((n) => [n, `native.${n}`]));
}

export const TEXT_CONCEPTS = nativeSet('Text');
export const DATE_CONCEPTS = nativeSet('Date');
export const HTML_CONCEPTS = nativeSet('HTML');
export const DOCUMENT_CONCEPTS = nativeSet('Document');
export const PAGE_CONCEPTS = nativeSet('Page');
export const IMAGE_CONCEPTS = nativeSet('Image');
export const INTEGER_CONCEPTS = nativeSet('Integer');
export const NUMBER_CONCEPTS = nativeSet('Number', 'Float');
export const BOOLEAN_CONCEPTS = nativeSet('Boolean');

// ─── The field mapper's view (field-model.ts) ───────────────────────────────

/** Concepts the mapper renders as text/prose - `Date` deliberately included
 *  (a `native.Date` input renders as prose today, not as a date picker). */
export const FIELD_TEXT_CONCEPTS: ReadonlySet<string> = new Set([
  ...TEXT_CONCEPTS,
  ...DATE_CONCEPTS,
]);

/** Concepts the mapper renders as a document upload - `Page` folded in. */
export const FIELD_DOCUMENT_CONCEPTS: ReadonlySet<string> = new Set([
  ...DOCUMENT_CONCEPTS,
  ...PAGE_CONCEPTS,
]);

// ─── The wire format's view (input-format.ts) ───────────────────────────────

/** True when the simplified wire form is a bare string (`{text} ↔ "..."`).
 *  `Date` and `HTML` are NOT here: they travel through the custom-concept
 *  `{concept, content}` branch (the drift the header records). */
export function isWireTextConcept(concept: string): boolean {
  return TEXT_CONCEPTS.has(concept);
}

/** True when the simplified wire form is a bare URL string. */
export function isWireDocumentLikeConcept(concept: string): boolean {
  return (
    DOCUMENT_CONCEPTS.has(concept) || IMAGE_CONCEPTS.has(concept) || PAGE_CONCEPTS.has(concept)
  );
}

// ─── The value bridge's view (run-values.ts) ────────────────────────────────

/**
 * Concepts whose full (RJSF) form value is the pydantic text wrapper `{ text }`.
 * Only a field that IS one of these concepts gets wrapped in `toRjsf`. A child
 * string property (`conceptRef` undefined) or a custom concept with a bare
 * string schema must stay a plain string - wrapping those double-nests the
 * value (`{ text: { text } }`), which fails schema validation and corrupts run
 * payloads.
 */
export const TEXT_WRAPPER_CONCEPTS: ReadonlySet<string> = new Set([
  ...TEXT_CONCEPTS,
  ...DATE_CONCEPTS,
  ...HTML_CONCEPTS,
]);

// ─── List refs ──────────────────────────────────────────────────────────────

/** A concept ref like `native.Document[]` → base `native.Document`, isList true. */
export function splitListConcept(conceptRef: string | undefined): {
  base?: string;
  isList: boolean;
} {
  if (!conceptRef) return { isList: false };
  if (conceptRef.endsWith('[]')) return { base: conceptRef.slice(0, -2), isList: true };
  return { base: conceptRef, isList: false };
}
