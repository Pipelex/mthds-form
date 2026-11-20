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
