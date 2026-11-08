/**
 * A decimal written out: a sign, digits with or without a fraction, and an
 * exponent. `Number` reads more than that - "0x1A" as 26, "0b11" as 3 - and a
 * code that happens to look like one is no amount.
 */
const DECIMAL = /^[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/i;

/**
 * The amount a `ProportionBar` part draws, read as its renderer reads it and
 * as the fit check holds a part written out inline to, and the number a
 * `DataTable` number column writes: a number, or a text that writes one out
 * in decimal, as a payload's decimal may arrive. Nothing else is one - a
 * structure (on which `Number` throws when it carries its own `toString`
 * member), a list, a boolean, an empty text, a hexadecimal code - and reads
 * as `NaN`, which draws no share.
 */
export function shareAmount(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string' && DECIMAL.test(raw.trim())) return Number(raw);
  return Number.NaN;
}
