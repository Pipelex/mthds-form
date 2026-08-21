/**
 * Turning one ajv/RJSF validation error into a line a human can act on.
 *
 * ## Why this isn't just `error.stack`
 *
 * A blocked run used to say "Date: pick a valid date" while the date picker
 * showed a perfectly good 06/07/2026. Both were telling the truth about
 * different values: the stored value was `2026-07-06T14:30:00+02:00` (a real
 * time - correctly rejected for a `format: date` field), but
 * `toDateInputValue` renders `.slice(0, 10)` of it, so the FIELD showed the day
 * while the VALIDATOR judged the timestamp. The user cannot reconcile that from
 * the message, because the message named neither value.
 *
 * So: every line here quotes what is ACTUALLY in the data. An error the user
 * can see the input of is one they can fix; an instruction to "pick a valid
 * date" for a date that looks valid is not.
 *
 * Kept React-free (the caller passes its `t`) so the wording is unit-testable
 * without mounting the panel.
 */
import { dayWithinDateTime } from './date-format';
import type { RunInputError } from './gate-validator';

/**
 * A rejected value can be an entire base64 document, and this lands in a toast.
 * Past this many characters the tail is elided - a date never comes close, and
 * a megabyte of base64 in a toast helps nobody understand anything.
 */
const MAX_SHOWN_VALUE_CHARS = 120;

/** The message keys this module renders, relative to the caller's namespace
 *  (the app passes its `method.editor` translator). */
export type ValidationMessageKey =
  | 'inputPanel.aDateField'
  | 'inputPanel.pickValidDate'
  | 'inputPanel.pickValidDateEmpty'
  | 'inputPanel.dateCarriesTime'
  | 'inputPanel.invalidValue'
  | 'inputPanel.invalidValueWithData';

/**
 * The translate function the caller injects. Typed on the EXACT keys this
 * module uses - not a loose `(key: string) => string` - for two reasons: a
 * typo'd key still fails the build here, and next-intl's translator (whose
 * `key` parameter is the namespace's real key union, a SUPERSET of these)
 * remains assignable by parameter contravariance. Kernel-owned: this module
 * must not import next-intl's types.
 */
export type Translate = (key: ValidationMessageKey, values?: Record<string, string>) => string;

/**
 * The value the validator actually rejected, read back out of the submitted data.
 *
 * RJSF builds `property` from ajv's `instancePath` by swapping `/` for `.`
 * (`.quote_date.date`), so the segments index straight into the form data.
 * Array indices arrive as digit strings and index arrays natively.
 */
export function valueAtProperty(data: unknown, property: string | undefined): unknown {
  if (!property) return undefined;
  let current: unknown = data;
  for (const segment of property.split('.').filter(Boolean)) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * The rejected value rendered for a toast, or `null` when there is nothing
 * worth showing (an absent or blank value - "you left it empty" is what the
 * message says on its own, and `“”` adds noise).
 */
export function displayValue(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (text === undefined) return null;
  return text.length > MAX_SHOWN_VALUE_CHARS ? `${text.slice(0, MAX_SHOWN_VALUE_CHARS)}…` : text;
}

/** The field name ajv quoted in its stack, or a generic stand-in. */
function labelOf(error: RunInputError, t: Translate): string {
  return error.stack?.match(/'([^']+)'/)?.[1] ?? t('inputPanel.aDateField');
}

/**
 * One validation error as a human line naming the offending value.
 *
 * The date branch is special-cased because ajv's own complaint (`'Date' must
 * match format "date-time"`) is opaque, and because the carries-a-time case has
 * a specific fix the user cannot guess: move the time into the sibling `time`
 * field, which is exactly what the runtime's own error says.
 */
export function describeValidationError(
  error: RunInputError,
  t: Translate,
  formData: unknown,
): string {
  const format = (error.params as { format?: string } | undefined)?.format;
  const value = valueAtProperty(formData, error.property);
  const shown = displayValue(value);

  if (error.name === 'format' && (format === 'date' || format === 'date-time')) {
    const label = labelOf(error, t);
    if (shown === null) return t('inputPanel.pickValidDateEmpty', { label });
    // Only a `format: date` field rejects a real time; date-time takes it.
    const day = format === 'date' && typeof value === 'string' ? dayWithinDateTime(value) : null;
    if (day !== null) return t('inputPanel.dateCarriesTime', { label, value: shown, day });
    return t('inputPanel.pickValidDate', { label, value: shown });
  }

  const stack = error.stack ?? error.message ?? t('inputPanel.invalidValue');
  return shown === null ? stack : t('inputPanel.invalidValueWithData', { stack, value: shown });
}
