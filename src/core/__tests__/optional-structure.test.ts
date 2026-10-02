/**
 * An optional structure, as the kernel states it.
 *
 * The object control is a thin reading of these answers: whether a field is
 * an optional structure (`isOptionalStructure`), whether it reads open for a
 * value (`optionalStructureOpen`), whether it is folded behind its container's
 * "+ N optional" disclosure (`isFoldedOptional`), what opening it writes
 * (`seedObjectValue`), and what that disclosure writes when it expands or
 * collapses (`openOptionalStructures`, `closeOptionalStructures`). What the run
 * makes of the value is `fieldFilled`'s answer, asserted here at depth two and
 * three; the browser and the server gate are held to the same answers in
 * `gate-agreement.test.ts`.
 */
import { describe, expect, it } from 'vitest';
import type { ObjectRunField, RunField, TextRunField } from '../descriptor';
import {
  anyOptionalStructureOpen,
  computeReadiness,
  fieldFilled,
  foldsBehindOptionalDisclosure,
  isFoldedOptional,
  isOptionalStructure,
  optionalStructureOpen,
} from '../readiness';
import {
  closeOptionalStructures,
  openOptionalStructures,
  seedInputs,
  seedObjectValue,
} from '../seed';

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
    text('titulaire', { required: false, defaultValue: 'Boutique Exemple SAS' }),
    text('banque', { required: false, defaultValue: 'Banque Exemple' }),
    text('bic', { required: false, defaultValue: 'BEXAFRPP' }),
    text('iban', { required: false, defaultValue: 'FR76' }),
  ],
  { required: false },
);
const shop = object('boutique', [text('nom'), bank]);

describe('seedInputs', () => {
  it('leaves an optional structure absent, however many defaults its children carry', () => {
    expect(seedInputs([shop])).toEqual({});
    expect(seedInputs([bank])).toEqual({});
    const price = object('prix_or', [text('taux_horaire', { required: false, defaultValue: 60 })], {
      required: false,
    });
    expect(seedInputs([price])).toEqual({});
    expect(seedObjectValue(price)).toEqual({ taux_horaire: 60 });
  });

  it('still seeds into a required structure, and an optional one that has a default of its own', () => {
    const required = object('boutique', [
      text('nom', { required: false, defaultValue: 'Exempleville' }),
    ]);
    expect(seedInputs([required])).toEqual({ boutique: { nom: 'Exempleville' } });

    const defaulted = { ...bank, defaultValue: { titulaire: 'X' } };
    expect(seedInputs([defaulted])).toEqual({ compte_bancaire: { titulaire: 'X' } });
  });
});

describe('seedObjectValue', () => {
  it("seeds the structure from its children's defaults", () => {
    expect(seedObjectValue(bank)).toEqual({
      titulaire: 'Boutique Exemple SAS',
      banque: 'Banque Exemple',
      bic: 'BEXAFRPP',
      iban: 'FR76',
    });
  });

  it('is an empty object when no child carries a default, which still reads open', () => {
    const plain = object('adresse', [text('rue')], { required: false });
    expect(seedObjectValue(plain)).toEqual({});
    expect(optionalStructureOpen(seedObjectValue(plain))).toBe(true);
  });

  it("prefers the structure's own object default, as a copy", () => {
    const own = { titulaire: 'Own' };
    const defaulted = { ...bank, defaultValue: own };
    const seeded = seedObjectValue(defaulted);
    expect(seeded).toEqual(own);
    expect(seeded).not.toBe(own);
  });

  it('leaves an optional structure beneath it closed', () => {
    const inner = object('adresse', [text('rue', { required: false, defaultValue: 'Gare' })], {
      required: false,
    });
    const outer = object('compte', [text('iban', { required: false, defaultValue: 'FR' }), inner], {
      required: false,
    });
    expect(seedObjectValue(outer)).toEqual({ iban: 'FR' });
  });
});

describe('the disclosure', () => {
  it('treats an optional structure only as one', () => {
    expect(isOptionalStructure(bank)).toBe(true);
    expect(isOptionalStructure(shop)).toBe(false);
    expect(isOptionalStructure(text('note', { required: false }))).toBe(false);
  });

  it('reads a structure open over any plain object and closed over an absence', () => {
    expect(optionalStructureOpen({})).toBe(true);
    expect(optionalStructureOpen({ iban: 'FR76' })).toBe(true);
    expect(optionalStructureOpen(undefined)).toBe(false);
    expect(optionalStructureOpen(null)).toBe(false);
    expect(optionalStructureOpen([])).toBe(false);
  });

  it('folds a closed structure with the empty optional fields, and an open one never', () => {
    expect(foldsBehindOptionalDisclosure(bank)).toBe(true);
    expect(isFoldedOptional(bank, undefined)).toBe(true);
    expect(isFoldedOptional(bank, {})).toBe(false);
    expect(isFoldedOptional(text('note', { required: false }), '')).toBe(true);
    expect(isFoldedOptional(text('note', { required: false }), 'x')).toBe(false);
    expect(isFoldedOptional(text('note', { required: false, defaultValue: 'x' }), '')).toBe(false);
    expect(isFoldedOptional(text('nom'), '')).toBe(false);
  });

  it('opens every closed structure with its seed, and closes every one', () => {
    const fields = [text('nom'), text('note', { required: false }), bank];
    const opened = openOptionalStructures(fields, { nom: 'Exempleville' });
    expect(opened).toEqual({ nom: 'Exempleville', compte_bancaire: seedObjectValue(bank) });
    expect(anyOptionalStructureOpen(fields, opened)).toBe(true);
    // An open one is kept as it is, edits and all.
    const edited = { nom: 'Exempleville', compte_bancaire: { iban: 'X' } };
    expect(openOptionalStructures(fields, edited)).toEqual(edited);

    const closed = closeOptionalStructures(fields, opened);
    expect(closed).toEqual({ nom: 'Exempleville', compte_bancaire: undefined });
    expect(anyOptionalStructureOpen(fields, closed)).toBe(false);
  });
});

describe('fieldFilled over an optional structure', () => {
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
    expect(fieldFilled(deep, { nom: 'Exempleville' })).toBe(true);
    expect(fieldFilled(deep, { nom: 'Exempleville', compte: undefined })).toBe(true);
    expect(fieldFilled(deep, { nom: 'Exempleville', compte: {} })).toBe(true);
  });

  it('holds a structure that holds anything to its required children, at depth two', () => {
    expect(
      fieldFilled(deep, { nom: 'Exempleville', compte: { titulaire: 'Boutique Exemple' } }),
    ).toBe(false);
    expect(
      fieldFilled(deep, {
        nom: 'Exempleville',
        compte: { titulaire: 'Boutique Exemple', iban: '' },
      }),
    ).toBe(false);
    expect(fieldFilled(deep, { nom: 'Exempleville', compte: { iban: 'FR76' } })).toBe(true);
  });

  it('and at depth three', () => {
    const at = (adresse: unknown) =>
      fieldFilled(deep, { nom: 'L', compte: { iban: 'FR', adresse } });
    expect(at(undefined)).toBe(true);
    expect(at({})).toBe(true);
    expect(at({ ville: 'Exempleville' })).toBe(false);
    expect(at({ rue: '  ', ville: 'Exempleville' })).toBe(false);
    expect(at({ rue: '1 rue de la Gare' })).toBe(true);
  });

  it('counts a top-level optional structure once it holds something, as before', () => {
    const top = object('compte', account.fields, { required: false });
    expect(computeReadiness([top], {})).toEqual({ total: 0, ready: 0, missing: [] });
    expect(computeReadiness([top], { compte: {} })).toEqual({ total: 0, ready: 0, missing: [] });
    expect(computeReadiness([top], { compte: { titulaire: 'A' } }).missing).toEqual(['compte']);
    expect(computeReadiness([top], { compte: { iban: 'FR76' } }).missing).toEqual([]);
  });
});
