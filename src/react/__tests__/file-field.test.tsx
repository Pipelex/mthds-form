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
import { DOCUMENT_FORMATS, IMAGE_FORMATS } from '../../core/file-formats';
import { narrowFileFormats } from '../../core/narrow-file-formats';
import { DocumentField, ImageField, type FileValue } from '../file-field';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS, FieldStringsProvider } from '../field-strings';

const field: FileRunField = {
  kind: 'document',
  name: 'cv',
  conceptRef: 'native.Document',
  required: true,
  formats: DOCUMENT_FORMATS,
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

describe('what the chip prints under the file name', () => {
  it('names a file carried in a data: URL by its format and size, never its base64', () => {
    // A host that encodes a picked file in the browser writes the whole file
    // into the value's URL, and the chip used to print it: the subtitle of a
    // CV was `data:application/pdf;base64,JVBERi0xLjQK…`.
    const { container } = renderField({
      value: { filename: 'cv.pdf', url: 'data:application/pdf;base64,QUFBQUFB' },
    });
    expect(screen.getByText('PDF · 6 bytes')).toBeInTheDocument();
    expect(container.textContent).not.toContain('base64');
  });

  it('names an unlisted media type by the type itself', () => {
    renderField({ value: { filename: 'notes.txt', url: 'data:text/plain,hello' } });
    expect(screen.getByText('text/plain · 5 bytes')).toBeInTheDocument();
  });

  it('still prints a stored reference in studio, where a builder may need it', () => {
    // `studio` is the default presentation, so a host that sets none keeps it.
    renderField({ value: { filename: 'cv.pdf', url: 'pipelex-storage://bucket/abc123' } });
    expect(screen.getByText('pipelex-storage://bucket/abc123')).toBeInTheDocument();
  });
});

describe('a stored reference never reaches an end user', () => {
  /**
   * In a method app the person who just chose a file was shown its storage
   * address under its name - every uploaded photo read `pipelex-storage://…`.
   * The address is the host's to resolve; the person's question is only
   * whether the right file is attached.
   */
  const STORED = 'pipelex-storage://org_1/runs/run_1/uploads/0116d9cc480a9d10';

  function renderIn(presentation: FieldPresentation, value: FileValue) {
    return render(
      <FieldPresentationProvider presentation={presentation}>
        <DocumentField field={field} value={value} onDropFile={noop} onChange={noop} id="cv" />
      </FieldPresentationProvider>,
    );
  }

  it("names the format instead, in app, when the filename names one of the slot's formats", () => {
    const { container } = renderIn('app', { filename: 'contract.pdf', url: STORED });
    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(container.textContent).not.toContain('pipelex-storage');
  });

  it('shows nothing under the name, in app, when the filename names none of them', () => {
    const { container } = renderIn('app', { filename: 'contract', url: STORED });
    expect(screen.getByText('contract')).toBeInTheDocument();
    expect(container.textContent).not.toContain('pipelex-storage');
    expect(container.textContent).not.toContain('PDF');
  });

  it("reads the extension against the slot's own formats, not every format there is", () => {
    // WEBP is a format the kernel knows, but not one a document slot takes, so
    // a `.webp` filename on this slot names no format of its.
    const { container } = renderIn('app', { filename: 'scan.webp', url: STORED });
    expect(container.textContent).not.toContain('WEBP');
    expect(container.textContent).not.toContain('pipelex-storage');
  });

  it('still shows a pasted web link back to the person who pasted it, in app', () => {
    renderIn('app', { url: 'https://example.com/contract.pdf' });
    expect(screen.getByText('https://example.com/contract.pdf')).toBeInTheDocument();
  });

  it('prints the reference in studio, the same value and the same slot', () => {
    renderIn('studio', { filename: 'contract.pdf', url: STORED });
    expect(screen.getByText(STORED)).toBeInTheDocument();
  });
});

describe('the link input never prints a stored reference in app', () => {
  /**
   * The card was not the only place a storage address reached an end user. The
   * "paste a URL instead" input showed the value's URL verbatim, and it can be
   * open while a stored file is the value: opened after a file was attached,
   * left open through an upload, or written into by the host. These read the
   * INPUT'S VALUE - `textContent` never contains it, which is how the first
   * pass over the card missed this door.
   */
  const STORED = 'pipelex-storage://org_1/runs/run_1/uploads/0116d9cc480a9d10';
  const linkInput = () => screen.getByRole('textbox') as HTMLInputElement;

  /** A host that owns the value, can write a stored reference, and reports the last write. */
  function HostOwnedIn({
    presentation,
    initial,
    onWrite = noop,
  }: {
    presentation: FieldPresentation;
    initial?: FileValue;
    onWrite?: (value: FileValue | undefined) => void;
  }) {
    const [value, setValue] = useState<FileValue | undefined>(initial);
    // Bumping the key unmounts the control and mounts a fresh one over the same
    // value, which is what a host re-rendering its form, or a step away and
    // back, does to it: everything the control held in its own state is gone.
    const [mount, setMount] = useState(0);
    return (
      <FieldPresentationProvider presentation={presentation}>
        <DocumentField
          key={mount}
          field={field}
          value={value}
          onDropFile={noop}
          onChange={(next) => {
            onWrite(next);
            setValue(next);
          }}
          id="cv"
        />
        <button type="button" onClick={() => setValue({ filename: 'scan.pdf', url: STORED })}>
          host writes a stored file
        </button>
        <button type="button" onClick={() => setMount((n) => n + 1)}>
          remount the control
        </button>
      </FieldPresentationProvider>
    );
  }

  it('opens empty in app when a stored reference is the value', async () => {
    const user = userEvent.setup();
    render(<HostOwnedIn presentation="app" initial={{ filename: 'scan.pdf', url: STORED }} />);
    await user.click(urlToggle());
    expect(linkInput().value).toBe('');
  });

  it('stays empty in app when the host writes a stored reference into it while open', async () => {
    const user = userEvent.setup();
    render(<HostOwnedIn presentation="app" />);
    await user.click(urlToggle());
    await user.click(screen.getByRole('button', { name: 'host writes a stored file' }));
    expect(linkInput().value).toBe('');
  });

  it('still builds a URL typed character by character, including before it is a web link', async () => {
    // A mask on "is this a web link" alone would empty the input on the first
    // keystroke, because `h` is not one yet. What the input typed is its own.
    const user = userEvent.setup();
    const onWrite = vi.fn();
    render(
      <HostOwnedIn
        presentation="app"
        initial={{ filename: 'scan.pdf', url: STORED }}
        onWrite={onWrite}
      />,
    );
    await user.click(urlToggle());
    await user.type(linkInput(), 'example.com/brief.pdf');
    expect(linkInput().value).toBe('example.com/brief.pdf');
    await user.clear(linkInput());
    await user.type(linkInput(), 'https://example.com/brief.pdf');
    expect(linkInput().value).toBe('https://example.com/brief.pdf');
    expect(onWrite).toHaveBeenLastCalledWith({ url: 'https://example.com/brief.pdf' });
  });

  it('shows a web link the value already holds, in app', async () => {
    const user = userEvent.setup();
    render(<HostOwnedIn presentation="app" initial={{ url: 'https://example.com/brief.pdf' }} />);
    await user.click(urlToggle());
    expect(linkInput().value).toBe('https://example.com/brief.pdf');
  });

  describe('after the control remounts, when it no longer knows what it typed', () => {
    const remount = (user: ReturnType<typeof userEvent.setup>) =>
      user.click(screen.getByRole('button', { name: 'remount the control' }));

    it('still shows a link typed without a scheme, in the input and on the card', async () => {
      // Masked, it would be stored and submitted while visible nowhere: the
      // card's title is only "Attached file" when there is no filename.
      const user = userEvent.setup();
      render(<HostOwnedIn presentation="app" />);
      await user.click(urlToggle());
      await user.type(linkInput(), 'example.com/brief.pdf');

      await remount(user);

      expect(screen.getByText('Attached file')).toBeInTheDocument();
      expect(screen.getByText('example.com/brief.pdf')).toBeInTheDocument();
      await user.click(urlToggle());
      expect(linkInput().value).toBe('example.com/brief.pdf');
    });

    it('still hides a stored reference, in the input and on the card', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <HostOwnedIn presentation="app" initial={{ filename: 'scan.pdf', url: STORED }} />,
      );

      await remount(user);

      expect(container.textContent).not.toContain('pipelex-storage');
      await user.click(urlToggle());
      expect(linkInput().value).toBe('');
    });

    it('hides every other scheme too, whatever the browser could make of it', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <HostOwnedIn presentation="app" initial={{ url: 'ftp://files.example.com/brief.pdf' }} />,
      );

      await remount(user);

      expect(container.textContent).not.toContain('ftp://');
      await user.click(urlToggle());
      expect(linkInput().value).toBe('');
    });
  });

  it('shows the stored reference in studio, where a builder may need it', async () => {
    const user = userEvent.setup();
    render(<HostOwnedIn presentation="studio" initial={{ filename: 'scan.pdf', url: STORED }} />);
    await user.click(urlToggle());
    expect(linkInput().value).toBe(STORED);
  });
});

describe('the default strings name no storage scheme', () => {
  it('asks for a web link in the URL placeholder', async () => {
    const user = userEvent.setup();
    renderField();
    await user.click(urlToggle());
    expect(screen.getByPlaceholderText('https://…')).toBeInTheDocument();
    expect(DEFAULT_FIELD_STRINGS.urlPlaceholder).toBe('https://…');
  });

  it('titles a value with no filename "Attached file", which is true of a pasted link too', () => {
    renderField({ value: { url: 'https://example.com/contract' } });
    expect(screen.getByText('Attached file')).toBeInTheDocument();
    expect(DEFAULT_FIELD_STRINGS.uploadedFile).toBe('Attached file');
  });

  it('holds for every default string, not only those two', () => {
    const texts = Object.values(DEFAULT_FIELD_STRINGS).map((entry) =>
      typeof entry === 'function'
        ? String((entry as (...args: unknown[]) => unknown)('x', 2))
        : entry,
    );
    for (const text of texts) expect(text).not.toMatch(/storage:\/\//);
  });
});

describe('the URL input is a named control', () => {
  /**
   * The field's label is bound to the file input, so the URL input behind the
   * toggle had no name at all and its placeholder was the only thing a screen
   * reader announced - which is how the old placeholder's storage scheme became
   * the field's whole instruction.
   */
  it("takes an accessible name that carries the field's label", async () => {
    const user = userEvent.setup();
    renderField();
    await user.click(urlToggle());
    expect(screen.getByRole('textbox', { name: 'Link to the file for cv' })).toBeInTheDocument();
  });

  it('follows the presentation, as the label does', async () => {
    const user = userEvent.setup();
    render(
      <FieldPresentationProvider presentation="app">
        <DocumentField
          field={{ ...field, name: 'cover_letter' }}
          value={undefined}
          onDropFile={noop}
          onChange={noop}
          id="cover_letter"
        />
      </FieldPresentationProvider>,
    );
    await user.click(urlToggle());
    expect(
      screen.getByRole('textbox', { name: 'Link to the file for Cover letter' }),
    ).toBeInTheDocument();
  });

  it('is a string a host can override', async () => {
    const user = userEvent.setup();
    render(
      <FieldStringsProvider strings={{ fileUrlAria: (label) => `Lien vers ${label}` }}>
        <DocumentField field={field} value={undefined} onDropFile={noop} onChange={noop} id="cv" />
      </FieldStringsProvider>,
    );
    await user.click(urlToggle());
    expect(screen.getByRole('textbox', { name: 'Lien vers cv' })).toBeInTheDocument();
  });
});

describe('a preview that needs no resolver does not wait for one', () => {
  const spinner = (container: HTMLElement) => container.querySelector('.animate-spin');
  const placeholder = (container: HTMLElement) => container.querySelector('.lucide-image-off');

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

  it('says a stored reference cannot be shown when the host supplies no resolveUrl', async () => {
    // The effect that resolves a reference never starts without a resolver, so
    // nothing is on its way - and the preview counted it pending anyway, because
    // it asked whether an answer had landed without asking whether one could.
    // A host had to pass an identity resolver to get the placeholder.
    const user = userEvent.setup();
    const { container } = renderField({
      value: { filename: 'sample.pdf', url: 'pipelex-storage://bucket/abc123' },
    });

    await user.click(previewButton() as HTMLElement);

    expect(spinner(container)).toBeNull();
    expect(placeholder(container)).not.toBeNull();
  });

  it('still waits on a URI only the host can resolve while its resolver answers', async () => {
    const user = userEvent.setup();
    const { container } = renderField({
      value: { filename: 'sample.pdf', url: 'pipelex-storage://bucket/abc123' },
      resolveUrl: () => new Promise<string>(noop),
    });

    await user.click(previewButton() as HTMLElement);

    expect(spinner(container)).not.toBeNull();
    expect(placeholder(container)).toBeNull();
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
  const placeholder = (container: HTMLElement) => container.querySelector('.lucide-image-off');
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

  it('shows the placeholder, not the expired file, when the resolver answers with nothing', async () => {
    // The twin of the rejection below, and the one that survived it: a resolver
    // that RESOLVES with `null` is saying it has no URL, and skipping the state
    // write on an empty answer left the previous one standing. Nothing here
    // even moves URI - reopening the SAME file after its signed URL expired
    // kept painting the dead URL under a resolver that had just declined it.
    // The fix for that recorded the answer as no answer at all, which left a
    // spinner waiting on a resolver that had already replied.
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

    await waitFor(() => expect(placeholder(container)).not.toBeNull());
    expect(spinner(container)).toBeNull();
    expect(previewSrc(container)).toBeUndefined();
    expect(resolveUrl).toHaveBeenCalledTimes(2);
  });

  it('shows the placeholder, not the wrong file, when a resolution fails', async () => {
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

    await waitFor(() => expect(placeholder(container)).not.toBeNull());
    expect(spinner(container)).toBeNull();
    expect(previewSrc(container)).toBeUndefined();
  });

  it('waits again when the preview is reopened after a refusal', async () => {
    // A refusal is an answer about the attempt that produced it. Reopening asks
    // the resolver again, and while that second answer is on its way the first
    // one must not be shown as though it were the verdict.
    const user = userEvent.setup();
    let release: (src: string) => void = noop;
    let call = 0;
    const resolveUrl = vi.fn(() =>
      call++ === 0
        ? Promise.reject(new Error('offline'))
        : new Promise<string>((resolve) => {
            release = resolve;
          }),
    );

    const { container } = render(
      <ResolvingField initial={{ filename: 'a.pdf', url: URI_A }} resolveUrl={resolveUrl} />,
    );

    await user.click(previewButton() as HTMLElement);
    await waitFor(() => expect(placeholder(container)).not.toBeNull());

    await user.click(previewButton() as HTMLElement);
    await user.click(previewButton() as HTMLElement);

    expect(spinner(container)).not.toBeNull();
    expect(placeholder(container)).toBeNull();

    release('https://signed/a.pdf');
    await waitFor(() => expect(previewSrc(container)).toBe('https://signed/a.pdf#view=FitH'));
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
    expect(alert).toHaveTextContent('Accepted formats: PDF, JPG, PNG.');
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
    // Both read the field's `formats`, as the hint does.
    // Both have to be right, and only this one is visible in the DOM.
    expect(fileInput().accept).toContain('application/pdf');
    expect(fileInput().accept).toContain('image/png');
    expect(fileInput().accept).not.toContain('text/plain');
    // The two that a run proves fail, and that this table used to advertise.
    expect(fileInput().accept).not.toContain('wordprocessingml');
    expect(fileInput().accept).not.toContain('presentationml');
  });
});

describe('a narrowed slot gives one answer in all three places', () => {
  /**
   * The hint, the OS picker's filter and the check a dropped file must pass
   * used to be computed apart: the hint from a label on the field, the other
   * two from the kind's table. A host that narrowed the label moved the hint
   * alone, and the picker went on offering files its server would refuse. All
   * three now read `field.formats`, so narrowing it moves all three.
   */
  const imageField: FileRunField = {
    kind: 'image',
    name: 'photo',
    conceptRef: 'native.Image',
    required: true,
    formats: IMAGE_FORMATS,
  };
  const [narrowed] = narrowFileFormats([imageField], ['image/png', 'image/jpeg']) as [FileRunField];

  const renderImage = (onDropFile: (file: File) => void = noop) =>
    render(
      <ImageField
        field={narrowed}
        value={undefined}
        onDropFile={onDropFile}
        onChange={noop}
        id="photo"
      />,
    );
  const photoInput = () => screen.getByLabelText('photo') as HTMLInputElement;
  const drop = (file: File) => {
    const root = document.querySelector('[role="presentation"]');
    if (!root) throw new Error('no dropzone root');
    fireEvent.drop(root, { dataTransfer: { files: [file], types: ['Files'] } });
  };

  it('names only the narrowed formats in the hint', () => {
    renderImage();
    expect(screen.getByText('PNG, JPG')).toBeInTheDocument();
  });

  it('offers only the narrowed formats to the OS picker', () => {
    renderImage();
    expect(photoInput().accept).toContain('image/png');
    expect(photoInput().accept).toContain('image/jpeg');
    expect(photoInput().accept).not.toContain('image/webp');
    expect(photoInput().accept).not.toContain('.webp');
  });

  it('refuses a WEBP, though the kind takes one, and names the narrowed list', async () => {
    const onDropFile = vi.fn();
    renderImage(onDropFile);
    drop(new File(['webp'], 'holiday.webp', { type: 'image/webp' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('holiday.webp');
    expect(alert).toHaveTextContent('Accepted formats: PNG, JPG.');
    expect(onDropFile).not.toHaveBeenCalled();
  });

  it('refuses it in the check too, where the picker filter cannot see it', async () => {
    // A `.png` name carrying a WEBP type passes react-dropzone's matcher, which
    // takes the extension OR the MIME type, and arrives at `handleFile`. The
    // kind's table would take it there - WEBP is an image format - so only a
    // check reading the narrowed list refuses it.
    const onDropFile = vi.fn();
    renderImage(onDropFile);
    drop(new File(['webp'], 'holiday.png', { type: 'image/webp' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('holiday.png');
    expect(onDropFile).not.toHaveBeenCalled();
  });

  it('still takes a format the list kept', async () => {
    const onDropFile = vi.fn();
    renderImage(onDropFile);
    drop(new File(['png'], 'holiday.png', { type: 'image/png' }));
    await waitFor(() => expect(onDropFile).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('the input control reads the same URL gate as the result view', () => {
  const spinner = (c: HTMLElement) => c.querySelector('.animate-spin');
  const image = (c: HTMLElement) => c.querySelector('img');

  it('paints an allow-listed data: image, with no referrer', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ImageField
        field={{ ...field, kind: 'image', conceptRef: 'native.Image' }}
        value={{ filename: 'chart.png', url: 'data:image/png;base64,iVBORw0KGgo=' }}
        onDropFile={noop}
        onChange={noop}
        id="cv"
      />,
    );
    await user.click(previewButton() as HTMLElement);
    expect(image(container)?.getAttribute('referrerpolicy')).toBe('no-referrer');
  });

  it('names a refused data: URL instead of spinning at it forever', async () => {
    // Tightening the gate changed this control's meaning: an SVG data URL now
    // fails it, and routing "the gate said no" to the storage resolver turned an
    // allow-list miss into a spinner that could never stop, because no resolver
    // can resolve bytes a value carries inline.
    const user = userEvent.setup();
    const { container } = render(
      <ImageField
        field={{ ...field, kind: 'image', conceptRef: 'native.Image' }}
        value={{ filename: 'chart.svg', url: 'data:image/svg+xml,<svg onload="alert(1)"/>' }}
        onDropFile={noop}
        onChange={noop}
        id="cv"
      />,
    );
    await user.click(previewButton() as HTMLElement);
    expect(spinner(container)).toBeNull();
    expect(image(container)).toBeNull();
  });

  it('judges what the host resolver answers, like every other sink', async () => {
    // A resolver is trusted to know where a host's objects live, not to be a way
    // past the URL policy - and this is the sink the seam's contract documents.
    const user = userEvent.setup();
    const { container } = renderField({
      value: { filename: 'sample.pdf', url: 'pipelex-storage://bucket/abc' },
      resolveUrl: async () => '//attacker.example/collect.png',
    });
    await user.click(previewButton() as HTMLElement);
    await waitFor(() => expect(spinner(container)).toBeNull());
    expect(container.querySelector('object')).toBeNull();
    expect(image(container)).toBeNull();
  });
});
