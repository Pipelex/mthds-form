/**
 * CHARACTERIZATION - the divergent behaviors of the duplicated schema helpers,
 * pinned BEFORE they were consolidated into one `schema-utils` module. Module
 * names below are the pre-consolidation originals; docs/derivation-swap.md
 * explains why the divergence is preserved.
 *
 * Two `anyOf` collapses exist and their semantics differ in load-bearing ways:
 *   - `field-model.ts` `collapseNullable` (private, observed via `buildRunFields`)
 *     collapses ONLY when exactly one non-null branch remains, and DROPS the
 *     null branch entirely.
 *   - `normalize-schema.ts` `flattenAnyOf` (observed via `normalizeSchemaForRjsf`)
 *     turns a union of simple primitives into a `type` ARRAY (null preserved as
 *     a type entry), and only falls back to null-dropping for 2-branch
 *     non-primitive unions.
 *
 * Three `$defs` walkers exist and disagree on ARRAY traversal:
 *   - `field-model.ts` `collectDefs` walks into arrays (anyOf branches, items
 *     tuples), so a def declared inside an `anyOf` branch still resolves.
 *   - `normalize-schema.ts` `walkAndCollectDefs` (via `hoistDefsToRoot`) also
 *     walks arrays, and additionally STRIPS the nested `$defs` and hoists them.
 *   - `input-format.ts` `collectSchemaDefs` (observed via `healStringWrappers`)
 *     SKIPS arrays entirely, so the same def is invisible to the heal path.
 *
 * These tests state today's behavior exactly. After consolidation they must
 * still pass unchanged - the consolidated module keeps each call path's
 * observable behavior via explicit modes.
 */
import { describe, expect, it } from 'vitest';
import { buildRunFields, healStringWrappers, hoistDefsToRoot, normalizeSchemaForRjsf } from '..';
import type { PipeInputContract } from '..';
import { PLAIN_SINGLE } from './contract-fixtures';

/** A non-native concept, so `buildRunFields` dispatches on the SCHEMA alone. */
function customInput(json_schema: Record<string, unknown>): Record<string, PipeInputContract> {
  return { value: { ...PLAIN_SINGLE, concept_ref: 'demo.Custom', json_schema } };
}

describe('anyOf collapse divergence: primitive unions', () => {
  const PRIMITIVE_UNION = { anyOf: [{ type: 'string' }, { type: 'integer' }] };

  it('normalize-schema flattens a primitive union to a type ARRAY', () => {
    expect(normalizeSchemaForRjsf(PRIMITIVE_UNION)).toEqual({ type: ['string', 'integer'] });
  });

  it('field-model does NOT collapse a primitive union - the field maps to `unknown`', () => {
    // `collapseNullable` bails when more than one non-null branch remains, so
    // the schema keeps its `anyOf`, `schemaType` finds no `type`, and the field
    // lands in the raw-JSON escape hatch. Same input, two verdicts.
    const [field] = buildRunFields(customInput(PRIMITIVE_UNION));
    expect(field!.kind).toBe('unknown');
  });

  it('normalize-schema keeps the null branch as a TYPE entry in the array', () => {
    expect(normalizeSchemaForRjsf({ anyOf: [{ type: 'string' }, { type: 'null' }] })).toEqual({
      type: ['string', 'null'],
    });
  });

  it('field-model DROPS the null branch entirely for the same nullable primitive', () => {
    // One non-null branch → collapse; the schema becomes `{type: 'string'}`
    // with no trace of nullability, and the field maps as plain text.
    const [field] = buildRunFields(customInput({ anyOf: [{ type: 'string' }, { type: 'null' }] }));
    expect(field!.kind).toBe('text');
  });
});

describe('anyOf collapse divergence: edge shapes', () => {
  it('normalize-schema flattens a SINGLE-branch primitive anyOf to a one-entry type array', () => {
    expect(normalizeSchemaForRjsf({ anyOf: [{ type: 'string' }] })).toEqual({ type: ['string'] });
  });

  it('field-model collapses a single-branch anyOf to the branch itself', () => {
    const [field] = buildRunFields(customInput({ anyOf: [{ type: 'string' }] }));
    expect(field!.kind).toBe('text');
  });

  it('normalize-schema flattens a 3-branch all-primitive union (null included) to a type array', () => {
    expect(
      normalizeSchemaForRjsf({
        anyOf: [{ type: 'string' }, { type: 'integer' }, { type: 'null' }],
      }),
    ).toEqual({ type: ['string', 'integer', 'null'] });
  });

  it('normalize-schema leaves a 3-branch union with a constrained member UNCHANGED', () => {
    // Not all-primitive (maxLength is a constraint) and not 2 branches: neither
    // flatten case applies. Only the recursive normalization of each branch runs.
    const schema = {
      anyOf: [{ type: 'string', maxLength: 5 }, { type: 'integer' }, { type: 'null' }],
    };
    expect(normalizeSchemaForRjsf(schema)).toEqual(schema);
  });

  it('field-model leaves a 3-branch union uncollapsed - the field maps to `unknown`', () => {
    const [field] = buildRunFields(
      customInput({
        anyOf: [{ type: 'string', maxLength: 5 }, { type: 'integer' }, { type: 'null' }],
      }),
    );
    expect(field!.kind).toBe('unknown');
  });

  it('both collapses MERGE the surviving branch over the outer schema', () => {
    // Constraints riding on the non-null branch survive the collapse.
    const nullableConstrained = {
      description: 'outer',
      anyOf: [{ type: 'integer', maximum: 10 }, { type: 'null' }],
    };
    expect(normalizeSchemaForRjsf(nullableConstrained)).toEqual({
      description: 'outer',
      type: 'integer',
      maximum: 10,
    });
    const [field] = buildRunFields(customInput(nullableConstrained));
    expect(field).toMatchObject({ kind: 'number', integer: true, max: 10, description: 'outer' });
  });
});

/**
 * A `$defs` map declared INSIDE an `anyOf` branch (a JSON array element). The
 * `status` property references it from outside - resolvable only by a walker
 * that traverses arrays.
 */
const DEFS_IN_ANYOF_BRANCH = {
  type: 'object',
  properties: {
    status: { $ref: '#/$defs/Status' },
    other: {
      anyOf: [
        { type: 'string', $defs: { Status: { type: 'string', enum: ['open', 'closed'] } } },
        { type: 'null' },
      ],
    },
  },
  required: ['status'],
};

describe('$defs walker divergence: defs declared inside array elements', () => {
  it('field-model collectDefs traverses arrays - the $ref resolves and the enum renders', () => {
    const [field] = buildRunFields(customInput(DEFS_IN_ANYOF_BRANCH));
    expect(field!.kind).toBe('object');
    const statusField = (field as { fields: { name: string; kind: string }[] }).fields.find(
      (f) => f.name === 'status',
    );
    expect(statusField).toMatchObject({ kind: 'enum', options: ['open', 'closed'] });
  });

  it('input-format collectSchemaDefs SKIPS arrays - the heal path cannot resolve the $ref', () => {
    // The wrapped value stays wrapped: with the def invisible, the $ref does not
    // resolve, the property's type is unknown, and the value passes through.
    const value = { status: { text: 'open' } };
    expect(healStringWrappers(value, DEFS_IN_ANYOF_BRANCH)).toEqual(value);
  });

  it('input-format collectSchemaDefs DOES find the same def at the schema root', () => {
    // The contrast that makes the divergence visible: move the identical def to
    // the root `$defs` and the heal fires.
    const rootDefsSchema = {
      type: 'object',
      properties: { status: { $ref: '#/$defs/Status' } },
      $defs: { Status: { type: 'string', enum: ['open', 'closed'] } },
    };
    expect(healStringWrappers({ status: { text: 'open' } }, rootDefsSchema)).toEqual({
      status: 'open',
    });
  });

  it('normalize-schema hoistDefsToRoot traverses arrays - the nested def is hoisted and stripped', () => {
    const hoisted = hoistDefsToRoot(DEFS_IN_ANYOF_BRANCH);
    expect(hoisted.$defs).toEqual({ Status: { type: 'string', enum: ['open', 'closed'] } });
    const other = (hoisted.properties as Record<string, Record<string, unknown>>).other!;
    const branches = other.anyOf as Record<string, unknown>[];
    expect(branches[0]).toEqual({ type: 'string' });
  });
});
