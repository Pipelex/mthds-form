'use client';

import { shownAsOptional } from '../core/readiness';
import { cn } from './utils';
import type { DateRunField } from '../core';
import { asCalendarDate, toDateInputValue, toStoredDateValue } from '../core/date-format';
import { FieldShell } from './field-shell';
import { useFieldPresentation } from './field-presentation';
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
 *
 * It stays the browser's own date input, which is what gives it the platform's
 * keyboard entry, its calendar and its accessibility for free, and only its
 * face is styled:
 *
 * - **An empty field reads as empty.** The browser paints the format's pattern
 *   (`mm/dd/yyyy`) in the text colour, where it reads as a date someone typed,
 *   so the face is muted until a whole date is entered (`data-empty`).
 * - **The calendar icon and the calendar follow the theme.** The icon is the
 *   browser's, drawn for the light scheme unless the element says otherwise,
 *   so on a dark page it was a dark glyph on a dark field. Under `.dark` the
 *   input declares the dark scheme, which turns both the icon and the calendar
 *   it opens.
 * - **The face is the page's own in an app**, and mono in a studio, beside the
 *   field's mono name.
 */
export function DateField({ field, value, onChange, id, error, disabled }: DateFieldProps) {
  const domId = useFieldDomId(id);
  const isApp = useFieldPresentation() === 'app';
  const shown = toDateInputValue(value);
  return (
    <FieldShell
      name={field.name}
      title={field.title}
      conceptRef={field.conceptRef}
      category="date"
      description={field.description}
      required={!shownAsOptional(field)}
      error={error}
      htmlFor={domId}
    >
      <input
        id={domId}
        type="date"
        value={shown}
        disabled={disabled}
        aria-invalid={!!error}
        // By whether it is a day, not by the text: the browser empties a value
        // that names none (`2026-02-30`), and paints the pattern over it.
        data-empty={asCalendarDate(shown) === null ? '' : undefined}
        onChange={(e) => onChange(toStoredDateValue(e.target.value, field.datetime))}
        className={cn(
          fieldControlClass,
          'h-11 px-3 tabular-nums data-empty:text-muted-foreground dark:scheme-dark',
          '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
          !isApp && 'font-mono',
        )}
      />
    </FieldShell>
  );
}
