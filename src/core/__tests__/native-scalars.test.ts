/**
 * The native scalars and their content wrappers.
 *
 * `native.Number`, `native.YesNo` and `native.Text` render as bare controls but
 * travel inside the content model their concept declares - `NumberContent
 * {number}`, `YesNoContent {yes_no}`, `TextContent {text}`. The wrapper property
 * is derived from the contract in `buildRunFields` and carried on the descriptor
 * as `contentKey`, so the value bridge and the gate cannot disagree about it.
 *
 * They used to. `native.Number` was in the render taxonomy and absent from the
 * wrapper taxonomy: the form offered a number control, readiness was satisfied,
 * Run lit up, and the gate then rejected the payload with "'…' must be object"
 * against `NumberContent`. Every method taking a number was unrunnable through
 * the kernel, and no host could work around it. The end-to-end suite below is
 * that report, executed.
 */
import { describe, expect, it } from 'vitest';
import {
  apiInputsFromRunValues,
  buildRunFields,
  buildRunInputsSchema,
  prepareRunInputs,
  rjsfDataFromRunValues,
  runValuesFromStore,
  storeInputDataFromRunValues,
  validateRunInputs,
} from '..';
import type { PipeInputContract } from '..';

/** `NumberContent`, exactly as pydantic emits it (`number: int | float`). */
const NUMBER_CONTENT_SCHEMA = {
  title: 'NumberContent',
  description: 'A number',
  type: 'object',
  properties: {
    number: { anyOf: [{ type: 'integer' }, { type: 'number' }], title: 'Number' },
  },
  required: ['number'],
};

/** `YesNoContent` - a single strict boolean. */
const YES_NO_CONTENT_SCHEMA = {
  title: 'YesNoContent',
  type: 'object',
  properties: { yes_no: { type: 'boolean', title: 'Yes No' } },
  required: ['yes_no'],
};

const TEXT_CONTENT_SCHEMA = {
  title: 'TextContent',
  type: 'object',
  properties: { text: { type: 'string' } },
  required: ['text'],
};

describe('buildRunFields reads the wrapper property off the contract', () => {
  it('gives a native.Number field the `number` content key', () => {
    const [field] = buildRunFields({
      max_per_category: { concept_ref: 'native.Number', json_schema: NUMBER_CONTENT_SCHEMA },
    });
    expect(field).toMatchObject({ kind: 'number', contentKey: 'number', integer: false });
  });

  it('renders a native.YesNo input as a switch, not a nested card', () => {
    // `BOOLEAN_CONCEPTS` used to look for a concept named `Boolean`, which MTHDS
    // does not have - so `kind: 'boolean'` was unreachable from a real method
    // and a yes/no input arrived as an object card wrapping a lone switch.
    const [field] = buildRunFields({
      is_urgent: { concept_ref: 'native.YesNo', json_schema: YES_NO_CONTENT_SCHEMA },
    });
    expect(field).toMatchObject({ kind: 'boolean', contentKey: 'yes_no' });
  });

  it('gives a native.Text field the `text` content key, as it always wrapped', () => {
    const [field] = buildRunFields({
      brief: { concept_ref: 'native.Text', json_schema: TEXT_CONTENT_SCHEMA },
    });
    expect(field).toMatchObject({ contentKey: 'text' });
  });

  it('leaves a structured concept unwrapped - its value IS the whole content', () => {
    const [field] = buildRunFields({
      applicant: {
        concept_ref: 'demo.Applicant',
        json_schema: { type: 'object', properties: { name: { type: 'string' } } },
      },
    });
    expect(field!.contentKey).toBeUndefined();
    expect(field!.kind).toBe('object');
  });

  it('reads min/max off the WRAPPED property, where a constraint actually lives', () => {
    const [field] = buildRunFields({
      score: {
        concept_ref: 'native.Number',
        json_schema: {
          type: 'object',
          properties: { number: { type: 'number', minimum: 0, maximum: 10 } },
          required: ['number'],
        },
      },
    });
    expect(field).toMatchObject({ kind: 'number', min: 0, max: 10 });
  });
});

// ─── The reported failure, run end to end ───────────────────────────────────

describe('a filled `Number?` input passes the gate it used to fail', () => {
  const CONTRACT: Record<string, PipeInputContract> = {
    text: { concept_ref: 'native.Text', json_schema: TEXT_CONTENT_SCHEMA },
    max_per_category: {
      concept_ref: 'native.Number',
      json_schema: NUMBER_CONTENT_SCHEMA,
      optional: true,
    },
  };
  const FIELDS = buildRunFields(CONTRACT);
  const SCHEMA = buildRunInputsSchema(CONTRACT);

  const verdictFor = (values: Record<string, unknown>) =>
    validateRunInputs(
      prepareRunInputs(rjsfDataFromRunValues(values, FIELDS), SCHEMA),
      CONTRACT,
      SCHEMA,
    );

  it('wraps the number into the content envelope the contract declares', () => {
    expect(
      rjsfDataFromRunValues({ text: 'Apple in Cupertino.', max_per_category: 2 }, FIELDS),
    ).toEqual({ text: { text: 'Apple in Cupertino.' }, max_per_category: { number: 2 } });
  });

  it('validates - the verdict was "must be object (received “2”)"', () => {
    expect(verdictFor({ text: 'Apple in Cupertino.', max_per_category: 2 })).toMatchObject({
      isValid: true,
      missingInputs: [],
    });
  });

  it('accepts a float as readily as an integer', () => {
    expect(verdictFor({ text: 'hi', max_per_category: 2.5 }).isValid).toBe(true);
  });

  it('still validates when the optional number is left blank', () => {
    // Blank stays ABSENT rather than becoming `{}` - an empty wrapper would fail
    // `NumberContent`'s own `required: [number]` and block a run on an input the
    // user never opened.
    expect(verdictFor({ text: 'hi' }).isValid).toBe(true);
  });

  it('omits the blank optional number from the run payload', () => {
    const payload = apiInputsFromRunValues({ text: 'hi' }, FIELDS, CONTRACT);
    expect(payload).not.toHaveProperty('max_per_category');
  });

  it('sends the filled number in the { concept, content } envelope', () => {
    const payload = apiInputsFromRunValues({ text: 'hi', max_per_category: 2 }, FIELDS, CONTRACT);
    expect(payload['max_per_category']).toEqual({
      concept: 'native.Number',
      content: { number: 2 },
    });
  });

  it('reports a REQUIRED number left blank by variable name', () => {
    const REQUIRED: Record<string, PipeInputContract> = {
      max_per_category: { concept_ref: 'native.Number', json_schema: NUMBER_CONTENT_SCHEMA },
    };
    const fields = buildRunFields(REQUIRED);
    const schema = buildRunInputsSchema(REQUIRED);
    const verdict = validateRunInputs(
      prepareRunInputs(rjsfDataFromRunValues({}, fields), schema),
      REQUIRED,
      schema,
    );
    expect(verdict.isValid).toBe(false);
    expect(verdict.missingInputs).toEqual(['max_per_category']);
  });
});

// ─── Round trips ────────────────────────────────────────────────────────────

describe('store ↔ values round trip over the scalar wrappers', () => {
  const CONTRACT: Record<string, PipeInputContract> = {
    max_per_category: { concept_ref: 'native.Number', json_schema: NUMBER_CONTENT_SCHEMA },
    is_urgent: { concept_ref: 'native.YesNo', json_schema: YES_NO_CONTENT_SCHEMA },
  };
  const FIELDS = buildRunFields(CONTRACT);

  it('writes the wrapper into the store and reads the bare scalar back', () => {
    const stored = storeInputDataFromRunValues(
      { max_per_category: 2, is_urgent: false },
      FIELDS,
      CONTRACT,
    );
    expect(stored).toEqual({
      max_per_category: { concept: 'native.Number', content: { number: 2 } },
      is_urgent: { concept: 'native.YesNo', content: { yes_no: false } },
    });
    expect(runValuesFromStore(stored, FIELDS, CONTRACT)).toEqual({
      max_per_category: 2,
      is_urgent: false,
    });
  });

  it('keeps `false` - a no is an answer, not an empty field', () => {
    expect(rjsfDataFromRunValues({ is_urgent: false }, FIELDS)).toMatchObject({
      is_urgent: { yes_no: false },
    });
  });

  it('reads a legacy BARE number out of persisted inputData', () => {
    // What the store holds from before the wrapper existed, and what a
    // hand-written or agent-written inputs.json says.
    const values = runValuesFromStore({ max_per_category: 2 }, FIELDS, CONTRACT);
    expect(values['max_per_category']).toBe(2);
  });

  it('reads a numeric STRING rather than emptying the control', () => {
    const values = runValuesFromStore({ max_per_category: '2' }, FIELDS, CONTRACT);
    expect(values['max_per_category']).toBe(2);
  });

  it('empties the control for a value no number can be made of', () => {
    const values = runValuesFromStore({ max_per_category: { nonsense: true } }, FIELDS, CONTRACT);
    expect(values['max_per_category']).toBeUndefined();
  });

  it('refuses to coerce "yes" into a boolean - YesNoContent is strict', () => {
    const values = runValuesFromStore({ is_urgent: 'yes' }, FIELDS, CONTRACT);
    expect(values['is_urgent']).toBeUndefined();
  });
});

describe('a plural number input', () => {
  const CONTRACT: Record<string, PipeInputContract> = {
    scores: {
      concept_ref: 'native.Number',
      json_schema: { type: 'array', items: NUMBER_CONTENT_SCHEMA },
    },
  };
  const FIELDS = buildRunFields(CONTRACT);

  it('wraps every item, the same way a single value is wrapped', () => {
    expect(rjsfDataFromRunValues({ scores: [1, 2] }, FIELDS)).toEqual({
      scores: [{ number: 1 }, { number: 2 }],
    });
  });

  it('validates against the array contract', () => {
    const schema = buildRunInputsSchema(CONTRACT);
    const prepared = prepareRunInputs(rjsfDataFromRunValues({ scores: [1, 2] }, FIELDS), schema);
    expect(validateRunInputs(prepared, CONTRACT, schema).isValid).toBe(true);
  });
});
