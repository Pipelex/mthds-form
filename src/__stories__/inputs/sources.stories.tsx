import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type {
  ExampleSource,
  FileSource,
  FormExample,
  InputForm,
  PipeIOContracts,
  RunField,
  SourceFile,
} from '../../core';
import { getPipeInputForm, getPipeIOContract, narrowFileFormats } from '../../core';
import { DEFAULT_FIELD_STRINGS as S, MethodForm, useMethodForm } from '../../react';
import { CONTRACTS, INPUT_FORM } from '../_generated/files';
import {
  CONTRACTS as STRUCTURED_CONTRACTS,
  INPUT_FORM as STRUCTURED_INPUT_FORM,
} from '../_generated/structured';
import { atWidth, pinnedTo } from '../touch-target';

/**
 * The two host seams beside the upload: a team's files, which every empty file
 * field offers under "Choose from your team's files", and a method's examples,
 * which the form offers as "Fill with an example". Each story names the one
 * state it shows.
 *
 * The descriptors and contracts are the corpus's, as everywhere. The rows the
 * sources answer with are not a fixture of the standard: they are a host's own
 * records, which no projection of a method produces, so they are written here,
 * in the shapes the seams declare.
 */

/** A team's files, newest first, as a host keeps them. */
const TEAM_FILES: (SourceFile & { mine: boolean })[] = [
  {
    id: 'fl_7',
    url: 'pipelex-storage://team/assets/inv-2291.pdf',
    name: 'INV-2291.pdf',
    mediaType: 'application/pdf',
    size: 348_160,
    kind: 'uploaded',
    origin: 'Uploaded by you',
    createdAt: '2025-10-17T09:12:00Z',
    mine: true,
  },
  {
    id: 'fl_6',
    url: 'pipelex-storage://team/assets/contract-acme-draft.pdf',
    name: 'contract-acme-draft.pdf',
    mediaType: 'application/pdf',
    size: 1_258_291,
    kind: 'test',
    origin: 'Made by the build assistant',
    createdAt: '2025-10-16T15:40:00Z',
    mine: false,
  },
  {
    id: 'fl_5',
    url: 'pipelex-storage://team/assets/receipt-scan.png',
    name: 'receipt-scan.png',
    mediaType: 'image/png',
    size: 912_384,
    kind: 'uploaded',
    origin: 'Uploaded by Ana',
    createdAt: '2025-10-14T11:03:00Z',
    mine: false,
  },
  {
    id: 'fl_4',
    url: 'pipelex-storage://team/assets/summary-q3.pdf',
    name: 'summary-q3.pdf',
    mediaType: 'application/pdf',
    size: 88_064,
    kind: 'generated',
    origin: 'Made by Invoice check',
    createdAt: '2025-10-02T08:30:00Z',
    mine: true,
  },
  {
    id: 'fl_3',
    url: 'pipelex-storage://team/assets/inv-2288.pdf',
    name: 'INV-2288.pdf',
    mediaType: 'application/pdf',
    size: 301_056,
    kind: 'uploaded',
    origin: 'Uploaded by Ana',
    createdAt: '2025-09-24T16:21:00Z',
    mine: false,
  },
  {
    id: 'fl_2',
    url: 'pipelex-storage://team/assets/storefront.jpg',
    name: 'storefront.jpg',
    mediaType: 'image/jpeg',
    size: 2_411_725,
    kind: 'uploaded',
    origin: 'Uploaded by you',
    createdAt: '2025-08-30T10:00:00Z',
    mine: true,
  },
  {
    id: 'fl_1',
    url: 'pipelex-storage://team/assets/inv-2101.pdf',
    name: 'INV-2101.pdf',
    mediaType: 'application/pdf',
    size: 296_960,
    kind: 'uploaded',
    origin: 'Uploaded by Ana',
    createdAt: '2025-06-11T13:45:00Z',
    mine: false,
  },
];

/** A page holds four rows, so the team's files run to a second page. */
const PAGE_SIZE = 4;

/** What the file source answers: the team's files, nothing, a failure, or no answer yet. */
type FilesAnswer = 'team' | 'none' | 'failure' | 'waiting';

function fileSourceOf(answer: FilesAnswer, initialScope: 'mine' | 'everyone'): FileSource {
  return {
    initialScope,
    list: async ({ search, scope, mediaTypes, cursor }) => {
      if (answer === 'waiting') return new Promise(() => undefined);
      if (answer === 'failure') throw new Error('The host could not list its files.');
      const needle = search.toLowerCase();
      const matching = (answer === 'team' ? TEAM_FILES : []).filter(
        (file) =>
          (scope === 'everyone' || file.mine) &&
          (mediaTypes.length === 0 || mediaTypes.includes(file.mediaType ?? '')) &&
          file.name.toLowerCase().includes(needle),
      );
      const start = cursor === undefined ? 0 : Number(cursor);
      const end = start + PAGE_SIZE;
      return {
        files: matching.slice(start, end),
        nextCursor: end < matching.length ? String(end) : null,
      };
    },
  };
}

/** Two saved runs of the address form, in the run-input shape a host stores. */
const EXAMPLES: FormExample[] = [
  {
    id: 'ex_1',
    name: 'Paris office',
    inputs: {
      address: {
        concept: 'structured.Address',
        content: { street: '1 rue de la Paix', city: 'Paris', country: 'France' },
      },
    },
  },
  {
    id: 'ex_2',
    name: 'Berlin office',
    inputs: {
      address: {
        concept: 'structured.Address',
        content: { street: 'Unter den Linden 5', city: 'Berlin', country: 'Germany' },
      },
    },
  },
];

/** What the example source answers: two examples, none, or a failure. */
type ExamplesAnswer = 'two' | 'none' | 'failure';

function exampleSourceOf(answer: ExamplesAnswer): ExampleSource {
  let examples = answer === 'two' ? [...EXAMPLES] : [];
  return {
    list: async () => {
      if (answer === 'failure') throw new Error('The host could not list its examples.');
      return { examples };
    },
    rename: async (example, name) => {
      examples = examples.map((item) => (item.id === example.id ? { ...item, name } : item));
      return { ...example, name };
    },
    delete: async (example) => {
      examples = examples.filter((item) => item.id !== example.id);
    },
  };
}

interface SourcesStoryProps {
  contracts: PipeIOContracts;
  inputForm: InputForm;
  domain: string;
  pipeCode: string;
  /** The file source's answer; no file source when absent. */
  files?: FilesAnswer;
  /** Where the file source opens. */
  initialScope?: 'mine' | 'everyone';
  /** The media types a host narrows the form's files to. */
  narrowTo?: string[];
  /** The example source's answer; no example source when absent. */
  examples?: ExamplesAnswer;
}

function SourcesStory({
  contracts,
  inputForm,
  domain,
  pipeCode,
  files,
  initialScope = 'everyone',
  narrowTo,
  examples,
}: SourcesStoryProps) {
  const contract = getPipeIOContract(contracts, domain, pipeCode);
  const descriptor = getPipeInputForm(inputForm, domain, pipeCode);
  if (!contract || !descriptor) {
    throw new Error(`No fixture entry for ${domain}.${pipeCode}.`);
  }
  const form = useMethodForm({
    descriptor,
    contract,
    // The object URL is never revoked: a story's page is short-lived.
    uploadFile: async (file) => URL.createObjectURL(file),
    prepareFields: narrowTo
      ? (fields: RunField[]) => narrowFileFormats(fields, narrowTo)
      : undefined,
    fileSource: files ? fileSourceOf(files, initialScope) : undefined,
    exampleSource: examples ? exampleSourceOf(examples) : undefined,
  });
  return (
    <div data-sources-demo style={{ display: 'grid', gap: 18, maxWidth: 560 }}>
      <MethodForm form={form} presentation="app" />
      <pre className="text-[11px] text-foreground" data-testid="sources-values">
        {JSON.stringify(form.values, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: 'Inputs/Team Files and Examples',
  component: SourcesStory,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'files' },
} satisfies Meta<typeof SourcesStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The light pane's demo: a sheet opens over the whole page, so the stories open one. */
function pane(canvasElement: HTMLElement) {
  const demo = canvasElement.querySelector<HTMLElement>('[data-sources-demo]');
  if (!demo) throw new Error('No sources demo rendered');
  return within(demo);
}

/** Opens the sheet of the light pane's field or list named `label`. */
async function openTeamFiles(canvasElement: HTMLElement, label: string) {
  await userEvent.click(
    pane(canvasElement).getByRole('button', { name: S.chooseFromSourceAria(label) }),
  );
  return within(canvasElement.ownerDocument.body).findByRole('dialog', {
    name: S.filePickerTitle,
  });
}

/** Opens the light pane's examples. */
async function openExamples(canvasElement: HTMLElement) {
  await userEvent.click(pane(canvasElement).getByRole('button', { name: S.fillWithExample }));
  return within(canvasElement.ownerDocument.body).findByRole('dialog', {
    name: S.examplesTitle,
  });
}

/**
 * **A file field with the team's files.** Under the dropzone and the link,
 * "Choose from your team's files" is a full-width row. Without a file source
 * the row is not there at all: `Inputs/Files/Document` is the same field
 * without one.
 */
export const FileFieldWithTeamFiles: Story = {
  name: 'A file field with the team’s files',
  args: { pipeCode: 'one_document', files: 'team' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Two of each: two theme panes.
    await expect(
      canvas.getAllByRole('button', { name: S.chooseFromSourceAria('Attachment') }),
    ).toHaveLength(2);
  },
};

/**
 * **The team's files, open on a PDF-only field, one file chosen.** The line
 * under the title names what the field takes, so the list holds no image. The
 * chosen row has a faint fill and a check, and the button names the file.
 * Left open so the accessibility check reads the sheet.
 */
export const TeamFilesOpen: Story = {
  name: 'The team’s files, one chosen',
  args: { pipeCode: 'one_document', files: 'team', narrowTo: ['application/pdf'] },
  play: async ({ canvasElement }) => {
    const dialog = within(await openTeamFiles(canvasElement, 'Attachment'));
    await expect(dialog.getByText(S.filePickerTakes(['PDF']))).toBeVisible();
    const row = await dialog.findByRole('radio', { name: /INV-2291\.pdf/ });
    await expect(dialog.queryByText('receipt-scan.png')).toBeNull();
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-checked', 'true');
    await expect(dialog.getByRole('button', { name: 'Use INV-2291.pdf' })).toBeEnabled();
  },
};

/**
 * **Using a file.** The sheet closes and the field holds the file, written as
 * `{url, filename}` exactly as an upload writes it; the row goes with the
 * empty state, as the dropzone does.
 */
export const UseATeamFile: Story = {
  name: 'Use a team file',
  args: { pipeCode: 'one_document', files: 'team' },
  play: async ({ canvasElement }) => {
    const dialog = within(await openTeamFiles(canvasElement, 'Attachment'));
    await userEvent.click(await dialog.findByRole('radio', { name: /contract-acme-draft\.pdf/ }));
    await userEvent.click(dialog.getByRole('button', { name: 'Use contract-acme-draft.pdf' }));
    await waitFor(() =>
      expect(pane(canvasElement).getByTestId('sources-values').textContent).toContain(
        'pipelex-storage://team/assets/contract-acme-draft.pdf',
      ),
    );
    await expect(
      pane(canvasElement).queryByRole('button', { name: S.chooseFromSourceAria('Attachment') }),
    ).toBeNull();
  },
};

/**
 * **A list of files takes several at once.** The list's own row sits under
 * Add item; its sheet has check boxes and a button counting the choice, and
 * Use adds one row per file after what the list holds.
 */
export const ListOfFiles: Story = {
  name: 'A list of files, several chosen',
  args: { pipeCode: 'many_files', files: 'team' },
  play: async ({ canvasElement }) => {
    const dialog = within(await openTeamFiles(canvasElement, 'Attachments'));
    await userEvent.click(await dialog.findByRole('checkbox', { name: /INV-2291\.pdf/ }));
    await userEvent.click(dialog.getByRole('checkbox', { name: /summary-q3\.pdf/ }));
    await expect(dialog.getByRole('button', { name: S.filePickerUse(2, undefined) })).toBeEnabled();
  },
};

/**
 * **Mine, when the person has added or made none of the field's files**, on a
 * PNG-only field and a team holding one PNG. "Show everyone's" moves the
 * switch; the field's own upload is offered beside it.
 */
export const NoneOfMine: Story = {
  name: 'None of mine yet',
  args: { pipeCode: 'one_image', files: 'team', initialScope: 'mine', narrowTo: ['image/png'] },
  play: async ({ canvasElement }) => {
    const dialog = within(await openTeamFiles(canvasElement, 'Picture'));
    await expect(
      await dialog.findByRole('button', { name: S.filePickerShowEveryone }),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: S.filePickerUpload })).toBeVisible();
  },
};

/** **A team with no file of the field's formats**, and the field's own upload offered instead. */
export const TeamHasNone: Story = {
  name: 'The team has none',
  args: { pipeCode: 'one_document', files: 'none', narrowTo: ['application/pdf'] },
  play: async ({ canvasElement }) => {
    const dialog = within(await openTeamFiles(canvasElement, 'Attachment'));
    await expect(
      await dialog.findByText(S.filePickerNoneTeam(['PDF']), { ignore: '[role="status"]' }),
    ).toBeVisible();
    await expect(dialog.getByRole('button', { name: S.filePickerUpload })).toBeVisible();
  },
};

/** **A search that matches nothing**, with the way back. */
export const NoMatch: Story = {
  name: 'No files match',
  args: { pipeCode: 'one_document', files: 'team' },
  play: async ({ canvasElement }) => {
    const dialog = within(await openTeamFiles(canvasElement, 'Attachment'));
    await dialog.findByRole('radio', { name: /INV-2291\.pdf/ });
    await userEvent.type(dialog.getByLabelText(S.filePickerSearch), 'zzz');
    await expect(
      await dialog.findByRole('button', { name: S.filePickerClearSearch }),
    ).toBeVisible();
  },
};

/** **The list could not be read.** */
export const FilesFailed: Story = {
  name: 'The team’s files could not be read',
  args: { pipeCode: 'one_document', files: 'failure' },
  play: async ({ canvasElement }) => {
    const dialog = within(await openTeamFiles(canvasElement, 'Attachment'));
    await expect(await dialog.findByRole('button', { name: S.tryAgain })).toBeVisible();
  },
};

/** **The first page is on its way**: dim rows, and the wait announced. */
export const FilesLoading: Story = {
  name: 'The team’s files loading',
  args: { pipeCode: 'one_document', files: 'waiting' },
  play: async ({ canvasElement }) => {
    const dialog = await openTeamFiles(canvasElement, 'Attachment');
    await expect(dialog.querySelector('[data-dim-rows]')).not.toBeNull();
    await expect(within(dialog).getByRole('status')).toHaveTextContent(S.filePickerLoading);
  },
};

/**
 * **On a phone, a bottom sheet.** Below 1280px the sheet spans the width and
 * rises from the bottom edge, with a handle to swipe it down by.
 */
export const SheetOnAPhone: Story = {
  name: 'The team’s files, phone',
  ...pinnedTo('phone'),
  args: { pipeCode: 'one_document', files: 'team' },
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    const dialog = await openTeamFiles(canvasElement, 'Attachment');
    const box = dialog.getBoundingClientRect();
    await expect(Math.round(box.left)).toBe(0);
    await expect(Math.round(box.width)).toBe(window.innerWidth);
    await expect(Math.round(box.bottom)).toBe(window.innerHeight);
  },
};

/** **From 1280px, a dialog** in the middle of the page, at most 560px wide. */
export const DialogOnADesktop: Story = {
  name: 'The team’s files, desktop',
  ...pinnedTo('desktop'),
  args: { pipeCode: 'one_document', files: 'team' },
  play: async ({ canvasElement }) => {
    await atWidth('desktop');
    const dialog = await openTeamFiles(canvasElement, 'Attachment');
    const box = dialog.getBoundingClientRect();
    await expect(box.width).toBeLessThanOrEqual(560);
    await expect(Math.abs(box.left - (window.innerWidth - box.right))).toBeLessThan(2);
    await expect(box.bottom).toBeLessThan(window.innerHeight);
  },
};

/**
 * **A form with examples.** "Fill with an example" sits above the fields;
 * without an example source it is not there.
 */
export const FormWithExamples: Story = {
  name: 'A form with examples',
  args: {
    contracts: STRUCTURED_CONTRACTS,
    inputForm: STRUCTURED_INPUT_FORM,
    domain: 'structured',
    pipeCode: 'flat_object',
    examples: 'two',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { name: S.fillWithExample })).toHaveLength(2);
  },
};

/**
 * **The examples, open**, each row with its menu to rename or delete it. Left
 * open so the accessibility check reads the sheet.
 */
export const ExamplesOpen: Story = {
  name: 'The examples, open',
  args: { ...FormWithExamples.args, examples: 'two' },
  play: async ({ canvasElement }) => {
    const dialog = within(await openExamples(canvasElement));
    await expect(await dialog.findByRole('button', { name: 'Paris office' })).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: S.exampleActions('Paris office') }),
    ).toBeVisible();
  },
};

/**
 * **Replacing what was entered.** On a form the person has typed in, choosing
 * an example asks first, and Cancel leaves the form as it was. Left open on the
 * question.
 */
export const ReplaceWhatYouEntered: Story = {
  name: 'Replace what you entered?',
  args: { ...FormWithExamples.args, examples: 'two' },
  play: async ({ canvasElement }) => {
    await userEvent.type(pane(canvasElement).getByLabelText('Street'), '9 quai Voltaire');
    const dialog = within(await openExamples(canvasElement));
    await userEvent.click(await dialog.findByRole('button', { name: 'Paris office' }));
    const question = await within(canvasElement.ownerDocument.body).findByRole('alertdialog', {
      name: S.replaceEnteredTitle,
    });
    await expect(
      within(question).getByRole('button', { name: S.replaceEnteredConfirm }),
    ).toBeVisible();
  },
};

/** **No examples yet**, and how to make one. */
export const NoExamples: Story = {
  name: 'No examples yet',
  args: { ...FormWithExamples.args, examples: 'none' },
  play: async ({ canvasElement }) => {
    const dialog = within(await openExamples(canvasElement));
    await expect(
      await dialog.findByText(S.examplesNone, { ignore: '[role="status"]' }),
    ).toBeVisible();
  },
};

/** **The examples could not be read.** */
export const ExamplesFailed: Story = {
  name: 'The examples could not be read',
  args: { ...FormWithExamples.args, examples: 'failure' },
  play: async ({ canvasElement }) => {
    const dialog = within(await openExamples(canvasElement));
    await expect(await dialog.findByRole('button', { name: S.tryAgain })).toBeVisible();
  },
};
