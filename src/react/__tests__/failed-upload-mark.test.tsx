/**
 * A failed upload's mark in the form's own state, once another file stands
 * where the failed one would have.
 *
 * `useMethodForm` records a rejected upload in `failedUploadIds`, and
 * `MethodForm` shows it on the field as `uploadFailed`. The field's other ways
 * in (a file chosen from the host's files, a typed link, the clear control)
 * used to hide that message only in the mounted control's own state: the
 * controller went on reporting the field as failed, and a control mounted
 * again over the same id showed "upload failed" under the file that had
 * replaced it. A write that changes the file at a failed path ends the
 * failure in the kernel, so the controller and the control agree.
 */
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Deep imports, not the `../../core` barrel: a value import of the barrel
// drags the gate and ajv into a suite that tests the control set.
import { getPipeIOContract } from '../../core/contracts';
import { getPipeInputForm } from '../../core/derive';
import type { FileSource, SourceFile } from '../../core/sources';
import { MethodForm, useMethodForm, type UseMethodFormOptions } from '../method-form';
import { EN_FIELD_STRINGS as S } from '../locales/en';
import { CONTRACTS, INPUT_FORM } from '../../__stories__/_generated/files';

function artifacts(code: string) {
  const contract = getPipeIOContract(CONTRACTS, 'files', code);
  const descriptor = getPipeInputForm(INPUT_FORM, 'files', code);
  if (!contract || !descriptor) throw new Error(`No fixture for files.${code}`);
  return { contract, descriptor };
}

const ONE_DOCUMENT = artifacts('one_document');
const MANY_FILES = artifacts('many_files');

const INVOICE: SourceFile = {
  id: 'fl_1',
  url: 'pipelex-storage://org/assets/1.pdf',
  name: 'INV-2291.pdf',
  mediaType: 'application/pdf',
};
const SOURCE: FileSource = {
  initialScope: 'everyone',
  list: async () => ({ files: [INVOICE] }),
};
const HOST_FILE = { url: 'https://example.com/host.pdf', filename: 'host.pdf' };

const pdf = () => new File(['%PDF-1.4'], 'mine.pdf', { type: 'application/pdf' });
const rejected = async (): Promise<string> => {
  throw new Error('storage is down');
};

type HarnessProps = Partial<UseMethodFormOptions> &
  Pick<UseMethodFormOptions, 'descriptor' | 'contract'>;

/**
 * A consumer that keeps its controller while it mounts the fields again, as a
 * host does when it swaps its own control for the form's, and that can write
 * a value at the file's path itself, through `setValues`.
 */
function Harness(options: HarnessProps) {
  const form = useMethodForm(options);
  const [mounts, setMounts] = useState(0);
  return (
    <>
      <MethodForm key={mounts} form={form} presentation="app" />
      <button type="button" onClick={() => setMounts((count) => count + 1)}>
        Mount again
      </button>
      <button
        type="button"
        onClick={() => form.setValues((previous) => ({ ...previous, attachment: HOST_FILE }))}
      >
        Host writes a file
      </button>
      <button
        type="button"
        onClick={() => form.setValues((previous) => ({ ...previous, note: 'unrelated' }))}
      >
        Host writes elsewhere
      </button>
      <output data-testid="state">
        {JSON.stringify({ values: form.values, failed: [...form.failedUploadIds] })}
      </output>
    </>
  );
}

const state = () => JSON.parse(screen.getByTestId('state').textContent ?? '{}');
const failed = (): string[] => state().failed;
const fileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;
type User = ReturnType<typeof userEvent.setup>;
const mountAgain = (user: User) => user.click(screen.getByRole('button', { name: 'Mount again' }));

/** Drops a file on the single document field and waits for its upload to fail. */
async function failTheUpload(user: User, container: HTMLElement) {
  await user.upload(fileInput(container), pdf());
  await screen.findByText(S.uploadFailed);
  expect(failed()).toEqual(['attachment']);
}

beforeAll(() => {
  // A dropped file's preview is an object URL, which jsdom does not make.
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
});

describe('a file put in place of a failed upload ends its failure in the form', () => {
  it('ends it when a file is chosen from the host’s files', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness {...ONE_DOCUMENT} uploadFile={rejected} fileSource={SOURCE} />,
    );
    await failTheUpload(user, container);

    await user.click(screen.getByRole('button', { name: S.chooseFromSourceAria('Attachment') }));
    const dialog = await screen.findByRole('dialog', { name: S.filePickerTitle });
    await user.click(await within(dialog).findByRole('radio', { name: /INV-2291\.pdf/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Use INV-2291.pdf' }));
    expect(state().values.attachment).toEqual({ url: INVOICE.url, filename: 'INV-2291.pdf' });
    expect(failed()).toEqual([]);

    await mountAgain(user);
    expect(screen.getByText('INV-2291.pdf')).toBeInTheDocument();
    expect(screen.queryByText(S.uploadFailed)).toBeNull();
  });

  it('ends it when a link is typed instead', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness {...ONE_DOCUMENT} uploadFile={rejected} />);
    await failTheUpload(user, container);

    await user.click(screen.getByRole('button', { name: S.pasteUrlInstead }));
    await user.type(screen.getByRole('textbox'), 'https://example.com/brief.pdf');
    expect(state().values.attachment).toEqual({ url: 'https://example.com/brief.pdf' });
    expect(failed()).toEqual([]);

    await mountAgain(user);
    expect(screen.getByText('https://example.com/brief.pdf')).toBeInTheDocument();
    expect(screen.queryByText(S.uploadFailed)).toBeNull();
  });

  it('ends it when the field is cleared', async () => {
    const user = userEvent.setup();
    // The one way a failure lands on a field holding a file: the file is
    // written while the upload is still in flight, and the upload then fails.
    let fail: (error: Error) => void = () => {};
    const uploadFile = () => new Promise<string>((_, reject) => (fail = reject));
    const { container } = render(<Harness {...ONE_DOCUMENT} uploadFile={uploadFile} />);
    await user.upload(fileInput(container), pdf());
    await user.click(screen.getByRole('button', { name: 'Host writes a file' }));
    await act(async () => fail(new Error('storage is down')));
    expect(failed()).toEqual(['attachment']);
    expect(screen.getByText(S.uploadFailed)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: S.removeFileAria }));
    expect(state().values.attachment).toBeUndefined();
    expect(failed()).toEqual([]);

    await mountAgain(user);
    expect(screen.queryByText(S.uploadFailed)).toBeNull();
  });

  it('ends it when a list’s sheet fills the row whose upload failed', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness {...MANY_FILES} uploadFile={rejected} fileSource={SOURCE} />,
    );
    // The first list is the attachments; the fixture's other list is a gallery.
    const [addAttachment] = screen.getAllByRole('button', { name: S.addItem });
    if (!addAttachment) throw new Error('No Add item');
    await user.click(addAttachment);
    await user.upload(fileInput(container), pdf());
    await screen.findByText(S.uploadFailed);
    expect(failed()).toEqual(['attachments.0']);

    await user.click(screen.getByRole('button', { name: S.chooseFromSourceAria('Attachments') }));
    const dialog = await screen.findByRole('dialog', { name: S.filePickerTitle });
    await user.click(await within(dialog).findByRole('checkbox', { name: /INV-2291\.pdf/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Use INV-2291.pdf' }));
    expect(failed()).toEqual([]);

    await mountAgain(user);
    expect(screen.queryByText(S.uploadFailed)).toBeNull();
  });

  it('ends it when the host writes a file there through setValues', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness {...ONE_DOCUMENT} uploadFile={rejected} />);
    await failTheUpload(user, container);

    await user.click(screen.getByRole('button', { name: 'Host writes a file' }));
    expect(failed()).toEqual([]);

    await mountAgain(user);
    expect(screen.getByText('host.pdf')).toBeInTheDocument();
    expect(screen.queryByText(S.uploadFailed)).toBeNull();
  });
});

describe('a write that leaves the failed file’s place as it was keeps the failure', () => {
  it('keeps it through a write at another path', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness {...ONE_DOCUMENT} uploadFile={rejected} />);
    await failTheUpload(user, container);

    await user.click(screen.getByRole('button', { name: 'Host writes elsewhere' }));
    expect(failed()).toEqual(['attachment']);
    expect(screen.getByText(S.uploadFailed)).toBeInTheDocument();
  });

  it('keeps it when a row is added after the failed one', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness {...MANY_FILES} uploadFile={rejected} />);
    const [addAttachment] = screen.getAllByRole('button', { name: S.addItem });
    if (!addAttachment) throw new Error('No Add item');
    await user.click(addAttachment);
    await user.upload(fileInput(container), pdf());
    await screen.findByText(S.uploadFailed);

    await user.click(addAttachment);
    expect(state().values.attachments).toHaveLength(2);
    expect(failed()).toEqual(['attachments.0']);
    expect(screen.getByText(S.uploadFailed)).toBeInTheDocument();
  });

  it('marks it again when the next file dropped there fails too', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness {...ONE_DOCUMENT} uploadFile={rejected} />);
    await failTheUpload(user, container);
    await user.click(screen.getByRole('button', { name: S.pasteUrlInstead }));
    await user.type(screen.getByRole('textbox'), 'h');
    await user.clear(screen.getByRole('textbox'));
    expect(failed()).toEqual([]);

    await failTheUpload(user, container);
  });
});
