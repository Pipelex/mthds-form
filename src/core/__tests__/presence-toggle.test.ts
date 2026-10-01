/**
 * An optional structure's presence toggle, as the kernel states it.
 *
 * The control is a thin reading of four kernel answers: whether a field carries
 * the toggle (`hasPresenceToggle`), whether it reads open for a value
 * (`presenceOpen`), what opening it writes (`seedObjectValue`), and
 * whether the field still folds behind its container's optional disclosure
 * (`foldsBehindOptionalDisclosure`). What the run makes of the value is
 * `fieldFilled`'s answer, asserted here at depth two and three; the browser and
 * the server gate are held to the same answers in `gate-agreement.test.ts`.
 */
import { describe, expect, it } from 'vitest';
import type { ObjectRunField, RunField, TextRunField } from '../descriptor';
import {
  computeReadiness,
  fieldFilled,
  foldsBehindOptionalDisclosure,
  hasPresenceToggle,
  presenceOpen,
} from '../readiness';
import { seedInputs, seedObjectValue } from '../seed';

const text = (name: string, extra: Partial<TextRunField> = {}): TextRunField => ({
  kind: 'text',
  name,
  required: true,
  ...extra,
});

const object = (
  name: string,
  fields: RunField[],
  extra: Partial<ObjectRunField> = {},
): ObjectRunField => ({ kind: 'object', name, required: true, fields, ...extra });

// The consumer's shape: every child of the bank details is optional with an
// authored default (pipelex refuses a field both required and defaulted), and
// the structure itself is an optional child of a required one.
const bank = object(
  'compte_bancaire',
  [
    text('titulaire', { required: false, defaultValue: 'Atlas SAS' }),
    text('banque', { required: false, defaultValue: 'BNP' }),
    text('bic', { required: false, defaultValue: 'BNPAFRPP' }),
    text('iban', { required: false, defaultValue: 'FR76' }),
  ],
  { required: false },
);
const shop = object('boutique', [text('nom'), bank]);

describe('seedInputs', () => {
  it('leaves an optional structure absent, however many defaults its children carry', () => {
    expect(seedInputs([shop])).toEqual({});
    expect(seedInputs([bank])).toEqual({});
    const price = object(
      'prix_or',
      [text('prix_au_gramme', { required: false, defaultValue: 41 })],
      { required: false },
    );
    expect(seedInputs([price])).toEqual({});
    expect(seedObjectValue(price)).toEqual({ prix_au_gramme: 41 });
  });

  it('still seeds into a required structure, and an optional one that has a default of its own', () => {
    const required = object('boutique', [text('nom', { required: false, defaultValue: 'Lille' })]);
    expect(seedInputs([required])).toEqual({ boutique: { nom: 'Lille' } });

    const defaulted = { ...bank, defaultValue: { titulaire: 'X' } };
    expect(seedInputs([defaulted])).toEqual({ compte_bancaire: { titulaire: 'X' } });
  });
});

describe('seedObjectValue', () => {
  it("seeds the structure from its children's defaults", () => {
    expect(seedObjectValue(bank)).toEqual({
      titulaire: 'Atlas SAS',
      banque: 'BNP',
      bic: 'BNPAFRPP',
      iban: 'FR76',
    });
  });

  it('is an empty object when no child carries a default, which still reads open', () => {
    const plain = object('adresse', [text('rue')], { required: false });
    expect(seedObjectValue(plain)).toEqual({});
    expect(presenceOpen(seedObjectValue(plain))).toBe(true);
  });

  it("prefers the structure's own object default, as a copy", () => {
    const own = { titulaire: 'Own' };
    const defaulted = { ...bank, defaultValue: own };
    const seeded = seedObjectValue(defaulted);
    expect(seeded).toEqual(own);
    expect(seeded).not.toBe(own);
  });

  it('leaves an optional structure beneath it closed', () => {
    const inner = object('adresse', [text('rue', { required: false, defaultValue: 'Neuve' })], {
      required: false,
    });
    const outer = object('compte', [text('iban', { required: false, defaultValue: 'FR' }), inner], {
      required: false,
    });
    expect(seedObjectValue(outer)).toEqual({ iban: 'FR' });
  });
});

describe('the presence toggle', () => {
  it('is carried by an optional structure only', () => {
    expect(hasPresenceToggle(bank)).toBe(true);
    expect(hasPresenceToggle(shop)).toBe(false);
    expect(hasPresenceToggle(text('note', { required: false }))).toBe(false);
  });

  it('reads open over any plain object and closed over an absence', () => {
    expect(presenceOpen({})).toBe(true);
    expect(presenceOpen({ iban: 'FR76' })).toBe(true);
    expect(presenceOpen(undefined)).toBe(false);
    expect(presenceOpen(null)).toBe(false);
    expect(presenceOpen([])).toBe(false);
  });

  it('keeps a toggled structure out of the optional disclosure, and nothing else', () => {
    expect(foldsBehindOptionalDisclosure(bank)).toBe(false);
    expect(foldsBehindOptionalDisclosure(text('note', { required: false }))).toBe(true);
    expect(
      foldsBehindOptionalDisclosure(text('note', { required: false, defaultValue: 'x' })),
    ).toBe(false);
    expect(foldsBehindOptionalDisclosure(text('nom'))).toBe(false);
  });
});

describe('fieldFilled over a toggled structure', () => {
  const account = object('compte', [text('iban'), text('titulaire', { required: false })], {
    required: false,
  });
  const address = object('adresse', [text('rue'), text('ville', { required: false })], {
    required: false,
  });
  const deep = object('boutique', [
    text('nom'),
    object('compte', [...account.fields, address], { required: false }),
  ]);

  it('blocks nothing while the structure is closed, or open and empty', () => {
    expect(fieldFilled(deep, { nom: 'Lille' })).toBe(true);
    expect(fieldFilled(deep, { nom: 'Lille', compte: undefined })).toBe(true);
    expect(fieldFilled(deep, { nom: 'Lille', compte: {} })).toBe(true);
  });

  it('holds a structure that holds anything to its required children, at depth two', () => {
    expect(fieldFilled(deep, { nom: 'Lille', compte: { titulaire: 'Atlas' } })).toBe(false);
    expect(fieldFilled(deep, { nom: 'Lille', compte: { titulaire: 'Atlas', iban: '' } })).toBe(
      false,
    );
    expect(fieldFilled(deep, { nom: 'Lille', compte: { iban: 'FR76' } })).toBe(true);
  });

  it('and at depth three', () => {
    const at = (adresse: unknown) =>
      fieldFilled(deep, { nom: 'L', compte: { iban: 'FR', adresse } });
    expect(at(undefined)).toBe(true);
    expect(at({})).toBe(true);
    expect(at({ ville: 'Lille' })).toBe(false);
    expect(at({ rue: '  ', ville: 'Lille' })).toBe(false);
    expect(at({ rue: '1 rue Neuve' })).toBe(true);
  });

  it('counts a top-level optional structure once it holds something, as before', () => {
    const top = object('compte', account.fields, { required: false });
    expect(computeReadiness([top], {})).toEqual({ total: 0, ready: 0, missing: [] });
    expect(computeReadiness([top], { compte: {} })).toEqual({ total: 0, ready: 0, missing: [] });
    expect(computeReadiness([top], { compte: { titulaire: 'A' } }).missing).toEqual(['compte']);
    expect(computeReadiness([top], { compte: { iban: 'FR76' } }).missing).toEqual([]);
  });
});
