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
import { EN_FIELD_STRINGS } from './locales/en';
import { fieldStringsFor } from './locales';

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
   * What a file field says in place of its dropzone when its host has no way to
   * store a file, so a link is the only way in. The field's format hint follows
   * it, because the link still has to point at a file the runtime can read.
   */
  uploadUnavailable: string;
  /**
   * The placeholder in the URL a person may paste instead of uploading. It names
   * the web's own scheme only: a host whose runner also takes its own storage
   * references can say so by overriding it, and no default shows an end user a
   * platform's storage scheme.
   */
  urlPlaceholder: string;
  /**
   * The accessible name of that URL input, given the field's label as the form
   * shows it. The field's label is bound to the file input, so without this the
   * placeholder was the only thing a screen reader announced here.
   *
   * The label is EMPTY inside a list row: the list drops each row's label, and
   * the row number it shows instead is a bare glyph tied to no control. So every
   * row's input currently carries the same generic name, and giving rows
   * distinct names is a separate piece of work on the list control.
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
  /**
   * What the whole-result download says when some files did not arrive: the
   * ones no URL could be found for, and the ones the delivery reported. Takes
   * the names the files would have been saved under.
   */
  downloadIncomplete: (names: readonly string[]) => string;
  /**
   * The button beside each file that saves that one file, given the name it
   * saves under: a gallery of buttons all called "Download" would leave a
   * screen-reader user unable to tell which file each one saves.
   */
  downloadFile: (name: string) => string;
  /** What that button says when the file did not arrive. */
  downloadFileFailed: string;
  /** The control on an HTML page that saves it as a PDF, in one click. */
  downloadPdf: string;
  /** What that control says while the PDF is being made. */
  downloadPdfBusy: string;
  /** What that control says when the PDF could not be made or saved. */
  downloadPdfFailed: string;
  /**
   * Shown in place of an HTML page for the moment the stored pictures it names
   * are being resolved through the host.
   */
  pageLoading: string;
  /**
   * The page's own HTML download, beside "Download PDF" on a result that is
   * one page, where a bare "Download" would not say which of the two it saves.
   */
  downloadHtml: string;
  /**
   * The dialog that asks for a download's name, when the host turns
   * `downloads.askFileName` on: its title, which also names the field, and its
   * two buttons.
   */
  fileNameTitle: string;
  fileNameCancel: string;
  fileNameConfirm: string;
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

  // A list of files takes several files at once (docs/upload-seam.md, "A list
  // of files takes several files at once").
  /** What a list of files' drop area says, under its rows. */
  dropFilesOrBrowse: string;
  /** What it says while files are dragged over it. */
  dropFilesToAdd: string;
  /**
   * The accessible name of the file input inside that area, given the list's
   * label as the form shows it, so it says which list the files go to.
   */
  addFilesAria: (label: string) => string;
  /** Announced, visually hidden, once a batch is placed: how many files went in. */
  filesAdded: (count: number) => string;
  /**
   * The files of a batch the list did not take because the slot does not accept
   * their type: the first few names, how many more there were, and the slot's
   * formats as the hint names them (`PDF, JPG, PNG`).
   */
  filesRefused: (names: readonly string[], more: number, formats: string) => string;
  /**
   * The files of a batch a bounded list had no room for: the first few names,
   * how many more there were, and how many of the batch did fit.
   */
  filesLeftOut: (names: readonly string[], more: number, fitted: number) => string;
  /** What a single file field says when several files are dropped on it at once. */
  oneFileOnly: string;
  /** The same, on a row of a list that has a drop area for several files. */
  oneFileOnlyInList: string;

  /** The optional-entries disclosure ("field" inside a concept, "input" at top level). */
  hideOptionalFields: string;
  hideOptionalInputs: string;
  optionalFieldsCount: (count: number) => string;
  optionalInputsCount: (count: number) => string;
  /**
   * The mark `MethodForm` puts on an input the run needs and does not have,
   * once the person has tried to run.
   */
  requiredField: string;
  /**
   * The mark on an optional input that was started but is not complete, once
   * the person has tried to run: a started structure owes its concept every
   * required field.
   */
  incompleteField: string;
  /** What a file field says when the host's `uploadFile` rejected its file. */
  uploadFailed: string;

  // The file source (docs/sources.md): the row under a file field's controls
  // and the sheet it opens.
  /** The row under a file field's own controls that opens the team's files. */
  chooseFromSource: string;
  /**
   * That row's accessible name, given the field's label as the form shows it,
   * so each file field's row says which field it fills. It must contain the
   * row's visible words, which a voice-control user says to press it.
   */
  chooseFromSourceAria: (label: string) => string;
  /** The sheet's title. */
  filePickerTitle: string;
  /** The line under the title, given the field's formats as the hint names them (`PDF`, `JPG`). */
  filePickerTakes: (formats: readonly string[]) => string;
  /** The search's visually hidden label, and its placeholder. */
  filePickerSearch: string;
  filePickerSearchPlaceholder: string;
  /** The Mine and Everyone switch: its accessible name and its two choices. */
  filePickerScope: string;
  filePickerMine: string;
  filePickerEveryone: string;
  /**
   * The sheet's one primary button, given how many files are chosen and, when
   * one is, its name: "Use INV-2291.pdf", "Use 3 files", and with none chosen,
   * the words it shows while it is disabled.
   */
  filePickerUse: (count: number, name: string | undefined) => string;
  /** Announced while the first page is read. */
  filePickerLoading: string;
  /** The first page could not be read. Try again follows it. */
  filePickerFailed: string;
  /** The search matched nothing, said once the list has ended. Clear search follows it. */
  filePickerNoMatch: string;
  filePickerClearSearch: string;
  /** The whole team holds no file of the field's formats. */
  filePickerNoneTeam: (formats: readonly string[]) => string;
  /** The person holds no file of the field's formats. Show everyone's follows it. */
  filePickerNoneMine: (formats: readonly string[]) => string;
  filePickerShowEveryone: string;
  /** Closes the picker on the field's own upload, from an empty list. */
  filePickerUpload: string;
  /** Announced once rows are shown: how many. */
  filePickerShown: (count: number) => string;
  /** What leads a test file's second line, in place of a chip. */
  testFile: string;
  /** A file's size on its row: `340 KB`. */
  fileSize: (bytes: number) => string;
  /** When a file was stored, on its row: "Today, 10:42", "Yesterday", "17 Oct". */
  fileDate: (date: Date) => string;

  // The example source (docs/sources.md): "Fill with an example" and its list.
  /** The control that opens the method's examples. */
  fillWithExample: string;
  /** The examples sheet's title, and the line under it. */
  examplesTitle: string;
  examplesHint: string;
  /** Announced while the first page is read. */
  examplesLoading: string;
  /** The examples could not be read. Try again follows it. */
  examplesFailed: string;
  /** The method has no example yet. */
  examplesNone: string;
  /** Announced once rows are shown: how many. */
  examplesShown: (count: number) => string;
  /** The question asked before an example replaces what the person entered. */
  replaceEnteredTitle: string;
  /** What it says under the question, given the example's name. */
  replaceEnteredDescription: (name: string) => string;
  replaceEnteredConfirm: string;
  /** The accessible name of an example row's menu, given the example's name. */
  exampleActions: (name: string) => string;
  renameExample: string;
  deleteExample: string;
  /** The rename dialog: its title, the name field's label, and its button while it works. */
  renameExampleTitle: string;
  exampleName: string;
  renaming: string;
  /** The rename failed; the dialog stays open with the new name, and Save becomes Try again. */
  renameFailed: string;
  /** The question asked before deleting, given the example's name, and what it says under it. */
  deleteExampleTitle: (name: string) => string;
  deleteExampleDescription: string;
  deleting: string;
  /** The delete failed; the question stays open, and Delete becomes Try again. */
  deleteFailed: string;

  // What both lists share.
  /** Closes a sheet or a dialog. */
  close: string;
  cancel: string;
  save: string;
  tryAgain: string;
  /** Reads the next page of a list. */
  showMore: string;
  /** Said beside the wait for the next page. */
  loadingMore: string;
  /** The next page could not be read; the rows already shown stay. Try again follows it. */
  loadMoreFailed: string;
}

/** The English strings, which every control falls back to. Kept under this name for existing hosts. */
export const DEFAULT_FIELD_STRINGS: FieldStrings = EN_FIELD_STRINGS;

const FieldStringsContext = createContext<FieldStrings>(DEFAULT_FIELD_STRINGS);

/**
 * Set the strings every control below speaks. `locale` picks a language pack by its code (`fr`,
 * `fr-FR`, `en-GB`…; an unknown one falls back to English), and `strings` overrides single keys
 * on top of it. Both are optional: with neither, the controls speak English.
 */
export function FieldStringsProvider({
  locale,
  strings,
  children,
}: {
  locale?: string;
  strings?: Partial<FieldStrings>;
  children: ReactNode;
}) {
  const merged = useMemo(() => ({ ...fieldStringsFor(locale), ...strings }), [locale, strings]);
  return <FieldStringsContext.Provider value={merged}>{children}</FieldStringsContext.Provider>;
}

/** The strings the nearest provider supplies (English defaults when none does). */
export function useFieldStrings(): FieldStrings {
  return useContext(FieldStringsContext);
}
