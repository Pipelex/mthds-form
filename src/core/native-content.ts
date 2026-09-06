/**
 * How to READ the native content models — the result side's twin of
 * `./file-formats`.
 *
 * A renderer handed a result knows the field's `kind` from the descriptor, and
 * for the kinds whose value is a structured content model rather than a bare
 * scalar (`document`, `image`, `date`) it must then read that model's members.
 * **That is reading the standard, not sniffing at it.** The distinction is the
 * whole reason this module exists as data rather than as heuristics inside a
 * control: a reader keyed by a STATED kind consults a pinned definition, where
 * a reader that works out *which* kind it is holding by counting properties is
 * guessing — and guessing is exactly what [../../docs/derivation-swap.md]
 * records removing from the input side.
 *
 * ## Where each shape comes from
 *
 * `native.Image` and `native.Document` are pinned by the standard, in
 * `docs/spec/native-concepts.md` § "The Pinned Set (MTHDS 1.0.0)". Both carry a
 * required `url` — a storage URI, an HTTP(S) URL, or a base64 data URL — and
 * optional presentation members beside it. Nothing here adds a member the spec
 * does not state.
 *
 * `native.Date` is pinned the same way (`{date, time}`), but a `date` FIELD
 * inside a structured concept is not a `native.Date` value: it is a python
 * `datetime.date`, and the serialization layer stamps it with its class. So a
 * date arrives in one of three legal shapes, all three of which a run really
 * produces:
 *
 *   "2026-03-14"                                             a plain ISO string
 *   { date: "2026-03-14", __class__: "date", … }             a typed scalar
 *   { date: "2026-03-14", time: "15:40:00" }                 native.Date
 *
 * The typed-scalar envelope is the one shape the standard does NOT pin — it is
 * a serialization fact, measured off a real run rather than read off a spec —
 * and it is called out as such here so nobody mistakes it for normative.
 *
 * This module lives in core, not beside the control that renders it, for the
 * reason `file-formats.ts` established: a host that shows a result its own way
 * needs the same answer the control uses, and two copies of an answer is two
 * places for it to drift. Pure data and pure functions — no React.
 */

import { hasOwnProp, ownProp } from './own-property';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A member the content models declare as `type = "text"`, when it is one. */
function readText(record: Record<string, unknown>, key: string): string | undefined {
  const value = ownProp(record, key);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = ownProp(record, key);
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * `native.Document`, read.
 *
 * `url` is the only required member; everything else is a producer's courtesy,
 * so a reader that demands any of them describes a value the standard permits
 * as malformed.
 */
export interface DocumentContentView {
  url: string;
  publicUrl?: string;
  mimeType?: string;
  filename?: string;
  title?: string;
  snippet?: string;
}

/** `native.Image`, read. `width`/`height` are optional but PAIRED by the spec. */
export interface ImageContentView {
  url: string;
  publicUrl?: string;
  caption?: string;
  mimeType?: string;
  filename?: string;
  width?: number;
  height?: number;
  sourcePrompt?: string;
}

/** `native.Date` (and the typed-scalar envelope a nested `date` field arrives in). */
export interface DateContentView {
  /** ISO 8601 calendar date, `YYYY-MM-DD`. */
  date: string;
  /** ISO 8601 time of day, present only when the source stated one. */
  time?: string;
}

/**
 * Read a `document`-kind value. `undefined` when the value carries no `url`,
 * which is the one member the standard requires — a caller renders its own
 * absence rather than being handed a half-value to test.
 */
export function readDocumentContent(value: unknown): DocumentContentView | undefined {
  if (!isRecord(value)) return undefined;
  const url = readText(value, 'url');
  if (url === undefined) return undefined;
  return {
    url,
    publicUrl: readText(value, 'public_url'),
    mimeType: readText(value, 'mime_type'),
    filename: readText(value, 'filename'),
    title: readText(value, 'title'),
    snippet: readText(value, 'snippet'),
  };
}

/** Read an `image`-kind value. Same contract as `readDocumentContent`. */
export function readImageContent(value: unknown): ImageContentView | undefined {
  if (!isRecord(value)) return undefined;
  const url = readText(value, 'url');
  if (url === undefined) return undefined;
  return {
    url,
    publicUrl: readText(value, 'public_url'),
    caption: readText(value, 'caption'),
    mimeType: readText(value, 'mime_type'),
    filename: readText(value, 'filename'),
    width: readNumber(value, 'width'),
    height: readNumber(value, 'height'),
    sourcePrompt: readText(value, 'source_prompt'),
  };
}

/**
 * `native.Html`, read.
 *
 * The only content model here that is NOT reached by a field kind, and the
 * reason is a deliberate decision of the standard: the kind vocabulary has no
 * `html` member, so a `native.Html` value is an `object` node over its two
 * declared fields. That is right for the descriptor — the kinds name how a value
 * is ENTERED, and markup is entered as text — and wrong for a result view, which
 * would otherwise print a page's source at a reader.
 *
 * So this one is keyed by CONCEPT rather than by kind, through
 * `isNativeHtmlNode` below. That is a membership test on facts the descriptor
 * states (`concept_ref`, `refines`), which the standard's own page calls out as
 * the supported way to ask "does this refine `native.X`?" — the opposite of
 * inspecting a value to guess what it is.
 */
export interface HtmlContentView {
  /** The markup itself. The one required member. */
  innerHtml: string;
  /** A class name for a wrapper a consumer may put around it, when stated. */
  cssClass?: string;
}

/** Read an `native.Html` value. `undefined` when it carries no markup. */
export function readHtmlContent(value: unknown): HtmlContentView | undefined {
  if (!isRecord(value)) return undefined;
  const innerHtml = readText(value, 'inner_html');
  if (innerHtml === undefined) return undefined;
  return { innerHtml, cssClass: readText(value, 'css_class') };
}

/** The concept refs whose content model is multi-property, spelled once each. */
export const NATIVE_HTML_CONCEPT_REF = 'native.Html';
export const NATIVE_DATE_CONCEPT_REF = 'native.Date';
export const NATIVE_COMPOSITE_CONCEPT_REF = 'native.Composite';

/** One member of a composite: the name it was composed under, and its content. */
export interface CompositeMember {
  name: string;
  value: unknown;
}

/**
 * Read a `native.Composite` — a named composition of contents.
 *
 * The members are returned in the order the payload states them, which is the
 * order the method composed them in and the only order there is: a composite
 * declares no fields, so there is no authored order to prefer over it.
 *
 * `undefined` for anything that is not a record, so the caller falls back.
 */
export function readCompositeContent(value: unknown): CompositeMember[] | undefined {
  if (!isRecord(value)) return undefined;
  return Object.entries(value).map(([name, member]) => ({ name, value: member }));
}

/**
 * Whether a descriptor node carries markup — its concept IS `native.Html`, or
 * refines it.
 *
 * The refinement chain is checked, not just the leaf, because a method may
 * declare `legal.ClauseMarkup` refining `native.Html` and a reader of that result
 * wants the markup rendered just the same. `refines` is on the wire for exactly
 * this question.
 */
export function isNativeHtmlNode(node: {
  conceptRef?: string;
  refines?: readonly string[];
}): boolean {
  return refinesNative(node, NATIVE_HTML_CONCEPT_REF);
}

/**
 * Whether a node IS a `native.Date` — the other content model the kind
 * vocabulary cannot name.
 *
 * `native.Date` is `{date, time}`, two properties, so nothing unwraps it and its
 * node is an `object`. Correct for the descriptor and wrong for a reader: a date
 * result rendered structurally is a two-field card whose second field says "not
 * provided", where the answer is a date. The `date` ARM already reads exactly
 * this model — `readDateContent` takes `{date, time}` — it just never fires,
 * because the kind says `object`.
 *
 * A `date` FIELD inside a structure is a different thing and needs none of this:
 * it carries `kind: "date"` already.
 */
export function isNativeDateNode(node: {
  conceptRef?: string;
  refines?: readonly string[];
}): boolean {
  return refinesNative(node, NATIVE_DATE_CONCEPT_REF);
}

/**
 * Whether a node is a `native.Composite` — a named bag of contents.
 *
 * The third concept the kind vocabulary cannot name, and the one where it is
 * least able to: a composite declares no members at all, so its descriptor is
 * `kind: "unknown"` and its payload schema is `{additionalProperties: true}`
 * with no properties. Both are TRUE — the standard's escape hatch, honestly
 * used — and both leave a renderer with nothing to read, so the default
 * fallback prints the whole thing as a JSON blob.
 *
 * That is the worst available answer to a value that is, by definition, a map
 * of ordinary `StuffContent`s. Keyed by concept, a renderer can at least show
 * the members as the named things they are. See `CompositeValue`.
 */
export function isNativeCompositeNode(node: {
  conceptRef?: string;
  refines?: readonly string[];
}): boolean {
  return refinesNative(node, NATIVE_COMPOSITE_CONCEPT_REF);
}

/** Its concept IS the named native, or refines it. */
function refinesNative(
  node: { conceptRef?: string; refines?: readonly string[] },
  ref: string,
): boolean {
  if (node.conceptRef === ref) return true;
  return node.refines?.includes(ref) ?? false;
}

/**
 * Read a `date`-kind value, in any of the three shapes a run produces.
 *
 * The `date` member is read one level deep, because `native.Date`'s own `date`
 * member is a `datetime.date` and therefore arrives inside the same typed-scalar
 * envelope the whole value may already be wrapped in. One level is enough and
 * the recursion is bounded on purpose: a second envelope would be a
 * serialization bug, and following it forever would turn one into a hang.
 */
export function readDateContent(value: unknown): DateContentView | undefined {
  if (typeof value === 'string') {
    return value.length > 0 ? { date: value } : undefined;
  }
  if (!isRecord(value)) return undefined;

  const inner = ownProp(value, 'date');
  const date =
    typeof inner === 'string' ? inner : isRecord(inner) ? readText(inner, 'date') : undefined;
  if (date === undefined) return undefined;
  return { date, time: readText(value, 'time') };
}

/** `{date}` / `{date, time}` as one line, which is how both are read aloud. */
export function formatDateContent(content: DateContentView): string {
  return content.time ? `${content.date} ${content.time}` : content.date;
}

/**
 * The media types a `data:` URL may carry and still be viewable.
 *
 * An allow-list rather than a deny-list, because the question a sink asks is
 * "can this paint without executing", and only a closed set answers it. The
 * raster types are the ones the preview arms already name; `application/pdf` is
 * here because the input control previews a `data:application/pdf` value a
 * storage-less host wrote back, through an `<object>`, and reads this same
 * predicate to decide.
 *
 * `image/svg+xml` is deliberately absent: an SVG paints as a picture and
 * EXECUTES as a document the moment it is opened in a tab, which is one click
 * away from every image this package paints.
 */
const VIEWABLE_DATA_MEDIA_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
  'application/pdf',
]);

/**
 * An origin no host can be, to resolve a relative reference against.
 *
 * `.invalid` is reserved by RFC 2606 and resolves nowhere, so nothing can be
 * fetched from it by accident. It exists only so a path can be parsed at all;
 * the answer taken from the parse is whether the reference STAYED on it.
 */
const RELATIVE_SENTINEL_ORIGIN = 'https://url-gate.invalid';

/**
 * What the WHATWG URL parser strips before it parses, applied before we judge.
 *
 * Leading and trailing C0 controls and spaces are removed, and every internal
 * tab, line feed and carriage return. This is not tidying: a scheme test run on
 * the raw string and a browser running on the parsed one disagree about
 * `" https://cdn/x.png"` — `new URL()` reads it as `https:` and `/^https?:/`
 * does not — and a host that validated a member by parsing while this gate
 * prefix-matched would have judged a different string than the one painted.
 */
function stripUrlWhitespace(candidate: string): string {
  // Written out rather than as a character-class regex: the range IS the control
  // characters, which is exactly what a regex may not spell (`no-control-regex`).
  let start = 0;
  let end = candidate.length;
  while (start < end && candidate.charCodeAt(start) <= 0x20) start += 1;
  while (end > start && candidate.charCodeAt(end - 1) <= 0x20) end -= 1;
  let stripped = '';
  for (let index = start; index < end; index += 1) {
    const code = candidate.charCodeAt(index);
    // Tab, line feed, carriage return - removed wherever they appear, not only
    // at the edges, which is what the parser does with them.
    if (code !== 0x09 && code !== 0x0a && code !== 0x0d) stripped += candidate[index];
  }
  return stripped;
}

/** The media type a `data:` URL declares, lowercased; `text/plain` when it declares none. */
function dataUrlMediaType(parsed: URL): string {
  const declared = parsed.pathname.split(/[;,]/, 1)[0] ?? '';
  const trimmed = declared.trim().toLowerCase();
  return trimmed === '' ? 'text/plain' : trimmed;
}

/**
 * The URL a browser can paint, normalised — or `undefined` when there is none.
 *
 * **The string this returns is the string a sink must use.** That is the whole
 * point of returning one rather than answering yes or no: the gate judges a
 * normalised URL, so handing the caller back the raw member would let the two
 * diverge again on exactly the whitespace the parser strips.
 *
 * The gate parses rather than prefix-matches, and branches on the protocol the
 * parser reports:
 *
 * - `http:` and `https:` are viewable.
 * - `blob:` is viewable. A blob URL is bound to the origin that minted it, so a
 *   payload cannot forge one that points anywhere else.
 * - `data:` is viewable only for a media type in {@link VIEWABLE_DATA_MEDIA_TYPES}.
 *   `data:text/html` is a document at the EMBEDDING page's own origin, which is
 *   what made an unsandboxed frame over a payload URL a real hole.
 * - Everything else is not: `javascript:`, `file:` (a run on a developer's
 *   machine writes one, and a browser refuses to load it from an http page) and
 *   `pipelex-storage://`, which cannot be resolved client-side at all — that is
 *   the upload seam's job (see [../../docs/upload-seam.md]), and a renderer with
 *   no resolver must show the reference rather than a broken `<img>`.
 *
 * **A root-relative path counts**, and leaving it out was a real bug rather
 * than an omission. A host's URL resolver naturally hands back a path on its
 * OWN origin — `/api/assets/…`, an authenticated route that streams the object
 * — which is the whole point of resolving rather than exposing storage. This
 * predicate rejected it for having no scheme, so the resolved URL was thrown
 * away and the arms fell back to the payload's `public_url`: a presigned URL
 * that had already expired. The image stayed broken with the fix in place.
 *
 * A path is accepted only when resolving it against a sentinel origin STAYS on
 * that origin, which is one rule where a regex needed one per spelling:
 * `//host/x` is protocol-relative, and the parser reads `\\host\x` and `/\host/x`
 * as the same thing. An accepted path is returned relative, because making it
 * absolute against a sentinel would point it at nowhere.
 */
export function viewableUrl(candidate: string | undefined): string | undefined {
  if (!candidate) return undefined;
  const stripped = stripUrlWhitespace(candidate);
  if (stripped === '') return undefined;

  let parsed: URL;
  try {
    parsed = new URL(stripped, RELATIVE_SENTINEL_ORIGIN);
  } catch {
    return undefined;
  }

  // No scheme of its own: a reference relative to wherever the page is. Only a
  // root-relative path qualifies, and only if it stayed on the sentinel.
  if (!hasOwnScheme(stripped)) {
    if (!stripped.startsWith('/')) return undefined;
    return parsed.origin === RELATIVE_SENTINEL_ORIGIN ? stripped : undefined;
  }

  switch (parsed.protocol) {
    case 'http:':
    case 'https:':
    case 'blob:':
      return parsed.href;
    case 'data:':
      return VIEWABLE_DATA_MEDIA_TYPES.has(dataUrlMediaType(parsed)) ? parsed.href : undefined;
    default:
      return undefined;
  }
}

/** Whether the string carries a scheme of its own, rather than being relative. */
function hasOwnScheme(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Whether a browser can paint this URL as-is — {@link viewableUrl} as a guard.
 *
 * Prefer `viewableUrl` wherever the URL is then USED: this answers the question
 * without handing back the normalised string, so a caller that acts on the raw
 * candidate acts on a string the gate did not judge.
 */
export function isViewableUrl(url: string | undefined): url is string {
  return viewableUrl(url) !== undefined;
}

/**
 * The typed-scalar markers the serialization layer stamps onto a value.
 *
 * Exported so a host can recognise (and strip) them; nothing in the kernel
 * BRANCHES on them, which is the point — a reader keyed by these would be
 * reading the serializer instead of the standard.
 */
export const TYPED_SCALAR_MARKERS = ['__class__', '__module__'] as const;

/** Whether a record carries the typed-scalar markers. Informational. */
export function hasTypedScalarMarkers(value: unknown): boolean {
  return isRecord(value) && TYPED_SCALAR_MARKERS.every((marker) => hasOwnProp(value, marker));
}
