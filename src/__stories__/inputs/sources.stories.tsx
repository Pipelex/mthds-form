import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FileImage } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { FormExample, InputForm, PipeIOContracts, RunField } from '../../core';
import {
  getPipeInputForm,
  getPipeIOContract,
  narrowFileFormats,
  runValuesFromInputs,
} from '../../core';
import {
  DEFAULT_FIELD_STRINGS as S,
  humanizeFieldName,
  MethodForm,
  useMethodForm,
} from '../../react';
import { CONTRACTS, INPUT_FORM } from '../_generated/files';
import {
  CONTRACTS as STRUCTURED_CONTRACTS,
  INPUT_FORM as STRUCTURED_INPUT_FORM,
} from '../_generated/structured';
import {
  exampleSourceOf,
  fileSourceOf,
  type ExamplesAnswer,
  type FilesAnswer,
  type TeamFile,
} from '../host-sources';
import { atWidth, pinnedTo } from '../touch-target';

/**
 * The two host seams beside the upload: a team's files, which every empty file
 * field offers under "Choose from your team's files", and a method's examples,
 * which the form offers as "Fill with an example". Each story names the one
 * state it shows.
 *
 * The descriptors and contracts are the corpus's, as everywhere. The rows the
 * sources answer with are not a fixture of the standard: they are a host's own
 * records, which no projection of a method produces, so they are written once,
 * in `../host-sources.ts`, in the shapes the seams declare.
 */

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
  /**
   * How the team's files' rows read: the kernel's own type label and glyph,
   * or the host's type word and its 40px tile.
   */
  rows?: 'kernel' | 'host';
  /** The example source's answer; no example source when absent. */
  examples?: ExamplesAnswer;
  /** Whether the example source opens an example, in the host's own panel under the form. */
  opens?: boolean;
  /** Whether each example's row says what it holds, or that it no longer fits. */
  describes?: boolean;
}

/**
 * A host's own glyph for a row, as a host's list of files draws it: a 40px
 * tile holding the format's short name for a document and a picture outline
 * for a picture. Chosen by the host's own key on the row (`format`), which the
 * kernel never reads and hands back to `renderGlyph` with the row.
 */
function HostGlyph({ format }: { format: TeamFile['format'] }) {
  return (
    <span
      data-host-glyph
      className="inline-flex size-10 items-center justify-center rounded-md bg-muted text-foreground"
    >
      {format === 'image' ? (
        <FileImage className="size-5" />
      ) : (
        <span className="text-[12px] font-semibold">PDF</span>
      )}
    </span>
  );
}

/** What a host keeps of a row's own words: each piece of text a value holds, in order. */
function heldWords(value: unknown): string[] {
  if (typeof value === 'string') return value === '' ? [] : [value];
  if (Array.isArray(value)) return value.flatMap(heldWords);
  if (value && typeof value === 'object') return Object.values(value).flatMap(heldWords);
  return [];
}

/**
 * A host's line under an example's name, in the host's own words and look:
 * what the example holds, read back against the form's fields, or, for an
 * example saved for an earlier form, the inputs it now needs, beside the
 * host's own warning dot, a colour the kernel's theme has no role for. The dot
 * is decorative; the words say it.
 */
function ExampleLine({ example, fields }: { example: FormExample; fields: readonly RunField[] }) {
  const missing = fields.filter((field) => field.required && !(field.name in example.inputs));
  if (missing.length > 0) {
    const labels = missing.map((field) => field.title ?? humanizeFieldName(field.name));
    return (
      <span data-misfit className="flex items-start gap-1.5">
        <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-500" />
        <span>Needs new inputs: {labels.join(', ')}</span>
      </span>
    );
  }
  return <>{heldWords(runValuesFromInputs(example.inputs, [...fields])).join(', ')}</>;
}

/** The example the host has open, and the fill the form handed it. */
interface OpenedExample {
  example: FormExample;
  fill: () => void;
}

function SourcesStory({
  contracts,
  inputForm,
  domain,
  pipeCode,
  files,
  initialScope = 'everyone',
  narrowTo,
  rows = 'kernel',
  examples,
  opens = false,
  describes = false,
}: SourcesStoryProps) {
  const [opened, setOpened] = useState<OpenedExample | null>(null);
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
    fileSource: files
      ? {
          ...fileSourceOf(files, initialScope, rows),
          renderGlyph:
            rows === 'host' ? (file: TeamFile) => <HostGlyph format={file.format} /> : undefined,
        }
      : undefined,
    exampleSource: examples
      ? {
          ...exampleSourceOf(examples),
          open: opens ? (example, fill) => setOpened({ example, fill }) : undefined,
          renderDetail: describes
            ? (example, fields) => <ExampleLine example={example} fields={fields} />
            : undefined,
        }
      : undefined,
  });
  return (
    <div data-sources-demo style={{ display: 'grid', gap: 18, maxWidth: 560 }}>
      <MethodForm form={form} presentation="app" />
      {opened && (
        // The host's own surface for an opened example, drawn under the form
        // rather than over it, since what it shows is the host's to decide.
        <div
          data-opened-example
          className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4"
        >
          <p className="min-w-0 flex-1 text-[14px] text-foreground">
            Opened: {opened.example.name}
          </p>
          <button
            type="button"
            onClick={() => {
              opened.fill();
              setOpened(null);
            }}
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-[14px] font-medium text-primary-foreground"
          >
            Fill the form
          </button>
          <button
            type="button"
            onClick={() => setOpened(null)}
            className="inline-flex min-h-11 items-center rounded-md border border-border px-4 text-[14px] text-foreground"
          >
            Close
          </button>
        </div>
      )}
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
 * chosen row has the selected fill and a check, and the button names the file.
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
 * **The team's files in the host's words and glyphs.** The host says each
 * row's type in its own words (`typeLabel`: "PDF document", "Picture") where
 * the kernel says the format's label, and draws each row's glyph
 * (`renderGlyph`) as its own list of files does, a 40px tile, where the kernel
 * draws a 24px outline. The glyph is hidden from assistive technology, so a
 * row is still named by its file. Left open so the accessibility check reads
 * the sheet.
 */
export const TeamFilesInTheHostsLook: Story = {
  name: 'The team’s files, in the host’s words and glyphs',
  args: { pipeCode: 'one_document', files: 'team', narrowTo: ['application/pdf'], rows: 'host' },
  play: async ({ canvasElement }) => {
    const dialog = within(await openTeamFiles(canvasElement, 'Attachment'));
    const row = await dialog.findByRole('radio', { name: /^INV-2291\.pdf/ });
    await expect(row).toHaveTextContent('PDF document · 340 KB');
    const glyph = row.querySelector<HTMLElement>('[data-host-glyph]');
    await expect(glyph).not.toBeNull();
    await expect(Math.round(glyph?.getBoundingClientRect().width ?? 0)).toBe(40);
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
 * **Filling an untouched form.** Choosing an example fills every value at once,
 * closes the list and starts nothing.
 */
export const FillAnUntouchedForm: Story = {
  name: 'Fill an untouched form',
  args: { ...FormWithExamples.args, examples: 'two' },
  play: async ({ canvasElement }) => {
    const dialog = within(await openExamples(canvasElement));
    await userEvent.click(await dialog.findByRole('button', { name: 'Berlin office' }));
    await waitFor(() =>
      expect(pane(canvasElement).getByLabelText('Street')).toHaveValue('Unter den Linden 5'),
    );
    await expect(pane(canvasElement).getByLabelText('City')).toHaveValue('Berlin');
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

/**
 * **The examples, each described, with Open.** The host draws a line under
 * each name (`renderDetail`): what the example holds, or, for one saved when
 * the method took a document, "Needs new inputs: Address" beside the host's
 * own warning dot. The line is inside the row's button, so it is read with the
 * name. The row menu offers Open first, then Rename and Delete. Left open on
 * the menu so the accessibility check reads it.
 */
export const ExamplesDescribed: Story = {
  name: 'The examples, each described, with Open',
  args: { ...FormWithExamples.args, examples: 'varied', opens: true, describes: true },
  play: async ({ canvasElement }) => {
    const dialog = within(await openExamples(canvasElement));
    await expect(
      await dialog.findByRole('button', { name: 'Paris office 1 rue de la Paix, Paris, France' }),
    ).toBeVisible();
    const misfit = dialog.getByRole('button', {
      name: /^Scanned invoice\s+Needs new inputs: Address$/,
    });
    await expect(misfit.querySelector('[data-misfit]')).toBeVisible();
    await userEvent.click(dialog.getByRole('button', { name: S.exampleActions('Paris office') }));
    const menu = await within(canvasElement.ownerDocument.body).findByRole('menu');
    await expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual([S.openExample, S.renameExample, S.deleteExample]);
  },
};

/**
 * **Opening an example.** Open closes the list and gives focus back to "Fill
 * with an example", then hands the example to the host, whose own panel shows
 * it under the form. The panel's "Fill the form" calls the fill the form
 * handed over, which fills the form as choosing the row does.
 */
export const OpenAnExample: Story = {
  name: 'Open an example',
  args: { ...ExamplesDescribed.args },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = within(await openExamples(canvasElement));
    await userEvent.click(
      await dialog.findByRole('button', { name: S.exampleActions('Berlin office') }),
    );
    await userEvent.click(await body.findByRole('menuitem', { name: S.openExample }));
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
    const demo = pane(canvasElement);
    await expect(await demo.findByText('Opened: Berlin office')).toBeVisible();
    await expect(demo.getByRole('button', { name: S.fillWithExample })).toHaveFocus();
    await userEvent.click(demo.getByRole('button', { name: 'Fill the form' }));
    await waitFor(() => expect(demo.getByLabelText('Street')).toHaveValue('Unter den Linden 5'));
    await expect(demo.getByLabelText('City')).toHaveValue('Berlin');
  },
};

/**
 * The described list holds its widths: the warehouse's long line wraps inside
 * its row, an access code no space breaks included, and neither the line, the
 * row nor the page scrolls sideways.
 */
async function expectDescribedRowsFit(canvasElement: HTMLElement) {
  const dialog = await openExamples(canvasElement);
  const row = await within(dialog).findByRole('button', { name: /^Lyon warehouse\s/ });
  const line = row.querySelector<HTMLElement>('[data-slot="example-row-detail"]');
  if (!line) throw new Error('The warehouse row has no line under its name');
  await expect(line.scrollWidth).toBeLessThanOrEqual(line.clientWidth);
  await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
  await expect(line.getBoundingClientRect().right).toBeLessThanOrEqual(
    row.getBoundingClientRect().right,
  );
  // Wrapped, rather than cut: at least two lines of 13px type.
  await expect(line.getBoundingClientRect().height).toBeGreaterThanOrEqual(26);
  await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
  await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(
    window.innerWidth,
  );
}

/** **Described rows on a phone**: a long line wraps inside the bottom sheet's rows. */
export const ExamplesDescribedOnAPhone: Story = {
  name: 'The examples, described, phone',
  ...pinnedTo('phone'),
  args: { ...ExamplesDescribed.args },
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    await expectDescribedRowsFit(canvasElement);
  },
};

/** **Described rows on a desktop**: the same, in the dialog at most 560px wide. */
export const ExamplesDescribedOnADesktop: Story = {
  name: 'The examples, described, desktop',
  ...pinnedTo('desktop'),
  args: { ...ExamplesDescribed.args },
  play: async ({ canvasElement }) => {
    await atWidth('desktop');
    await expectDescribedRowsFit(canvasElement);
  },
};
