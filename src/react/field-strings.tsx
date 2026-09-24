'use client';

/**
 * The controls' i18n seam. The field controls are kernel code - they cannot
 * import `next-intl` - so every user-visible string they render comes through
 * this typed contract, with English defaults baked in. A host app injects its
 * own values (a next-intl host bridges them in its own `field-strings-intl.tsx`)
 * by mounting `FieldStringsProvider` above the form; stories and tests run on
 * the defaults.
 *
 * Count-bearing messages are FUNCTIONS, not templates: the default English
 * pluralization lives here, and an injecting host applies its own locale's
 * rules (ICU plurals under next-intl, for instance).
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export interface FieldStrings {
  /** Badge on an optional field's header row. */
  optionalBadge: string;
  selectPlaceholder: string;
  typeValuePlaceholder: string;
  writeHerePlaceholder: string;
  /** Helper under the raw-JSON escape hatch. */
  jsonHint: string;
  decrease: string;
  increase: string;
  noItemsYet: string;
  addItem: string;
  removeItemAria: (index: number) => string;
  itemsCount: (count: number) => string;
  /** The same badge for a list the method gave an exact count (`Concept[N]`). */
  itemsCountOf: (count: number, total: number) => string;
  /** What a record's table cell says when none of its fields can name it. */
  fieldsCount: (count: number) => string;
  uploading: string;
  dropToUpload: string;
  dropOrBrowse: string;
  pasteUrlInstead: string;
  /**
   * The placeholder in the URL a person may paste instead of uploading. It names
   * the web's own scheme only: a host whose runner also takes its own storage
   * references can say so by overriding it, and no default shows an end user a
   * platform's storage scheme.
   */
  urlPlaceholder: string;
  /**
   * The accessible name of that URL input, given the field's label as the form
   * shows it (empty for a list row, whose index labels it). The field's label is
   * bound to the file input, so without this the placeholder was the only thing
   * a screen reader announced here.
   */
  fileUrlAria: (label: string) => string;
  /**
   * The title of an attached file's card when the value carries no filename.
   * True of a pasted link as well as of an upload, which "Uploaded file" was not.
   */
  uploadedFile: string;
  /**
   * What names a file carried INSIDE its own URL (a `data:` URL), where a
   * reference would otherwise be printed: its format and its decoded size. The
   * string itself is forty thousand characters of base64 and says nothing.
   */
  encodedFileSummary: (format: string, bytes: number) => string;
  preview: string;
  removeFileAria: string;
  previewUnavailablePdf: string;
  /**
   * What a result slot the run resolved as an absence SHOWS — a dash, not a
   * sentence. Beside forty values in a grid, "not provided" repeated is louder
   * than the data; a dash reads as the blank it is.
   */
  resultAbsent: string;
  /**
   * What that dash SAYS, to a screen reader.
   *
   * The two are separate because a glyph and a sentence are answers to different
   * questions. A table column of hyphens read aloud is "hyphen, hyphen, hyphen",
   * which is noise rather than information — so the dash is `aria-hidden` and
   * this rides beside it, visually hidden.
   */
  resultAbsentDescription: string;
  /**
   * Shown above the raw value when a result cannot be laid out because the
   * artifacts describing it are absent. It names the CAUSE — the descriptor,
   * not the data — because the value is right there underneath and a reader
   * who is not told why will assume the view is broken.
   */
  resultUndescribed: string;
  /** The control that opens a result table row to show the rest of the record. */
  toggleRowDetails: (index: number) => string;
  /** The (visually hidden) header of the column those controls sit in. */
  rowDetailsColumn: string;
  /** The control that puts a file's whole URL on the clipboard. */
  copyUrl: string;
  /** The copy control beside any text value, markdown or not. */
  copyText: string;
  /** The download control's label. */
  download: string;
  /** Announced while the files are being fetched. */
  downloading: string;
  /** The result panel's two views, and the control that copies the payload. */
  viewRendered: string;
  viewJson: string;
  copyJson: string;
  resultViewGroup: string;
  yes: string;
  no: string;
  /**
   * Shown when a picked file is not a format this slot accepts. Takes the
   * slot's own formats as the hint names them (`PNG, JPG`), after any narrowing
   * a host applied, so the message names what WOULD have worked - "not
   * accepted" on its own leaves the user guessing at the list they just failed.
   */
  unsupportedFileType: (formats: string) => string;
  /** The optional-entries disclosure ("field" inside a concept, "input" at top level). */
  hideOptionalFields: string;
  hideOptionalInputs: string;
  optionalFieldsCount: (count: number) => string;
  optionalInputsCount: (count: number) => string;
}

/** `512 bytes`, `36 KB`, `1.4 MB` — binary multiples, as a file manager counts them. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes === 1 ? '1 byte' : `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const DEFAULT_FIELD_STRINGS: FieldStrings = {
  optionalBadge: 'optional',
  selectPlaceholder: 'Select…',
  typeValuePlaceholder: 'Type a value…',
  writeHerePlaceholder: 'Write here…',
  jsonHint: 'Enter this value as raw JSON.',
  decrease: 'Decrease',
  increase: 'Increase',
  noItemsYet: 'No items yet',
  addItem: 'Add item',
  removeItemAria: (index) => `Remove item ${index}`,
  itemsCount: (count) => (count === 1 ? '1 item' : `${count} items`),
  itemsCountOf: (count, total) => `${count} of ${total} ${total === 1 ? 'item' : 'items'}`,
  fieldsCount: (count) => (count === 1 ? '1 field' : `${count} fields`),
  uploading: 'Uploading…',
  dropToUpload: 'Drop to upload',
  dropOrBrowse: 'Drop a file or click to browse',
  pasteUrlInstead: 'paste a URL instead',
  urlPlaceholder: 'https://…',
  fileUrlAria: (label) => (label ? `Link to the file for ${label}` : 'Link to the file'),
  uploadedFile: 'Attached file',
  encodedFileSummary: (format, bytes) => `${format} · ${formatBytes(bytes)}`,
  preview: 'Preview',
  removeFileAria: 'Remove file',
  previewUnavailablePdf: 'Preview unavailable - open to view.',
  // U+002D HYPHEN-MINUS, deliberately: not an en dash, not an em dash.
  resultAbsent: '-',
  resultAbsentDescription: 'Not provided',
  resultUndescribed: 'No output descriptor for this pipe — showing the raw value.',
  toggleRowDetails: (index) => `Show or hide the details of row ${index}`,
  rowDetailsColumn: 'Details',
  copyUrl: 'Copy the URL',
  copyText: 'Copy the text',
  download: 'Download',
  downloading: 'Downloading…',
  viewRendered: 'Result',
  viewJson: 'JSON',
  copyJson: 'Copy the JSON',
  resultViewGroup: 'Result view',
  yes: 'Yes',
  no: 'No',
  unsupportedFileType: (formats) =>
    `That file type is not supported. Accepted formats: ${formats}.`,
  hideOptionalFields: 'Hide optional fields',
  hideOptionalInputs: 'Hide optional inputs',
  optionalFieldsCount: (count) => (count === 1 ? '1 optional field' : `${count} optional fields`),
  optionalInputsCount: (count) => (count === 1 ? '1 optional input' : `${count} optional inputs`),
};

const FieldStringsContext = createContext<FieldStrings>(DEFAULT_FIELD_STRINGS);

/** Inject host-app strings over the English defaults for every control below. */
export function FieldStringsProvider({
  strings,
  children,
}: {
  strings: Partial<FieldStrings>;
  children: ReactNode;
}) {
  const merged = useMemo(() => ({ ...DEFAULT_FIELD_STRINGS, ...strings }), [strings]);
  return <FieldStringsContext.Provider value={merged}>{children}</FieldStringsContext.Provider>;
}

/** The strings the nearest provider supplies (English defaults when none does). */
export function useFieldStrings(): FieldStrings {
  return useContext(FieldStringsContext);
}
