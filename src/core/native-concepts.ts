/**
 * The native-concept taxonomy, stated ONCE - with each call path's historical
 * view exported explicitly, because the three copies this consolidates had
 * DRIFTED and K1 preserved each path's observable behavior exactly (see
 * `concept-taxonomy-characterization.test.ts`).
 *
 * The sets below spell the codes MTHDS actually defines (the `native` domain of
 * the language spec). That is not pedantry: a set that named a concept the
 * language does not have is what broke `native.Number`, because the render path
 * knew the concept and the value path did not.
 *
 * The drift, recorded for M1 (where the server-derived descriptor retires this
 * module entirely):
 *
 * | concept | field mapper (render)     | wire format (deflate/inflate) | value bridge (content wrapper) |
 * | ------- | ------------------------- | ----------------------------- | ------------------------------ |
 * | Text    | text/prose                | bare string                   | `{text}`, from `TextContent`   |
 * | Number  | number                    | `{concept, content}`          | `{number}`, from `NumberContent` |
 * | YesNo   | boolean                   | `{concept, content}`          | `{yes_no}`, from `YesNoContent` |
 * | Date    | text/prose (NOT a picker) | CUSTOM `{concept, content}`   | `{text}` - WRONG, see below    |
 * | Html    | nested object             | `{concept, content}`          | -                              |
 * | Page    | document                  | document-like (bare URL)      | -                              |
 *
 * A `Date` input therefore ships as `{concept: "native.Date", content: {text}}`
 * today - consistent end-to-end, but not `DateContent {date, time}`. Changing
 * that is a wire-visible fix and belongs to M1, not here.
 *
 * `HTML_CONCEPTS` below spells the code `HTML`; the language spells it `Html`
 * (`NativeConceptCode.HTML = "Html"`), so the set matches nothing a real
 * contract carries and `native.Html` falls through to the generic object
 * dispatch - a nested card over `HtmlContent {inner_html, css_class}`, which
 * round-trips correctly. Correcting the spelling would route `native.Html` into
 * the prose-plus-`{text}` drift above and BREAK inputs that work today, so the
 * spelling is left alone deliberately and goes with the Date fix at M1.
 */

/** Both spellings a concept ref uses: bare (`Text`) and namespaced (`native.Text`). */
function nativeSet(...names: string[]): ReadonlySet<string> {
  return new Set(names.flatMap((n) => [n, `native.${n}`]));
}

export const TEXT_CONCEPTS = nativeSet('Text');
export const DATE_CONCEPTS = nativeSet('Date');
/** Deliberately the code the language does NOT use - see the header. */
export const HTML_CONCEPTS = nativeSet('HTML');
export const DOCUMENT_CONCEPTS = nativeSet('Document');
export const PAGE_CONCEPTS = nativeSet('Page');
export const IMAGE_CONCEPTS = nativeSet('Image');
export const NUMBER_CONCEPTS = nativeSet('Number');
export const YES_NO_CONCEPTS = nativeSet('YesNo');

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
 *  `Date` is NOT here: it travels through the custom-concept `{concept,
 *  content}` branch (the drift the header records). */
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
 * The FALLBACK text wrapper, for a text concept whose contract declares no
 * single-property content model to read the wrapper name off.
 *
 * The wrapper property is normally derived from the declared schema, in
 * `derive.ts`, and travels on the descriptor as `RunField.contentKey` - so the
 * value bridge wraps by name and holds no taxonomy of its own. This set is what
 * answers when that derivation finds nothing:
 *
 * - `native.Text` with a degenerate contract (a bare `{type: 'object'}`, or a
 *   bare `{type: 'string'}`) still wraps as `{text}`, as it always has;
 * - `native.Date` declares `DateContent {date, time}` - two properties, so no
 *   single wrapper - and this set is what keeps it wrapping as `{text}`. That
 *   is the recorded drift, preserved on purpose until M1.
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
