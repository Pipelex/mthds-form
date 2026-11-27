'use client';

import { shownAsOptional } from '../core/readiness';
import { Minus, Plus } from 'lucide-react';
import { focusOutlineClass } from './role-tokens';
import { cn } from './utils';
import type { NumberRunField } from '../core';
import { FieldShell } from './field-shell';
import { useFieldPresentation } from './field-presentation';
import { useFieldStrings } from './field-strings';
import { appControlHeight, controlClass } from './field-styles';
import { useFieldDomId } from './field-dom-id';
import { useCompactControl, useStructureDepth } from './field-context';

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
  const domId = useFieldDomId(id);
  const isApp = useFieldPresentation() === 'app';
  const compact = useCompactControl();
  // Inside a structure the range has no line of its own under the control:
  // a structure's row says only what its label and description say.
  const inStructure = useStructureDepth() > 0;
  const step = field.integer ? 1 : 0.1;

  const clamp = (n: number) => {
    let next = n;
    if (typeof field.min === 'number') next = Math.max(field.min, next);
    if (typeof field.max === 'number') next = Math.min(field.max, next);
    // Rounded to the step, so ten presses of 0.1 read 1, not 0.9999999999999999.
    return field.integer ? Math.round(next) : Math.round(next * 10) / 10;
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
      description={field.description}
      // In an app the range is its own line under the control, as "1 – 5", or
      // "1 – ∞" with a lower bound only; the description keeps its place.
      hint={isApp ? undefined : rangeHint}
      required={!shownAsOptional(field)}
      error={error}
      htmlFor={domId}
    >
      <div
        className={cn(
          'flex items-stretch gap-1.5',
          // As an input of its own the value and its steppers take 280 pixels,
          // the width a number needs; in a structure they fill the column.
          isApp && !compact && 'max-w-[280px]',
        )}
      >
        <input
          id={domId}
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
            controlClass(isApp),
            'min-w-0 px-3 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
            // A number is a value, not an identifier: mono in a studio, beside
            // the field's mono name, and the page's own face in an app, set
            // right as a figure is.
            isApp ? [appControlHeight(compact), 'flex-1 text-right'] : 'h-11 font-mono',
          )}
        />
        <StepButton
          onClick={() => nudge(-step)}
          disabled={disabled}
          label={s.decrease}
          isApp={isApp}
          compact={compact}
        >
          <Minus className="h-4 w-4" />
        </StepButton>
        <StepButton
          onClick={() => nudge(step)}
          disabled={disabled}
          label={s.increase}
          isApp={isApp}
          compact={compact}
        >
          <Plus className="h-4 w-4" />
        </StepButton>
      </div>
      {isApp && rangeHint && !inStructure && (
        <p className="mt-3 text-[12px] leading-4 text-muted-foreground tabular-nums">{rangeHint}</p>
      )}
    </FieldShell>
  );
}

function StepButton({
  onClick,
  disabled,
  label,
  isApp,
  compact,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  isApp: boolean;
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex shrink-0 items-center justify-center text-muted-foreground transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        isApp
          ? [
              // A well of the field's own fill, with no edge, as the input beside it.
              'rounded-lg bg-input hover:bg-[color-mix(in_oklab,var(--foreground,hsl(240_10%_3.9%))_6%,var(--input,hsl(240_4.8%_95.9%)))] hover:text-foreground',
              compact ? 'size-9 max-md:size-11' : 'size-10 max-md:size-11',
            ]
          : 'h-11 w-11 rounded-md border border-border bg-input hover:border-border hover:bg-muted hover:text-foreground',
        focusOutlineClass,
      )}
    >
      {children}
    </button>
  );
}
