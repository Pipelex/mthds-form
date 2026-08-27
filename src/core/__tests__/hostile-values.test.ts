/**
 * What the kernel does with values nobody designed for.
 *
 * `computeReadiness` runs in a browser a user controls, and `gateRunInputs` is
 * the trust boundary behind it - a public run endpoint whose argument is
 * whatever was in the request body. So the interesting inputs here are not the
 * ones a control produces (those are `gate-agreement.test.ts`'s table) but the
 * ones that arrive by another route: a value nested past any real structure, a
 * value that references itself, a string of spaces, and a name that collides
 * with `Object.prototype`.
 *
 * Every case is asserted through BOTH halves wherever both can see it. A
 * hostile value that makes the two disagree is the same defect class as a
 * well-formed one that does - it just arrives from a different direction.
 *
 * The render tree is mapped from each fixture's hand-authored wire node
 * (`fieldsOf`, the same identity-keyed idiom as `gate-agreement.test.ts`);
 * several inputs here are named dynamically, so the node factories take the
 * name.
 */
import { describe, expect, it } from 'vitest';
import {
  buildRunFields,
  computeReadiness,
  gateRunInputs,
  getPipeIOContract,
  isFilled,
  rjsfDataFromRunValues,
} from '..';
import type { InputFormTopLevelField } from 'mthds/protocol';
import type { PipeIOContract, PipeIOContracts, PipeInputContract, RunField } from '..';
import {
  OPTIONAL_SINGLE,
  PLAIN_SINGLE,
  SINGLE_OUTPUT,
  WIRE_OPTIONAL,
  WIRE_PLAIN,
} from './contract-fixtures';

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

/** A concept that demands no child: ajv passes anything, so only the kernel's
 *  own emptiness rule decides. */
const OPTS: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'demo.RunOptions',
  json_schema: {
    title: 'RunOptions',
    type: 'object',
    properties: { tone: { title: 'Tone', type: 'string' } },
  },
};

/** A concept whose required CHILD collides with `Object.prototype`. */
const NAMED: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'demo.Named',
  json_schema: {
    title: 'Named',
    type: 'object',
    properties: { constructor: { title: 'Constructor', type: 'string' } },
    required: ['constructor'],
  },
};

/** The wire node each contract fixture arrives with, keyed by fixture identity. */
const WIRE = new Map<PipeInputContract, (name: string) => InputFormTopLevelField>([
  [TEXT, (name) => ({ ...WIRE_PLAIN, kind: 'prose', name, concept_ref: 'native.Text' })],
  [
    OPTIONAL_TEXT,
    (name) => ({ ...WIRE_OPTIONAL, kind: 'prose', name, concept_ref: 'native.Text' }),
  ],
  [
    OPTS,
    (name) => ({
      ...WIRE_PLAIN,
      kind: 'object',
      name,
      concept_ref: 'demo.RunOptions',
      fields: [{ kind: 'text', name: 'tone', required: false }],
    }),
  ],
  [
    NAMED,
    (name) => ({
      ...WIRE_PLAIN,
      kind: 'object',
      name,
      concept_ref: 'demo.Named',
      fields: [{ kind: 'text', name: 'constructor', required: true }],
    }),
  ],
]);

/** The render tree for a case's inputs: the wire descriptor mapped over them. */
function fieldsOf(inputs: Record<string, PipeInputContract>): RunField[] {
  return buildRunFields(
    { fields: Object.entries(inputs).map(([name, input]) => WIRE.get(input)!(name)) },
    inputs,
  );
}

const contractOf = (inputs: Record<string, PipeInputContract>): PipeIOContract => ({
  inputs,
  output: { concept_ref: 'native.Text', ...SINGLE_OUTPUT },
});

/** `{a:{a:{a:…{a:1}}}}`, `levels` deep. */
function deepValue(levels: number): unknown {
  return JSON.parse('{"a":'.repeat(levels) + '1' + '}'.repeat(levels));
}

describe('a value deeper than any structure the method could declare', () => {
  it('answers instead of overflowing the stack', () => {
    // The reported repro: 5000 levels threw `RangeError` out of the middle of a
    // host's server gate - a gate whose contract is that it returns a verdict.
    expect(() => isFilled(deepValue(5000))).not.toThrow();
    expect(() => isFilled(deepValue(20000))).not.toThrow();
  });

  it('does not count as content, so it cannot manufacture filledness', () => {
    // Past the cap the walk cannot tell whether anything is down there, and an
    // unanswerable absence fails closed everywhere in this package.
    expect(isFilled(deepValue(5000))).toBe(false);
    expect(isFilled(deepValue(3))).toBe(true);
  });

  it('loses only its own vote - a real value beside it still reads filled', () => {
    expect(isFilled({ junk: deepValue(5000), text: 'hello' })).toBe(true);
  });

  it('is refused by BOTH halves when it is all the input holds', () => {
    // `RunOptions` demands no child, so ajv accepts `{junk: …}` outright and the
    // emptiness rule is the only thing standing between this payload and a run.
    const inputs = { opts: OPTS };
    const values = { opts: { junk: deepValue(5000) } };

    expect(computeReadiness(fieldsOf(inputs), values).missing).toEqual(['opts']);

    const gate = gateRunInputs(contractOf(inputs), values);
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.missingInputs).toEqual(['opts']);
  });

  it('reaches the walk at all because the schema is no bound on it', () => {
    // `pruneEmptyOptionals` copies a property the schema does not declare
    // straight through, which is why an undeclared key ajv never walks still
    // arrives here. If that ever changes, this test should be the one to say so.
    const gate = gateRunInputs(contractOf({ text: TEXT }), {
      text: { text: 'hello', junk: deepValue(5000) },
    });
    expect(gate.ok).toBe(true);
    if (gate.ok) {
      expect((gate.inputs.text as { content: Record<string, unknown> }).content).toHaveProperty(
        'junk',
      );
    }
  });
});

describe('a value that references itself', () => {
  it('terminates rather than recursing to the cap on every branch', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(isFilled(cyclic)).toBe(false);
  });

  it('still finds a real value beside the cycle', () => {
    const cyclic: Record<string, unknown> = { text: 'hi' };
    cyclic.self = cyclic;
    expect(isFilled(cyclic)).toBe(true);
  });

  it('walks a repeatedly-shared subtree once, not once per path', () => {
    // Forty levels, each holding the SAME next node twice. Re-walking every
    // path is 2^40 visits; the walk keeps what it has already judged empty, so
    // it is forty. Nothing is filled, so no `some` short-circuits it either.
    let node: Record<string, unknown> = { leaf: '' };
    for (let i = 0; i < 40; i += 1) node = { left: node, right: node };
    expect(isFilled(node)).toBe(false);
  });

  it('does not carry a CAPPED answer back to a shallower path', () => {
    // The memo's whole justification is that a `false` means "nothing down
    // there". Past the cap it means "could not look", and the two are not
    // interchangeable: this shared node answers `false` at the bottom of the
    // deep branch because its own child sits one level past the cap, and it is
    // plainly filled from the shallow one. Keyed on identity alone, whichever
    // branch ran first decided for both and a filled input read as empty.
    // 62 wrappers puts `shared` at depth 63 - inside the cap, so it is judged
    // and recorded - while its own content lands at 64 and is refused. That is
    // the only window where a recorded `false` is a lie about the value.
    const shared: Record<string, unknown> = { deeper: { text: 'hi' } };
    let chain: Record<string, unknown> = shared;
    for (let i = 0; i < 62; i += 1) chain = { next: chain };

    expect(isFilled({ deep: chain, shallow: shared })).toBe(true);
    // Order must not decide it either.
    expect(isFilled({ shallow: shared, deep: chain })).toBe(true);
    expect(isFilled(shared)).toBe(true);
  });
});

describe('a string of nothing but whitespace', () => {
  it.each([
    ['spaces', '   '],
    ['a tab', '\t'],
    ['a newline', '\n'],
    ['mixed blanks', ' \t\n '],
  ])('is not a value: %s', (_label, blank) => {
    expect(isFilled(blank)).toBe(false);
  });

  it('is a value once anything else is in it', () => {
    expect(isFilled(' a ')).toBe(true);
  });

  it('leaves a REQUIRED input missing on both halves', () => {
    // A content model carries no `minLength`, so ajv passes this and the
    // emptiness rule is what refuses it - on both sides, by name.
    const inputs = { text: TEXT };
    const fields = fieldsOf(inputs);
    const values = { text: '   ' };

    expect(computeReadiness(fields, values).missing).toEqual(['text']);

    const gate = gateRunInputs(contractOf(inputs), rjsfDataFromRunValues(values, fields));
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect(gate.missingInputs).toEqual(['text']);
  });

  it('makes a blank OPTIONAL input a real absence on the wire', () => {
    // Not a validation dodge: omitting it is what lets the method branch on the
    // absence, where `{text: "   "}` would look like a supplied value.
    const inputs = { text: TEXT, note: OPTIONAL_TEXT };
    const fields = fieldsOf(inputs);
    const values = { text: 'hi', note: '   ' };

    expect(computeReadiness(fields, values)).toEqual({ total: 1, ready: 1, missing: [] });

    const gate = gateRunInputs(contractOf(inputs), rjsfDataFromRunValues(values, fields));
    expect(gate.ok).toBe(true);
    if (gate.ok)
      expect(gate.inputs).toEqual({ text: { concept: 'native.Text', content: { text: 'hi' } } });
  });
});

describe('a name that collides with Object.prototype', () => {
  it('does not read a required input as filled', () => {
    // The bare index used to return the inherited `Object` constructor, which
    // `isFilled` had no branch for and therefore called filled: a live Run
    // button over an input holding nothing.
    const inputs = { constructor: TEXT };
    expect(computeReadiness(fieldsOf(inputs), {}).missing).toEqual(['constructor']);
  });

  it('is named as MISSING by the gate, not reported as a type error', () => {
    // ajv is no help here, and seeing why is what puts this bug at its real
    // size. Its `required` compiles to `data.constructor === undefined`, so it
    // reads the inherited function as a supplied value and passes - then its
    // TYPE check on that same function fails, and the caller is told a value
    // they never sent is of the wrong type. The run is refused either way; what
    // the own-read buys is that the scan names the input the caller actually
    // left out. (The half that was genuinely broken is readiness, above: there
    // nothing refused the run at all.)
    const gate = gateRunInputs(contractOf({ constructor: TEXT }), {});
    expect(gate.ok).toBe(false);
    if (!gate.ok) {
      expect(gate.missingInputs).toEqual(['constructor']);
      expect(gate.errors.map((e) => e.stack)).toEqual(["'constructor' must be object"]);
    }
  });

  it.each(['constructor', 'toString', 'valueOf', 'hasOwnProperty'])(
    'reads an empty input named %s as empty',
    (name) => {
      expect(computeReadiness(fieldsOf({ [name]: TEXT }), {}).missing).toEqual([name]);
    },
  );

  it('does not read a required CHILD as filled either', () => {
    const inputs = { opts: NAMED };
    const fields = fieldsOf(inputs);

    expect(computeReadiness(fields, { opts: { tone: 'formal' } }).missing).toEqual(['opts']);
    expect(computeReadiness(fields, { opts: { constructor: 'x' } }).missing).toEqual([]);
  });

  it('is not a value in the first place, whichever route it arrives by', () => {
    expect(isFilled(Object.prototype.constructor)).toBe(false);
    expect(isFilled(() => 'anything')).toBe(false);
  });

  it('does not make getPipeIOContract hand back a non-contract', () => {
    // A truthy non-contract sails straight through the `if (!contract)` guard
    // hosts are shown writing, so a pipe that does not exist renders as one
    // taking no inputs instead of reaching the host's not-found path.
    const contracts: PipeIOContracts = { 'demo.summarize': contractOf({ text: TEXT }) };

    expect(getPipeIOContract(contracts, 'demo', 'constructor')).toBeUndefined();
    expect(getPipeIOContract(contracts, null, 'toString')).toBeUndefined();
    expect(getPipeIOContract(contracts, 'demo', 'summarize')).toBe(contracts['demo.summarize']);
  });
});
