'use client';

import { useId, useState } from 'react';
import type { ListRunField, ObjectRunField, RunField } from '../core';
import type { FieldStrings } from './field-strings';
import { useFieldStrings } from './field-strings';
import { appControlClass, appMiniButtonClass } from './field-styles';
import { focusOutlineClass, successFillClass } from './role-tokens';
import { cn } from './utils';

/**
 * Paste JSON: the other way to fill a structure or a list in an app. The
 * header's Form / Paste JSON switch (`PasteJsonSwitch`) turns the input's form
 * into one code box (`PasteJsonEditor`) already holding what the form holds,
 * with a line that checks the text as it is typed; "Use this JSON" puts the
 * value in the form and goes back to Form. The value it writes is the form's
 * own shape, so the run gate judges it exactly as it judges what the form
 * wrote. See docs/method-form.md, "Paste JSON".
 */

/** What the line under a JSON box says, and how its dot is coloured. */
export interface JsonStatusLine {
  text: string;
  tone: 'idle' | 'ok' | 'bad';
}

/**
 * The line under a raw JSON value: "Enter this value as raw JSON." until
 * something is typed, then "Valid JSON" or "Not valid JSON yet".
 */
export function jsonStatusOf(text: string, s: FieldStrings): JsonStatusLine {
  if (text.trim() === '') return { text: s.jsonHint, tone: 'idle' };
  return parseJson(text).ok
    ? { text: s.validJson, tone: 'ok' }
    : { text: s.notValidJsonYet, tone: 'bad' };
}

/** A dot in the line's tone, then its words. Announced politely as it changes. */
export function JsonStatus({
  status,
  id,
  className,
}: {
  status: JsonStatusLine;
  id?: string;
  className?: string;
}) {
  return (
    <p
      id={id}
      aria-live="polite"
      data-json-status={status.tone}
      className={cn(
        'm-0 inline-flex items-center gap-[7px] text-[12.5px] leading-[17px] text-muted-foreground',
        className,
      )}
    >
      <i
        aria-hidden="true"
        className={cn(
          'size-[7px] shrink-0 rounded-full',
          status.tone === 'ok' && successFillClass,
          status.tone === 'bad' && 'bg-destructive',
          status.tone === 'idle' && 'bg-muted-foreground opacity-60',
        )}
      />
      {status.text}
    </p>
  );
}

/** The Form / Paste JSON switch on a structure's or a list's header. */
export function PasteJsonSwitch({
  label,
  json,
  onChange,
  disabled,
}: {
  label: string;
  json: boolean;
  onChange: (json: boolean) => void;
  disabled?: boolean;
}) {
  const s = useFieldStrings();
  const side = (pressed: boolean, text: string, next: boolean) => (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={() => {
        if (!pressed) onChange(next);
      }}
      className={cn(
        'h-[26px] rounded-md px-2.5 text-[12px] font-medium leading-4 transition-colors max-md:h-11',
        'disabled:cursor-not-allowed disabled:opacity-50',
        pressed
          ? 'bg-card text-foreground shadow-[0_0_0_1px_var(--border,hsl(240_5.9%_90%))]'
          : 'bg-transparent text-muted-foreground hover:text-foreground',
        focusOutlineClass,
      )}
    >
      {text}
    </button>
  );
  return (
    <div
      role="group"
      aria-label={s.fillModeGroup(label)}
      className="flex shrink-0 rounded-lg bg-input p-0.5"
    >
      {side(!json, s.formMode, false)}
      {side(json, s.pasteJsonMode, true)}
    </div>
  );
}

/**
 * The code box Paste JSON shows in place of the form, and its line: "Valid
 * JSON · 2 of 3 fields match" for a structure, "Valid JSON · 3 items" for a
 * list, or "Not valid JSON yet". "Use this JSON" stays greyed out until the
 * text is JSON of the input's shape, then writes it and goes back to Form.
 * It opens on what the form holds, or on an outline of the input's fields.
 */
export function PasteJsonEditor({
  field,
  value,
  onUse,
  disabled,
}: {
  field: ObjectRunField | ListRunField;
  value: unknown;
  onUse: (value: unknown) => void;
  disabled?: boolean;
}) {
  const s = useFieldStrings();
  const [text, setText] = useState(() => JSON.stringify(startingValue(field, value), null, 2));
  const statusId = useId();
  const parsed = parseJson(text);
  const check = checkShape(field, parsed, s);
  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={text}
        spellCheck={false}
        disabled={disabled}
        placeholder="{ }"
        aria-label={s.pasteJsonMode}
        aria-describedby={statusId}
        onChange={(e) => setText(e.target.value)}
        className={cn(
          appControlClass,
          'min-h-[170px] resize-y px-3 py-2.5 font-mono text-[12.5px] leading-[19px] field-sizing-content',
        )}
      />
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <JsonStatus id={statusId} status={check.line} />
        <button
          type="button"
          disabled={disabled || !check.usable}
          onClick={() => {
            if (parsed.ok && check.usable) onUse(parsed.value);
          }}
          className={cn(appMiniButtonClass, focusOutlineClass)}
        >
          {s.useThisJson}
        </button>
      </div>
    </div>
  );
}

type Parsed = { ok: true; value: unknown } | { ok: false };

function parseJson(text: string): Parsed {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Whether the parsed text is of the input's shape, and the line that says so. */
function checkShape(
  field: ObjectRunField | ListRunField,
  parsed: Parsed,
  s: FieldStrings,
): { line: JsonStatusLine; usable: boolean } {
  if (!parsed.ok) return { line: { text: s.notValidJsonYet, tone: 'bad' }, usable: false };
  if (field.kind === 'list') {
    if (!Array.isArray(parsed.value)) {
      return { line: { text: s.validJsonNotList, tone: 'bad' }, usable: false };
    }
    return { line: { text: s.validJsonItems(parsed.value.length), tone: 'ok' }, usable: true };
  }
  const names = field.fields.map((child) => child.name);
  const record = isRecord(parsed.value) ? parsed.value : null;
  const matched = record
    ? names.filter((name) => Object.prototype.hasOwnProperty.call(record, name)).length
    : 0;
  return {
    line: { text: s.validJsonFields(matched, names.length), tone: record ? 'ok' : 'bad' },
    usable: record !== null,
  };
}

/** What the box opens on: the form's value, or an outline of the input's fields. */
function startingValue(field: ObjectRunField | ListRunField, value: unknown): unknown {
  if (field.kind === 'list') {
    return Array.isArray(value) && value.length > 0 ? value : [outline(field.item)];
  }
  return isRecord(value) && Object.keys(value).length > 0 ? value : outline(field);
}

/** An empty value of a field's shape, to write over: `""`, `0`, `false`, a structure's fields. */
function outline(field: RunField): unknown {
  switch (field.kind) {
    case 'object':
      return Object.fromEntries(field.fields.map((child) => [child.name, outline(child)]));
    case 'list':
      return [outline(field.item)];
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'document':
    case 'image':
      return null;
    default:
      return '';
  }
}
