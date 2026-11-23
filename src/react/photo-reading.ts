/**
 * A photo, read once into the page it becomes: decoded, turned upright, and
 * encoded twice as a JPEG, a thumbnail for the page strip and the page the
 * file is made of. See docs/camera.md, "Reading a photo".
 *
 * Everything runs in the browser, on the phone, one photo at a time: the
 * photo is decoded with `createImageBitmap` (Safari reads the iPhone's HEIC
 * itself), scaled with the bitmap's own resize options, drawn on a canvas and
 * read back as a JPEG. The full-size bitmap is let go before any canvas
 * exists, every canvas is shrunk to nothing once read, and the photo itself is
 * not kept: a page holds its encoded JPEG, a few hundred kilobytes, rather than
 * the camera's original of several megabytes. A photo the browser cannot
 * decode, or a canvas that gives no image back (Safari does that when it runs
 * out of canvas memory), is an `UndecodablePhotoError`.
 *
 * Its tests need a real canvas and a real decoder, so they are stories run in
 * Chromium (`src/__stories__/inputs/photo-reading.stories.tsx`); `boundedSize`
 * and `pageSizeFor` are plain arithmetic.
 */

/** The longest edge, in pixels, of a page the runner sends. */
export const MAX_PAGE_EDGE = 2048;
/** The JPEG quality every page and thumbnail is encoded at. */
export const JPEG_QUALITY = 0.85;
/** The longest edge of a page's thumbnail on screen: sharp at 3x, light in memory. */
export const THUMBNAIL_EDGE = 320;
/** A4's long edge in PDF points: a page keeps its photo's proportions within it. */
export const PAGE_LONG_EDGE_PT = 842;

/** A photo the browser cannot use: it cannot decode it, or its canvas gave nothing back. */
export class UndecodablePhotoError extends Error {
  constructor() {
    super('The photo could not be decoded.');
    this.name = 'UndecodablePhotoError';
  }
}

export interface Size {
  width: number;
  height: number;
}

/** A JPEG, with its size in pixels. */
export interface JpegImage extends Size {
  blob: Blob;
}

/** What a photo is read into: the page's JPEG and its thumbnail's. */
export interface ReadPhoto {
  page: JpegImage;
  thumbnail: JpegImage;
}

/**
 * The size a picture of `width` by `height` is drawn at: scaled down so its
 * long edge is at most `maxEdge`, never scaled up, its proportions kept, and
 * never below one pixel.
 */
export function boundedSize(width: number, height: number, maxEdge: number = MAX_PAGE_EDGE): Size {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** The PDF page a picture of this size is printed on, in points: A4's long edge, its shape. */
export function pageSizeFor({ width, height }: Size): Size {
  const scale = PAGE_LONG_EDGE_PT / Math.max(width, height);
  return { width: width * scale, height: height * scale };
}

/**
 * The photo as a bitmap, turned upright as its EXIF orientation says: a phone
 * stores a portrait photo as a landscape one with a rotate tag, which a
 * browser whose default ignores the tag would decode, and send, sideways. A
 * browser older than the option's `from-image` value refuses the call
 * outright, so the photo is decoded again with the browser's default before it
 * is refused as undecodable.
 */
async function decode(photo: Blob): Promise<ImageBitmap> {
  if (typeof createImageBitmap !== 'function') throw new UndecodablePhotoError();
  try {
    return await createImageBitmap(photo, { imageOrientation: 'from-image' });
  } catch {
    // The option refused, or the photo itself: the second call tells which.
  }
  try {
    return await createImageBitmap(photo);
  } catch {
    throw new UndecodablePhotoError();
  }
}

/**
 * The bitmap at `size`, through `createImageBitmap`'s resize options, which
 * scale better than a canvas does in one step, or `null` when it already has
 * that size or the browser refuses the options: the canvas then scales it, so
 * the bound holds either way. The caller closes both bitmaps.
 */
async function resized(bitmap: ImageBitmap, size: Size): Promise<ImageBitmap | null> {
  if (bitmap.width === size.width && bitmap.height === size.height) return null;
  try {
    return await createImageBitmap(bitmap, {
      resizeWidth: size.width,
      resizeHeight: size.height,
      resizeQuality: 'high',
    });
  } catch {
    return null;
  }
}

/** Draw `source` at `size` on a canvas and read it back as a JPEG, or refuse an empty one. */
async function encodeJpeg(source: ImageBitmap, size: Size): Promise<JpegImage> {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  try {
    const context = canvas.getContext('2d');
    if (!context) throw new UndecodablePhotoError();
    // A JPEG has no transparency: a transparent picture goes on white, as on paper.
    context.fillStyle = 'white';
    context.fillRect(0, 0, size.width, size.height);
    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, size.width, size.height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY);
    });
    if (!blob || blob.size === 0) throw new UndecodablePhotoError();
    return { blob, ...size };
  } finally {
    // Safari keeps a canvas's memory until it is collected; a zero size gives it back now.
    canvas.width = 0;
    canvas.height = 0;
  }
}

/**
 * `source` encoded as a JPEG whose long edge is at most `maxEdge`. It closes
 * the bitmap it scales `source` into, and leaves `source` to the caller.
 */
async function jpegOf(source: ImageBitmap, maxEdge: number): Promise<JpegImage> {
  const size = boundedSize(source.width, source.height, maxEdge);
  const scaled = await resized(source, size);
  try {
    return await encodeJpeg(scaled ?? source, size);
  } finally {
    scaled?.close();
  }
}

/**
 * A smaller copy of a picture, for its preview: decoded upright once, then
 * encoded as a JPEG on white whose long edge is at most `maxEdge`. Throws
 * `UndecodablePhotoError` for a picture the browser cannot decode this way.
 * See `imagePreviewDataUrl` in `./local-file-preview`.
 */
export async function readPreview(picture: Blob, maxEdge: number): Promise<JpegImage> {
  const full = await decode(picture);
  try {
    if (full.width === 0 || full.height === 0) throw new UndecodablePhotoError();
    return await jpegOf(full, maxEdge);
  } finally {
    full.close();
  }
}

/**
 * Read one photo into its page: decoded once, the page encoded with its long
 * edge at most `MAX_PAGE_EDGE`, and the thumbnail made from that page's bitmap
 * with its long edge at most `THUMBNAIL_EDGE`. The full-size bitmap is closed
 * as soon as the page's bitmap exists, before any canvas does. Throws
 * `UndecodablePhotoError` for a photo the browser cannot decode and for a
 * canvas that gives no image back.
 */
export async function readPhoto(photo: Blob): Promise<ReadPhoto> {
  const full = await decode(photo);
  let pageBitmap: ImageBitmap | null = null;
  try {
    if (full.width === 0 || full.height === 0) throw new UndecodablePhotoError();
    const size = boundedSize(full.width, full.height, MAX_PAGE_EDGE);
    pageBitmap = await resized(full, size);
    // The full-size bitmap is the heaviest thing held: let it go before the canvas exists.
    if (pageBitmap) full.close();
    const source = pageBitmap ?? full;
    const page = await encodeJpeg(source, size);
    const thumbnail = await jpegOf(source, THUMBNAIL_EDGE);
    return { page, thumbnail };
  } finally {
    full.close();
    pageBitmap?.close();
  }
}
