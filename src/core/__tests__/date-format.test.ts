/**
 * The acceptance cases here are not invented - each was MEASURED against
 * pydantic (the validator that actually runs once a value reaches the runner)
 * and this suite pins our client to that behaviour. Stock ajv is stricter than
 * the runtime, which meant we rejected valid inputs client-side and the run
 * never left the browser. If pydantic's coercion ever changes, these are the
 * tests that should fail first.
 */
import { describe, expect, it } from 'vitest';
import {
  asCalendarDate,
  dayWithinDateTime,
  isAcceptableDate,
  isAcceptableDateTime,
  toDateInputValue,
  toStoredDateValue,
} from '..';

describe('dayWithinDateTime - explaining a rejected value, never coercing it', () => {
  it('names the day inside a value carrying a REAL time', () => {
    // The bug: this is what a `format: date` field held while its picker
    // displayed 06/07/2026, so "pick a valid date" read as nonsense.
    expect(dayWithinDateTime('2026-07-06T14:30:00+02:00')).toBe('2026-07-06');
  });

  it('takes the day literally, never shifting it through a timezone', () => {
    // Matching asCalendarDate/pydantic: the offset does not move the day back.
    expect(dayWithinDateTime('2026-07-06T01:00:00+02:00')).toBe('2026-07-06');
  });

  it.each([
    ['a bare day - acceptable already, nothing to explain', '2026-07-06'],
    ['a midnight-padded day - asCalendarDate normalizes it', '2026-07-06T00:00:00Z'],
  ])('returns null for %s', (_label, value) => {
    expect(dayWithinDateTime(value)).toBeNull();
  });

  it.each([
    ['not a timestamp at all', 'not-a-date'],
    ['an impossible day with a real time', '2026-02-30T14:30:00Z'],
    ['empty', ''],
  ])('returns null for %s', (_label, value) => {
    expect(dayWithinDateTime(value)).toBeNull();
  });
});

describe('isAcceptableDate - a calendar date ALONE, matching DateContent', () => {
  // `DateContent._reject_lax_temporal` (pipelex) is a mode="before" validator
  // that deliberately closes pydantic's lax coercion: a datetime string on the
  // `date` field would drop its time and offset (DT3, "no silent midnight"), so
  // the runner raises rather than truncating. A lenient client here would only
  // forward the value and turn a clear field error into an opaque 500.
  //
  // The leniency lives in `asCalendarDate` + the heal path instead: normalize a
  // pasted timestamp to the day, THEN it passes this.
  it('accepts the canonical full-date', () => {
    expect(isAcceptableDate('2026-07-06')).toBe(true);
  });

  it.each([
    ['2026-07-06T00:00:00Z', 'midnight UTC - the runner rejects it, so we must too'],
    ['2026-07-06T00:00:00', 'midnight, no zone'],
    ['2026-07-06T00:00:00+02:00', 'midnight with an offset'],
    ['2026-07-06T15:40:00Z', 'a real time'],
    ['06/07/2026', 'ambiguous: 6 July or June 7 depends on the reader'],
    ['2026-02-30', 'well-formed but not a real day'],
    ['2026-13-01', 'month 13'],
    ['', 'empty'],
    ['tomorrow', 'not a date at all'],
  ])('rejects %s (%s)', (value) => {
    expect(isAcceptableDate(value)).toBe(false);
  });
});

describe('asCalendarDate', () => {
  it('takes the day LITERALLY from the string, never shifting through a zone', () => {
    // pydantic returns date(2026, 7, 6) here - NOT the 5th. Normalizing to UTC
    // first would silently move the day for any offset value.
    expect(asCalendarDate('2026-07-06T00:00:00+02:00')).toBe('2026-07-06');
    expect(asCalendarDate('2026-07-06T00:00:00-08:00')).toBe('2026-07-06');
  });

  it('normalizes a midnight timestamp to the bare day', () => {
    expect(asCalendarDate('2026-07-06T00:00:00Z')).toBe('2026-07-06');
  });

  it('returns null for a value that denotes no single day', () => {
    expect(asCalendarDate('2026-07-06T15:40:00Z')).toBeNull();
    expect(asCalendarDate('06/07/2026')).toBeNull();
  });
});

describe('isAcceptableDateTime - mirrors pydantic `datetime.datetime`', () => {
  it.each([
    ['2026-07-06', 'a bare day is midnight'],
    ['2026-07-06T00:00:00Z', 'canonical'],
    ['2026-07-06T15:40:00Z', 'a real time'],
    ['2026-07-06T15:40:00+02:00', 'with an offset'],
    ['2026-07-06T15:40', 'seconds are optional'],
    ['2026-07-06T15:40:00.123Z', 'fractional seconds'],
  ])('accepts %s (%s)', (value) => {
    expect(isAcceptableDateTime(value)).toBe(true);
  });

  it.each([
    ['2026-07-06T25:00:00Z', 'hour 25'],
    ['2026-07-06T15:61:00Z', 'minute 61'],
    ['2026-02-30T10:00:00Z', 'not a real day'],
    ['06/07/2026', 'ambiguous'],
  ])('rejects %s (%s)', (value) => {
    expect(isAcceptableDateTime(value)).toBe(false);
  });
});

describe('toDateInputValue', () => {
  it('shows the day for every value the runtime would accept', () => {
    expect(toDateInputValue('2026-07-06')).toBe('2026-07-06');
    expect(toDateInputValue('2026-07-06T00:00:00Z')).toBe('2026-07-06');
    expect(toDateInputValue('2026-07-06T00:00:00+02:00')).toBe('2026-07-06');
  });

  it('renders undefined/missing as an empty input', () => {
    expect(toDateInputValue(undefined)).toBe('');
  });
});

describe('toStoredDateValue', () => {
  it('stores the shape the field’s schema declares', () => {
    // An MTHDS `type = "date"` compiles to `format: date-time`…
    expect(toStoredDateValue('2026-07-06', true)).toBe('2026-07-06T00:00:00Z');
    // …while native.Date's own `date` field is `format: date`.
    expect(toStoredDateValue('2026-07-06', false)).toBe('2026-07-06');
  });

  it('clears the value when the day is empty', () => {
    expect(toStoredDateValue('', true)).toBeUndefined();
    expect(toStoredDateValue('', false)).toBeUndefined();
  });

  it('round-trips through toDateInputValue for both field shapes', () => {
    for (const datetime of [true, false]) {
      expect(toDateInputValue(toStoredDateValue('2026-07-06', datetime))).toBe('2026-07-06');
    }
  });

  // Whatever we store must pass the validator we ship - otherwise the widget
  // writes values its own form then rejects.
  it('stores values our validator accepts', () => {
    expect(isAcceptableDateTime(toStoredDateValue('2026-07-06', true)!)).toBe(true);
    expect(isAcceptableDate(toStoredDateValue('2026-07-06', false)!)).toBe(true);
  });

  it('normalizing a pasted timestamp yields a value the validator accepts', () => {
    // The accept-and-FIX path: asCalendarDate turns the padding into a day,
    // and only then does the strict check pass.
    expect(isAcceptableDate(asCalendarDate('2026-07-06T00:00:00Z')!)).toBe(true);
  });
});
