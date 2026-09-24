/**
 * A result's number, as a person reads it: `2116.2` → `2,116.2`.
 *
 * A number arrives exactly as the run produced it, and printed as it arrived
 * an amount reads as a raw float. So under the `app` presentation it goes
 * through `Intl.NumberFormat`, with digit grouping and bounded decimals:
 *
 * - an integer only gains grouping (`1200` → `1,200`);
 * - a magnitude of 1 or more keeps at most two decimals (`2116.2` → `2,116.2`);
 * - a value below 1 keeps three significant digits, so `0.0042` does not read
 *   as `0` and `0.85` stays `0.85`.
 *
 * The locale is always stated by the caller, never the runtime's default: a
 * page rendered on a server in one locale and hydrated in a browser in another
 * would disagree on every number, which is a hydration mismatch. `studio` does
 * not come through here at all, because a builder's view has to match the
 * JSON the builder reads next.
 *
 * Only the rendering changes. The JSON view, the copy control and the download
 * keep the payload's number as it is.
 */
export function formatNumber(value: number, locale: string): string {
  // `Infinity` and `NaN` cannot arrive through JSON, and a formatter would
  // print them as `∞` and `NaN` anyway; printing what the value is keeps the
  // floor honest without inventing a rendering for a value no run produces.
  if (!Number.isFinite(value)) return String(value);
  const formats = formatsFor(locale);
  if (Number.isInteger(value)) return formats.integer.format(value);
  return Math.abs(value) >= 1 ? formats.decimal.format(value) : formats.fraction.format(value);
}

interface NumberFormats {
  integer: Intl.NumberFormat;
  decimal: Intl.NumberFormat;
  fraction: Intl.NumberFormat;
}

/**
 * One set of formatters per locale, built on first use and kept. Constructing
 * an `Intl.NumberFormat` resolves locale data and is far costlier than calling
 * one, and a long table formats a number in every row, so the construction
 * happens once per locale rather than once per render.
 */
const FORMATS = new Map<string, NumberFormats>();

function formatsFor(locale: string): NumberFormats {
  let formats = FORMATS.get(locale);
  if (formats === undefined) {
    formats = {
      integer: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
      decimal: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
      fraction: new Intl.NumberFormat(locale, { maximumSignificantDigits: 3 }),
    };
    FORMATS.set(locale, formats);
  }
  return formats;
}
