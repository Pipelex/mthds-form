import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { SaveFile, SaveFiles } from '../../core';
import {
  DEFAULT_FIELD_STRINGS,
  ResultEnvProvider,
  StuffViewer,
  type DownloadDisplay,
} from '../../react';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/results';
import { resultFieldFor } from '../result-view';
import { REPORT } from './media-payloads';

/**
 * Which download controls a result view draws, and what a host receives when
 * the reader uses one.
 *
 * Two controls, set independently on `ResultEnvProvider`: the header's
 * **Download**, which saves the whole result, and a button beside each file,
 * which saves that one file and can be narrowed to the kinds that should carry
 * it. The setting reaches every file however deep it sits, which is why these
 * stories render a report whose images are inside a table's rows: open a row
 * and its picture carries the button too, or does not, as the setting says.
 *
 * Every story here supplies a recording `saveFiles`, the way a host whose view
 * runs in a sandboxed frame supplies one to reach its own download bridge, so a
 * click lists the planned files underneath rather than downloading anything.
 * Without it the same plan would be saved by the browser tab.
 *
 * The descriptor is the corpus's own, `results.nested_media_result`; the
 * payload is served files, for the reason `media-payloads.ts` gives.
 */

function Downloads({ downloads }: { downloads?: DownloadDisplay }) {
  const field = React.useMemo(
    () => resultFieldFor(CONTRACTS, OUTPUT_FORM, 'results', 'nested_media_result'),
    [],
  );
  const [received, setReceived] = React.useState<SaveFile[][]>([]);
  const saveFiles = React.useCallback<SaveFiles>(async (files) => {
    setReceived((plans) => [...plans, [...files]]);
    return { failed: [] };
  }, []);
  return (
    <div data-downloads-demo style={{ maxWidth: 720 }}>
      <ResultEnvProvider saveFiles={saveFiles} {...(downloads ? { downloads } : {})}>
        <StuffViewer field={field} value={REPORT} name="retrofit_review" />
      </ResultEnvProvider>
      <div
        data-host-log
        style={{
          marginTop: 16,
          font: '12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
          color: 'var(--muted-foreground)',
        }}
      >
        {received.length === 0
          ? 'The host has received nothing yet.'
          : received.map((plan, index) => (
              <div key={index}>The host received {plan.map((file) => file.name).join(', ')}</div>
            ))}
      </div>
    </div>
  );
}

const meta = { title: 'Outputs/Downloads', component: Downloads } satisfies Meta<typeof Downloads>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A file's button is named by the file it saves: "Download solar_system.pdf". */
const FILE_BUTTON = {
  // "Download PDF" shares the prefix and is not a file's own button.
  name: (name: string) =>
    name.startsWith(DEFAULT_FIELD_STRINGS.downloadFile('')) &&
    name !== DEFAULT_FIELD_STRINGS.downloadPdf,
};

/** The first theme pane: the pair renders every story twice. */
function pane(canvasElement: HTMLElement) {
  const demo = canvasElement.querySelector<HTMLElement>('[data-downloads-demo]');
  if (!demo) throw new Error('No downloads demo rendered');
  return within(demo);
}

const openFirstRow = async (canvasElement: HTMLElement) => {
  const canvas = pane(canvasElement);
  await userEvent.click(
    canvas.getByRole('button', { name: DEFAULT_FIELD_STRINGS.toggleRowDetails(1) }),
  );
};

/**
 * **Both, on every file** — what a host gets by stating nothing. The header
 * saves the whole report; the page, the source document and, once a row is
 * open, its figure each carry their own button.
 */
export const Both: Story = {
  name: 'Both controls (the default)',
  play: async ({ canvasElement }) => {
    const canvas = pane(canvasElement);
    await openFirstRow(canvasElement);
    await expect(canvas.getByRole('button', { name: DEFAULT_FIELD_STRINGS.download })).toBeTruthy();
    await expect(canvas.getAllByRole('button', FILE_BUTTON)).toHaveLength(3);

    // One file's button hands the host a plan of that one file.
    await userEvent.click(
      canvas.getByRole('button', { name: DEFAULT_FIELD_STRINGS.downloadFile('solar_system.pdf') }),
    );
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-host-log]')?.textContent).toContain(
        'The host received solar_system.pdf',
      ),
    );
  },
};

/** **The whole result only** — for an app that offers one download per result. */
export const WholeResultOnly: Story = {
  name: 'Whole result only',
  args: { downloads: { files: false } },
  play: async ({ canvasElement }) => {
    const canvas = pane(canvasElement);
    await openFirstRow(canvasElement);
    await expect(canvas.getByRole('button', { name: DEFAULT_FIELD_STRINGS.download })).toBeTruthy();
    await expect(canvas.queryAllByRole('button', FILE_BUTTON)).toHaveLength(0);
  },
};

/** **Each file only** — for an app whose readers take files out one at a time. */
export const EachFileOnly: Story = {
  name: 'Each file only',
  args: { downloads: { result: false } },
  play: async ({ canvasElement }) => {
    const canvas = pane(canvasElement);
    await openFirstRow(canvasElement);
    await expect(canvas.queryByRole('button', { name: DEFAULT_FIELD_STRINGS.download })).toBeNull();
    await expect(canvas.getAllByRole('button', FILE_BUTTON)).toHaveLength(3);
  },
};

/**
 * **Images only** — the per-file setting narrowed to one kind. The page and the
 * document carry nothing; the figure inside the open row does.
 */
export const ImagesOnly: Story = {
  name: 'Images only',
  args: { downloads: { result: false, files: ['image'] } },
  play: async ({ canvasElement }) => {
    const canvas = pane(canvasElement);
    await expect(canvas.queryAllByRole('button', FILE_BUTTON)).toHaveLength(0);
    await openFirstRow(canvasElement);
    await expect(canvas.getAllByRole('button', FILE_BUTTON)).toHaveLength(1);
  },
};

/** **Neither** — for a host that saves results its own way. Its save function still works. */
export const Neither: Story = {
  args: { downloads: { result: false, files: false } },
  play: async ({ canvasElement }) => {
    const canvas = pane(canvasElement);
    await openFirstRow(canvasElement);
    await expect(canvas.queryByRole('button', { name: DEFAULT_FIELD_STRINGS.download })).toBeNull();
    await expect(canvas.queryAllByRole('button', FILE_BUTTON)).toHaveLength(0);
  },
};

/** The document's own button, which every story above draws. */
const openNameDialog = async (canvasElement: HTMLElement) => {
  const canvas = pane(canvasElement);
  await userEvent.click(
    canvas.getByRole('button', { name: DEFAULT_FIELD_STRINGS.downloadFile('solar_system.pdf') }),
  );
  return canvas.getByRole('dialog', { name: DEFAULT_FIELD_STRINGS.fileNameTitle });
};

/**
 * **Asking for the name first** (`askFileName: true`) — every download opens
 * a dialog on the name the plan chose, without its extension and selected, so
 * typing replaces it; the extension stays as it was. Enter downloads under the
 * new name, Escape or the backdrop cancels. Off unless a host turns it on.
 */
export const AskFileName: Story = {
  name: 'Ask for the file name',
  args: { downloads: { askFileName: true } },
  play: async ({ canvasElement }) => {
    const dialog = within(await openNameDialog(canvasElement));
    const field = dialog.getByRole('textbox', { name: DEFAULT_FIELD_STRINGS.fileNameTitle });
    await expect(field).toHaveValue('solar_system');
    await expect(field).toHaveFocus();
    await expect(dialog.getByText('.pdf')).toBeVisible();
    await userEvent.keyboard('Système solaire');
    await userEvent.click(
      dialog.getByRole('button', { name: DEFAULT_FIELD_STRINGS.fileNameConfirm }),
    );
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-host-log]')?.textContent).toContain(
        'The host received Système solaire.pdf',
      ),
    );
    await expect(canvasElement.querySelector('[role="dialog"]')).toBeNull();
  },
};

/**
 * **The dialog, open** — left open so the accessibility check reads it in both
 * themes: a modal dialog named by its title, a field named the same and
 * described by its extension, and two buttons.
 */
export const AskFileNameOpen: Story = {
  name: 'Ask for the file name (dialog open)',
  args: { downloads: { askFileName: true } },
  play: async ({ canvasElement }) => {
    const dialog = await openNameDialog(canvasElement);
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    const field = within(dialog).getByRole<HTMLInputElement>('textbox');
    await expect(field).toHaveFocus();
    await expect([field.selectionStart, field.selectionEnd]).toEqual([0, field.value.length]);
  },
};
