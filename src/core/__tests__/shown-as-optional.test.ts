import { describe, expect, it } from 'vitest';
import type { EnumRunField } from '../descriptor';
import { mustBeFilled, shownAsOptional } from '../readiness';

const enumField = (extra: Partial<EnumRunField>): EnumRunField => ({
  kind: 'enum',
  name: 'nom',
  options: ['Lille', 'Rouen'],
  required: false,
  ...extra,
});

describe('shownAsOptional', () => {
  it('does not show a defaulted field as optional, although the standard marks it not required', () => {
    const field = enumField({ defaultValue: 'Lille' });
    expect(field.required).toBe(false);
    expect(shownAsOptional(field)).toBe(false);
  });

  it('shows a field with neither required nor a default as optional', () => {
    expect(shownAsOptional(enumField({}))).toBe(true);
  });

  it('never shows a required field as optional', () => {
    expect(shownAsOptional(enumField({ required: true }))).toBe(false);
  });

  it('changes nothing about what gates a run', () => {
    expect(mustBeFilled(enumField({ defaultValue: 'Lille' }))).toBe(mustBeFilled(enumField({})));
  });
});
