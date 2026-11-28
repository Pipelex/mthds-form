/**
 * What readiness checks of a value before the run (MTHDS `9.2.0` contract
 * facts: bounds, lengths, `pattern`, `format`), and the invariant it keeps
 * with the server gate: over a descriptor and a schema stating the same facts,
 * the Run button and the gate answer together.
 */
import { describe, expect, it } from 'vitest';
import type { InputFormTopLevelField } from 'mthds/protocol';
import type { NumberRunField, PipeInputContract, RunField, TextRunField } from '..';
import {
  buildRunFields,
  codePointLength,
  computeReadiness,
  gateRefusal,
  gateRunInputs,
  firstValueProblem,
  refusedValue,
  rjsfDataFromRunValues,
  valueProblem,
} from '..';
import { waitingFields } from '../readiness';
import { PLAIN_SINGLE, WIRE_PLAIN } from './contract-fixtures';

const number = (facts: Partial<NumberRunField> = {}): NumberRunField => ({
  kind: 'number',
  name: 'n',
  required: true,
  integer: false,
  ...facts,
});
const text = (facts: Partial<TextRunField> = {}): TextRunField => ({
  kind: 'text',
  name: 't',
  required: true,
  ...facts,
});

describe('valueProblem', () => {
  it('checks a number against its bounds, inclusive and exclusive', () => {
    const field = number({ min: 1, max: 5 });
    expect(valueProblem(field, 1)).toBeUndefined();
    expect(valueProblem(field, 5)).toBeUndefined();
    expect(valueProblem(field, 0)).toEqual({ code: 'below_minimum', limit: 1 });
    expect(valueProblem(field, 6)).toEqual({ code: 'above_maximum', limit: 5 });
    const open = number({ exclusiveMin: 0, exclusiveMax: 1 });
    expect(valueProblem(open, 0)).toEqual({ code: 'not_above', limit: 0 });
    expect(valueProblem(open, 1)).toEqual({ code: 'not_below', limit: 1 });
    expect(valueProblem(open, 0.5)).toBeUndefined();
  });

  it('refuses a fraction for a whole number before any bound', () => {
    expect(valueProblem(number({ integer: true, max: 1 }), 2.5)).toEqual({ code: 'not_integer' });
  });

  it('counts a text’s length in code points, as the gate does', () => {
    expect(codePointLength('😀😀')).toBe(2);
    const field = text({ maxLength: 2 });
    expect(valueProblem(field, '😀😀')).toBeUndefined();
    expect(valueProblem(field, 'abc')).toEqual({ code: 'too_long', limit: 2 });
    expect(valueProblem(text({ minLength: 3 }), 'ab')).toEqual({ code: 'too_short', limit: 3 });
  });

  it('checks a pattern with the unicode flag, and reads an invalid one as no check', () => {
    expect(valueProblem(text({ pattern: '^\\p{Lu}+$' }), 'ABC')).toBeUndefined();
    expect(valueProblem(text({ pattern: '^\\p{Lu}+$' }), 'abc')).toEqual({ code: 'pattern' });
    expect(valueProblem(text({ pattern: '(' }), 'anything')).toBeUndefined();
  });

  it('checks a format with the gate’s own table', () => {
    expect(valueProblem(text({ format: 'email' }), 'ada@example.org')).toBeUndefined();
    expect(valueProblem(text({ format: 'email' }), 'ada')).toEqual({
      code: 'format',
      format: 'email',
    });
    expect(valueProblem(text({ format: 'time' }), '14:30:00')).toBeUndefined();
    expect(valueProblem(text({ format: 'time' }), '14:30')).toEqual({
      code: 'format',
      format: 'time',
    });
    expect(valueProblem(text({ format: 'uuid' }), 'not-a-uuid')).toEqual({
      code: 'format',
      format: 'uuid',
    });
  });

  it('leaves an empty value to absence, and every other kind alone', () => {
    expect(valueProblem(text({ minLength: 3 }), '  ')).toBeUndefined();
    expect(valueProblem(number({ min: 1 }), undefined)).toBeUndefined();
    expect(valueProblem({ kind: 'boolean', name: 'b', required: true }, true)).toBeUndefined();
  });
});

describe('readiness reads the contract facts', () => {
  it('counts an invalid value as missing, and names it invalid', () => {
    const field = text({ format: 'email', gating: true });
    const fields: RunField[] = [field];
    expect(computeReadiness(fields, { t: 'ada' }).missing).toHaveLength(1);
    expect(computeReadiness(fields, { t: 'ada@example.org' }).missing).toHaveLength(0);
    expect(gateRefusal(field, 'ada', true)).toBe('invalid');
    expect(gateRefusal(field, undefined, true)).toBe('required');
    expect(gateRefusal(field, 'ada@example.org', true)).toBeUndefined();
  });

  it('refuses an invalid value even in an optional input', () => {
    const field = text({ maxLength: 3, required: false, gating: false });
    expect(computeReadiness([field], { t: 'abcd' }).missing).toHaveLength(1);
    expect(computeReadiness([field], {}).missing).toHaveLength(0);
  });
});

// ─── the invariant, over one descriptor and one schema stating the same facts ───

const numberContract = (bounds: Record<string, number>): PipeInputContract => ({
  ...PLAIN_SINGLE,
  concept_ref: 'native.Number',
  json_schema: {
    type: 'object',
    properties: { number: { type: 'number', ...bounds } },
    required: ['number'],
  },
});
const textContract = (facts: Record<string, unknown>): PipeInputContract => ({
  ...PLAIN_SINGLE,
  concept_ref: 'native.Text',
  json_schema: {
    type: 'object',
    properties: { text: { type: 'string', ...facts } },
    required: ['text'],
  },
});

interface Row {
  label: string;
  contract: PipeInputContract;
  wire: InputFormTopLevelField;
  value: unknown;
  runnable: boolean;
  /** Where the Run button answers otherwise: only ever looser than the gate, never stricter. */
  buttonLive?: boolean;
}

const NUMBER_WIRE = {
  ...WIRE_PLAIN,
  kind: 'number',
  name: 'x',
  concept_ref: 'native.Number',
  integer: false,
} as const;
const TEXT_WIRE = { ...WIRE_PLAIN, kind: 'prose', name: 'x', concept_ref: 'native.Text' } as const;

const ROWS: Row[] = [
  {
    label: 'a number inside its bounds',
    contract: numberContract({ minimum: 1, maximum: 5 }),
    wire: { ...NUMBER_WIRE, minimum: 1, maximum: 5 },
    value: 3,
    runnable: true,
  },
  {
    label: 'a number above its maximum',
    contract: numberContract({ minimum: 1, maximum: 5 }),
    wire: { ...NUMBER_WIRE, minimum: 1, maximum: 5 },
    value: 6,
    runnable: false,
  },
  {
    label: 'a number on its exclusive minimum',
    contract: numberContract({ exclusiveMinimum: 0 }),
    wire: { ...NUMBER_WIRE, exclusive_minimum: 0 },
    value: 0,
    runnable: false,
  },
  {
    label: 'a text over its length',
    contract: textContract({ maxLength: 4 }),
    wire: { ...TEXT_WIRE, max_length: 4 },
    value: 'hello',
    runnable: false,
  },
  {
    label: 'a text of four emoji under a cap of four',
    contract: textContract({ maxLength: 4 }),
    wire: { ...TEXT_WIRE, max_length: 4 },
    value: '😀😀😀😀',
    runnable: true,
  },
  {
    // A pattern is the method author's expression and readiness answers on
    // every keystroke, so it is judged at the attempt instead (`gateRefusal`),
    // as the gate judges it: the button is looser here, never stricter.
    label: 'a text breaking its pattern',
    contract: textContract({ pattern: '^[A-Z]{3}$' }),
    wire: { ...TEXT_WIRE, pattern: '^[A-Z]{3}$' },
    value: 'abc',
    runnable: false,
    buttonLive: true,
  },
  {
    label: 'a text matching its pattern',
    contract: textContract({ pattern: '^[A-Z]{3}$' }),
    wire: { ...TEXT_WIRE, pattern: '^[A-Z]{3}$' },
    value: 'ABC',
    runnable: true,
  },
  {
    label: 'a text that is not the email its format asks for',
    contract: textContract({ format: 'email' }),
    wire: { ...TEXT_WIRE, format: 'email' },
    value: 'ada',
    runnable: false,
  },
  {
    label: 'a time of day without its seconds',
    contract: textContract({ format: 'time' }),
    wire: { ...TEXT_WIRE, format: 'time' },
    value: '14:30',
    runnable: false,
  },
  {
    label: 'a time of day with its seconds',
    contract: textContract({ format: 'time' }),
    wire: { ...TEXT_WIRE, format: 'time' },
    value: '14:30:00',
    runnable: true,
  },
];

describe('the Run button and the server gate answer together on contract facts', () => {
  it.each(ROWS)('$label', ({ contract, wire, value, runnable, buttonLive: looser }) => {
    const inputs = { x: contract };
    const fields = buildRunFields({ fields: [wire] }, inputs);
    const values = { x: value };
    const buttonLive = computeReadiness(fields, values).missing.length === 0;
    const gate = gateRunInputs(
      {
        inputs,
        output: {
          concept_ref: 'native.Text',
          multiplicity: 'single',
          item_count: null,
          optional: false,
          json_schema: { type: 'object' },
        },
      },
      rjsfDataFromRunValues(values, fields),
    );
    expect(buttonLive).toBe(looser ?? runnable);
    expect(gate.ok).toBe(runnable);
    // The one direction that may never hold: the button holding a run the gate takes.
    if (gate.ok) expect(buttonLive).toBe(true);
    // Whatever the button says, a value the gate refuses is named at the attempt.
    if (!runnable && value !== undefined) {
      expect(gateRefusal(fields[0]!, value, true)).toBe('invalid');
    }
  });
});

describe('a method’s pattern', () => {
  // A pattern with catastrophic backtracking runs for seconds on a short value,
  // synchronously. Readiness answers on every keystroke, so it never runs one.
  const catastrophic = text({ pattern: '^(a+)+$' });
  const slow = 'a'.repeat(40) + 'b';

  it('is not run by readiness', () => {
    const started = Date.now();
    expect(computeReadiness([catastrophic], { t: slow }).missing).toEqual([]);
    expect(Date.now() - started).toBeLessThan(500);
  });

  it('is not run when a value is checked without patterns', () => {
    expect(valueProblem(catastrophic, slow, { patterns: false })).toBeUndefined();
  });

  it('is judged at the attempt, by gateRefusal', () => {
    const plain = text({ pattern: '^[A-Z]{3}$' });
    expect(computeReadiness([plain], { t: 'abc' }).missing).toEqual([]);
    expect(gateRefusal(plain, 'abc', true)).toBe('invalid');
    expect(gateRefusal(plain, 'ABC', true)).toBeUndefined();
  });
});

describe('a list holding a refused item', () => {
  const scores = {
    kind: 'list',
    name: 'scores',
    required: true,
    item: { kind: 'number', name: 'score', required: true, integer: true, min: 0, max: 10 },
  } as const satisfies RunField;

  it('is invalid, not required or incomplete', () => {
    expect(gateRefusal(scores, [3, 12], true)).toBe('invalid');
    expect(gateRefusal(scores, [3, 12], false)).toBe('invalid');
    expect(gateRefusal(scores, [3, 4], true)).toBeUndefined();
  });

  it('names the item and its problem', () => {
    expect(refusedValue(scores, [3, 12])).toEqual({
      field: scores.item,
      path: [1],
      problem: { code: 'above_maximum', limit: 10 },
    });
  });

  it('locates a member of a list of structures', () => {
    const rows = {
      kind: 'list',
      name: 'rows',
      required: true,
      item: {
        kind: 'object',
        name: 'row',
        required: true,
        fields: [{ kind: 'number', name: 'amount', required: true, integer: false, max: 5 }],
      },
    } as const satisfies RunField;
    expect(firstValueProblem(rows, [{ amount: 1 }, { amount: 9 }])?.path).toEqual([1, 'amount']);
  });
});

describe('what the run waits for', () => {
  it('says what is wrong with a filled value rather than asking for it', () => {
    const amount = number({ name: 'amount', max: 50 });
    const [waiting] = waitingFields([amount], { amount: 80 });
    expect(waiting?.problem?.problem).toEqual({ code: 'above_maximum', limit: 50 });
    const [empty] = waitingFields([amount], {});
    expect(empty?.problem).toBeUndefined();
  });
});
