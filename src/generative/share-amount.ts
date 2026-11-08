/**
 * The amount a `ProportionBar` part draws, read as its renderer reads it and
 * as the fit check holds a part written out inline to: a number, or a text
 * that writes one out, as a payload's decimal may arrive. Nothing else is one
 * - a structure (on which `Number` throws when it carries its own `toString`
 * member), a list, a boolean, an empty text - and reads as `NaN`, which draws
 * no share.
 */
export function shareAmount(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string' && raw.trim() !== '') return Number(raw);
  return Number.NaN;
}
