import { describe, expect, it } from 'vitest';
import {
  enumValueLabel,
  fieldLabel,
  humanizeEnumValue,
  humanizeFieldName,
} from '../field-presentation';

describe('humanizeFieldName', () => {
  it('turns a snake_case identifier into a sentence-case label', () => {
    expect(humanizeFieldName('full_name')).toBe('Full name');
  });

  it('handles kebab-case and runs of separators', () => {
    expect(humanizeFieldName('invoice-number')).toBe('Invoice number');
    expect(humanizeFieldName('a__b--c')).toBe('A b c');
  });

  it('capitalises only the first word - these are labels, not titles', () => {
    expect(humanizeFieldName('date_of_birth')).toBe('Date of birth');
  });

  it('passes an already-humanised name through unchanged', () => {
    expect(humanizeFieldName('Your full name')).toBe('Your full name');
  });

  it('leaves a name that is only separators or blank alone', () => {
    expect(humanizeFieldName('___')).toBe('___');
    expect(humanizeFieldName('')).toBe('');
  });
});

describe('fieldLabel', () => {
  it('preserves an authored title verbatim in app mode - hyphens included', () => {
    expect(fieldLabel('E-mail address', 'email', 'app')).toBe('E-mail address');
    expect(fieldLabel('Pre-Tax Deduction', 'deduction', 'app')).toBe('Pre-Tax Deduction');
  });

  it('humanises the identifier fallback only in app mode', () => {
    expect(fieldLabel(undefined, 'full_name', 'app')).toBe('Full name');
    expect(fieldLabel(undefined, 'full_name', 'studio')).toBe('full_name');
  });

  it('shows the title verbatim in studio mode too', () => {
    expect(fieldLabel('E-mail address', 'email', 'studio')).toBe('E-mail address');
  });

  it('keeps an empty title empty - a list row suppresses its label that way', () => {
    expect(fieldLabel('', 'items[0]', 'app')).toBe('');
    expect(fieldLabel('', 'items[0]', 'studio')).toBe('');
  });
});

describe('humanizeEnumValue', () => {
  it('words a snake_case code as a field name is worded', () => {
    expect(humanizeEnumValue('unit_price_differs_from_po')).toBe('Unit price differs from po');
    expect(humanizeEnumValue('in_progress')).toBe('In progress');
  });

  it('words a kebab-case code', () => {
    expect(humanizeEnumValue('hold-for-review')).toBe('Hold for review');
  });

  it('lowercases an all-caps code before wording it', () => {
    // "HIGH RISK" in a sentence-case page reads as an alarm; the capitals are a
    // convention of the code, not an emphasis its author meant.
    expect(humanizeEnumValue('HIGH_RISK')).toBe('High risk');
    expect(humanizeEnumValue('Q1_REPORT')).toBe('Q1 report');
  });

  it('does not guess acronyms', () => {
    // Accepted: `po` where a reader expects `PO`, exactly as a field name
    // reads today. The cure is a label the author writes, not a guess here.
    expect(humanizeEnumValue('USD')).toBe('Usd');
    expect(humanizeEnumValue('matches_po')).toBe('Matches po');
  });

  it('capitalises a lowercase single word and leaves a mixed-case one alone', () => {
    expect(humanizeEnumValue('positive')).toBe('Positive');
    expect(humanizeEnumValue('HighRisk')).toBe('HighRisk');
  });

  it('shows a value that is not a code verbatim', () => {
    // Its separators are spelling rather than structure: a range, an
    // abbreviation and authored words.
    expect(humanizeEnumValue('18-24')).toBe('18-24');
    expect(humanizeEnumValue('N/A')).toBe('N/A');
    expect(humanizeEnumValue('Very satisfied')).toBe('Very satisfied');
    expect(humanizeEnumValue('_private')).toBe('_private');
  });

  it('leaves an empty string empty', () => {
    expect(humanizeEnumValue('')).toBe('');
  });
});

describe('enumValueLabel', () => {
  it('words a code in app and shows it verbatim in studio', () => {
    expect(enumValueLabel('in_progress', 'app')).toBe('In progress');
    expect(enumValueLabel('in_progress', 'studio')).toBe('in_progress');
  });
});
