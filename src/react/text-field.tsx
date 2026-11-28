'use client';

import type { InputHTMLAttributes } from 'react';
import { shownAsOptional } from '../core/readiness';
import { intentOf } from '../core/hints';
import { cn } from './utils';
import type { ProseRunField, TextRunField } from '../core';
import { ExampleChips } from './example-chips';
import { FieldShell } from './field-shell';
import { useFieldStrings } from './field-strings';
import { fieldControlClass } from './field-styles';
import { useFieldDomId } from './field-dom-id';
import { LengthCounter } from './length-counter';

interface TextFieldProps {
  field: TextRunField;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  id: string;
  error?: string;
  disabled?: boolean;
}

/** The attributes that turn spelling help off, for a value a machine reads. */
const MACHINE_TEXT = {
  spellCheck: false,
  autoCapitalize: 'none',
  autoCorrect: 'off',
} as const satisfies InputHTMLAttributes<HTMLInputElement>;

/**
 * What the browser is told about a text input, from the format its method
 * gives it (MTHDS `9.2.0`, a closed set) and its `identifier` intent: the
 * keyboard a phone offers, what the browser may fill it with, whether spelling
 * help runs, and whether it is set in monospace. A date and time and a time of
 * day are the browser's own pickers (`TimeInput`, `DateTimeInput`). Nothing
 * here validates: readiness checks the value against the gate's own format
 * table (`valueProblem`).
 */
function textInputAttributes(field: TextRunField): {
  props: InputHTMLAttributes<HTMLInputElement>;
  mono: boolean;
} {
  switch (field.format) {
    case 'email':
      return {
        props: { type: 'email', inputMode: 'email', autoComplete: 'email', ...MACHINE_TEXT },
        mono: false,
      };
    case 'uri':
      return {
        props: { type: 'url', inputMode: 'url', autoComplete: 'url', ...MACHINE_TEXT },
        mono: false,
      };
    case 'uuid':
    case 'hostname':
    case 'ipv6':
      return { props: { type: 'text', autoComplete: 'off', ...MACHINE_TEXT }, mono: true };
    case 'ipv4':
      return {
        props: { type: 'text', inputMode: 'decimal', autoComplete: 'off', ...MACHINE_TEXT },
        mono: true,
      };
    default:
      return intentOf(field) === 'identifier'
        ? { props: { type: 'text', autoComplete: 'off', ...MACHINE_TEXT }, mono: true }
        : { props: { type: 'text' }, mono: false };
  }
}

/** Two digits, as a time or a date writes a part. */
function pad(n: number): string {
  return String(Math.abs(n)).padStart(2, '0');
}

/**
 * A time of day as the gate's `time` format takes it, `HH:MM:SS`: the browser's
 * time input drops the seconds when they are zero, and the format requires
 * them.
 */
export function timeValue(input: string): string {
  return /^\d\d:\d\d$/.test(input) ? `${input}:00` : input;
}

/**
 * A `datetime-local` input's value (`2026-11-28T14:30`, local and with no
 * offset) as an RFC 3339 date-time with the browser's own offset
 * (`2026-11-28T14:30:00+01:00`), so the instant the person meant survives the
 * trip to a server in another time zone.
 */
export function dateTimeValue(input: string): string | undefined {
  const match = /^(\d{4}-\d\d-\d\d)T(\d\d:\d\d)(:\d\d)?/.exec(input);
  if (!match) return undefined;
  const local = new Date(`${match[1]}T${match[2]}${match[3] ?? ':00'}`);
  if (Number.isNaN(local.getTime())) return undefined;
  const offset = -local.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  return `${match[1]}T${match[2]}${match[3] ?? ':00'}${sign}${pad(Math.trunc(offset / 60))}:${pad(offset % 60)}`;
}

/** A stored date-time, as a `datetime-local` input shows it: in the browser's own time zone. */
export function dateTimeInputValue(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Single-line string input (short native.Text or a plain string property),
 * shaped by what the method says of it: the format's input and keyboard, a
 * monospace face for an identifier or a code-like format, a counter under it
 * when the method caps its length, and the method's examples as chips.
 */
export function TextField({ field, value, onChange, id, error, disabled }: TextFieldProps) {
  const s = useFieldStrings();
  const domId = useFieldDomId(id);
  const counterId = `${domId}-length`;
  const { props, mono } = textInputAttributes(field);
  const change = (next: string) => onChange(next === '' ? undefined : next);

  let control;
  if (field.format === 'time') {
    control = (
      <input
        id={domId}
        type="time"
        step={1}
        value={value ?? ''}
        disabled={disabled}
        aria-invalid={!!error}
        onChange={(e) => change(timeValue(e.target.value))}
        className={cn(fieldControlClass, 'h-11 px-3 tabular-nums dark:scheme-dark')}
      />
    );
  } else if (field.format === 'date-time') {
    control = (
      <input
        id={domId}
        type="datetime-local"
        step={1}
        value={dateTimeInputValue(value)}
        disabled={disabled}
        aria-invalid={!!error}
        onChange={(e) => onChange(dateTimeValue(e.target.value))}
        className={cn(fieldControlClass, 'h-11 px-3 tabular-nums dark:scheme-dark')}
      />
    );
  } else {
    control = (
      <input
        id={domId}
        {...props}
        value={value ?? ''}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={field.maxLength !== undefined ? counterId : undefined}
        placeholder={
          field.placeholder ??
          (field.format ? s.formatPlaceholder(field.format) : undefined) ??
          s.typeValuePlaceholder
        }
        onChange={(e) => change(e.target.value)}
        data-mono={mono ? '' : undefined}
        className={cn(fieldControlClass, 'h-11 px-3', mono && 'font-mono text-[13px]')}
      />
    );
  }

  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="text"
      description={field.description}
      required={!shownAsOptional(field)}
      error={error}
      htmlFor={domId}
    >
      {control}
      {field.maxLength !== undefined && (
        <LengthCounter value={value} max={field.maxLength} id={counterId} />
      )}
      {field.examples && (
        <ExampleChips
          examples={field.examples}
          disabled={disabled}
          onPick={(example) => change(String(example))}
        />
      )}
    </FieldShell>
  );
}

interface ProseFieldProps {
  field: ProseRunField;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  id: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Multi-line free text. Auto-grows with content (`field-sizing-content`) so long
 * prompts don't trap the user in a tiny scrollbox - the field that carries most
 * of a method's intent should feel roomy.
 *
 * Two intents change it. `code` sets it in monospace, without spelling help and
 * without wrapping a line a machine reads as one. `question` makes it the
 * composer of a chat-like page: a taller, larger box asking for the question.
 * A counter sits under it when the method caps its length.
 */
export function ProseField({ field, value, onChange, id, error, disabled }: ProseFieldProps) {
  const s = useFieldStrings();
  const domId = useFieldDomId(id);
  const counterId = `${domId}-length`;
  const intent = intentOf(field);
  const code = intent === 'code';
  const question = intent === 'question';
  const change = (next: string) => onChange(next === '' ? undefined : next);
  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="text"
      description={field.description}
      required={!shownAsOptional(field)}
      error={error}
      htmlFor={domId}
    >
      <textarea
        id={domId}
        value={value ?? ''}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={field.maxLength !== undefined ? counterId : undefined}
        rows={question ? 4 : 3}
        placeholder={
          field.placeholder ?? (question ? s.questionPlaceholder : s.writeHerePlaceholder)
        }
        onChange={(e) => change(e.target.value)}
        {...(code
          ? { spellCheck: false, autoCapitalize: 'none', autoCorrect: 'off', wrap: 'off' }
          : {})}
        data-intent={code || question ? intent : undefined}
        className={cn(
          fieldControlClass,
          'min-h-[88px] resize-y px-3 py-2.5 leading-relaxed field-sizing-content',
          code && 'font-mono text-[13px] whitespace-pre',
          question && 'min-h-[128px] rounded-xl px-4 py-3 text-[15px]',
        )}
      />
      {field.maxLength !== undefined && (
        <LengthCounter value={value} max={field.maxLength} id={counterId} />
      )}
      {field.examples && (
        <ExampleChips
          examples={field.examples}
          disabled={disabled}
          onPick={(example) => change(String(example))}
        />
      )}
    </FieldShell>
  );
}
