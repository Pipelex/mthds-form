/**
 * The run gate generates no code, so it runs under a Content Security Policy
 * without `'unsafe-eval'`.
 *
 * A browser enforcing such a policy refuses `eval` and the `Function`
 * constructor. The gate used to validate through ajv, which compiles every
 * schema with `new Function(...)`, so under that policy every run was refused.
 * The closest a node test gets to that browser is to make both throw for the
 * duration of a gate call, which is what this file does: the gate must still
 * reach a real verdict - coercion, formats, references, recursion and a
 * malformed-schema refusal included.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { gateRunInputs, validateRunInputsSchema } from '..';
import type { PipeIOContract } from '..';
import { PLAIN_SINGLE, SINGLE_OUTPUT } from './contract-fixtures';

const realFunction = globalThis.Function;
const realEval = globalThis.eval;
// The constructors a strict policy also refuses, which code reaches without
// naming them: `(function () {}).constructor`, and the async and generator
// function constructors, which no global names at all.
const CONSTRUCTED = [
  realFunction.prototype,
  Object.getPrototypeOf(async function () {}),
  Object.getPrototypeOf(function* () {}),
  Object.getPrototypeOf(async function* () {}),
] as const;
const realConstructors = CONSTRUCTED.map((prototype) =>
  Object.getOwnPropertyDescriptor(prototype, 'constructor'),
);

function refused(): never {
  throw new EvalError('Refused to evaluate a string as JavaScript (no unsafe-eval)');
}

beforeEach(() => {
  // Both the call and the `new` form of `Function`, and `eval`, throw - what a
  // strict policy does to them.
  globalThis.Function = new Proxy(realFunction, {
    apply: refused,
    construct: refused,
  }) as FunctionConstructor;
  globalThis.eval = refused as typeof eval;
  for (const prototype of CONSTRUCTED) {
    Object.defineProperty(prototype, 'constructor', {
      value: refused,
      configurable: true,
      writable: true,
    });
  }
});

afterEach(() => {
  globalThis.Function = realFunction;
  globalThis.eval = realEval;
  CONSTRUCTED.forEach((prototype, i) => {
    Object.defineProperty(prototype, 'constructor', realConstructors[i]!);
  });
});

const QUOTE_SCHEMA = {
  $defs: {
    Line: {
      type: 'object',
      title: 'Line',
      properties: {
        label: { type: 'string' },
        quantity: { type: 'integer', minimum: 1 },
        next: { anyOf: [{ $ref: '#/$defs/Line' }, { type: 'null' }] },
      },
      required: ['label', 'quantity'],
    },
  },
  type: 'object',
  title: 'Quote',
  properties: {
    issued: { type: 'string', format: 'date' },
    contact: { type: 'string', format: 'email' },
    line: { $ref: '#/$defs/Line' },
  },
  required: ['issued', 'line'],
};

const CONTRACT: PipeIOContract = {
  inputs: { quote: { ...PLAIN_SINGLE, concept_ref: 'sales.Quote', json_schema: QUOTE_SCHEMA } },
  output: { ...SINGLE_OUTPUT, concept_ref: 'sales.Quote' },
};

describe('the run gate under a policy without unsafe-eval', () => {
  it('really cannot evaluate a string while the policy is in force', () => {
    expect(() => new Function('return 1')).toThrow(EvalError);
    expect(() => Function('return 1')).toThrow(EvalError);
    expect(() => globalThis.eval('1')).toThrow(EvalError);
    const viaPrototype = function () {}.constructor as FunctionConstructor;
    expect(() => viaPrototype('return 1')).toThrow(EvalError);
    const asyncConstructor = async function () {}.constructor as FunctionConstructor;
    expect(() => asyncConstructor('return 1')).toThrow(EvalError);
    const generatorConstructor = function* () {}.constructor as FunctionConstructor;
    expect(() => generatorConstructor('yield 1')).toThrow(EvalError);
  });

  it('accepts a valid run, coercing what pydantic would coerce', () => {
    const data = {
      quote: {
        issued: '2026-07-06',
        contact: 'buyer@example.com',
        line: {
          label: 'Chairs',
          quantity: '4',
          next: { label: 'Desk', quantity: '1', next: null },
        },
      },
    };
    const gate = gateRunInputs(CONTRACT, data);
    expect(gate.ok).toBe(true);
    if (gate.ok) {
      expect(gate.inputs['quote']).toEqual({
        concept: 'sales.Quote',
        content: {
          issued: '2026-07-06',
          contact: 'buyer@example.com',
          // The kernel's schema normalization reads `Line | None` as an optional
          // `Line`, so the explicit `null` is pruned as an absence before validation.
          line: { label: 'Chairs', quantity: 4, next: { label: 'Desk', quantity: 1 } },
        },
      });
    }
  });

  it('refuses an invalid run with every error, named', () => {
    const gate = gateRunInputs(CONTRACT, {
      quote: {
        issued: '2026-07-06T14:30:00+02:00',
        contact: 'nobody',
        line: { label: 'Chairs', quantity: '0', next: { quantity: 'many' } },
      },
    });
    expect(gate.ok).toBe(false);
    if (!gate.ok) {
      expect(gate.errors.map((e) => [e.property, e.message])).toEqual([
        ['.quote.issued', 'must match format "date"'],
        ['.quote.contact', 'must match format "email"'],
        ['.quote.line.quantity', 'must be >= 1'],
        ['.quote.line.next.label', "must have required property 'label'"],
        ['.quote.line.next.quantity', 'must be integer'],
      ]);
    }
  });

  it('refuses a malformed schema with one verdict-less error rather than throwing', () => {
    const errors = validateRunInputsSchema(
      {},
      { type: 'object', properties: { a: { $ref: '#/nowhere' } } },
    );
    expect(errors).toEqual([{ stack: "can't resolve reference #/nowhere from id #" }]);
  });
});

describe('a value nested past what the validator can walk', () => {
  it('is refused with one verdict-less error, never thrown', () => {
    const schema = {
      $defs: {
        Node: {
          type: 'object',
          properties: { children: { type: 'array', items: { $ref: '#/$defs/Node' } } },
        },
      },
      $ref: '#/$defs/Node',
    };
    let data: Record<string, unknown> = {};
    for (let depth = 0; depth < 20_000; depth++) data = { children: [data] };
    expect(validateRunInputsSchema(data, schema)).toEqual([
      { stack: 'the inputs are nested too deeply to validate' },
    ]);
  });

  it('is judged in full at any depth a form produces', () => {
    const schema = {
      $defs: {
        Node: {
          type: 'object',
          properties: {
            n: { type: 'integer' },
            children: { type: 'array', items: { $ref: '#/$defs/Node' } },
          },
        },
      },
      $ref: '#/$defs/Node',
    };
    let data: Record<string, unknown> = { n: '1' };
    for (let depth = 0; depth < 100; depth++) data = { n: '1', children: [data] };
    expect(validateRunInputsSchema(data, schema)).toEqual([]);
    expect(data['n']).toBe(1);
  });
});
