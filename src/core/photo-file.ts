import type { FileRunField, RunField } from './descriptor';
import { isAcceptedFile } from './file-formats';

/**
 * The camera's rules that need no browser: which inputs take photos, and what
 * the file made from them is called. See docs/camera.md.
 *
 * A runner photographs a paper document page by page, and the file control
 * makes the pages into one file it stores like any dropped file: one PDF of
 * the pages for a `document` input, the photo's own JPEG for an `image` input.
 * The camera is offered only where that file is one the slot accepts, which is
 * read off the field's own `formats`, so a slot a host narrowed to formats
 * without it keeps the plain control.
 */

/** The file the photos make, by kind: its extension and its MIME type. */
export const PHOTO_FILE: Readonly<
  Record<FileRunField['kind'], { readonly extension: string; readonly type: string }>
> = {
  document: { extension: 'pdf', type: 'application/pdf' },
  image: { extension: 'jpg', type: 'image/jpeg' },
};

/**
 * Whether the file control offers the camera on this field: a `document` or
 * `image` input whose formats accept the file its photos make, a PDF for a
 * document and a JPEG for an image. A list is not one; each of its rows is.
 */
export function takesPhotos(field: RunField): field is FileRunField {
  if (field.kind !== 'document' && field.kind !== 'image') return false;
  const { extension, type } = PHOTO_FILE[field.kind];
  return isAcceptedFile(field.formats, { name: `photo.${extension}`, type });
}

/** Characters no file name may carry, on any system the file may land on. */
// eslint-disable-next-line no-control-regex -- the control characters are what it removes.
const UNSAFE_IN_NAME = /[\\/:*?"<>|\u0000-\u001f]+/g;

/**
 * The name of the file an input's photos make: the input's label, so the file
 * reads as what it is ("Purchase order.pdf"), with the characters no file
 * name may carry taken out, and "Photo" when nothing of the label is left.
 */
export function photoFileName(label: string, kind: FileRunField['kind']): string {
  const base = label.replace(UNSAFE_IN_NAME, ' ').replace(/\s+/g, ' ').trim() || 'Photo';
  return `${base}.${PHOTO_FILE[kind].extension}`;
}
