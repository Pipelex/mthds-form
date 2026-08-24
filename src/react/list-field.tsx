'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from './utils';
import type { ListRunField, RunField } from '../core';
import { ConceptPill } from './concept-pill';
import { fieldLabel, useFieldPresentation } from './field-presentation';
import { FieldRenderer, type FieldEnv } from './field-renderer';
import { useFieldStrings } from './field-strings';

interface ListFieldProps {
  field: ListRunField;
  value: unknown[] | undefined;
  onChange: (value: unknown[]) => void;
  id: string;
  error?: string;
  env?: FieldEnv;
}

/**
 * A repeatable list of one element type. Each item is an indexed row with its
 * own remove control; "Add" appends a fresh entry. The element renders through
 * the same `FieldRenderer`, so a list of documents gets dropzones and a list of
 * structured concepts gets nested cards - no special-casing per element type.
 *
 * **A row is a thing, not a slot.** Its React key is generated when the row
 * appears and travels with it, so removing an earlier row moves the later ones
 * instead of renumbering them into each other - which is what used to drop a
 * half-typed value or a pending preview onto the neighbouring row. The row's
 * field ID stays POSITIONAL (`cvs.1`), because that ID is a PATH: a host writes
 * an upload back with `setValueAtPath(values, id.split('.'), value)`, and
 * `setValueAtPath` is a pure function of the value tree. Handing out an opaque
 * token instead would mean the kernel keeping a live token-to-index registry for
 * that function to consult, which is exactly the kind of hidden state the
 * headless core does not have.
 *
 * The positional ID is why removal is BLOCKED while a file is arriving anywhere
 * in this list - see `listIsBusy`. Together those two are the whole fix: a
 * generated key cannot rescue a write-back either, because the keys live in this
 * control's state and not in the value, so a host that replaces `values`
 * wholesale reconciles by length just as positions do. What a stable identity
 * buys over a position is exactly the reorderings the KERNEL performs, and it
 * performs one.
 */
export function ListField({ field, value, onChange, id, error, env }: ListFieldProps) {
  const s = useFieldStrings();
  // Same label chrome switch as `FieldShell` - this control owns its own label
  // because the items-count badge sits beside it. See `field-presentation.tsx`.
  const presentation = useFieldPresentation();
  const isApp = presentation === 'app';
  const items = value ?? [];
  const [rowKeys, setRowKeys] = useRowKeys(items.length);

  const setItem = (index: number, itemValue: unknown) => {
    const next = items.slice();
    next[index] = itemValue;
    onChange(next);
  };
  const removeItem = (index: number) => {
    // Drop the identity WITH the row rather than letting the length
    // reconciliation lop one off the end, or every row below this one would
    // take its neighbour's key and remount holding its neighbour's state.
    setRowKeys((prev) => prev.filter((_, i) => i !== index));
    onChange(items.filter((_, i) => i !== index));
  };
  const addItem = () => onChange([...items, emptyValue(field.item)]);

  // A file arriving anywhere in this list - a row that IS a dropzone, or one
  // that contains one - pins the row numbering until it lands. Removing a row
  // renumbers every row after it, and an upload the host is still holding
  // resolves against the ID it was handed at drop time: the file would be
  // written into whichever row had moved into that position. Silently, and with
  // the form still looking correctly filled.
  //
  // ADD stays available on purpose. Appending leaves every existing index where
  // it was, so an in-flight write-back is unaffected, and freezing it would make
  // filling a list of files needlessly serial.
  const busy = listIsBusy(id, env?.uploadingIds);
  // A `Concept[N]` slot is full at N. The count is the method's, read off the
  // same `minItems` ajv enforces, so offering an (N+1)th row would offer one the
  // gate then refuses on `maxItems` - the one fixed-count state readiness has no
  // vocabulary for, since "too many" is not "missing".
  const isFull = field.itemCount !== undefined && items.length >= field.itemCount;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className={cn(
            'text-[13px] font-medium leading-none text-foreground',
            isApp ? 'text-[13.5px]' : 'font-mono',
          )}
        >
          {fieldLabel(field.title, field.name, presentation)}
        </span>
        {!isApp && <ConceptPill conceptRef={field.conceptRef} category="list" />}
        <span className="font-mono text-[10.5px] text-muted-foreground">
          {field.itemCount === undefined
            ? s.itemsCount(items.length)
            : s.itemsCountOf(items.length, field.itemCount)}
        </span>
        {!field.required && (
          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {s.optionalBadge}
          </span>
        )}
      </div>
      {field.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
      )}

      <div className="space-y-2">
        {items.length === 0 && (
          <p className="rounded-md border border-dashed border-border bg-input/50 px-3 py-4 text-center text-[12px] text-muted-foreground">
            {s.noItemsYet}
          </p>
        )}
        {items.map((item, index) => (
          <div
            key={rowKeys[index] ?? index}
            className="flex items-start gap-2 rounded-md border border-border bg-card/40 p-3"
          >
            <span className="mt-1 w-5 shrink-0 text-center font-mono text-[11px] text-muted-foreground">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <FieldRenderer
                field={{ ...field.item, title: '', name: `${field.name}[${index}]` }}
                value={item}
                onChange={(v) => setItem(index, v)}
                id={`${id}.${index}`}
                env={env}
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={env?.disabled || busy}
              aria-label={s.removeItemAria(index + 1)}
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          disabled={env?.disabled || isFull}
          className={cn(
            'inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border text-[13px] text-muted-foreground transition-colors',
            'hover:border-primary/40 hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <Plus className="h-4 w-4" />
          {s.addItem}
        </button>
      </div>
      {error && (
        <p className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * True when a file is arriving anywhere inside this list.
 *
 * A prefix test rather than an exact one, because the busy row is not always the
 * list's own row: a list of DOCUMENTS uploads at `cvs.1`, a list of structures
 * holding a document uploads at `cvs.1.resume`. The dot is what keeps `cvs.` off
 * a sibling input called `cvs_extra`.
 */
function listIsBusy(id: string, uploadingIds: ReadonlySet<string> | undefined): boolean {
  if (!uploadingIds?.size) return false;
  const prefix = `${id}.`;
  for (const uploading of uploadingIds) if (uploading.startsWith(prefix)) return true;
  return false;
}

interface RowKeyState {
  keys: number[];
  next: number;
}

/**
 * One identity per row, minted when the row appears and kept until it goes.
 *
 * The keys are React keys and nothing else - they are never rendered, never put
 * in an ID, and never leave this control - so the counter lives in component
 * state rather than in a module, and a server render and its hydration can
 * disagree about the numbers without disagreeing about the markup.
 *
 * The length reconciliation runs during render, which is the supported way to
 * adjust state when props change: React re-renders immediately without
 * committing the first pass. It is the fallback for a value that changed from
 * OUTSIDE the control (a host seeding or replacing `values`), where there is
 * nothing to match rows by and length is the only honest answer. Removals go
 * through `removeItem`, which drops the right key instead.
 */
function useRowKeys(length: number): [number[], (update: (prev: number[]) => number[]) => void] {
  const [state, setState] = useState<RowKeyState>(() => ({
    keys: Array.from({ length }, (_, i) => i),
    next: length,
  }));

  if (state.keys.length !== length) {
    setState((prev) => {
      if (length <= prev.keys.length) return { keys: prev.keys.slice(0, length), next: prev.next };
      const added = length - prev.keys.length;
      return {
        keys: [...prev.keys, ...Array.from({ length: added }, (_, i) => prev.next + i)],
        next: prev.next + added,
      };
    });
  }

  const update = (fn: (prev: number[]) => number[]) =>
    setState((prev) => ({ keys: fn(prev.keys), next: prev.next }));

  return [state.keys, update];
}

/** A sensible empty starting value for a freshly added list item. */
function emptyValue(field: RunField): unknown {
  switch (field.kind) {
    case 'boolean':
      return false;
    case 'object':
      return {};
    case 'list':
      return [];
    case 'document':
    case 'image':
      return undefined;
    default:
      return undefined;
  }
}
