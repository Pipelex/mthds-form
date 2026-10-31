/**
 * What the form holds about an upload stays with the list row it is about.
 *
 * A field's id is its position (`attachments.1`), and removing a row renumbers
 * every row after it. The form keyed its failed uploads, and its uploads in
 * flight, by that id, so a removal used to read as a replacement: with
 * `[A, <failed upload>, C]`, removing A moved C to `attachments.1`, the form
 * ended the failure there because the file at that path had changed, and the
 * failed row showed as an empty field with nothing said. The form now moves the
 * rows itself (`removeItem`, `moveItem`, and a list's remove button through
 * `FieldEnv.onRemoveItem`), and carries everything it keys by id along with
 * them: a failure, an upload in flight, and what that upload was dropped over.
 */
import { useMemo, useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FileRunField, ListRunField, ObjectRunField, TextRunField } from '../../core';
// Deep imports, not the `../../core` barrel: a value import of the barrel
// drags the gate and ajv into a suite that tests the control set.
import { getPipeIOContract } from '../../core/contracts';
import { getPipeInputForm } from '../../core/derive';
import { DOCUMENT_FORMATS } from '../../core/file-formats';
import { FieldRenderer } from '../field-renderer';
import type { UploadedFile } from '../file-field';
import {
  MethodForm,
  useMethodForm,
  type MethodFormValues,
  type UseMethodFormOptions,
} from '../method-form';
import { EN_FIELD_STRINGS as S } from '../locales/en';
import { CONTRACTS, INPUT_FORM } from '../../__stories__/_generated/files';

const contract = getPipeIOContract(CONTRACTS, 'files', 'many_files');
const descriptor = getPipeInputForm(INPUT_FORM, 'files', 'many_files');
if (!contract || !descriptor) throw new Error('No fixture for files.many_files');
const MANY_FILES = { contract, descriptor };

const A = { url: 'https://example.com/a.pdf', filename: 'a.pdf' };
const B = { url: 'https://example.com/b.pdf', filename: 'b.pdf' };
const C = { url: 'https://example.com/c.pdf', filename: 'c.pdf' };
const HOST_FILE = { url: 'https://example.com/host.pdf', filename: 'host.pdf' };
const STORED = 'pipelex-storage://org/assets/mine.pdf';
const OWN = { url: STORED, filename: 'mine.pdf' };

const pdf = () => new File(['%PDF-1.4'], 'mine.pdf', { type: 'application/pdf' });
const rejected = async (): Promise<string> => {
  throw new Error('storage is down');
};

/** The list of documents holding `rows`, over the method's own seed. */
const withAttachments =
  (rows: unknown[]) =>
  (seed: MethodFormValues): MethodFormValues => ({ ...seed, attachments: rows });

/** An upload the test settles by hand. */
function deferredUpload() {
  let resolve: (stored: UploadedFile) => void = () => {};
  let reject: (error: Error) => void = () => {};
  const promise = new Promise<UploadedFile>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeAll(() => {
  // A dropped file's preview is an object URL, which jsdom does not make.
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
});

type HarnessProps = Partial<UseMethodFormOptions>;

/**
 * The whole form, with a consumer that can mount its fields again and write a
 * file of its own over the first row through `setValues`.
 */
function Harness(options: HarnessProps) {
  const form = useMethodForm({ ...MANY_FILES, ...options });
  const [mounts, setMounts] = useState(0);
  return (
    <>
      <MethodForm key={mounts} form={form} presentation="app" />
      <button type="button" onClick={() => setMounts((count) => count + 1)}>
        Mount again
      </button>
      <button
        type="button"
        onClick={() =>
          form.setValues((previous) => {
            const rows = (previous.attachments as unknown[]).slice();
            rows[0] = HOST_FILE;
            return { ...previous, attachments: rows };
          })
        }
      >
        Host writes the first row
      </button>
      <button type="button" onClick={() => form.moveItem('attachments', 1, 0)}>
        Host moves the second row first
      </button>
      <button type="button" onClick={() => form.removeItem('attachments', 0)}>
        Host removes the first row
      </button>
      <output data-testid="state">
        {JSON.stringify({ values: form.values, failed: [...form.failedUploadIds] })}
      </output>
    </>
  );
}

const state = () => JSON.parse(screen.getByTestId('state').textContent ?? '{}');
const failed = (): string[] => state().failed;
type User = ReturnType<typeof userEvent.setup>;
const press = (user: User, name: string) => user.click(screen.getByRole('button', { name }));
const removeRow = (user: User, row: number) => press(user, S.removeItemAria(row));
/** The list's rows, each one's own box. The gallery is empty, so these are the attachments. */
const rows = (container: HTMLElement) =>
  [...container.querySelectorAll('[data-list-row]')] as HTMLElement[];
const fileInputs = (container: HTMLElement) =>
  [...container.querySelectorAll('input[type="file"]')] as HTMLInputElement[];
/** Which rows show the upload failure, by position. */
const failedRows = (container: HTMLElement) =>
  rows(container).flatMap((row, index) => (within(row).queryByText(S.uploadFailed) ? [index] : []));

/** Asserts that `actual` holds exactly the `expected` DOM nodes, by identity, in order. */
function expectSameNodes(actual: readonly Element[], expected: readonly Element[]) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((node, index) => expect(actual[index]).toBe(node));
}

/** Drops a file on the `nth` empty file field, and waits for its upload to fail. */
async function failAt(user: User, container: HTMLElement, nth: number, id: string) {
  const input = fileInputs(container)[nth];
  if (!input) throw new Error(`No empty file field number ${nth}`);
  await user.upload(input, pdf());
  await vi.waitFor(() => expect(failed()).toContain(id));
}

describe('a failed upload’s mark follows its row when the list’s remove button is used', () => {
  it('moves with the failed row when an earlier row is removed', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness uploadFile={rejected} initialValues={withAttachments([A, undefined, C])} />,
    );
    await failAt(user, container, 0, 'attachments.1');
    expect(failedRows(container)).toEqual([1]);

    await removeRow(user, 1);
    expect(state().values.attachments).toEqual([null, C]);
    expect(failed()).toEqual(['attachments.0']);
    expect(failedRows(container)).toEqual([0]);
    expect(within(rows(container)[1] as HTMLElement).getByText('c.pdf')).toBeInTheDocument();

    // The controller says so too, so a field mounted again shows it there.
    await press(user, 'Mount again');
    expect(failedRows(container)).toEqual([0]);
  });

  it('goes with the failed row when that row is removed', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness uploadFile={rejected} initialValues={withAttachments([A, undefined, C])} />,
    );
    await failAt(user, container, 0, 'attachments.1');

    await removeRow(user, 2);
    expect(state().values.attachments).toEqual([A, C]);
    expect(failed()).toEqual([]);
    expect(screen.queryByText(S.uploadFailed)).toBeNull();
    await press(user, 'Mount again');
    expect(screen.queryByText(S.uploadFailed)).toBeNull();
  });

  it('stays where it is when a later row is removed', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness uploadFile={rejected} initialValues={withAttachments([undefined, B, C])} />,
    );
    await failAt(user, container, 0, 'attachments.0');

    await removeRow(user, 3);
    expect(failed()).toEqual(['attachments.0']);
    expect(failedRows(container)).toEqual([0]);
  });

  it('shows a moved failure on its row although the removed row had one too', async () => {
    // Held back by the list when the form could not re-key its marks: the
    // position the second failure moves to is one the first failure had.
    const user = userEvent.setup();
    const { container } = render(
      <Harness uploadFile={rejected} initialValues={withAttachments([undefined, undefined, C])} />,
    );
    await failAt(user, container, 0, 'attachments.0');
    await failAt(user, container, 1, 'attachments.1');
    expect(failedRows(container)).toEqual([0, 1]);

    await removeRow(user, 1);
    expect(failed()).toEqual(['attachments.0']);
    expect(failedRows(container)).toEqual([0]);
  });

  it('still ends when a file is written in the moved row’s place', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness uploadFile={rejected} initialValues={withAttachments([A, undefined, C])} />,
    );
    await failAt(user, container, 0, 'attachments.1');
    await removeRow(user, 1);
    expect(failed()).toEqual(['attachments.0']);

    await press(user, 'Host writes the first row');
    expect(failed()).toEqual([]);
    await press(user, 'Mount again');
    expect(screen.queryByText(S.uploadFailed)).toBeNull();
    expect(screen.getByText('host.pdf')).toBeInTheDocument();
  });
});

/**
 * A list's rows are React elements keyed by an identity the list keeps, and a
 * row's controls hold state of their own (a dismissed failure, a dropped
 * file's preview). When the host moves rows through the controller rather
 * than through the list's own remove button, the list has to move those
 * identities too, or a row's controls stay at the position and take on its
 * neighbour's value.
 */
describe('rows the host moves through the controller keep their controls', () => {
  it('keeps the mark on a failed empty row moved ahead of a filled one', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness uploadFile={rejected} initialValues={withAttachments([A, undefined])} />,
    );
    await failAt(user, container, 0, 'attachments.1');
    const [filled, failedRow] = rows(container) as [HTMLElement, HTMLElement];

    await press(user, 'Host moves the second row first');
    expect(state().values.attachments).toEqual([null, A]);
    expect(failed()).toEqual(['attachments.0']);
    expect(failedRows(container)).toEqual([0]);
    expectSameNodes(rows(container), [failedRow, filled]);
  });

  it('keeps the surviving rows’ DOM when an earlier row is removed', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness initialValues={withAttachments([A, B, C])} />);
    const [first, second, third] = rows(container) as [HTMLElement, HTMLElement, HTMLElement];

    await press(user, 'Host removes the first row');
    expect(state().values.attachments).toEqual([B, C]);
    expectSameNodes(rows(container), [second, third]);
    expect(first.isConnected).toBe(false);
  });

  it('keeps them when the list’s own remove button goes through the controller', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness initialValues={withAttachments([A, B, C])} />);
    const [first, second, third] = rows(container) as [HTMLElement, HTMLElement, HTMLElement];

    await removeRow(user, 2);
    expect(state().values.attachments).toEqual([A, C]);
    expectSameNodes(rows(container), [first, third]);
    expect(second.isConnected).toBe(false);
  });
});

type Form = ReturnType<typeof useMethodForm>;

/** The controller alone, holding `attachments` as given. */
function controller(rowsGiven: unknown[], uploadFile: UseMethodFormOptions['uploadFile']) {
  return renderHook(() =>
    useMethodForm({ ...MANY_FILES, uploadFile, initialValues: withAttachments(rowsGiven) }),
  );
}

/** Drops a file through the form's own seam and hands back what it returned. */
function dropThrough(form: Form, id: string) {
  let landed: ReturnType<NonNullable<Form['dropFile']>> | undefined;
  act(() => {
    landed = form.dropFile?.(id, pdf());
  });
  if (!landed) throw new Error('The form has no upload seam');
  // Its rejection is asserted where a test cares; the form handles it anyway.
  landed.catch(() => {});
  return landed;
}

/** Drops a file at `id` and lets its upload fail. */
async function failThrough(result: { current: Form }, id: string) {
  const landed = dropThrough(result.current, id);
  await act(async () => {
    await landed.catch(() => {});
  });
  expect([...result.current.failedUploadIds]).toContain(id);
}

describe('the controller moves rows and carries their marks', () => {
  it('re-keys a failure when a row moves past it', async () => {
    const { result } = controller([A, undefined, C], rejected);
    await failThrough(result, 'attachments.1');

    act(() => result.current.moveItem('attachments', 1, 2));
    expect(result.current.values.attachments).toEqual([A, C, undefined]);
    expect([...result.current.failedUploadIds]).toEqual(['attachments.2']);

    act(() => result.current.moveItem('attachments', 2, 0));
    expect(result.current.values.attachments).toEqual([undefined, A, C]);
    expect([...result.current.failedUploadIds]).toEqual(['attachments.0']);
  });

  it('re-keys every failure a removal renumbers, and ends the removed row’s', async () => {
    const { result } = controller([undefined, A, undefined, undefined], rejected);
    await failThrough(result, 'attachments.0');
    await failThrough(result, 'attachments.2');
    await failThrough(result, 'attachments.3');

    act(() => result.current.removeItem('attachments', 2));
    expect(result.current.values.attachments).toEqual([undefined, A, undefined]);
    expect([...result.current.failedUploadIds].sort()).toEqual(['attachments.0', 'attachments.2']);
  });

  it('counts a move as the person’s edit', () => {
    const { result } = controller([A, B], rejected);
    expect(result.current.touched).toBe(false);
    act(() => result.current.moveItem('attachments', 0, 1));
    expect(result.current.values.attachments).toEqual([B, A]);
    expect(result.current.touched).toBe(true);
  });

  it('changes nothing for a row the list does not hold', async () => {
    const { result } = controller([A, undefined], rejected);
    await failThrough(result, 'attachments.1');
    const before = result.current.values;

    act(() => result.current.removeItem('attachments', 2));
    act(() => result.current.moveItem('attachments', 0, 5));
    act(() => result.current.removeItem('gallery', 0));
    act(() => result.current.removeItem('nowhere', 0));
    expect(result.current.values).toBe(before);
    expect([...result.current.failedUploadIds]).toEqual(['attachments.1']);
  });
});

describe('an upload in flight follows its row', () => {
  it('lands on its row after an earlier row is removed', async () => {
    const upload = deferredUpload();
    const { result } = controller([A, undefined, C], () => upload.promise);
    const landed = dropThrough(result.current, 'attachments.1');
    expect([...result.current.uploadingIds]).toEqual(['attachments.1']);

    act(() => result.current.removeItem('attachments', 0));
    expect([...result.current.uploadingIds]).toEqual(['attachments.0']);

    await act(async () => {
      upload.resolve(STORED);
      await expect(landed).resolves.toEqual(OWN);
    });
    expect(result.current.values.attachments).toEqual([OWN, C]);
    expect(result.current.uploading).toBe(false);
    expect([...result.current.failedUploadIds]).toEqual([]);
  });

  it('marks its own row when it fails after a move, judged against what it was dropped over', async () => {
    const upload = deferredUpload();
    const { result } = controller([A, B, C], () => upload.promise);
    // A replacement for C, still arriving when A is removed.
    dropThrough(result.current, 'attachments.2');
    act(() => result.current.removeItem('attachments', 0));
    expect([...result.current.uploadingIds]).toEqual(['attachments.1']);

    await act(async () => {
      upload.reject(new Error('storage is down'));
    });
    expect(result.current.values.attachments).toEqual([B, C]);
    expect([...result.current.failedUploadIds]).toEqual(['attachments.1']);
    expect(result.current.uploading).toBe(false);
  });

  it('marks nothing when a file is written in its moved place before it fails', async () => {
    const upload = deferredUpload();
    const { result } = controller([A, B, C], () => upload.promise);
    dropThrough(result.current, 'attachments.2');
    act(() => result.current.moveItem('attachments', 2, 0));
    act(() =>
      result.current.setValues((previous) => ({
        ...previous,
        attachments: [HOST_FILE, A, B],
      })),
    );

    await act(async () => {
      upload.reject(new Error('storage is down'));
    });
    expect([...result.current.failedUploadIds]).toEqual([]);
  });

  it('is dropped with its row, and writes nothing', async () => {
    const upload = deferredUpload();
    const { result } = controller([A, undefined, C], () => upload.promise);
    const landed = dropThrough(result.current, 'attachments.1');

    act(() => result.current.removeItem('attachments', 1));
    expect(result.current.uploading).toBe(false);
    await act(async () => {
      upload.resolve(STORED);
      await expect(landed).rejects.toThrow('attachments.1');
    });
    expect(result.current.values.attachments).toEqual([A, C]);
    expect([...result.current.failedUploadIds]).toEqual([]);
  });
});

describe('rows of nested lists', () => {
  const NESTED = [
    { resume: A, letters: [] },
    { resume: undefined, letters: [B, undefined] },
  ];

  it('carries ids inside a row, and those of a list inside a row', async () => {
    const { result } = controller([], rejected);
    act(() =>
      result.current.setValues((previous) => ({
        ...previous,
        candidates: NESTED,
        candidates_extra: [undefined],
      })),
    );
    await failThrough(result, 'candidates.1.resume');
    await failThrough(result, 'candidates.1.letters.1');
    await failThrough(result, 'candidates_extra.0');

    act(() => result.current.removeItem('candidates', 0));
    expect([...result.current.failedUploadIds].sort()).toEqual([
      'candidates.0.letters.1',
      'candidates.0.resume',
      'candidates_extra.0',
    ]);

    act(() => result.current.removeItem('candidates.0.letters', 0));
    expect(result.current.values.candidates).toEqual([{ resume: undefined, letters: [undefined] }]);
    expect([...result.current.failedUploadIds].sort()).toEqual([
      'candidates.0.letters.0',
      'candidates.0.resume',
      'candidates_extra.0',
    ]);
  });

  const resume: FileRunField = {
    kind: 'document',
    name: 'resume',
    conceptRef: 'native.Document',
    required: true,
    formats: DOCUMENT_FORMATS,
  };
  const candidate: ObjectRunField = {
    kind: 'object',
    name: 'candidate',
    conceptRef: 'hiring.Candidate',
    required: true,
    fields: [resume],
  };
  const candidates: ListRunField = {
    kind: 'list',
    name: 'candidates',
    conceptRef: 'hiring.Candidate[]',
    required: true,
    item: candidate,
  };

  /** A host rendering its own field over the controller, as the upload seam describes. */
  function OwnField() {
    const form = useMethodForm({
      ...MANY_FILES,
      uploadFile: rejected,
      initialValues: (seed) => ({
        ...seed,
        candidates: [{ resume: A }, { resume: undefined }, { resume: C }],
      }),
    });
    const uploadErrors = useMemo(
      () => new Map([...form.failedUploadIds].map((id) => [id, S.uploadFailed] as const)),
      [form.failedUploadIds],
    );
    return (
      <>
        <FieldRenderer
          field={candidates}
          id="candidates"
          value={form.values.candidates}
          onChange={(next) => form.setValues((previous) => ({ ...previous, candidates: next }))}
          env={{
            onDropFile: form.dropFile,
            uploadingIds: form.uploadingIds,
            uploadErrors,
            onRemoveItem: form.removeItem,
          }}
        />
        <output data-testid="state">
          {JSON.stringify({ values: form.values, failed: [...form.failedUploadIds] })}
        </output>
      </>
    );
  }

  it('shows a failure inside a structure row on that row after an earlier one is removed', async () => {
    const user = userEvent.setup();
    const { container } = render(<OwnField />);
    await failAt(user, container, 0, 'candidates.1.resume');
    expect(failedRows(container)).toEqual([1]);

    await removeRow(user, 1);
    expect(failed()).toEqual(['candidates.0.resume']);
    expect(failedRows(container)).toEqual([0]);
  });
});

describe('a list inside a row the host moves', () => {
  const name: TextRunField = {
    kind: 'text',
    name: 'name',
    conceptRef: 'native.Text',
    required: true,
  };
  const letter: TextRunField = {
    kind: 'text',
    name: 'letter',
    conceptRef: 'native.Text',
    required: true,
  };
  const letters: ListRunField = {
    kind: 'list',
    name: 'letters',
    conceptRef: 'native.Text[]',
    required: true,
    item: letter,
  };
  const candidate: ObjectRunField = {
    kind: 'object',
    name: 'candidate',
    conceptRef: 'hiring.Candidate',
    required: true,
    fields: [name, letters],
  };
  const candidates: ListRunField = {
    kind: 'list',
    name: 'candidates',
    conceptRef: 'hiring.Candidate[]',
    required: true,
    item: candidate,
  };

  /** A host rendering its own field over the controller, handing it what `MethodForm` would. */
  function Nested({ moves }: { moves: (form: Form) => void }) {
    const form = useMethodForm({
      ...MANY_FILES,
      initialValues: (seed) => ({
        ...seed,
        candidates: [
          { name: 'x', letters: ['a', 'b'] },
          { name: 'y', letters: ['c', 'd', 'e'] },
        ],
      }),
    });
    return (
      <>
        <FieldRenderer
          field={candidates}
          id="candidates"
          value={form.values.candidates}
          onChange={(next) => form.setValues((previous) => ({ ...previous, candidates: next }))}
          env={{ onRemoveItem: form.removeItem, rowMoves: form.rowMoves }}
        />
        <button type="button" onClick={() => moves(form)}>
          Move
        </button>
      </>
    );
  }

  const inputHolding = (text: string) =>
    (screen.getAllByRole('textbox') as HTMLInputElement[]).find((input) => input.value === text);

  it.each([
    [
      'the outer row first, then the inner one at its new id',
      (form: Form) => {
        form.removeItem('candidates', 0);
        form.removeItem('candidates.0.letters', 0);
      },
    ],
    [
      'the inner row first, then the outer one',
      (form: Form) => {
        form.removeItem('candidates.1.letters', 0);
        form.removeItem('candidates', 0);
      },
    ],
  ])('keeps each row’s DOM when both move in one update, %s', async (_, moves) => {
    const user = userEvent.setup();
    render(<Nested moves={moves} />);
    const [y, c, d, e] = ['y', 'c', 'd', 'e'].map(inputHolding);

    await press(user, 'Move');
    expect((screen.getAllByRole('textbox') as HTMLInputElement[]).map((i) => i.value)).toEqual([
      'y',
      'd',
      'e',
    ]);
    expect(inputHolding('y')).toBe(y);
    expect(inputHolding('d')).toBe(d);
    expect(inputHolding('e')).toBe(e);
    expect(c?.isConnected).toBe(false);
  });
});

describe('a host’s own setValues is read by position', () => {
  it('ends a failure whose place a different file moved into', async () => {
    // The form cannot tell this from writing C over the failed row: a value
    // carries no identity for its rows. A host that moves rows says so with
    // `removeItem` or `moveItem`.
    const { result } = controller([A, undefined, C], rejected);
    await failThrough(result, 'attachments.1');

    act(() =>
      result.current.setValues((previous) => ({
        ...previous,
        attachments: (previous.attachments as unknown[]).slice(1),
      })),
    );
    expect([...result.current.failedUploadIds]).toEqual([]);
  });
});

describe('a batch dropped on a list of files, through the form', () => {
  /** The attachments' drop area: its file input, named by the list. */
  const attachmentsDrop = () =>
    screen.getByLabelText(S.addFilesAria('Attachments')) as HTMLInputElement;
  const named = (name: string) => new File(['%PDF-1.4'], name, { type: 'application/pdf' });

  /** An `uploadFile` whose uploads the test settles by file name, in any order. */
  function uploadsByName() {
    const pending = new Map<string, ReturnType<typeof deferredUpload>>();
    const uploadFile = vi.fn<NonNullable<UseMethodFormOptions['uploadFile']>>((file) => {
      const upload = deferredUpload();
      pending.set(file.name, upload);
      return upload.promise;
    });
    const settle = (name: string) => {
      const upload = pending.get(name);
      if (!upload) throw new Error(`No upload of ${name}`);
      return upload;
    };
    return { uploadFile, settle };
  }
  const stored = (name: string) => ({ url: `https://example.com/${name}`, filename: name });

  it('lands each file in its own row, whatever order the uploads finish in', async () => {
    const user = userEvent.setup();
    const { uploadFile, settle } = uploadsByName();
    render(<Harness uploadFile={uploadFile} />);
    await user.upload(attachmentsDrop(), [named('a.pdf'), named('b.pdf'), named('c.pdf')]);
    await vi.waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(3));
    expect(uploadFile.mock.calls.map(([, context]) => context?.id)).toEqual([
      'attachments.0',
      'attachments.1',
      'attachments.2',
    ]);

    await act(async () => settle('c.pdf').resolve(stored('c.pdf')));
    await act(async () => settle('a.pdf').resolve(stored('a.pdf')));
    await act(async () => settle('b.pdf').resolve(stored('b.pdf')));
    expect(state().values.attachments).toEqual([stored('a.pdf'), stored('b.pdf'), stored('c.pdf')]);
    expect(failed()).toEqual([]);
  });

  it('marks only the row whose upload failed', async () => {
    const user = userEvent.setup();
    const { uploadFile, settle } = uploadsByName();
    const { container } = render(<Harness uploadFile={uploadFile} />);
    await user.upload(attachmentsDrop(), [named('a.pdf'), named('b.pdf'), named('c.pdf')]);
    await vi.waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(3));

    await act(async () => settle('a.pdf').resolve(stored('a.pdf')));
    await act(async () => settle('b.pdf').reject(new Error('storage is down')));
    await act(async () => settle('c.pdf').resolve(stored('c.pdf')));
    expect(state().values.attachments).toEqual([stored('a.pdf'), null, stored('c.pdf')]);
    expect(failed()).toEqual(['attachments.1']);
    expect(failedRows(container)).toEqual([1]);
  });

  it('appends a second batch after the first while the first is still arriving', async () => {
    const user = userEvent.setup();
    const { uploadFile, settle } = uploadsByName();
    render(<Harness uploadFile={uploadFile} />);
    await user.upload(attachmentsDrop(), [named('a.pdf'), named('b.pdf')]);
    await vi.waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(2));

    // The rows of the first batch are empty and in flight, so not free.
    expect(attachmentsDrop()).not.toBeDisabled();
    await user.upload(attachmentsDrop(), [named('c.pdf')]);
    await vi.waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(3));
    expect(uploadFile.mock.calls[2]?.[1]?.id).toBe('attachments.2');

    await act(async () => settle('c.pdf').resolve(stored('c.pdf')));
    await act(async () => settle('b.pdf').resolve(stored('b.pdf')));
    await act(async () => settle('a.pdf').resolve(stored('a.pdf')));
    expect(state().values.attachments).toEqual([stored('a.pdf'), stored('b.pdf'), stored('c.pdf')]);
  });
});
