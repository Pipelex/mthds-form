import { describe, expect, it } from 'vitest';
import type { NumberRunField } from '..';
import {
  canonicalNumberLocale,
  currencyAffix,
  formatFieldNumber,
  isCurrencyUnit,
  unitSymbol,
} from '..';
import { boundedRounding } from '../number-format';

const field = (facts: Partial<NumberRunField> = {}): NumberRunField => ({
  kind: 'number',
  name: 'n',
  required: true,
  integer: false,
  ...facts,
});

describe('formatFieldNumber', () => {
  it('rounds a float’s noise away and keeps a small value’s digits', () => {
    expect(formatFieldNumber(field(), 2116.2000000000003, 'en-GB')).toBe('2,116.2');
    expect(formatFieldNumber(field(), 0.9999, 'en-GB')).toBe('0.9999');
    expect(formatFieldNumber(field(), 999.999, 'en-GB')).toBe('999.999');
    expect(formatFieldNumber(field(), 1234.5678, 'en-GB')).toBe('1,234.57');
  });

  it('leaves a whole number with nothing saying it is an amount ungrouped', () => {
    expect(formatFieldNumber(field({ integer: true }), 2024, 'en-GB')).toBe('2024');
    expect(
      formatFieldNumber(field({ integer: true, hints: { intent: 'quantity' } }), 12345, 'en-GB'),
    ).toBe('12,345');
  });

  it('writes money in its currency, where the locale writes it', () => {
    expect(formatFieldNumber(field({ unit: 'EUR' }), 1840.5, 'en-GB')).toBe('€1,840.50');
    expect(formatFieldNumber(field({ unit: 'EUR' }), 1840.5, 'fr-FR')).toBe('1\u202f840,50\u00a0€');
    expect(formatFieldNumber(field({ unit: 'JPY' }), 1200, 'en-GB')).toBe('¥1,200');
  });

  it('writes a percentage with 100 as the whole', () => {
    expect(formatFieldNumber(field({ unit: 'percent' }), 12.5, 'en-GB')).toBe('12.5%');
  });

  // A no-break space between a number and its unit, so a line never breaks
  // between them.
  it('writes a unit of measure with its symbol', () => {
    expect(formatFieldNumber(field({ unit: 'm2' }), 40, 'en-GB')).toBe('40\u00a0m²');
    expect(formatFieldNumber(field({ unit: 'kg' }), 12.5, 'en-GB')).toBe('12.5\u00a0kg');
    expect(unitSymbol('ml')).toBe('mL');
    expect(unitSymbol('toString')).toBe('toString');
  });

  it('falls back to its locale rather than throwing', () => {
    expect(canonicalNumberLocale('en_US')).toBe('en-GB');
    expect(canonicalNumberLocale('')).toBe('en-GB');
    expect(formatFieldNumber(field({ unit: 'EUR' }), 1, 'not a locale')).toBe('€1.00');
  });

  it('writes a value that is not finite as it is', () => {
    expect(formatFieldNumber(field(), Number.POSITIVE_INFINITY, 'en-GB')).toBe('Infinity');
  });
});

describe('currencies', () => {
  it('knows a currency from three capitals Intl lists', () => {
    expect(isCurrencyUnit('EUR')).toBe(true);
    expect(isCurrencyUnit('eur')).toBe(false);
    expect(isCurrencyUnit('KWH')).toBe(false);
    expect(isCurrencyUnit(undefined)).toBe(false);
  });

  it('places the symbol where the locale writes it', () => {
    expect(currencyAffix('EUR', 'en-GB')).toEqual({ symbol: '€', position: 'before' });
    expect(currencyAffix('EUR', 'fr-FR')).toEqual({ symbol: '€', position: 'after' });
  });
});

describe('the bounded rounding', () => {
  it('never cuts the whole part of a large amount', () => {
    expect(formatFieldNumber(field(), 1234567.89, 'en-GB')).toBe('1,234,567.89');
  });

  it('makes the same choice by hand where the runtime ignores roundingPriority', () => {
    const write = (value: number) =>
      new Intl.NumberFormat('en-GB', boundedRounding(value, false)).format(value);
    expect(write(1234567.89)).toBe('1,234,567.89');
    expect(write(2116.2000000000003)).toBe('2,116.2');
    expect(write(999.999)).toBe('999.999');
    expect(write(0.000123456789)).toBe('0.000123457');
    expect(write(0)).toBe('0');
  });

  it('keeps a small percentage’s digits', () => {
    expect(formatFieldNumber(field({ unit: 'percent' }), 0.004, 'en-GB')).toBe('0.004%');
    expect(formatFieldNumber(field({ unit: 'percent' }), 12.5, 'en-GB')).toBe('12.5%');
    expect(formatFieldNumber(field({ unit: 'percent' }), 1234.567, 'en-GB')).toBe('1,234.57%');
  });
});
