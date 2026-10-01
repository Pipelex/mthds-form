/**
 * An optional structure's presence switch, asserted as DOM facts: a switch
 * with an accessible name in the structure's header, ON exactly when the value
 * holds an object, writing `undefined` when turned off and the kernel's seed
 * when turned on, and never folded behind the parent's optional disclosure.
 */
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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
  title: 'Bank account',
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

describe('the presence switch', () => {
  it('sits in an optional structure, named by its words and the structure label', () => {
    render(<Harness field={bank} />);
    const toggle = screen.getByRole('switch', { name: 'Include Bank account' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    // No optional badge beside it: the switch says the structure is optional.
    expect(screen.queryByText('optional')).not.toBeInTheDocument();
  });

  it('is absent on a required structure', () => {
    render(<Harness field={shop([text('nom')])} />);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('hides the body while off and seeds the defaults when turned on', async () => {
    render(<Harness field={bank} />);
    expect(screen.queryByLabelText('titulaire')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('switch'));

    expect(valueOf()).toEqual({ titulaire: 'Atlas SAS', iban: 'FR76' });
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('titulaire')).toHaveValue('Atlas SAS');
  });

  it('reads ON from a value the host seeded, even an empty one, and turning it off clears it', async () => {
    render(<Harness field={bank} initial={{}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(screen.getByRole('switch'));

    expect(valueOf()).toBeNull();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.queryByLabelText('iban')).not.toBeInTheDocument();
  });

  it('is never folded behind the parent disclosure, nor counted by it', async () => {
    render(<Harness field={shop([text('nom'), text('note', { required: false }), bank])} />);
    // The structure's switch shows with the disclosure still closed...
    const toggle = screen.getByRole('switch', { name: /bank account/i });
    // ...and the disclosure counts the one plain optional field alone.
    expect(screen.getByRole('button', { name: '1 optional field' })).toBeInTheDocument();

    await userEvent.click(toggle);
    expect(valueOf()).toEqual({ compte_bancaire: { titulaire: 'Atlas SAS', iban: 'FR76' } });

    await userEvent.click(screen.getByRole('switch', { name: /bank account/i }));
    // `undefined` at its key: the structure is absent, and JSON drops the key.
    expect(valueOf()).toEqual({});
  });

  it('works at depth three', async () => {
    const address: ObjectRunField = {
      kind: 'object',
      name: 'adresse',
      required: false,
      fields: [text('rue')],
    };
    const nested: ObjectRunField = { ...bank, fields: [...bank.fields, address] };
    render(<Harness field={shop([text('nom'), nested])} initial={{ nom: 'Lille' }} />);

    await userEvent.click(screen.getByRole('switch', { name: /bank account/i }));
    // The inner structure has no default to seed, so turning its parent on leaves it off.
    const inner = screen.getByRole('switch', { name: /adresse/i });
    expect(inner).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(inner);
    expect(valueOf()).toEqual({
      nom: 'Lille',
      compte_bancaire: { titulaire: 'Atlas SAS', iban: 'FR76', adresse: {} },
    });
  });

  it('speaks French through the strings seam', () => {
    render(
      <FieldStringsProvider locale="fr">
        <Harness field={bank} />
      </FieldStringsProvider>,
    );
    expect(screen.getByRole('switch', { name: 'Renseigner Bank account' })).toBeInTheDocument();
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
    expect(within(document.body).getByRole('switch')).toBeDisabled();
  });
});
