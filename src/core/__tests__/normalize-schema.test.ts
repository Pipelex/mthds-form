import { describe, it, expect } from 'vitest';
import { hoistDefsToRoot, normalizeSchemaForRjsf, prepareSchemaForRjsf } from '..';

describe('normalizeSchemaForRjsf', () => {
  it('flattens anyOf with string and null to type array', () => {
    const schema = {
      anyOf: [{ type: 'string' }, { type: 'null' }],
      title: 'My Field',
    };
    expect(normalizeSchemaForRjsf(schema)).toEqual({
      type: ['string', 'null'],
      title: 'My Field',
    });
  });

  it('flattens anyOf with integer and null', () => {
    const schema = {
      anyOf: [{ type: 'integer' }, { type: 'null' }],
      default: null,
    };
    expect(normalizeSchemaForRjsf(schema)).toEqual({
      type: ['integer', 'null'],
      default: null,
    });
  });

  it('preserves default from anyOf branch', () => {
    const schema = {
      anyOf: [{ type: 'string', default: 'hello' }, { type: 'null' }],
    };
    const result = normalizeSchemaForRjsf(schema);
    expect(result.type).toEqual(['string', 'null']);
    expect(result.default).toBe('hello');
  });

  it('flattens nullable string with constraints by dropping null branch', () => {
    const schema = {
      anyOf: [{ type: 'string', maxLength: 10 }, { type: 'null' }],
    };
    expect(normalizeSchemaForRjsf(schema)).toEqual({ type: 'string', maxLength: 10 });
  });

  it('flattens nullable $ref by dropping null branch', () => {
    const schema = {
      anyOf: [{ $ref: '#/$defs/SubModel' }, { type: 'null' }],
    };
    expect(normalizeSchemaForRjsf(schema)).toEqual({ $ref: '#/$defs/SubModel' });
  });

  it('flattens nullable array by dropping null branch', () => {
    const schema = {
      anyOf: [{ type: 'array', items: { type: 'string' } }, { type: 'null' }],
    };
    expect(normalizeSchemaForRjsf(schema)).toEqual({
      type: 'array',
      items: { type: 'string' },
    });
  });

  it('flattens nullable object by dropping null branch', () => {
    const schema = {
      anyOf: [{ type: 'object', properties: {} }, { type: 'null' }],
    };
    expect(normalizeSchemaForRjsf(schema)).toEqual({ type: 'object', properties: {} });
  });

  it('recurses into properties', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
      },
    };
    const result = normalizeSchemaForRjsf(schema);
    expect((result.properties as Record<string, unknown>).name).toEqual({ type: 'string' });
    expect((result.properties as Record<string, unknown>).age).toEqual({
      type: ['integer', 'null'],
    });
  });

  it('recurses into array items', () => {
    const schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          value: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        },
      },
    };
    const result = normalizeSchemaForRjsf(schema);
    const items = result.items as Record<string, unknown>;
    const props = items.properties as Record<string, unknown>;
    expect(props.value).toEqual({ type: ['string', 'null'] });
  });

  it('handles a full Pydantic-style schema (RecruiterBrief example)', () => {
    const schema = {
      type: 'object',
      properties: {
        fit: {
          anyOf: [{ type: 'string' }, { type: 'null' }],
          description: 'Personality or culture fit profile',
          title: 'Fit',
        },
        soft_skills: {
          anyOf: [{ type: 'string' }, { type: 'null' }],
          description: 'Soft skill requirements',
          title: 'Soft Skills',
        },
        text: {
          anyOf: [{ type: 'string' }, { type: 'null' }],
          description: 'Free-text notes from the recruiter',
          title: 'Text',
        },
      },
      required: ['fit'],
      title: 'RecruiterBrief',
    };
    const result = normalizeSchemaForRjsf(schema);
    const props = result.properties as Record<string, Record<string, unknown>>;
    expect(props['fit']!.type).toEqual(['string', 'null']);
    expect(props['fit']!.description).toBe('Personality or culture fit profile');
    expect(props['soft_skills']!.type).toEqual(['string', 'null']);
    expect(props['text']!.type).toEqual(['string', 'null']);
  });

  it('passes through schemas without anyOf unchanged', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        count: { type: 'integer' },
      },
    };
    expect(normalizeSchemaForRjsf(schema)).toEqual(schema);
  });
});

describe('hoistDefsToRoot', () => {
  it('hoists nested $defs from a sub-schema to the root', () => {
    const schema = {
      type: 'object',
      properties: {
        source_image: {
          type: 'object',
          properties: { size: { $ref: '#/$defs/ImageSize' } },
          $defs: { ImageSize: { type: 'object', properties: { width: { type: 'integer' } } } },
        },
      },
    };
    const result = hoistDefsToRoot(schema);
    expect(result.$defs).toEqual({
      ImageSize: { type: 'object', properties: { width: { type: 'integer' } } },
    });
    // Original nested $defs must be stripped so the only valid ref path is root-level
    const sourceImage = (result.properties as Record<string, Record<string, unknown>>)
      .source_image!;
    expect(sourceImage.$defs).toBeUndefined();
    expect(sourceImage.properties).toEqual({ size: { $ref: '#/$defs/ImageSize' } });
  });

  it('merges $defs from multiple sub-schemas at the root', () => {
    const schema = {
      type: 'object',
      properties: {
        img: {
          properties: { s: { $ref: '#/$defs/ImageSize' } },
          $defs: { ImageSize: { type: 'object' } },
        },
        doc: {
          properties: { m: { $ref: '#/$defs/MimeInfo' } },
          $defs: { MimeInfo: { type: 'string' } },
        },
      },
    };
    const result = hoistDefsToRoot(schema);
    expect(result.$defs).toEqual({
      ImageSize: { type: 'object' },
      MimeInfo: { type: 'string' },
    });
  });

  it('first-write-wins on duplicate def names across sub-schemas', () => {
    const schema = {
      properties: {
        a: { $defs: { Shared: { type: 'object', description: 'from-a' } } },
        b: { $defs: { Shared: { type: 'object', description: 'from-b' } } },
      },
    };
    const result = hoistDefsToRoot(schema);
    const defs = result.$defs as Record<string, Record<string, unknown>>;
    expect(defs.Shared!.description).toBe('from-a');
  });

  it('leaves schemas without $defs unchanged', () => {
    const schema = { type: 'object', properties: { name: { type: 'string' } } };
    expect(hoistDefsToRoot(schema)).toEqual(schema);
  });

  it('hoists $defs that live inside items (array schemas)', () => {
    const schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: { size: { $ref: '#/$defs/ImageSize' } },
        $defs: { ImageSize: { type: 'object' } },
      },
    };
    const result = hoistDefsToRoot(schema);
    expect(result.$defs).toEqual({ ImageSize: { type: 'object' } });
    expect((result.items as Record<string, unknown>).$defs).toBeUndefined();
  });
});

describe('prepareSchemaForRjsf', () => {
  it('hoists $defs AND normalizes anyOf in one pass', () => {
    const schema = {
      type: 'object',
      properties: {
        img: {
          type: 'object',
          properties: {
            caption: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            size: { $ref: '#/$defs/ImageSize' },
          },
          $defs: {
            ImageSize: {
              type: 'object',
              properties: {
                width: { type: 'integer' },
              },
            },
          },
        },
      },
    };
    const result = prepareSchemaForRjsf(schema);

    // anyOf flattened
    const img = (result.properties as Record<string, Record<string, unknown>>).img!;
    const props = img.properties as Record<string, Record<string, unknown>>;
    expect(props.caption!.type).toEqual(['string', 'null']);

    // $defs hoisted
    expect(result.$defs).toEqual({
      ImageSize: { type: 'object', properties: { width: { type: 'integer' } } },
    });

    // $ref still points at root $defs, which now exists
    expect(props.size!.$ref).toBe('#/$defs/ImageSize');
  });
});
