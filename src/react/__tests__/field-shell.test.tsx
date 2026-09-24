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
