import { describe, expect, it } from 'vitest';
import { humanizeFieldName } from '../field-presentation';

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
