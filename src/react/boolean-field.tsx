'use client';

import { cn } from './utils';
import type { BooleanRunField } from '../core';
import { ConceptPill } from './concept-pill';
import { Switch } from './ui/switch';

interface BooleanFieldProps {
  field: BooleanRunField;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  id: string;
  disabled?: boolean;
}

/**
 * A toggle. Unlike the other fields the label sits inline with the control on a
 * single hairline row - a boolean reads better as a switchable statement than as
 * a labelled box.
 */
export function BooleanField({ field, value, onChange, id, disabled }: BooleanFieldProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-md border border-border bg-input px-3.5 py-3',
        disabled && 'opacity-50',
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <label
            htmlFor={id}
            className="font-mono text-[13px] font-medium leading-none text-foreground"
          >
            {field.title ?? field.name}
          </label>
          <ConceptPill conceptRef={field.conceptRef} category="boolean" />
        </div>
        {field.description && (
          <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={value ?? false}
        onCheckedChange={onChange}
        disabled={disabled}
        className="shrink-0"
      />
    </div>
  );
}
