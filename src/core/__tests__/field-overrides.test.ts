import { describe, expect, it } from 'vitest';
import {
  applyFieldOverrides,
  type EnumRunField,
  type ListRunField,
  type ObjectRunField,
  type RunField,
  type TextRunField,
} from '..';

/**
 * A host puts its own words on a form, per field, by path. What this has to
 * hold: a path reaches the field it names however deep, through structures and
 * into list items; each key replaces only its own slot, and only on a kind that
 * reads it; a path that names nothing breaks nothing; and the tree the host
 * passed in is left as it was.
 */

const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});
const choice = (name: string, options: string[]): EnumRunField => ({
  kind: 'enum',
  name,
  conceptRef: 'demo.Boutique',
  required: true,
  options,
});
const record = (name: string, fields: RunField[]): ObjectRunField => ({
  kind: 'object',
  name,
  conceptRef: 'demo.Record',
  required: true,
  fields,
});
const listOf = (name: string, item: RunField): ListRunField => ({
  kind: 'list',
  name,
  conceptRef: 'demo.Record',
  required: true,
  item,
});

const at = (fields: RunField[], ...names: string[]): RunField => {
  let current: RunField | undefined = fields.find((field) => field.name === names[0]);
  for (const name of names.slice(1)) {
    if (current?.kind === 'list') current = current.item;
    else if (current?.kind === 'object') current = current.fields.find((f) => f.name === name);
    else throw new Error(`no field at ${names.join('.')}`);
  }
  if (current === undefined) throw new Error(`no field at ${names.join('.')}`);
  return current;
};

describe('a path reaches the field it names', () => {
  it('sets the title and description of a top-level field', () => {
    const [comment] = applyFieldOverrides([text('comment')], {
      comment: { title: 'Commentaire', description: 'Ce que le client a demandé' },
    });
    expect(comment?.title).toBe('Commentaire');
    expect(comment?.description).toBe('Ce que le client a demandé');
  });

  it('walks into a structure by dotted names', () => {
    const fields = [record('customer', [text('display_name'), text('email')])];
    const out = applyFieldOverrides(fields, {
      'customer.display_name': { title: 'Nom du client', placeholder: 'Jeanne Martin' },
    });
    const name = at(out, 'customer', 'display_name');
    expect(name.title).toBe('Nom du client');
    expect(name.kind === 'text' && name.placeholder).toBe('Jeanne Martin');
    expect(at(out, 'customer', 'email').title).toBeUndefined();
  });

  it('names a list itself, its item with `[]`, and a field of each row after it', () => {
    const fields = [listOf('lines', record('line', [text('label'), text('price')]))];
    const out = applyFieldOverrides(fields, {
      lines: { title: 'Lignes' },
      'lines[].price': { title: 'Prix' },
    });
    const lines = out[0] as ListRunField;
    expect(lines.title).toBe('Lignes');
    expect(at(out, 'lines', '[]', 'price').title).toBe('Prix');
    expect(at(out, 'lines', '[]', 'label').title).toBeUndefined();
  });

  it('reaches a list of scalars through its item', () => {
    const out = applyFieldOverrides([listOf('illustrations', text('illustrations'))], {
      'illustrations[]': { placeholder: 'https://…' },
    });
    const item = (out[0] as ListRunField).item;
    expect(item.kind === 'text' && item.placeholder).toBe('https://…');
  });
});

describe('each key replaces only its own slot, on a kind that reads it', () => {
  it('gives an enum its option labels, merged over the ones it has', () => {
    const boutique = { ...choice('code', ['LILLE', 'PARIS_15']), optionLabels: { LILLE: 'L' } };
    const out = applyFieldOverrides([record('boutique', [boutique])], {
      'boutique.code': { optionLabels: { PARIS_15: 'Paris 15e' } },
    });
    const code = at(out, 'boutique', 'code') as EnumRunField;
    expect(code.optionLabels).toEqual({ LILLE: 'L', PARIS_15: 'Paris 15e' });
    // The options themselves are the codes still: what the form stores.
    expect(code.options).toEqual(['LILLE', 'PARIS_15']);
  });

  it('ignores option labels on a kind that is not an enum, and a placeholder on one that is not text', () => {
    const out = applyFieldOverrides([text('note'), choice('city', ['LILLE'])], {
      note: { optionLabels: { a: 'b' } },
      city: { placeholder: 'Ville' },
    });
    expect('optionLabels' in out[0]!).toBe(false);
    expect('placeholder' in out[1]!).toBe(false);
  });

  it('takes an empty title as stated, not as absent', () => {
    const [field] = applyFieldOverrides([{ ...text('note'), title: 'Note' }], {
      note: { title: '' },
    });
    expect(field?.title).toBe('');
  });
});

describe('a path that names no field', () => {
  it('breaks nothing, and is reported to onUnmatched', () => {
    const fields = [record('customer', [text('display_name')])];
    const unmatched: string[] = [];
    const out = applyFieldOverrides(
      fields,
      { 'customer.phone': { title: 'Téléphone' }, customer: { title: 'Client' } },
      (path) => unmatched.push(path),
    );
    expect(out[0]?.title).toBe('Client');
    expect(unmatched).toEqual(['customer.phone']);
  });

  it('does not read an inherited property as an override', () => {
    // A field named `constructor` must not pick up Object.prototype.constructor.
    const [field] = applyFieldOverrides([text('constructor')], {});
    expect(field).toEqual(text('constructor'));
  });
});

describe('the input tree', () => {
  it('is never mutated, and an untouched field comes back as the same object', () => {
    const untouched = text('email');
    const fields = [record('customer', [text('display_name'), untouched]), text('other')];
    const before = structuredClone(fields);
    const out = applyFieldOverrides(fields, { 'customer.display_name': { title: 'Nom' } });
    expect(fields).toEqual(before);
    expect(at(out, 'customer', 'email')).toBe(untouched);
    expect(out[1]).toBe(fields[1]);
    expect(out[0]).not.toBe(fields[0]);
  });
});
