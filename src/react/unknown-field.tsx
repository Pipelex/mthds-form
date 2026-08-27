'use client';

import { cn } from './utils';
import type { UnknownRunField } from '../core';
import { FieldShell } from './field-shell';
import { useFieldStrings } from './field-strings';
import { fieldControlClass } from './field-styles';
import { useFieldDomId } from './field-dom-id';

interface UnknownFieldProps {
  field: UnknownRunField;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  id: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Escape hatch for a concept whose shape we can't map to a known control. Rather
 * than block the run, we let the user hand-write the value as JSON - rare, but it
 * keeps every method runnable instead of dead-ending on an unusual input.
 */
export function UnknownField({ field, value, onChange, id, error, disabled }: UnknownFieldProps) {
  const s = useFieldStrings();
  const domId = useFieldDomId(id);
  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="structured"
      description={field.description ?? s.jsonHint}
      required={field.required}
      error={error}
      htmlFor={domId}
    >
      <textarea
        id={domId}
        value={value ?? ''}
        disabled={disabled}
        aria-invalid={!!error}
        rows={3}
        spellCheck={false}
        placeholder={'{\n  "key": "value"\n}'}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
        className={cn(fieldControlClass, 'min-h-[80px] resize-y px-3 py-2.5 font-mono text-[12px]')}
      />
    </FieldShell>
  );
}
