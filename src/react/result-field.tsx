'use client';

import type { RunField } from '../core';
import { conceptCategory } from '../core/descriptor';
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
 */

/** Values arrive from the wire wrapped by their content model; this unwraps. */
function unwrap(field: RunField, value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;

  // A scalar concept holds its value under one property (`native.Text` is
  // `{text}`), named by `contentKey` when a schema was available to read it
  // from. The output side has nowhere on the wire to carry that schema yet, so
  // fall back to the single-property shape the content models all share.
  if (field.kind !== 'object' && field.kind !== 'list') {
    if (field.contentKey && field.contentKey in record) return record[field.contentKey];
    // kajson stamps a typed scalar with its class; the payload key sits beside
    // those markers. Seen on every `date` a run produces.
    const keys = Object.keys(record).filter((k) => !k.startsWith('__'));
    if (keys.length === 1) return record[keys[0] as string];
  }
  return value;
}

/** A plural result's payload is `{ items: [...] }`, never a bare array. */
function itemsOf(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: unknown[] }).items;
  }
  return [];
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

function Scalar({ value }: { value: unknown }) {
  const s = useFieldStrings();
  if (value === null || value === undefined || value === '') {
    return <span className="text-[13px] italic text-muted-foreground">{s.resultAbsent}</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-[13px] text-foreground">{value ? s.yes : s.no}</span>;
  }
  return (
    <span className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
      {String(value)}
    </span>
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

  if (field.kind === 'object') {
    return (
      <div className="space-y-2">
        {!hideLabel && <Label field={field} />}
        {!hideLabel && field.description && (
          <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
        )}
        <div
          className={cn(
            'space-y-3',
            // A list item already sits in its own bordered row; nesting a second
            // card inside it draws a box in a box for no information gained.
            !hideLabel && 'rounded-lg border border-border bg-card/40 px-3.5 py-3',
          )}
        >
          {field.fields.map((child) => (
            <ResultField
              key={child.name}
              field={child}
              value={(unwrapped as Record<string, unknown> | undefined)?.[child.name]}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  if (field.kind === 'list') {
    const items = itemsOf(unwrapped);
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

  return (
    <div className="space-y-1">
      {!hideLabel && <Label field={field} />}
      {!hideLabel && field.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
      )}
      <Scalar value={unwrapped} />
    </div>
  );
}
