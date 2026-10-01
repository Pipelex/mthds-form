/**
 * An optional structure's presence toggle, asserted as DOM facts: closed, the
 * field is a single "+ <label>" disclosure button and no card; opening it
 * writes the kernel's seed and shows the card under a "- <label>" button;
 * closing it writes `undefined`. The button states itself with
 * `aria-expanded`, reads the value rather than local state, and is never
 * folded behind (or counted by) the parent's optional disclosure.
 */
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ObjectRunField, RunField, TextRunField } from '../../core';
import { ObjectField } from '../object-field';

const text = (name: string, extra: Partial<TextRunField> = {}): TextRunField => ({
  kind: 'text',
  name,
  required: true,
  ...extra,
});

const bank: ObjectRunField = {
  kind: 'object',
  name: 'compte_bancaire',
  title: 'Compte bancaire',
  description: 'Where to pay the shop',
  required: false,
  fields: [
    text('titulaire', { required: false, defaultValue: 'Atlas SAS' }),
    text('iban', { required: false, defaultValue: 'FR76' }),
  ],
};

const shop = (fields: RunField[]): ObjectRunField => ({
  kind: 'object',
  name: 'boutique',
  required: true,
  fields,
});

/** A controlled host that shows the value it holds, so a test reads it back. */
function Harness({ field, initial }: { field: ObjectRunField; initial?: Record<string, unknown> }) {
  const [value, setValue] = useState<Record<string, unknown> | undefined>(initial);
  return (
    <>
      <ObjectField field={field} value={value} onChange={setValue} id="boutique" />
      <output data-testid="value">{JSON.stringify(value ?? null)}</output>
    </>
  );
}

const valueOf = () => JSON.parse(screen.getByTestId('value').textContent ?? 'null');
const toggleFor = (name: RegExp | string) => screen.getByRole('button', { name });

describe('the presence toggle', () => {
  it('is, while closed, a single collapsed button named by the label, with no card', () => {
    render(<Harness field={bank} />);
    const button = toggleFor('Compte bancaire');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText('titulaire')).not.toBeInTheDocument();
    expect(screen.queryByText('Where to pay the shop')).not.toBeInTheDocument();
    expect(screen.queryByText('optional')).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('is absent on a required structure', () => {
    render(<Harness field={shop([text('nom')])} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens by writing the seed, and shows the card', async () => {
    render(<Harness field={bank} />);

    await userEvent.click(toggleFor('Compte bancaire'));

    expect(valueOf()).toEqual({ titulaire: 'Atlas SAS', iban: 'FR76' });
    expect(toggleFor('Compte bancaire')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('titulaire')).toHaveValue('Atlas SAS');
    expect(screen.getByText('Where to pay the shop')).toBeInTheDocument();
  });

  it('reads open from a value the host seeded, even an empty one, and closing clears it', async () => {
    render(<Harness field={bank} initial={{}} />);
    expect(toggleFor('Compte bancaire')).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(toggleFor('Compte bancaire'));

    expect(valueOf()).toBeNull();
    expect(toggleFor('Compte bancaire')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText('iban')).not.toBeInTheDocument();
  });

  it('is never folded behind the parent disclosure, nor counted by it', async () => {
    render(<Harness field={shop([text('nom'), text('note', { required: false }), bank])} />);
    // The structure's own button shows with the parent's disclosure closed...
    const own = toggleFor('Compte bancaire');
    // ...and the disclosure counts the one plain optional field alone.
    expect(toggleFor('1 optional field')).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(own);
    expect(valueOf()).toEqual({ compte_bancaire: { titulaire: 'Atlas SAS', iban: 'FR76' } });

    await userEvent.click(toggleFor('Compte bancaire'));
    // `undefined` at its key: the structure is absent, and JSON drops the key.
    expect(valueOf()).toEqual({});
  });

  it('works at depth three', async () => {
    const address: ObjectRunField = {
      kind: 'object',
      name: 'adresse',
      required: false,
      fields: [text('rue', { required: false, defaultValue: 'Neuve' })],
    };
    const nested: ObjectRunField = { ...bank, fields: [...bank.fields, address] };
    render(<Harness field={shop([text('nom'), nested])} initial={{ nom: 'Lille' }} />);

    await userEvent.click(toggleFor('Compte bancaire'));
    // The inner structure starts closed, defaults and all: opening is a choice.
    const inner = toggleFor('adresse');
    expect(inner).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(inner);
    expect(valueOf()).toEqual({
      nom: 'Lille',
      compte_bancaire: { titulaire: 'Atlas SAS', iban: 'FR76', adresse: { rue: 'Neuve' } },
    });
  });

  it('is disabled with the form', () => {
    render(
      <ObjectField
        field={bank}
        value={undefined}
        onChange={() => {}}
        id="b"
        env={{ disabled: true }}
      />,
    );
    expect(toggleFor('Compte bancaire')).toBeDisabled();
  });
});
