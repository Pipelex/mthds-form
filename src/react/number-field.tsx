'use client';

import { shownAsOptional } from '../core/readiness';
import { intentOf } from '../core/hints';
import {
  currencyAffix,
  formatFieldNumber,
  isCurrencyUnit,
  unitSymbol,
} from '../core/number-format';
import { Minus, Plus } from 'lucide-react';
import { checkedAccentClass, focusOutlineClass, selectedStateBorderClass } from './role-tokens';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { cn } from './utils';
import type { NumberRunField } from '../core';
import { ExampleChips } from './example-chips';
import { FieldShell } from './field-shell';
import { fieldLabel, useFieldPresentation } from './field-presentation';
import { useFieldStrings } from './field-strings';
import { fieldControlClass } from './field-styles';
import { useFieldDomId } from './field-dom-id';

interface NumberFieldProps {
  field: NumberRunField;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  id: string;
  error?: string;
  disabled?: boolean;
}

/** The widest span a rating is drawn as a row of steps for: one to ten, as a scale reads. */
const SCALE_MAX_STEPS = 11;

/**
 * How a number is entered, read from what the method says of it (MTHDS
 * `9.2.0`), never from a value:
 *
 * - `scale`: a `rating` whose bounds are both whole and at most ten apart - a
 *   row of steps, one per whole value, as a judgment on a scale reads. A
 *   float rating takes whole steps too: each is a value its schema accepts.
 * - `slider`: any other number with both bounds, unless the method calls it a
 *   `quantity` or counts it in a currency - a slider beside the input, which
 *   still takes a typed value. An amount of money or of something counted is
 *   typed, where a slider would make an exact value a hunt.
 * - `stepper`: everything else, the input with its two steppers.
 */
export function numberEntry(field: NumberRunField): 'scale' | 'slider' | 'stepper' {
  const { min, max } = field;
  if (min === undefined || max === undefined || !(max > min)) return 'stepper';
  const intent = intentOf(field);
  if (
    intent === 'rating' &&
    Number.isInteger(min) &&
    Number.isInteger(max) &&
    max - min + 1 <= SCALE_MAX_STEPS
  )
    return 'scale';
  if (intent === 'quantity' || isCurrencyUnit(field.unit)) return 'stepper';
  return 'slider';
}

/**
 * A number's input: a scale, a slider or a stepper by `numberEntry`, with the
 * field's unit drawn beside the value - a currency's symbol where the reader's
 * locale writes it, `%` after a percentage, a unit of measure's symbol after
 * the number - and the method's examples as chips that fill it.
 *
 * The stepper clamps its own steps to the bounds; a typed value is kept as
 * typed, and readiness names it if it breaks a bound (`valueProblem`), so the
 * person sees what to change rather than a value silently moved.
 */
export function NumberField({ field, value, onChange, id, error, disabled }: NumberFieldProps) {
  const s = useFieldStrings();
  const domId = useFieldDomId(id);
  const presentation = useFieldPresentation();
  const isApp = presentation === 'app';
  const entry = numberEntry(field);
  const currency = isCurrencyUnit(field.unit) ? field.unit : undefined;
  const step = field.integer ? 1 : currency ? 0.01 : 0.1;
  const write = (n: number) => formatFieldNumber(field, n, s.numberLocale);

  const clamp = (n: number) => {
    let next = n;
    if (typeof field.min === 'number') next = Math.max(field.min, next);
    if (typeof field.max === 'number') next = Math.min(field.max, next);
    return field.integer ? Math.round(next) : next;
  };

  const nudge = (delta: number) => onChange(clamp((value ?? 0) + delta));

  const rangeHint =
    entry === 'scale'
      ? undefined
      : field.min !== undefined || field.max !== undefined
        ? `${field.min !== undefined ? write(field.min) : '−∞'} – ${field.max !== undefined ? write(field.max) : '∞'}`
        : undefined;

  const affix = currency
    ? currencyAffix(currency, s.numberLocale)
    : field.unit === 'percent'
      ? { symbol: '%', position: 'after' as const }
      : field.unit !== undefined
        ? { symbol: unitSymbol(field.unit), position: 'after' as const }
        : undefined;

  const input = (
    <div className="relative min-w-0 flex-1">
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
        style={
          affix
            ? {
                [affix.position === 'before' ? 'paddingInlineStart' : 'paddingInlineEnd']:
                  `calc(${affix.symbol.length}ch + 1.25rem)`,
              }
            : undefined
        }
        className={cn(
          fieldControlClass,
          'h-11 px-3 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
          // A number is a value, not an identifier: mono in a studio, beside
          // the field's mono name, and the page's own face in an app.
          !isApp && 'font-mono',
        )}
      />
      {affix && (
        <span
          aria-hidden="true"
          data-unit-affix={affix.position}
          className={cn(
            'pointer-events-none absolute inset-y-0 flex items-center text-sm text-muted-foreground',
            affix.position === 'before' ? 'start-3' : 'end-3',
          )}
        >
          {affix.symbol}
        </span>
      )}
    </div>
  );

  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="number"
      description={field.description}
      hint={rangeHint}
      required={!shownAsOptional(field)}
      error={error}
      htmlFor={entry === 'scale' ? undefined : domId}
    >
      {entry === 'scale' ? (
        <RatingScale
          field={field}
          value={value}
          onChange={onChange}
          disabled={disabled}
          label={fieldLabel(field.title, field.name, presentation)}
        />
      ) : (
        <div className="flex items-stretch gap-1.5">
          {entry === 'slider' && (
            <input
              type="range"
              min={field.min}
              max={field.max}
              step={step}
              value={value ?? field.min}
              disabled={disabled}
              aria-label={fieldLabel(field.title, field.name, presentation)}
              aria-valuetext={value === undefined ? undefined : write(value)}
              data-number-slider=""
              onChange={(e) => onChange(Number(e.target.value))}
              className={cn(
                'h-11 min-w-0 flex-[2] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
                checkedAccentClass,
                focusOutlineClass,
              )}
            />
          )}
          {input}
          {entry === 'stepper' && (
            <>
              <StepButton onClick={() => nudge(-step)} disabled={disabled} label={s.decrease}>
                <Minus className="h-4 w-4" />
              </StepButton>
              <StepButton onClick={() => nudge(step)} disabled={disabled} label={s.increase}>
                <Plus className="h-4 w-4" />
              </StepButton>
            </>
          )}
        </div>
      )}
      {field.examples && (
        <ExampleChips
          examples={field.examples}
          disabled={disabled}
          label={(example) => (typeof example === 'number' ? write(example) : example)}
          onPick={(example) => {
            if (typeof example === 'number') onChange(example);
          }}
        />
      )}
    </FieldShell>
  );
}

/**
 * A rating as a row of steps, one per whole value between its bounds: a
 * radio group (the vendored toggle group's single mode, with its roving focus
 * and arrow keys) named by the field's label, each step named "4 out of 5".
 * Pressing the chosen step again clears an optional rating.
 */
function RatingScale({
  field,
  value,
  onChange,
  disabled,
  label,
}: {
  field: NumberRunField;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
  label: string;
}) {
  const s = useFieldStrings();
  const min = field.min!;
  const max = field.max!;
  const steps = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  return (
    <ToggleGroup
      type="single"
      value={value === undefined ? '' : String(value)}
      onValueChange={(next) => onChange(next === '' ? undefined : Number(next))}
      disabled={disabled}
      aria-label={label}
      data-rating-scale=""
      className="flex flex-wrap justify-start gap-1.5"
    >
      {steps.map((step) => (
        <ToggleGroupItem
          key={step}
          value={String(step)}
          variant="outline"
          aria-label={s.scaleStepAria(String(step), String(max))}
          className={cn(
            'h-10 min-w-10 border-border bg-input px-0 text-[14px] tabular-nums text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:font-semibold data-[state=on]:text-foreground max-sm:h-11 max-sm:min-w-11',
            selectedStateBorderClass,
          )}
        >
          {step}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
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
        focusOutlineClass,
      )}
    >
      {children}
    </button>
  );
}
