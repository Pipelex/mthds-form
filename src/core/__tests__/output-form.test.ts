import { describe, expect, it } from 'vitest';
import type { InputFormField } from 'mthds/protocol';
import { buildResultField } from '../derive';
import { getPipeOutputForm, type OutputForm } from '../output-form';

/**
 * The output half.
 *
 * The thing under test is really an assertion about SAMENESS: an output is a
 * concept ref exactly like an input, so its node maps through the same code and
 * produces the same `RunField` shapes. A second mapper would be a second place
 * for kinds to drift, so `buildResultField` delegates to the one that exists and
 * differs only in what it does NOT do - stamp slot facts.
 */

/** A payload schema for a `native.Text` result - `TextContent {text}`. */
const TEXT_CONTENT_SCHEMA = { type: 'object', properties: { text: { type: 'string' } } };

const node = (over: Partial<InputFormField> = {}): InputFormField =>
  ({
    name: 'output',
    kind: 'prose',
    concept_ref: 'native.Text',
    required: true,
    ...over,
  }) as InputFormField;

describe('getPipeOutputForm', () => {
  const form: OutputForm = {
    'demo.summarize': { field: node() },
    bare: { field: node({ concept_ref: 'demo.Other' }) },
  };

  it('finds an entry by domain and pipe code', () => {
    expect(getPipeOutputForm(form, 'demo', 'summarize')?.field.concept_ref).toBe('native.Text');
  });

  it('falls back to a bare pipe code, like its input twin', () => {
    expect(getPipeOutputForm(form, 'demo', 'bare')?.field.concept_ref).toBe('demo.Other');
  });

  it('returns undefined rather than a plausible wrong answer', () => {
    expect(getPipeOutputForm(form, 'demo', 'missing')).toBeUndefined();
    expect(getPipeOutputForm(null, 'demo', 'summarize')).toBeUndefined();
    expect(getPipeOutputForm(form, 'demo', null)).toBeUndefined();
  });
});

describe('buildResultField', () => {
  it('maps a scalar output to the same kind an input would get', () => {
    expect(buildResultField({ field: node() }, TEXT_CONTENT_SCHEMA)).toMatchObject({
      kind: 'prose',
      name: 'output',
    });
  });

  it('leaves the slot facts unset - an output belongs to no slot', () => {
    // `presence` and `gating` are what `buildRunFields` stamps per input. An
    // output has neither, and the standard's node makes both optional for
    // exactly this reason.
    const field = buildResultField({ field: node() }, TEXT_CONTENT_SCHEMA);
    expect(field.presence).toBeUndefined();
    expect(field.gating).toBeUndefined();
  });

  it('recurses into a structured output', () => {
    const field = buildResultField(
      {
        field: node({
          kind: 'object',
          concept_ref: 'demo.Invoice',
          fields: [
            node({ name: 'reference', kind: 'text' }),
            node({ name: 'total', kind: 'number' }),
          ],
        }),
      },
      {
        type: 'object',
        properties: { reference: { type: 'string' }, total: { type: 'number' } },
      },
    );
    expect(field.kind).toBe('object');
    expect(field.kind === 'object' && field.fields.map((f) => [f.name, f.kind])).toEqual([
      ['reference', 'text'],
      ['total', 'number'],
    ]);
  });

  it('reads contentKey off the payload schema, which is REQUIRED', () => {
    // The schema is what lets the renderer unwrap by a property NAME rather than
    // by inspecting the value - `native.Text`'s payload sits under `text`. It is
    // required rather than optional precisely so the renderer never has to guess
    // in its absence, which is what it used to do.
    expect(buildResultField({ field: node() }, TEXT_CONTENT_SCHEMA).contentKey).toBe('text');
  });

  it('does not mistake a one-field STRUCTURE for a content-model wrapper', () => {
    // The unwrap is gated on the node's stated KIND, never on the value's shape.
    // An `object` output IS its content model, so a concept declaring exactly one
    // field must keep its property rather than have it unwrapped away.
    const field = buildResultField(
      {
        field: node({
          kind: 'object',
          concept_ref: 'demo.Only',
          fields: [node({ name: 'only', kind: 'text' })],
        }),
      },
      { type: 'object', properties: { only: { type: 'string' } } },
    );
    expect(field.contentKey).toBeUndefined();
    expect(field.kind === 'object' && field.fields.map((f) => f.name)).toEqual(['only']);
  });

  it('unwraps a plural output through ListContent, and walks the array beneath it', () => {
    // A plural payload is `ListContent {items}`, so the schema handed in is that
    // wrapper - and the descriptor node beside it is a `list`. Aligning the two
    // means unwrapping once at the top and walking the ARRAY, not the object
    // around it; getting that wrong loses the item's own schema silently.
    const field = buildResultField(
      {
        field: node({
          name: 'output',
          kind: 'list',
          concept_ref: 'demo.LineItem',
          item: node({
            name: 'output',
            kind: 'object',
            concept_ref: 'demo.LineItem',
            fields: [node({ name: 'label', kind: 'text' })],
          }),
        }),
      },
      {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/$defs/LineItem' }, minItems: 2 },
        },
        $defs: {
          LineItem: { type: 'object', properties: { label: { type: 'string' } } },
        },
      },
    );
    expect(field.kind).toBe('list');
    expect(field.contentKey).toBe('items');
    expect(field.kind === 'list' && field.item.kind).toBe('object');
    expect(field.kind === 'list' && field.itemCount).toBe(2);
  });
});
