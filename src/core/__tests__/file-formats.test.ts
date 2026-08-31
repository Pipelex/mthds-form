import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_FORMATS,
  IMAGE_FORMATS,
  acceptLabelForKind,
  acceptMapForKind,
  isAcceptedFile,
} from '../file-formats';

/**
 * The format table is a MIRROR of the runtime's `DocumentFormat` and
 * `ImageFormat` enums, so these tests pin the two things a mirror can get
 * wrong: the membership itself, and the fallbacks that decide whether a real
 * file matches it.
 */

describe('the accepted formats', () => {
  it('mirrors DocumentFormat: PDF, DOCX, PPTX - and not TXT', () => {
    expect(DOCUMENT_FORMATS.map((f) => f.label)).toEqual(['PDF', 'DOCX', 'PPTX']);
    expect(acceptLabelForKind('document')).toBe('PDF, DOCX, PPTX');
  });

  it('mirrors ImageFormat: PNG, JPEG, WEBP', () => {
    expect(IMAGE_FORMATS.map((f) => f.label)).toEqual(['PNG', 'JPG', 'WEBP']);
    expect(acceptLabelForKind('image')).toBe('PNG, JPG, WEBP');
  });

  it('carries the runtime MIME types verbatim', () => {
    expect(DOCUMENT_FORMATS.map((f) => f.mimeType)).toEqual([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ]);
    expect(IMAGE_FORMATS.map((f) => f.mimeType)).toEqual(['image/png', 'image/jpeg', 'image/webp']);
  });
});

describe('isAcceptedFile', () => {
  it('accepts a file whose MIME type is in the list', () => {
    expect(isAcceptedFile('document', { name: 'report.pdf', type: 'application/pdf' })).toBe(true);
    expect(isAcceptedFile('image', { name: 'shot.png', type: 'image/png' })).toBe(true);
  });

  it('refuses a file whose MIME type is not', () => {
    expect(isAcceptedFile('document', { name: 'archive.zip', type: 'application/zip' })).toBe(
      false,
    );
    expect(isAcceptedFile('image', { name: 'clip.mp4', type: 'video/mp4' })).toBe(false);
  });

  it('refuses a document on an image slot, and the reverse', () => {
    expect(isAcceptedFile('image', { name: 'report.pdf', type: 'application/pdf' })).toBe(false);
    expect(isAcceptedFile('document', { name: 'shot.png', type: 'image/png' })).toBe(false);
  });

  it('falls back to the extension when the browser reports no MIME type', () => {
    // An OS with no handler registered for .docx reports ''. Refusing that file
    // would be refusing a valid one over a fact about the user's machine.
    expect(isAcceptedFile('document', { name: 'contract.docx', type: '' })).toBe(true);
    expect(isAcceptedFile('document', { name: 'notes.txt', type: '' })).toBe(false);
  });

  it('does not fall back when a MIME type is present but wrong', () => {
    // The extension would pass; the stated type is the stronger signal and the
    // case this function exists for.
    expect(isAcceptedFile('document', { name: 'notes.pdf', type: 'text/plain' })).toBe(false);
  });

  it('accepts both spellings of a JPEG', () => {
    expect(isAcceptedFile('image', { name: 'a.jpg', type: '' })).toBe(true);
    expect(isAcceptedFile('image', { name: 'a.jpeg', type: '' })).toBe(true);
  });

  it('ignores MIME parameters and case', () => {
    expect(
      isAcceptedFile('document', { name: 'r.pdf', type: 'APPLICATION/PDF; version=1.7' }),
    ).toBe(true);
  });

  it('matches the extension case-insensitively', () => {
    expect(isAcceptedFile('image', { name: 'PHOTO.PNG', type: '' })).toBe(true);
  });
});

describe('acceptMapForKind', () => {
  it('lists extensions beside each MIME type, for the OS picker', () => {
    expect(acceptMapForKind('image')).toEqual({
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    });
  });

  it('returns a fresh object each call, so a caller cannot mutate the table', () => {
    const first = acceptMapForKind('document');
    first['application/pdf'] = [];
    expect(acceptMapForKind('document')['application/pdf']).toEqual(['.pdf']);
  });
});
