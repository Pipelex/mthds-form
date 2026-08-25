import {
  inputMustBeFilled,
  buildRunFields,
  computeReadiness,
  conceptCategory,
  mustBeFilled,
  type ObjectRunField,
} from '..';
import { describe, expect, it } from 'vitest';
import type { PipeInputContract } from '..';
import { OPTIONAL_SINGLE, PLAIN_SINGLE, PLAIN_VARIABLE } from './contract-fixtures';

describe('buildRunFields date mapping', () => {
  it('maps a `date-time` string property to a date field that stores a timestamp', () => {
    // A `type = "date"` structure field compiles to `format: date-time`.
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

    const quote = buildRunFields(inputs)[0] as ObjectRunField;
    expect(quote.kind).toBe('object');
    const date = quote.fields.find((f) => f.name === 'date')!;
    expect(date.kind).toBe('date');
    expect(date.kind === 'date' && date.datetime).toBe(true);
  });

  it('maps a bare `date` format to a date field that stores a plain day', () => {
    const inputs: Record<string, PipeInputContract> = {
      day: {
        ...PLAIN_SINGLE,
        concept_ref: 'atlas.Day',
        json_schema: { type: 'string', format: 'date' },
      },
    };

    const field = buildRunFields(inputs)[0]!;
    expect(field.kind).toBe('date');
    expect(field.kind === 'date' && field.datetime).toBe(false);
    expect(conceptCategory(field)).toBe('date');
  });

  it('leaves a plain string field as text (not date)', () => {
    const inputs: Record<string, PipeInputContract> = {
      label: { ...PLAIN_SINGLE, concept_ref: 'atlas.Label', json_schema: { type: 'string' } },
    };
    expect(buildRunFields(inputs)[0]!.kind).not.toBe('date');
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

  it('marks an optional (`?`) input not-required so it can collapse', () => {
    const [quote, comments, illustrations] = buildRunFields(INPUTS);
    expect(quote?.required).toBe(true);
    expect(comments?.required).toBe(false);
    // A plural input is still a first-class input: it keeps its place in the form.
    expect(illustrations?.required).toBe(true);
    expect(illustrations?.kind).toBe('list');
  });

  it('gates only on the required, non-plural inputs', () => {
    const fields = buildRunFields(INPUTS);
    expect(mustBeFilled(fields[0]!)).toBe(true);
    expect(mustBeFilled(fields[1]!)).toBe(false);
    expect(mustBeFilled(fields[2]!)).toBe(false);
  });

  // The run page and the method viewer must answer "does Run wait for this?"
  // identically - they used to hold two rules, and this is the input that told
  // them apart: a plural conceptRef whose json_schema is NOT an array. The
  // viewer's contract predicate is the single source now, so both say the same.
  it('agrees with the method viewer on a plural input carrying a non-array schema', () => {
    const input: PipeInputContract = {
      ...PLAIN_SINGLE,
      concept_ref: 'native.Text[]',
      // Deliberately not `type: 'array'` - the shape heuristic would call this a
      // list from the conceptRef alone and stop gating on it.
      json_schema: { type: 'string' },
    };
    const [field] = buildRunFields({ tags: input });

    expect(mustBeFilled(field!)).toBe(inputMustBeFilled(input));
    // And concretely: the contract never declared it optional or plural-by-schema,
    // so it still gates - the mapped `kind` is irrelevant to the question.
    expect(mustBeFilled(field!)).toBe(true);
  });

  it('falls back to the shape heuristic for a hand-authored field (no contract)', () => {
    // Story fixtures and unit tests build `RunField`s directly; they carry no
    // `gating` because there is no contract behind them.
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
    const readiness = computeReadiness(buildRunFields(INPUTS), {});
    expect(readiness).toEqual({ total: 1, ready: 0, missing: ['supplier_quote'] });
  });

  it('is ready once the one required input is filled', () => {
    const readiness = computeReadiness(buildRunFields(INPUTS), {
      supplier_quote: { url: 'quote.pdf' },
    });
    expect(readiness).toEqual({ total: 1, ready: 1, missing: [] });
  });

  it('still gates a required input when other inputs are filled', () => {
    const readiness = computeReadiness(buildRunFields(INPUTS), { comments: 'offrir la gravure' });
    expect(readiness.missing).toEqual(['supplier_quote']);
  });

  it('counts a TOUCHED optional input, because the gate then demands it whole', () => {
    // An optional input is out of the denominator until the user puts something
    // in it, and in it afterwards - a touched structure owes its concept every
    // field the concept declares, which is what the server gate enforces. The
    // count a host displays follows: 1 of 1 untouched, 1 of 2 once started.
    const fields = buildRunFields(INPUTS);

    expect(computeReadiness(fields, {}).total).toBe(1);
    expect(computeReadiness(fields, { comments: 'offrir la gravure' })).toEqual({
      total: 2,
      ready: 1,
      missing: ['supplier_quote'],
    });
  });
});

describe('a list bound the wire did not put there', () => {
  /**
   * `buildRunFields` maps a top-level slot AND recurses into a structured
   * concept's own schema, where an array property is a pydantic model's, not an
   * MTHDS multiplicity marker. Such a property can state one bound alone, and
   * the two bounds then mean different things - which is why the descriptor
   * carries them separately instead of one `itemCount` read as both.
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

  const tagsField = () => {
    const [applicant] = buildRunFields({ applicant: INPUT });
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
    const fields = buildRunFields({ applicant: INPUT });

    expect(computeReadiness(fields, { applicant: { tags: ['a'] } }).missing).toEqual(['applicant']);
    expect(computeReadiness(fields, { applicant: { tags: ['a', 'b'] } }).missing).toEqual([]);
    // And it does NOT become a ceiling: three tags satisfy "at least two".
    expect(computeReadiness(fields, { applicant: { tags: ['a', 'b', 'c'] } }).missing).toEqual([]);
  });
});
