import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import type { InputForm, PipeIOContracts } from '../../core';
import { getPipeInputForm, getPipeIOContract } from '../../core';
import {
  DEFAULT_FIELD_STRINGS as S,
  FR_FIELD_STRINGS,
  MethodForm,
  useMethodForm,
} from '../../react';
import { CONTRACTS, INPUT_FORM } from '../_generated/files';
import {
  cameraInputs,
  givePhoto,
  samplePagePhoto,
  takePages,
  undecodablePhoto,
  withDecoderHeld,
} from '../photo-samples';
import { asOnATouchScreen, touchScreenRules } from '../touch-target';

/**
 * The file control's camera: on a touch screen, an empty document or image
 * input offers "Take photo" under its dropzone, and a document is
 * photographed page by page into one PDF the form stores like any dropped
 * file (docs/camera.md).
 *
 * The page strip, the chip and the refusals are drawn whatever the pointer,
 * so their stories take photos straight through the camera's input, as a
 * phone's shutter does. Only "Take photo" itself is a touch screen's, decided
 * by `(hover: none)`; its story reads that rule from the style sheet and
 * applies it, since no story can make the browser a touch screen without
 * reaching the stories beside it (`touchScreenRules`). To see it as a phone
 * does, turn on a phone's device emulation in the browser's developer tools.
 *
 * The photos are drawn on a canvas and really read: decoded, bounded and
 * encoded as JPEGs, and the pages bound into a PDF by `jspdf`.
 */

interface CameraStoryProps {
  contracts: PipeIOContracts;
  inputForm: InputForm;
  pipeCode: string;
  locale?: string;
}

function CameraStory({ contracts, inputForm, pipeCode, locale }: CameraStoryProps) {
  const contract = getPipeIOContract(contracts, 'files', pipeCode);
  const descriptor = getPipeInputForm(inputForm, 'files', pipeCode);
  if (!contract || !descriptor) throw new Error(`No fixture entry for files.${pipeCode}.`);
  const form = useMethodForm({
    descriptor,
    contract,
    // The object URL is never revoked: a story's page is short-lived.
    uploadFile: async (file) => ({ url: URL.createObjectURL(file), filename: file.name }),
  });
  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 560 }}>
      <MethodForm form={form} presentation="app" locale={locale} />
      <output className="text-[11px] text-muted-foreground" data-testid="camera-state">
        {JSON.stringify({ uploading: form.uploading, ready: form.ready })}
      </output>
    </div>
  );
}

/**
 * How long a story waits for the pages' file to be stored: the first PDF
 * waits for `jspdf` to load, which a cold story page takes a while over.
 */
const STORED = { timeout: 10_000 };

/** What each theme pane's form says to its host: whether it is uploading, and ready. */
const formStates = (root: HTMLElement) =>
  within(root)
    .getAllByTestId('camera-state')
    .map(
      (output) => JSON.parse(output.textContent ?? '{}') as { uploading: boolean; ready: boolean },
    );

const meta = {
  title: 'Inputs/Camera',
  component: CameraStory,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, pipeCode: 'one_document' },
} satisfies Meta<typeof CameraStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The camera's own controls open a file chooser through its hidden input; in
 * a story the photo is handed to that input instead, so the chooser is kept
 * shut rather than opened over the page.
 */
function keepChooserShut(root: ParentNode): void {
  for (const input of cameraInputs(root)) input.click = () => {};
}

/** Every "Take photo" button on the canvas, both theme panes. */
const takePhotoButtons = (root: HTMLElement) =>
  within(root).queryAllByRole('button', { name: S.takePhotoAria('Attachment') });

/**
 * **An empty input on a touch screen**: the dropzone as on a computer (a tap
 * opens the operating system's picker, which offers files and the photo
 * library) and under it a full-width "Take photo", 48 pixels tall, which opens
 * the back camera.
 */
export const EmptyOnATouchScreen: Story = {
  play: async ({ canvasElement }) => {
    const buttons = [...canvasElement.querySelectorAll<HTMLElement>('[data-take-photo]')];
    await expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      const rules = touchScreenRules(button);
      await expect(rules.map((rule) => rule.display)).toEqual(['flex']);
      await asOnATouchScreen(button, async () => {
        await expect(button).toBeVisible();
        await expect(button).toHaveAccessibleName(S.takePhotoAria('Attachment'));
        const box = button.getBoundingClientRect();
        await expect(box.height).toBeGreaterThanOrEqual(48);
        const zone = button.parentElement?.querySelector('[role="presentation"]');
        await expect(box.width).toBe(zone?.getBoundingClientRect().width);
      });
    }
    await expect(within(canvasElement).getAllByText(S.dropOrBrowse)).toHaveLength(2);
  },
};

/**
 * **The same input on a computer**: nothing changes. A computer's browser
 * ignores `capture`, so "Take photo" would open a mere picture picker; it is
 * in the page but not drawn.
 */
export const EmptyOnADesktop: Story = {
  play: async ({ canvasElement }) => {
    await expect(window.matchMedia('(hover: none)').matches).toBe(false);
    const buttons = takePhotoButtons(canvasElement);
    await expect(buttons).toHaveLength(0);
    const hidden = [...canvasElement.querySelectorAll('[data-take-photo]')];
    await expect(hidden).toHaveLength(2);
    for (const button of hidden) await expect(button).not.toBeVisible();
    await expect(within(canvasElement).getAllByText(S.dropOrBrowse)).toHaveLength(2);
  },
};

/**
 * **Three pages, stored**: numbered thumbnails in the order taken, "Add page"
 * after them, and under them the chip naming the PDF the form stored. Each
 * tile is 64 by 88 pixels, 8 apart.
 */
export const ThreePages: Story = {
  play: async ({ canvasElement }) => {
    await takePages(canvasElement, 3);
    const canvas = within(canvasElement);
    await waitFor(
      () => expect(canvas.getAllByText(S.photoPagesChip('Attachment', 3))).toHaveLength(2),
      STORED,
    );
    const tiles = [1, 2, 3].map(
      (page) => canvas.getAllByRole('button', { name: S.photoPage(page) })[0],
    );
    for (const tile of tiles) {
      const box = tile?.getBoundingClientRect();
      await expect(box?.width).toBe(64);
      await expect(box?.height).toBe(88);
    }
    const gap =
      (tiles[1]?.getBoundingClientRect().left ?? 0) -
      (tiles[0]?.getBoundingClientRect().right ?? 0);
    await expect(gap).toBe(8);
    await expect(canvas.getAllByRole('button', { name: S.addPage })).toHaveLength(2);
    await waitFor(
      () => expect(formStates(canvasElement).every((state) => state.ready)).toBe(true),
      STORED,
    );
  },
};

/**
 * **One page, stored**: the chip in its singular form, with the control that
 * empties the input, pages and all.
 */
export const OnePageStored: Story = {
  play: async ({ canvasElement }) => {
    await takePages(canvasElement, 1);
    const canvas = within(canvasElement);
    await waitFor(
      () => expect(canvas.getAllByText(S.photoPagesChip('Attachment', 1))).toHaveLength(2),
      STORED,
    );
    await expect(canvas.getAllByRole('button', { name: S.removeFileAria })).toHaveLength(2);
  },
};

/**
 * **A page being read**: a tile with a spinner after the pages, and "Add
 * page" waits for it. The form is not ready meanwhile: a file being made
 * counts as an upload in flight.
 */
export const APageBeingRead: Story = {
  play: async ({ canvasElement }) => {
    await takePages(canvasElement, 2);
    const canvas = within(canvasElement);
    await waitFor(
      () => expect(canvas.getAllByText(S.photoPagesChip('Attachment', 2))).toHaveLength(2),
      STORED,
    );
    await withDecoderHeld(async () => {
      const photo = await samplePagePhoto(3);
      for (const input of cameraInputs(canvasElement)) givePhoto(input, photo);
      await waitFor(() => expect(canvas.getAllByText(S.readingPhoto)).toHaveLength(2));
    });
    for (const button of canvas.getAllByRole('button', { name: S.addPage })) {
      await expect(button).toBeDisabled();
    }
    await expect(formStates(canvasElement).every((state) => state.uploading && !state.ready)).toBe(
      true,
    );
  },
};

/**
 * **A retake being read**: the page keeps its place under the spinner, and
 * only it waits; the pages around it stay live.
 */
export const ARetakeBeingRead: Story = {
  play: async ({ canvasElement }) => {
    keepChooserShut(canvasElement);
    await takePages(canvasElement, 3);
    const canvas = within(canvasElement);
    const [pane] = canvasElement.querySelectorAll<HTMLElement>('[data-photo-pages]');
    if (!pane) throw new Error('No page strip');
    const [input] = cameraInputs(canvasElement);
    if (!input) throw new Error('No camera input');
    await userEvent.click(within(pane).getByRole('button', { name: S.photoPage(2) }));
    await userEvent.click(await screen.findByRole('menuitem', { name: S.retakePhoto }));
    await withDecoderHeld(async () => {
      givePhoto(input, await samplePagePhoto(4));
      await waitFor(() => expect(within(pane).getByText(S.readingPhoto)).toBeInTheDocument());
    });
    await expect(within(pane).getByRole('button', { name: S.photoPage(2) })).toBeDisabled();
    await expect(within(pane).getByRole('button', { name: S.photoPage(1) })).toBeEnabled();
    await expect(within(pane).getByRole('button', { name: S.photoPage(3) })).toBeEnabled();
    await expect(canvas.getAllByRole('button', { name: S.photoPage(2) })).toHaveLength(2);
  },
};

/**
 * **An image input's photo**: one photo, not numbered, with no "Add page";
 * the form stores the photo's own JPEG, and Retake replaces it.
 */
export const AnImageInputsPhoto: Story = {
  args: { pipeCode: 'one_image' },
  play: async ({ canvasElement }) => {
    await takePages(canvasElement, 1);
    const canvas = within(canvasElement);
    await waitFor(
      () => expect(canvas.getAllByText(S.photoChip('Picture'))).toHaveLength(2),
      STORED,
    );
    await expect(canvas.getAllByRole('button', { name: S.photoImage })).toHaveLength(2);
    await expect(canvas.queryByRole('button', { name: S.addPage })).not.toBeInTheDocument();
  },
};

/**
 * **A photo that cannot be read**: refused at once in the alert slot, and the
 * page already held, and the file it made, stand. Nothing is blocked: the
 * form stays ready.
 */
export const ARefusedPhoto: Story = {
  play: async ({ canvasElement }) => {
    await takePages(canvasElement, 1);
    const canvas = within(canvasElement);
    await waitFor(
      () => expect(canvas.getAllByText(S.photoPagesChip('Attachment', 1))).toHaveLength(2),
      STORED,
    );
    for (const input of cameraInputs(canvasElement)) givePhoto(input, undecodablePhoto());
    await waitFor(() => expect(canvas.getAllByRole('alert')).toHaveLength(2));
    for (const alert of canvas.getAllByRole('alert')) {
      await expect(alert).toHaveTextContent(S.photoUndecodable);
    }
    await expect(canvas.getAllByRole('button', { name: S.photoPage(1) })).toHaveLength(2);
    await waitFor(
      () => expect(formStates(canvasElement).every((state) => state.ready)).toBe(true),
      STORED,
    );
  },
};

/**
 * **A row of a list of documents, with pages**: each row is a file control of
 * its own, so each empty row offers the camera and makes one PDF; the list's
 * drop area for several files has none.
 */
export const AListRowWithPages: Story = {
  args: { pipeCode: 'many_files' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [addDocument] = canvas.getAllByRole('button', { name: S.addItem });
    if (!addDocument) throw new Error('No Add item');
    await userEvent.click(addDocument);
    const [row] = canvasElement.querySelectorAll<HTMLElement>('[data-list-row]');
    if (!row) throw new Error('No row');
    const [input] = cameraInputs(row);
    if (!input) throw new Error('No camera input on the row');
    for (const page of [1, 2]) {
      givePhoto(input, await samplePagePhoto(page));
      await waitFor(() =>
        expect(row.querySelectorAll('[data-photo-pages] li img')).toHaveLength(page),
      );
    }
    // A row is named by its number alone, so its file is called a photo.
    await waitFor(
      () => expect(within(row).getByText(S.photoPagesChip(S.photoImage, 2))).toBeVisible(),
      STORED,
    );
  },
};

/** **In French**: the strip, its menu and the chip in the runner's language. */
export const InFrench: Story = {
  args: { locale: 'fr' },
  play: async ({ canvasElement }) => {
    keepChooserShut(canvasElement);
    await takePages(canvasElement, 2);
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { name: FR_FIELD_STRINGS.addPage })).toHaveLength(2);
    const [page] = canvas.getAllByRole('button', { name: FR_FIELD_STRINGS.photoPage(1) });
    if (!page) throw new Error('No page');
    await userEvent.click(page);
    await expect(
      await screen.findByRole('menuitem', { name: FR_FIELD_STRINGS.retakePhoto }),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
