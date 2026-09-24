import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_FORMATS,
  IMAGE_FORMATS,
  acceptLabel,
  acceptMap,
  formatOfFilename,
  formatsForKind,
  isAcceptedFile,
} from '../file-formats';

/**
 * The format table mirrors a runtime fact that was MEASURED - see the header of
 * `../file-formats` for the runs and the model-deck derivation behind it.
 *
 * The membership assertions are deliberately literal. Their job is to fail
 * loudly if someone widens the table from a plausible-looking source, which is
 * exactly how DOCX and PPTX got in: off an enum the runtime never reads.
 */

describe('the accepted formats', () => {
  it('is PDF, JPG, PNG for a document - the extract model reads an image as one page', () => {
    expect(DOCUMENT_FORMATS.map((f) => f.label)).toEqual(['PDF', 'JPG', 'PNG']);
    expect(acceptLabel(formatsForKind('document'))).toBe('PDF, JPG, PNG');
  });

  it('excludes DOCX and PPTX, which every path refuses', () => {
    // Both were in this table once. A run proves the refusal: the LLM path
    // answers "does not support docx documents", and the extract gateway
    // answers with its own list.
    const mimes = DOCUMENT_FORMATS.map((f) => f.mimeType);
    expect(mimes).not.toContain(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(mimes).not.toContain(
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    );
  });

  it('is PNG, JPG, WEBP for an image', () => {
    expect(IMAGE_FORMATS.map((f) => f.label)).toEqual(['PNG', 'JPG', 'WEBP']);
    expect(acceptLabel(formatsForKind('image'))).toBe('PNG, JPG, WEBP');
  });

  it('excludes GIF, BMP and TIFF, which the vision path refuses', () => {
    const mimes = IMAGE_FORMATS.map((f) => f.mimeType);
    // GIF is the interesting exclusion: it IS in the provider's image enum, but
    // it arrives there as a document block and fails. Listing it would
    // advertise an upload that cannot work today.
    expect(mimes).not.toContain('image/gif');
    expect(mimes).not.toContain('image/bmp');
    expect(mimes).not.toContain('image/tiff');
  });

  it('carries the MIME types the gateway named in its own refusal', () => {
    // "Supported formats: application/pdf, image/jpeg, image/png"
    expect(DOCUMENT_FORMATS.map((f) => f.mimeType)).toEqual([
      'application/pdf',
      'image/jpeg',
      'image/png',
    ]);
    expect(IMAGE_FORMATS.map((f) => f.mimeType)).toEqual(['image/png', 'image/jpeg', 'image/webp']);
  });
});

describe('isAcceptedFile', () => {
  it('accepts a file whose MIME type is in the list', () => {
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'report.pdf', type: 'application/pdf' })).toBe(
      true,
    );
    expect(isAcceptedFile(IMAGE_FORMATS, { name: 'shot.png', type: 'image/png' })).toBe(true);
  });

  it('refuses a file whose MIME type is not', () => {
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'a.zip', type: 'application/zip' })).toBe(
      false,
    );
    expect(isAcceptedFile(IMAGE_FORMATS, { name: 'clip.mp4', type: 'video/mp4' })).toBe(false);
  });

  it('refuses the office formats a run proves fail', () => {
    expect(
      isAcceptedFile(DOCUMENT_FORMATS, {
        name: 'report.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
    ).toBe(false);
    // A PPTX is detected as a zip upstream, so both spellings must be refused.
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'deck.pptx', type: 'application/zip' })).toBe(
      false,
    );
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'deck.pptx', type: '' })).toBe(false);
  });

  it('refuses a PDF on an image slot', () => {
    expect(isAcceptedFile(IMAGE_FORMATS, { name: 'report.pdf', type: 'application/pdf' })).toBe(
      false,
    );
  });

  it('accepts a PNG in a DOCUMENT slot - the extract model reads it as one page', () => {
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'scan.png', type: 'image/png' })).toBe(true);
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'scan.jpg', type: 'image/jpeg' })).toBe(true);
  });

  it('refuses a WEBP in a document slot, though an image slot takes it', () => {
    // The asymmetry is real: the extract gateway names only PDF, JPEG and PNG.
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'scan.webp', type: 'image/webp' })).toBe(false);
    expect(isAcceptedFile(IMAGE_FORMATS, { name: 'scan.webp', type: 'image/webp' })).toBe(true);
  });

  it('falls back to the extension when the browser reports no MIME type', () => {
    // A browser reports '' often enough to matter, and refusing then would be
    // refusing a valid file over a fact about the user's machine.
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'report.pdf', type: '' })).toBe(true);
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'notes.txt', type: '' })).toBe(false);
  });

  it('does not fall back when a MIME type is present but wrong', () => {
    // The extension would pass; the stated type is the stronger signal and the
    // case this function exists for.
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'notes.pdf', type: 'text/plain' })).toBe(false);
  });

  it('accepts both spellings of a JPEG', () => {
    expect(isAcceptedFile(IMAGE_FORMATS, { name: 'a.jpg', type: '' })).toBe(true);
    expect(isAcceptedFile(IMAGE_FORMATS, { name: 'a.jpeg', type: '' })).toBe(true);
  });

  it('ignores MIME parameters and case', () => {
    expect(
      isAcceptedFile(DOCUMENT_FORMATS, { name: 'r.pdf', type: 'APPLICATION/PDF; version=1.7' }),
    ).toBe(true);
  });

  it('matches the extension case-insensitively', () => {
    expect(isAcceptedFile(IMAGE_FORMATS, { name: 'PHOTO.PNG', type: '' })).toBe(true);
  });
});

describe('the helpers read the list they are given, not the kind', () => {
  // A slot a host narrowed carries a shorter list than its kind's table, and the
  // three answers the control gives - the hint, the picker's filter, the check -
  // have to follow that list. So none of them may go back to the table.
  const pngAndJpeg = IMAGE_FORMATS.filter((format) => format.mimeType !== 'image/webp');

  it('names only the formats in the list', () => {
    expect(acceptLabel(pngAndJpeg)).toBe('PNG, JPG');
  });

  it('refuses a format the list dropped, though the kind takes it', () => {
    expect(isAcceptedFile(pngAndJpeg, { name: 'shot.webp', type: 'image/webp' })).toBe(false);
    expect(isAcceptedFile(pngAndJpeg, { name: 'shot.webp', type: '' })).toBe(false);
    expect(isAcceptedFile(pngAndJpeg, { name: 'shot.png', type: 'image/png' })).toBe(true);
  });

  it('offers the picker only the formats in the list', () => {
    expect(acceptMap(pngAndJpeg)).toEqual({
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    });
  });

  it('names nothing and accepts nothing over an empty list', () => {
    expect(acceptLabel([])).toBe('');
    expect(acceptMap([])).toEqual({});
    expect(isAcceptedFile([], { name: 'report.pdf', type: 'application/pdf' })).toBe(false);
  });
});

describe('formatOfFilename', () => {
  it('finds the format an extension names, whatever its case or spelling', () => {
    expect(formatOfFilename(IMAGE_FORMATS, 'PHOTO.PNG')?.label).toBe('PNG');
    expect(formatOfFilename(IMAGE_FORMATS, 'photo.jpeg')?.label).toBe('JPG');
  });

  it('finds nothing for an extension outside the list, or no extension at all', () => {
    expect(formatOfFilename(DOCUMENT_FORMATS, 'scan.webp')).toBeUndefined();
    expect(formatOfFilename(DOCUMENT_FORMATS, 'report')).toBeUndefined();
  });
});

describe('acceptMap', () => {
  it('lists extensions beside each MIME type, for the OS picker', () => {
    expect(acceptMap(IMAGE_FORMATS)).toEqual({
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    });
    expect(acceptMap(DOCUMENT_FORMATS)).toEqual({
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    });
  });

  it('returns a fresh object each call, so a caller cannot mutate the table', () => {
    const first = acceptMap(DOCUMENT_FORMATS);
    first['application/pdf'] = [];
    first['image/png']!.push('.gif');
    expect(acceptMap(DOCUMENT_FORMATS)['application/pdf']).toEqual(['.pdf']);
    expect(DOCUMENT_FORMATS.find((format) => format.label === 'PNG')?.extensions).toEqual(['.png']);
  });
});
