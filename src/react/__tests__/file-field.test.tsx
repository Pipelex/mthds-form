// @vitest-environment jsdom
/**
 * The file control, rendered.
 *
 * Everything filed against it is a DOM fact - an input with no accessible name,
 * a button still live while an upload is in flight, a preview showing the file
 * before last - and none of it is visible from a unit test of a pure function.
 * This is the suite whose absence is why three of them shipped.
 */
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FileRunField } from '../../core';
import { DocumentField, type FileValue } from '../file-field';

const field: FileRunField = {
  kind: 'document',
  name: 'cv',
  conceptRef: 'native.Document',
  required: true,
  accept: 'PDF',
};

const noop = () => {};

beforeAll(() => {
  // jsdom implements neither, and the control makes an object URL on every drop.
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
});

const fileInput = () => screen.getByLabelText('cv') as HTMLInputElement;
const urlToggle = () => screen.getByRole('button', { name: /paste a url instead/i });
const previewButton = () => screen.queryByRole('button', { name: /^preview$/i });

function renderField(props: Partial<Parameters<typeof DocumentField>[0]> = {}) {
  return render(
    <DocumentField
      field={field}
      value={undefined}
      onDropFile={noop}
      onChange={noop}
      id="cv"
      {...props}
    />,
  );
}

describe('the file input is a named control', () => {
  it('takes its name from the field label, like every other control in the set', () => {
    renderField();
    expect(fileInput()).toBeInTheDocument();
    expect(fileInput().type).toBe('file');
  });

  it('is the element that takes focus, so the tab stop has a role and a name', () => {
    // react-dropzone's default is the opposite: `tabIndex: 0` on a
    // `role="presentation"` div, with the real input at `tabIndex: -1`. That
    // lands a keyboard or voice-control user on an unnamed generic.
    const { container } = renderField();
    const root = container.querySelector('[role="presentation"]') as HTMLElement;

    expect(fileInput().tabIndex).toBe(0);
    expect(root.hasAttribute('tabindex')).toBe(false);
  });
});

describe('an upload in flight shuts every door into the value', () => {
  it('disables the dropzone input and the URL affordances together', async () => {
    const user = userEvent.setup();
    const { rerender } = renderField();

    // The toggle has to be opened while the field is idle: the point is that the
    // input behind it is disabled too, not merely unreachable.
    await user.click(urlToggle());
    const url = screen.getByPlaceholderText(/https/i);
    expect(url).not.toBeDisabled();

    rerender(
      <DocumentField
        field={field}
        value={undefined}
        onDropFile={noop}
        onChange={noop}
        id="cv"
        uploading
      />,
    );

    expect(screen.getByPlaceholderText(/https/i)).toBeDisabled();
    expect(fileInput()).toBeDisabled();
  });

  it('disables the "paste a URL instead" toggle as well', () => {
    renderField({ uploading: true });
    expect(urlToggle()).toBeDisabled();
  });

  it('leaves them alone when the field is merely idle', () => {
    renderField();
    expect(urlToggle()).not.toBeDisabled();
    expect(fileInput()).not.toBeDisabled();
  });
});

describe('what the control decides it can preview', () => {
  it('reads the filename, not just the URL', () => {
    // The two used to be concatenated into one string and matched with an
    // end-anchored extension test, so a filename's extension was always
    // followed by a space and could never match - and a storage URI with a
    // perfectly good filename beside it was offered no preview at all.
    renderField({ value: { filename: 'invoice.pdf', url: 'pipelex-storage://bucket/abc123' } });
    expect(previewButton()).toBeInTheDocument();
  });

  it('offers none when neither the filename nor the URL says what it is', () => {
    renderField({ value: { filename: 'invoice', url: 'pipelex-storage://bucket/abc123' } });
    expect(previewButton()).not.toBeInTheDocument();
  });

  it('reads the MIME type a data URL declares', () => {
    renderField({ value: { url: 'data:application/pdf;base64,QUFB' } });
    expect(previewButton()).toBeInTheDocument();
  });
});

describe('a preview that needs no resolver does not wait for one', () => {
  const spinner = (container: HTMLElement) => container.querySelector('.animate-spin');

  it('renders a data URL directly when the host supplies no resolveUrl', async () => {
    const user = userEvent.setup();
    const { container } = renderField({
      value: { filename: 'sample.pdf', url: 'data:application/pdf;base64,QUFB' },
    });

    await user.click(previewButton() as HTMLElement);

    expect(spinner(container)).toBeNull();
    expect(container.querySelector('object')?.getAttribute('data')).toBe(
      'data:application/pdf;base64,QUFB#view=FitH',
    );
  });

  it('still waits for one on a URI only the host can resolve', async () => {
    const user = userEvent.setup();
    const { container } = renderField({
      value: { filename: 'sample.pdf', url: 'pipelex-storage://bucket/abc123' },
    });

    await user.click(previewButton() as HTMLElement);

    expect(spinner(container)).not.toBeNull();
  });
});

/** A host that owns the value, which is the seam the control is built around. */
function HostOwnedField({ initial }: { initial?: FileValue }) {
  const [value, setValue] = useState<FileValue | undefined>(initial);
  return (
    <>
      <DocumentField field={field} value={value} onDropFile={noop} onChange={setValue} id="cv" />
      <button type="button" onClick={() => setValue({ filename: 'a.pdf', url: DATA_A })}>
        host writes A
      </button>
      <button type="button" onClick={() => setValue({ filename: 'b.pdf', url: DATA_B })}>
        host writes B
      </button>
    </>
  );
}

const DATA_A = 'data:application/pdf;base64,QUFB';
const DATA_B = 'data:application/pdf;base64,QkJC';

describe('the local preview belongs to the value it was made for', () => {
  it('is retired when the host writes a different file at the same path', async () => {
    const user = userEvent.setup();
    const { container } = render(<HostOwnedField />);

    await user.upload(fileInput(), new File(['pdf'], 'dropped.pdf', { type: 'application/pdf' }));
    // The host's upload lands: the control adopts this URL as the one its
    // object URL is the preview of.
    await user.click(screen.getByRole('button', { name: 'host writes A' }));
    await user.click(previewButton() as HTMLElement);
    expect(container.querySelector('object')?.getAttribute('data')).toBe(
      'blob:local-preview#view=FitH',
    );

    // A second write is not this control's upload landing - it is a different
    // file. The chip used to say B over a preview showing A.
    await user.click(screen.getByRole('button', { name: 'host writes B' }));
    expect(container.querySelector('object')?.getAttribute('data')).toBe(`${DATA_B}#view=FitH`);
  });
});
