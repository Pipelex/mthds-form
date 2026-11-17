import { describe, expect, it } from 'vitest';
import { DOCUMENT_FORMATS, IMAGE_FORMATS, takesPhotos, type FileRunField, type RunField } from '..';
import { photoFileName, PHOTO_FILE } from '../photo-file';

/**
 * Which inputs the camera serves, and what the file it makes is called. An
 * input takes photos when its formats accept the file the camera makes from
 * them: one PDF of the pages for a document, the photo's own JPEG for an
 * image. An input a host narrowed to formats without that file keeps the plain
 * control.
 */

const file = (
  kind: 'document' | 'image',
  formats = kind === 'document' ? DOCUMENT_FORMATS : IMAGE_FORMATS,
): FileRunField => ({
  kind,
  name: kind === 'document' ? 'purchase_order' : 'receipt',
  conceptRef: kind === 'document' ? 'native.Document' : 'native.Image',
  required: true,
  formats,
});

describe('takesPhotos', () => {
  it('takes photos on a document input that accepts a PDF', () => {
    expect(takesPhotos(file('document'))).toBe(true);
  });

  it('takes photos on an image input that accepts a JPEG', () => {
    expect(takesPhotos(file('image'))).toBe(true);
  });

  it('keeps the plain control on a document input narrowed to images', () => {
    const narrowed = DOCUMENT_FORMATS.filter((format) => format.mimeType !== 'application/pdf');
    expect(takesPhotos(file('document', narrowed))).toBe(false);
  });

  it('keeps the plain control on an image input narrowed to PNG', () => {
    const narrowed = IMAGE_FORMATS.filter((format) => format.mimeType === 'image/png');
    expect(takesPhotos(file('image', narrowed))).toBe(false);
  });

  it('takes no photos on any other kind, a list of documents included', () => {
    const text: RunField = {
      kind: 'text',
      name: 'note',
      conceptRef: 'native.Text',
      required: true,
    };
    const list: RunField = {
      kind: 'list',
      name: 'pages',
      conceptRef: 'native.Document[]',
      required: true,
      item: file('document'),
    };
    expect(takesPhotos(text)).toBe(false);
    // A list's rows each take photos: the list itself is not a file input.
    expect(takesPhotos(list)).toBe(false);
  });
});

describe('photoFileName', () => {
  it("names the file after the input's label, with the made file's extension", () => {
    expect(photoFileName('Purchase order', 'document')).toBe('Purchase order.pdf');
    expect(photoFileName('Receipt', 'image')).toBe('Receipt.jpg');
  });

  it('takes out the characters no file name may carry, and collapses the spaces', () => {
    expect(photoFileName('Invoice: 2024/03 *draft*', 'document')).toBe('Invoice 2024 03 draft.pdf');
  });

  it('falls back to "Photo" when nothing of the label is left', () => {
    expect(photoFileName('///', 'image')).toBe('Photo.jpg');
    expect(photoFileName('', 'document')).toBe('Photo.pdf');
  });

  it('makes a PDF of a document and a JPEG of an image', () => {
    expect(PHOTO_FILE.document.type).toBe('application/pdf');
    expect(PHOTO_FILE.image.type).toBe('image/jpeg');
  });
});
