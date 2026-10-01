/**
 * The controls' strings in English: the package's defaults, and the pack every unknown or missing
 * locale falls back to (see `fieldStringsFor` in `./index.ts`).
 */
import type { FieldStrings } from '../field-strings';

/** `512 bytes`, `36 KB`, `1.4 MB` — binary multiples, as a file manager counts them. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes === 1 ? '1 byte' : `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const EN_FIELD_STRINGS: FieldStrings = {
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
  uploadUnavailable: 'Files cannot be uploaded here. Paste a link to the file instead.',
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
  downloadIncomplete: (names) =>
    `${names.length === 1 ? 'One file' : `${names.length} files`} could not be saved: ${names.join(', ')}`,
  downloadFile: (name) => `Download ${name}`,
  downloadFileFailed: 'The file could not be saved',
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
  includeOptional: 'Include',
};
