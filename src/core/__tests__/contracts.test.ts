import { describe, expect, it } from 'vitest';
import { buildPipeRef, getPipeIOContract, inputMustBeFilled, isPluralInput } from '..';
import type { PipeIOContract, PipeInputContract } from '..';

const CONTRACT: PipeIOContract = {
  inputs: {
    text: { concept_ref: 'native.Text', json_schema: { type: 'string' } },
  },
  output: { concept_ref: 'demo.Summary', multiplicity: 'single' },
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
      output: { concept_ref: 'demo.Summary', multiplicity: 'single' },
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
  concept_ref: 'native.Text',
  json_schema: { type: 'object', properties: { text: { type: 'string' } } },
};
const optional: PipeInputContract = { ...plain, optional: true };
const plural: PipeInputContract = {
  concept_ref: 'native.Image',
  json_schema: { type: 'array', items: { type: 'object' } },
};

describe('isPluralInput', () => {
  it('is true for an array-wrapped schema (Image[])', () => {
    expect(isPluralInput(plural)).toBe(true);
  });

  it('is false for a singular schema', () => {
    expect(isPluralInput(plain)).toBe(false);
  });

  it('is false when the schema is missing entirely', () => {
    expect(isPluralInput({ concept_ref: 'native.Text', json_schema: {} })).toBe(false);
  });
});

describe('inputMustBeFilled', () => {
  it('demands a plain input - that is what the Run gate is for', () => {
    expect(inputMustBeFilled(plain)).toBe(true);
  });

  it('never demands an optional (`?`) input', () => {
    expect(inputMustBeFilled(optional)).toBe(false);
  });

  it('never demands a plural input - the empty list is a real value', () => {
    expect(inputMustBeFilled(plural)).toBe(false);
  });

  it('treats a missing `optional` flag as required, not optional', () => {
    // Contracts from an older validate response carry no flag at all; the gate
    // must fall back to "required" rather than silently letting a run through.
    expect(inputMustBeFilled({ concept_ref: 'native.Text', json_schema: {} })).toBe(true);
  });

  it('does not treat `optional: false` as optional', () => {
    expect(inputMustBeFilled({ ...plain, optional: false })).toBe(true);
  });
});
