/**
 * The local preview of a dropped file, kept for that upload's own result and
 * for nothing else, whichever render a host writes the result in.
 *
 * A dropped file is shown from an object URL until the host's upload lands,
 * then that preview is bound to the value the upload wrote. The field used to
 * tell its upload's result from a file someone else wrote only by when the
 * value landed: the URL had to change in the very render where `uploading`
 * fell. A host rendering the field itself that wrote the value one render
 * before it ended the flight, or one render after, lost its successful
 * upload's preview, and the card fell back to the stored file's own, which a
 * stored reference with no resolver cannot show. `onDropFile` may now return
 * the upload's promise, and the field then matches the URL it resolves to.
 *
 * What must not move with it: a file written over an upload in flight never
 * gets the dropped file's preview, nor does a file written after an upload
 * that failed.
 */
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FileRunField } from '../../core';
// Deep imports, not the `../../core` barrel: a value import of the barrel
// drags the gate and ajv into a suite that tests the control set.
import { getPipeIOContract } from '../../core/contracts';
import { getPipeInputForm } from '../../core/derive';
import { DOCUMENT_FORMATS } from '../../core/file-formats';
import { DocumentField, type FileValue, type UploadedFile } from '../file-field';
import { useMethodForm } from '../method-form';
import { CONTRACTS, INPUT_FORM } from '../../__stories__/_generated/files';

const field: FileRunField = {
  kind: 'document',
  name: 'cv',
  conceptRef: 'native.Document',
  required: true,
  formats: DOCUMENT_FORMATS,
};

/** Where the host's upload stores the dropped file: a reference no browser renders. */
const STORED = 'pipelex-storage://org/assets/mine.pdf';
const OWN: FileValue = { url: STORED, filename: 'mine.pdf' };
/** A file someone else writes at the same path: a host's `setValues`, an example. */
const OTHER: FileValue = { url: 'https://example.com/other.pdf', filename: 'other.pdf' };

beforeAll(() => {
  // jsdom implements neither, and the control makes an object URL on every drop.
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
});

/** An upload the test settles by hand, after writing what it likes meanwhile. */
function deferredUpload() {
  let resolve: (stored: UploadedFile) => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<UploadedFile>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

/**
 * A host that renders the field itself and lands an upload in two writes, the
 * value and the end of the flight, taken as separate steps in whatever order a
 * test chooses. Given `upload`, its `onDropFile` returns that promise, as
 * `useMethodForm`'s does; without it, it returns nothing, and the field is
 * left to judge the upload by when its value lands.
 */
function SteppedHost({ upload }: { upload?: Promise<UploadedFile> }) {
  const [value, setValue] = useState<FileValue | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  return (
    <>
      <DocumentField
        field={field}
        value={value}
        onChange={setValue}
        id="cv"
        uploading={uploading}
        onDropFile={() => {
          setUploading(true);
          return upload;
        }}
      />
      <button type="button" onClick={() => setValue(OWN)}>
        write the upload’s file
      </button>
      <button type="button" onClick={() => setUploading(false)}>
        end the flight
      </button>
      <button
        type="button"
        onClick={() => {
          setValue(OWN);
          setUploading(false);
        }}
      >
        write the upload’s file and end the flight
      </button>
      <button type="button" onClick={() => setValue(OTHER)}>
        write another file
      </button>
    </>
  );
}

type User = ReturnType<typeof userEvent.setup>;
const press = (user: User, name: string) => user.click(screen.getByRole('button', { name }));
const drop = (user: User) =>
  user.upload(
    screen.getByLabelText('cv') as HTMLInputElement,
    new File(['%PDF-1.4'], 'mine.pdf', { type: 'application/pdf' }),
  );
/** Opens the card's preview and answers whether it paints the dropped file. */
async function paintsLocalPreview(user: User, container: HTMLElement): Promise<boolean> {
  await user.click(screen.getByRole('button', { name: /^preview$/i }));
  return container.querySelector('[src^="blob:"], [data^="blob:"]') !== null;
}

describe('a host whose onDropFile returns the upload keeps its preview in any order', () => {
  it('keeps it when the value is written one render before the flight ends', async () => {
    const user = userEvent.setup();
    const upload = deferredUpload();
    const { container } = render(<SteppedHost upload={upload.promise} />);
    await drop(user);
    await press(user, 'write the upload’s file');
    await press(user, 'end the flight');
    await act(async () => upload.resolve(STORED));

    expect(screen.getByText('mine.pdf')).toBeInTheDocument();
    expect(await paintsLocalPreview(user, container)).toBe(true);
  });

  it('keeps it when the value is written one render after the flight ends', async () => {
    const user = userEvent.setup();
    const upload = deferredUpload();
    const { container } = render(<SteppedHost upload={upload.promise} />);
    await drop(user);
    await press(user, 'end the flight');
    await press(user, 'write the upload’s file');
    await act(async () => upload.resolve(STORED));

    expect(await paintsLocalPreview(user, container)).toBe(true);
  });

  it('keeps it when the upload answers before the host writes anything', async () => {
    const user = userEvent.setup();
    const upload = deferredUpload();
    const { container } = render(<SteppedHost upload={upload.promise} />);
    await drop(user);
    await act(async () => upload.resolve({ url: STORED, filename: 'mine.pdf' }));
    await press(user, 'end the flight');
    await press(user, 'write the upload’s file');

    expect(await paintsLocalPreview(user, container)).toBe(true);
  });

  it('keeps it when both land in one render, as before', async () => {
    const user = userEvent.setup();
    const upload = deferredUpload();
    const { container } = render(<SteppedHost upload={upload.promise} />);
    await drop(user);
    await act(async () => upload.resolve(STORED));
    await press(user, 'write the upload’s file and end the flight');

    expect(await paintsLocalPreview(user, container)).toBe(true);
  });

  it('keeps it when its file is written over one written while it was in flight', async () => {
    const user = userEvent.setup();
    const upload = deferredUpload();
    const { container } = render(<SteppedHost upload={upload.promise} />);
    await drop(user);
    await press(user, 'write another file');
    await press(user, 'write the upload’s file');
    await press(user, 'end the flight');
    await act(async () => upload.resolve(STORED));

    expect(await paintsLocalPreview(user, container)).toBe(true);
  });
});

describe('a host whose onDropFile returns the upload paints no other file with it', () => {
  it('paints none over a file written while it was in flight, when it fails', async () => {
    const user = userEvent.setup();
    const upload = deferredUpload();
    const { container } = render(<SteppedHost upload={upload.promise} />);
    await drop(user);
    await press(user, 'write another file');
    await press(user, 'end the flight');
    await act(async () => upload.reject(new Error('storage is down')));

    expect(screen.getByText('other.pdf')).toBeInTheDocument();
    expect(await paintsLocalPreview(user, container)).toBe(false);
  });

  it('paints none over that file when the flight ends before the failure arrives', async () => {
    const user = userEvent.setup();
    const upload = deferredUpload();
    const { container } = render(<SteppedHost upload={upload.promise} />);
    await drop(user);
    await press(user, 'end the flight');
    await press(user, 'write another file');
    await act(async () => upload.reject(new Error('storage is down')));

    expect(await paintsLocalPreview(user, container)).toBe(false);
  });

  it('paints none over a file the host keeps in place of the one its upload stored', async () => {
    const user = userEvent.setup();
    const upload = deferredUpload();
    const { container } = render(<SteppedHost upload={upload.promise} />);
    await drop(user);
    await press(user, 'write another file');
    await press(user, 'end the flight');
    await act(async () => upload.resolve(STORED));

    expect(await paintsLocalPreview(user, container)).toBe(false);
  });

  it('paints none over the next file written after it failed', async () => {
    const user = userEvent.setup();
    const upload = deferredUpload();
    const { container } = render(<SteppedHost upload={upload.promise} />);
    await drop(user);
    await press(user, 'end the flight');
    await act(async () => upload.reject(new Error('storage is down')));
    await press(user, 'write another file');

    expect(await paintsLocalPreview(user, container)).toBe(false);
  });

  it('retires it once the value moves on from the file it stored', async () => {
    const user = userEvent.setup();
    const upload = deferredUpload();
    const { container } = render(<SteppedHost upload={upload.promise} />);
    await drop(user);
    await act(async () => upload.resolve(STORED));
    await press(user, 'write the upload’s file and end the flight');
    await press(user, 'write another file');

    expect(await paintsLocalPreview(user, container)).toBe(false);
  });
});

describe('a host whose onDropFile returns nothing is judged by when the value lands', () => {
  it('keeps the preview when the value lands in the render the flight ends', async () => {
    const user = userEvent.setup();
    const { container } = render(<SteppedHost />);
    await drop(user);
    await press(user, 'write the upload’s file and end the flight');

    expect(await paintsLocalPreview(user, container)).toBe(true);
  });

  it('paints none over a file written while the upload was in flight', async () => {
    const user = userEvent.setup();
    const { container } = render(<SteppedHost />);
    await drop(user);
    await press(user, 'write another file');
    await press(user, 'end the flight');

    expect(await paintsLocalPreview(user, container)).toBe(false);
  });

  it('paints none over the next file written after the upload stopped with nothing', async () => {
    const user = userEvent.setup();
    const { container } = render(<SteppedHost />);
    await drop(user);
    await press(user, 'end the flight');
    await press(user, 'write another file');

    expect(await paintsLocalPreview(user, container)).toBe(false);
  });
});

describe('useMethodForm’s dropFile hands back its upload', () => {
  const contract = getPipeIOContract(CONTRACTS, 'files', 'one_document');
  const descriptor = getPipeInputForm(INPUT_FORM, 'files', 'one_document');
  if (!contract || !descriptor) throw new Error('No fixture for files.one_document');
  const pdf = () => new File(['%PDF-1.4'], 'mine.pdf', { type: 'application/pdf' });
  type Form = ReturnType<typeof useMethodForm>;

  /** Drops a file through the form's own seam and hands back what it returned. */
  function dropThrough(form: Form) {
    let landed: ReturnType<NonNullable<Form['dropFile']>> | undefined;
    act(() => {
      landed = form.dropFile?.('attachment', pdf());
    });
    if (!landed) throw new Error('The form has no upload seam');
    return landed;
  }

  it('resolves to the file it wrote at the id’s path', async () => {
    const { result } = renderHook(() =>
      useMethodForm({ contract, descriptor, uploadFile: async () => STORED }),
    );
    const landed = dropThrough(result.current);
    await act(async () => {
      await expect(landed).resolves.toEqual(OWN);
    });
    expect(result.current.values.attachment).toEqual(OWN);
    expect(result.current.uploading).toBe(false);
  });

  it('rejects with the upload’s own error when the upload fails', async () => {
    const failure = new Error('storage is down');
    const { result } = renderHook(() =>
      useMethodForm({ contract, descriptor, uploadFile: () => Promise.reject(failure) }),
    );
    const landed = dropThrough(result.current);
    await act(async () => {
      await expect(landed).rejects.toBe(failure);
    });
    expect([...result.current.failedUploadIds]).toEqual(['attachment']);
  });

  it('rejects when a reset replaced it before it landed, and writes nothing', async () => {
    const upload = deferredUpload();
    const { result } = renderHook(() =>
      useMethodForm({ contract, descriptor, uploadFile: () => upload.promise }),
    );
    const landed = dropThrough(result.current);
    act(() => result.current.reset());
    await act(async () => {
      upload.resolve(STORED);
      await expect(landed).rejects.toThrow('attachment');
    });
    expect(result.current.values.attachment).toBeUndefined();
    expect([...result.current.failedUploadIds]).toEqual([]);
  });

  it('rejects when a newer file dropped at the same id replaced it', async () => {
    const NEWER = 'pipelex-storage://org/assets/newer.pdf';
    const first = deferredUpload();
    const uploads: Promise<UploadedFile>[] = [first.promise, Promise.resolve(NEWER)];
    const { result } = renderHook(() =>
      useMethodForm({
        contract,
        descriptor,
        uploadFile: () => uploads.shift() ?? Promise.reject(new Error('no upload left')),
      }),
    );
    const older = dropThrough(result.current);
    const newer = dropThrough(result.current);
    await act(async () => {
      await expect(newer).resolves.toEqual({ url: NEWER, filename: 'mine.pdf' });
      first.resolve(STORED);
      await expect(older).rejects.toThrow('attachment');
    });
    expect(result.current.values.attachment).toEqual({ url: NEWER, filename: 'mine.pdf' });
  });
});
