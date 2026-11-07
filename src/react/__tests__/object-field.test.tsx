// @vitest-environment jsdom
/**
 * The object control reads a child's name as a NAME, not as an index into a
 * prototype.
 *
 * Every key this package indexes a record by is chosen by the method author,
 * and the record here is a plain object a host built - so a child named
 * `constructor` or `toString` does not read as `undefined` from a bare
 * `data[name]`, it reads as the inherited function. The kernel closed that at
 * every one of its own sites (`ownProp`); this file is the control set's half,
 * and it is asserted by rendering because what goes wrong is a DOM fact: a
 * switch that says ON over an absent value, and a list that throws.
 */
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { BooleanRunField, ListRunField, ObjectRunField, TextRunField } from '../../core';
import { ObjectField } from '../object-field';
import { FieldRenderer } from '../field-renderer';

const flag = (name: string): BooleanRunField => ({
  kind: 'boolean',
  name,
  conceptRef: 'native.YesNo',
  required: true,
});
const note = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: false,
});
const listOf = (name: string): ListRunField => ({
  kind: 'list',
  name,
  conceptRef: 'native.Text[]',
  required: true,
  item: { kind: 'text', name: 'item', conceptRef: 'native.Text', required: true },
});

const structOf = (fields: ObjectRunField['fields']): ObjectRunField => ({
  kind: 'object',
  name: 'brief',
  conceptRef: 'demo.Brief',
  required: true,
  fields,
});

/** The control is controlled; a host holds the record. */
function Harness({
  field,
  initial = {},
}: {
  field: ObjectRunField;
  initial?: Record<string, unknown>;
}) {
  const [value, setValue] = useState<Record<string, unknown> | undefined>(initial);
  return <ObjectField field={field} value={value} onChange={setValue} id="brief" />;
}

describe('a child whose name collides with Object.prototype', () => {
  it('renders a boolean child as OFF when the record holds nothing for it', () => {
    // `checked={value ?? false}` - an inherited function is neither nullish nor
    // falsy, so the switch used to render ON over a value that is not there,
    // contradicting the readiness the same name reports.
    render(<Harness field={structOf([flag('constructor')])} />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('renders a list child without throwing', () => {
    // `value ?? []` keeps the function; `Object.length` is 1, so the empty-state
    // branch is skipped and `items.map` is `undefined` - a TypeError that takes
    // the whole form down, not just this row.
    expect(() => render(<Harness field={structOf([listOf('constructor')])} />)).not.toThrow();

    expect(screen.getByText(/no items yet/i)).toBeInTheDocument();
  });

  it('still counts a prototype-named optional child as empty', () => {
    // The half that already worked, pinned so the read change is provably
    // read-only here: `isFilled` answers `false` for a function, so the
    // collapse count was right even while the value passed down was wrong.
    render(<Harness field={structOf([flag('shown'), note('toString')])} />);

    expect(screen.getByRole('button', { name: /1 optional/i })).toBeInTheDocument();
  });
});

/**
 * How a structure groups its fields, by where it stands. A structure that is a
 * form's own field draws one card; one inside another hangs its fields from a
 * rule rather than drawing a second card inside the first, which on a phone
 * took the width a field needed; and a list's row, which is a box already,
 * adds nothing around its structure's fields.
 */
describe('how a structure groups its fields', () => {
  const stay: ObjectRunField = {
    kind: 'object',
    name: 'stay',
    conceptRef: 'demo.Stay',
    required: true,
    fields: [{ kind: 'text', name: 'city', conceptRef: 'native.Text', required: true }],
  };
  const traveller: ObjectRunField = {
    kind: 'object',
    name: 'traveller',
    conceptRef: 'demo.Traveller',
    required: true,
    fields: [
      { kind: 'text', name: 'name', conceptRef: 'native.Text', required: true },
      { ...stay, name: 'home' },
    ],
  };
  const travellers: ListRunField = {
    kind: 'list',
    name: 'travellers',
    conceptRef: 'demo.Traveller[]',
    required: true,
    item: traveller,
  };
  const request = structOf([stay, travellers]);

  /** The grouping drawn around the fields of the structure a text input sits in. */
  function groupingAround(input: HTMLElement): string | null {
    return input.closest('[data-structure-group]')?.getAttribute('data-structure-group') ?? null;
  }

  it('boxes a form’s own structure and rules the one inside it', () => {
    const { container } = render(
      <Harness field={request} initial={{ stay: { city: 'Lisbon' }, travellers: [] }} />,
    );
    const groups = [...container.querySelectorAll('[data-structure-group]')].map((group) =>
      group.getAttribute('data-structure-group'),
    );
    // The request's own card, then the stay's rule inside it.
    expect(groups).toEqual(['box', 'rule']);
    expect(groupingAround(screen.getByDisplayValue('Lisbon'))).toBe('rule');
  });

  it("draws nothing around a row's structure, and rules a structure inside the row", () => {
    render(
      <Harness
        field={request}
        initial={{
          stay: { city: 'Lisbon' },
          travellers: [{ name: 'Ada', home: { city: 'London' } }],
        }}
      />,
    );
    expect(groupingAround(screen.getByDisplayValue('Ada'))).toBe('none');
    expect(groupingAround(screen.getByDisplayValue('London'))).toBe('rule');
  });

  it("counts a row's structure, so a structure in a form's own list is ruled and not boxed", () => {
    // The list is the form's own field, so nothing above it is a structure.
    // Were the row's structure not counted, the one inside it would read as a
    // form's own and draw a card inside the row's box.
    function ListHarness() {
      const [value, setValue] = useState<unknown>([{ name: 'Ada', home: { city: 'London' } }]);
      return <FieldRenderer field={travellers} value={value} onChange={setValue} id="travellers" />;
    }
    render(<ListHarness />);
    expect(groupingAround(screen.getByDisplayValue('Ada'))).toBe('none');
    expect(groupingAround(screen.getByDisplayValue('London'))).toBe('rule');
  });
});
