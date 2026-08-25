/**
 * The invariant the two halves of the kernel exist to hold.
 *
 * `computeReadiness` decides whether the Run button is live; `gateRunInputs` is
 * what a server puts a run through. They are not the same call and must not be:
 * the server side is a strict SUPERSET - it also validates shapes and builds the
 * wire envelope - because the browser's checks are trivially bypassed and the
 * endpoint is public. What they must never do is DISAGREE about whether an
 * input is there, because then the form offers a run its own gate refuses (or,
 * worse, the server starts a paid run the button had disabled).
 *
 * This file asserts that by running BOTH sides over one table, which is the
 * only form of the claim worth trusting. Describing it in prose is how the
 * near-miss pair `inputMustBeFilled` + `isFilled` survived: it matches on every
 * native concept and diverges on a structured one, in both directions.
 *
 * Every row is a WELL-FORMED value - what the controls actually produce, run
 * through the value bridge. Shape errors are the superset's own business and
 * are covered in `gate.test.ts`.
 */
import { describe, expect, it } from 'vitest';
import { buildRunFields, computeReadiness, gateRunInputs, rjsfDataFromRunValues } from '..';
import type { PipeIOContract, PipeInputContract, PipeOutputContract } from '..';
import { OPTIONAL_SINGLE, PLAIN_SINGLE, PLAIN_VARIABLE, plainFixed } from './contract-fixtures';

const OUTPUT: PipeOutputContract = {
  concept_ref: 'native.Text',
  multiplicity: 'single',
  item_count: null,
  optional: false,
};

const textSchema = {
  title: 'TextContent',
  type: 'object',
  properties: { text: { type: 'string' } },
  required: ['text'],
};

const TEXT: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'native.Text',
  json_schema: textSchema,
};
const OPTIONAL_TEXT: PipeInputContract = { ...TEXT, ...OPTIONAL_SINGLE };

const NUMBER: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'native.Number',
  json_schema: {
    title: 'NumberContent',
    type: 'object',
    properties: { number: { type: 'number' } },
    required: ['number'],
  },
};

const YES_NO: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'native.YesNo',
  json_schema: {
    title: 'YesNoContent',
    type: 'object',
    properties: { yes_no: { type: 'boolean' } },
    required: ['yes_no'],
  },
};

const IMAGE: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'native.Image',
  json_schema: {
    title: 'ImageContent',
    type: 'object',
    properties: { url: { type: 'string' } },
    required: ['url'],
  },
};

/** A concept with a REQUIRED child - the shape v0.3.0 closed for optional inputs. */
const focusSchema = {
  title: 'ExtractionFocus',
  type: 'object',
  properties: {
    audience: { title: 'Audience', type: 'string', enum: ['engineer', 'executive'] },
    notes: { title: 'Notes', anyOf: [{ type: 'string' }, { type: 'null' }], default: null },
  },
  required: ['audience'],
};

/** A concept that demands NO child - the shape this campaign closed for required ones. */
const optsSchema = {
  title: 'RunOptions',
  type: 'object',
  properties: {
    tone: { title: 'Tone', type: 'string', enum: ['formal', 'casual'] },
    notes: { title: 'Notes', anyOf: [{ type: 'string' }, { type: 'null' }], default: null },
  },
};

const FOCUS: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'demo.ExtractionFocus',
  json_schema: focusSchema,
};
const OPTIONAL_FOCUS: PipeInputContract = { ...FOCUS, ...OPTIONAL_SINGLE };
const OPTS: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'demo.RunOptions',
  json_schema: optsSchema,
};
const OPTIONAL_OPTS: PipeInputContract = { ...OPTS, ...OPTIONAL_SINGLE };

/**
 * A required child ajv cannot catch: a plain string, which `''` satisfies.
 *
 * Every other structured fixture in this file gives its required child an
 * `enum`, and `gate.test.ts` says why - the shell fills a required plain string
 * with `''`, so only a child the shell leaves UNSET ever reaches ajv's
 * `required` at all. That makes the enum shape the one where a schema error
 * covers for the kernel, and this one the shape where the two halves are on
 * their own. A table meant to catch them drifting apart needs the second.
 */
const briefSchema = {
  title: 'Brief',
  type: 'object',
  properties: {
    name: { title: 'Name', type: 'string' },
    notes: { title: 'Notes', anyOf: [{ type: 'string' }, { type: 'null' }], default: null },
  },
  required: ['name'],
};

const BRIEF: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'demo.Brief',
  json_schema: briefSchema,
};
const OPTIONAL_BRIEF: PipeInputContract = { ...BRIEF, ...OPTIONAL_SINGLE };

/** A required struct holding a required struct that demands nothing. */
const NESTED: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'demo.Wrapper',
  json_schema: {
    title: 'Wrapper',
    type: 'object',
    properties: { label: { title: 'Label', type: 'string' }, opts: optsSchema },
    required: ['label', 'opts'],
  },
};

const PAGES: PipeInputContract = {
  ...PLAIN_VARIABLE,
  concept_ref: 'native.Text',
  json_schema: { type: 'array', items: textSchema },
};

const SHOTS: PipeInputContract = {
  ...plainFixed(3),
  concept_ref: 'native.Image',
  json_schema: {
    type: 'array',
    items: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
    minItems: 3,
    maxItems: 3,
  },
};

/** The same slot the method left omittable: `Image[3]?`. */
const OPTIONAL_SHOTS: PipeInputContract = { ...SHOTS, presence: 'optional' };

interface Row {
  label: string;
  inputs: Record<string, PipeInputContract>;
  /** The RUNNER's field values, exactly as a control leaves them. */
  values: Record<string, unknown>;
  /** What both halves must answer. */
  runnable: boolean;
}

const shot = (url: string) => ({ url });

const ROWS: Row[] = [
  // ─── leaves ───────────────────────────────────────────────────────────────
  { label: 'a required text, untouched', inputs: { text: TEXT }, values: {}, runnable: false },
  {
    label: 'a required text, filled',
    inputs: { text: TEXT },
    values: { text: 'hi' },
    runnable: true,
  },
  {
    label: 'an optional text, untouched',
    inputs: { note: OPTIONAL_TEXT },
    values: {},
    runnable: true,
  },
  { label: 'a required number, untouched', inputs: { n: NUMBER }, values: {}, runnable: false },
  {
    label: 'a required number holding zero',
    inputs: { n: NUMBER },
    values: { n: 0 },
    runnable: true,
  },
  { label: 'a required yes/no left unset', inputs: { b: YES_NO }, values: {}, runnable: false },
  {
    label: 'a required yes/no set to false',
    inputs: { b: YES_NO },
    values: { b: false },
    runnable: true,
  },
  {
    label: 'a required image with no file picked',
    inputs: { img: IMAGE },
    values: {},
    runnable: false,
  },
  {
    label: 'a required image with a url',
    inputs: { img: IMAGE },
    values: { img: { url: 'https://x/a.png' } },
    runnable: true,
  },

  // ─── structured concepts: the pair no native-only suite can catch ─────────
  {
    label: 'an OPTIONAL struct with a required child, untouched',
    inputs: { text: TEXT, focus: OPTIONAL_FOCUS },
    values: { text: 'hi' },
    runnable: true,
  },
  {
    label: 'an OPTIONAL struct with a required child, half filled',
    inputs: { text: TEXT, focus: OPTIONAL_FOCUS },
    values: { text: 'hi', focus: { notes: 'skip pricing' } },
    runnable: false,
  },
  {
    label: 'an OPTIONAL struct with a required child, filled',
    inputs: { text: TEXT, focus: OPTIONAL_FOCUS },
    values: { text: 'hi', focus: { audience: 'engineer' } },
    runnable: true,
  },
  {
    label: 'a REQUIRED struct with a required child, untouched',
    inputs: { text: TEXT, focus: FOCUS },
    values: { text: 'hi' },
    runnable: false,
  },
  {
    label: 'a REQUIRED struct with a required child, filled',
    inputs: { text: TEXT, focus: FOCUS },
    values: { text: 'hi', focus: { audience: 'engineer' } },
    runnable: true,
  },
  {
    label: 'a REQUIRED struct that demands no child, untouched',
    inputs: { text: TEXT, opts: OPTS },
    values: { text: 'hi' },
    runnable: false,
  },
  {
    label: 'a REQUIRED struct that demands no child, opened and left blank',
    inputs: { text: TEXT, opts: OPTS },
    values: { text: 'hi', opts: {} },
    runnable: false,
  },
  {
    label: 'a REQUIRED struct that demands no child, one child filled',
    inputs: { text: TEXT, opts: OPTS },
    values: { text: 'hi', opts: { tone: 'formal' } },
    runnable: true,
  },
  {
    label: 'an OPTIONAL struct that demands no child, untouched',
    inputs: { text: TEXT, opts: OPTIONAL_OPTS },
    values: { text: 'hi' },
    runnable: true,
  },
  {
    label: 'an OPTIONAL struct whose required child is a plain string, untouched',
    inputs: { text: TEXT, brief: OPTIONAL_BRIEF },
    values: { text: 'hi' },
    runnable: true,
  },
  {
    label: 'an OPTIONAL struct whose required child is a plain string, half filled',
    inputs: { text: TEXT, brief: OPTIONAL_BRIEF },
    values: { text: 'hi', brief: { notes: 'skip pricing' } },
    runnable: false,
  },
  {
    label: 'an OPTIONAL struct whose required child is a plain string, filled',
    inputs: { text: TEXT, brief: OPTIONAL_BRIEF },
    values: { text: 'hi', brief: { name: 'Q3' } },
    runnable: true,
  },
  {
    label: 'a required struct nesting a required struct that demands no child, outer only',
    inputs: { w: NESTED },
    values: { w: { label: 'run 4' } },
    runnable: false,
  },
  {
    label: 'a required struct nesting a required struct that demands no child, both',
    inputs: { w: NESTED },
    values: { w: { label: 'run 4', opts: { tone: 'casual' } } },
    runnable: true,
  },

  // ─── plurals ──────────────────────────────────────────────────────────────
  { label: 'a variable list, empty', inputs: { pages: PAGES }, values: {}, runnable: true },
  {
    label: 'a variable list with items',
    inputs: { pages: PAGES },
    values: { pages: ['first'] },
    runnable: true,
  },
  { label: 'a fixed list of three, empty', inputs: { shots: SHOTS }, values: {}, runnable: false },
  {
    label: 'a fixed list of three, holding two',
    inputs: { shots: SHOTS },
    values: { shots: [shot('a.png'), shot('b.png')] },
    runnable: false,
  },
  {
    label: 'a fixed list of three, holding three one of which is blank',
    inputs: { shots: SHOTS },
    values: { shots: [shot('a.png'), shot(''), shot('c.png')] },
    runnable: false,
  },
  {
    label: 'a fixed list of three, holding three',
    inputs: { shots: SHOTS },
    values: { shots: [shot('a.png'), shot('b.png'), shot('c.png')] },
    runnable: true,
  },
  {
    label: 'a fixed list of three, holding four',
    inputs: { shots: SHOTS },
    values: { shots: [shot('a.png'), shot('b.png'), shot('c.png'), shot('d.png')] },
    runnable: false,
  },
  {
    label: 'an OPTIONAL fixed list of three, holding three one of which is blank',
    inputs: { text: TEXT, shots: OPTIONAL_SHOTS },
    values: { text: 'hi', shots: [shot('a.png'), shot(''), shot('c.png')] },
    runnable: false,
  },
];

describe('the Run button and the server gate answer together', () => {
  it.each(ROWS)('$label', ({ inputs, values, runnable }) => {
    const contract: PipeIOContract = { inputs, output: OUTPUT };
    const fields = buildRunFields(inputs);

    const buttonLive = computeReadiness(fields, values).missing.length === 0;
    // Exactly what a form sends: the runner's values through the value bridge.
    const gate = gateRunInputs(contract, rjsfDataFromRunValues(values, fields));

    expect(buttonLive).toBe(runnable);
    expect(gate.ok).toBe(runnable);
  });

  it('names the inputs it refuses, so a caller never has to quote ajv', () => {
    const contract: PipeIOContract = {
      inputs: { text: TEXT, opts: OPTS, shots: SHOTS },
      output: OUTPUT,
    };
    const gate = gateRunInputs(contract, {});

    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.missingInputs).toEqual(['text', 'opts', 'shots']);
  });

  it('builds the wire payload only on the ok arm', () => {
    const contract: PipeIOContract = { inputs: { text: TEXT, pages: PAGES }, output: OUTPUT };
    const fields = buildRunFields(contract.inputs);
    const gate = gateRunInputs(contract, rjsfDataFromRunValues({ text: 'hi' }, fields));

    expect(gate).toEqual({
      ok: true,
      inputs: { text: { concept: 'native.Text', content: { text: 'hi' } }, pages: [] },
    });
  });
});

describe('gateRunInputs is a public endpoint, so it takes whatever arrives', () => {
  const contract: PipeIOContract = { inputs: { text: TEXT }, output: OUTPUT };

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'text=hi'],
    ['an array', [{ text: 'hi' }]],
    ['a number', 7],
  ])('rejects %s by naming the inputs, rather than throwing', (_label, data) => {
    // The chain indexes the payload by variable name without checking it is
    // indexable, so a bare `null` used to throw AFTER ajv had already judged it
    // - past the point where a verdict could be returned, and into whatever the
    // host framework does with an exception crossing its boundary.
    const gate = gateRunInputs(contract, data);

    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.missingInputs).toEqual(['text']);
  });

  it('reuses one schema object per contract, so ajv’s cache is bounded by contracts', () => {
    // ajv keys its compiled-schema cache on schema object IDENTITY and never
    // evicts. Rebuilding per call would retain a validator per REQUEST - on a
    // public endpoint, unbounded growth driven by the cheapest possible body.
    for (let i = 0; i < 50; i++) expect(gateRunInputs(contract, {}).ok).toBe(false);
    expect(gateRunInputs(contract, { text: { text: 'hi' } }).ok).toBe(true);
  });
});
