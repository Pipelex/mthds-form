import { readDateContent } from '../core/native-content';

/**
 * How the generative layer writes a number, an amount and a day: one locale,
 * one formatter per setting, made once and kept.
 *
 * The result components used to build their formatters three ways in two
 * locales, so a `DataTable` cell and a `Metric` wrote USD as "$5" (en-US)
 * while a `ProportionBar` wrote it "US$5" (en-GB), and a share of money was
 * rounded to whole units: parts of 3.99 and 1.49 read "€4" and "€1" beside a
 * total of "€5". Every component now asks here.
 *
 * The locale is the one the layer's dates were already written in. A host's
 * own locale reaching a produced page is a separate question, the kernel's
 * result view's as much as this layer's.
 */
export const LAYOUT_LOCALE = 'en-GB';

/** How a number is written: `grouped` as a cell shows one, the others as a `Metric` names them. */
export type NumberStyle = 'grouped' | 'integer' | 'decimal' | 'compact' | 'plain';

const NUMBER_OPTIONS: Readonly<Record<NumberStyle, Intl.NumberFormatOptions>> = {
  // Grouped, with the places it has up to two, never padded.
  grouped: { maximumFractionDigits: 2 },
  integer: { maximumFractionDigits: 0 },
  decimal: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  compact: { notation: 'compact', maximumFractionDigits: 1 },
  // As written: every place, and no grouping, so a year or an id reads as itself.
  plain: { maximumFractionDigits: 20, useGrouping: false },
};

const numbers = new Map<NumberStyle, Intl.NumberFormat>();

/** `value` written in `style`. */
export function formatNumber(value: number, style: NumberStyle = 'grouped'): string {
  let format = numbers.get(style);
  if (!format) {
    format = new Intl.NumberFormat(LAYOUT_LOCALE, NUMBER_OPTIONS[style]);
    numbers.set(style, format);
  }
  return format.format(value);
}

/** A currency's two formatters: one for a whole amount, one with its own fraction digits. */
interface Money {
  readonly whole: Intl.NumberFormat;
  readonly fractional: Intl.NumberFormat;
}

/**
 * The currencies already asked for, each with its formatters, or `null` for a
 * code that names none. Bounded by what it can hold: three capital letters.
 */
const currencies = new Map<string, Money | null>();

/**
 * The currency codes `Intl` lists, where it can list them. A well-formed code
 * it does not know ("KWH", "MPH") does not make `Intl.NumberFormat` throw, it
 * writes the code as a symbol ("KWH 12.50"), so a unit in capitals would read
 * as money; the list is what says it is none. A runtime with no list falls
 * back to what `Intl` accepts.
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

function currencyFormat(code: string): Money | null {
  if (!currencies.has(code)) {
    if (KNOWN_CURRENCIES && !KNOWN_CURRENCIES.has(code)) {
      currencies.set(code, null);
      return null;
    }
    let money: Money | null;
    try {
      // The currency's own fraction digits (two for the euro, none for the
      // yen), with a whole amount written whole: €2,400 beside €3.99. Two
      // formatters rather than `trailingZeroDisplay`, which not every
      // browser a host supports knows.
      money = {
        whole: new Intl.NumberFormat(LAYOUT_LOCALE, {
          style: 'currency',
          currency: code,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }),
        fractional: new Intl.NumberFormat(LAYOUT_LOCALE, { style: 'currency', currency: code }),
      };
    } catch {
      money = null;
    }
    currencies.set(code, money);
  }
  return currencies.get(code)!;
}

/**
 * An amount in `unit`: money when the unit is a currency code `Intl` lists,
 * with that currency's own fraction digits; otherwise the number grouped,
 * with the unit after it ("12.5 km"), or alone with no unit.
 */
export function formatAmount(value: number, unit?: string | null): string {
  if (unit && /^[A-Z]{3}$/.test(unit)) {
    const money = currencyFormat(unit);
    if (money) return (Number.isInteger(value) ? money.whole : money.fractional).format(value);
  }
  const written = formatNumber(value);
  return unit ? `${written} ${unit}` : written;
}

/** How a day is written: in full, short, or its weekday with its day and month. */
export type DayStyle = 'long' | 'short' | 'weekday';

const DAY_OPTIONS: Readonly<Record<DayStyle, Intl.DateTimeFormatOptions>> = {
  long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
  short: { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' },
  weekday: { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' },
};

const days = new Map<DayStyle, Intl.DateTimeFormat>();

/**
 * The calendar day a value names, written in `style`, or `undefined` for a
 * value that names none. A day is read as the kernel's result view reads a
 * date (`readDateContent`): the day as text, or a native date's own
 * structure (`{ date, time }`, in the serializer's envelope or not). Only its
 * leading `YYYY-MM-DD` is read, anchored at noon UTC, so a time beside it
 * ("2025-03-09 00:30") never moves it across midnight in the reader's zone.
 */
export function formatDay(value: unknown, style: DayStyle = 'long'): string | undefined {
  const written = readDateContent(value)?.date;
  const day = written === undefined ? null : /^\d{4}-\d{2}-\d{2}/.exec(written);
  if (!day) return undefined;
  const date = new Date(`${day[0]}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  let format = days.get(style);
  if (!format) {
    format = new Intl.DateTimeFormat(LAYOUT_LOCALE, DAY_OPTIONS[style]);
    days.set(style, format);
  }
  return format.format(date);
}
