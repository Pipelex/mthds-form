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
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

/** A host that owns the value and resolves storage URIs on demand. */
function ResolvingField({
  initial,
  resolveUrl,
}: {
  initial: FileValue;
  resolveUrl: (uri: string) => Promise<string | null>;
}) {
  const [value, setValue] = useState<FileValue>(initial);
  return (
    <>
      <DocumentField
        field={field}
        value={value}
        onDropFile={noop}
        onChange={(v) => setValue(v as FileValue)}
        id="cv"
        resolveUrl={resolveUrl}
      />
      <button type="button" onClick={() => setValue({ filename: 'b.pdf', url: URI_B })}>
        host writes B
      </button>
    </>
  );
}

const URI_A = 'pipelex-storage://bucket/a';
const URI_B = 'pipelex-storage://bucket/b';

describe('the resolved preview belongs to the URI it was resolved from', () => {
  const spinner = (container: HTMLElement) => container.querySelector('.animate-spin');
  const previewSrc = (container: HTMLElement) =>
    container.querySelector('object')?.getAttribute('data');

  it('stops showing the previous file the moment the value moves on', async () => {
    // `resolvedSrc` was a bare string with no record of which URI produced it,
    // and it is the last fallback the preview reaches for - so between the
    // host's write and the next resolution, the chip named B over a preview
    // still painting A. The local preview carries `boundUrl` for exactly this
    // reason; the resolved one was never given the same binding.
    const user = userEvent.setup();
    let releaseB: (src: string) => void = noop;
    const resolveUrl = vi.fn((uri: string) =>
      uri === URI_A
        ? Promise.resolve('https://signed/a.pdf')
        : new Promise<string>((resolve) => {
            releaseB = resolve;
          }),
    );

    const { container } = render(
      <ResolvingField initial={{ filename: 'a.pdf', url: URI_A }} resolveUrl={resolveUrl} />,
    );

    await user.click(previewButton() as HTMLElement);
    await waitFor(() => expect(previewSrc(container)).toBe('https://signed/a.pdf#view=FitH'));

    await user.click(screen.getByRole('button', { name: 'host writes B' }));

    // B has not resolved yet, so there is nothing to show - and what there is
    // to show must not be A.
    expect(previewSrc(container)).toBeUndefined();
    expect(spinner(container)).not.toBeNull();

    releaseB('https://signed/b.pdf');
    await waitFor(() => expect(previewSrc(container)).toBe('https://signed/b.pdf#view=FitH'));
  });

  it('leaves the spinner when the resolver answers with nothing at all', async () => {
    // The twin of the rejection below, and the one that survived it: a resolver
    // that RESOLVES with `null` is saying it has no URL, and skipping the state
    // write on an empty answer left the previous one standing. Nothing here
    // even moves URI - reopening the SAME file after its signed URL expired
    // kept painting the dead URL under a resolver that had just declined it.
    const user = userEvent.setup();
    let call = 0;
    const resolveUrl = vi.fn(() =>
      Promise.resolve(call++ === 0 ? 'https://signed/a.pdf?expires=soon' : null),
    );

    const { container } = render(
      <ResolvingField initial={{ filename: 'a.pdf', url: URI_A }} resolveUrl={resolveUrl} />,
    );

    await user.click(previewButton() as HTMLElement);
    await waitFor(() =>
      expect(previewSrc(container)).toBe('https://signed/a.pdf?expires=soon#view=FitH'),
    );

    // Close and reopen: same file, same URI, and the URL behind it has expired.
    await user.click(previewButton() as HTMLElement);
    await user.click(previewButton() as HTMLElement);

    await waitFor(() => expect(spinner(container)).not.toBeNull());
    expect(previewSrc(container)).toBeUndefined();
    expect(resolveUrl).toHaveBeenCalledTimes(2);
  });

  it('leaves the spinner, not the wrong file, when a resolution fails', async () => {
    // A rejecting resolver is ordinary - it is a network call. Without a
    // `.catch` the rejection also escaped as an unhandled promise rejection
    // into the host's app, which is what this test fails on if one is missing.
    const user = userEvent.setup();
    const resolveUrl = vi.fn((uri: string) =>
      uri === URI_A ? Promise.resolve('https://signed/a.pdf') : Promise.reject(new Error('gone')),
    );

    const { container } = render(
      <ResolvingField initial={{ filename: 'a.pdf', url: URI_A }} resolveUrl={resolveUrl} />,
    );

    await user.click(previewButton() as HTMLElement);
    await waitFor(() => expect(previewSrc(container)).toBe('https://signed/a.pdf#view=FitH'));

    await user.click(screen.getByRole('button', { name: 'host writes B' }));

    await waitFor(() => expect(spinner(container)).not.toBeNull());
    expect(previewSrc(container)).toBeUndefined();
  });
});

describe('a file the slot cannot accept never reaches the host', () => {
  /**
   * The point is the ORDER, not the message. A host's `onDropFile` is a network
   * call and usually a billed one, so a file the runtime cannot decode has to be
   * refused before it is handed over - not uploaded and then complained about,
   * and not (as it was) accepted in silence under a label reading PDF, DOCX, TXT.
   *
   * These go through a DROP rather than the file input, and that is forced
   * rather than stylistic: the input now carries an `accept` attribute, so a
   * wrong file never becomes a pick at all - in jsdom exactly as in a real OS
   * picker. Drag-and-drop is the door that stays open, which is why the control
   * cannot rely on the attribute alone.
   */
  // `items` is deliberately absent. react-dropzone reads the drop through
  // `file-selector`, which PREFERS `dataTransfer.items` when the key exists -
  // so passing an empty array is a drop of zero files, and the control is right
  // to do nothing with it.
  const drop = (file: File) => {
    const root = document.querySelector('[role="presentation"]');
    if (!root) throw new Error('no dropzone root');
    fireEvent.drop(root, { dataTransfer: { files: [file], types: ['Files'] } });
  };

  const zip = () => new File(['zip'], 'archive.zip', { type: 'application/zip' });
  const pdf = () => new File(['pdf'], 'report.pdf', { type: 'application/pdf' });

  it('does not call onDropFile for a wrong file type', async () => {
    const onDropFile = vi.fn();
    renderField({ onDropFile });
    drop(zip());
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(onDropFile).not.toHaveBeenCalled();
  });

  it('says which file was refused, and what would have worked', async () => {
    renderField();
    drop(zip());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('archive.zip');
    expect(alert).toHaveTextContent('PDF');
  });

  /**
   * The case that needs BOTH layers. react-dropzone matches on the MIME type OR
   * the extension, so a file named `.pdf` carrying `text/plain` passes its
   * matcher and arrives at `onDrop`. `isAcceptedFile` treats a present-but-wrong
   * MIME type as the stronger signal and refuses it there.
   */
  it('refuses a file whose extension lies about its type', async () => {
    const onDropFile = vi.fn();
    renderField({ onDropFile });
    drop(new File(['text'], 'notes.pdf', { type: 'text/plain' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(onDropFile).not.toHaveBeenCalled();
  });

  it('still calls onDropFile for an accepted file, and says nothing', async () => {
    const onDropFile = vi.fn();
    renderField({ onDropFile });
    drop(pdf());
    await waitFor(() => expect(onDropFile).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('clears the refusal once an accepted file arrives', async () => {
    renderField();
    drop(zip());
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    drop(pdf());
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('offers the accepted types to the OS picker', () => {
    renderField();
    // The attribute is the affordance; `isAcceptedFile` is the enforcement.
    // Both have to be right, and only this one is visible in the DOM.
    expect(fileInput().accept).toContain('application/pdf');
    expect(fileInput().accept).toContain('.pptx');
    expect(fileInput().accept).not.toContain('text/plain');
  });
});
