// @vitest-environment jsdom
/**
 * The list control's two identity rules, asserted by rendering it.
 *
 * A row's field ID is its POSITION and a row's React key is its IDENTITY, and
 * the difference is the whole subject here. The position is what a host writes
 * an upload back to, so it must not move while one is in flight; the identity is
 * what React reconciles by, so a row's own DOM survives its neighbour going
 * away.
 */
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FileRunField, ListRunField, TextRunField } from '../../core';
import { ListField } from '../list-field';

const textItem: TextRunField = {
  kind: 'text',
  name: 'note',
  conceptRef: 'native.Text',
  required: true,
};
const docItem: FileRunField = {
  kind: 'document',
  name: 'cv',
  conceptRef: 'native.Document',
  required: true,
  accept: 'PDF',
};

const listOf = (item: ListRunField['item'], extra: Partial<ListRunField> = {}): ListRunField => ({
  kind: 'list',
  name: 'cvs',
  conceptRef: `${item.conceptRef}[]`,
  required: true,
  item,
  ...extra,
});

/** The control is controlled; a host holds the array. */
function Harness({
  field,
  initial,
  uploadingIds,
  id = 'cvs',
}: {
  field: ListRunField;
  initial: unknown[];
  uploadingIds?: ReadonlySet<string>;
  id?: string;
}) {
  const [value, setValue] = useState<unknown[]>(initial);
  return (
    <ListField field={field} value={value} onChange={setValue} id={id} env={{ uploadingIds }} />
  );
}

const removeButtons = () => screen.getAllByRole('button', { name: /remove item/i });
const addButton = () => screen.getByRole('button', { name: /add item/i });

describe('removal is blocked while a file is arriving in the list', () => {
  it('disables every remove button in the list', () => {
    render(
      <Harness
        field={listOf(docItem)}
        initial={[undefined, undefined, undefined]}
        uploadingIds={new Set(['cvs.1'])}
      />,
    );
    for (const button of removeButtons()) expect(button).toBeDisabled();
  });

  it('leaves them alone when nothing is uploading', () => {
    render(<Harness field={listOf(docItem)} initial={[undefined, undefined]} />);
    for (const button of removeButtons()) expect(button).not.toBeDisabled();
  });

  it('sees an upload inside a row, not only a row that IS one', () => {
    // A list of STRUCTURES holding a document uploads at `cvs.1.resume`, so an
    // exact-match test would have called this list idle.
    render(
      <Harness
        field={listOf(docItem)}
        initial={[undefined, undefined]}
        uploadingIds={new Set(['cvs.1.resume'])}
      />,
    );
    for (const button of removeButtons()) expect(button).toBeDisabled();
  });

  it('is not fooled by a sibling input whose name starts the same way', () => {
    render(
      <Harness
        field={listOf(docItem)}
        initial={[undefined, undefined]}
        uploadingIds={new Set(['cvs_extra.0'])}
      />,
    );
    for (const button of removeButtons()) expect(button).not.toBeDisabled();
  });

  it('still offers Add, because appending moves no existing row', () => {
    render(
      <Harness
        field={listOf(docItem)}
        initial={[undefined, undefined]}
        uploadingIds={new Set(['cvs.0'])}
      />,
    );
    expect(addButton()).not.toBeDisabled();
  });
});

describe('a declared item count is the end of the list', () => {
  it('stops offering Add once the slot is full', () => {
    render(<Harness field={listOf(docItem, { itemCount: 3 })} initial={[1, 2, 3]} />);
    expect(addButton()).toBeDisabled();
    expect(screen.getByText('3 of 3 items')).toBeInTheDocument();
  });

  it('offers it again while the slot is short', () => {
    render(<Harness field={listOf(docItem, { itemCount: 3 })} initial={[1, 2]} />);
    expect(addButton()).not.toBeDisabled();
    expect(screen.getByText('2 of 3 items')).toBeInTheDocument();
  });

  it('leaves a variable list uncounted and always addable', () => {
    render(<Harness field={listOf(docItem)} initial={[1, 2, 3]} />);
    expect(addButton()).not.toBeDisabled();
    expect(screen.getByText('3 items')).toBeInTheDocument();
  });
});

describe('a row keeps its own DOM when a sibling is removed', () => {
  it('moves the surviving rows instead of renumbering them into each other', async () => {
    const user = userEvent.setup();
    render(<Harness field={listOf(textItem)} initial={['alpha', 'beta', 'gamma']} />);

    const before = screen.getAllByRole('textbox') as HTMLInputElement[];
    const [first, , third] = before as [HTMLInputElement, HTMLInputElement, HTMLInputElement];

    await user.click(removeButtons()[0] as HTMLElement);

    // Keyed by position, React would have kept the first two DOM nodes and
    // unmounted the last - so the node that had held `gamma` would be gone and
    // the one that had held `alpha` would now be showing `beta`, carrying every
    // piece of state that node owned (a caret, a scroll offset, an open URL
    // toggle on a file row) onto its neighbour's value.
    const remaining = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(remaining.map((input) => input.value)).toEqual(['beta', 'gamma']);
    expect(remaining[1]).toBe(third);
    expect(first.isConnected).toBe(false);
  });

  it('renumbers the visible labels even so - the position is still the position', async () => {
    const user = userEvent.setup();
    render(<Harness field={listOf(textItem)} initial={['alpha', 'beta']} />);

    await user.click(removeButtons()[0] as HTMLElement);

    expect(removeButtons()).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Remove item 1' })).toBeInTheDocument();
  });
});
