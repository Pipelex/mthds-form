import { expect, waitFor } from 'storybook/test';

/**
 * Made-up photographed pages for the camera stories: a purchase order's page
 * drawn on a canvas, as a phone's photo of paper on a desk would look, so the
 * thumbnails and the PDF made of them read like the real thing. Browser only:
 * the stories run in Chromium.
 */

interface PageDrawing {
  /** The photo's size in pixels: a phone's 4:3 by default, portrait. */
  width?: number;
  height?: number;
}

function draw(canvas: HTMLCanvasElement, number: number, drawing: PageDrawing): void {
  const { width = 900, height = 1200 } = drawing;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return;
  const unit = Math.min(width, height) / 100;
  // The desk, then the sheet of paper, a little smaller than the photo.
  context.fillStyle = '#5b544c';
  context.fillRect(0, 0, width, height);
  const inset = unit * 6;
  context.fillStyle = '#f3efe6';
  context.fillRect(inset, inset, width - inset * 2, height - inset * 2);
  context.fillStyle = '#2b2925';
  context.font = `600 ${unit * 5}px sans-serif`;
  context.fillText('PURCHASE ORDER', inset * 2, inset * 2 + unit * 5);
  context.font = `${unit * 3.2}px sans-serif`;
  context.fillText(`PO-7731 · page ${number}`, inset * 2, inset * 2 + unit * 11);
  // Rows of a table, as grey bars.
  context.fillStyle = '#b9b2a6';
  const top = inset * 2 + unit * 18;
  for (let row = 0; row < 9; row += 1) {
    const y = top + row * unit * 7;
    if (y > height - inset * 3) break;
    context.fillRect(inset * 2, y, (width - inset * 4) * 0.55, unit * 2.4);
    context.fillRect(
      width - inset * 2 - (width - inset * 4) * 0.2,
      y,
      (width - inset * 4) * 0.2,
      unit * 2.4,
    );
  }
}

/** A page's photo, as a PNG file of the given size, the way a phone hands one to the page. */
export async function samplePagePhoto(number: number, drawing: PageDrawing = {}): Promise<File> {
  const canvas = document.createElement('canvas');
  draw(canvas, number, drawing);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('The sample page could not be drawn.');
  return new File([blob], `IMG_${4200 + number}.png`, { type: 'image/png' });
}

/** Bytes a phone might hand over that no browser can decode. */
export function undecodablePhoto(): File {
  return new File(['not a photo at all'], 'IMG_9999.heic', { type: 'image/heic' });
}

/** Every camera input on the canvas: one per theme pane, or one per row. */
export function cameraInputs(root: ParentNode): HTMLInputElement[] {
  return [...root.querySelectorAll<HTMLInputElement>('input[data-camera-input]')];
}

/**
 * Hand the camera input a photo, as a phone's camera does when the person
 * presses its shutter: the input's `change`, with the photo as its one file.
 */
export function givePhoto(input: HTMLInputElement, photo: File): void {
  const files = new DataTransfer();
  files.items.add(photo);
  input.files = files.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Take `count` page photos on every camera input, waiting for each one's page. */
export async function takePages(root: HTMLElement, count: number): Promise<void> {
  for (let page = 1; page <= count; page += 1) {
    const photo = await samplePagePhoto(page);
    for (const input of cameraInputs(root)) givePhoto(input, photo);
    await waitFor(
      () =>
        expect(root.querySelectorAll('[data-photo-pages] li img')).toHaveLength(
          page * cameraInputs(root).length,
        ),
      { timeout: 5000 },
    );
  }
}

type Decode = typeof window.createImageBitmap;

/**
 * Run `work` with the browser's decoder held, so every photo taken meanwhile
 * stays "being read" for good: what a story shows of a page being read.
 */
export async function withDecoderHeld(work: () => Promise<void>): Promise<void> {
  const real: Decode = window.createImageBitmap;
  window.createImageBitmap = (() => new Promise<ImageBitmap>(() => {})) as Decode;
  try {
    await work();
  } finally {
    window.createImageBitmap = real;
  }
}
