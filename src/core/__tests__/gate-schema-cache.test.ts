/**
 * The gate compiles one schema per contract, and this file is where that is
 * actually observed.
 *
 * ajv keys its compiled-schema cache on schema object IDENTITY and never
 * evicts, so a gate that rebuilt `buildRunInputsSchema` per call would retain a
 * compiled validator per REQUEST - on a public endpoint, unbounded growth
 * driven by the cheapest possible body. The claim is therefore about object
 * identity, not about verdicts: gating fifty times and asserting fifty correct
 * answers passes just as happily against a per-request implementation, which is
 * exactly what the case that used to stand here did.
 *
 * So the validator module is mocked to record the schema object it is handed.
 * That is the seam the cache is visible at and the only one - `SCHEMA_CACHE` is
 * module-private and must stay that way, because a cache a consumer can reach
 * is a cache a consumer can invalidate.
 */
import { describe, expect, it, vi } from 'vitest';

const validateSpy = vi.hoisted(() => vi.fn<(data: unknown, schema: object) => unknown[]>(() => []));

vi.mock('../gate-validator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../gate-validator')>();
  validateSpy.mockImplementation(actual.validateRunInputsSchema);
  return { ...actual, validateRunInputsSchema: validateSpy };
});

const { gateRunInputs } = await import('../gate');
const { PLAIN_SINGLE } = await import('./contract-fixtures');
type PipeIOContract = import('../contracts').PipeIOContract;

const textSchema = {
  title: 'TextContent',
  type: 'object',
  properties: { text: { type: 'string' } },
  required: ['text'],
};

function contractOf(): PipeIOContract {
  return {
    inputs: { text: { concept_ref: 'native.Text', json_schema: textSchema, ...PLAIN_SINGLE } },
    output: {
      concept_ref: 'native.Text',
      multiplicity: 'single',
      item_count: null,
      optional: false,
      json_schema: { type: 'object', properties: { text: { type: 'string' } } },
    },
  };
}

describe('the gate’s schema cache', () => {
  it('hands ajv the same schema object on every run of one contract', () => {
    validateSpy.mockClear();
    const contract = contractOf();

    for (let i = 0; i < 5; i++) gateRunInputs(contract, { text: { text: 'hi' } });

    const schemas = validateSpy.mock.calls.map(([, schema]) => schema);
    expect(schemas).toHaveLength(5);
    expect(new Set(schemas).size).toBe(1);
  });

  it('builds a distinct schema per contract, so one contract cannot poison another', () => {
    validateSpy.mockClear();
    const first = contractOf();
    const second = contractOf();

    gateRunInputs(first, { text: { text: 'hi' } });
    gateRunInputs(second, { text: { text: 'hi' } });

    const schemas = validateSpy.mock.calls.map(([, schema]) => schema);
    expect(new Set(schemas).size).toBe(2);
  });
});
