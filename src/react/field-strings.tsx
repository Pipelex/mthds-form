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
