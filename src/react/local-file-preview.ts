/**
 * How a file the control holds in the browser is shown, from its own bytes,
 * with no `blob:` URL anywhere.
 *
 * ## Why not `URL.createObjectURL`
 *
 * An object URL is the obvious way to show a `File` the moment it is dropped,
 * and it is refused by the hosts a form may run in. A chat host's view frame
 * states its own Content Security Policy: one admits `data:` and its declared
 * resource domains in `img-src` and no `blob:`, so a picture painted from an
 * object URL is the broken-image placeholder there; both refuse `<object>`
 * outright (`object-src 'none'`), so a PDF in one is an empty frame. A `data:`
 * URL is admitted wherever an image is, and a PDF drawn by pdf.js onto canvases
 * needs no URL at all (`PdfPages`, from the file's bytes). See
 * `docs/upload-seam.md`, "What a file's preview paints from".
 *
 * The camera's page thumbnails are made the same way (`blobDataUrl`), for the
 * same reason.
 */

import { readPreview } from './photo-reading';

/**
 * The largest picture, in bytes, whose preview is its own bytes as a `data:`
 * URL: 2 MiB. A larger one is drawn smaller first (`PREVIEW_EDGE`), so the
 * preview holds a copy of a few hundred kilobytes rather than a string a third
 * larger than the camera's original.
 */
export const PREVIEW_INLINE_MAX_BYTES = 2 * 1024 * 1024;

/**
 * The longest edge, in pixels, of the smaller copy a large picture's preview
 * is drawn from: sharp in a form's column on a high-density screen.
 */
export const PREVIEW_EDGE = 1600;

/**
 * The largest picture, in bytes, still shown from its own bytes when the
 * browser cannot draw a smaller copy of it (no `createImageBitmap`, or a
 * format it decodes only in an `<img>`, such as an SVG): 8 MiB. A larger one
 * has no local preview, and the card shows the stored file's once the upload
 * has landed, when the host resolves it.
 */
export const PREVIEW_RAW_MAX_BYTES = 8 * 1024 * 1024;

/** A blob's bytes as a `data:` URL, read with a `FileReader`. */
export function blobDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const { result } = reader;
      if (typeof result === 'string' && result.startsWith('data:')) resolve(result);
      else reject(new Error('The file could not be read as a data URL'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('The file could not be read'));
    reader.readAsDataURL(blob);
  });
}

/**
 * The `data:` URL a picture's preview paints, or `null` when there is none to
 * be had: its own bytes up to `PREVIEW_INLINE_MAX_BYTES`, a copy at most
 * `PREVIEW_EDGE` pixels on its long edge above that (a JPEG on white, as the
 * camera's pages are), and its own bytes again up to `PREVIEW_RAW_MAX_BYTES`
 * where no copy can be drawn.
 */
export async function imagePreviewDataUrl(file: Blob): Promise<string | null> {
  if (file.size === 0) return null;
  if (file.size <= PREVIEW_INLINE_MAX_BYTES) return blobDataUrl(file);
  try {
    const copy = await readPreview(file, PREVIEW_EDGE);
    return await blobDataUrl(copy.blob);
  } catch {
    // No copy: the browser has no `createImageBitmap`, or does not decode this
    // format outside an `<img>`, or its canvas gave nothing back.
  }
  return file.size <= PREVIEW_RAW_MAX_BYTES ? blobDataUrl(file) : null;
}

/**
 * The bytes a `data:` URL carries, decoded, or `undefined` for a string that
 * is not one. Base64 and percent-encoded payloads both; a fragment is the
 * viewer's, not payload.
 */
export function dataUrlBytes(candidate: string): Uint8Array | undefined {
  const url = candidate.trim();
  if (!/^data:/i.test(url)) return undefined;
  const comma = url.indexOf(',');
  if (comma === -1) return undefined;
  const header = url.slice('data:'.length, comma).toLowerCase();
  const fragment = url.indexOf('#', comma);
  const payload = fragment === -1 ? url.slice(comma + 1) : url.slice(comma + 1, fragment);
  if (header.split(';').some((parameter) => parameter.trim() === 'base64')) {
    let binary: string;
    try {
      binary = atob(decodeURIComponent(payload).replace(/\s/g, ''));
    } catch {
      return undefined;
    }
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }
  const bytes: number[] = [];
  for (let index = 0; index < payload.length; index += 1) {
    const hex = payload[index] === '%' ? payload.slice(index + 1, index + 3) : '';
    if (/^[0-9a-f]{2}$/i.test(hex)) {
      bytes.push(parseInt(hex, 16));
      index += 2;
    } else {
      bytes.push(payload.charCodeAt(index) & 0xff);
    }
  }
  return Uint8Array.from(bytes);
}
