'use client';

import { useState, type InputHTMLAttributes } from 'react';
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

/** A year in four digits, as RFC 3339 and a `datetime-local` input write it. */
function padYear(n: number): string {
  return String(n).padStart(4, '0');
}

/** A time of day as a time input writes it: `HH:MM` or `HH:MM:SS`, seconds possibly fractional. */
const LOCAL_TIME = /^\d\d:\d\d(?::\d\d(?:\.\d+)?)?$/;

/**
 * A time of day as the gate's `time` format takes it, `HH:MM:SS`: the browser's
 * time input drops the seconds when they are zero, and the format requires
 * them.
 */
export function timeValue(input: string): string {
  return /^\d\d:\d\d$/.test(input) ? `${input}:00` : input;
}

/** A `datetime-local` input's value: a local date and time, with no offset. */
const LOCAL_DATE_TIME = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d))?$/;

/**
 * A stored value as RFC 3339 writes it, or a bare date: the date, then an
 * optional time with optional seconds and fraction, then an optional offset.
 */
const STORED_DATE_TIME =
  /^(\d{4})-(\d\d)-(\d\d)(?:[Tt ](\d\d):(\d\d)(?::(\d\d)(?:\.\d+)?)?([Zz]|[+-]\d\d:\d\d)?)?$/;

/** The local `Date` a `datetime-local` value names, with the parts it was read from. */
function localDate(input: string) {
  const match = LOCAL_DATE_TIME.exec(input);
  if (!match) return undefined;
  const [year, month, day, hours, minutes, seconds = '00'] = match.slice(1).map((part) => part);
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds),
  );
  // `new Date(y, …)` reads a year below 100 as 19xx.
  date.setFullYear(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return undefined;
  return { date, year: year!, month: month!, day: day!, hours: hours!, minutes: minutes!, seconds };
}

/**
 * Whether a `datetime-local` value names a local time the clocks skip on that
 * day in the browser's time zone - 02:30 on the night a spring change goes
 * from 02:00 to 03:00. A `Date` moves such a time past the gap, so writing it
 * with an offset would send another instant than the one shown; the control
 * refuses it instead (`problemNonexistentTime`).
 */
export function isNonexistentLocalTime(input: string): boolean {
  const local = localDate(input);
  if (!local) return false;
  const { date } = local;
  return (
    date.getFullYear() !== Number(local.year) ||
    date.getMonth() + 1 !== Number(local.month) ||
    date.getDate() !== Number(local.day) ||
    date.getHours() !== Number(local.hours) ||
    date.getMinutes() !== Number(local.minutes)
  );
}

/**
 * A `datetime-local` input's value (`2026-11-28T14:30`, local and with no
 * offset) as an RFC 3339 date-time with the browser's own offset
 * (`2026-11-28T14:30:00+01:00`), so the instant the person meant survives the
 * trip to a server in another time zone. `undefined` for anything but a whole
 * local date and time, and for a time the clocks skip that day.
 */
export function dateTimeValue(input: string): string | undefined {
  const local = localDate(input);
  if (!local || isNonexistentLocalTime(input)) return undefined;
  // Whole minutes: before standard time a zone's offset was its local mean
  // time, in seconds, which RFC 3339 cannot write.
  const offset = Math.round(-local.date.getTimezoneOffset());
  const sign = offset >= 0 ? '+' : '-';
  const zone = `${sign}${pad(Math.trunc(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
  return `${local.year}-${local.month}-${local.day}T${local.hours}:${local.minutes}:${local.seconds}${zone}`;
}

/**
 * A stored date-time, as a `datetime-local` input shows it: a value with an
 * offset in the browser's own time zone, the same instant; a value with none,
 * or a bare date, as the wall time it states, since there is no instant to
 * convert - a bare `2026-11-28` read as UTC showed the day before west of
 * Greenwich. Anything else shows empty.
 */
export function dateTimeInputValue(value: string | undefined): string {
  if (!value) return '';
  const match = STORED_DATE_TIME.exec(value);
  if (!match) return '';
  const [, year, month, day, hours = '00', minutes = '00', seconds = '00', zone] = match;
  if (zone === undefined) return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  const date = new Date(value.replace(/^(\d{4}-\d\d-\d\d) /, '$1T'));
  if (Number.isNaN(date.getTime())) return '';
  return `${padYear(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * The browser's own date-and-time picker, around what the field stores. What
 * the person types is kept as typed while the value stands for it, so the
 * input is not rewritten under them: a year typed digit by digit (`0002`)
 * reads as itself until it is whole. A local time the clocks skip is refused
 * with the field's own problem rather than stored as another instant.
 */
function DateTimeInput({
  id,
  value,
  onChange,
  disabled,
  invalid,
  onProblem,
}: {
  id: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  invalid: boolean;
  onProblem: (problem: boolean) => void;
}) {
  const [typed, setTyped] = useState<{ raw: string; stands: string | undefined } | null>(null);
  const shown = typed && typed.stands === value ? typed.raw : dateTimeInputValue(value);
  return (
    <input
      id={id}
      type="datetime-local"
      step={1}
      value={shown}
      disabled={disabled}
      aria-invalid={invalid}
      onChange={(e) => {
        const raw = e.target.value;
        const next = dateTimeValue(raw);
        onProblem(isNonexistentLocalTime(raw));
        setTyped({ raw, stands: next });
        onChange(next);
      }}
      className={cn(fieldControlClass, 'h-11 px-3 tabular-nums dark:scheme-dark')}
    />
  );
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
  const [skippedTime, setSkippedTime] = useState(false);
  const shownError = error ?? (skippedTime ? s.problemNonexistentTime : undefined);

  let control;
  // A time input shows only a local time of day: a restored value carrying a
  // zone (`14:30:00Z`, `14:30:00+01:00`) would be blank in it while still
  // submitted, so such a value keeps a plain text input, where it is seen and
  // edited as it is.
  const zonedTime = field.format === 'time' && value !== undefined && !LOCAL_TIME.test(value);
  if (field.format === 'time' && !zonedTime) {
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
      <DateTimeInput
        id={domId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        invalid={!!shownError}
        onProblem={setSkippedTime}
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
      error={shownError}
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
