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
export const NATIVE_PAGE_CONCEPT_REF = 'native.Page';
export const NATIVE_YES_NO_CONCEPT_REF = 'native.YesNo';
export const NATIVE_RATING_CONCEPT_REF = 'native.Rating';
export const NATIVE_CHOICE_CONCEPT_REF = 'native.Choice';
export const NATIVE_SEARCH_RESULT_CONCEPT_REF = 'native.SearchResult';

/**
 * `native.Page`, read: what one page of an extracted document holds.
 *
 * The model is `{text_and_images: {text, images, raw_html}, page_view}`, where
 * `text` is a `TextContent` (`{text}`) and the images and the page view are
 * `ImageContent`s. A reader of a page wants its TEXT first, and the structural
 * renderer never reached it: the descriptor states the page as an `object`
 * over two members, and the text sits two levels down, under a member named
 * `text` inside a member named `text_and_images`. Keyed by the concept, this
 * reads the documented model and nothing else.
 */
export interface PageContentView {
  /** The page's extracted text, as the extractor wrote it, when it wrote any. */
  text?: string;
  /** The images extracted from the page, each an `ImageContent`, unread. */
  images: readonly unknown[];
  /**
   * The page's markup as the extractor fetched it, when it kept any. It is the
   * page's content a second time when the page has text, and its only content
   * when it has none, which is when a renderer shows it, framed, never injected.
   */
  rawHtml?: string;
  /** The rendering of the whole page, an `ImageContent`, when one was made. */
  pageView?: unknown;
}

/**
 * Read a `native.Page` value. `undefined` for anything that is not a record,
 * so the caller renders its own absence.
 */
export function readPageContent(value: unknown): PageContentView | undefined {
  if (!isRecord(value)) return undefined;
  const textAndImages = ownProp(value, 'text_and_images');
  const holder = isRecord(textAndImages) ? textAndImages : undefined;
  const textContent = holder ? ownProp(holder, 'text') : undefined;
  // `text` is a `TextContent`. A plain string is read too, since a page whose
  // runner rendered it raw would carry one, and both name the same text.
  const text =
    typeof textContent === 'string'
      ? textContent
      : isRecord(textContent)
        ? readText(textContent, 'text')
        : undefined;
  const images = holder ? ownProp(holder, 'images') : undefined;
  const rawHtml = holder ? readText(holder, 'raw_html') : undefined;
  const pageView = ownProp(value, 'page_view');
  return {
    ...(text !== undefined && text.trim() !== '' ? { text } : {}),
    images: Array.isArray(images) ? images : [],
    ...(rawHtml !== undefined && rawHtml.trim() !== '' ? { rawHtml } : {}),
    ...(isRecord(pageView) ? { pageView } : {}),
  };
}

/**
 * A verdict's measures, as the judging runtime states them: each is a number
 * from 0 to 1, present only when the producer reported one. A measure outside
 * that range is the payload disagreeing with its own model, and is read as
 * absent rather than shown as a percentage above a hundred.
 */
function readUnitInterval(record: Record<string, unknown>, key: string): number | undefined {
  const value = readNumber(record, key);
  return value !== undefined && value >= 0 && value <= 1 ? value : undefined;
}

/** `native.YesNo`, read. */
export interface YesNoContentView {
  /** The answer: yes is `true`. */
  yesNo: boolean;
  /** The probability that the answer is yes, from 0 to 1, when the producer reported one. */
  probability?: number;
}

/**
 * Read a `native.YesNo` value: `{yes_no, probability}`, or the bare boolean a
 * single-member YesNo is unwrapped to by its content key. Both are the model
 * the concept states, so reading either is reading the standard.
 */
export function readYesNoContent(value: unknown): YesNoContentView | undefined {
  if (typeof value === 'boolean') return { yesNo: value };
  if (!isRecord(value)) return undefined;
  const yesNo = ownProp(value, 'yes_no');
  if (typeof yesNo !== 'boolean') return undefined;
  const probability = readUnitInterval(value, 'probability');
  return { yesNo, ...(probability !== undefined ? { probability } : {}) };
}

/** `native.Rating`, read. */
export interface RatingContentView {
  /** The index of the selected level, 0 being the first level declared. */
  level: number;
  /** The name the scale gives the selected level, when it names its levels. */
  label?: string;
  /** The producer's confidence in the level, from 0 to 1, when it reported one. */
  confidence?: number;
}

/** Read a `native.Rating` value. `undefined` when it carries no whole `level`. */
export function readRatingContent(value: unknown): RatingContentView | undefined {
  if (!isRecord(value)) return undefined;
  const level = readNumber(value, 'level');
  if (level === undefined || !Number.isInteger(level) || level < 0) return undefined;
  const label = readText(value, 'label');
  const confidence = readUnitInterval(value, 'confidence');
  return {
    level,
    ...(label !== undefined ? { label } : {}),
    ...(confidence !== undefined ? { confidence } : {}),
  };
}

/** `native.Choice`, read. */
export interface ChoiceContentView {
  /** The key of the selected option, as the method declared it. */
  choice: string;
  /** The producer's confidence in the choice, from 0 to 1, when it reported one. */
  confidence?: number;
}

/**
 * Read a `native.Choice` value. `undefined` when it carries no `choice`, or an
 * empty one: the content model types `choice` as any text, but a choice
 * question's options are keyed by non-empty strings and its `Choice` names one
 * of them, so an empty key names no option and leaves no answer to draw.
 */
export function readChoiceContent(value: unknown): ChoiceContentView | undefined {
  if (!isRecord(value)) return undefined;
  const choice = readText(value, 'choice');
  if (choice === undefined) return undefined;
  const confidence = readUnitInterval(value, 'confidence');
  return { choice, ...(confidence !== undefined ? { confidence } : {}) };
}

/**
 * One source of a search result, read: a document the answer was written from,
 * which a search returns as a web page rather than as a file.
 */
export interface SearchSourceView {
  /**
   * The source's address as a reader is shown it: the web address when it has
   * one (normalised, as `href`), else its `url` as the payload states it.
   */
  address: string;
  /**
   * The web address, normalised, when the source has one: an `http:` or
   * `https:` URL, read from `url`, else from `public_url`. It is the only kind
   * of address a renderer links; any other is shown as text.
   */
  href?: string;
  /** The web address's host name, a leading `www.` dropped: the site a reader recognises. */
  host?: string;
  title?: string;
  snippet?: string;
  /**
   * The citations that name this source, each counted from one over the
   * sources as the payload lists them. More than one when the payload listed
   * the same address more than once: a later copy is not kept, and its number
   * names the copy that is.
   */
  citations: readonly number[];
}

/** `native.SearchResult`, read: the answer, and each of its sources once. */
export interface SearchResultContentView {
  /** The answer, as written: Markdown with inline citations (`[2]`, `[2][3]`). */
  answer: string;
  /** Each source once, in the order the payload first lists it. */
  sources: readonly SearchSourceView[];
}

/**
 * An address a renderer may link: a URL the gate admits whose protocol, as
 * the parser reports it, is `http:` or `https:`. Parsed rather than matched,
 * as the gate itself is: the gate strips what the parser strips and returns
 * the string it judged, and a root-relative path, which it admits, has no
 * origin of its own and does not parse alone.
 */
function readWebUrl(candidate: string | undefined): URL | undefined {
  const judged = viewableUrl(candidate);
  if (judged === undefined) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(judged);
  } catch {
    return undefined;
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed : undefined;
}

/**
 * A web address a renderer may link, normalised: `http:` or `https:`, read by
 * parsing, and `undefined` for any other address. Not re-exported: the
 * Markdown walker reads it to check an address a host hands it for a
 * citation, as the search reader checks a source's.
 */
export function webHref(candidate: string | undefined): string | undefined {
  return readWebUrl(candidate)?.href;
}

/**
 * Read a `native.SearchResult` value: `{answer, sources}`, each source a
 * `native.Document`. `undefined` when the value is not that model (no string
 * `answer`, a `sources` that is not a list, or a source that is not a document
 * with a `url`), which leaves the node to the structural arms. A missing
 * `sources` reads as none, since the runtime's model defaults it to an empty
 * list.
 *
 * **A source listed twice is kept once.** Two sources are the same when their
 * web addresses are the same once each is parsed and its fragment removed
 * (`#section` names a place in the page, not another page), or, for an address
 * that is not a web one, when the two strings are. The first is kept, where
 * the payload first lists it, and the citations of every copy name it.
 */
export function readSearchResultContent(value: unknown): SearchResultContentView | undefined {
  if (!isRecord(value)) return undefined;
  const answer = ownProp(value, 'answer');
  if (typeof answer !== 'string') return undefined;
  const given = ownProp(value, 'sources');
  if (given !== undefined && !Array.isArray(given)) return undefined;
  const sources: (Omit<SearchSourceView, 'citations'> & { citations: number[] })[] = [];
  const kept = new Map<string, number>();
  for (const [index, entry] of (given ?? []).entries()) {
    const document = readDocumentContent(entry);
    if (!document) return undefined;
    const web = readWebUrl(document.url) ?? readWebUrl(document.publicUrl);
    const key = web ? withoutFragment(web) : document.url;
    const citation = index + 1;
    const existing = kept.get(key);
    if (existing !== undefined) {
      sources[existing]?.citations.push(citation);
      continue;
    }
    kept.set(key, sources.length);
    const host = web?.hostname.replace(/^www\./, '');
    const title = document.title?.trim();
    sources.push({
      address: web?.href ?? document.url,
      ...(web ? { href: web.href } : {}),
      ...(host ? { host } : {}),
      ...(title ? { title } : {}),
      ...(document.snippet !== undefined ? { snippet: document.snippet } : {}),
      citations: [citation],
    });
  }
  return { answer, sources };
}

function withoutFragment(url: URL): string {
  const copy = new URL(url.href);
  copy.hash = '';
  return copy.href;
}

/**
 * The source an inline citation names, counted from one over the sources as
 * the payload lists them: `[2]` names the second, or the copy kept for it.
 * `undefined` for a number that names no source, which a renderer leaves as
 * the text it is.
 */
export function citedSource(
  content: SearchResultContentView,
  citation: number,
): SearchSourceView | undefined {
  return content.sources.find((source) => source.citations.includes(citation));
}

/** A run of text, or an inline citation in it: `[2]`, its number and its text. */
export type CitationSegment = { text: string } | { citation: number; text: string };

/**
 * A run of text cut at its inline citations: every `[n]`, `n` a whole number
 * from one written with no leading zero, is a segment of its own, and a run
 * such as `[2][3]` is two. Text between them is kept as written, so joining
 * the segments' text gives the run back.
 *
 * It reads plain text only. Which runs of an answer are plain text (not a link,
 * an image or code, where a bracketed number is the author's own) is the
 * Markdown reader's question, and it hands this only those.
 */
export function splitCitations(text: string): CitationSegment[] {
  const segments: CitationSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(/\[([1-9][0-9]*)\]/g)) {
    const at = match.index;
    if (at > last) segments.push({ text: text.slice(last, at) });
    segments.push({ citation: Number(match[1]), text: match[0] });
    last = at + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}

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
export function isNativeHtmlNode(node: NativeNode): boolean {
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
export function isNativeDateNode(node: NativeNode): boolean {
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
export function isNativeCompositeNode(node: NativeNode): boolean {
  return refinesNative(node, NATIVE_COMPOSITE_CONCEPT_REF);
}

/**
 * Whether a node is a `native.Page`, or a concept refining it — one page of an
 * extracted document.
 *
 * Its node is an `object` over `{text_and_images, page_view}`, which the
 * structural renderer laid out as a record: in a list, a table whose
 * "Text and images" column was named by the first `text` member it found,
 * `raw_html`, which an extractor leaves empty, so a page holding a whole
 * report read as a row of dashes. Keyed by concept, the result view reads the
 * page's text instead. See `readPageContent`.
 */
export function isNativePageNode(node: NativeNode): boolean {
  return refinesNative(node, NATIVE_PAGE_CONCEPT_REF);
}

/**
 * Whether a node is one of the verdicts a judge returns — a yes or no
 * (`native.YesNo`), a rating (`native.Rating`) or a choice (`native.Choice`),
 * or a concept refining one — and which.
 *
 * Their nodes are `object`s over the verdict and its measures (a `YesNo` from
 * an older runtime, whose model had one member, is a `boolean` node unwrapped
 * by its content key), so the structural renderer printed the measures as a
 * record: "Yes no: Yes / Probability: 1". The concept is what says the record
 * is a verdict, read off `concept_ref` and `refines` like every other native
 * predicate here, never off which keys the value happens to hold.
 */
export function nativeVerdictOf(node: NativeNode): 'yes_no' | 'rating' | 'choice' | undefined {
  if (refinesNative(node, NATIVE_YES_NO_CONCEPT_REF)) return 'yes_no';
  if (refinesNative(node, NATIVE_RATING_CONCEPT_REF)) return 'rating';
  if (refinesNative(node, NATIVE_CHOICE_CONCEPT_REF)) return 'choice';
  return undefined;
}

/**
 * Whether a node is a `native.SearchResult`, or a concept refining it: a
 * search's answer and the documents it was written from.
 *
 * Its node is an `object` over `{answer, sources}`, which the structural
 * renderer drew as a record: the answer squeezed beside its label with its
 * Markdown printed, and each web page it cites drawn as a file to download.
 * The concept is what says the record is a search result, never the keys the
 * value holds. See `readSearchResultContent`.
 */
export function isNativeSearchResultNode(node: NativeNode): boolean {
  return refinesNative(node, NATIVE_SEARCH_RESULT_CONCEPT_REF);
}

/**
 * Whether a node is one of the natives the kind vocabulary cannot name that a
 * list draws one value per line — a date, an HTML page, a composite — which a
 * renderer reads by CONCEPT before it reads the kind. A list of one answers no
 * (the predicates refuse a `list` node), and its item answers yes.
 *
 * One answer, read twice: the result view renders a list whose item answers yes
 * one value per line rather than as a table, and the generative layer delegates
 * that list to the kernel, because no catalog component reads a native value.
 * Not re-exported: a host asks the predicates it needs.
 */
export function isNativeValueNode(node: NativeNode): boolean {
  return isNativeDateNode(node) || isNativeHtmlNode(node) || isNativeCompositeNode(node);
}

/** What the native predicates read off a node: its stated kind and its concept. */
interface NativeNode {
  kind?: string;
  conceptRef?: string;
  refines?: readonly string[];
}

/**
 * The node IS one of the named native, or of a concept refining it.
 *
 * **A list of them is not one of them.** Plurality is not on the concept: a
 * plural node's `concept_ref` is its ELEMENT's, with the multiplicity stripped,
 * so a `native.Date[]` result is a `list` node whose concept reads
 * `native.Date`. Asking the concept alone answered yes for the whole list, and
 * every caller then treated the list as ONE date, one page or one composite: a
 * list of dates rendered as a single absent date, and a list of pages collected
 * no page at all. So a node whose stated kind is `list`
 * answers no, and its `item` answers for itself. The kind is the descriptor's
 * own statement, so this reads a stated fact and inspects no value.
 */
function refinesNative(node: NativeNode, ref: string): boolean {
  if (node.kind === 'list') return false;
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
 * The media types a `data:` URL may carry and still be viewable, each with the
 * extensions a saved file of that type may carry, the first being the one given
 * to a name that has none of them.
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
 *
 * The extensions live here, beside each admitted type, rather than in the save
 * planner that reads them: a type admitted without one would save under a name
 * with no extension, and the two lists used to be kept in step by hand.
 */
const VIEWABLE_DATA_MEDIA_TYPES: ReadonlyMap<string, readonly [string, ...string[]]> = new Map([
  ['image/png', ['png']],
  ['image/jpeg', ['jpg', 'jpeg']],
  ['image/gif', ['gif']],
  ['image/webp', ['webp']],
  ['image/avif', ['avif']],
  ['application/pdf', ['pdf']],
]);

/**
 * The extensions a saved `data:` file of this admitted media type may carry,
 * the first being its own. Empty for a type the gate does not admit.
 */
export function dataUrlExtensions(mediaType: string): readonly string[] {
  return VIEWABLE_DATA_MEDIA_TYPES.get(mediaType) ?? [];
}

/**
 * An origin no host can be, to resolve a relative reference against.
 *
 * `.invalid` is reserved by RFC 2606 and resolves nowhere, so nothing can be
 * fetched from it by accident. It exists only so a path can be parsed at all;
 * the answer taken from the parse is whether the reference STAYED on it.
 */
const RELATIVE_SENTINEL_ORIGIN = 'https://url-gate.invalid';

/**
 * A scheme, by RFC 3986's grammar: a letter, then letters, digits, `+`, `-`, `.`
 *
 * Read off the string rather than inferred from a parse, because a parse needs a
 * base and the base is what makes the answer wrong — see {@link viewableUrl}.
 */
const OWN_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

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
  // Scan before rebuilding, and rebuild only from the first character that has
  // to go. Almost every URL has nothing to strip inside it, and the one that
  // does is the one that is huge: an inline `data:` image is judged three or
  // four times per render, and a per-character rebuild of a megabyte-long
  // payload each time is hundreds of milliseconds of frozen main thread for a
  // string that comes back identical.
  for (let index = start; index < end; index += 1) {
    const code = candidate.charCodeAt(index);
    // Tab, line feed, carriage return - removed wherever they appear, not only
    // at the edges, which is what the parser does with them.
    if (code === 0x09 || code === 0x0a || code === 0x0d) {
      let stripped = candidate.slice(start, index);
      for (let rest = index; rest < end; rest += 1) {
        const restCode = candidate.charCodeAt(rest);
        if (restCode !== 0x09 && restCode !== 0x0a && restCode !== 0x0d)
          stripped += candidate[rest];
      }
      return stripped;
    }
  }
  return start === 0 && end === candidate.length ? candidate : candidate.slice(start, end);
}

/** What a `data:` URL says about the bytes it carries. */
export interface DataUrlView {
  /** Lowercased, without its parameters; `text/plain` when the URL declares none. */
  mediaType: string;
  /** The size of the DECODED payload, in bytes. */
  bytes: number;
}

/**
 * A `data:` URL's media type and decoded size, or `undefined` for any other URL.
 *
 * A host that encodes a picked file in the browser writes the file itself into
 * the value's `url`, so a thirty-kilobyte PDF is a forty-thousand-character
 * string, and printed where a reference would be it tells a person nothing. Its
 * type and its size are what they can read.
 *
 * The size is COUNTED rather than decoded. A base64 payload's size follows from
 * how many symbols it holds, and decoding a megabyte to measure it would be the
 * frozen main thread {@link stripUrlWhitespace} is written to avoid. This is a
 * reading for display, not a gate: whether the URL may be painted is still
 * {@link viewableUrl}'s answer alone.
 */
export function readDataUrl(candidate: string): DataUrlView | undefined {
  const url = candidate.trimStart();
  if (!/^data:/i.test(url)) return undefined;
  const comma = url.indexOf(',');
  if (comma === -1) return undefined;
  const [declared = '', ...parameters] = url.slice('data:'.length, comma).split(';');
  const trimmed = declared.trim().toLowerCase();
  // A fragment is not payload. `#page=2` on an inline PDF is the viewer's, and
  // counting it as bytes is counting the URL rather than the file.
  const fragment = url.indexOf('#', comma);
  const payload = fragment === -1 ? url.slice(comma + 1) : url.slice(comma + 1, fragment);
  const base64 = parameters.some((parameter) => parameter.trim().toLowerCase() === 'base64');
  return {
    mediaType: trimmed === '' ? 'text/plain' : trimmed,
    bytes: base64 ? base64Bytes(payload) : percentEncodedBytes(payload),
  };
}

/**
 * Three bytes for every four symbols, ignoring what is not one: the `=`
 * padding, and the line breaks a MIME encoder wraps its output at. Both
 * alphabets count, the standard one and the URL-safe one.
 *
 * A percent-escape is resolved to the character it stands for before it is
 * judged, because a payload may be escaped anywhere — `YQ%3D%3D` is `YQ==`,
 * one byte, and counting `3` and `D` as symbols made it four.
 */
function base64Bytes(payload: string): number {
  let symbols = 0;
  for (let index = 0; index < payload.length; index += 1) {
    let code = payload.charCodeAt(index);
    if (code === 0x25) {
      const escaped = Number.parseInt(payload.slice(index + 1, index + 3), 16);
      if (!Number.isNaN(escaped) && index + 2 < payload.length) {
        code = escaped;
        index += 2;
      }
    }
    if (
      (code >= 0x41 && code <= 0x5a) ||
      (code >= 0x61 && code <= 0x7a) ||
      (code >= 0x30 && code <= 0x39) ||
      code === 0x2b ||
      code === 0x2f ||
      code === 0x2d ||
      code === 0x5f
    )
      symbols += 1;
  }
  return Math.floor((symbols * 3) / 4);
}

/** A percent-escape is one byte; any other character is its UTF-8 length. */
function percentEncodedBytes(payload: string): number {
  const escapes = payload.match(/%[0-9a-f]{2}/gi)?.length ?? 0;
  return new TextEncoder().encode(payload).length - escapes * 2;
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
 * A path is rejected when it is protocol-relative — `//host/x`, and the two
 * backslash spellings the parser reads the same way (`\\host\x`, `/\host/x`) —
 * and then checked against the sentinel as well. An accepted path is returned
 * relative, because making it absolute against a sentinel would point it at
 * nowhere.
 */
export function viewableUrl(candidate: string | undefined): string | undefined {
  if (!candidate) return undefined;
  const stripped = stripUrlWhitespace(candidate);
  if (stripped === '') return undefined;

  // Whether the string carries a scheme is read OFF THE STRING, before any base
  // is applied, because the parser reads a candidate whose scheme equals the
  // base's as relative to that base. Deciding it with a second, base-less parse
  // let the two disagree: `https:cdn.example/x.png` was judged absolute and
  // resolved against the sentinel, so the gate handed a sink
  // `https://url-gate.invalid/cdn.example/x.png` — an internal placeholder, in a
  // real `<img src>`, in place of a URL that had worked. The grammar is RFC
  // 3986's, and it agrees with the parser on every string either accepts.
  if (OWN_SCHEME_RE.test(stripped)) {
    let parsed: URL;
    try {
      parsed = new URL(stripped);
    } catch {
      return undefined;
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

  // No scheme of its own: a reference relative to wherever the page is. Only a
  // root-relative path qualifies.
  if (!stripped.startsWith('/')) return undefined;
  // Protocol-relative, rejected on the SPELLING. "Did it stay on the sentinel"
  // reads as the same rule and is blind in exactly one place — the sentinel's
  // own host — so `//url-gate.invalid/x` passed the test written to stop it.
  const afterSlash = stripped.charCodeAt(1);
  if (afterSlash === 0x2f || afterSlash === 0x5c) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(stripped, RELATIVE_SENTINEL_ORIGIN);
  } catch {
    return undefined;
  }
  return parsed.origin === RELATIVE_SENTINEL_ORIGIN ? stripped : undefined;
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
