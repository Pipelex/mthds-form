import { describe, expect, it } from 'vitest';
import {
  buildPipeRef,
  getPipeIOContract,
  inputMustBeFilled,
  isFixedCountInput,
  isOptionalInput,
  isPluralInput,
} from '..';
import type { PipeIOContract, PipeInputContract } from '..';
import {
  FORCE_SINGLE,
  OPTIONAL_SINGLE,
  PLAIN_SINGLE,
  PLAIN_VARIABLE,
  SINGLE_OUTPUT,
  plainFixed,
} from './contract-fixtures';

const CONTRACT: PipeIOContract = {
  inputs: {
    text: { ...PLAIN_SINGLE, concept_ref: 'native.Text', json_schema: { type: 'string' } },
  },
  output: { concept_ref: 'demo.Summary', ...SINGLE_OUTPUT },
};

describe('buildPipeRef', () => {
  it('joins domain and pipe code with a dot', () => {
    expect(buildPipeRef('demo', 'summarize')).toBe('demo.summarize');
  });
});

describe('getPipeIOContract', () => {
  const domain = 'demo';

  it('finds an entry keyed by namespaced pipe_ref from a bare pipe code', () => {
    const ioContracts = { 'demo.summarize': CONTRACT };
    expect(getPipeIOContract(ioContracts, domain, 'summarize')).toBe(CONTRACT);
  });

  it('falls back to a bare pipe-code key (the hosted /validate keys pipe_structures bare)', () => {
    const bareKeyed = { summarize: CONTRACT };
    expect(getPipeIOContract(bareKeyed, domain, 'summarize')).toBe(CONTRACT);
  });

  it('resolves a bare key even without a domain', () => {
    const bareKeyed = { summarize: CONTRACT };
    expect(getPipeIOContract(bareKeyed, null, 'summarize')).toBe(CONTRACT);
  });

  it('prefers the namespaced pipe_ref over a bare-code collision', () => {
    const bare: PipeIOContract = {
      inputs: {},
      output: { concept_ref: 'demo.Summary', ...SINGLE_OUTPUT },
    };
    const both = { 'demo.summarize': CONTRACT, summarize: bare };
    expect(getPipeIOContract(both, domain, 'summarize')).toBe(CONTRACT);
  });

  it('returns undefined when the map, domain, or code is missing', () => {
    expect(getPipeIOContract(undefined, domain, 'summarize')).toBeUndefined();
    expect(getPipeIOContract({}, null, 'summarize')).toBeUndefined();
    expect(getPipeIOContract({}, domain, '')).toBeUndefined();
  });
});

// ─── Which inputs the Run gate may demand ────────────────────────────────────

const plain: PipeInputContract = {
  ...PLAIN_SINGLE,
  concept_ref: 'native.Text',
  json_schema: { type: 'object', properties: { text: { type: 'string' } } },
};
const optional: PipeInputContract = { ...plain, ...OPTIONAL_SINGLE };
const forced: PipeInputContract = { ...plain, ...FORCE_SINGLE };
const plural: PipeInputContract = {
  ...PLAIN_VARIABLE,
  concept_ref: 'native.Image',
  json_schema: { type: 'array', items: { type: 'object' } },
};
/** `Image[3]`: pipelex states the count twice - as `item_count` on the contract
 *  and as `minItems`/`maxItems` on the array wrapper it renders. */
const fixedPlural: PipeInputContract = {
  ...plural,
  ...plainFixed(3),
  json_schema: { type: 'array', items: { type: 'object' }, minItems: 3, maxItems: 3 },
};

describe('isOptionalInput', () => {
  it('is true only for the `optional` (`?`) marker', () => {
    expect(isOptionalInput(optional)).toBe(true);
    expect(isOptionalInput(plain)).toBe(false);
  });

  it('reads a force (`!`) input as NOT optional - it must still be supplied', () => {
    expect(isOptionalInput(forced)).toBe(false);
  });
});

describe('isPluralInput', () => {
  it('is true for an array-wrapped schema (Image[])', () => {
    expect(isPluralInput(plural)).toBe(true);
  });

  it('is true for a fixed-count list (Image[3]) - it is an array wrapper too', () => {
    expect(isPluralInput(fixedPlural)).toBe(true);
  });

  it('is false for a singular schema', () => {
    expect(isPluralInput(plain)).toBe(false);
  });

  it('is false when the schema is missing entirely', () => {
    expect(isPluralInput({ ...PLAIN_SINGLE, concept_ref: 'native.Text', json_schema: {} })).toBe(
      false,
    );
  });
});

describe('isFixedCountInput', () => {
  it('is true for a fixed-count list, which carries its count in `item_count`', () => {
    expect(isFixedCountInput(fixedPlural)).toBe(true);
    expect(fixedPlural.item_count).toBe(3);
  });

  it('is false for a variable list, which carries no count', () => {
    expect(isFixedCountInput(plural)).toBe(false);
    expect(plural.item_count).toBeNull();
  });

  it('is false for a single input', () => {
    expect(isFixedCountInput(plain)).toBe(false);
  });
});

describe('inputMustBeFilled', () => {
  it('demands a plain input - that is what the Run gate is for', () => {
    expect(inputMustBeFilled(plain)).toBe(true);
  });

  it('demands a force (`!`) input exactly as it demands a plain one', () => {
    // `!` is an authored assertion that the value IS there, not a licence to
    // omit it. Flattening it onto the optional arm would let a run start with
    // the one input the method asserted hardest about missing.
    expect(inputMustBeFilled(forced)).toBe(true);
  });

  it('never demands an optional (`?`) input', () => {
    expect(inputMustBeFilled(optional)).toBe(false);
  });

  it('never demands a variable-length plural input - the empty list is a real value', () => {
    expect(inputMustBeFilled(plural)).toBe(false);
  });

  it('DOES demand a fixed-count list - the method ruled the empty form out', () => {
    // `Concept[N]` is the one plural the language can say "not empty" about, so
    // gating on it invents nothing. Left ungated it would also slip past ajv:
    // an absent property is simply not validated, and the run would go out
    // without the input at all.
    expect(inputMustBeFilled(fixedPlural)).toBe(true);
  });

  it('never demands an optional plural, even though no method can declare one', () => {
    // `Concept[]?` is invalid MTHDS - a presence marker may not be combined
    // with a multiplicity suffix - and the standard's types reject it, which is
    // what the cast is admitting. The row stays because the kernel does not
    // parse-check what an API hands it: a producer that emitted the combination
    // anyway must not come out gating, since either half of the declaration
    // says on its own that it does not.
    const optionalPlural = { ...plural, presence: 'optional' } as unknown as PipeInputContract;
    expect(inputMustBeFilled(optionalPlural)).toBe(false);
  });

  it('treats an unstated presence as required, not optional', () => {
    // A contract from before the reshape carries no `presence` at all; the gate
    // must fall back to "required" rather than silently letting a run through.
    const unstated = { concept_ref: 'native.Text', json_schema: {} } as unknown;
    expect(inputMustBeFilled(unstated as PipeInputContract)).toBe(true);
  });
});
