import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { getPipeInputForm, getPipeIOContract } from '../../core';
import { DEFAULT_FIELD_STRINGS as S, MethodForm, useMethodForm } from '../../react';
import { CONTRACTS, INPUT_FORM } from '../_generated/files';
import { fileSourceOf } from '../host-sources';

/**
 * The team's files' sheet in a chat host's frame that grew with its content.
 *
 * A chat host sets a view's frame to the view's whole height, so the frame's
 * viewport is far taller than the screen and the conversation shows a slice
 * of it. The sheet, which a page lays out against the viewport, sits in that
 * slice instead: laid out against the frame's viewport, it was as tall as the
 * whole view, its head above the screen and its Use button below it.
 *
 * Run as a test, the story's own frame is made that tall frame by a browser
 * command (`showFrameSlice` in `vitest.config.ts`), and the sheet is measured
 * against the slice the page around it shows. In the Storybook UI, where
 * nothing reshapes the frame, it opens the sheet over the story as
 * `Inputs/Team Files and Examples` does.
 */

function ChatFrameStory() {
  const contract = getPipeIOContract(CONTRACTS, 'files', 'one_document');
  const descriptor = getPipeInputForm(INPUT_FORM, 'files', 'one_document');
  if (!contract || !descriptor) throw new Error('No fixture entry for files.one_document.');
  const form = useMethodForm({
    descriptor,
    contract,
    uploadFile: async (file) => URL.createObjectURL(file),
    fileSource: fileSourceOf('team', 'everyone', 'kernel'),
  });
  return (
    <div data-sources-demo style={{ maxWidth: 560 }}>
      {/* What a chat host's view holds above its form, the method's graph:
          enough to put the form a screen down the frame. */}
      <div
        data-graph-stand-in
        className="flex items-center justify-center rounded-lg border border-dashed border-border text-[13px] text-muted-foreground"
        style={{ height: 1000, marginBottom: 16 }}
      >
        The view’s graph
      </div>
      <MethodForm form={form} presentation="app" />
    </div>
  );
}

const meta = {
  title: 'Inputs/Team Files in a Chat Frame',
  component: ChatFrameStory,
  // The panes one above the other, each a phone's width, as in a chat column.
  parameters: { themePairStacked: true },
} satisfies Meta<typeof ChatFrameStory>;

export default meta;
type Story = StoryObj<typeof meta>;

interface FrameSlice {
  frameHeight: number;
  visible: { top: number; bottom: number };
}

/** The command reshaping the story's frame, when the stories run as tests. */
type Slicer = (around: number | null) => Promise<FrameSlice | null>;

async function frameSlicer(): Promise<Slicer | null> {
  try {
    const { commands } = await import('vitest/browser');
    return (around) => (commands as unknown as { showFrameSlice: Slicer }).showFrameSlice(around);
  } catch {
    return null;
  }
}

/**
 * **The sheet sits in the slice of the frame on screen.** The frame is two and
 * a half screens tall and the screen shows the slice around the field: the sheet's head, its
 * list and its Use button are all inside that slice, the sheet is no taller
 * than the slice, and the frame itself did not grow when it opened.
 */
export const InTheSliceOnScreen: Story = {
  name: 'The sheet, in the slice of a tall frame on screen',
  play: async ({ canvasElement }) => {
    const slicer = await frameSlicer();
    const page = within(canvasElement.ownerDocument.body);
    // The light pane's field: the sheet opens over the whole frame.
    const [entry] = page.getAllByRole('button', { name: S.chooseFromSourceAria('Attachment') });
    if (!entry) throw new Error('No team files entry rendered');
    const entryBox = entry.getBoundingClientRect();
    const slice = slicer ? await slicer(entryBox.top + entryBox.height / 2) : null;
    try {
      if (slice) {
        await waitFor(() => expect(window.innerHeight).toBe(slice.frameHeight));
        // The field the person taps is in the slice on screen.
        const box = entry.getBoundingClientRect();
        expect(box.top).toBeGreaterThan(slice.visible.top);
        expect(box.bottom).toBeLessThan(slice.visible.bottom);
      }
      await userEvent.click(entry);
      const sheet = await page.findByRole('dialog', { name: S.filePickerTitle });
      await within(sheet).findByRole('radio', { name: /INV-2291\.pdf/ });
      if (!slice) return;

      const { top, bottom } = slice.visible;
      await waitFor(() => {
        const box = sheet.getBoundingClientRect();
        expect(box.top).toBeGreaterThanOrEqual(top);
        expect(box.bottom).toBeLessThanOrEqual(bottom + 1);
      });
      const box = sheet.getBoundingClientRect();
      // A bottom sheet: down to the slice's foot, 1.5rem short of its head.
      expect(Math.round(box.bottom)).toBe(bottom);
      expect(Math.round(box.height)).toBe(bottom - top - 24);
      expect(box.height).toBeLessThan(slice.frameHeight / 2);
      const use = within(sheet).getByRole('button', { name: S.filePickerUse(0, undefined) });
      expect(use.getBoundingClientRect().bottom).toBeLessThanOrEqual(bottom);
      expect(window.innerHeight).toBe(slice.frameHeight);
    } finally {
      if (slicer) await slicer(null);
    }
  },
};
