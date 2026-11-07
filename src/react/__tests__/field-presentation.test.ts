import { describe, expect, it } from 'vitest';
import { enumLabeler, fieldLabel } from '../field-presentation';

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

describe('enumLabeler', () => {
  const STATUSES = ['matches_po', 'unit_price_differs_from_po', 'HIGH_RISK', 'USD'];

  it('shows every value as its code in studio', () => {
    const label = enumLabeler(STATUSES, 'studio');
    expect(STATUSES.map(label)).toEqual(STATUSES);
  });

  it('shows every value as the kernel words it in app', () => {
    const label = enumLabeler(STATUSES, 'app');
    expect(STATUSES.map(label)).toEqual([
      'Matches po',
      'Unit price differs from po',
      'High risk',
      'USD',
    ]);
  });

  it('keeps the fallback to the codes in app when two options would read the same', () => {
    const options = ['high_risk', 'HIGH_RISK', 'low_risk'];
    expect(options.map(enumLabeler(options, 'app'))).toEqual(options);
  });
});
