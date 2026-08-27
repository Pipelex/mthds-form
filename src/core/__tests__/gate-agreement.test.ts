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
import type { InputFormField, InputFormTopLevelField } from 'mthds/protocol';
import type { PipeIOContract, PipeInputContract, PipeOutputContract, RunField } from '..';
import {
  OPTIONAL_SINGLE,
  PLAIN_SINGLE,
  PLAIN_VARIABLE,
  plainFixed,
  WIRE_OPTIONAL,
  WIRE_PLAIN,
  WIRE_VARIABLE,
} from './contract-fixtures';

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

/**
 * The same slot the method left omittable: `Image[3]?` - which is invalid
 * MTHDS, because a presence marker may not be combined with a multiplicity
 * suffix, and which the standard's types reject. The cast is deliberate and the
 * row is kept: the kernel does not parse-check the contract an API hands it, so
 * a producer emitting the combination reaches both halves, and the one thing
 * they must never do is disagree about it.
 */
const OPTIONAL_SHOTS = { ...SHOTS, presence: 'optional' } as unknown as PipeInputContract;

/** `Brief[]` - a variable list whose ITEM owes its concept a required child. */
const BRIEFS: PipeInputContract = {
  ...PLAIN_VARIABLE,
  concept_ref: 'demo.Brief',
  json_schema: { type: 'array', items: briefSchema },
};

/**
 * The wire descriptor node each contract fixture arrives with - hand-authored
 * per the standard's kind assignment, keyed by fixture IDENTITY so the table's
 * rows stay exactly what they were. Since the swap, readiness runs over the
 * WIRE-mapped tree while the gate walks the contract's schema for itself; this
 * suite is therefore the agreement proof ACROSS the two trees, which is the
 * stronger form of the claim it always made.
 */
const FOCUS_FIELDS: InputFormField[] = [
  { kind: 'enum', name: 'audience', choices: ['engineer', 'executive'], required: true },
  { kind: 'text', name: 'notes', required: false },
];
const OPTS_FIELDS: InputFormField[] = [
  { kind: 'enum', name: 'tone', choices: ['formal', 'casual'], required: false },
  { kind: 'text', name: 'notes', required: false },
];
const BRIEF_FIELDS: InputFormField[] = [
  { kind: 'text', name: 'name', required: true },
  { kind: 'text', name: 'notes', required: false },
];

const WIRE = new Map<PipeInputContract, (name: string) => InputFormTopLevelField>([
  [TEXT, (name) => ({ ...WIRE_PLAIN, kind: 'prose', name, concept_ref: 'native.Text' })],
  [OPTIONAL_TEXT, (name) => ({ ...WIRE_OPTIONAL, kind: 'prose', name, concept_ref: 'native.Text' })],
  [NUMBER, (name) => ({ ...WIRE_PLAIN, kind: 'number', name, concept_ref: 'native.Number', integer: false })],
  [YES_NO, (name) => ({ ...WIRE_PLAIN, kind: 'boolean', name, concept_ref: 'native.YesNo' })],
  [IMAGE, (name) => ({ ...WIRE_PLAIN, kind: 'image', name, concept_ref: 'native.Image' })],
  [FOCUS, (name) => ({ ...WIRE_PLAIN, kind: 'object', name, concept_ref: 'demo.ExtractionFocus', fields: FOCUS_FIELDS })],
  [OPTIONAL_FOCUS, (name) => ({ ...WIRE_OPTIONAL, kind: 'object', name, concept_ref: 'demo.ExtractionFocus', fields: FOCUS_FIELDS })],
  [OPTS, (name) => ({ ...WIRE_PLAIN, kind: 'object', name, concept_ref: 'demo.RunOptions', fields: OPTS_FIELDS })],
  [OPTIONAL_OPTS, (name) => ({ ...WIRE_OPTIONAL, kind: 'object', name, concept_ref: 'demo.RunOptions', fields: OPTS_FIELDS })],
  [BRIEF, (name) => ({ ...WIRE_PLAIN, kind: 'object', name, concept_ref: 'demo.Brief', fields: BRIEF_FIELDS })],
  [OPTIONAL_BRIEF, (name) => ({ ...WIRE_OPTIONAL, kind: 'object', name, concept_ref: 'demo.Brief', fields: BRIEF_FIELDS })],
  [NESTED, (name) => ({
    ...WIRE_PLAIN,
    kind: 'object',
    name,
    concept_ref: 'demo.Wrapper',
    fields: [
      { kind: 'text', name: 'label', required: true },
      { kind: 'object', name: 'opts', required: true, fields: OPTS_FIELDS },
    ],
  })],
  [PAGES, (name) => ({
    ...WIRE_VARIABLE,
    kind: 'list',
    name,
    concept_ref: 'native.Text',
    item: { kind: 'prose', required: true, concept_ref: 'native.Text' },
  })],
  [SHOTS, (name) => ({
    ...WIRE_PLAIN,
    kind: 'list',
    name,
    concept_ref: 'native.Image',
    item: { kind: 'image', required: true, concept_ref: 'native.Image' },
    item_count: 3,
  })],
  // The optional-plural combination is invalid MTHDS (see OPTIONAL_SHOTS); the
  // optional arm of the top-level union happens to admit a list node, so the
  // wire side of the same violating producer needs no cast.
  [OPTIONAL_SHOTS, (name) => ({
    ...WIRE_OPTIONAL,
    kind: 'list',
    name,
    concept_ref: 'native.Image',
    item: { kind: 'image', required: true, concept_ref: 'native.Image' },
    item_count: 3,
  })],
  [BRIEFS, (name) => ({
    ...WIRE_VARIABLE,
    kind: 'list',
    name,
    concept_ref: 'demo.Brief',
    item: { kind: 'object', required: true, concept_ref: 'demo.Brief', fields: BRIEF_FIELDS },
  })],
]);

/** The render tree for a row's inputs: the wire descriptor mapped over them. */
function fieldsOf(inputs: Record<string, PipeInputContract>): RunField[] {
  return buildRunFields(
    { fields: Object.entries(inputs).map(([name, input]) => WIRE.get(input)!(name)) },
    inputs,
  );
}

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
    const fields = fieldsOf(inputs);

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
    const fields = fieldsOf(contract.inputs);
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

  it('holds a STARTED list row to its concept, and leaves an untouched one alone', () => {
    // One level down from the rule the top-level struct already follows. A row
    // the user began owes its concept every required child; ajv cannot say so
    // (a required plain string arrives as `''`, which is present), and
    // `isFilled` on the array is `some`, which a half-filled row satisfies. So
    // the row went out incomplete on a run the button had declared ready.
    const contract: PipeIOContract = { inputs: { briefs: BRIEFS }, output: OUTPUT };
    const fields = fieldsOf(contract.inputs);
    // Both halves over one value, exactly as the table above does it: readiness
    // reads the runner's values, the gate reads what the bridge sends.
    const both = (values: Record<string, unknown>) => ({
      button: computeReadiness(fields, values).missing.length === 0,
      gate: gateRunInputs(contract, rjsfDataFromRunValues(values, fields)),
    });

    // A row with something in it but its required `name` blank. `''` is a
    // present string, so ajv passes it; only the kernel's rule refuses it.
    const started = both({ briefs: [{ name: '', notes: 'a thought' }] });
    expect(started.button).toBe(false);
    expect(started.gate.ok).toBe(false);
    if (!started.gate.ok) expect(started.gate.missingInputs).toEqual(['briefs']);

    // The same row completed.
    const done = both({ briefs: [{ name: 'Q3 launch', notes: 'a thought' }] });
    expect(done.button).toBe(true);
    expect(done.gate.ok).toBe(true);

    // An empty list blocks nothing - a plural slot's empty form IS the empty
    // list - and neither does a row the user added and never touched, which
    // deflates back out of the payload rather than travelling half-built.
    for (const untouched of [{ briefs: [] }, { briefs: [{}] }]) {
      const verdict = both(untouched);
      expect(verdict.button).toBe(true);
      expect(verdict.gate.ok).toBe(true);
      if (verdict.gate.ok) expect(verdict.gate.inputs['briefs']).toEqual([]);
    }
  });

  it('refuses a malformed body even when the method demands no input', () => {
    // The nastier half of the same defect, and the one a required input hides.
    // Repairing a non-object to `{}` BEFORE validating it means ajv is shown a
    // body the caller never sent; with an empty `required` list, `{}` validates
    // and `ok: true` came back on a string. Nothing downstream could tell: the
    // payload is built from the repair, so the run started, and was billed, on
    // a request that carried no inputs at all.
    const optional: PipeIOContract = { inputs: { text: OPTIONAL_TEXT }, output: OUTPUT };

    expect(gateRunInputs(optional, {}).ok).toBe(true);
    for (const body of ['text=hi', 7, true, [{ text: 'hi' }]]) {
      const gate = gateRunInputs(optional, body);
      expect(gate.ok).toBe(false);
      // And it says why, rather than naming an input the caller did send.
      if (!gate.ok) expect(gate.errors[0]?.stack).toBe('must be object');
    }
  });

  it('gives the same verdict however many times one contract is gated', () => {
    // The schema is cached per contract, and a cache is a place a verdict can
    // start drifting from the value in front of it. This says only that it does
    // not: repeated gating of one contract answers identically, and a later
    // filled body still passes. That the cache EXISTS - that ajv is handed one
    // schema object rather than a fresh one per request - is a claim about
    // object identity that no sequence of verdicts can make, and it is asserted
    // where it is observable, in `gate-schema-cache.test.ts`.
    for (let i = 0; i < 50; i++) expect(gateRunInputs(contract, {}).ok).toBe(false);
    expect(gateRunInputs(contract, { text: { text: 'hi' } }).ok).toBe(true);
  });
});
