'use client';

import { cn } from './utils';
import type { DateRunField } from '../core';
import { toDateInputValue, toStoredDateValue } from '../core/date-format';
import { FieldShell } from './field-shell';
import { fieldControlClass } from './field-styles';
import { useFieldDomId } from './field-dom-id';

interface DateFieldProps {
  field: DateRunField;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  id: string;
  error?: string;
  disabled?: boolean;
}

/**
 * A calendar-date input. The control only asks for a day (no hand-typed
 * hours/seconds); for a `date-time` concept it stores midnight-UTC so the value
 * still satisfies the API's `date-time` format.
 */
export function DateField({ field, value, onChange, id, error, disabled }: DateFieldProps) {
  const domId = useFieldDomId(id);
  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="date"
      description={field.description}
      required={field.required}
      error={error}
      htmlFor={domId}
    >
      <input
        id={domId}
        type="date"
        value={toDateInputValue(value)}
        disabled={disabled}
        aria-invalid={!!error}
        onChange={(e) => onChange(toStoredDateValue(e.target.value, field.datetime))}
        className={cn(fieldControlClass, 'h-11 px-3 font-mono tabular-nums')}
      />
    </FieldShell>
  );
}
