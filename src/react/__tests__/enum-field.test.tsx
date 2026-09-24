// @vitest-environment jsdom
/**
 * The enum control shows an option in the words its presentation reads in, and
 * stores the code whatever it shows.
 *
 * A result and the form that produced it show the same fields, so they must
 * read the same way: in `app` the result view says "Hold for review" for
 * `hold_for_review`, and a form offering the same choice as the code would be
 * the label divergence the presentation switch exists to prevent, one level
 * down. What must NOT follow the label is the value - the run receives the
 * code the method declared, never the words a person read.
 */
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EnumRunField } from '../../core';
import { EnumField } from '../enum-field';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';

const choice = (options: string[]): EnumRunField => ({
  kind: 'enum',
  name: 'verdict',
  conceptRef: 'demo.Verdict',
  required: true,
  options,
});

/** The control is controlled; a host holds the value. */
function Harness({
  field,
  presentation,
  initial,
  seen,
}: {
  field: EnumRunField;
  presentation: FieldPresentation;
  initial?: string;
  seen?: (value: string | undefined) => void;
}) {
  const [value, setValue] = useState<string | undefined>(initial);
  return (
    <FieldPresentationProvider presentation={presentation}>
      <EnumField
        field={field}
        value={value}
        onChange={(next) => {
          seen?.(next);
          setValue(next);
        }}
        id="verdict"
      />
    </FieldPresentationProvider>
  );
}

describe('the options follow the presentation', () => {
  const field = choice(['approve', 'hold_for_review', 'HIGH_RISK']);

  it('shows the codes verbatim in studio', () => {
    render(<Harness field={field} presentation="studio" />);
    expect(screen.getByRole('radio', { name: 'hold_for_review' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'HIGH_RISK' })).toBeTruthy();
    expect(screen.queryByText('Hold for review')).toBeNull();
  });

  it('shows them in words in app', () => {
    render(<Harness field={field} presentation="app" />);
    expect(screen.getByRole('radio', { name: 'Approve' })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Hold for review' })).toBeTruthy();
    // An all-caps code is lowercased before it is worded, so it reads as a
    // label rather than as an alarm.
    expect(screen.getByRole('radio', { name: 'High risk' })).toBeTruthy();
    expect(screen.queryByText('hold_for_review')).toBeNull();
  });

  it('stores the code when the words are picked', async () => {
    const values: (string | undefined)[] = [];
    render(<Harness field={field} presentation="app" seen={(value) => values.push(value)} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Hold for review' }));
    expect(values).toEqual(['hold_for_review']);
  });

  it('names the picked option in words on the select too', () => {
    // Past four options the control is a select, and its trigger shows the
    // picked option's label - the same words the list offered.
    const long = choice(['matches_po', 'unit_price_differs_from_po', 'not_on_po', 'late', 'other']);
    render(<Harness field={long} presentation="app" initial="unit_price_differs_from_po" />);
    expect(screen.getByRole('combobox')).toHaveTextContent('Unit price differs from po');
    expect(screen.queryByText('unit_price_differs_from_po')).toBeNull();
  });
});

describe('the segmented rule measures the label it shows', () => {
  // A contrived code, and deliberately so: humanising never lengthens a code,
  // and only a run of separators makes it shorter. It is the one shape that
  // tells "measures the label" apart from "measures the code" - eighteen
  // characters as a code, sixteen as the words a person reads.
  const field = choice(['needs__review__now', 'done']);

  it('fits the row in app, where the label is short enough', () => {
    render(<Harness field={field} presentation="app" />);
    expect(screen.getByRole('radio', { name: 'Needs review now' })).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('falls back to a select in studio, where the code is not', () => {
    render(<Harness field={field} presentation="studio" />);
    expect(screen.getByRole('combobox')).toBeTruthy();
    expect(screen.queryByRole('radio')).toBeNull();
  });
});
