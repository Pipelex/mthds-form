/**
 * The regression these pin: a blocked run said "Date: pick a valid date" while
 * the picker showed a perfectly good 06/07/2026. The stored value was
 * `2026-07-06T14:30:00+02:00` and `toDateInputValue` renders `.slice(0, 10)` of
 * it, so the field showed the day while the validator judged the timestamp.
 * Every line these tests assert names the value ACTUALLY in the data.
 */
import { describe, expect, it } from 'vitest';

import {
  describeValidationError,
  displayValue,
  valueAtProperty,
  type RunInputError,
  type Translate,
} from '..';

/**
 * Echoes key + params so a test asserts wording composition, not a locale file.
 * Cast because next-intl's translator carries the whole message tree in its
 * type; a stub cannot satisfy that structurally and does not need to.
 */
const t = ((key: string, values?: Record<string, string | number>): string =>
  values ? `${key}(${JSON.stringify(values)})` : key) as unknown as Translate;

function formatError(property: string, format: 'date' | 'date-time'): RunInputError {
  return {
    name: 'format',
    property,
    params: { format },
    stack: `'Date' must match format "${format}"`,
    message: `must match format "${format}"`,
  };
}

describe('valueAtProperty - reading the rejected value back out of the data', () => {
  const data = { quote_date: { date: '2026-07-06T14:30:00+02:00', time: '14:30:00+02:00' } };

  it('walks the dotted path RJSF builds from ajv instancePath', () => {
    expect(valueAtProperty(data, '.quote_date.date')).toBe('2026-07-06T14:30:00+02:00');
  });

  it('indexes into arrays (instancePath digits arrive as path segments)', () => {
    expect(valueAtProperty({ items: ['a', 'b'] }, '.items.1')).toBe('b');
  });

  it.each([
    ['no property at all', undefined],
    ['a path that does not exist', '.nope.nothing'],
    ['a path through a non-object', '.quote_date.date.deeper'],
  ])('returns undefined for %s', (_label, property) => {
    expect(valueAtProperty(data, property)).toBeUndefined();
  });
});

describe('displayValue - what is worth quoting in a toast', () => {
  it('passes a short string through untouched', () => {
    expect(displayValue('2026-07-06T14:30:00+02:00')).toBe('2026-07-06T14:30:00+02:00');
  });

  it('serializes a non-string so an object value is still visible', () => {
    expect(displayValue({ date: '2026-07-06' })).toBe('{"date":"2026-07-06"}');
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an empty string', ''],
    ['whitespace only', '   '],
  ])('returns null for %s - the message stands alone', (_label, value) => {
    expect(displayValue(value)).toBeNull();
  });

  it('elides a value too long for a toast (a base64 document, not a date)', () => {
    const shown = displayValue('x'.repeat(500));
    expect(shown).toHaveLength(121); // 120 + the ellipsis
    expect(shown?.endsWith('…')).toBe(true);
  });

  it('does not elide a real date - it is nowhere near the cap', () => {
    expect(displayValue('2026-07-06T14:30:00+02:00')).not.toContain('…');
  });
});

describe('describeValidationError - the error names what is in the data', () => {
  it('reports the timestamp AND the day it would have to become', () => {
    // The exact case from the bug: date carries 14:30, time already holds it.
    const data = { quote_date: { date: '2026-07-06T14:30:00+02:00', time: '14:30:00+02:00' } };
    const line = describeValidationError(formatError('.quote_date.date', 'date'), t, data);

    expect(line).toContain('inputPanel.dateCarriesTime');
    expect(line).toContain('2026-07-06T14:30:00+02:00'); // what we actually hold
    expect(line).toContain('2026-07-06'); // what it must become
    expect(line).toContain('Date'); // the field ajv quoted
  });

  it('quotes a plainly-malformed date rather than saying "pick a valid date"', () => {
    const data = { quote_date: { date: 'not-a-date' } };
    const line = describeValidationError(formatError('.quote_date.date', 'date'), t, data);

    expect(line).toContain('inputPanel.pickValidDate');
    expect(line).toContain('not-a-date');
    expect(line).not.toContain('dateCarriesTime');
  });

  it('falls back to the bare instruction when the field is genuinely empty', () => {
    const line = describeValidationError(formatError('.quote_date.date', 'date'), t, {
      quote_date: { date: '' },
    });

    expect(line).toContain('inputPanel.pickValidDateEmpty');
  });

  it('does not blame a date-time field for carrying a time - that is its job', () => {
    const data = { when: '2026-07-06T14:30:00+02:00' };
    const line = describeValidationError(formatError('.when', 'date-time'), t, data);

    expect(line).not.toContain('dateCarriesTime');
    expect(line).toContain('inputPanel.pickValidDate');
  });

  it('appends the offending value to a non-date complaint', () => {
    const error: RunInputError = {
      name: 'type',
      property: '.count',
      params: { type: 'number' },
      stack: "'count' must be number",
    };
    const line = describeValidationError(error, t, { count: 'twelve' });

    expect(line).toContain('inputPanel.invalidValueWithData');
    expect(line).toContain('twelve');
    expect(line).toContain("'count' must be number");
  });

  it('leaves a non-date complaint alone when there is no value to show', () => {
    const error: RunInputError = {
      name: 'required',
      property: '.count',
      params: { missingProperty: 'count' },
      stack: "must have required property 'count'",
    };

    expect(describeValidationError(error, t, {})).toBe("must have required property 'count'");
  });
});
