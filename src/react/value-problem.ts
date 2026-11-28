import type { RunField } from '../core';
import { formatFieldNumber } from '../core/number-format';
import type { LocatedProblem, ValueProblem } from '../core/value-checks';
import type { FieldStrings } from './field-strings';

/**
 * What a person reads about a value its contract facts refuse
 * (`valueProblem`): the limit it broke, written as the field writes a number,
 * in its unit, so "Must be at most €500.00" names the same amount the field
 * shows.
 */
export function problemMessage(field: RunField, problem: ValueProblem, s: FieldStrings): string {
  const limit = (value: number) =>
    field.kind === 'number' ? formatFieldNumber(field, value, s.numberLocale) : String(value);
  switch (problem.code) {
    case 'below_minimum':
      return s.problemBelowMinimum(limit(problem.limit));
    case 'above_maximum':
      return s.problemAboveMaximum(limit(problem.limit));
    case 'not_above':
      return s.problemNotAbove(limit(problem.limit));
    case 'not_below':
      return s.problemNotBelow(limit(problem.limit));
    case 'not_integer':
      return s.problemNotInteger;
    case 'too_short':
      return s.problemTooShort(problem.limit);
    case 'too_long':
      return s.problemTooLong(problem.limit);
    case 'pattern':
      return s.problemPattern;
    case 'format':
      return s.problemFormat(problem.format);
  }
}

/**
 * What a person reads about a value found below a field (`refusedValue`): the
 * problem itself on a leaf, and on a list the item's position first, "Item 2:
 * Must be at most 10.", with the member's label when the item is a structure.
 */
export function locatedProblemMessage(
  located: LocatedProblem,
  s: FieldStrings,
  label: (field: RunField) => string,
): string {
  const message = problemMessage(located.field, located.problem, s);
  const at = located.path.findIndex((step) => typeof step === 'number');
  if (at === -1) return message;
  const inner = located.path.length > at + 1 ? `${label(located.field)}: ${message}` : message;
  return s.problemInItem((located.path[at] as number) + 1, inner);
}
