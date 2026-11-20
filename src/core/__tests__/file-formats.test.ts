import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_FORMATS,
  IMAGE_FORMATS,
  acceptLabel,
  acceptMap,
  formatLabels,
  formatOfFile,
  formatOfFilename,
  formatsForKind,
  isAcceptedFile,
} from '../file-formats';

/**
 * The format table mirrors a runtime fact - see the header of `../file-formats`
 * for where each format comes from and what reads it.
 *
 * The membership assertions are deliberately literal. Their job is to fail
 * loudly when someone widens or narrows the table, so that the change is made
 * on purpose and against the runtime, never off a plausible-looking enum.
 */

const WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const POWERPOINT = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

/** Every document format, by the extension a file of it carries and its canonical type. */
const DOCUMENT_FILES: readonly [extension: string, type: string][] = [
  ['.pdf', 'application/pdf'],
  ['.docx', WORD],
  ['.doc', 'application/msword'],
  ['.xlsx', EXCEL],
  ['.xls', 'application/vnd.ms-excel'],
  ['.pptx', POWERPOINT],
  ['.ppt', 'application/vnd.ms-powerpoint'],
  ['.csv', 'text/csv'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
];

/** Every other spelling a browser gives a document format, with the extension it rides. */
const ALIASES: readonly [extension: string, type: string][] = [
  ['.docx', 'application/zip'],
  ['.docx', 'application/x-zip-compressed'],
  ['.xlsx', 'application/zip'],
  ['.xlsx', 'application/x-zip-compressed'],
  ['.pptx', 'application/zip'],
  ['.pptx', 'application/x-zip-compressed'],
  ['.csv', 'application/vnd.ms-excel'],
  ['.csv', 'text/plain'],
  ['.csv', 'application/csv'],
  ['.csv', 'text/x-csv'],
];

describe('the accepted formats', () => {
  it('is PDF, the Office formats, CSV, JPG and PNG for a document, named by family', () => {
    expect(DOCUMENT_FORMATS.map((f) => f.label)).toEqual([
      'PDF',
      'Word',
      'Word',
      'Excel',
      'Excel',
      'PowerPoint',
      'PowerPoint',
      'CSV',
      'JPG',
      'PNG',
    ]);
  });

  it('names each family once in the hint', () => {
    expect(acceptLabel(formatsForKind('document'))).toBe(
      'PDF, Word, Excel, PowerPoint, CSV, JPG, PNG',
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

  it('carries the canonical type the runtime gives each format, in the table order', () => {
    // These are the types a store gives the files, so a team-file picker
    // filtering on them finds the stored files.
    expect(DOCUMENT_FORMATS.map((f) => f.mimeType)).toEqual([
      'application/pdf',
      WORD,
      'application/msword',
      EXCEL,
      'application/vnd.ms-excel',
      POWERPOINT,
      'application/vnd.ms-powerpoint',
      'text/csv',
      'image/jpeg',
      'image/png',
    ]);
    expect(IMAGE_FORMATS.map((f) => f.mimeType)).toEqual(['image/png', 'image/jpeg', 'image/webp']);
  });

  it('leaves the OpenDocument formats out', () => {
    const mimes = DOCUMENT_FORMATS.map((f) => f.mimeType);
    expect(mimes.some((mime) => mime.includes('opendocument'))).toBe(false);
    for (const ext of ['.odt', '.ods', '.odp']) {
      expect(formatOfFilename(DOCUMENT_FORMATS, `file${ext}`)).toBeUndefined();
    }
  });
});

describe('every document format is accepted', () => {
  it.each(DOCUMENT_FILES)('a %s file reported as %s', (extension, type) => {
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: `file${extension}`, type })).toBe(true);
  });

  it.each(DOCUMENT_FILES)('a %s file reported with no type', (extension) => {
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: `file${extension}`, type: '' })).toBe(true);
  });
});

describe("a browser's other spellings of a format", () => {
  it.each(ALIASES)('accepts a %s file reported as %s', (extension, type) => {
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: `file${extension}`, type })).toBe(true);
  });

  it.each(ALIASES)(
    'takes a %s file reported as %s for what its extension says',
    (extension, type) => {
      expect(formatOfFile(DOCUMENT_FORMATS, { name: `file${extension}`, type })).toBe(
        formatOfFilename(DOCUMENT_FORMATS, `file${extension}`),
      );
    },
  );

  it('refuses a file reported as a zip alias when its extension is no document', () => {
    // An alias alone accepts nothing: a zip archive is no document, however a
    // `.docx` sometimes gets reported.
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'a.zip', type: 'application/zip' })).toBe(
      false,
    );
    expect(
      isAcceptedFile(DOCUMENT_FORMATS, { name: 'a.zip', type: 'application/x-zip-compressed' }),
    ).toBe(false);
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'report', type: 'application/zip' })).toBe(
      false,
    );
  });

  it('refuses a file reported as a CSV alias when its extension is not .csv', () => {
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'notes.txt', type: 'text/plain' })).toBe(false);
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'rows.tsv', type: 'text/x-csv' })).toBe(false);
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'rows', type: 'application/csv' })).toBe(false);
  });

  it('does not lend one format an alias of another', () => {
    // `application/zip` is an alias of the zip-based Office formats only, and
    // `text/plain` of CSV only.
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'old.doc', type: 'application/zip' })).toBe(
      false,
    );
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'report.pdf', type: 'text/plain' })).toBe(
      false,
    );
  });

  it('reads a .csv reported as the legacy Excel type as the CSV it is', () => {
    // `application/vnd.ms-excel` is both the canonical type of a `.xls` and
    // what Windows with Excel installed reports for a `.csv`. The extension
    // tells the two apart; the type alone names the legacy workbook.
    const csv = { name: 'rows.csv', type: 'application/vnd.ms-excel' };
    expect(isAcceptedFile(DOCUMENT_FORMATS, csv)).toBe(true);
    expect(formatOfFile(DOCUMENT_FORMATS, csv)?.mimeType).toBe('text/csv');
    const xls = { name: 'book.xls', type: 'application/vnd.ms-excel' };
    expect(formatOfFile(DOCUMENT_FORMATS, xls)?.mimeType).toBe('application/vnd.ms-excel');
  });

  it('honours an alias only on a list that holds its format', () => {
    // A slot a host narrowed to PDF takes no `.docx`, whatever it is reported as.
    const pdfOnly = DOCUMENT_FORMATS.filter((format) => format.label === 'PDF');
    expect(isAcceptedFile(pdfOnly, { name: 'r.docx', type: 'application/zip' })).toBe(false);
    expect(isAcceptedFile(pdfOnly, { name: 'r.csv', type: 'text/plain' })).toBe(false);
  });
});

describe('application/octet-stream says nothing, so the extension decides', () => {
  const octet = 'application/octet-stream';

  it.each(DOCUMENT_FILES)('accepts a %s file reported as application/octet-stream', (extension) => {
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: `file${extension}`, type: octet })).toBe(true);
  });

  it('refuses a file reported as application/octet-stream whose extension is no format', () => {
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'a.zip', type: octet })).toBe(false);
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'blob', type: octet })).toBe(false);
    expect(isAcceptedFile(IMAGE_FORMATS, { name: 'report.pdf', type: octet })).toBe(false);
  });

  it('reads the type without its parameters and case', () => {
    expect(
      isAcceptedFile(DOCUMENT_FORMATS, { name: 'r.docx', type: 'Application/Octet-Stream; x=1' }),
    ).toBe(true);
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
    expect(isAcceptedFile(DOCUMENT_FORMATS, { name: 'clip.mp4', type: 'video/mp4' })).toBe(false);
    expect(isAcceptedFile(IMAGE_FORMATS, { name: 'clip.mp4', type: 'video/mp4' })).toBe(false);
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
    // The asymmetry is real: the extract model declares JPEG and PNG, not WEBP.
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

  it('names a family once, and only the families the list keeps', () => {
    const wordOnly = DOCUMENT_FORMATS.filter((format) => format.label === 'Word');
    expect(acceptLabel(wordOnly)).toBe('Word');
    expect(formatLabels(wordOnly)).toEqual(['Word']);
    const legacyExcelAndPdf = DOCUMENT_FORMATS.filter((format) =>
      ['application/pdf', 'application/vnd.ms-excel'].includes(format.mimeType),
    );
    expect(acceptLabel(legacyExcelAndPdf)).toBe('PDF, Excel');
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

  it('names a stored Office file by its family', () => {
    expect(formatOfFilename(DOCUMENT_FORMATS, 'contract.docx')?.label).toBe('Word');
    expect(formatOfFilename(DOCUMENT_FORMATS, 'LEDGER.XLS')?.label).toBe('Excel');
    expect(formatOfFilename(DOCUMENT_FORMATS, 'deck.ppt')?.label).toBe('PowerPoint');
    expect(formatOfFilename(DOCUMENT_FORMATS, 'rows.csv')?.label).toBe('CSV');
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
      [WORD]: ['.docx'],
      'application/msword': ['.doc'],
      [EXCEL]: ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      [POWERPOINT]: ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'text/csv': ['.csv'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    });
  });

  it("carries no browser's other spelling of a format", () => {
    // react-dropzone takes a file whose name ends with a listed extension, so a
    // `.docx` reported as a zip already reaches the check. Listing the aliases
    // would open the OS picker to every `.zip` and `.txt` on the machine.
    const types = Object.keys(acceptMap(DOCUMENT_FORMATS));
    for (const [, alias] of ALIASES) {
      if (alias === 'application/vnd.ms-excel') continue; // the `.xls` format's own type
      expect(types).not.toContain(alias);
    }
    expect(acceptMap(DOCUMENT_FORMATS)['application/vnd.ms-excel']).toEqual(['.xls']);
  });

  it('returns a fresh object each call, so a caller cannot mutate the table', () => {
    const first = acceptMap(DOCUMENT_FORMATS);
    first['application/pdf'] = [];
    first['image/png']!.push('.gif');
    expect(acceptMap(DOCUMENT_FORMATS)['application/pdf']).toEqual(['.pdf']);
    expect(DOCUMENT_FORMATS.find((format) => format.label === 'PNG')?.extensions).toEqual(['.png']);
  });
});
