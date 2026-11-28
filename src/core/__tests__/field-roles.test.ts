import { describe, expect, it } from 'vitest';
import type { RunField } from '..';
import { effectiveRole, formGroupOf, formHasRoles, orderByRole } from '..';

const field = (
  name: string,
  kind: 'text' | 'prose' | 'number' | 'document',
  facts: Partial<RunField> = {},
): RunField =>
  ({
    kind,
    name,
    required: true,
    gating: true,
    ...(kind === 'number' ? { integer: false } : {}),
    ...(kind === 'document' ? { formats: [] } : {}),
    ...facts,
  }) as RunField;

describe('the role layout', () => {
  it('changes nothing when the method states no role', () => {
    const fields = [field('a', 'text'), field('b', 'document')];
    expect(formHasRoles(fields)).toBe(false);
    expect(orderByRole(fields).map((f) => f.name)).toEqual(['a', 'b']);
    expect(effectiveRole(fields[1]!, false)).toBeUndefined();
  });

  it('puts the subject first and the folded group last, keeping authored order within each', () => {
    const fields = [
      field('tone', 'number', { required: false, gating: false, hints: { role: 'setting' } }),
      field('brief', 'prose'),
      field('source', 'document', { hints: { role: 'subject' } }),
      field('notes', 'prose', { required: false, gating: false }),
    ];
    expect(orderByRole(fields).map((f) => f.name)).toEqual(['source', 'brief', 'notes', 'tone']);
  });

  it('reads the standard’s defaults for a field with no role, once the form states some', () => {
    expect(effectiveRole(field('d', 'document'), true)).toBe('subject');
    expect(effectiveRole(field('p', 'prose', { required: false }), true)).toBe('guidance');
    expect(effectiveRole(field('n', 'number', { required: false }), true)).toBe('setting');
    expect(effectiveRole(field('t', 'text'), true)).toBe('context');
  });

  it('keeps a reference the run waits for, with nothing to fill it, out of the folded group', () => {
    const waited = field('ref', 'text', { hints: { role: 'reference' } });
    expect(formGroupOf(waited, true)).toBe('main');
    const defaulted = field('ref', 'text', {
      hints: { role: 'reference' },
      required: false,
      gating: false,
      defaultValue: 'x',
    });
    expect(formGroupOf(defaulted, true)).toBe('folded');
  });
});
