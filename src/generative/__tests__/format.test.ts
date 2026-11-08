import { describe, expect, it } from 'vitest';
import { formatAmount, formatDay, formatNumber } from '../format';

/**
 * The one way the generative layer writes a number, an amount and a day.
 * Every result component asks here, so a `DataTable`, a `Metric` and a
 * `ProportionBar` on one page share one locale.
 */
describe('the layout formatter', () => {
  it('keeps a currency’s own cents, so the parts of a share add up on screen', () => {
    expect(formatAmount(3.99, 'EUR')).toBe('€3.99');
    expect(formatAmount(1.49, 'EUR')).toBe('€1.49');
    expect(formatAmount(5.48, 'EUR')).toBe('€5.48');
  });

  it('writes a whole amount whole, and a currency with no minor unit without one', () => {
    expect(formatAmount(2400, 'EUR')).toBe('€2,400');
    expect(formatAmount(2400.5, 'EUR')).toBe('€2,400.50');
    expect(formatAmount(1200, 'JPY')).toBe('JP¥1,200');
    // Whole at the currency's own precision, not by `Number.isInteger`: a
    // payload's 2399.999 is written as the 2,400 beside it, and a sum of
    // 0.1 and 0.2 keeps its cents.
    expect(formatAmount(2399.999, 'EUR')).toBe('€2,400');
    expect(formatAmount(0.1 + 0.2, 'EUR')).toBe('€0.30');
    // Rounded as `Intl` rounds, which binary arithmetic would not.
    expect(formatAmount(1.005, 'EUR')).toBe('€1.01');
    expect(formatAmount(8.995, 'EUR')).toBe('€9');
  });

  it('writes every currency in the one locale, whichever component asks', () => {
    // en-GB names the dollar it means, as a `ProportionBar`, the one
    // component that formatted a currency before this formatter, always did.
    expect(formatAmount(5, 'USD')).toBe('US$5');
    expect(formatAmount(5, 'GBP')).toBe('£5');
  });

  it('writes a unit that is no currency after the grouped number, and none alone', () => {
    expect(formatAmount(12.5, 'km')).toBe('12.5 km');
    expect(formatAmount(1234.567, null)).toBe('1,234.57');
    // Three capitals that name no currency read as a unit, never as money.
    expect(formatAmount(12.5, 'KWH')).toBe('12.5 KWH');
    expect(formatAmount(60, 'MPH')).toBe('60 MPH');
  });

  it('writes a number in each style a Metric names', () => {
    expect(formatNumber(1234.5)).toBe('1,234.5');
    expect(formatNumber(1234.5, 'integer')).toBe('1,235');
    expect(formatNumber(3, 'decimal')).toBe('3.00');
    // The one locale's own abbreviations: a million is "m", a billion "bn".
    expect(formatNumber(1_250_000, 'compact')).toBe('1.3m');
    expect(formatNumber(2024, 'plain')).toBe('2024');
  });

  it('writes the day a value names, whatever time stands beside it', () => {
    // Whether ICU puts a comma after the weekday has changed between releases.
    expect(formatDay('2025-03-09')).toMatch(/^Sunday,? 9 March 2025$/);
    expect(formatDay('2025-03-09 00:30', 'short')).toBe('9 Mar 2025');
    expect(formatDay('2025-03-09T23:30:00-08:00', 'weekday')).toBe('Sun 9 March');
  });

  it('reads a native date by its day, in its envelope or not', () => {
    expect(formatDay({ date: '2025-03-09', time: '23:30' }, 'short')).toBe('9 Mar 2025');
    // As a run hands it over: its `date` member in the serializer's envelope.
    expect(
      formatDay(
        { date: { date: '1969-07-16', __class__: 'date', __module__: 'datetime' }, time: null },
        'short',
      ),
    ).toBe('16 Jul 1969');
  });

  it('names no day for a value that names none', () => {
    expect(formatDay('next Tuesday')).toBeUndefined();
    expect(formatDay(20250309)).toBeUndefined();
    expect(formatDay(null)).toBeUndefined();
    expect(formatDay('2025-13-45')).toBeUndefined();
    // A day the month does not have, which `Date` would roll into the next.
    expect(formatDay('2025-02-31')).toBeUndefined();
    expect(formatDay('2025-04-31', 'short')).toBeUndefined();
  });
});
