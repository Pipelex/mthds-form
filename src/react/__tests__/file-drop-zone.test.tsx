/**
 * The empty file field's one drop zone and what it offers beside the device's
 * own files: the link to the team's files, the recent ones as one-click chips
 * when the host reads them, the sheet's arrow keys, and the attached file's
 * card with its size, Replace and Remove.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Deep imports, not the `../../core` barrel: a value import of the barrel
// drags the gate and ajv into a suite that tests the control set.
import { getPipeIOContract } from '../../core/contracts';
import { getPipeInputForm } from '../../core/derive';
import type { FileSource, FileSourceRecentQuery, SourceFile } from '../../core/sources';
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

type HarnessProps = Partial<UseMethodFormOptions> &
  Pick<UseMethodFormOptions, 'descriptor' | 'contract'>;

/** A form whose host stores a dropped file, as every zone here needs, unless the test says how. */
function Harness(options: HarnessProps) {
  const form = useMethodForm({
    uploadFile: async (dropped: File) => `pipelex-storage://org/assets/${dropped.name}`,
    ...options,
  });
  return (
    <>
      <MethodForm form={form} presentation="app" />
      <output data-testid="state">{JSON.stringify({ values: form.values })}</output>
    </>
  );
}

const values = () => JSON.parse(screen.getByTestId('state').textContent ?? '{}').values;

beforeAll(() => {
  // A dropped file's preview is an object URL, which jsdom does not make.
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => vi.restoreAllMocks());

const file = (id: string, name: string, extra: Partial<SourceFile> = {}): SourceFile => ({
  id,
  url: `pipelex-storage://org/assets/${id}.pdf`,
  name,
  mediaType: 'application/pdf',
  ...extra,
});

const INVOICE = file('fl_1', 'INV-2291.pdf', { size: 348_160 });
const OLDER = file('fl_2', 'INV-2288.pdf');
const DRAFT = file('fl_3', 'contract-acme-draft.pdf');
const FOURTH = file('fl_4', 'summary-q3.pdf');

/** A source over a fixed list, recording every `recent` query; `recent` given unless left out. */
function sourceOf(
  files: readonly SourceFile[],
  options: { recent?: FileSource['recent'] | false } = {},
): FileSource & { recentQueries: FileSourceRecentQuery[] } {
  const recentQueries: FileSourceRecentQuery[] = [];
  const recent: FileSource['recent'] =
    options.recent === false
      ? undefined
      : (options.recent ??
        (async (query) => {
          recentQueries.push(query);
          return files;
        }));
  return {
    initialScope: 'mine',
    recentQueries,
    list: async () => ({ files }),
    ...(recent ? { recent } : {}),
  };
}

const pickLink = () => screen.getByRole('button', { name: S.chooseFromSourceAria('Attachment') });

describe('one drop zone', () => {
  it('says to drop or click, and holds the link to the team’s files inside it', () => {
    const { container } = render(
      <Harness {...ONE_DOCUMENT} fileSource={sourceOf([INVOICE], { recent: false })} />,
    );
    expect(screen.getByText(S.dropOrBrowse)).toBeInTheDocument();
    const input = container.querySelector('input[type="file"]:not([data-camera-input])');
    const zone = input?.parentElement;
    if (!zone) throw new Error('No drop zone');
    expect(zone).toContainElement(pickLink());
    expect(pickLink()).toHaveTextContent(S.chooseFromSource);
  });

  it('opens the team’s files from the link, and not the device’s file dialog behind it', async () => {
    const user = userEvent.setup();
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([INVOICE], { recent: false })} />);
    await user.click(pickLink());
    await screen.findByRole('dialog', { name: S.filePickerTitle });
    expect(click).not.toHaveBeenCalled();
  });

  it('offers no link, and no chip, when the host gives no file source', () => {
    render(<Harness {...ONE_DOCUMENT} />);
    expect(screen.getByText(S.dropOrBrowse)).toBeInTheDocument();
    expect(screen.queryByText(S.chooseFromSource)).toBeNull();
    expect(screen.queryByRole('group', { name: S.recentFiles })).toBeNull();
  });
});

describe('recent files in the zone', () => {
  it('asks for the field’s types, on the source’s scope, and shows at most three chips', async () => {
    const source = sourceOf([INVOICE, OLDER, DRAFT, FOURTH]);
    render(<Harness {...ONE_DOCUMENT} fileSource={source} />);
    const group = await screen.findByRole('group', { name: S.recentFiles });
    const chips = within(group).getAllByRole('button');
    expect(chips.map((chip) => chip.textContent)).toEqual([
      'INV-2291.pdf',
      'INV-2288.pdf',
      'contract-acme-draft.pdf',
    ]);
    expect(chips[0]).toHaveAccessibleName(S.recentFileAria('INV-2291.pdf', 'Attachment'));
    expect(source.recentQueries).toHaveLength(1);
    expect(source.recentQueries[0]).toMatchObject({ scope: 'mine', limit: 3 });
    expect(source.recentQueries[0]?.mediaTypes).toContain('application/pdf');
  });

  it('writes a chip’s file in one click, exactly as a pick from the sheet does', async () => {
    const user = userEvent.setup();
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([INVOICE, OLDER])} />);
    await user.click(
      await screen.findByRole('button', { name: S.recentFileAria('INV-2288.pdf', 'Attachment') }),
    );
    expect(values().attachment).toEqual({ url: OLDER.url, filename: 'INV-2288.pdf' });
    expect(click).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
    // The zone, and its chips, go with the empty state.
    expect(screen.queryByRole('group', { name: S.recentFiles })).toBeNull();
  });

  it('shows no chip, and says nothing, when the read fails or answers none', async () => {
    const failing = sourceOf([INVOICE], { recent: async () => Promise.reject(new Error('down')) });
    const { unmount } = render(<Harness {...ONE_DOCUMENT} fileSource={failing} />);
    await waitFor(() => expect(pickLink()).toBeInTheDocument());
    expect(screen.queryByRole('group', { name: S.recentFiles })).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    unmount();

    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([])} />);
    await waitFor(() => expect(pickLink()).toBeInTheDocument());
    expect(screen.queryByRole('group', { name: S.recentFiles })).toBeNull();
  });

  it('is read once, however often a host that builds its source inline renders', async () => {
    const recent = vi.fn(async () => [INVOICE]);
    const list = vi.fn(async () => ({ files: [INVOICE] }));
    function Inline(_: { render: number }) {
      const form = useMethodForm({
        ...ONE_DOCUMENT,
        uploadFile: async () => 'pipelex-storage://org/assets/up.pdf',
        fileSource: { initialScope: 'everyone', list, recent },
      });
      return <MethodForm form={form} presentation="app" />;
    }
    const { rerender } = render(<Inline render={0} />);
    await screen.findByRole('group', { name: S.recentFiles });
    rerender(<Inline render={1} />);
    rerender(<Inline render={2} />);
    expect(recent).toHaveBeenCalledTimes(1);
    expect(list).not.toHaveBeenCalled();
  });

  it('is read again when the field is emptied', async () => {
    const user = userEvent.setup();
    const source = sourceOf([INVOICE]);
    render(<Harness {...ONE_DOCUMENT} fileSource={source} />);
    await user.click(
      await screen.findByRole('button', { name: S.recentFileAria('INV-2291.pdf', 'Attachment') }),
    );
    await user.click(screen.getByRole('button', { name: S.removeFileAria }));
    await screen.findByRole('group', { name: S.recentFiles });
    expect(source.recentQueries).toHaveLength(2);
  });
});

describe('the sheet from the keyboard', () => {
  it('walks the rows with the arrow keys from the search, and picks one with Enter', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        {...ONE_DOCUMENT}
        fileSource={sourceOf([INVOICE, OLDER, DRAFT], { recent: false })}
      />,
    );
    await user.click(pickLink());
    const dialog = await screen.findByRole('dialog', { name: S.filePickerTitle });
    const rows = await within(dialog).findAllByRole('button', { name: /\.pdf/ });
    await user.click(within(dialog).getByLabelText(S.filePickerSearch));
    await user.keyboard('{ArrowDown}');
    expect(rows[0]).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    // The last row stays the last: the keys do not wrap.
    expect(rows[2]).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(rows[1]).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(values().attachment).toEqual({ url: OLDER.url, filename: 'INV-2288.pdf' });
  });
});

describe('the attached file’s card', () => {
  it('says a chosen file’s type and size', async () => {
    const user = userEvent.setup();
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([INVOICE])} />);
    await user.click(
      await screen.findByRole('button', { name: S.recentFileAria('INV-2291.pdf', 'Attachment') }),
    );
    expect(screen.getByText(`PDF · ${S.fileSize(348_160)}`)).toBeInTheDocument();
  });

  it('says a dropped file’s size, once its upload has landed', async () => {
    const user = userEvent.setup();
    const pdf = new File(['%PDF-1.4 a small one'], 'mine.pdf', { type: 'application/pdf' });
    const { container } = render(
      <Harness
        {...ONE_DOCUMENT}
        uploadFile={async () => ({ url: 'pipelex-storage://org/assets/mine.pdf' })}
      />,
    );
    const input = container.querySelector<HTMLInputElement>(
      'input[type="file"]:not([data-camera-input])',
    );
    if (!input) throw new Error('No file input');
    await user.upload(input, pdf);
    expect(await screen.findByText(`PDF · ${S.fileSize(pdf.size)}`)).toBeInTheDocument();
  });

  it('replaces the file from the team’s files through Replace’s menu', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        {...ONE_DOCUMENT}
        uploadFile={async () => 'pipelex-storage://org/assets/up.pdf'}
        fileSource={sourceOf([INVOICE, OLDER])}
      />,
    );
    await user.click(
      await screen.findByRole('button', { name: S.recentFileAria('INV-2291.pdf', 'Attachment') }),
    );
    await user.click(screen.getByRole('button', { name: S.replaceFileAria('Attachment') }));
    await user.click(await screen.findByRole('menuitem', { name: S.chooseFromSource }));
    const dialog = await screen.findByRole('dialog', { name: S.filePickerTitle });
    await user.click(await within(dialog).findByRole('button', { name: /^INV-2288\.pdf/ }));
    expect(values().attachment).toEqual({ url: OLDER.url, filename: 'INV-2288.pdf' });
    // The size said is the new file's, which the host did not give: none.
    expect(screen.queryByText(`PDF · ${S.fileSize(348_160)}`)).toBeNull();
  });

  it('replaces the file from the device, and leaves no file input in the page meanwhile', async () => {
    const user = userEvent.setup();
    const replacement = new File(['%PDF-1.4'], 'new.pdf', { type: 'application/pdf' });
    const uploadFile = vi.fn(async () => 'pipelex-storage://org/assets/new.pdf');
    // The browser's dialog, answered at once with the replacement.
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (
      this: HTMLInputElement,
    ) {
      Object.defineProperty(this, 'files', { value: [replacement], configurable: true });
      this.dispatchEvent(new Event('change'));
    });
    const { container } = render(
      <Harness
        {...ONE_DOCUMENT}
        uploadFile={uploadFile}
        initialValues={{ attachment: { url: INVOICE.url, filename: 'INV-2291.pdf' } }}
      />,
    );
    expect(container.querySelectorAll('input[type="file"]:not([data-camera-input])')).toHaveLength(
      0,
    );
    // With no file source, Replace is the device's dialog alone, with no menu.
    await user.click(screen.getByRole('button', { name: S.replaceFileAria('Attachment') }));
    await waitFor(() =>
      expect(values().attachment).toEqual({
        url: 'pipelex-storage://org/assets/new.pdf',
        filename: 'new.pdf',
      }),
    );
    expect(uploadFile).toHaveBeenCalledTimes(1);
  });

  it('removes the file, and the zone comes back', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        {...ONE_DOCUMENT}
        initialValues={{ attachment: { url: INVOICE.url, filename: 'INV-2291.pdf' } }}
      />,
    );
    await user.click(screen.getByRole('button', { name: S.removeFileAria }));
    expect(values().attachment).toBeUndefined();
    expect(screen.getByText(S.dropOrBrowse)).toBeInTheDocument();
  });
});
