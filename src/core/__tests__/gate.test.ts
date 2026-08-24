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
  buildRunFields,
  buildRunInputsSchema,
  computeReadiness,
  prepareRunInputs,
  rjsfDataFromRunValues,
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

// ─── Readiness and the gate must agree about an optional STRUCTURED input ────

/**
 * `ExtractionFocus {audience (required), notes (optional)}`, declared
 * `focus = "demo.ExtractionFocus?"` - an optional input whose concept has a
 * required child. The whole chain, exactly as a host runs it: descriptors →
 * form values → schema data → prepare → validate → payload.
 */
const FOCUS_INPUT: PipeInputContract = {
  concept_ref: 'demo.ExtractionFocus',
  optional: true,
  json_schema: {
    title: 'ExtractionFocus',
    type: 'object',
    properties: {
      audience: { title: 'Audience', type: 'string', enum: ['engineer', 'executive'] },
      notes: { title: 'Notes', anyOf: [{ type: 'string' }, { type: 'null' }], default: null },
    },
    required: ['audience'],
  },
};

describe('an optional structured input whose concept has a required child', () => {
  const INPUTS = { text: TEXT_INPUT, focus: FOCUS_INPUT };
  const FIELDS = buildRunFields(INPUTS);
  const SCHEMA = buildRunInputsSchema(INPUTS);

  /** What a host does between "Run pressed" and the payload. */
  const gate = (values: Record<string, unknown>) => {
    const prepared = prepareRunInputs(rjsfDataFromRunValues(values, FIELDS), SCHEMA);
    return { prepared, verdict: validateRunInputs(prepared, INPUTS, SCHEMA) };
  };

  it('is not materialized when untouched, so the run the button offered is the run the gate allows', () => {
    // The bug: the bridge invented `focus: { notes: "" }` for a section nobody
    // opened, ajv judged that shell against the concept's full schema, and the
    // run was rejected for a required child of an input the method said may be
    // omitted. Readiness (which correctly ignores an optional input) and the
    // gate disagreed, and no host could fix it from outside.
    const values = { text: 'Apple in Cupertino.' };

    expect(computeReadiness(FIELDS, values).missing).toEqual([]);
    expect(rjsfDataFromRunValues(values, FIELDS)['focus']).toBeUndefined();

    const { prepared, verdict } = gate(values);
    expect(prepared).not.toHaveProperty('focus');
    expect(verdict.isValid).toBe(true);
    expect(apiInputsFromSchemaData(prepared, INPUTS)).toEqual({
      text: { concept: 'native.Text', content: { text: 'Apple in Cupertino.' } },
    });
  });

  it('drops the same shell when an RJSF panel is what materialized it', () => {
    // The other run surface never goes through the value bridge: RJSF fills an
    // untouched object's children itself. The prune is the shared repair, so
    // both surfaces reach the validator with the input genuinely absent.
    const prepared = prepareRunInputs({ text: { text: 'hi' }, focus: { notes: '' } }, SCHEMA);

    expect(prepared).not.toHaveProperty('focus');
    expect(validateRunInputs(prepared, INPUTS, SCHEMA).isValid).toBe(true);
  });

  it('travels whole once the user fills it', () => {
    const { prepared, verdict } = gate({
      text: 'Apple in Cupertino.',
      focus: { audience: 'engineer' },
    });

    expect(verdict.isValid).toBe(true);
    expect(apiInputsFromSchemaData(prepared, INPUTS)['focus']).toEqual({
      concept: 'demo.ExtractionFocus',
      content: { audience: 'engineer' },
    });
  });

  it('still fails on the required child once the user HAS opened it', () => {
    // Dropping an untouched structure must not become "an optional structure
    // never has to be complete": a section the user put something in owes its
    // concept every field the concept demands.
    const { verdict } = gate({ text: 'Apple in Cupertino.', focus: { notes: 'skip the pricing' } });

    expect(verdict.isValid).toBe(false);
    // The scan names inputs the method DEMANDS; this one is optional, so the
    // caller falls back to the validator's own complaint rather than a dead end.
    expect(verdict.missingInputs).toEqual([]);
    expect(verdict.errors[0]?.property).toBe('.focus.audience');
  });

  it('reports a missing REQUIRED structured input by its variable name', () => {
    const REQUIRED_INPUTS = { text: TEXT_INPUT, focus: { ...FOCUS_INPUT, optional: false } };
    const requiredFields = buildRunFields(REQUIRED_INPUTS);
    const schema = buildRunInputsSchema(REQUIRED_INPUTS);
    const prepared = prepareRunInputs(
      rjsfDataFromRunValues({ text: 'Apple in Cupertino.' }, requiredFields),
      schema,
    );
    const verdict = validateRunInputs(prepared, REQUIRED_INPUTS, schema);

    expect(computeReadiness(requiredFields, { text: 'Apple in Cupertino.' }).missing).toEqual([
      'focus',
    ]);
    expect(verdict.isValid).toBe(false);
    expect(verdict.missingInputs).toEqual(['focus']);
  });

  it('names the PROPERTY in a required-child complaint, not the schema title', () => {
    // pydantic titles `audience` as `Audience`. Quoting the title (what RJSF
    // does, because there the title IS the label) sent the user hunting for a
    // field their bundle does not contain - this package labels a field by its
    // identifier.
    const { verdict } = gate({ text: 'Apple in Cupertino.', focus: { notes: 'skip the pricing' } });

    expect(verdict.errors[0]?.stack).toBe("must have required property 'audience'");
  });
});

// ─── An empty item in a LIST of structures must reach ajv as an object ───────

/**
 * `Finding {label, note}` - every child optional, so `{}` is a VALID item. The
 * list control seeds a freshly added object item with `{}`, and collapsing that
 * to an absence put `[undefined]` on the wire, which ajv rejects as
 * `must be object`: a run the form offered and its own gate then refused.
 */
const FINDINGS_INPUT: PipeInputContract = {
  concept_ref: 'demo.Finding[]',
  json_schema: {
    type: 'array',
    items: {
      type: 'object',
      title: 'Finding',
      properties: { label: { type: 'string' }, note: { type: 'string' } },
    },
  },
};

/** The same list, but the item concept DEMANDS a child. */
const RATED_INPUT: PipeInputContract = {
  concept_ref: 'demo.Rated[]',
  json_schema: {
    type: 'array',
    items: {
      type: 'object',
      title: 'Rated',
      properties: {
        audience: { type: 'string', title: 'Audience', enum: ['engineer', 'executive'] },
        note: { type: 'string' },
      },
      required: ['audience'],
    },
  },
};

describe('a freshly added empty item in a list of structures', () => {
  /** What a host does between "Run pressed" and the payload. */
  const gate = (values: Record<string, unknown>, inputs: Record<string, PipeInputContract>) => {
    const fields = buildRunFields(inputs);
    const schema = buildRunInputsSchema(inputs);
    const prepared = prepareRunInputs(rjsfDataFromRunValues(values, fields), schema);
    return { prepared, verdict: validateRunInputs(prepared, inputs, schema) };
  };

  it('is runnable when the item concept demands nothing', () => {
    const INPUTS = { text: TEXT_INPUT, findings: FINDINGS_INPUT };
    const { prepared, verdict } = gate({ text: 'Apple in Cupertino.', findings: [{}] }, INPUTS);

    // Every child pruned away, so the item is the empty object the schema
    // allows - not an absence, and not a type error.
    expect(prepared['findings']).toEqual([{}]);
    expect(verdict.isValid).toBe(true);
    // The empty row then deflates away on the wire, because `isFilled` finds
    // nothing in it - the same predicate that omits an unfilled optional input.
    // A plural slot's empty form IS the empty list, so this is a real value.
    expect(apiInputsFromSchemaData(prepared, INPUTS)['findings']).toEqual([]);
  });

  it('fails on the item concept’s required child, by NAME, not as a type error', () => {
    // Collapsing the item turned this into `'Rated' must be object` - which
    // names neither the field at fault nor anything the user can act on, and
    // threw away the identifier-quoting this gate does on purpose. The child is
    // an enum on purpose: a required plain STRING is filled with `''` by the
    // shell and `''` is a valid string, so only a child the shell leaves unset
    // reaches the `required` keyword at all.
    const { verdict } = gate(
      { text: 'Apple in Cupertino.', rated: [{}] },
      {
        text: TEXT_INPUT,
        rated: RATED_INPUT,
      },
    );

    expect(verdict.isValid).toBe(false);
    expect(verdict.errors[0]?.stack).toBe("must have required property 'audience'");
  });
});
