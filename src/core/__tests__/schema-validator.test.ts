/**
 * The gate's interpreter answers what ajv answered.
 *
 * The run gate used to validate through ajv, and hosts and people read its
 * verdict: the error's keyword, path, params and English, the order the errors
 * come in, and the value as coerced in place. `ajv-verdicts.ts` is ajv's own
 * answer on a table of targeted cases, captured from the ajv instance the gate
 * ran with, so every row here holds the interpreter to the validator it
 * replaced - errors and coerced data alike. Before the swap the interpreter was
 * also checked against a live ajv over the story fixtures' contracts and
 * randomly mutated payloads; this table is the part of that check that stays.
 */
import { describe, expect, it } from 'vitest';
import { validateWithSchema } from '../schema-validator';
import { AJV_REFUSALS, AJV_VERDICTS } from './ajv-verdicts';

function strip(errors: ReturnType<typeof validateWithSchema>) {
  return errors.map(({ keyword, instancePath, schemaPath, params, message }) => ({
    keyword,
    instancePath,
    schemaPath,
    params,
    message,
  }));
}

describe('the gate validator matches ajv', () => {
  for (const row of AJV_VERDICTS) {
    it(row.name, () => {
      const data = structuredClone(row.data);
      const errors = validateWithSchema(structuredClone(row.schema) as object, data);
      expect(strip(errors)).toEqual(row.errors);
      // The coercion is part of the verdict: the value is rewritten in place.
      expect(data).toEqual(row.after);
    });
  }
});

describe('the gate validator refuses the schemas ajv refused', () => {
  for (const row of AJV_REFUSALS) {
    it(row.name, () => {
      expect(() => validateWithSchema(structuredClone(row.schema) as object, {})).toThrow(
        row.message ?? undefined,
      );
    });
  }

  it('remembers the verdict on a schema object rather than re-checking it', () => {
    const schema = { type: 'object', properties: { a: { $ref: '#/$defs/Missing' } } };
    expect(() => validateWithSchema(schema, {})).toThrow("can't resolve reference");
    expect(() => validateWithSchema(schema, {})).toThrow("can't resolve reference");
  });
});

describe('the parent schema an error carries', () => {
  it('is the schema object holding the failing keyword, which the gate reads a title from', () => {
    const date = { type: 'string', format: 'date', title: 'Date' };
    const schema = {
      type: 'object',
      properties: { quote_date: { type: 'object', properties: { date } } },
    };
    const [error] = validateWithSchema(schema, { quote_date: { date: 'tomorrow' } });
    expect(error?.parentSchema).toBe(date);
  });
});

/**
 * The `$schema` a schema declares, as ajv@8 read it - checked against the real
 * ajv in review: an absent or empty value, draft-07's id with or without a
 * trailing `#` or `#/`, and the `http://json-schema.org/schema` alias are
 * draft-07 and checked against its meta-schema; every other dialect is refused,
 * so a schema is never judged by keywords other than the ones it was written in.
 */
describe('the dialect a schema declares', () => {
  const malformed = { type: 'object', required: ['a', 'a'] };

  for (const declared of [
    '',
    'http://json-schema.org/draft-07/schema',
    'http://json-schema.org/draft-07/schema#',
    'http://json-schema.org/draft-07/schema#/',
    'http://json-schema.org/schema',
    'http://json-schema.org/schema#',
  ]) {
    it(`reads ${JSON.stringify(declared)} as draft-07 and checks the schema against it`, () => {
      expect(() => validateWithSchema({ $schema: declared, ...malformed }, {})).toThrow(
        'schema is invalid: data/required must NOT have duplicate items (items ## 1 and 0 are identical)',
      );
      expect(validateWithSchema({ $schema: declared, type: 'object' }, {})).toEqual([]);
    });
  }

  for (const declared of [
    'https://json-schema.org/draft-07/schema',
    'https://json-schema.org/draft/2020-12/schema',
    'https://json-schema.org/draft/2019-09/schema',
    'http://json-schema.org/draft-04/schema#',
    'http://example.com/unknown',
  ]) {
    it(`refuses ${declared}, whose keywords it does not know`, () => {
      expect(() => validateWithSchema({ $schema: declared, type: 'object' }, {})).toThrow(
        `no schema with key or ref "${declared}"`,
      );
    });
  }
});

describe('an $id below the root', () => {
  it('is refused, since a reference inside it would resolve against the wrong base', () => {
    const schema = {
      definitions: { x: { type: 'string' } },
      properties: {
        a: {
          $id: 'http://example.com/sub.json',
          definitions: { x: { type: 'number' } },
          properties: { b: { $ref: '#/definitions/x' } },
        },
      },
    };
    expect(() => validateWithSchema(schema, { a: { b: 'hello' } })).toThrow(
      'NOT SUPPORTED: "$id" below the root schema',
    );
  });

  it('is allowed at the root, where references resolve against the root anyway', () => {
    const schema = {
      $id: 'http://example.com/root.json',
      definitions: { n: { type: 'number' } },
      properties: { a: { $ref: '#/definitions/n' } },
    };
    expect(strip(validateWithSchema(schema, { a: 'x' }))).toEqual([
      {
        keyword: 'type',
        instancePath: '/a',
        schemaPath: '#/definitions/n/type',
        params: { type: 'number' },
        message: 'must be number',
      },
    ]);
  });
});
