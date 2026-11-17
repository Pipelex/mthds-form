import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  JPEG_QUALITY,
  MAX_PAGE_EDGE,
  PAGE_LONG_EDGE_PT,
  THUMBNAIL_EDGE,
  UndecodablePhotoError,
  readPhoto,
} from '../../react/photo-reading';
import { pagesToPdf } from '../../react/photos-pdf';
import { samplePagePhoto, undecodablePhoto } from '../photo-samples';

/*
 * Browser tests of the camera's reading and its PDF (`src/react/photo-reading.ts`,
 * `src/react/photos-pdf.ts`): decoding, scaling and JPEG encoding need a real
 * canvas and `createImageBitmap`, which Node and jsdom do not have, so these
 * run as stories in the story project's Chromium. Tagged `!dev`, they stay out
 * of the sidebar; each story's `play` is the test, and the page only says what
 * is being checked. Deep imports, since these are tests of internal modules.
 */

const meta = {
  title: 'Inputs/Camera/Photo reading',
  tags: ['!dev', '!autodocs'],
  render: () => (
    <p className="p-4 text-sm text-foreground">
      Browser tests of photo-reading.ts and photos-pdf.ts.
    </p>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const JPEG_MAGIC = [0xff, 0xd8, 0xff];

async function firstBytes(blob: Blob, count: number): Promise<number[]> {
  return [...new Uint8Array(await blob.slice(0, count).arrayBuffer())];
}

async function decodedSize(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(blob);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

async function refusal(work: Promise<unknown>): Promise<unknown> {
  try {
    await work;
    return null;
  } catch (error: unknown) {
    return error;
  }
}

type Decode = (source: ImageBitmapSource, options?: ImageBitmapOptions) => Promise<ImageBitmap>;

/** `work`, with `createImageBitmap` replaced by a stand-in that may call the real one. */
async function withDecoder<T>(standIn: (real: Decode) => Decode, work: () => Promise<T>) {
  const real = window.createImageBitmap;
  window.createImageBitmap = standIn(real.bind(window) as Decode) as typeof real;
  try {
    return await work();
  } finally {
    window.createImageBitmap = real;
  }
}

/**
 * The PDF's text: `jspdf` writes its objects in the clear and compresses only
 * the page streams, so the page count, the title and each page's box can be
 * read off it with no PDF library.
 */
async function pdfText(pdf: Blob): Promise<string> {
  return new TextDecoder('latin1').decode(await pdf.arrayBuffer());
}

/** A landscape photo larger than the bound comes back with its long edge at 2048px. */
export const BoundsALargeLandscapePhoto: Story = {
  play: async () => {
    const { page } = await readPhoto(await samplePagePhoto(1, { width: 4000, height: 3000 }));
    await expect({ width: page.width, height: page.height }).toEqual({
      width: MAX_PAGE_EDGE,
      height: 1536,
    });
    await expect(await decodedSize(page.blob)).toEqual({ width: MAX_PAGE_EDGE, height: 1536 });
  },
};

/** A tall portrait photo is bound by its height, its proportions kept. */
export const BoundsATallPortraitPhoto: Story = {
  play: async () => {
    const { page } = await readPhoto(await samplePagePhoto(1, { width: 1500, height: 4096 }));
    await expect(await decodedSize(page.blob)).toEqual({ width: 750, height: MAX_PAGE_EDGE });
  },
};

/** A photo within the bound is never scaled up. */
export const KeepsASmallPhotoItsSize: Story = {
  play: async () => {
    const { page } = await readPhoto(await samplePagePhoto(1, { width: 800, height: 600 }));
    await expect(await decodedSize(page.blob)).toEqual({ width: 800, height: 600 });
  },
};

/** Every page, a PNG here, comes back as a JPEG, smaller than its source. */
export const EncodesAJpeg: Story = {
  play: async () => {
    const photo = await samplePagePhoto(1, { width: 1200, height: 1600 });
    const { page } = await readPhoto(photo);
    await expect(page.blob.type).toBe('image/jpeg');
    await expect(await firstBytes(page.blob, 3)).toEqual(JPEG_MAGIC);
    await expect(page.blob.size).toBeLessThan(photo.size);
    await expect(JPEG_QUALITY).toBe(0.85);
  },
};

/** The thumbnail is the same page bound to the thumbnail's edge, from the one decode. */
export const MakesAThumbnailFromOneDecode: Story = {
  play: async () => {
    const photo = await samplePagePhoto(1);
    let decodes = 0;
    const { thumbnail } = await withDecoder(
      (real) => (source, options) => {
        if (source instanceof Blob) decodes += 1;
        return real(source, options);
      },
      () => readPhoto(photo),
    );
    await expect(await decodedSize(thumbnail.blob)).toEqual({ width: 240, height: THUMBNAIL_EDGE });
    // The photo itself is decoded once; every later call resizes that bitmap.
    await expect(decodes).toBe(1);
  },
};

/**
 * A photo is decoded upright, as its EXIF orientation says, whatever the
 * browser's default: a phone's portrait photo is stored landscape with a
 * rotate tag.
 */
export const DecodesAPhotoUpright: Story = {
  play: async () => {
    const photo = await samplePagePhoto(1, { width: 600, height: 800 });
    const options: (ImageBitmapOptions | undefined)[] = [];
    await withDecoder(
      (real) => (source, given) => {
        options.push(given);
        return real(source, given);
      },
      () => readPhoto(photo),
    );
    await expect(options[0]).toMatchObject({ imageOrientation: 'from-image' });
  },
};

/**
 * A browser older than `imageOrientation: 'from-image'` refuses the option
 * outright: the photo is decoded with its default instead, never refused.
 */
export const DecodesWhereTheOrientationOptionIsRefused: Story = {
  play: async () => {
    const photo = await samplePagePhoto(1, { width: 600, height: 800 });
    const { page } = await withDecoder(
      (real) => (source, given) =>
        given?.imageOrientation === 'from-image'
          ? Promise.reject(new TypeError('Not a valid enum value of type ImageOrientation.'))
          : real(source, given),
      () => readPhoto(photo),
    );
    await expect({ width: page.width, height: page.height }).toEqual({ width: 600, height: 800 });
  },
};

/** Bytes that are not a picture are refused as undecodable. */
export const RefusesAnUndecodablePhoto: Story = {
  play: async () => {
    await expect(await refusal(readPhoto(undecodablePhoto()))).toBeInstanceOf(
      UndecodablePhotoError,
    );
  },
};

/** A canvas that gives no image back, as Safari's does out of memory, is undecodable too. */
export const RefusesAnEmptyCanvas: Story = {
  play: async () => {
    const photo = await samplePagePhoto(1, { width: 600, height: 800 });
    const realToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function toBlob(callback: BlobCallback): void {
      callback(null);
    };
    try {
      await expect(await refusal(readPhoto(photo))).toBeInstanceOf(UndecodablePhotoError);
    } finally {
      HTMLCanvasElement.prototype.toBlob = realToBlob;
    }
  },
};

/**
 * The pages, in order, make one PDF titled for its input, each page A4's long
 * edge in its photo's shape: a landscape photo is a landscape page.
 */
export const MakesOnePdfOfThePages: Story = {
  play: async () => {
    const photos = await Promise.all([
      samplePagePhoto(1, { width: 3000, height: 4000 }),
      samplePagePhoto(2, { width: 900, height: 1200 }),
      samplePagePhoto(3, { width: 4000, height: 3000 }),
    ]);
    const pages = [];
    for (const photo of photos) pages.push((await readPhoto(photo)).page);
    const pdf = await pagesToPdf(pages, { title: 'Purchase order' });
    await expect(pdf.type).toBe('application/pdf');
    const text = await pdfText(pdf);
    await expect(text.startsWith('%PDF-')).toBe(true);
    await expect(text.match(/\/Type \/Page\b/g)).toHaveLength(3);
    await expect(text).toContain('/Title (Purchase order)');
    const boxes = [...text.matchAll(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/g)].map(([, w, h]) => ({
      width: Number(w),
      height: Number(h),
    }));
    await expect(boxes).toHaveLength(3);
    for (const box of boxes) {
      await expect(Math.max(box.width, box.height)).toBeCloseTo(PAGE_LONG_EDGE_PT, 0);
    }
    // Portrait, portrait, then the landscape photo as a landscape page.
    await expect(boxes[0]?.width).toBeLessThan(boxes[0]?.height ?? 0);
    await expect(boxes[2]?.width).toBeGreaterThan(boxes[2]?.height ?? 0);
  },
};

/** A PDF with no page is refused rather than made empty. */
export const RefusesAPdfOfNoPage: Story = {
  play: async () => {
    await expect(await refusal(pagesToPdf([]))).toBeInstanceOf(Error);
  },
};
