/**
 * What is wrong with a value a field holds, by the field's contract facts.
 *
 * The run gate's validator enforces every constraint the contract's schema
 * states, and since MTHDS `9.2.0` the method states bounds, lengths, a pattern
 * and a format, which the engine projects into that schema and into the
 * descriptor alike. Readiness used to read none of them, so a number typed past
 * its maximum lit the Run button and the gate then refused the run with nothing
 * a person could act on (docs/run-gate.md, "What readiness checks"). This is the
 * same rule, read off the descriptor, so the browser half refuses what the
 * server half will.
 *
 * Each check judges exactly as the gate's validator does, never more strictly:
 * a length counts code points (ajv's `ucs2length`), a pattern compiles with the
 * `u` flag, a format is the gate's own table (`schema-formats`), and every check
 * passes a value of another type, as a JSON Schema keyword does - which is also
 * what keeps it harmless on the gate's own tree, where a scalar may still sit
 * in its content wrapper.
 *
 * Pure module: no React.
 */

import type { RunField } from './descriptor';
import { ownProp } from './own-property';
import { FORMATS } from './schema-formats';

/** One thing wrong with a value, with the limit it broke. */
export type ValueProblem =
  | { code: 'below_minimum'; limit: number }
  | { code: 'above_maximum'; limit: number }
  | { code: 'not_above'; limit: number }
  | { code: 'not_below'; limit: number }
  | { code: 'not_integer' }
  | { code: 'too_short'; limit: number }
  | { code: 'too_long'; limit: number }
  | { code: 'pattern' }
  | { code: 'format'; format: string };

/** A string's length in code points, a surrogate pair counting once, as the gate counts it. */
export function codePointLength(value: string): number {
  let length = 0;
  for (const _ of value) length += 1;
  return length;
}

/**
 * Which facts a check reads. `patterns: false` leaves a method's `pattern`
 * out: a pattern is the method author's regular expression, and one with
 * catastrophic backtracking (`^(a+)+$`) runs for seconds or minutes on a
 * short value, synchronously, with no way to interrupt it. Readiness answers
 * on every keystroke, so it never runs one (docs/run-gate.md, "A value that
 * breaks its contract facts"): a pattern is judged where the gate judges it,
 * when a run is attempted, and in the marks drawn after that.
 */
export interface ValueCheckOptions {
  patterns?: boolean;
}

/** Patterns compiled once each, with the gate's `u` flag. A pattern that does not compile reads as none. */
const patterns = new Map<string, RegExp | null>();
const PATTERN_CACHE_LIMIT = 256;

/**
 * The last answers each pattern gave, by value, so a re-render that asks
 * again about a value it has judged does not run the expression again.
 */
const verdicts = new Map<string, boolean>();
const VERDICT_CACHE_LIMIT = 512;

function compiled(source: string): RegExp | null {
  let pattern = patterns.get(source);
  if (pattern === undefined) {
    try {
      pattern = new RegExp(source, 'u');
    } catch {
      // The gate refuses such a schema as invalid; this half has nothing to
      // add, and must not throw out of a render.
      pattern = null;
    }
    if (patterns.size >= PATTERN_CACHE_LIMIT) patterns.clear();
    patterns.set(source, pattern);
  }
  return pattern;
}

function breaksPattern(source: string, value: string): boolean {
  const key = `${source}\u0000${value}`;
  const known = verdicts.get(key);
  if (known !== undefined) return known;
  const broken = compiled(source)?.test(value) === false;
  if (verdicts.size >= VERDICT_CACHE_LIMIT) verdicts.clear();
  verdicts.set(key, broken);
  return broken;
}

/**
 * The first problem with `value` for `field`, or `undefined` when there is
 * none. A leaf check only: a structure or a list is judged member by member by
 * `fieldFilled`, which asks this of each leaf it reaches, and an empty value is
 * absence, which `isFilled` answers, never a problem.
 */
export function valueProblem(
  field: RunField,
  value: unknown,
  options: ValueCheckOptions = {},
): ValueProblem | undefined {
  switch (field.kind) {
    case 'number': {
      if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
      if (field.integer && !Number.isInteger(value)) return { code: 'not_integer' };
      if (field.min !== undefined && value < field.min)
        return { code: 'below_minimum', limit: field.min };
      if (field.max !== undefined && value > field.max)
        return { code: 'above_maximum', limit: field.max };
      if (field.exclusiveMin !== undefined && value <= field.exclusiveMin)
        return { code: 'not_above', limit: field.exclusiveMin };
      if (field.exclusiveMax !== undefined && value >= field.exclusiveMax)
        return { code: 'not_below', limit: field.exclusiveMax };
      return undefined;
    }
    case 'text':
    case 'prose': {
      if (typeof value !== 'string' || value.trim() === '') return undefined;
      const length = codePointLength(value);
      if (field.minLength !== undefined && length < field.minLength)
        return { code: 'too_short', limit: field.minLength };
      if (field.maxLength !== undefined && length > field.maxLength)
        return { code: 'too_long', limit: field.maxLength };
      if (
        options.patterns !== false &&
        field.pattern !== undefined &&
        breaksPattern(field.pattern, value)
      )
        return { code: 'pattern' };
      if (field.format !== undefined) {
        const known = Object.prototype.hasOwnProperty.call(FORMATS, field.format)
          ? FORMATS[field.format]
          : undefined;
        if (known && known !== true && known.type === 'string') {
          const check = known.validate as (candidate: string) => boolean;
          if (!check(value)) return { code: 'format', format: field.format };
        }
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

/** A problem found below a field: the leaf that has it, where it sits, and what it is. */
export interface LocatedProblem {
  /** The leaf holding the value. */
  field: RunField;
  /** From the field asked about to the leaf: a member's name, a list item's index. The field itself is `[]`. */
  path: readonly (string | number)[];
  problem: ValueProblem;
}

/**
 * The first value its contract facts refuse anywhere in `value`, in the
 * order a form draws it: the leaf itself, a structure's members in declared
 * order, a list's items in order. What lets a list say which item is wrong
 * rather than that it is incomplete.
 */
export function firstValueProblem(
  field: RunField,
  value: unknown,
  options: ValueCheckOptions = {},
): LocatedProblem | undefined {
  if (field.kind === 'list') {
    if (!Array.isArray(value)) return undefined;
    for (const [index, item] of value.entries()) {
      const found = firstValueProblem(field.item, item, options);
      if (found) return { ...found, path: [index, ...found.path] };
    }
    return undefined;
  }
  if (field.kind === 'object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
    for (const member of field.fields) {
      const found = firstValueProblem(
        member,
        ownProp(value as Record<string, unknown>, member.name),
        options,
      );
      if (found) return { ...found, path: [member.name, ...found.path] };
    }
    return undefined;
  }
  const problem = valueProblem(field, value, options);
  return problem ? { field, path: [], problem } : undefined;
}
