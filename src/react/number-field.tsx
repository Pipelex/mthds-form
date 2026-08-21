'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from './utils';
import type { NumberRunField } from '../core';
import { FieldShell } from './field-shell';
import { useFieldStrings } from './field-strings';
import { fieldControlClass } from './field-styles';

interface NumberFieldProps {
  field: NumberRunField;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  id: string;
  error?: string;
  disabled?: boolean;
}

/** Numeric input with steppers and min/max clamping. */
export function NumberField({ field, value, onChange, id, error, disabled }: NumberFieldProps) {
  const s = useFieldStrings();
  const step = field.integer ? 1 : 0.1;

  const clamp = (n: number) => {
    let next = n;
    if (typeof field.min === 'number') next = Math.max(field.min, next);
    if (typeof field.max === 'number') next = Math.min(field.max, next);
    return field.integer ? Math.round(next) : next;
  };

  const nudge = (delta: number) => onChange(clamp((value ?? 0) + delta));

  const rangeHint =
    field.min !== undefined || field.max !== undefined
      ? `${field.min ?? '−∞'} – ${field.max ?? '∞'}`
      : undefined;

  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="number"
      description={field.description ?? rangeHint}
      required={field.required}
      error={error}
      htmlFor={id}
    >
      <div className="flex items-stretch gap-1.5">
        <input
          id={id}
          type="number"
          inputMode={field.integer ? 'numeric' : 'decimal'}
          value={value ?? ''}
          step={step}
          min={field.min}
          max={field.max}
          disabled={disabled}
          aria-invalid={!!error}
          placeholder="0"
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          className={cn(
            fieldControlClass,
            'h-11 px-3 font-mono tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
          )}
        />
        <StepButton onClick={() => nudge(-step)} disabled={disabled} label={s.decrease}>
          <Minus className="h-4 w-4" />
        </StepButton>
        <StepButton onClick={() => nudge(step)} disabled={disabled} label={s.increase}>
          <Plus className="h-4 w-4" />
        </StepButton>
      </div>
    </FieldShell>
  );
}

function StepButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-input text-muted-foreground transition-colors',
        'hover:border-border hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50',
      )}
    >
      {children}
    </button>
  );
}
