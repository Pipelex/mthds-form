import { describe, expect, it } from 'vitest';
import { DEFAULT_FIELD_STRINGS, FR_FIELD_STRINGS } from '..';

/**
 * The French strings are a complete `FieldStrings`: every key the English
 * defaults carry, of the same kind, and every message that takes a count
 * applying French plural rules, where zero and one take the singular.
 */

describe('FR_FIELD_STRINGS', () => {
  it('carries every key of the English defaults, and no other', () => {
    expect(Object.keys(FR_FIELD_STRINGS).sort()).toEqual(Object.keys(DEFAULT_FIELD_STRINGS).sort());
  });

  it('gives each key the same kind of value as the English defaults', () => {
    for (const [key, value] of Object.entries(DEFAULT_FIELD_STRINGS)) {
      expect(typeof FR_FIELD_STRINGS[key as keyof typeof FR_FIELD_STRINGS], key).toBe(typeof value);
    }
  });

  it('answers every message that is a function with a non-empty string', () => {
    const s = FR_FIELD_STRINGS;
    const answers = [
      s.removeItemAria(2),
      s.itemsCount(3),
      s.itemsCountOf(1, 3),
      s.fieldsCount(4),
      s.fileUrlAria('Devis'),
      s.fileUrlAria(''),
      s.encodedFileSummary('PDF', 2048),
      s.toggleRowDetails(1),
      s.downloadIncomplete(['a.pdf']),
      s.downloadFile('a.pdf'),
      s.unsupportedFileType('PDF, PNG'),
      s.optionalFieldsCount(2),
      s.optionalInputsCount(2),
    ];
    for (const answer of answers) expect(answer.trim()).not.toBe('');
  });

  it('takes the singular for zero and one, and the plural past one', () => {
    const s = FR_FIELD_STRINGS;
    expect(s.itemsCount(0)).toBe('0 élément');
    expect(s.itemsCount(1)).toBe('1 élément');
    expect(s.itemsCount(2)).toBe('2 éléments');
    expect(s.itemsCountOf(1, 3)).toBe('1 sur 3 éléments');
    expect(s.fieldsCount(1)).toBe('1 champ');
    expect(s.fieldsCount(5)).toBe('5 champs');
    expect(s.optionalFieldsCount(1)).toBe('1 champ facultatif');
    expect(s.optionalFieldsCount(3)).toBe('3 champs facultatifs');
    expect(s.optionalInputsCount(1)).toBe('1 entrée facultative');
    expect(s.optionalInputsCount(2)).toBe('2 entrées facultatives');
  });

  it('writes a size the French way', () => {
    const s = FR_FIELD_STRINGS;
    expect(normalize(s.encodedFileSummary('PNG', 1))).toBe('PNG · 1 octet');
    expect(normalize(s.encodedFileSummary('PNG', 512))).toBe('PNG · 512 octets');
    expect(normalize(s.encodedFileSummary('PDF', 36 * 1024))).toBe('PDF · 36 ko');
    expect(normalize(s.encodedFileSummary('PDF', 1.4 * 1024 * 1024))).toBe('PDF · 1,4 Mo');
  });

  it('names the files a download missed, in the singular and the plural', () => {
    const s = FR_FIELD_STRINGS;
    expect(s.downloadIncomplete(['a.pdf'])).toBe('Un fichier n’a pas pu être enregistré : a.pdf');
    expect(s.downloadIncomplete(['a.pdf', 'b.png'])).toBe(
      '2 fichiers n’ont pas pu être enregistrés : a.pdf, b.png',
    );
  });
});

/** `Intl` separates number and unit with a narrow no-break space; compare on plain spaces. */
function normalize(text: string): string {
  return text.replace(/\u202f|\u00a0/g, ' ');
}
