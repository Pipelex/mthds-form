'use client';

import type { RunField } from '../core';
import { conceptCategory } from '../core/descriptor';
import {
  formatDateContent,
  isViewableUrl,
  readDateContent,
  readDocumentContent,
  readImageContent,
} from '../core/native-content';
import { ownProp } from '../core/own-property';
import { ConceptPill } from './concept-pill';
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
 * The three arms that read a structure (`document`, `image`, `date`) read it
 * through `../core/native-content`, keyed by the kind the descriptor STATES.
 * That is reading the standard's pinned content models; working out which kind a
 * value is by inspecting its keys would be guessing at them, and this file no
 * longer does any of it.
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

function Label({ field }: { field: RunField }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
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

function Scalar({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') return <Absent />;
  return (
    <span className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
      {String(value)}
    </span>
  );
}

function Bool({ value }: { value: unknown }) {
  const s = useFieldStrings();
  if (value === null || value === undefined || value === '') return <Absent />;
  if (typeof value !== 'boolean') return <Scalar value={value} />;
  return <span className="text-[13px] text-foreground">{value ? s.yes : s.no}</span>;
}

function DateValue({ value }: { value: unknown }) {
  const content = readDateContent(value);
  if (!content) return <Absent />;
  return <span className="text-[13px] text-foreground">{formatDateContent(content)}</span>;
}

/**
 * A file reference, as text.
 *
 * A `pipelex-storage://` URL is not something a browser can follow, and this
 * component takes no resolver — resolving one is the host's seam
 * ([../../docs/upload-seam.md]), and a read-only result view is not the place to
 * open a network call nobody asked for. So an unresolvable reference is shown as
 * what it is, rather than as a dead link.
 */
function FileRef({ url, mimeType }: { url: string; mimeType?: string }) {
  const label = mimeType ? `${url} · ${mimeType}` : url;
  return isViewableUrl(url) ? (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="break-all font-mono text-[12px] text-foreground underline underline-offset-2"
    >
      {label}
    </a>
  ) : (
    <span className="break-all font-mono text-[12px] text-muted-foreground">{label}</span>
  );
}

function DocumentValue({ value }: { value: unknown }) {
  const content = readDocumentContent(value);
  if (!content) return <Absent />;
  const name = content.title ?? content.filename;
  return (
    <div className="space-y-1">
      {name && <span className="block text-[13px] text-foreground">{name}</span>}
      <FileRef url={content.publicUrl ?? content.url} mimeType={content.mimeType} />
      {content.snippet && (
        <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-muted-foreground">
          {content.snippet}
        </p>
      )}
    </div>
  );
}

function ImageValue({ value }: { value: unknown }) {
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
  return (
    <div className="space-y-1.5">
      {src ? (
        <img
          src={src}
          alt={content.caption ?? s.preview}
          className="max-h-64 w-auto rounded-lg border border-border"
        />
      ) : (
        <FileRef url={content.url} mimeType={content.mimeType} />
      )}
      {content.caption && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{content.caption}</p>
      )}
    </div>
  );
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

  const header = hideLabel ? null : (
    <>
      <Label field={field} />
      {field.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
      )}
    </>
  );

  switch (field.kind) {
    case 'object':
      return (
        <div className="space-y-2">
          {header}
          <div
            className={cn(
              'space-y-3',
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
          ) : (
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
      return (
        <div className="space-y-1">
          {header}
          <Bool value={unwrapped} />
        </div>
      );

    case 'date':
      return (
        <div className="space-y-1">
          {header}
          <DateValue value={unwrapped} />
        </div>
      );

    case 'document':
      return (
        <div className="space-y-1">
          {header}
          <DocumentValue value={unwrapped} />
        </div>
      );

    case 'image':
      return (
        <div className="space-y-1.5">
          {header}
          <ImageValue value={unwrapped} />
        </div>
      );

    case 'text':
    case 'prose':
    case 'number':
    case 'enum':
    case 'unknown':
      return (
        <div className="space-y-1">
          {header}
          <Scalar value={unwrapped} />
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
