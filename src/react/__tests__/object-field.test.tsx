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
  const [value, setValue] = useState<Record<string, unknown>>(initial);
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
