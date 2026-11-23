import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DEFAULT_FIELD_STRINGS as S, type PdfWorkerConfig } from '../../react';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/files';
import { PDF_URL } from '../outputs/media-payloads';
import { samplePagePhoto } from '../photo-samples';

/**
 * What a file dropped into the form previews from, on every host.
 *
 * A chat host's view frame refuses `blob:` pictures and every `<object>`, which
 * is what the form used to preview with: a picture showed the broken-image
 * placeholder there, and a PDF an empty frame most of a screen tall. A dropped
 * picture now paints from a `data:` URL read from the file, and a dropped PDF
 * is drawn page by page with pdf.js from its own bytes when the host supplies
 * the worker, or is a compact card when it does not. The harness still stores
 * each file as a `blob:` link (`standInUpload`), as a story's stand-in for an
 * upload; the preview never paints from it.
 */

const meta = {
  title: 'Inputs/File previews',
  component: CaseForm,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'files', pipeCode: 'one_document' },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** pdf.js's worker and its data files, as this Storybook serves them (`Outputs/PDF pages`). */
const PDF_WORKER: PdfWorkerConfig = {
  workerSrc: '/pdfjs/build/pdf.worker.min.mjs',
  cMapUrl: '/pdfjs/cmaps/',
  standardFontDataUrl: '/pdfjs/standard_fonts/',
};

/** The corpus's PDF, as a file a person drops. */
async function solarSystemPdf(): Promise<File> {
  const response = await fetch(PDF_URL);
  return new File([await response.blob()], 'solar_system.pdf', { type: 'application/pdf' });
}

/** Every pane's file input (one per theme), the camera's left out. */
function fileInputs(canvasElement: HTMLElement): HTMLInputElement[] {
  return [
    ...canvasElement.querySelectorAll<HTMLInputElement>(
      'input[type="file"]:not([data-camera-input])',
    ),
  ];
}

/** Drops `file` into every pane's field, as a person picks it. */
async function dropIntoEach(canvasElement: HTMLElement, file: File): Promise<void> {
  for (const input of fileInputs(canvasElement)) await userEvent.upload(input, file);
}

/** Nothing on the canvas frames a document or paints a `blob:` source. */
async function expectNoFrameNoBlob(canvasElement: HTMLElement): Promise<void> {
  await expect(canvasElement.querySelectorAll('object, embed, iframe')).toHaveLength(0);
  await expect(canvasElement.querySelectorAll('[data-local-preview] [src^="blob:"]')).toHaveLength(
    0,
  );
}

/**
 * **A PDF dropped under a host that supplies pdf.js's worker**: its pages,
 * drawn onto canvases from the dropped file's own bytes, in a frame that
 * scrolls through them.
 */
export const DroppedPdfDrawn: Story = {
  name: 'A dropped PDF, with a pdf.js worker → its pages',
  args: { pdfWorker: PDF_WORKER },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await dropIntoEach(canvasElement, await solarSystemPdf());
    const regions = await waitFor(
      () => {
        const found = canvas.getAllByRole('group', { name: 'solar_system.pdf' });
        expect(found).toHaveLength(2);
        return found;
      },
      { timeout: 15_000 },
    );
    for (const region of regions) {
      await waitFor(() => expect(region.querySelector('canvas')).not.toBeNull(), {
        timeout: 15_000,
      });
    }
    await expectNoFrameNoBlob(canvasElement);
  },
};

/**
 * **The same PDF under a host with no worker**: a compact card with the
 * file's format and size, never the empty frame most of a screen tall that an
 * `<object>` left on a host refusing it. The card offers the stored file in a
 * new tab, which here is the harness's `blob:` link.
 */
export const DroppedPdfCard: Story = {
  name: 'A dropped PDF, with no pdf.js worker → a compact card',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await dropIntoEach(canvasElement, await solarSystemPdf());
    // The dropped file's format and size, which its stored reference cannot say.
    const summaries = await canvas.findAllByText(/^PDF · /);
    await expect(summaries).toHaveLength(2);
    for (const summary of summaries) {
      const card = summary.closest('[data-local-preview]');
      await expect(card).not.toBeNull();
      await expect(card).toHaveTextContent(S.previewUnavailablePdf);
      await expect(card!.getBoundingClientRect().height).toBeLessThan(120);
    }
    await expectNoFrameNoBlob(canvasElement);
  },
};

/**
 * **A picture dropped into an image input**: painted from a `data:` URL read
 * from the file, which every host's `img-src` admits, where an object URL
 * drew the broken-image placeholder on a host that refuses `blob:`.
 */
export const DroppedImage: Story = {
  name: 'A dropped picture → painted from a data: URL',
  args: { pipeCode: 'one_image' },
  play: async ({ canvasElement }) => {
    await dropIntoEach(canvasElement, await samplePagePhoto(1));
    const pictures = await waitFor(() => {
      const found = [...canvasElement.querySelectorAll('[data-local-preview] img')];
      expect(found).toHaveLength(2);
      return found as HTMLImageElement[];
    });
    for (const picture of pictures) {
      await expect(picture.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
      await waitFor(() => expect(picture.naturalWidth).toBeGreaterThan(0));
    }
    await expectNoFrameNoBlob(canvasElement);
  },
};

/** A PNG of random pixels, which no encoder compresses: about 3 bytes a pixel. */
async function noisyPng(side: number): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No canvas context.');
  const image = context.createImageData(side, side);
  for (let index = 0; index < image.data.length; index += 4) {
    image.data[index] = Math.floor(Math.random() * 256);
    image.data[index + 1] = Math.floor(Math.random() * 256);
    image.data[index + 2] = Math.floor(Math.random() * 256);
    image.data[index + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('The picture could not be encoded.');
  return new File([blob], 'noise.png', { type: 'image/png' });
}

/**
 * **A picture too large to inline**: over `PREVIEW_INLINE_MAX_BYTES`, so its
 * preview paints from a smaller JPEG copy drawn on a canvas, rather than from a
 * `data:` URL a third larger than the file.
 */
export const DroppedLargeImage: Story = {
  name: 'A large dropped picture → painted from a smaller copy',
  args: { pipeCode: 'one_image' },
  play: async ({ canvasElement }) => {
    const file = await noisyPng(1200);
    await expect(file.size).toBeGreaterThan(2 * 1024 * 1024);
    await dropIntoEach(canvasElement, file);
    const pictures = await waitFor(
      () => {
        const found = [...canvasElement.querySelectorAll('[data-local-preview] img')];
        expect(found).toHaveLength(2);
        return found as HTMLImageElement[];
      },
      { timeout: 10_000 },
    );
    for (const picture of pictures) {
      const src = picture.getAttribute('src') ?? '';
      await expect(src).toMatch(/^data:image\/jpeg;base64,/);
      await expect(src.length).toBeLessThan(file.size);
    }
    await expectNoFrameNoBlob(canvasElement);
  },
};
