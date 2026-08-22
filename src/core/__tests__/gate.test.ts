/**
 * The shared run gate - the chain BOTH run surfaces put a run through.
 *
 * A schema-driven inputs panel (RJSF) and a standalone run page (a bespoke
 * field renderer) differ only in how they DISPLAY inputs. Everything between
 * "Run pressed" and "payload on the wire" is this module, so these tests are the
 * contract for both.
 */
import { describe, expect, it } from 'vitest';
import {
  apiInputsFromSchemaData,
  buildRunInputsSchema,
  prepareRunInputs,
  validateRunInputs,
} from '..';
import type { PipeInputContract } from '..';

const TEXT_INPUT: PipeInputContract = {
  concept_ref: 'native.Text',
  json_schema: {
    title: 'TextContent',
    type: 'object',
    properties: { text: { type: 'string' } },
    required: ['text'],
  },
};

/** `DateContent`: `date` required, `time` optional AND format-constrained - the
 *  shape that made an untouched optional field block a run. */
const DATE_INPUT: PipeInputContract = {
  concept_ref: 'native.Date',
  json_schema: {
    title: 'DateContent',
    type: 'object',
    properties: {
      date: { type: 'string', format: 'date' },
      time: { anyOf: [{ type: 'string', format: 'time' }, { type: 'null' }] },
    },
    required: ['date'],
  },
};

const OPTIONAL_INPUT: PipeInputContract = { ...TEXT_INPUT, optional: true };
const PLURAL_INPUT: PipeInputContract = {
  concept_ref: 'native.Image[]',
  json_schema: {
    type: 'array',
    items: { type: 'object', properties: { url: { type: 'string' } } },
  },
};

describe('buildRunInputsSchema', () => {
  it('requires only the inputs the method actually demands', () => {
    const schema = buildRunInputsSchema({
      quote: TEXT_INPUT,
      comments: OPTIONAL_INPUT,
      illustrations: PLURAL_INPUT,
    });
    // Optional (`?`) and plural (`[]`) never block - same rule as every other gate.
    expect(schema.required).toEqual(['quote']);
  });
});

describe('prepareRunInputs', () => {
  it('drops an empty optional constrained field instead of failing on it', () => {
    const inputs = { quote_date: DATE_INPUT };
    const schema = buildRunInputsSchema(inputs);
    // `time: ''` is what a form leaves behind on a field nobody opened. It is not
    // a valid `time`, so without pruning the run is blocked on it - or worse,
    // ships it and fails at the runner.
    const prepared = prepareRunInputs({ quote_date: { date: '2026-07-06', time: '' } }, schema);

    expect(prepared.quote_date).toEqual({ date: '2026-07-06' });
    expect(validateRunInputs(prepared, inputs, schema).isValid).toBe(true);
  });

  it('keeps an empty REQUIRED field, so it still fails loudly', () => {
    const inputs = { quote_date: DATE_INPUT };
    const schema = buildRunInputsSchema(inputs);
    const prepared = prepareRunInputs({ quote_date: { date: '', time: '' } }, schema);

    expect(prepared.quote_date).toHaveProperty('date');
    const verdict = validateRunInputs(prepared, inputs, schema);
    expect(verdict.isValid).toBe(false);
    expect(verdict.missingInputs).toEqual(['quote_date']);
  });
});

describe('validateRunInputs', () => {
  it('names the VARIABLE at fault, not its concept', () => {
    // Two inputs sharing one concept: naming the concept would identify neither.
    const inputs = { intro: TEXT_INPUT, outro: TEXT_INPUT };
    const schema = buildRunInputsSchema(inputs);
    const verdict = validateRunInputs({ intro: { text: 'ok' }, outro: {} }, inputs, schema);

    expect(verdict.isValid).toBe(false);
    expect(verdict.missingInputs).toEqual(['outro']);
  });

  it('catches a constraint the readiness count cannot see', () => {
    // Non-empty, so "is this input filled?" says yes - only the schema knows it
    // is too short. This is the class of failure that used to reach the runner.
    const inputs = {
      quote: {
        concept_ref: 'native.Text',
        json_schema: {
          type: 'object',
          properties: { text: { type: 'string', minLength: 20 } },
          required: ['text'],
        },
      } as PipeInputContract,
    };
    const schema = buildRunInputsSchema(inputs);
    const verdict = validateRunInputs({ quote: { text: 'too short' } }, inputs, schema);

    expect(verdict.isValid).toBe(false);
    // The scan can't call this "missing" - the field IS there - so the caller
    // falls back to the validator's own complaint rather than a dead end.
    expect(verdict.missingInputs).toEqual([]);
    expect(verdict.errors.length).toBeGreaterThan(0);
  });

  it('passes a complete form', () => {
    const inputs = { quote: TEXT_INPUT };
    const schema = buildRunInputsSchema(inputs);
    expect(validateRunInputs({ quote: { text: 'hello' } }, inputs, schema)).toEqual({
      isValid: true,
      missingInputs: [],
      errors: [],
    });
  });
});

describe('apiInputsFromSchemaData', () => {
  it('omits a blank optional input, so the runtime sees a real absence', () => {
    const out = apiInputsFromSchemaData(
      { quote: { text: 'hi' }, comments: { text: '' } },
      { quote: TEXT_INPUT, comments: OPTIONAL_INPUT },
    );
    expect(out).toEqual({ quote: { concept: 'native.Text', content: { text: 'hi' } } });
  });

  it('sends an empty plural input as a BARE `[]`, keeping its key', () => {
    const out = apiInputsFromSchemaData({ illustrations: [] }, { illustrations: PLURAL_INPUT });
    // Bare, not `{concept, content}`: the envelope routes to the bottom-up
    // factory, which cannot type a list from an empty one.
    expect(out).toEqual({ illustrations: [] });
  });

  it('builds the payload from PREPARED data, so pruning reaches the wire', () => {
    const inputs = { quote_date: DATE_INPUT };
    const schema = buildRunInputsSchema(inputs);
    const prepared = prepareRunInputs({ quote_date: { date: '2026-07-06', time: '' } }, schema);

    expect(apiInputsFromSchemaData(prepared, inputs)).toEqual({
      quote_date: { concept: 'native.Date', content: { date: '2026-07-06' } },
    });
  });
});
