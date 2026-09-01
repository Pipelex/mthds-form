'use client';

import type { RunField } from '../core';
import { conceptCategory } from '../core/descriptor';
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
import { FileText, ImageOff } from 'lucide-react';
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
 * A value, as text.
 *
 * `compact` is the table-cell variant: a cell is one line, so the newlines a
 * stacked field preserves must not open a row to three. Set by `LeafValue` when
 * it renders into a `<td>`, never guessed from the value.
 */
function Scalar({ value, compact = false }: { value: unknown; compact?: boolean }) {
  if (value === null || value === undefined || value === '') return <Absent />;
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
  return isViewableUrl(url) ? (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={title}
      className="block truncate font-mono text-[12px] text-foreground underline underline-offset-2"
    >
      {label}
    </a>
  ) : (
    <span title={title} className="block truncate font-mono text-[12px] text-muted-foreground">
      {label}
    </span>
  );
}

function DocumentValue({ value }: { value: unknown }) {
  const content = readDocumentContent(value);
  if (!content) return <Absent />;
  const name = content.title ?? content.filename;
  return (
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
    </div>
  );
}

function ImageValue({ value, inGallery = false }: { value: unknown; inGallery?: boolean }) {
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
        <img
          src={src}
          alt={content.caption ?? s.preview}
          className={
            inGallery
              ? 'block aspect-square w-full object-cover'
              : 'max-h-64 w-auto rounded-lg border border-border'
          }
        />
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

/** Whether a column can hold this field: a short scalar, or a list of them. */
function isTabularColumn(field: RunField): boolean {
  if (field.kind === 'list') return TABULAR_KINDS.has(field.item.kind);
  return TABULAR_KINDS.has(field.kind);
}

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
    case 'list':
      // A short scalar list inside a cell: chips wrap, so a column of them stays
      // a column. This is what keeps a record with one small list a TABLE rather
      // than sending the whole list back to cards over its narrowest field.
      return <ScalarChips field={field.item} items={Array.isArray(value) ? value : []} />;
    case 'boolean':
      return <Bool value={value} compact={compact} />;
    case 'date':
      return <DateValue value={value} />;
    case 'document':
      return <DocumentValue value={value} />;
    case 'image':
      return <ImageValue value={value} />;
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
function ObjectTable({
  columns,
  items,
  label,
}: {
  columns: readonly RunField[];
  items: readonly unknown[];
  /** Names the scroll region, so a screen reader says which table it is. */
  label: string;
}) {
  return (
    // `min-w-full` rather than `w-full`, and a floor under each cell: with
    // `w-full` the table is pinned to the container's width, so twelve columns
    // do not overflow - they crush, and a reading's date wraps onto four lines.
    // A floor makes the table wider than the panel instead, which is what the
    // scroller is for.
    //
    // A scrollable region must be reachable by keyboard, and this one holds no
    // focusable content of its own - a table of values has nothing to tab to -
    // so the region itself takes focus. Without `tabIndex` the columns past the
    // fold are reachable with a mouse and by no other means, which the a11y gate
    // catches as `scrollable-region-focusable`. The name makes the focus stop
    // announce itself rather than being a silent one.
    //
    // `group` rather than `region`, and that is not a detail: `region` is a
    // LANDMARK, so every table would enter the document's landmark list, and two
    // of them with the same name - which is what a result rendered twice, or a
    // structure holding two lists, produces - is `landmark-unique`. A group is
    // named without claiming to be a section of the page.
    <div
      role="group"
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-border"
    >
      <table className="min-w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border bg-card/40 text-left">
            {columns.map((column) => (
              <th
                key={column.name}
                scope="col"
                {...(column.description ? { title: column.description } : {})}
                className="whitespace-nowrap px-3 py-2 font-mono text-[12px] font-semibold text-foreground"
              >
                {column.title ?? humanizeFieldName(column.name)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-border/60 last:border-b-0">
              {columns.map((column) => {
                const cell =
                  typeof item === 'object' && item !== null
                    ? ownProp(item as Record<string, unknown>, column.name)
                    : undefined;
                return (
                  <td key={column.name} className="px-3 py-1.5 align-top">
                    {/* One line per cell, and a cap on how wide one may push the
                        column. Wrapping is what a `w-full` table does instead of
                        overflowing, and it is the worse failure: a date broken
                        over two lines to save a scrollbar. The cap stops the
                        opposite failure - one long label making a 200-character
                        column - and the full value stays on the title. */}
                    <div
                      className={cn(
                        'max-w-[44ch]',
                        column.kind === 'list' ? 'min-w-[16ch]' : 'truncate',
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
          ))}
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
function DocumentRows({ items }: { items: readonly unknown[] }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {items.map((item, index) => (
        <div key={index} className="bg-card/40 px-3.5 py-2">
          <DocumentValue value={item} />
        </div>
      ))}
    </div>
  );
}

/** Whether a list's element is a uniform record of short scalars - i.e. a row. */
function tableColumns(item: RunField): readonly RunField[] | undefined {
  if (item.kind !== 'object' || item.fields.length === 0) return undefined;
  return item.fields.every(isTabularColumn) ? item.fields : undefined;
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
            <DocumentRows items={items} />
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
