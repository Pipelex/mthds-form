/**
 * CHARACTERIZATION - the divergent behaviors of the duplicated schema helpers,
 * pinned when they were consolidated into one `schema-utils` module.
 *
 * Two `anyOf` collapses exist and their semantics differ in load-bearing ways:
 *   - `collapseNullable` collapses ONLY when exactly one non-null branch
 *     remains, and DROPS the null branch entirely. It survives the derivation
 *     swap as the resolver the schema CO-WALK uses (`buildRunFields`'s
 *     contentKey and list bounds, the gate's own structural tree) - the field
 *     KIND it used to feed is the wire's business now.
 *   - `flattenAnyOf` (observed via `normalizeSchemaForRjsf`) turns a union of
 *     simple primitives into a `type` ARRAY (null preserved as a type entry),
 *     and only falls back to null-dropping for 2-branch non-primitive unions.
 *
 * The `$defs` walkers disagree on ARRAY traversal, by explicit mode:
 *   - `collectSchemaDefs` with `traverseArrays: true` (the co-walk's and the
 *     gate's mode) walks into anyOf branches and items tuples, so a def
 *     declared inside one still resolves.
 *   - `collectSchemaDefs` with `traverseArrays: false` (the heal path's
 *     historical mode, via `healStringWrappers`) SKIPS arrays entirely, so the
 *     same def is invisible to healing.
 *   - `hoistDefsToRoot` (normalize-schema) also walks arrays, and additionally
 *     STRIPS the nested `$defs` and hoists them.
 *
 * These tests state the behavior exactly; a caller-visible change here is a
 * behavior change in every consumer at once.
 */
import { describe, expect, it } from 'vitest';
import {
  collapseNullable,
  collectSchemaDefs,
  derefSchema,
  healStringWrappers,
  hoistDefsToRoot,
  normalizeSchemaForRjsf,
  type JsonSchema,
} from '..';

describe('anyOf collapse divergence: primitive unions', () => {
  const PRIMITIVE_UNION = { anyOf: [{ type: 'string' }, { type: 'integer' }] };

  it('normalize-schema flattens a primitive union to a type ARRAY', () => {
    expect(normalizeSchemaForRjsf(PRIMITIVE_UNION)).toEqual({ type: ['string', 'integer'] });
  });

  it('collapseNullable does NOT collapse a primitive union - the anyOf survives', () => {
    // More than one non-null branch remains, so the schema keeps its `anyOf`
    // and states no `type` - which is why such a slot reaches the descriptor
    // as the engine's `unknown` kind, the raw-JSON escape hatch.
    expect(collapseNullable(PRIMITIVE_UNION)).toBe(PRIMITIVE_UNION);
  });

  it('normalize-schema keeps the null branch as a TYPE entry in the array', () => {
    expect(normalizeSchemaForRjsf({ anyOf: [{ type: 'string' }, { type: 'null' }] })).toEqual({
      type: ['string', 'null'],
    });
  });

  it('collapseNullable DROPS the null branch entirely for the same nullable primitive', () => {
    expect(collapseNullable({ anyOf: [{ type: 'string' }, { type: 'null' }] })).toEqual({
      type: 'string',
    });
  });
});

describe('anyOf collapse divergence: edge shapes', () => {
  it('normalize-schema flattens a SINGLE-branch primitive anyOf to a one-entry type array', () => {
    expect(normalizeSchemaForRjsf({ anyOf: [{ type: 'string' }] })).toEqual({ type: ['string'] });
  });

  it('collapseNullable collapses a single-branch anyOf to the branch itself', () => {
    expect(collapseNullable({ anyOf: [{ type: 'string' }] })).toEqual({ type: 'string' });
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

  it('collapseNullable leaves a 3-branch union uncollapsed', () => {
    const schema = {
      anyOf: [{ type: 'string', maxLength: 5 }, { type: 'integer' }, { type: 'null' }],
    };
    expect(collapseNullable(schema)).toBe(schema);
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
    expect(collapseNullable(nullableConstrained)).toEqual({
      description: 'outer',
      type: 'integer',
      maximum: 10,
    });
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
  it('the array-traversing mode finds the def, so the $ref resolves', () => {
    const defs: Record<string, JsonSchema> = {};
    collectSchemaDefs(DEFS_IN_ANYOF_BRANCH, defs, { traverseArrays: true });
    expect(defs['Status']).toEqual({ type: 'string', enum: ['open', 'closed'] });

    const status = (DEFS_IN_ANYOF_BRANCH.properties as Record<string, JsonSchema>)['status']!;
    expect(derefSchema(status, defs)).toEqual({ type: 'string', enum: ['open', 'closed'] });
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
