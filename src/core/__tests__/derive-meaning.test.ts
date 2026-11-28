/** The MTHDS `9.2.0` facts `buildRunFields` carries onto a field, structurally. */
import { describe, expect, it } from 'vitest';
import type { PipeInputContract } from '..';
import { buildRunFields } from '..';
import { PLAIN_SINGLE, WIRE_PLAIN } from './contract-fixtures';

const contract = (schema: Record<string, unknown>): PipeInputContract => ({
  ...PLAIN_SINGLE,
  concept_ref: 'demo.Thing',
  json_schema: schema,
});

describe('buildRunFields carries the meaning facts', () => {
  it('carries a number’s unit, aggregate and exclusive bounds', () => {
    const [field] = buildRunFields(
      {
        fields: [
          {
            ...WIRE_PLAIN,
            kind: 'number',
            name: 'price',
            concept_ref: 'native.Number',
            integer: false,
            unit: 'EUR',
            aggregate: 'sum',
            exclusive_minimum: 0,
            exclusive_maximum: 100,
          },
        ],
      },
      {
        price: contract({
          type: 'object',
          properties: { number: { type: 'number' } },
          required: ['number'],
        }),
      },
    );
    expect(field).toMatchObject({
      kind: 'number',
      unit: 'EUR',
      aggregate: 'sum',
      exclusiveMin: 0,
      exclusiveMax: 100,
    });
  });

  it('carries described options one per choice, and drops a list that does not line up', () => {
    const schema = contract({ type: 'string', enum: ['a', 'b'] });
    const options = [
      { value: 'a', label: 'Alpha', tone: 'positive' as const },
      { value: 'b', description: 'The second.' },
    ];
    const [aligned] = buildRunFields(
      {
        fields: [
          {
            ...WIRE_PLAIN,
            kind: 'enum',
            name: 'pick',
            concept_ref: 'demo.Thing',
            choices: ['a', 'b'],
            options,
          },
        ],
      },
      { pick: schema },
    );
    expect(aligned).toMatchObject({ kind: 'enum', optionDetails: options });
    const [short] = buildRunFields(
      {
        fields: [
          {
            ...WIRE_PLAIN,
            kind: 'enum',
            name: 'pick',
            concept_ref: 'demo.Thing',
            choices: ['a', 'b'],
            options: options.slice(0, 1),
          },
        ],
      },
      { pick: schema },
    );
    expect(short).not.toHaveProperty('optionDetails');
  });
});
