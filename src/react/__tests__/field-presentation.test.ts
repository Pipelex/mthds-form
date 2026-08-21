import { describe, expect, it } from 'vitest';
import { fieldLabel, humanizeFieldName } from '../field-presentation';

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
