'use client';

import { useState } from 'react';
import { cn } from './utils';
import type { ObjectRunField } from '../core';
import { isFilled } from '../core/readiness';
import { ConceptPill } from './concept-pill';
import { FieldRenderer, type FieldEnv } from './field-renderer';
import { fieldLabel, useFieldPresentation } from './field-presentation';
import { useFieldStrings } from './field-strings';
import { OptionalToggle } from './optional-toggle';

interface ObjectFieldProps {
  field: ObjectRunField;
  value: Record<string, unknown> | undefined;
  onChange: (value: Record<string, unknown>) => void;
  id: string;
  error?: string;
  env?: FieldEnv;
}

/**
 * A structured concept: its sub-fields rendered inside one hairline-grouped
 * card so nesting stays legible. Empty optional sub-fields collapse behind a
 * "+ N optional" toggle - required and already-filled fields always show.
 */
export function ObjectField({ field, value, onChange, id, error, env }: ObjectFieldProps) {
  const s = useFieldStrings();
  const [showOptional, setShowOptional] = useState(false);
  // A grouped concept reads as a section heading in an app, not as a typed field.
  const presentation = useFieldPresentation();
  const isApp = presentation === 'app';
  const data = value ?? {};

  const setChild = (name: string, childValue: unknown) => onChange({ ...data, [name]: childValue });

  const optionalEmpty = field.fields.filter((f) => !f.required && !isFilled(data[f.name]));
  const visible = showOptional
    ? field.fields
    : field.fields.filter((f) => f.required || isFilled(data[f.name]));

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
        {!isApp && <ConceptPill conceptRef={field.conceptRef} category="structured" />}
        {!field.required && (
          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {s.optionalBadge}
          </span>
        )}
      </div>
      {field.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
      )}

      <div
        className={cn(
          'space-y-4 rounded-lg border bg-card/40 p-4',
          error ? 'border-destructive/50' : 'border-border',
        )}
      >
        {visible.map((child) => (
          <FieldRenderer
            key={child.name}
            field={child}
            value={data[child.name]}
            onChange={(v) => setChild(child.name, v)}
            id={`${id}.${child.name}`}
            env={env}
          />
        ))}

        {optionalEmpty.length > 0 && (
          <OptionalToggle
            count={optionalEmpty.length}
            expanded={showOptional}
            onToggle={() => setShowOptional((v) => !v)}
            noun="field"
          />
        )}
      </div>
      {error && (
        <p className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
