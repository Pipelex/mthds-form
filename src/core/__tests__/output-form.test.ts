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
    expect(buildResultField({ field: node() })).toMatchObject({ kind: 'prose', name: 'output' });
  });

  it('leaves the slot facts unset - an output belongs to no slot', () => {
    // `presence` and `gating` are what `buildRunFields` stamps per input. An
    // output has neither, and the standard's node makes both optional for
    // exactly this reason.
    const field = buildResultField({ field: node() });
    expect(field.presence).toBeUndefined();
    expect(field.gating).toBeUndefined();
  });

  it('recurses into a structured output', () => {
    const field = buildResultField({
      field: node({
        kind: 'object',
        concept_ref: 'demo.Invoice',
        fields: [
          node({ name: 'reference', kind: 'text' }),
          node({ name: 'total', kind: 'number' }),
        ],
      }),
    });
    expect(field.kind).toBe('object');
    expect(field.kind === 'object' && field.fields.map((f) => [f.name, f.kind])).toEqual([
      ['reference', 'text'],
      ['total', 'number'],
    ]);
  });

  it('reads contentKey from a schema when one is supplied', () => {
    // The output side has nowhere on the wire to carry a schema today. Without
    // it a scalar result cannot be unwrapped - `native.Text`'s payload sits
    // under `text` - which is why the parameter exists at all.
    const schema = { type: 'object', properties: { text: { type: 'string' } } };
    expect(buildResultField({ field: node() }, schema).contentKey).toBe('text');
    expect(buildResultField({ field: node() }).contentKey).toBeUndefined();
  });
});
