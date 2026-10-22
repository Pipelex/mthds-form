/**
 * The file source seam, through the whole form: the row a file field offers
 * when the host gives a source and only then, the sheet's query narrowed to
 * what the field accepts, a choice written exactly as an upload writes it,
 * Close changing nothing, a list's choices added without duplicates and kept
 * through a search, and every state of the list.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Deep imports, not the `../../core` barrel: a value import of the barrel
// drags the gate and ajv into a suite that tests the control set.
import { getPipeIOContract } from '../../core/contracts';
import { getPipeInputForm } from '../../core/derive';
import { narrowFileFormats } from '../../core/narrow-file-formats';
import type { RunField } from '../../core/descriptor';
import type { FileSource, FileSourcePage, FileSourceQuery, SourceFile } from '../../core/sources';
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

type HarnessProps = Partial<UseMethodFormOptions> &
  Pick<UseMethodFormOptions, 'descriptor' | 'contract'> & { allowUrl?: boolean };

function Harness({ allowUrl, ...options }: HarnessProps) {
  const form = useMethodForm(options);
  return (
    <>
      <MethodForm form={form} presentation="app" allowUrl={allowUrl} />
      <output data-testid="state">{JSON.stringify({ values: form.values })}</output>
    </>
  );
}

const values = () => JSON.parse(screen.getByTestId('state').textContent ?? '{}').values;

const INVOICE: SourceFile = {
  id: 'fl_1',
  url: 'pipelex-storage://org/assets/1.pdf',
  name: 'INV-2291.pdf',
  mediaType: 'application/pdf',
  size: 348_160,
  kind: 'uploaded',
  origin: 'Uploaded by Ana',
  createdAt: '2025-03-14T10:00:00Z',
};
const OLDER: SourceFile = {
  id: 'fl_2',
  url: 'pipelex-storage://org/assets/2.pdf',
  name: 'INV-2288.pdf',
  mediaType: 'application/pdf',
};
const DRAFT: SourceFile = {
  id: 'fl_3',
  url: 'pipelex-storage://org/assets/3.pdf',
  name: 'contract-acme-draft.pdf',
  mediaType: 'application/pdf',
  kind: 'test',
  origin: 'Made by the build assistant',
};

/** A source over a fixed list, searched by name, recording every query. */
function sourceOf(
  files: readonly SourceFile[],
  overrides: Partial<FileSource> = {},
): FileSource & { queries: FileSourceQuery[] } {
  const queries: FileSourceQuery[] = [];
  return {
    initialScope: 'everyone',
    queries,
    list: async (query) => {
      queries.push(query);
      const needle = query.search.toLowerCase();
      return { files: files.filter((f) => f.name.toLowerCase().includes(needle)) };
    },
    ...overrides,
  };
}

/** Opens the single document field's sheet and answers it. */
const openPicker = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: S.chooseFromSourceAria('Attachment') }));
  return screen.findByRole('dialog', { name: S.filePickerTitle });
};

describe('no source, no row', () => {
  it('offers no "Choose from your team\'s files" when the host gives no file source', () => {
    render(<Harness {...ONE_DOCUMENT} />);
    expect(screen.queryByText(S.chooseFromSource)).not.toBeInTheDocument();
  });

  it('offers it under the field, named for the field, when the host gives one', () => {
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([INVOICE])} />);
    expect(
      screen.getByRole('button', { name: S.chooseFromSourceAria('Attachment') }),
    ).toBeInTheDocument();
  });
});

describe('the sheet over a single file field', () => {
  it('asks for the field’s accepted media types, and names them under its title', async () => {
    const user = userEvent.setup();
    const source = sourceOf([INVOICE]);
    const onlyPdf = (fields: RunField[]) => narrowFileFormats(fields, ['application/pdf']);
    render(<Harness {...ONE_DOCUMENT} fileSource={source} prepareFields={onlyPdf} />);
    const dialog = await openPicker(user);
    expect(within(dialog).getByText(S.filePickerTakes(['PDF']))).toBeInTheDocument();
    await within(dialog).findByText('INV-2291.pdf');
    expect(source.queries[0]).toMatchObject({
      search: '',
      scope: 'everyone',
      mediaTypes: ['application/pdf'],
    });
    expect(source.queries[0]?.cursor).toBeUndefined();
  });

  it('writes the chosen file as {url, filename}, exactly as an upload writes it', async () => {
    const user = userEvent.setup();
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([INVOICE, OLDER])} />);
    const dialog = await openPicker(user);
    const use = within(dialog).getByRole('button', { name: S.filePickerUse(0, undefined) });
    expect(use).toBeDisabled();
    const row = await within(dialog).findByRole('radio', { name: /INV-2291\.pdf/ });
    expect(row).toHaveAttribute('aria-checked', 'false');
    await user.click(row);
    expect(row).toHaveAttribute('aria-checked', 'true');
    await user.click(within(dialog).getByRole('button', { name: 'Use INV-2291.pdf' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(values().attachment).toEqual({ url: INVOICE.url, filename: 'INV-2291.pdf' });
    // The field shows the file as after an upload, and the row is gone with the empty state.
    expect(screen.getByText('INV-2291.pdf')).toBeInTheDocument();
    expect(screen.queryByText(S.chooseFromSource)).not.toBeInTheDocument();
  });

  it('leaves the field as it was when closed, by its close button or by Escape', async () => {
    const user = userEvent.setup();
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([INVOICE])} />);
    let dialog = await openPicker(user);
    await user.click(await within(dialog).findByRole('radio', { name: /INV-2291\.pdf/ }));
    await user.click(within(dialog).getByRole('button', { name: S.close }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(values().attachment).toBeUndefined();

    dialog = await openPicker(user);
    // It opens on a fresh choice: the closed sheet's choice went with it.
    const row = await within(dialog).findByRole('radio', { name: /INV-2291\.pdf/ });
    expect(row).toHaveAttribute('aria-checked', 'false');
    await user.click(row);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(values().attachment).toBeUndefined();
  });

  it('leads a test file’s second line with "Test file", and words the rest from the row', async () => {
    const user = userEvent.setup();
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([INVOICE, DRAFT])} />);
    const dialog = await openPicker(user);
    const draft = await within(dialog).findByRole('radio', { name: /contract-acme-draft\.pdf/ });
    expect(draft).toHaveTextContent('Test file · PDF · Made by the build assistant');
    const invoice = within(dialog).getByRole('radio', { name: /INV-2291\.pdf/ });
    expect(invoice).toHaveTextContent('PDF · 340 KB · Uploaded by Ana · 14 Mar 2025');
    expect(invoice).not.toHaveTextContent(S.testFile);
  });

  it('opens on the scope the host chose, and asks again when the switch moves', async () => {
    const user = userEvent.setup();
    const source = sourceOf([INVOICE], { initialScope: 'mine' });
    render(<Harness {...ONE_DOCUMENT} fileSource={source} />);
    const dialog = await openPicker(user);
    await within(dialog).findByText('INV-2291.pdf');
    expect(source.queries.at(-1)?.scope).toBe('mine');
    await user.click(within(dialog).getByRole('radio', { name: S.filePickerEveryone }));
    await waitFor(() => expect(source.queries.at(-1)?.scope).toBe('everyone'));
  });
});

describe('the sheet over a list of files', () => {
  it('adds the chosen files after what the list holds, and never the same file twice', async () => {
    const user = userEvent.setup();
    const held = { url: INVOICE.url, filename: 'INV-2291.pdf' };
    render(
      <Harness
        {...MANY_FILES}
        initialValues={{ attachments: [held] }}
        fileSource={sourceOf([INVOICE, OLDER, DRAFT])}
      />,
    );
    // The list's own entry is the one named for the list.
    await user.click(screen.getByRole('button', { name: S.chooseFromSourceAria('Attachments') }));
    const dialog = await screen.findByRole('dialog', { name: S.filePickerTitle });
    await user.click(await within(dialog).findByRole('checkbox', { name: /INV-2291\.pdf/ }));
    await user.click(within(dialog).getByRole('checkbox', { name: /INV-2288\.pdf/ }));
    await user.click(within(dialog).getByRole('button', { name: S.filePickerUse(2, undefined) }));
    expect(values().attachments).toEqual([held, { url: OLDER.url, filename: 'INV-2288.pdf' }]);
  });

  it('keeps the choices through a search', async () => {
    const user = userEvent.setup();
    const source = sourceOf([INVOICE, OLDER, DRAFT]);
    render(<Harness {...MANY_FILES} fileSource={source} />);
    await user.click(screen.getByRole('button', { name: S.chooseFromSourceAria('Attachments') }));
    const dialog = await screen.findByRole('dialog', { name: S.filePickerTitle });
    await user.click(await within(dialog).findByRole('checkbox', { name: /INV-2291\.pdf/ }));
    await user.type(within(dialog).getByLabelText(S.filePickerSearch), 'contract');
    // The search narrows the rows, and the earlier choice is still counted.
    await waitFor(() =>
      expect(within(dialog).queryByRole('checkbox', { name: /INV-2291/ })).not.toBeInTheDocument(),
    );
    expect(source.queries.at(-1)?.search).toBe('contract');
    await user.click(within(dialog).getByRole('checkbox', { name: /contract-acme-draft/ }));
    await user.click(within(dialog).getByRole('button', { name: S.filePickerUse(2, undefined) }));
    expect(values().attachments).toEqual([
      { url: INVOICE.url, filename: 'INV-2291.pdf' },
      { url: DRAFT.url, filename: 'contract-acme-draft.pdf' },
    ]);
  });

  it('closes on nothing: a list keeps what it held', async () => {
    const user = userEvent.setup();
    render(<Harness {...MANY_FILES} fileSource={sourceOf([INVOICE])} />);
    await user.click(screen.getByRole('button', { name: S.chooseFromSourceAria('Attachments') }));
    const dialog = await screen.findByRole('dialog', { name: S.filePickerTitle });
    await user.click(await within(dialog).findByRole('checkbox', { name: /INV-2291\.pdf/ }));
    await user.click(within(dialog).getByRole('button', { name: S.close }));
    expect(values().attachments).toBeUndefined();
  });
});

/**
 * The visible line a state shows, leaving out the sheet's status line, which
 * announces the same words to assistive technology.
 */
const SHOWN = { ignore: '[role="status"], script, style' };

describe('the list’s states', () => {
  it('says the team has no file of the field’s formats, and offers the field’s own upload', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        {...ONE_DOCUMENT}
        uploadFile={async () => 'pipelex-storage://org/assets/new.pdf'}
        fileSource={sourceOf([])}
      />,
    );
    const dialog = await openPicker(user);
    expect(
      await within(dialog).findByText(S.filePickerNoneTeam(['PDF', 'JPG', 'PNG']), SHOWN),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: S.filePickerUpload })).toBeInTheDocument();
  });

  it('offers no upload from an empty list when the field cannot upload', async () => {
    const user = userEvent.setup();
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([])} />);
    const dialog = await openPicker(user);
    await within(dialog).findByText(S.filePickerNoneTeam(['PDF', 'JPG', 'PNG']), SHOWN);
    expect(within(dialog).queryByRole('button', { name: S.filePickerUpload })).toBeNull();
  });

  it('says the person has none yet on Mine, and shows everyone’s on request', async () => {
    const user = userEvent.setup();
    const source = sourceOf([], { initialScope: 'mine' });
    render(<Harness {...ONE_DOCUMENT} fileSource={source} />);
    const dialog = await openPicker(user);
    await within(dialog).findByText(S.filePickerNoneMine(['PDF', 'JPG', 'PNG']), SHOWN);
    await user.click(within(dialog).getByRole('button', { name: S.filePickerShowEveryone }));
    await waitFor(() => expect(source.queries.at(-1)?.scope).toBe('everyone'));
  });

  it('says a search matched nothing, and clears it on request', async () => {
    const user = userEvent.setup();
    const source = sourceOf([INVOICE]);
    render(<Harness {...ONE_DOCUMENT} fileSource={source} />);
    const dialog = await openPicker(user);
    await within(dialog).findByText('INV-2291.pdf');
    await user.type(within(dialog).getByLabelText(S.filePickerSearch), 'zzz');
    await within(dialog).findByText(S.filePickerNoMatch, SHOWN);
    await user.click(within(dialog).getByRole('button', { name: S.filePickerClearSearch }));
    await within(dialog).findByText('INV-2291.pdf');
    expect(within(dialog).getByLabelText(S.filePickerSearch)).toHaveValue('');
  });

  it('says the read failed, and reads again on Try again', async () => {
    const user = userEvent.setup();
    let fail = true;
    const source = sourceOf([INVOICE], {
      list: async () => {
        if (fail) throw new Error('down');
        return { files: [INVOICE] };
      },
    });
    render(<Harness {...ONE_DOCUMENT} fileSource={source} />);
    const dialog = await openPicker(user);
    await within(dialog).findByText(S.filePickerFailed, SHOWN);
    fail = false;
    await user.click(within(dialog).getByRole('button', { name: S.tryAgain }));
    await within(dialog).findByText('INV-2291.pdf');
  });

  it('shows dim rows while the first page is read, and announces the wait', async () => {
    const user = userEvent.setup();
    const source = sourceOf([], { list: () => new Promise<FileSourcePage>(() => undefined) });
    render(<Harness {...ONE_DOCUMENT} fileSource={source} />);
    const dialog = await openPicker(user);
    expect(dialog.querySelector('[data-dim-rows]')).not.toBeNull();
    expect(within(dialog).getByRole('status')).toHaveTextContent(S.filePickerLoading);
  });

  it('pages on Show more, keeps the rows when a later page fails, and stops at the end', async () => {
    const user = userEvent.setup();
    let failSecond = true;
    const list = vi.fn(async (query: FileSourceQuery): Promise<FileSourcePage> => {
      if (query.cursor === undefined) return { files: [INVOICE], nextCursor: 'page-2' };
      if (failSecond) throw new Error('down');
      return { files: [OLDER], nextCursor: null };
    });
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([], { list })} />);
    const dialog = await openPicker(user);
    await within(dialog).findByText('INV-2291.pdf');
    await user.click(within(dialog).getByRole('button', { name: S.showMore }));
    await within(dialog).findByText(S.loadMoreFailed);
    expect(within(dialog).getByText('INV-2291.pdf')).toBeInTheDocument();
    failSecond = false;
    await user.click(within(dialog).getByRole('button', { name: S.tryAgain }));
    await within(dialog).findByText('INV-2288.pdf');
    expect(list.mock.calls.at(-1)?.[0].cursor).toBe('page-2');
    expect(within(dialog).queryByRole('button', { name: S.showMore })).toBeNull();
  });

  it('follows an empty page that carries a cursor, and says "No files match" only at the end', async () => {
    const user = userEvent.setup();
    const list = vi.fn(async (query: FileSourceQuery): Promise<FileSourcePage> => {
      if (query.cursor === undefined) return { files: [], nextCursor: 'c1' };
      if (query.cursor === 'c1') return { files: [], nextCursor: 'c2' };
      return { files: [OLDER], nextCursor: null };
    });
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([], { list })} />);
    const dialog = await openPicker(user);
    await within(dialog).findByText('INV-2288.pdf');
    expect(list).toHaveBeenCalledTimes(3);
    expect(
      within(dialog).queryByText(S.filePickerNoneTeam(['PDF', 'JPG', 'PNG']), SHOWN),
    ).toBeNull();
  });
});

describe('a field whose only way in is the team’s files', () => {
  it('renders, offers the team’s files, and claims no link can be pasted', async () => {
    const user = userEvent.setup();
    render(<Harness {...ONE_DOCUMENT} allowUrl={false} fileSource={sourceOf([INVOICE])} />);
    expect(screen.queryByText(S.uploadUnavailable)).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    const dialog = await openPicker(user);
    await user.click(await within(dialog).findByRole('radio', { name: /INV-2291\.pdf/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Use INV-2291.pdf' }));
    expect(values().attachment).toEqual({ url: INVOICE.url, filename: 'INV-2291.pdf' });
  });
});

describe('a list holding empty rows', () => {
  /** The list of attachments, bounded to two. */
  const boundedToTwo = (fields: RunField[]) =>
    fields.map((field) => (field.name === 'attachments' ? { ...field, maxItemCount: 2 } : field));

  it('fills its empty rows first, and counts its room by the files it holds', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        {...MANY_FILES}
        prepareFields={boundedToTwo}
        initialValues={{ attachments: [undefined, undefined] }}
        fileSource={sourceOf([INVOICE, OLDER, DRAFT])}
      />,
    );
    const entry = screen.getByRole('button', { name: S.chooseFromSourceAria('Attachments') });
    expect(entry).toBeEnabled();
    await user.click(entry);
    const dialog = await screen.findByRole('dialog', { name: S.filePickerTitle });
    await user.click(await within(dialog).findByRole('checkbox', { name: /INV-2291\.pdf/ }));
    await user.click(within(dialog).getByRole('checkbox', { name: /INV-2288\.pdf/ }));
    // Two rows of room, both taken: the third file cannot be chosen.
    expect(within(dialog).getByRole('checkbox', { name: /contract-acme-draft/ })).toBeDisabled();
    await user.click(within(dialog).getByRole('button', { name: S.filePickerUse(2, undefined) }));
    expect(values().attachments).toEqual([
      { url: INVOICE.url, filename: 'INV-2291.pdf' },
      { url: OLDER.url, filename: 'INV-2288.pdf' },
    ]);
  });
});

describe('a host whose cursors go round in a circle', () => {
  it('stops following empty pages at a cursor it has already followed', async () => {
    const user = userEvent.setup();
    let calls = 0;
    const list = vi.fn(async (query: FileSourceQuery): Promise<FileSourcePage> => {
      calls += 1;
      // A guard for the test itself: a list that never stops would starve the
      // event loop, so the twentieth call fails instead.
      if (calls > 20) throw new Error('followed forever');
      return { files: [], nextCursor: query.cursor === 'a' ? 'b' : 'a' };
    });
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([], { list })} />);
    const dialog = await openPicker(user);
    await within(dialog).findByText(S.filePickerNoneTeam(['PDF', 'JPG', 'PNG']), SHOWN);
    expect(list).toHaveBeenCalledTimes(3);
  });
});

describe('focus, when the sheet closes', () => {
  it('returns to the field’s row on Escape and on the close button', async () => {
    const user = userEvent.setup();
    render(<Harness {...ONE_DOCUMENT} fileSource={sourceOf([INVOICE])} />);
    const entry = screen.getByRole('button', { name: S.chooseFromSourceAria('Attachment') });
    await openPicker(user);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(entry).toHaveFocus());
    const dialog = await openPicker(user);
    await user.click(within(dialog).getByRole('button', { name: S.close }));
    await waitFor(() => expect(entry).toHaveFocus());
  });

  it('returns to the list’s row when the list’s sheet closes', async () => {
    const user = userEvent.setup();
    render(<Harness {...MANY_FILES} fileSource={sourceOf([INVOICE])} />);
    const entry = screen.getByRole('button', { name: S.chooseFromSourceAria('Attachments') });
    await user.click(entry);
    await screen.findByRole('dialog', { name: S.filePickerTitle });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(entry).toHaveFocus());
  });
});

describe('a source the host builds inline', () => {
  /** A host that builds its file source anew on every render, as docs/sources.md allows. */
  function InlineSource({ list }: { list: FileSource['list']; render: number }) {
    const form = useMethodForm({ ...ONE_DOCUMENT, fileSource: { initialScope: 'everyone', list } });
    return <MethodForm form={form} presentation="app" />;
  }

  it('is read only when the sheet asks for a page, however often the host renders', async () => {
    const user = userEvent.setup();
    const list = vi.fn(async () => ({ files: [INVOICE] }));
    const { rerender } = render(<InlineSource list={list} render={0} />);
    rerender(<InlineSource list={list} render={1} />);
    expect(list).not.toHaveBeenCalled();
    const dialog = await openPicker(user);
    await within(dialog).findByText('INV-2291.pdf');
    rerender(<InlineSource list={list} render={2} />);
    rerender(<InlineSource list={list} render={3} />);
    expect(within(dialog).getByText('INV-2291.pdf')).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(1);
  });
});
