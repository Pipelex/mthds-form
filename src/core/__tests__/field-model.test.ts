import {
  buildRunFields,
  computeReadiness,
  conceptCategory,
  getPipeInputForm,
  mustBeFilled,
  type ObjectRunField,
} from '..';
import { describe, expect, it } from 'vitest';
import type { InputFormTopLevelField } from 'mthds/protocol';
import type { InputForm, PipeInputContract } from '..';
import {
  descriptorOf,
  OPTIONAL_SINGLE,
  PLAIN_SINGLE,
  PLAIN_VARIABLE,
  WIRE_OPTIONAL,
  WIRE_PLAIN,
  WIRE_VARIABLE,
} from './contract-fixtures';

describe('buildRunFields date mapping', () => {
  it('maps a nested wire `date` node to a date field that stores a timestamp', () => {
    // A `type = "date"` structure field compiles to `format: date-time`; the
    // wire states the node as `kind: "date"` with `datetime: true`.
    const inputs: Record<string, PipeInputContract> = {
      quote_date: {
        ...PLAIN_SINGLE,
        concept_ref: 'atlas.QuoteDate',
        json_schema: {
          type: 'object',
          properties: { date: { type: 'string', format: 'date-time', title: 'Date' } },
          required: ['date'],
        },
      },
    };
    const descriptor = descriptorOf({
      ...WIRE_PLAIN,
      kind: 'object',
      name: 'quote_date',
      concept_ref: 'atlas.QuoteDate',
      fields: [{ kind: 'date', name: 'date', datetime: true, required: true }],
    });

    const quote = buildRunFields(descriptor, inputs)[0] as ObjectRunField;
    expect(quote.kind).toBe('object');
    const date = quote.fields.find((f) => f.name === 'date')!;
    expect(date.kind).toBe('date');
    expect(date.kind === 'date' && date.datetime).toBe(true);
  });

  it('maps a top-level wire `date` node to a date field that stores a plain day', () => {
    const inputs: Record<string, PipeInputContract> = {
      day: {
        ...PLAIN_SINGLE,
        concept_ref: 'atlas.Day',
        json_schema: { type: 'string', format: 'date' },
      },
    };
    const descriptor = descriptorOf({
      ...WIRE_PLAIN,
      kind: 'date',
      name: 'day',
      concept_ref: 'atlas.Day',
      datetime: false,
    });

    const field = buildRunFields(descriptor, inputs)[0]!;
    expect(field.kind).toBe('date');
    expect(field.kind === 'date' && field.datetime).toBe(false);
    expect(conceptCategory(field)).toBe('date');
  });

  it('keeps a wire `text` node a text field - the kind is the wire’s to state', () => {
    const inputs: Record<string, PipeInputContract> = {
      label: { ...PLAIN_SINGLE, concept_ref: 'atlas.Label', json_schema: { type: 'string' } },
    };
    const descriptor = descriptorOf({
      ...WIRE_PLAIN,
      kind: 'text',
      name: 'label',
      concept_ref: 'atlas.Label',
    });
    expect(buildRunFields(descriptor, inputs)[0]!.kind).toBe('text');
  });
});

// ─── The facts the wire states and the schema never carried ──────────────────

describe('the wire-stated facts land on the descriptor verbatim', () => {
  const INPUT: Record<string, PipeInputContract> = {
    clause: {
      ...OPTIONAL_SINGLE,
      concept_ref: 'legal.Clause',
      json_schema: { type: 'object', properties: { text: { type: 'string' } } },
    },
  };
  const DESCRIPTOR = descriptorOf({
    ...WIRE_OPTIONAL,
    kind: 'prose',
    name: 'clause',
    title: 'Clause',
    concept_ref: 'legal.Clause',
    refines: ['legal.BaseClause', 'native.Text'],
    description: 'The clause to review',
    default_value: 'n/a',
    examples: ['a non-compete clause'],
    min_length: 3,
    max_length: 500,
    pattern: '\\S',
    hints: { intent: 'prose' },
  });

  it('carries identity, chain, authored default, examples, constraints and hints', () => {
    const [field] = buildRunFields(DESCRIPTOR, INPUT);
    expect(field).toMatchObject({
      kind: 'prose',
      name: 'clause',
      title: 'Clause',
      conceptRef: 'legal.Clause',
      refines: ['legal.BaseClause', 'native.Text'],
      description: 'The clause to review',
      required: false,
      presence: 'optional',
      gating: false,
      defaultValue: 'n/a',
      examples: ['a non-compete clause'],
      minLength: 3,
      maxLength: 500,
      pattern: '\\S',
      hints: { intent: 'prose' },
    });
  });

  it('collapses the wire’s exclusive number bounds into min/max', () => {
    const [field] = buildRunFields(
      descriptorOf({
        ...WIRE_PLAIN,
        kind: 'number',
        name: 'score',
        integer: true,
        exclusive_minimum: 0,
        maximum: 10,
      }),
      { score: { ...PLAIN_SINGLE, concept_ref: 'demo.Score', json_schema: { type: 'integer' } } },
    );
    expect(field).toMatchObject({ kind: 'number', integer: true, min: 0, max: 10 });
  });
});

// ─── What the Run bar is allowed to demand ───────────────────────────────────

describe('required / readiness over optional and plural inputs', () => {
  const INPUTS: Record<string, PipeInputContract> = {
    supplier_quote: {
      ...PLAIN_SINGLE,
      concept_ref: 'native.Document',
      json_schema: { type: 'object' },
    },
    comments: {
      ...OPTIONAL_SINGLE,
      concept_ref: 'native.Text',
      json_schema: { type: 'object', properties: { text: { type: 'string' } } },
    },
    illustrations: {
      ...PLAIN_VARIABLE,
      concept_ref: 'native.Image',
      json_schema: { type: 'array', items: { type: 'object' } },
    },
  };
  const DESCRIPTOR = descriptorOf(
    { ...WIRE_PLAIN, kind: 'document', name: 'supplier_quote', concept_ref: 'native.Document' },
    { ...WIRE_OPTIONAL, kind: 'prose', name: 'comments', concept_ref: 'native.Text' },
    {
      ...WIRE_VARIABLE,
      kind: 'list',
      name: 'illustrations',
      concept_ref: 'native.Image',
      item: { kind: 'image', required: true, concept_ref: 'native.Image' },
    },
  );
  const fields = () => buildRunFields(DESCRIPTOR, INPUTS);

  it('marks an optional (`?`) input not-required so it can collapse', () => {
    const [quote, comments, illustrations] = fields();
    expect(quote?.required).toBe(true);
    expect(comments?.required).toBe(false);
    // A plural input is still a first-class input: it keeps its place in the form.
    expect(illustrations?.required).toBe(true);
    expect(illustrations?.kind).toBe('list');
  });

  it('gates only where the wire says so', () => {
    const [quote, comments, illustrations] = fields();
    expect(mustBeFilled(quote!)).toBe(true);
    expect(mustBeFilled(comments!)).toBe(false);
    expect(mustBeFilled(illustrations!)).toBe(false);
  });

  // Whether Run waits for an input is the WIRE's `gating` fact, read verbatim -
  // never re-derived from the mapped kind. The engine derives it from the
  // contract (`gating: false` exactly on optional and variable-plural slots),
  // so the form and the method viewer read one answer by construction.
  it('reads `gating` off the wire even where a kind-based rule would disagree', () => {
    const input: PipeInputContract = {
      ...PLAIN_SINGLE,
      concept_ref: 'native.Text[]',
      json_schema: { type: 'string' },
    };
    const [field] = buildRunFields(
      descriptorOf({
        ...WIRE_PLAIN,
        kind: 'list',
        name: 'tags',
        concept_ref: 'native.Text',
        item: { kind: 'text', required: true, concept_ref: 'native.Text' },
      }),
      { tags: input },
    );

    // A kind-based fallback would answer false for a list; the wire gates it.
    expect(mustBeFilled(field!)).toBe(true);
  });

  it('falls back to the shape heuristic for a hand-authored field (no wire)', () => {
    // Story fixtures and unit tests build `RunField`s directly; they carry no
    // `gating` because no wire descriptor is behind them.
    const handAuthored = {
      kind: 'list' as const,
      name: 'tags',
      conceptRef: 'native.Text[]',
      required: true,
      item: { kind: 'text' as const, name: 'tag', required: true },
    };
    expect(handAuthored).not.toHaveProperty('gating');
    expect(mustBeFilled(handAuthored)).toBe(false);
  });

  it('counts an empty form as one input short, not three', () => {
    const readiness = computeReadiness(fields(), {});
    expect(readiness).toEqual({ total: 1, ready: 0, missing: ['supplier_quote'] });
  });

  it('is ready once the one required input is filled', () => {
    const readiness = computeReadiness(fields(), {
      supplier_quote: { url: 'quote.pdf' },
    });
    expect(readiness).toEqual({ total: 1, ready: 1, missing: [] });
  });

  it('still gates a required input when other inputs are filled', () => {
    const readiness = computeReadiness(fields(), { comments: 'offrir la gravure' });
    expect(readiness.missing).toEqual(['supplier_quote']);
  });

  it('counts a TOUCHED optional input, because the gate then demands it whole', () => {
    // An optional input is out of the denominator until the user puts something
    // in it, and in it afterwards - a touched structure owes its concept every
    // field the concept declares, which is what the server gate enforces. The
    // count a host displays follows: 1 of 1 untouched, 1 of 2 once started.
    const f = fields();

    expect(computeReadiness(f, {}).total).toBe(1);
    expect(computeReadiness(f, { comments: 'offrir la gravure' })).toEqual({
      total: 2,
      ready: 1,
      missing: ['supplier_quote'],
    });
  });
});

describe('preserves the wire’s order and keys, whichever convention the map used', () => {
  it('renders fields in AUTHORED order - the fact the contract map never carried', () => {
    const inputs: Record<string, PipeInputContract> = {
      zeta: { ...PLAIN_SINGLE, concept_ref: 'native.Text', json_schema: { type: 'object' } },
      alpha: { ...PLAIN_SINGLE, concept_ref: 'native.Text', json_schema: { type: 'object' } },
    };
    const descriptor = descriptorOf(
      { ...WIRE_PLAIN, kind: 'prose', name: 'alpha', concept_ref: 'native.Text' },
      { ...WIRE_PLAIN, kind: 'prose', name: 'zeta', concept_ref: 'native.Text' },
    );
    expect(buildRunFields(descriptor, inputs).map((f) => f.name)).toEqual(['alpha', 'zeta']);
  });

  it('looks a pipe’s descriptor up by either key convention, like the contract', () => {
    const inputForm: InputForm = {
      'demo.summarize': descriptorOf(),
    };
    expect(getPipeInputForm(inputForm, 'demo', 'summarize')).toBe(inputForm['demo.summarize']);
    expect(getPipeInputForm(inputForm, null, 'demo.summarize')).toBe(inputForm['demo.summarize']);
    expect(getPipeInputForm(inputForm, 'demo', 'missing')).toBeUndefined();
    expect(getPipeInputForm(inputForm, 'demo', 'constructor')).toBeUndefined();
    expect(getPipeInputForm(undefined, 'demo', 'summarize')).toBeUndefined();
  });
});

describe('a list bound the wire did not put there', () => {
  /**
   * The wire puts `item_count` only on a top-level fixed `[N]` slot - but
   * `buildRunFields` still walks the contract's schema beside the wire tree,
   * because a structured concept's model may bound an array property of its
   * own (`minItems`/`maxItems`), ajv enforces those, and readiness must not be
   * more permissive than the gate. The two bounds stay two facts.
   */
  const INPUT: PipeInputContract = {
    ...PLAIN_SINGLE,
    concept_ref: 'demo.Applicant',
    json_schema: {
      type: 'object',
      title: 'Applicant',
      properties: {
        tags: { type: 'array', items: { type: 'string' }, minItems: 2 },
      },
      required: ['tags'],
    },
  };
  const NODE: InputFormTopLevelField = {
    ...WIRE_PLAIN,
    kind: 'object',
    name: 'applicant',
    concept_ref: 'demo.Applicant',
    fields: [
      {
        kind: 'list',
        name: 'tags',
        required: true,
        item: { kind: 'text', required: true },
      },
    ],
  };

  const tagsField = () => {
    const [applicant] = buildRunFields(descriptorOf(NODE), { applicant: INPUT });
    const tags = (applicant as ObjectRunField).fields[0];
    return tags?.kind === 'list' ? tags : undefined;
  };

  it('carries a lower bound alone as a lower bound alone', () => {
    expect(tagsField()?.itemCount).toBe(2);
    expect(tagsField()?.maxItemCount).toBeUndefined();
  });

  it('still gates on that bound, so readiness cannot outrun ajv', () => {
    // The direction that matters: a nested array holding one item where the
    // schema demands two must not read ready, or the button offers a run the
    // validator refuses.
    const fields = buildRunFields(descriptorOf(NODE), { applicant: INPUT });

    expect(computeReadiness(fields, { applicant: { tags: ['a'] } }).missing).toEqual(['applicant']);
    expect(computeReadiness(fields, { applicant: { tags: ['a', 'b'] } }).missing).toEqual([]);
    // And it does NOT become a ceiling: three tags satisfy "at least two".
    expect(computeReadiness(fields, { applicant: { tags: ['a', 'b', 'c'] } }).missing).toEqual([]);
  });

  describe('stated as an upper bound alone', () => {
    const CAPPED: PipeInputContract = {
      ...PLAIN_SINGLE,
      concept_ref: 'demo.Applicant',
      json_schema: {
        type: 'object',
        title: 'Applicant',
        properties: {
          tags: { type: 'array', items: { type: 'string' }, maxItems: 2 },
        },
        required: ['tags'],
      },
    };

    it('carries an upper bound alone as an upper bound alone', () => {
      const [applicant] = buildRunFields(descriptorOf(NODE), { applicant: CAPPED });
      const tags = (applicant as ObjectRunField).fields[0];

      expect(tags?.kind === 'list' && tags.maxItemCount).toBe(2);
      expect(tags?.kind === 'list' && tags.itemCount).toBeUndefined();
    });

    it('gates on it, so a ceiling the descriptor publishes is a ceiling readiness keeps', () => {
      // The bound used to be enforced only inside the `itemCount` branch, so a
      // model stating `maxItems` alone put its ceiling on the descriptor and
      // enforced it nowhere: the button stayed live over a list ajv was about
      // to refuse, which is the disagreement both halves exist to prevent.
      const fields = buildRunFields(descriptorOf(NODE), { applicant: CAPPED });

      expect(computeReadiness(fields, { applicant: { tags: ['a', 'b'] } }).missing).toEqual([]);
      expect(computeReadiness(fields, { applicant: { tags: ['a', 'b', 'c'] } }).missing).toEqual([
        'applicant',
      ]);
    });
  });
});
