/**
 * A list of files takes several files at once, dropped or picked on a drop
 * area of its own, and gives each accepted file a row: into the rows the
 * person left empty first, then as new rows, each handed to the host as if it
 * had been dropped on that row. See docs/upload-seam.md, "A list of files
 * takes several files at once".
 */
import { useState } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FileRunField, ListRunField, ObjectRunField } from '../../core';
import { DOCUMENT_FORMATS, IMAGE_FORMATS } from '../../core/file-formats';
import type { FieldEnv } from '../field-renderer';
import { ListField } from '../list-field';
import { EN_FIELD_STRINGS as S } from '../locales/en';

const imageItem: FileRunField = {
  kind: 'image',
  name: 'receipt',
  conceptRef: 'native.Image',
  required: true,
  formats: IMAGE_FORMATS,
};
const docItem: FileRunField = {
  kind: 'document',
  name: 'cv',
  conceptRef: 'native.Document',
  required: true,
  formats: DOCUMENT_FORMATS,
};

const listOf = (item: ListRunField['item'], extra: Partial<ListRunField> = {}): ListRunField => ({
  kind: 'list',
  name: 'receipts',
  title: 'Receipts',
  conceptRef: `${item.conceptRef}[]`,
  required: true,
  item,
  ...extra,
});

const png = (name: string) => new File(['png'], name, { type: 'image/png' });
const zip = (name: string) => new File(['zip'], name, { type: 'application/zip' });
const HELD = { url: 'https://example.com/held.png', filename: 'held.png' };

beforeAll(() => {
  // jsdom implements neither, and a row makes an object URL for each file placed in it.
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
});

/** The control is controlled; the host holds the array and records each change. */
function Harness({
  field,
  initial = [],
  env,
  onChangeSpy,
}: {
  field: ListRunField;
  initial?: unknown[];
  env?: FieldEnv;
  onChangeSpy?: (value: unknown[]) => void;
}) {
  const [value, setValue] = useState<unknown[]>(initial);
  return (
    <>
      <ListField
        field={field}
        value={value}
        onChange={(next) => {
          onChangeSpy?.(next);
          setValue(next);
        }}
        id="receipts"
        env={env}
      />
      <pre data-testid="value">{JSON.stringify(value)}</pre>
    </>
  );
}

const zone = () => document.querySelector('[data-list-file-drop]');
const zoneInput = () => screen.getByLabelText(S.addFilesAria('Receipts')) as HTMLInputElement;
const heldValue = () => JSON.parse(screen.getByTestId('value').textContent ?? '[]') as unknown[];

// `items` is deliberately absent, as in file-field.test.tsx: react-dropzone
// reads a drop through `file-selector`, which prefers `dataTransfer.items`
// when the key exists, so an empty array would be a drop of zero files.
function dropOnZone(files: File[]) {
  const root = zone();
  if (!root) throw new Error('no drop area');
  fireEvent.drop(root, { dataTransfer: { files, types: ['Files'] } });
}

describe('a batch dropped on a list of files', () => {
  it('appends one row per file in one write, and hands each to the host at its row, in order', async () => {
    const onDropFile = vi.fn();
    const onChangeSpy = vi.fn();
    render(<Harness field={listOf(imageItem)} env={{ onDropFile }} onChangeSpy={onChangeSpy} />);
    const files = [png('a.png'), png('b.png'), png('c.png')];
    dropOnZone(files);
    await waitFor(() => expect(onDropFile).toHaveBeenCalledTimes(3));
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith([undefined, undefined, undefined]);
    expect(onDropFile.mock.calls.map(([id, file]) => [id, (file as File).name])).toEqual([
      ['receipts.0', 'a.png'],
      ['receipts.1', 'b.png'],
      ['receipts.2', 'c.png'],
    ]);
    expect(screen.getByRole('status')).toHaveTextContent('3 files added');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('takes a pick from the OS dialog the same way', async () => {
    const user = userEvent.setup();
    const onDropFile = vi.fn();
    render(<Harness field={listOf(imageItem)} env={{ onDropFile }} />);
    expect(zoneInput()).toHaveAttribute('multiple');
    await user.upload(zoneInput(), [png('a.png'), png('b.png')]);
    await waitFor(() => expect(onDropFile).toHaveBeenCalledTimes(2));
    expect(heldValue()).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent('2 files added');
  });

  it('places the accepted files of a mixed drop and names the refused ones, calling no host for them', async () => {
    const onDropFile = vi.fn();
    render(<Harness field={listOf(imageItem)} env={{ onDropFile }} />);
    dropOnZone([png('a.png'), zip('archive.zip'), png('b.png')]);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('archive.zip');
    expect(alert).toHaveTextContent('Accepted formats: PNG, JPG, WEBP.');
    expect(onDropFile.mock.calls.map(([id, file]) => [id, (file as File).name])).toEqual([
      ['receipts.0', 'a.png'],
      ['receipts.1', 'b.png'],
    ]);
    expect(heldValue()).toHaveLength(2);
  });

  it('refuses a file whose extension lies about its type, as a single field does', async () => {
    const onDropFile = vi.fn();
    render(<Harness field={listOf(docItem)} env={{ onDropFile }} />);
    dropOnZone([new File(['text'], 'notes.pdf', { type: 'text/plain' })]);
    expect(await screen.findByRole('alert')).toHaveTextContent('notes.pdf');
    expect(onDropFile).not.toHaveBeenCalled();
    expect(heldValue()).toEqual([]);
  });

  it('names the first three refused files and counts the rest', async () => {
    render(<Harness field={listOf(imageItem)} env={{ onDropFile: vi.fn() }} />);
    dropOnZone(['1.zip', '2.zip', '3.zip', '4.zip', '5.zip'].map(zip));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('1.zip, 2.zip, 3.zip and 2 more');
    expect(alert).not.toHaveTextContent('4.zip');
  });

  it('takes as many as a bounded list has room for, and names the files left out', async () => {
    const onDropFile = vi.fn();
    render(
      <Harness
        field={listOf(imageItem, { maxItemCount: 3 })}
        initial={[HELD]}
        env={{ onDropFile }}
      />,
    );
    dropOnZone([png('a.png'), png('b.png'), png('c.png'), png('d.png')]);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'The list had room for 2 more files, so these files were not added: c.png and d.png.',
    );
    expect(onDropFile.mock.calls.map(([id]) => id)).toEqual(['receipts.1', 'receipts.2']);
    expect(heldValue()).toHaveLength(3);
  });

  it('clears its message on the next drop', async () => {
    render(<Harness field={listOf(imageItem)} env={{ onDropFile: vi.fn() }} />);
    dropOnZone([zip('archive.zip')]);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    dropOnZone([png('a.png')]);
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('fills the free rows first, skipping a row in flight and a row whose upload failed', async () => {
    const onDropFile = vi.fn();
    const onChangeSpy = vi.fn();
    render(
      <Harness
        field={listOf(imageItem)}
        initial={[undefined, undefined, HELD, undefined]}
        env={{
          onDropFile,
          uploadingIds: new Set(['receipts.0']),
          uploadErrors: new Map([['receipts.1', 'Upload failed']]),
        }}
        onChangeSpy={onChangeSpy}
      />,
    );
    dropOnZone([png('a.png'), png('b.png')]);
    await waitFor(() => expect(onDropFile).toHaveBeenCalledTimes(2));
    expect(onDropFile.mock.calls.map(([id]) => id)).toEqual(['receipts.3', 'receipts.4']);
    expect(onChangeSpy).toHaveBeenCalledWith([undefined, undefined, HELD, undefined, undefined]);
  });

  it('writes nothing when every file goes into a row the person left empty', async () => {
    const onDropFile = vi.fn();
    const onChangeSpy = vi.fn();
    render(
      <Harness
        field={listOf(imageItem)}
        initial={[undefined, undefined]}
        env={{ onDropFile }}
        onChangeSpy={onChangeSpy}
      />,
    );
    dropOnZone([png('a.png'), png('b.png')]);
    await waitFor(() => expect(onDropFile).toHaveBeenCalledTimes(2));
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('stays open while a row is uploading', () => {
    render(
      <Harness
        field={listOf(imageItem)}
        initial={[undefined]}
        env={{ onDropFile: vi.fn(), uploadingIds: new Set(['receipts.0']) }}
      />,
    );
    expect(zoneInput()).not.toBeDisabled();
  });

  describe('when the host rejects an upload', () => {
    const unhandled = vi.fn();
    beforeEach(() => process.on('unhandledRejection', unhandled));
    afterEach(() => {
      process.off('unhandledRejection', unhandled);
      unhandled.mockReset();
    });

    it('leaves no unhandled rejection behind', async () => {
      // A plain function, not `vi.fn`: a mock attaches its own handlers to
      // the promise it returns, to record how it settled, which would handle
      // the rejection and hide the very thing this test is about.
      let calls = 0;
      const onDropFile = () => {
        calls += 1;
        return Promise.reject(new Error('storage is down'));
      };
      render(<Harness field={listOf(imageItem)} env={{ onDropFile }} />);
      dropOnZone([png('a.png'), png('b.png')]);
      await waitFor(() => expect(calls).toBe(2));
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(unhandled).not.toHaveBeenCalled();
    });
  });
});

describe('where the drop area is offered', () => {
  it('stands in place of the empty list line', () => {
    render(<Harness field={listOf(imageItem)} env={{ onDropFile: vi.fn() }} />);
    expect(zone()).not.toBeNull();
    expect(screen.queryByText(S.noItemsYet)).toBeNull();
    expect(screen.getByText(S.dropFilesOrBrowse)).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG, WEBP')).toBeInTheDocument();
  });

  it('sits under the rows and above Add', () => {
    render(<Harness field={listOf(imageItem)} initial={[HELD]} env={{ onDropFile: vi.fn() }} />);
    const row = document.querySelector('[data-list-row]');
    const add = screen.getByRole('button', { name: S.addItem });
    const area = zone();
    if (!row || !area) throw new Error('missing row or drop area');
    expect(row.compareDocumentPosition(area) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(area.compareDocumentPosition(add) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('is not offered without an upload path', () => {
    render(<Harness field={listOf(imageItem)} />);
    expect(zone()).toBeNull();
    expect(screen.getByText(S.noItemsYet)).toBeInTheDocument();
  });

  it('is not offered on a list of structures holding a file', () => {
    const holder: ObjectRunField = {
      kind: 'object',
      name: 'claim',
      conceptRef: 'demo.Claim',
      required: true,
      fields: [docItem],
    };
    render(<Harness field={listOf(holder)} env={{ onDropFile: vi.fn() }} />);
    expect(zone()).toBeNull();
  });

  it('is not offered on a list of lists of files', () => {
    render(<Harness field={listOf(listOf(imageItem))} env={{ onDropFile: vi.fn() }} />);
    expect(zone()).toBeNull();
  });

  it('is shut while the form is disabled', () => {
    render(<Harness field={listOf(imageItem)} env={{ onDropFile: vi.fn(), disabled: true }} />);
    expect(zoneInput()).toBeDisabled();
  });

  it('is shut when a bounded list has no room left', () => {
    render(
      <Harness
        field={listOf(imageItem, { maxItemCount: 2 })}
        initial={[HELD, HELD]}
        env={{ onDropFile: vi.fn() }}
      />,
    );
    expect(zoneInput()).toBeDisabled();
  });

  it('stays open on a full bounded list that still has a free row', () => {
    render(
      <Harness
        field={listOf(imageItem, { maxItemCount: 2 })}
        initial={[HELD, undefined]}
        env={{ onDropFile: vi.fn() }}
      />,
    );
    expect(zoneInput()).not.toBeDisabled();
  });

  it('gives its file input a name of its own, and the input takes the tab stop', () => {
    render(<Harness field={listOf(imageItem)} env={{ onDropFile: vi.fn() }} />);
    expect(zoneInput().tabIndex).toBe(0);
    expect(zone()).toHaveAttribute('role', 'presentation');
    expect(zone()).not.toHaveAttribute('tabindex');
  });
});

/** Where the host's upload stores a file: a reference no browser renders. */
const STORED = 'pipelex-storage://org/assets/a.png';

/**
 * A host that uploads each file and writes its result into the row it was
 * dropped on, as `useMethodForm` does, with the upload settled by the test.
 */
function UploadingHost({ field, upload }: { field: ListRunField; upload: Promise<unknown> }) {
  const [value, setValue] = useState<unknown[]>([]);
  const onDropFile = (rowId: string, file: File) => {
    const index = Number(rowId.split('.').pop());
    return upload.then(() => {
      setValue((rows) =>
        rows.map((row, at) => (at === index ? { url: STORED, filename: file.name } : row)),
      );
      return { url: STORED, filename: file.name };
    });
  };
  return (
    <ListField field={field} value={value} onChange={setValue} id="receipts" env={{ onDropFile }} />
  );
}

function settledUpload() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('a row the drop area fills takes the file as its own', () => {
  it('paints the dropped file in its preview, as a file dropped on the row does', async () => {
    const user = userEvent.setup();
    const upload = settledUpload();
    const { container } = render(
      <UploadingHost field={listOf(imageItem)} upload={upload.promise} />,
    );
    dropOnZone([png('a.png')]);
    await act(async () => upload.resolve());
    expect(await screen.findByText('a.png')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^preview$/i }));
    expect(container.querySelector('[src^="blob:"]')).not.toBeNull();
  });

  it('drops a refusal the row showed once the file placed in it lands', async () => {
    const upload = settledUpload();
    render(<UploadingHost field={listOf(imageItem)} upload={upload.promise} />);
    dropOnZone([png('a.png')]);
    await act(async () => upload.resolve());
    await screen.findByText('a.png');
    // Emptied, then refused on its own dropzone, then filled from the area.
    await userEvent.setup().click(screen.getByRole('button', { name: S.removeFileAria }));
    const row = document.querySelector('[data-list-row] [role="presentation"]');
    if (!row) throw new Error('no row dropzone');
    fireEvent.drop(row, { dataTransfer: { files: [zip('archive.zip')], types: ['Files'] } });
    expect(await screen.findByRole('alert')).toHaveTextContent('archive.zip');
    dropOnZone([png('b.png')]);
    expect(await screen.findByText('b.png')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
