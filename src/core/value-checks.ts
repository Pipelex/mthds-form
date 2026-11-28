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

/** Patterns compiled once each, with the gate's `u` flag. A pattern that does not compile reads as none. */
const patterns = new Map<string, RegExp | null>();
const PATTERN_CACHE_LIMIT = 256;

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

/**
 * The first problem with `value` for `field`, or `undefined` when there is
 * none. A leaf check only: a structure or a list is judged member by member by
 * `fieldFilled`, which asks this of each leaf it reaches, and an empty value is
 * absence, which `isFilled` answers, never a problem.
 */
export function valueProblem(field: RunField, value: unknown): ValueProblem | undefined {
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
      if (field.pattern !== undefined && compiled(field.pattern)?.test(value) === false)
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
