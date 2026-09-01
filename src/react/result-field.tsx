'use client';

import type { RunField } from '../core';
import { conceptCategory } from '../core/descriptor';
import type { DocumentContentView } from '../core/native-content';
import {
  formatDateContent,
  isNativeHtmlNode,
  isViewableUrl,
  readDateContent,
  readDocumentContent,
  readHtmlContent,
  readImageContent,
} from '../core/native-content';
import { ownProp } from '../core/own-property';
import { Fragment, useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  FileText,
  ImageOff,
} from 'lucide-react';
import { ConceptPill } from './concept-pill';
import { HtmlPreview } from './html-preview';
import { useFieldStrings } from './field-strings';
import { humanizeFieldName } from './field-presentation';
import { cn } from './utils';

/**
 * A pipe's RESULT, rendered read-only.
 *
 * The same `RunField` the input controls are driven by — because an output is a
 * concept ref exactly like an input is, so its kinds, its nesting and its list
 * bounds are the same questions with the same answers. `buildResultField` maps
 * an output descriptor through the very mapper `buildRunFields` uses.
 *
 * What is NOT shared is the presentation, and deliberately: a result is read,
 * not edited. Rendering it as a disabled form would say "you may not change
 * this" where the truth is "this is what came back". So these are values with
 * labels, not controls with values.
 *
 * ## The dispatch is exhaustive, and that is load-bearing
 *
 * Every `RunFieldKind` gets an arm and the fall-through asserts `never`, so a
 * kind added to the descriptor fails the BUILD here rather than rendering wrong.
 * It used to fall through to `String(value)`, which turned a `document` result
 * into the literal text `[object Object]` — silently, with no error anywhere.
 *
 * The arms that read a structure (`document`, `image`, `date`) read it through
 * `../core/native-content`, keyed by the kind the descriptor STATES. That is
 * reading the standard's pinned content models; working out which kind a value
 * is by inspecting its keys would be guessing at them, and this file no longer
 * does any of it.
 *
 * **`native.Html` is the one arm keyed by CONCEPT rather than by kind**, and not
 * as an exception grudgingly made: the standard's kind vocabulary has no `html`
 * member, so markup arrives as an `object` node over `{inner_html, css_class}`.
 * That is right for the descriptor — kinds name how a value is ENTERED, and
 * markup is entered as text — and useless for a result, which would otherwise
 * print a page's source at a reader. Asking `refines`/`concept_ref` whether a
 * node is `native.Html` is a membership test on stated facts, which the
 * standard's own page names as the supported way to ask it.
 */

/**
 * The wire wraps a scalar (and a plural) payload inside its content model; this
 * unwraps by the property NAME the descriptor carries.
 *
 * `contentKey` is the only unwrap path there is. The property-counting fallback
 * that used to sit here is deleted, not bypassed: it was the output side
 * reintroducing the shape sniffing the derivation swap removed, and requiring a
 * schema on `buildResultField` is what made deleting it possible.
 */
function unwrap(field: RunField, value: unknown): unknown {
  if (!field.contentKey) return value;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return value;
  const unwrapped = ownProp(value as Record<string, unknown>, field.contentKey);
  return unwrapped === undefined ? value : unwrapped;
}

/**
 * The label row of a result node — exported so the panel that owns the top-level
 * header draws the SAME one rather than a second that drifts from it.
 */
export function ResultHeader({ field }: { field: RunField }) {
  return (
    <>
      <Label field={field} />
      {field.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
      )}
    </>
  );
}

function Label({ field, describe = false }: { field: RunField; describe?: boolean }) {
  return (
    <div
      className="flex flex-wrap items-baseline gap-x-2"
      {...(describe && field.description ? { title: field.description } : {})}
    >
      <span className="font-mono text-[13px] font-semibold text-foreground">
        {field.title ?? humanizeFieldName(field.name)}
      </span>
      <ConceptPill conceptRef={field.conceptRef} category={conceptCategory(field)} />
    </div>
  );
}

function Absent() {
  const s = useFieldStrings();
  return <span className="text-[13px] italic text-muted-foreground">{s.resultAbsent}</span>;
}

/**
 * A structured value nothing named — as JSON, never as `[object Object]`.
 *
 * **`String(anObject)` is `"[object Object]"`, and that string must never reach
 * a reader.** It is not a rendering of anything: it says a value was present and
 * throws it away, which is strictly worse than both honest answers. There are
 * only two of those — *there is nothing here*, or *here is what is here* — and
 * this is the second.
 *
 * When it happens at all is a narrower question than it looks. A descriptor
 * states a `kind`, and every structured kind has an arm; so a record reaching
 * this component means the payload disagrees with the descriptor that described
 * it, or the node is `unknown` — the standard's own escape hatch for a kind
 * newer than the pinned peer, whose entire contract is that a consumer may not
 * know what it is holding. Raw JSON is the right answer to both: the reader sees
 * the value, and nobody has invented a shape for it.
 */
export function stringifyValue(value: object): string | undefined {
  try {
    // A BigInt throws rather than serializing, and it can arrive from a JSON
    // parser configured to produce them. Naming it is better than failing.
    const text = JSON.stringify(value, (_key, member) =>
      typeof member === 'bigint' ? member.toString() : member,
    );
    if (text === undefined || text === '{}' || text === '[]') return undefined;
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    // Circular, and so unserializable. Still SOMETHING: name its members rather
    // than falling back to the one string this whole function exists to avoid.
    const keys = Array.isArray(value) ? [] : Object.keys(value);
    return keys.length > 0 ? `{ ${keys.join(', ')} }` : undefined;
  }
}

function RawValue({ value, compact }: { value: object; compact: boolean }) {
  const text = stringifyValue(value);
  // `{}` and `[]` are the EMPTY half of the rule: a value that holds nothing is
  // an absence, and printing two braces at a reader is not more honest.
  if (text === undefined) return <Absent />;
  return compact ? (
    <span title={text} className="truncate font-mono text-[12px] text-foreground">
      {text}
    </span>
  ) : (
    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-border bg-card/40 px-2.5 py-1.5 font-mono text-[12px] leading-relaxed text-foreground">
      {text}
    </pre>
  );
}

/**
 * A value, as text.
 *
 * `compact` is the table-cell variant: a cell is one line, so the newlines a
 * stacked field preserves must not open a row to three. Set by `LeafValue` when
 * it renders into a `<td>`, never guessed from the value.
 */
function Scalar({ value, compact = false }: { value: unknown; compact?: boolean }) {
  if (value === null || value === undefined || value === '') return <Absent />;
  // The one branch that matters: `String()` is never reached by an object, so
  // `[object Object]` cannot be produced here however the payload drifts.
  if (typeof value === 'object') return <RawValue value={value} compact={compact} />;
  return (
    <span
      className={cn(
        'text-[13px] leading-relaxed text-foreground',
        compact ? 'whitespace-nowrap' : 'whitespace-pre-wrap',
      )}
    >
      {String(value)}
    </span>
  );
}

function Bool({ value, compact = false }: { value: unknown; compact?: boolean }) {
  const s = useFieldStrings();
  if (value === null || value === undefined || value === '') return <Absent />;
  if (typeof value !== 'boolean') return <Scalar value={value} compact={compact} />;
  return <span className="text-[13px] text-foreground">{value ? s.yes : s.no}</span>;
}

function DateValue({ value }: { value: unknown }) {
  const content = readDateContent(value);
  if (!content) return <Absent />;
  return <span className="text-[13px] text-foreground">{formatDateContent(content)}</span>;
}

/**
 * The name to put on a file: what it is CALLED, not where it lives.
 *
 * A `pipelex-storage://` reference is ninety characters of UUID and hash, and
 * printing it whole is five wrapped lines that say one thing — this is a file.
 * The last path segment is the part a person reads; the whole reference stays on
 * the `title`, because it is the part they occasionally need to copy.
 */
function fileLabel(url: string, filename?: string): string {
  if (filename) return filename;
  const path = url.split(/[?#]/)[0] ?? url;
  const segment = path.split('/').filter(Boolean).pop();
  return segment && segment.length > 0 ? segment : url;
}

/**
 * Put the WHOLE reference on the clipboard, while the page shows a short name.
 *
 * The two requirements pull opposite ways and this is what resolves them: a
 * ninety-character storage reference printed in full wraps across the panel and
 * says nothing, and a name alone is not something a person can paste into a
 * terminal. So the label is the name, and the button is the URL.
 *
 * Hidden when the API is absent rather than failing on click — `navigator
 * .clipboard` is undefined outside a secure context, and a button that does
 * nothing is worse than no button. The link and the `title` still carry the
 * reference there.
 */
function CopyUrlButton({ url }: { url: string }) {
  const s = useFieldStrings();
  const [copied, setCopied] = useState(false);
  if (typeof navigator === 'undefined' || !navigator.clipboard) return null;
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        });
      }}
      title={url}
      aria-label={s.copyUrl}
      className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
    >
      {copied ? (
        <Check aria-hidden className="size-3.5" />
      ) : (
        <Copy aria-hidden className="size-3.5" />
      )}
    </button>
  );
}

/**
 * A file reference, as one line.
 *
 * A `pipelex-storage://` URL is not something a browser can follow, and this
 * component takes no resolver — resolving one is the host's seam
 * ([../../docs/upload-seam.md]), and a read-only result view is not the place to
 * open a network call nobody asked for. So an unresolvable reference is named
 * rather than linked, and never wrapped across the panel: it truncates, with the
 * whole of it on the `title`.
 */
function FileRef({
  url,
  mimeType,
  filename,
}: {
  url: string;
  mimeType?: string;
  filename?: string;
}) {
  const label = fileLabel(url, filename);
  const title = mimeType ? `${url} · ${mimeType}` : url;
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      {isViewableUrl(url) ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          title={title}
          className="min-w-0 truncate font-mono text-[12px] text-foreground underline underline-offset-2"
        >
          {label}
        </a>
      ) : (
        <span
          title={title}
          className="min-w-0 truncate font-mono text-[12px] text-muted-foreground"
        >
          {label}
        </span>
      )}
      <CopyUrlButton url={url} />
    </span>
  );
}

/** The extensions a browser renders in a frame with no plugin and no library. */
const PREVIEWABLE_EXT_RE = /\.(pdf|png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i;
const PREVIEWABLE_MIME_RE = /^(application\/pdf|image\/)/i;

/**
 * Whether a document can be shown here, rather than only linked to.
 *
 * Two conditions, and both are necessary: the browser must be able to FETCH the
 * URL (`isViewableUrl` — a `pipelex-storage://` reference resolves nowhere
 * without the host's resolver) and to RENDER it with nothing installed. A `.docx`
 * satisfies the first and not the second, and offering a preview that opens onto
 * a download prompt is worse than offering none.
 */
function previewableUrl(content: DocumentContentView): string | undefined {
  const url = isViewableUrl(content.publicUrl)
    ? content.publicUrl
    : isViewableUrl(content.url)
      ? content.url
      : undefined;
  if (!url) return undefined;
  const named = content.filename ?? url;
  const renderable = content.mimeType
    ? PREVIEWABLE_MIME_RE.test(content.mimeType)
    : PREVIEWABLE_EXT_RE.test(named);
  return renderable ? url : undefined;
}

/**
 * The document itself, in a frame.
 *
 * **Not the same question as `native.Html`, and the difference is the origin.**
 * Markup goes through a sandbox because injecting it into the host's document
 * would run it ON the host's origin, with the host's cookies. A URL in an
 * `<iframe>` is a separate document at its own origin by construction — the
 * browser's own boundary, not one this package has to build — so a PDF is framed
 * the way every document viewer on the web frames one. `no-referrer` is there
 * because a result view has no business telling a third party where it was
 * opened from.
 */
function DocumentPreview({ url, name }: { url: string; name: string }) {
  return (
    <iframe
      src={url}
      title={name}
      loading="lazy"
      referrerPolicy="no-referrer"
      className="h-[28rem] w-full rounded-lg border border-border bg-card/40"
    />
  );
}

function DocumentValue({ value }: { value: unknown }) {
  const s = useFieldStrings();
  const [open, setOpen] = useState(false);
  const content = readDocumentContent(value);
  if (!content) return <Absent />;
  const name = content.title ?? content.filename ?? fileLabel(content.url, content.filename);
  const preview = previewableUrl(content);
  return (
    <div className="space-y-2">
      <div className="flex min-w-0 items-start gap-2.5">
        <FileText aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1 space-y-0.5">
          {name && <span className="block truncate text-[13px] text-foreground">{name}</span>}
          <FileRef
            url={content.publicUrl ?? content.url}
            mimeType={content.mimeType}
            {...(content.filename ? { filename: content.filename } : {})}
          />
          {content.snippet && (
            <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
              {content.snippet}
            </p>
          )}
        </div>
        {preview && (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[12px] text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
          >
            {open ? (
              <EyeOff aria-hidden className="size-3.5" />
            ) : (
              <Eye aria-hidden className="size-3.5" />
            )}
            {s.preview}
          </button>
        )}
      </div>
      {preview && open && <DocumentPreview url={preview} name={name} />}
    </div>
  );
}

function ImageValue({
  value,
  inGallery = false,
  inRow = false,
  compact = false,
}: {
  value: unknown;
  inGallery?: boolean;
  inRow?: boolean;
  /** Rendering into a table cell: a thumbnail, not a picture. */
  compact?: boolean;
}) {
  const s = useFieldStrings();
  const content = readImageContent(value);
  if (!content) return <Absent />;
  // The public URL first: it is the one a browser can paint. Falling back to
  // `url` covers a producer that states only the required member, and
  // `isViewableUrl` is what decides whether either can be painted at all.
  const src = isViewableUrl(content.publicUrl)
    ? content.publicUrl
    : isViewableUrl(content.url)
      ? content.url
      : undefined;
  // In a gallery the tile IS the border, so the image fills it and the caption
  // sits under it; on its own the image keeps its own frame and a height cap.
  return (
    <div className={inGallery ? 'space-y-1' : 'space-y-1.5'}>
      {src ? (
        // Wrapped in a link: the picture is a PREVIEW of a file, and clicking a
        // preview to see the thing it previews is what a reader expects. The
        // reference underneath is the other half - a picture with no URL beside
        // it is a result you can look at and cannot use.
        <a href={src} target="_blank" rel="noreferrer" title={content.url} className="inline-block">
          <img
            src={src}
            alt={content.caption ?? s.preview}
            className={cn(
              inGallery && 'block aspect-square w-full object-cover',
              // A cell is one line tall. An image column rendered at the standalone
              // height turns every row into a picture and the table into a
              // slideshow, so a cell gets a thumbnail and the row's expansion gets
              // the picture.
              compact && 'h-10 w-auto rounded border border-border object-cover',
              !inGallery && !compact && 'max-h-64 w-auto rounded-lg border border-border',
            )}
          />
        </a>
      ) : inRow ? (
        // The row variant of "nothing to paint": an icon and a name, exactly as
        // a document row reads, because that is what this has become.
        <div className="flex min-w-0 items-center gap-2.5">
          <ImageOff aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <FileRef
              url={content.url}
              mimeType={content.mimeType}
              {...(content.filename ? { filename: content.filename } : {})}
            />
          </div>
        </div>
      ) : inGallery ? (
        // Nothing to paint, so the tile says what it is rather than dumping a
        // ninety-character storage reference into a 140px box. This is what a
        // host with no resolver sees, so it has to be a design and not a
        // fallback.
        <div className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 px-2 text-center">
          <ImageOff aria-hidden className="size-5 text-muted-foreground" />
          <span
            title={content.url}
            className="w-full truncate font-mono text-[10.5px] text-muted-foreground"
          >
            {fileLabel(content.url, content.filename)}
          </span>
        </div>
      ) : (
        <FileRef
          url={content.url}
          mimeType={content.mimeType}
          {...(content.filename ? { filename: content.filename } : {})}
        />
      )}
      {src && !compact && (
        <div className={inGallery ? 'px-2.5' : undefined}>
          <FileRef
            url={content.publicUrl ?? content.url}
            mimeType={content.mimeType}
            {...(content.filename ? { filename: content.filename } : {})}
          />
        </div>
      )}
      {content.caption && (
        <p
          className={cn(
            'text-[12px] leading-relaxed text-muted-foreground',
            inGallery && 'px-2.5 pb-1.5',
          )}
        >
          {content.caption}
        </p>
      )}
    </div>
  );
}

/**
 * The kinds a table cell can hold — short, single-line values.
 *
 * `prose` is deliberately absent. A paragraph in a `<td>` is worse than a card:
 * it forces one column to the width of the longest answer and drags every other
 * row's height with it. A list whose element carries prose renders as cards, and
 * that is the right answer rather than a limitation.
 *
 * `object` and `list` are absent for the obvious reason, and `document`/`image`
 * because a file's chrome (a link, a preview) is not a cell.
 */
const TABULAR_KINDS = new Set<RunField['kind']>(['text', 'number', 'boolean', 'date', 'enum']);

/**
 * Just the value, with no label chrome — shared by every layout.
 *
 * **It unwraps, and that is not a convenience.** Unwrapping is a property of the
 * FIELD (its `contentKey`), not of the layout that happens to be rendering it,
 * so every path has to do it: a `native.Text[]`'s entries are `TextContent`
 * records, and a chip, a line and a table cell each hold one. Leaving the unwrap
 * to the caller is what turned a list of planet names into eight rows of
 * `[object Object]` — the very failure this component exists to make impossible.
 */
function LeafValue({
  field,
  value: raw,
  compact = false,
}: {
  field: RunField;
  value: unknown;
  /** Rendering into a table cell: one line, no preserved newlines. */
  compact?: boolean;
}) {
  const value = unwrap(field, raw);
  switch (field.kind) {
    case 'list': {
      const entries = Array.isArray(value) ? value : [];
      // A short scalar list inside a cell: chips wrap, so a column of them stays
      // a column. A list of STRUCTURES cannot be a cell at any width, so it says
      // how many there are and the row's detail shows them - the cell states the
      // fact, the expansion carries the content.
      return TABULAR_KINDS.has(field.item.kind) ? (
        <ScalarChips field={field.item} items={entries} />
      ) : (
        <ItemCount count={entries.length} />
      );
    }
    case 'boolean':
      return <Bool value={value} compact={compact} />;
    case 'date':
      return <DateValue value={value} />;
    case 'document':
      return <DocumentValue value={value} />;
    case 'image':
      return <ImageValue value={value} compact={compact} />;
    default:
      return <Scalar value={value} compact={compact} />;
  }
}

/**
 * A list of SCALARS, inline.
 *
 * Rendering `["optics", "calibration"]` as two bordered cards with index numbers
 * spends a screenful of chrome on two words. Chips say the same thing in one
 * line, and the index a card carried was never information here — the entries of
 * a scalar list are the values, and they identify themselves.
 */
function ScalarChips({ field, items }: { field: RunField; items: readonly unknown[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <span
          key={index}
          className="rounded-md border border-border bg-card/40 px-2 py-0.5 text-[12.5px] text-foreground"
        >
          <LeafValue field={field} value={item} />
        </span>
      ))}
    </div>
  );
}

/**
 * A list of objects of ONE shape, as the table it is.
 *
 * Every entry has the same keys, so the labels are column headers rather than
 * per-row labels — repeating them down the page is what made a fifteen-entry
 * result read as fifteen forms. The description and the type pill move to the
 * header too: on an INPUT they are guidance a person needs before typing, and on
 * a result they are the same sentence fifteen times. The description stays
 * reachable as the header's `title`, which is the honest place for a fact that
 * is worth having and not worth repeating.
 */
/** How many entries a cell stands for, when the entries themselves cannot fit. */
function ItemCount({ count }: { count: number }) {
  const s = useFieldStrings();
  return (
    <span className="whitespace-nowrap text-[12.5px] text-muted-foreground">
      {s.itemsCount(count)}
    </span>
  );
}

/**
 * Whether a column is shown WHOLE in its cell.
 *
 * A short scalar is, and so is a list of them (chips wrap). Prose is not — it is
 * the standard's way of saying "this may be long", so a cell shows its first
 * line. A structure is not, at any width. Those are the columns the row's
 * expansion exists for, and the presence of one is what puts the toggle there.
 */
function isInlineColumn(field: RunField): boolean {
  if (field.kind === 'list') return TABULAR_KINDS.has(field.item.kind);
  return TABULAR_KINDS.has(field.kind);
}

/**
 * A list of records, as the table it is — with the rest of each record one click
 * away.
 *
 * **Every record list is a table now**, including the ones carrying prose and
 * the ones carrying more records. The old answer was to fall back to a card per
 * entry, and it was the wrong trade: a table is how you READ a list of records —
 * scannable, aligned, one row each — and giving that up over the widest column
 * loses it for every other column too.
 *
 * What a table genuinely cannot do is hold a paragraph or a nested structure in
 * a cell. So it does not try: the cell shows the first line (or how many entries
 * there are), and the row expands to a full rendering of the record underneath —
 * the same stacked layout a card used, arriving only when asked for. That keeps
 * the scannable shape and loses nothing, which the fallback could not claim.
 *
 * The toggle appears only when a row HAS more to show; a table of short scalars
 * gets no column of chevrons that reveal nothing.
 */
function ObjectTable({
  columns,
  element,
  items,
  label,
}: {
  columns: readonly RunField[];
  /** The element descriptor, used to render an expanded row in full. */
  element: RunField;
  items: readonly unknown[];
  /** Names the scroll region, so a screen reader says which table it is. */
  label: string;
}) {
  const s = useFieldStrings();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set());
  const [viewportWidth, setViewportWidth] = useState<number>();
  const canExpand = columns.some((column) => !isInlineColumn(column));

  // The width of what is VISIBLE, not of the table.
  //
  // An expanded row is a cell spanning every column, so it inherits the table's
  // width - and the table is deliberately wider than its container whenever the
  // columns do not fit. Left alone, the detail then runs off into the scroll: a
  // paragraph readable only by scrolling sideways, which is the failure the
  // expansion exists to avoid. Measuring the scroller and pinning the detail to
  // it makes the panel stay put while the columns above it scroll.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => setViewportWidth(scroller.clientWidth);
    measure();
    // Guarded rather than assumed: a host rendering on the server, or a test
    // environment without the API, gets a detail that simply wraps at the
    // table's width instead of a component that throws.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  const toggle = (index: number) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(index)) next.add(index);
      return next;
    });

  return (
    // `min-w-full` rather than `w-full`, and a floor under each cell: with
    // `w-full` the table is pinned to the container's width, so twelve columns
    // do not overflow - they crush, and a reading's date wraps onto four lines.
    // A floor makes the table wider than the panel instead, which is what the
    // scroller is for.
    //
    // A scrollable region must be reachable by keyboard. A table of values has
    // nothing to tab to, so the region itself takes focus; without `tabIndex` the
    // columns past the fold are reachable with a mouse and by no other means,
    // which the a11y gate catches as `scrollable-region-focusable`. The name
    // makes the focus stop announce itself rather than being a silent one.
    //
    // `group` rather than `region`, and that is not a detail: `region` is a
    // LANDMARK, so every table would enter the document's landmark list, and two
    // of them with the same name - which is what a result rendered twice, or a
    // structure holding two lists, produces - is `landmark-unique`. A group is
    // named without claiming to be a section of the page.
    <div
      ref={scrollerRef}
      role="group"
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-border"
    >
      <table className="min-w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border bg-card/40 text-left">
            {/* Named, not empty: a header cell with no text is `empty-table-header`
                to an auditor and an unlabelled column to a screen reader. The
                name is visually hidden because the chevron below it is the whole
                affordance a sighted reader needs. */}
            {canExpand && (
              <th scope="col" className="w-8 px-1">
                <span className="sr-only">{s.rowDetailsColumn}</span>
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.name}
                scope="col"
                // The authored description, on hover. It is worth having and not
                // worth repeating under every value, so the header is where it
                // lives - and `cursor-help` is what tells a reader it is there,
                // since a `title` nobody knows about is a fact nobody reads.
                {...(column.description ? { title: column.description } : {})}
                className={cn(
                  'whitespace-nowrap px-3 py-2 font-mono text-[12px] font-semibold text-foreground',
                  column.description &&
                    'cursor-help underline decoration-dotted underline-offset-4',
                )}
              >
                {column.title ?? humanizeFieldName(column.name)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const isOpen = expanded.has(index);
            return (
              <Fragment key={index}>
                <tr className={cn('border-b border-border/60', !isOpen && 'last:border-b-0')}>
                  {canExpand && (
                    <td className="px-1 align-top">
                      <button
                        type="button"
                        onClick={() => toggle(index)}
                        aria-expanded={isOpen}
                        aria-label={s.toggleRowDetails(index + 1)}
                        className="mt-0.5 flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                      >
                        {isOpen ? (
                          <ChevronDown aria-hidden className="size-3.5" />
                        ) : (
                          <ChevronRight aria-hidden className="size-3.5" />
                        )}
                      </button>
                    </td>
                  )}
                  {columns.map((column) => {
                    const cell =
                      typeof item === 'object' && item !== null
                        ? ownProp(item as Record<string, unknown>, column.name)
                        : undefined;
                    return (
                      <td key={column.name} className="px-3 py-1.5 align-top">
                        {/* One line per cell, and a cap on how wide one may push
                            the column. Wrapping is what a `w-full` table does
                            instead of overflowing, and it is the worse failure: a
                            date broken over two lines to save a scrollbar. The
                            cap stops the opposite failure - one long label making
                            a 200-character column - and the full value is a click
                            or a hover away. */}
                        <div
                          className={cn(
                            'max-w-[44ch]',
                            column.kind === 'list' && isInlineColumn(column)
                              ? 'min-w-[16ch]'
                              : 'truncate',
                          )}
                          {...(typeof cell === 'string' || typeof cell === 'number'
                            ? { title: String(cell) }
                            : {})}
                        >
                          <LeafValue field={column} value={cell} compact />
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {isOpen && (
                  <tr className="border-b border-border/60 last:border-b-0">
                    {/* The whole record, in the stacked layout - which already
                        renders prose, nesting and files properly. Spanning every
                        column keeps it a row of the same table rather than a
                        second widget beside it. */}
                    <td colSpan={columns.length + 1} className="bg-card/40 p-0">
                      <div
                        className="sticky left-0 px-3.5 py-3"
                        {...(viewportWidth ? { style: { width: viewportWidth } } : {})}
                      >
                        <ResultField field={element} value={item} hideLabel />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A list of PROSE, as plain lines.
 *
 * `prose` is the standard's way of saying "this may be long", and `native.Text`
 * always derives to it — so this is what a list of plain strings actually is,
 * and it is the most common result list there is. Chips are wrong for it: a chip
 * containing a paragraph is a box with a paragraph in it. Cards are worse: a
 * bordered box and an index number around the word `Mercury`.
 *
 * So: the values, one per line, divided by a hairline. Nothing else — the index
 * a card carried labels nothing, because the entries of a scalar list are the
 * values.
 */
function ScalarLines({ field, items }: { field: RunField; items: readonly unknown[] }) {
  return (
    <div className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border">
      {items.map((item, index) => (
        <div key={index} className="bg-card/40 px-3 py-1.5">
          <LeafValue field={field} value={item} />
        </div>
      ))}
    </div>
  );
}

/**
 * A list of IMAGES is a gallery, not a stack of cards.
 *
 * The card layout gives every entry a bordered box, an index and a label row —
 * a screenful per picture, when the picture is the entire content. A grid shows
 * them the way a person looks at images: several at once, compared side by side.
 * An entry whose URL the browser cannot paint keeps its reference, because a
 * grid of identical broken-image glyphs would be worse than the text.
 */
function ImageGallery({ items }: { items: readonly unknown[] }) {
  // A grid of empty squares is not a gallery. When NOTHING here can be painted -
  // every URL a storage reference the host has no resolver for - the tiles carry
  // no picture, and three large blanks say less than three lines would. So the
  // layout follows what is actually showable rather than what the kind promises.
  const anyViewable = items.some((item) => {
    const content = readImageContent(item);
    return content ? isViewableUrl(content.publicUrl) || isViewableUrl(content.url) : false;
  });
  if (!anyViewable) return <FileRows items={items} kind="image" />;
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
      {items.map((item, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-border bg-card/40">
          <ImageValue value={item} inGallery />
        </div>
      ))}
    </div>
  );
}

/**
 * A list of FILES is a list of rows, not a list of cards.
 *
 * A document's whole content is a name and a link; wrapping each in a card with
 * an index spends the chrome of a structure on two fields. Rows keep them
 * scannable, which is what a list of sources is for.
 */
function FileRows({ items, kind }: { items: readonly unknown[]; kind: 'document' | 'image' }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {items.map((item, index) => (
        <div key={index} className="bg-card/40 px-3.5 py-2">
          {kind === 'document' ? <DocumentValue value={item} /> : <ImageValue value={item} inRow />}
        </div>
      ))}
    </div>
  );
}

/**
 * The columns a list's element contributes — every field it declares.
 *
 * There is no longer a shape that disqualifies a record from being a row. Prose
 * and nesting used to send the whole list back to cards, which lost the
 * scannable shape for every other column to accommodate the widest one; they are
 * now shown in the row's expansion instead. What is left is the one case that is
 * not a record at all.
 */
function tableColumns(item: RunField): readonly RunField[] | undefined {
  if (item.kind !== 'object' || item.fields.length === 0) return undefined;
  return item.fields;
}

export interface ResultFieldProps {
  field: RunField;
  value: unknown;
  /** Nesting depth, used only for indentation. */
  depth?: number;
  /**
   * Suppress the field's own label. Set on a LIST ITEM, where the index already
   * identifies the entry: the standard says an element descriptor's `name` is
   * unused, and rendering it repeats the parent's label on every row.
   */
  hideLabel?: boolean;
}

/** The single dispatch point, mirroring `FieldRenderer` on the input side. */
export function ResultField({ field, value, depth = 0, hideLabel = false }: ResultFieldProps) {
  const s = useFieldStrings();
  const unwrapped = unwrap(field, value);

  // The description rides the label's `title` on a nested field and is shown
  // outright only at the top.
  //
  // On an INPUT it is guidance a person needs before typing, so it is printed
  // under every label. On a RESULT it is the same sentence beside a value the
  // reader is there to read — and inside a structure of ten fields it is ten
  // lines of chrome around ten values. The fact is worth having and is not worth
  // repeating, so it stays reachable rather than printed.
  const header = hideLabel ? null : (
    <>
      <Label field={field} describe={depth > 0} />
      {depth === 0 && field.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
      )}
    </>
  );

  // Markup, before the kind switch: a `native.Html` node's KIND is `object`, so
  // the switch below would render its two members as text and call it done.
  if (isNativeHtmlNode(field)) {
    const content = readHtmlContent(unwrapped);
    return (
      <div className="space-y-2">
        {header}
        {content ? <HtmlPreview content={content} /> : <Absent />}
      </div>
    );
  }

  switch (field.kind) {
    case 'object':
      return (
        <div className="space-y-2">
          {header}
          <div
            className={cn(
              'space-y-2.5',
              // A list item already sits in its own bordered row; nesting a
              // second card inside it draws a box in a box for no information
              // gained.
              !hideLabel && 'rounded-lg border border-border bg-card/40 px-3.5 py-3',
            )}
          >
            {field.fields.map((child) => (
              <ResultField
                key={child.name}
                field={child}
                value={
                  typeof unwrapped === 'object' && unwrapped !== null
                    ? ownProp(unwrapped as Record<string, unknown>, child.name)
                    : undefined
                }
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      );

    case 'list': {
      // A bare array, always: a plural payload's `ListContent {items}` wrapper is
      // unwrapped by `contentKey` above, exactly as a scalar's is, and a nested
      // array property is bare on the wire to begin with. The `items`-key sniff
      // that used to stand in for the schema is gone.
      const items = Array.isArray(unwrapped) ? unwrapped : [];
      const columns = tableColumns(field.item);
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Label field={field} />
            <span className="font-mono text-[10.5px] text-muted-foreground">
              {s.itemsCount(items.length)}
            </span>
          </div>
          {items.length === 0 ? (
            <p className="text-[13px] italic text-muted-foreground">{s.noItemsYet}</p>
          ) : columns ? (
            // Same shape every row: the labels are column headers, not per-row
            // labels. See `ObjectTable`.
            <ObjectTable
              columns={columns}
              element={field.item}
              items={items}
              label={field.title ?? humanizeFieldName(field.name)}
            />
          ) : TABULAR_KINDS.has(field.item.kind) ? (
            <ScalarChips field={field.item} items={items} />
          ) : field.item.kind === 'prose' ? (
            <ScalarLines field={field.item} items={items} />
          ) : field.item.kind === 'image' ? (
            <ImageGallery items={items} />
          ) : field.item.kind === 'document' ? (
            <FileRows items={items} kind="document" />
          ) : (
            // Nested, or carrying prose: a card per entry is what a table cell
            // cannot hold. The index label earns its place here, where the
            // entries are structures rather than values.
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-lg border border-border bg-card/40 px-3.5 py-3"
                >
                  <span className="font-mono text-[10px] text-muted-foreground">{index + 1}</span>
                  <ResultField field={field.item} value={item} depth={depth + 1} hideLabel />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    case 'boolean':
    case 'date':
    case 'document':
    case 'image':
    case 'text':
    case 'prose':
    case 'number':
    case 'enum':
    case 'unknown':
      return (
        <div className={field.kind === 'image' ? 'space-y-1.5' : 'space-y-0.5'}>
          {header}
          {/* The RAW value: `LeafValue` owns the unwrap, so that a chip, a line,
              a table cell and this stacked row cannot disagree about it. */}
          <LeafValue field={field} value={value} />
        </div>
      );
  }

  // Unreachable while the switch covers `RunFieldKind`. A twelfth kind added to
  // the descriptor fails to compile HERE — which is the point of the assertion,
  // and is what a `default:` returning `String(value)` cost: a `document` result
  // rendered as `[object Object]`, silently, with nothing to notice it.
  field satisfies never;
  return null;
}
