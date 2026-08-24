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
  gateRunInputs,
  prepareRunInputs,
  rjsfDataFromRunValues,
  validateRunInputs,
} from '..';
import type { PipeInputContract, PipeOutputContract } from '..';
import { OPTIONAL_SINGLE, PLAIN_SINGLE, PLAIN_VARIABLE, plainFixed } from './contract-fixtures';

const TEXT_INPUT: PipeInputContract = {
  ...PLAIN_SINGLE,
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
  ...PLAIN_SINGLE,
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

/** Every contract needs one; nothing in the gate reads it. */
const TEXT_OUTPUT: PipeOutputContract = {
  concept_ref: 'native.Text',
  multiplicity: 'single',
  item_count: null,
  optional: false,
};

const OPTIONAL_INPUT: PipeInputContract = { ...TEXT_INPUT, ...OPTIONAL_SINGLE };
const PLURAL_INPUT: PipeInputContract = {
  ...PLAIN_VARIABLE,
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
        ...PLAIN_SINGLE,
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
  ...OPTIONAL_SINGLE,
  concept_ref: 'demo.ExtractionFocus',
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
    const REQUIRED_INPUTS = { text: TEXT_INPUT, focus: { ...FOCUS_INPUT, ...PLAIN_SINGLE } };
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
// ─── A REQUIRED structured input whose concept demands no child ──────────────

/**
 * `RunOptions {tone, notes}` - every child optional - declared
 * `opts = "demo.RunOptions"`, with no `?`. The surviving edge of the family
 * above: readiness used to be *vacuously* satisfied here (every child passed
 * `!f.required` over a value that was not there), the bridge omitted the
 * untouched structure like any other, and the combined schema's `required`
 * list then refused the run the button had just offered.
 *
 * One table, all three halves per row, because the point of the fix is that
 * they answer together.
 */
const OPTS_INPUT: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'demo.RunOptions',
  json_schema: {
    title: 'RunOptions',
    type: 'object',
    properties: {
      tone: { title: 'Tone', type: 'string', enum: ['formal', 'casual'] },
      notes: { title: 'Notes', anyOf: [{ type: 'string' }, { type: 'null' }], default: null },
    },
  },
};

describe('a required structured input whose concept demands no child', () => {
  const INPUTS = { text: TEXT_INPUT, opts: OPTS_INPUT };
  const FIELDS = buildRunFields(INPUTS);
  const SCHEMA = buildRunInputsSchema(INPUTS);

  /** What a host does between "Run pressed" and the payload. */
  const gate = (values: Record<string, unknown>) => {
    const prepared = prepareRunInputs(rjsfDataFromRunValues(values, FIELDS), SCHEMA);
    return { prepared, verdict: validateRunInputs(prepared, INPUTS, SCHEMA) };
  };

  const TEXT = 'Apple in Cupertino.';

  it('is demanded by the schema like any other singular input', () => {
    expect(SCHEMA['required']).toEqual(['text', 'opts']);
  });

  it('reads MISSING while untouched, and the gate refuses it by name', () => {
    // The bug: `every(f => !f.required)` was true over an absent value, so the
    // button lit up and the gate then rejected `must have required property
    // "opts"` - the two halves disagreeing about whether the input is there.
    const values = { text: TEXT };

    expect(computeReadiness(FIELDS, values).missing).toEqual(['opts']);
    expect(rjsfDataFromRunValues(values, FIELDS)['opts']).toBeUndefined();

    const { prepared, verdict } = gate(values);
    expect(prepared['opts']).toBeUndefined();
    expect(verdict.isValid).toBe(false);
    // Named, not just refused: the scan used to skip an input whose concept
    // lists no required child, leaving the caller with ajv's own wording.
    expect(verdict.missingInputs).toEqual(['opts']);
  });

  it('still reads missing when the section was opened but left blank', () => {
    // Opening the disclosure is view state the value never sees, and an empty
    // shell is what the bridge collapses - so `{}` has to answer like an
    // absence on BOTH halves, or the disagreement just moves.
    const values = { text: TEXT, opts: {} };

    expect(computeReadiness(FIELDS, values).missing).toEqual(['opts']);
    expect(rjsfDataFromRunValues(values, FIELDS)['opts']).toBeUndefined();
    expect(gate(values).verdict.missingInputs).toEqual(['opts']);
  });

  it('reads missing when every child is there but blank', () => {
    // `isFilled` is the emptiness rule throughout: a child holding `''` is not
    // a touch, on either side of the gate.
    const values = { text: TEXT, opts: { tone: '', notes: '' } };

    expect(computeReadiness(FIELDS, values).missing).toEqual(['opts']);
    expect(gate(values).verdict.isValid).toBe(false);
  });

  it('runs the moment one child holds a value, and travels whole', () => {
    const values = { text: TEXT, opts: { notes: 'skip the pricing' } };

    expect(computeReadiness(FIELDS, values).missing).toEqual([]);

    const { prepared, verdict } = gate(values);
    expect(verdict.isValid).toBe(true);
    expect(apiInputsFromSchemaData(prepared, INPUTS)['opts']).toEqual({
      concept: 'demo.RunOptions',
      content: { notes: 'skip the pricing' },
    });
  });

  it('leaves the OPTIONAL twin alone - it never gated and still does not', () => {
    // The fix is about a slot the method DEMANDS. An optional structure with no
    // required child stays omittable, and an untouched one is still a run.
    const optionalInputs = { text: TEXT_INPUT, opts: { ...OPTS_INPUT, ...OPTIONAL_SINGLE } };
    const optionalFields = buildRunFields(optionalInputs);
    const optionalSchema = buildRunInputsSchema(optionalInputs);
    const prepared = prepareRunInputs(
      rjsfDataFromRunValues({ text: TEXT }, optionalFields),
      optionalSchema,
    );

    expect(computeReadiness(optionalFields, { text: TEXT }).missing).toEqual([]);
    expect(validateRunInputs(prepared, optionalInputs, optionalSchema).isValid).toBe(true);
    expect(apiInputsFromSchemaData(prepared, optionalInputs)).not.toHaveProperty('opts');
  });

  it('gates a NESTED required struct that demands no child the same way', () => {
    // The vacuous answer was recursive: `fieldFilled` descends into required
    // children, so a required all-optional struct nested inside another one
    // read satisfied too, while the parent's own `required` list refused it.
    const nestedInputs = {
      wrapper: {
        ...PLAIN_SINGLE,
        concept_ref: 'demo.Wrapper',
        json_schema: {
          title: 'Wrapper',
          type: 'object',
          properties: {
            label: { title: 'Label', type: 'string' },
            opts: OPTS_INPUT.json_schema,
          },
          required: ['label', 'opts'],
        },
      } as PipeInputContract,
    };
    const nestedFields = buildRunFields(nestedInputs);
    const nestedSchema = buildRunInputsSchema(nestedInputs);
    const values = { wrapper: { label: 'run 4' } };

    expect(computeReadiness(nestedFields, values).missing).toEqual(['wrapper']);

    const prepared = prepareRunInputs(rjsfDataFromRunValues(values, nestedFields), nestedSchema);
    expect(validateRunInputs(prepared, nestedInputs, nestedSchema).isValid).toBe(false);
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
  ...PLAIN_VARIABLE,
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
  ...PLAIN_VARIABLE,
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

// ─── A fixed-count list (`Concept[N]`) is the one plural that gates ──────────

/**
 * `Image[3]`: pipelex states the count twice, and the two halves of the gate
 * read one each - `item_count` on the contract tells `inputMustBeFilled` the
 * empty form is ruled out, `minItems`/`maxItems` on the array wrapper tell ajv
 * how many. A variable `[]` list carries neither.
 */
const FIXED_INPUT: PipeInputContract = {
  ...plainFixed(3),
  concept_ref: 'native.Image',
  json_schema: {
    type: 'array',
    items: { type: 'object', properties: { url: { type: 'string' } } },
    minItems: 3,
    maxItems: 3,
  },
};

describe('a fixed-count plural input', () => {
  const INPUTS = { text: TEXT_INPUT, shots: FIXED_INPUT };
  const CONTRACT = { inputs: INPUTS, output: TEXT_OUTPUT };
  const FIELDS = buildRunFields(INPUTS);
  const SCHEMA = buildRunInputsSchema(INPUTS);
  const gate = (values: Record<string, unknown>) => {
    const prepared = prepareRunInputs(rjsfDataFromRunValues(values, FIELDS), SCHEMA);
    return { prepared, verdict: validateRunInputs(prepared, INPUTS, SCHEMA) };
  };

  it('lands in the schema’s `required` list, unlike a variable-length one', () => {
    expect(SCHEMA['required']).toEqual(['text', 'shots']);
    expect(buildRunInputsSchema({ illustrations: PLURAL_INPUT })['required']).toEqual([]);
  });

  it('blocks the Run button while it is empty', () => {
    // The whole reason it gates: left ungated and empty, the property is simply
    // absent, ajv never looks at it, and the run goes out without the input.
    expect(computeReadiness(FIELDS, { text: 'Apple in Cupertino.' }).missing).toEqual(['shots']);
  });

  it('runs once the declared number of items is there', () => {
    const { verdict } = gate({
      text: 'Apple in Cupertino.',
      shots: [{ url: 'a.png' }, { url: 'b.png' }, { url: 'c.png' }],
    });
    expect(verdict.isValid).toBe(true);
  });

  it('refuses a short list on the count the method declared, and so does the button', () => {
    // This used to be the recorded residual: readiness answered emptiness only,
    // so the button was live at two of three and the gate alone refused -
    // fail-closed, but the two halves were not phrasing the same rule. The
    // count now reaches the descriptor off the same `minItems` ajv reads.
    const values = { text: 'Apple in Cupertino.', shots: [{ url: 'a.png' }, { url: 'b.png' }] };
    expect(computeReadiness(FIELDS, values).missing).toEqual(['shots']);

    const { verdict } = gate(values);
    expect(verdict.isValid).toBe(false);
    expect(verdict.errors[0]?.stack).toBe("'shots' must NOT have fewer than 3 items");
  });

  it('carries the declared count on the descriptor, and only for a fixed list', () => {
    const shots = FIELDS.find((f) => f.name === 'shots');
    expect(shots?.kind === 'list' && shots.itemCount).toBe(3);

    const variable = buildRunFields({ illustrations: PLURAL_INPUT })[0];
    expect(variable?.kind === 'list' && variable.itemCount).toBeUndefined();
  });

  it('refuses a full-length list holding a blank row', () => {
    // The count is not the whole rule: three rows one of which was added and
    // left blank is a payload ajv's `minItems` accepts and the method cannot
    // use. Readiness and the assembled gate both refuse it, together.
    const values = {
      text: 'Apple in Cupertino.',
      shots: [{ url: 'a.png' }, { url: '' }, { url: 'c.png' }],
    };
    expect(computeReadiness(FIELDS, values).missing).toEqual(['shots']);
    expect(gateRunInputs(CONTRACT, rjsfDataFromRunValues(values, FIELDS)).ok).toBe(false);
  });

  it('is a run once all three are there', () => {
    const values = {
      text: 'Apple in Cupertino.',
      shots: [{ url: 'a.png' }, { url: 'b.png' }, { url: 'c.png' }],
    };
    expect(computeReadiness(FIELDS, values).missing).toEqual([]);
    expect(gateRunInputs(CONTRACT, rjsfDataFromRunValues(values, FIELDS)).ok).toBe(true);
  });
});
