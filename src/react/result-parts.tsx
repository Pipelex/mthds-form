'use client';

/**
 * The pieces of a result page the method's meaning draws (MTHDS `9.2.0`):
 * a number in its unit with a meter between its bounds, a choice in its
 * tone, a record's verdict, the counts of a list by verdict, and a column's
 * total or average. Each reads only what the descriptor states - a `unit`, a
 * pair of bounds, an option's `tone`, a field's `part` or `aggregate` - and
 * never infers one from a value. See docs/result-view.md, "What the method's
 * meaning draws".
 */

import type { EnumRunField, NumberRunField, ObjectRunField, RunField } from '../core';
import { memberWithPart, optionTone } from '../core/hints';
import { formatFieldNumber } from '../core/number-format';
import { ownProp } from '../core/own-property';
import { optionLabeler } from './enum-field';
import { fieldLabel, useFieldPresentation } from './field-presentation';
import { useFieldStrings } from './field-strings';
import { unwrap } from './result-unwrap';
import { ToneBadge } from './tone-badge';
import { cn } from './utils';

/** Whether a number states both bounds, so it reads against them as a meter. */
export function hasMeter(field: NumberRunField): boolean {
  return field.min !== undefined && field.max !== undefined && field.max > field.min;
}

/**
 * A number as the method says to read it: money in its currency, a
 * percentage, a measure with its unit, or grouped and rounded
 * (`formatFieldNumber`), in tabular figures so a column of them lines up.
 * Anything that is not a finite number is the payload disagreeing with its
 * descriptor, and is left to the caller's floor.
 */
export function NumberText({ field, value }: { field: NumberRunField; value: number }) {
  const s = useFieldStrings();
  return (
    <span className="whitespace-nowrap text-[13px] tabular-nums text-foreground">
      {formatFieldNumber(field, value, s.numberLocale)}
    </span>
  );
}

/**
 * A number with both bounds, read against them: the value as written beside
 * a bar filled to where it stands between the bounds, a `meter` to assistive
 * technology with the value and its bounds as its text. The fill is the
 * muted foreground, never a tone: a position between two bounds says nothing
 * of whether it is good, which only a choice's tone may say.
 */
export function Meter({ field, value }: { field: NumberRunField; value: number }) {
  const s = useFieldStrings();
  const presentation = useFieldPresentation();
  const min = field.min!;
  const max = field.max!;
  const share = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const write = (n: number) => formatFieldNumber(field, n, s.numberLocale);
  return (
    <span className="inline-flex items-center gap-2.5">
      <NumberText field={field} value={value} />
      <span
        role="meter"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={s.meterValueText(write(value), write(min), write(max))}
        aria-label={fieldLabel(field.title, field.name, presentation)}
        data-meter=""
        className="relative inline-block h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:w-28"
      >
        <span
          className="absolute inset-y-0 start-0 rounded-full bg-muted-foreground"
          style={{ width: `${share * 100}%` }}
        />
      </span>
    </span>
  );
}

/**
 * A choice whose options carry tones, as a badge in its option's tone and
 * words (`optionLabeler`); an option the method gave no tone reads neutral,
 * as the standard rules. A value that is not one of the options is shown as
 * written, neutral.
 */
export function ToneValue({ field, value }: { field: EnumRunField; value: string }) {
  const presentation = useFieldPresentation();
  const label = optionLabeler(field, presentation)(value);
  return <ToneBadge tone={optionTone(field, value)}>{label}</ToneBadge>;
}

/**
 * A record's verdict, drawn first and large: the answer the reader came for.
 * A choice reads as its option in its tone, a yes or no as the word, and a
 * number in its unit, against its bounds when it has them.
 */
export function VerdictLine({
  field,
  value: raw,
  prominent,
}: {
  field: RunField;
  value: unknown;
  prominent: boolean;
}) {
  const s = useFieldStrings();
  const presentation = useFieldPresentation();
  const value = unwrap(field, raw);
  let shown;
  if (field.kind === 'enum' && typeof value === 'string') {
    shown = (
      <ToneBadge tone={optionTone(field, value)} size={prominent ? 'large' : 'small'}>
        {optionLabeler(field, presentation)(value)}
      </ToneBadge>
    );
  } else if (field.kind === 'boolean' && typeof value === 'boolean') {
    shown = (
      <ToneBadge tone="neutral" size={prominent ? 'large' : 'small'}>
        {value ? s.yes : s.no}
      </ToneBadge>
    );
  } else if (field.kind === 'number' && typeof value === 'number' && Number.isFinite(value)) {
    shown = (
      <span className={cn('tabular-nums', prominent && 'text-[20px] font-semibold')}>
        {hasMeter(field) ? (
          <Meter field={field} value={value} />
        ) : (
          formatFieldNumber(field, value, s.numberLocale)
        )}
      </span>
    );
  } else {
    return null;
  }
  return (
    <div data-verdict-line="" className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-[12.5px] text-muted-foreground">
        {fieldLabel(field.title, field.name, presentation)}
      </span>
      {shown}
    </div>
  );
}

/**
 * A record's headline numbers (`part = "metric"`), as tiles: the label small
 * over the value large, in its unit.
 */
export function MetricTiles({
  fields,
  record,
}: {
  fields: readonly NumberRunField[];
  record: Record<string, unknown>;
}) {
  const s = useFieldStrings();
  const presentation = useFieldPresentation();
  const tiles = fields.flatMap((field) => {
    const value = unwrap(field, ownProp(record, field.name));
    return typeof value === 'number' && Number.isFinite(value) ? [{ field, value }] : [];
  });
  if (tiles.length === 0) return null;
  return (
    <div data-metric-tiles="" className="flex flex-wrap gap-2">
      {tiles.map(({ field, value }) => (
        <div
          key={field.name}
          className="min-w-[8rem] rounded-lg border border-border bg-card/40 px-3 py-2"
        >
          <div className="text-[12px] text-muted-foreground">
            {fieldLabel(field.title, field.name, presentation)}
          </div>
          <div className="text-[18px] font-semibold tabular-nums text-foreground">
            {formatFieldNumber(field, value, s.numberLocale)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The verdict a list of records is counted by: the element's `verdict` part,
 * when it is a choice or a yes or no, the two a count by value means
 * something for.
 */
export function countableVerdict(element: RunField): RunField | undefined {
  if (element.kind !== 'object') return undefined;
  const verdict = memberWithPart(element.fields, 'verdict');
  return verdict && (verdict.kind === 'enum' || verdict.kind === 'boolean') ? verdict : undefined;
}

/**
 * How many records of a list hold each verdict, at the top of the list:
 * "4 Up · 1 Redirect · 1 Down", each a badge in its option's tone, in the
 * options' declared order, an option no record holds left out. A record with
 * no readable verdict is not counted.
 */
export function VerdictCounts({
  verdict,
  items,
}: {
  verdict: RunField;
  items: readonly unknown[];
}) {
  const s = useFieldStrings();
  const presentation = useFieldPresentation();
  const values = items.map((item) =>
    typeof item === 'object' && item !== null
      ? unwrap(verdict, ownProp(item as Record<string, unknown>, verdict.name))
      : undefined,
  );
  let entries: { key: string; label: string; tone: ReturnType<typeof optionTone>; count: number }[];
  if (verdict.kind === 'enum') {
    const label = optionLabeler(verdict, presentation);
    entries = verdict.options.map((option) => ({
      key: option,
      label: label(option),
      tone: optionTone(verdict, option),
      count: values.filter((value) => value === option).length,
    }));
  } else {
    entries = [true, false].map((answer) => ({
      key: String(answer),
      label: answer ? s.yes : s.no,
      tone: 'neutral' as const,
      count: values.filter((value) => value === answer).length,
    }));
  }
  const shown = entries.filter((entry) => entry.count > 0);
  if (shown.length === 0) return null;
  return (
    <ul aria-label={s.verdictCountsAria} data-verdict-counts="" className="flex flex-wrap gap-1.5">
      {shown.map((entry) => (
        <li key={entry.key}>
          <ToneBadge tone={entry.tone}>
            <span className="font-semibold tabular-nums">{entry.count}</span> {entry.label}
          </ToneBadge>
        </li>
      ))}
    </ul>
  );
}

/** A number column's aggregate over a list of records: the field, its rule and the result. */
export interface ColumnAggregate {
  field: NumberRunField;
  rule: 'sum' | 'average';
  value: number;
}

/**
 * The totals and averages a list of records shows: one per number field that
 * declares an `aggregate`, computed over the records that carry a number for
 * it. A field that declares none gets none - whether numbers add up is the
 * method's to say, never a guess - and a column no record fills is left out.
 */
export function columnAggregates(
  element: ObjectRunField,
  items: readonly unknown[],
): ColumnAggregate[] {
  return element.fields.flatMap((field) => {
    if (field.kind !== 'number' || field.aggregate === undefined) return [];
    const numbers = items.flatMap((item) => {
      if (typeof item !== 'object' || item === null) return [];
      const value = unwrap(field, ownProp(item as Record<string, unknown>, field.name));
      return typeof value === 'number' && Number.isFinite(value) ? [value] : [];
    });
    if (numbers.length === 0) return [];
    const sum = numbers.reduce((total, n) => total + n, 0);
    return [
      {
        field,
        rule: field.aggregate,
        value: field.aggregate === 'sum' ? sum : sum / numbers.length,
      },
    ];
  });
}

/**
 * The total and average row under a list of records: each aggregate named by
 * its rule and its column, its value in the column's unit, set as the foot of
 * the table above it.
 */
export function AggregateRow({ aggregates }: { aggregates: readonly ColumnAggregate[] }) {
  const s = useFieldStrings();
  const presentation = useFieldPresentation();
  if (aggregates.length === 0) return null;
  return (
    <div
      data-aggregates=""
      className="flex flex-wrap justify-end gap-x-6 gap-y-1 rounded-lg border border-border bg-muted px-3 py-2"
    >
      {aggregates.map(({ field, rule, value }) => (
        <div
          key={field.name}
          data-aggregate={rule}
          className="flex items-baseline gap-2 text-[13px]"
        >
          <span className="text-muted-foreground">
            {rule === 'sum' ? s.aggregateSum : s.aggregateAverage}
            {' · '}
            {fieldLabel(field.title, field.name, presentation)}
          </span>
          <span className="font-semibold tabular-nums text-foreground">
            {formatFieldNumber(field, value, s.numberLocale)}
          </span>
        </div>
      ))}
    </div>
  );
}
