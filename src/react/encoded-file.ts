import { DOCUMENT_FORMATS, IMAGE_FORMATS } from '../core/file-formats';
import { readDataUrl } from '../core/native-content';
import type { FieldStrings } from './field-strings';

/**
 * The line that names a file carried inside its own `data:` URL — `PDF · 36 KB`
 * — or `undefined` for a URL that only points at a file.
 *
 * Shared by the input control's chip and the result view's file reference,
 * because both used to print the URL itself: a host that encodes a picked file
 * in the browser (rather than uploading it first) puts the whole file there, and
 * the row's subtitle became `data:application/pdf;base64,JVBERi0xLjQK…`. A
 * reference that points somewhere is still worth printing; one that IS the
 * bytes is not.
 *
 * The format is named the way a dropzone's hint names it (`PDF`, `PNG`) when it
 * is one this package accepts, and by its media type otherwise.
 */
export function encodedFileSummary(url: string, strings: FieldStrings): string | undefined {
  const view = readDataUrl(url);
  if (!view) return undefined;
  const format =
    [...DOCUMENT_FORMATS, ...IMAGE_FORMATS].find((known) => known.mimeType === view.mediaType)
      ?.label ?? view.mediaType;
  return strings.encodedFileSummary(format, view.bytes);
}
