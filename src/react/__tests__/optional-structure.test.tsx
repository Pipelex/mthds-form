/**
 * An optional structure inside a structure, asserted as DOM facts: while
 * closed it folds behind the parent's "+ N optional" disclosure and is counted
 * there; expanding the disclosure opens it with the kernel's seed, collapsing
 * closes it to `undefined`; the disclosure reads expanded while any optional
 * structure is open; and an open one carries no toggle or badge of its own.
 */
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ObjectRunField, RunField, TextRunField } from '../../core';
import { ObjectField } from '../object-field';
import { FieldStringsProvider } from '../field-strings';

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
    text('titulaire', { required: false, defaultValue: 'Boutique Exemple SAS' }),
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

describe('an optional structure behind the optional disclosure', () => {
  it('folds while closed and is counted with the empty optional fields', () => {
    render(<Harness field={shop([text('nom'), text('note', { required: false }), bank])} />);
    const disclosure = screen.getByRole('button', { name: '2 optional fields' });
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Compte bancaire')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('note')).not.toBeInTheDocument();
  });

  it('opens with its seed when the disclosure expands, and closes when it collapses', async () => {
    render(
      <Harness
        field={shop([text('nom'), text('note', { required: false }), bank])}
        initial={{ nom: 'Exempleville' }}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '2 optional fields' }));

    expect(valueOf()).toEqual({
      nom: 'Exempleville',
      compte_bancaire: { titulaire: 'Boutique Exemple SAS', iban: 'FR76' },
    });
    expect(screen.getByText('Compte bancaire')).toBeInTheDocument();
    expect(screen.getByText('Where to pay the shop')).toBeInTheDocument();
    expect(screen.getByLabelText('titulaire')).toHaveValue('Boutique Exemple SAS');
    expect(screen.getByLabelText('note')).toBeInTheDocument();
    // No toggle and no badge of its own: the only button is the disclosure.
    expect(screen.getAllByRole('button')).toHaveLength(1);
    // The one badge is the plain optional field's; the structure carries none.
    expect(screen.getAllByText('optional')).toHaveLength(1);

    const hide = screen.getByRole('button', { name: 'Hide optional fields' });
    expect(hide).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(hide);

    // `undefined` at its key: the structure is absent, and JSON drops the key.
    expect(valueOf()).toEqual({ nom: 'Exempleville' });
    expect(screen.queryByText('Compte bancaire')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('note')).not.toBeInTheDocument();
  });

  it('reads expanded over a restored value that holds one, and closing removes it', async () => {
    render(
      <Harness
        field={shop([text('nom'), bank])}
        initial={{ nom: 'Exempleville', compte_bancaire: { iban: 'FR76 1234' } }}
      />,
    );
    expect(screen.getByLabelText('iban')).toHaveValue('FR76 1234');
    const hide = screen.getByRole('button', { name: 'Hide optional fields' });
    expect(hide).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(hide);

    expect(valueOf()).toEqual({ nom: 'Exempleville' });
    expect(screen.getByRole('button', { name: '1 optional field' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('leaves a filled optional field visible when it closes the structures', async () => {
    render(
      <Harness
        field={shop([text('nom'), text('note', { required: false }), bank])}
        initial={{ nom: 'Exempleville', note: 'kept', compte_bancaire: {} }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Hide optional fields' }));
    expect(valueOf()).toEqual({ nom: 'Exempleville', note: 'kept' });
    expect(screen.getByLabelText('note')).toHaveValue('kept');
  });

  it('works at depth three, each level through its own disclosure', async () => {
    const address: ObjectRunField = {
      kind: 'object',
      name: 'adresse',
      required: false,
      fields: [text('rue', { required: false, defaultValue: 'Gare' })],
    };
    const nested: ObjectRunField = { ...bank, fields: [...bank.fields, address] };
    render(<Harness field={shop([text('nom'), nested])} initial={{ nom: 'Exempleville' }} />);

    await userEvent.click(screen.getByRole('button', { name: '1 optional field' }));
    // The inner structure starts closed, defaults and all: it folds behind the
    // account's own disclosure.
    expect(screen.queryByText('adresse')).not.toBeInTheDocument();
    expect(valueOf()).toEqual({
      nom: 'Exempleville',
      compte_bancaire: { titulaire: 'Boutique Exemple SAS', iban: 'FR76' },
    });

    await userEvent.click(screen.getByRole('button', { name: '1 optional field' }));
    expect(valueOf()).toEqual({
      nom: 'Exempleville',
      compte_bancaire: {
        titulaire: 'Boutique Exemple SAS',
        iban: 'FR76',
        adresse: { rue: 'Gare' },
      },
    });

    // Collapsing the outer disclosure closes the account, and the address with it.
    const hides = screen.getAllByRole('button', { name: 'Hide optional fields' });
    await userEvent.click(hides[hides.length - 1]!);
    expect(valueOf()).toEqual({ nom: 'Exempleville' });
  });

  it('speaks the existing French strings', () => {
    render(
      <FieldStringsProvider locale="fr">
        <Harness field={shop([text('nom'), bank])} />
      </FieldStringsProvider>,
    );
    expect(screen.getByRole('button', { name: '1 champ facultatif' })).toBeInTheDocument();
  });
});
