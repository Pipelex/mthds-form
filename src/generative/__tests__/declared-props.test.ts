import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { catalog } from '../catalog';
import { conformProps, textOf } from '../declared-props';

/**
 * What a renderer is handed when a layout's expression resolved to something
 * its definition refuses (`declared-props.ts`): the nearest value of the
 * declared type, held to the same schema the checks hold a literal to.
 */

const shapeOf = (type: string) =>
  (catalog.data.components as Record<string, { props: z.ZodObject }>)[type]!.props.shape as Record<
    string,
    z.ZodType
  >;

describe('a refused list', () => {
  it('keeps the entries its items accept only while the list still meets its own bounds', () => {
    // A `Tabs` takes two tabs at least; one kept tab of two is not a `Tabs`.
    const props = { tabs: [{ value: 'a', label: 'A' }, { label: 'no value' }] };
    expect(conformProps(shapeOf('Tabs'), props).tabs).toEqual([]);
  });

  it('writes out a number or a boolean among a list of texts, as it does for a text prop', () => {
    const props = { items: ['Food', 40, true, { nested: 1 }], marker: null };
    expect(conformProps(shapeOf('TextList'), props).items).toEqual(['Food', '40', 'true']);
  });

  it('comes back as the same list for the same value, so a renderer keyed on it does not run at every render', () => {
    const items = ['Food', { nested: 1 }];
    const first = conformProps(shapeOf('TextList'), { items }).items;
    const second = conformProps(shapeOf('TextList'), { items }).items;
    expect(first).toEqual(['Food']);
    expect(second).toBe(first);
  });
});

describe('the parsing a render costs', () => {
  it('parses an absent prop, and a plain text, not at all once its schema is known', () => {
    const title = z.string();
    const lede = z.string().nullable();
    const shape = { title, lede };
    conformProps(shape, { title: 'warm up' });
    const parses = [vi.spyOn(title, 'safeParse'), vi.spyOn(lede, 'safeParse')];
    for (let render = 0; render < 5; render += 1) conformProps(shape, { title: 'Plan' });
    expect(parses.map((spy) => spy.mock.calls.length)).toEqual([0, 0]);
  });

  it('still parses a scalar whose schema refines it, on a wrapper or as a format', () => {
    // Judged by its type alone, a text passed a `.refine` on the nullable
    // around it, an email format and an integer format.
    const shape = {
      refined: z
        .string()
        .nullable()
        .refine((value) => value !== 'forbidden'),
      email: z.email(),
      count: z.int(),
    };
    expect(
      conformProps(shape, { refined: 'forbidden', email: 'not an address', count: 1.5 }),
    ).toEqual({ refined: null, email: '', count: undefined });
    expect(conformProps(shape, { refined: 'fine', email: 'a@example.com', count: 2 })).toEqual({
      refined: 'fine',
      email: 'a@example.com',
      count: 2,
    });
  });

  it('parses a structure once per schema and value', () => {
    const rows = z.array(z.object({ name: z.string() }));
    const value = [{ name: 'a' }];
    conformProps({ rows }, { rows: value });
    const parse = vi.spyOn(rows, 'safeParse');
    for (let render = 0; render < 5; render += 1) conformProps({ rows }, { rows: value });
    expect(parse).not.toHaveBeenCalled();
  });
});

describe('a value written out for a prop declared any', () => {
  it('writes a structure as nothing, rather than as [object Object]', () => {
    expect(textOf({ city: 'Lyon' })).toBe('');
    expect(textOf({ toString: 1 })).toBe('');
  });

  it('writes a list as its entries, joined, leaving out the structures', () => {
    expect(textOf(['Lyon', 3, { a: 1 }, null])).toBe('Lyon, 3');
  });

  it('writes a scalar as it is', () => {
    expect(textOf(40)).toBe('40');
    expect(textOf(false)).toBe('false');
    expect(textOf(null)).toBe('');
  });
});
