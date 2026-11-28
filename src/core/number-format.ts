/**
 * How the result view writes a number: in its unit when the method states
 * one, and otherwise grouped and rounded so that a float reads as a number
 * rather than as `2116.2000000000003`.
 *
 * What the method says decides, never the value:
 *
 * - **A currency** (an ISO 4217 code `Intl` lists, such as `EUR`) reads as
 *   money in the currency's own fraction digits: `€4,120.00`.
 * - **`percent`** reads as a percentage, `100` being the whole: `12.5%`, with
 *   the same rounding as a unitless number, so `0.004` reads `0.004%`.
 * - **A unit of measure** reads with its symbol: `12.5 kg`, `40 m²`.
 * - **No unit**: up to two decimals, or six significant digits when that keeps
 *   more of a small value (`0.9999` stays `0.9999`, `999.999` stays itself
 *   rather than becoming `1,000`), and grouped only when the method says the
 *   number is an amount - a `unit` or an `intent` of `quantity` or `rating` -
 *   or the number is not whole. A whole number with neither keeps no grouping,
 *   because the descriptor cannot say whether it is a year or an identifier,
 *   and `2,024` is a wrong rendering of the year where `12345` is only a plain
 *   one of a count.
 *
 * The value itself is never changed: the JSON view and a download keep it as
 * the run returned it.
 *
 * A locale that `Intl` refuses (`en_US`, an empty string, a raw
 * `Accept-Language` header) falls back to `en-GB`, the generative layer's,
 * rather than throwing out of a render; the formatters are cached by locale
 * and options, in a cache that empties itself when it grows past a bound.
 *
 * Pure module: no React.
 */

import type { NumberRunField } from './descriptor';
import { intentOf } from './hints';

/** The locale a number is written in when the reader's cannot be used. */
export const FALLBACK_NUMBER_LOCALE = 'en-GB';

const CACHE_LIMIT = 128;
const formats = new Map<string, Intl.NumberFormat>();

/** The locale as `Intl` reads it, or the fallback. */
export function canonicalNumberLocale(locale: string | undefined): string {
  if (!locale) return FALLBACK_NUMBER_LOCALE;
  try {
    return Intl.getCanonicalLocales(locale)[0] ?? FALLBACK_NUMBER_LOCALE;
  } catch {
    return FALLBACK_NUMBER_LOCALE;
  }
}

function formatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = formats.get(key);
  if (!format) {
    try {
      format = new Intl.NumberFormat(locale, options);
    } catch {
      format = new Intl.NumberFormat(FALLBACK_NUMBER_LOCALE, options);
    }
    if (formats.size >= CACHE_LIMIT) formats.clear();
    formats.set(key, format);
  }
  return format;
}

/**
 * The currency codes `Intl` lists, where it can list them. A well-formed code
 * it does not know (`KWH`) makes no formatter throw, it is written as a symbol,
 * so a unit in capitals would read as money; the list is what says it is none.
 */
const KNOWN_CURRENCIES: ReadonlySet<string> | null = (() => {
  try {
    return typeof Intl.supportedValuesOf === 'function'
      ? new Set(Intl.supportedValuesOf('currency'))
      : null;
  } catch {
    return null;
  }
})();

/** Whether a unit names a currency: three capital letters, listed by `Intl` where it can list. */
export function isCurrencyUnit(unit: string | undefined): unit is string {
  if (unit === undefined || !/^[A-Z]{3}$/.test(unit)) return false;
  return KNOWN_CURRENCIES === null || KNOWN_CURRENCIES.has(unit);
}

/** The symbols the standard's units of measure are written with, where it differs from the identifier. */
const UNIT_SYMBOLS: Readonly<Record<string, string>> = {
  m2: 'm²',
  km2: 'km²',
  m3: 'm³',
  ml: 'mL',
  l: 'L',
  celsius: '°C',
  fahrenheit: '°F',
};

/** How a unit of measure is written beside a number: its symbol, or the identifier as authored. */
export function unitSymbol(unit: string): string {
  return Object.prototype.hasOwnProperty.call(UNIT_SYMBOLS, unit) ? UNIT_SYMBOLS[unit]! : unit;
}

/**
 * Whether this runtime's `Intl` reads `roundingPriority` (ES2023). One that
 * does not ignores the key and lets `maximumSignificantDigits` win over
 * `maximumFractionDigits`, which writes 1234567.89 as `1,234,570` - a
 * different amount, not a rounder one. So the support is detected, never
 * assumed, and without it the same choice is made by hand
 * (`boundedRounding`).
 */
const ROUNDING_PRIORITY_READ: boolean = (() => {
  try {
    const options = new Intl.NumberFormat('en', {
      maximumFractionDigits: 2,
      maximumSignificantDigits: 6,
      roundingPriority: 'morePrecision',
    } as Intl.NumberFormatOptions).resolvedOptions() as { roundingPriority?: string };
    return options.roundingPriority === 'morePrecision';
  } catch {
    return false;
  }
})();

/**
 * The rounding every unitless number, percentage and unit of measure shares:
 * up to two decimals, or six significant digits when that keeps more of a
 * small value, whichever keeps more precision - ES2023's
 * `roundingPriority: 'morePrecision'`. Where the runtime does not read that
 * key, the choice is made here from the value's magnitude: six significant
 * digits keep more decimals than two exactly when the value is below 1,000,
 * so the whole part of a larger amount is never cut. Exported for its test,
 * not from the entry.
 */
export function boundedRounding(
  value: number,
  roundingPriorityRead: boolean = ROUNDING_PRIORITY_READ,
): Intl.NumberFormatOptions {
  if (roundingPriorityRead) {
    return {
      maximumFractionDigits: 2,
      maximumSignificantDigits: 6,
      roundingPriority: 'morePrecision',
    } as Intl.NumberFormatOptions;
  }
  return Math.abs(value) < 1000 && value !== 0
    ? { maximumSignificantDigits: 6 }
    : { maximumFractionDigits: 2 };
}

/** Whether the method says a number is an amount, which is what earns it grouping. */
function readsAsAmount(field: Pick<NumberRunField, 'unit' | 'hints'>): boolean {
  if (field.unit !== undefined) return true;
  const intent = intentOf(field);
  return intent === 'quantity' || intent === 'rating';
}

/**
 * `value` written as the field's own cell or line shows it, in `locale`.
 * A non-finite number is written as `String` writes it.
 */
export function formatFieldNumber(
  field: Pick<NumberRunField, 'unit' | 'hints' | 'integer'>,
  value: number,
  locale: string | undefined,
): string {
  if (!Number.isFinite(value)) return String(value);
  const lang = canonicalNumberLocale(locale);
  const unit = field.unit;
  if (isCurrencyUnit(unit)) {
    return formatter(lang, {
      style: 'currency',
      currency: unit,
      currencyDisplay: 'narrowSymbol',
    }).format(value);
  }
  if (unit === 'percent') {
    // The rounding applies to the percentage as written, so a small share
    // keeps its digits (`0.004%`) rather than rounding to `0%`.
    return formatter(lang, { style: 'percent', ...boundedRounding(value) }).format(value / 100);
  }
  const grouped = readsAsAmount(field) || !Number.isInteger(value);
  const number = formatter(lang, { ...boundedRounding(value), useGrouping: grouped }).format(value);
  return unit === undefined ? number : `${number}\u00a0${unitSymbol(unit)}`;
}

/**
 * Where a currency's symbol sits around an amount in `locale`, and what it
 * reads: `$` before in English, `€` after in French. What an amount control
 * draws beside its input.
 */
export function currencyAffix(
  currency: string,
  locale: string | undefined,
): { symbol: string; position: 'before' | 'after' } {
  const parts = formatter(canonicalNumberLocale(locale), {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(1);
  const at = parts.findIndex((part) => part.type === 'currency');
  const first = parts.findIndex((part) => part.type === 'integer');
  return {
    symbol: at === -1 ? currency : parts[at]!.value,
    position: at !== -1 && first !== -1 && at > first ? 'after' : 'before',
  };
}
