/**
 * The controls' strings in English: the package's defaults, and the pack every unknown or missing
 * locale falls back to (see `fieldStringsFor` in `./index.ts`).
 */
import type { FieldStrings } from '../field-strings';
import { calendarDaysBefore, inCurrentYear } from './calendar';

/** `512 bytes`, `36 KB`, `1.4 MB` — binary multiples, as a file manager counts them. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes === 1 ? '1 byte' : `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Lists and dates come from the platform's `Intl`, in British English, which
// writes a date day first ("17 Oct") and a time on the 24-hour clock.
const AND = new Intl.ListFormat('en-GB', { type: 'conjunction' });
const OR = new Intl.ListFormat('en-GB', { type: 'disjunction' });
const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const DAY_YEAR = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** "Today, 10:42", "Yesterday", "17 Oct", or "17 Oct 2025" for another year. */
function formatFileDate(date: Date): string {
  const days = calendarDaysBefore(date);
  if (days === 0) return `Today, ${TIME.format(date)}`;
  if (days === 1) return 'Yesterday';
  return inCurrentYear(date) ? DAY.format(date) : DAY_YEAR.format(date);
}

/** `a.pdf, b.pdf and c.pdf`, or `a.pdf, b.pdf, c.pdf and 4 more` when some are not named. */
function someNames(names: readonly string[], more: number): string {
  return AND.format(more > 0 ? [...names, `${more} more`] : names);
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
  downloadPdf: 'Download PDF',
  downloadPdfBusy: 'Preparing the PDF…',
  downloadPdfFailed: 'The PDF could not be made',
  pageLoading: 'Loading the page…',
  downloadHtml: 'Download HTML',
  fileNameTitle: 'File name',
  fileNameCancel: 'Cancel',
  fileNameConfirm: 'Download',
  viewRendered: 'Result',
  viewJson: 'JSON',
  copyJson: 'Copy the JSON',
  resultViewGroup: 'Result view',
  yes: 'Yes',
  no: 'No',
  unsupportedFileType: (formats) =>
    `That file type is not supported. Accepted formats: ${formats}.`,
  dropFilesOrBrowse: 'Drop files or click to browse',
  dropFilesToAdd: 'Drop to add the files',
  addFilesAria: (label) => (label ? `Add files to ${label}` : 'Add files'),
  filesAdded: (count) => (count === 1 ? '1 file added' : `${count} files added`),
  filesRefused: (names, more, formats) =>
    `${names.length + more === 1 ? 'Not added, because its' : 'Not added, because their'} file type is not supported: ${someNames(names, more)}. Accepted formats: ${formats}.`,
  filesLeftOut: (names, more, fitted) => {
    const these = names.length + more === 1 ? 'this file was' : 'these files were';
    const room =
      fitted === 0
        ? 'The list is full'
        : `The list had room for ${fitted === 1 ? '1 more file' : `${fitted} more files`}`;
    return `${room}, so ${these} not added: ${someNames(names, more)}.`;
  },
  oneFileOnly: 'This field takes one file.',
  oneFileOnlyInList: "This field takes one file. Drop several files on the list's drop area.",
  hideOptionalFields: 'Hide optional fields',
  hideOptionalInputs: 'Hide optional inputs',
  optionalFieldsCount: (count) => (count === 1 ? '1 optional field' : `${count} optional fields`),
  optionalInputsCount: (count) => (count === 1 ? '1 optional input' : `${count} optional inputs`),
  requiredField: 'Required',
  incompleteField: 'Incomplete: fill in its required fields',
  uploadFailed: 'This file could not be uploaded. Try again.',
  chooseFromSource: "Choose from your team's files",
  chooseFromSourceAria: (label) =>
    label ? `Choose from your team's files for ${label}` : "Choose from your team's files",
  filePickerTitle: "Your team's files",
  filePickerTakes: (formats) => `Showing ${AND.format(formats)} files, which this input takes`,
  filePickerSearch: 'Search files',
  filePickerSearchPlaceholder: 'Search by name',
  filePickerScope: 'Whose files',
  filePickerMine: 'Mine',
  filePickerEveryone: 'Everyone',
  filePickerUse: (count, name) => {
    if (count === 0) return 'Choose a file';
    if (count === 1 && name) return `Use ${name}`;
    return count === 1 ? 'Use 1 file' : `Use ${count} files`;
  },
  filePickerLoading: 'Loading your files…',
  filePickerFailed: "Couldn't load your files.",
  filePickerNoMatch: 'No files match.',
  filePickerClearSearch: 'Clear search',
  filePickerNoneTeam: (formats) => `Your team has no ${OR.format(formats)} files yet.`,
  filePickerNoneMine: (formats) => `You haven't added or made any ${OR.format(formats)} files yet.`,
  filePickerShowEveryone: "Show everyone's",
  filePickerUpload: 'Upload a file',
  filePickerShown: (count) => (count === 1 ? '1 file' : `${count} files`),
  testFile: 'Test file',
  fileSize: formatBytes,
  fileDate: formatFileDate,
  fillWithExample: 'Fill with an example',
  examplesTitle: 'Examples',
  examplesHint: 'Choosing one fills the form. Nothing runs until you run it.',
  examplesLoading: 'Loading the examples…',
  examplesFailed: "Couldn't load the examples.",
  examplesNone: 'No examples yet. Run it, then save the run as an example.',
  examplesShown: (count) => (count === 1 ? '1 example' : `${count} examples`),
  replaceEnteredTitle: 'Replace what you entered?',
  replaceEnteredDescription: (name) =>
    `Filling the form with “${name}” replaces every value in it.`,
  replaceEnteredConfirm: 'Replace',
  exampleActions: (name) => `Actions for ${name}`,
  renameExample: 'Rename',
  deleteExample: 'Delete',
  renameExampleTitle: 'Rename the example',
  exampleName: 'Name',
  renaming: 'Renaming…',
  renameFailed: "Couldn't rename the example.",
  deleteExampleTitle: (name) => `Delete “${name}”?`,
  deleteExampleDescription: 'This cannot be undone.',
  deleting: 'Deleting…',
  deleteFailed: "Couldn't delete the example.",
  close: 'Close',
  cancel: 'Cancel',
  save: 'Save',
  tryAgain: 'Try again',
  showMore: 'Show more',
  loadingMore: 'Loading more…',
  loadMoreFailed: "Couldn't load more.",
};
