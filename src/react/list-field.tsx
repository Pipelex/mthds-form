'use client';

import { Plus, Trash2 } from 'lucide-react';
import { cn } from './utils';
import { type ListRunField, type RunField } from '../core';
import { ConceptPill } from './concept-pill';
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
 */
export function ListField({ field, value, onChange, id, error, env }: ListFieldProps) {
  const s = useFieldStrings();
  const items = value ?? [];

  const setItem = (index: number, itemValue: unknown) => {
    const next = items.slice();
    next[index] = itemValue;
    onChange(next);
  };
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));
  const addItem = () => onChange([...items, emptyValue(field.item)]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-mono text-[13px] font-medium leading-none text-foreground">
          {field.title ?? field.name}
        </span>
        <ConceptPill conceptRef={field.conceptRef} category="list" />
        <span className="font-mono text-[10.5px] text-muted-foreground">
          {s.itemsCount(items.length)}
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
            key={index}
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
              disabled={env?.disabled}
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
          disabled={env?.disabled}
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
