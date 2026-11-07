/**
 * The chrome around a control must never remount it.
 *
 * In `app`, a field in error is outlined by a wrapper around its control. The
 * wrapper used to be rendered only while the field was in error, so the element
 * at that position changed type whenever the error came or went, and React
 * remounted the control under the user's fingers: a host that clears an error
 * as the user types took the focus, and the keystroke after the first, with it.
 */
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RunField } from '../../core';
import { DOCUMENT_FORMATS } from '../../core/file-formats';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { FieldRenderer } from '../field-renderer';

/** A host that shows an error until the value changes, as a submitted form does. */
function Host({ field, presentation }: { field: RunField; presentation: FieldPresentation }) {
  const [value, setValue] = useState<unknown>(undefined);
  const [error, setError] = useState<string | undefined>('Required');
  return (
    <FieldPresentationProvider presentation={presentation}>
      <FieldRenderer
        field={field}
        value={value}
        onChange={(next) => {
          setError(undefined);
          setValue(next);
        }}
        id={field.name}
        error={error}
      />
    </FieldPresentationProvider>
  );
}

const note: RunField = { kind: 'text', name: 'note', conceptRef: 'native.Text', required: true };
const cv: RunField = {
  kind: 'document',
  name: 'cv',
  conceptRef: 'native.Document',
  required: true,
  formats: DOCUMENT_FORMATS,
};

describe('an error that clears as the user types keeps the control mounted', () => {
  for (const presentation of ['app', 'studio'] as const) {
    it(`keeps focus and every keystroke in a text field, in ${presentation}`, async () => {
      const user = userEvent.setup();
      render(<Host field={note} presentation={presentation} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'ab');
      expect(screen.getByRole('textbox')).toBe(input);
      expect(input).toHaveFocus();
      expect(input).toHaveValue('ab');
    });
  }

  it('keeps them in the link input of a link-only file field, in app', async () => {
    const user = userEvent.setup();
    render(<Host field={cv} presentation="app" />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'https://x');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('https://x');
  });
});

/**
 * What `app` shows under a label: a description that adds to it, else the
 * control's own hint (a number's range), and nothing when there is neither.
 */
describe('the line under a label, in an app', () => {
  const renderIn = (field: RunField, presentation: FieldPresentation = 'app') =>
    render(
      <FieldPresentationProvider presentation={presentation}>
        <FieldRenderer field={field} value={undefined} onChange={() => {}} id={field.name} />
      </FieldPresentationProvider>,
    );

  const arriving: RunField = {
    kind: 'date',
    name: 'arriving_on',
    conceptRef: 'native.Date',
    required: true,
    datetime: false,
    description: 'The day they arrive',
  };

  it('leaves out a description that restates the label', () => {
    renderIn(arriving);
    expect(screen.getByLabelText('Arriving on')).toBeInTheDocument();
    expect(screen.queryByText('The day they arrive')).toBeNull();
  });

  it('keeps it in studio', () => {
    renderIn(arriving, 'studio');
    expect(screen.getByText('The day they arrive')).toBeInTheDocument();
  });

  it("shows a number's range in place of a description it leaves out", () => {
    renderIn({
      kind: 'number',
      name: 'age',
      conceptRef: 'native.Number',
      required: true,
      integer: true,
      min: 0,
      max: 120,
      description: 'Their age',
    });
    expect(screen.queryByText('Their age')).toBeNull();
    expect(screen.getByText('0 – 120')).toBeInTheDocument();
  });

  it('marks an optional field with the word, not a tag', () => {
    renderIn({ ...arriving, required: false });
    expect(screen.getByText('Optional').className).not.toContain('uppercase');
  });
});

/**
 * The date's face: muted while it holds no whole date, so the browser's
 * `mm/dd/yyyy` pattern does not read as a value someone typed.
 */
describe("the date's empty face", () => {
  const date: RunField = {
    kind: 'date',
    name: 'arriving_on',
    conceptRef: 'native.Date',
    required: true,
    datetime: false,
  };

  it('is marked empty with no value, and not once a date is in it', () => {
    const { rerender } = render(
      <FieldRenderer field={date} value={undefined} onChange={() => {}} id="d" />,
    );
    expect(screen.getByLabelText('arriving_on')).toHaveAttribute('data-empty');
    rerender(<FieldRenderer field={date} value="2026-05-14" onChange={() => {}} id="d" />);
    expect(screen.getByLabelText('arriving_on')).not.toHaveAttribute('data-empty');
  });
});
