/**
 * What a `document` or an `image` slot actually accepts.
 *
 * **This is a client-side mirror of a runtime fact.** The wire says a slot's
 * kind is `document` or `image` and stops there — which bytes a runtime can
 * read is a property of that runtime, not of the method — so the list has to
 * live on this side, and the only honest place is one module that says where
 * it came from.
 *
 * **A document slot takes what the hosted runtime runs.** That is PDF, the
 * Office formats (Word, Excel and PowerPoint, in their current form and their
 * 97-2003 one), CSV, and the two image formats the extract model reads as a
 * single-page document. Each reaches a step its own way:
 *
 *   - a model (`PipeLLM`) reads an Office file through the PDF copy the hosted
 *     converter makes of it when the step needs one;
 *   - extraction (`PipeExtract`, Azure Document Intelligence by default) reads
 *     the original Word, Excel or PowerPoint file, and PDF, JPG and PNG as
 *     before;
 *   - `PipeStructure` reads a spreadsheet, an Excel workbook (`.xlsx`) or a
 *     CSV file, as rows;
 *   - `PipeDocGen` edits an Excel workbook handed to it as its template.
 *
 * The set the runtime converts is `CONVERTIBLE_FORMAT_KEYS` in `pipelex`
 * (`pipelex/tools/document_conversion/document_converter_protocol.py`). The
 * OpenDocument formats are in it and are deliberately not listed here yet;
 * adding them is three rows below and their zip aliases.
 *
 * **A host whose runtime has no converter narrows this list** with
 * `narrowFileFormats`, the seam built for exactly that: a runtime configured
 * with `[runtime.document_conversion] backend = "none"`, the default of a local
 * install, cannot hand a model an Office file, and its form should not offer
 * one. The kernel's table is the widest a runtime takes; a host takes it down,
 * never up.
 *
 * **The form does not judge the step that consumes the slot.** The descriptor
 * says a slot is a `document` and stops there: it does not say whether a model,
 * an extraction or a table read consumes it. A CSV handed to a `PipeLLM`, or a
 * legacy `.xls` handed to a `PipeStructure`, is therefore let through here and
 * refused by the runtime's pre-run consumer check, before any model is paid
 * for. That is where every other unreadable pairing is refused, so the form
 * does not second-guess it.
 *
 * Superseded on 2026-11-20: the table here used to record a measurement from
 * before the hosted runtime converted Office files, when DOCX and PPTX failed
 * on every path and a document slot took PDF, JPG and PNG alone.
 *
 * **The image slot's list was measured.** PNG, JPEG and WEBP pass through the
 * vision path; BMP and TIFF fail on the provider's image enum; GIF fails too,
 * though it is *in* that enum — it arrives at the provider as a document block
 * rather than an image one, which looks like a routing bug upstream rather than
 * an unsupported format. A document slot's JPG and PNG work in an extract pipe,
 * whose model declares them, and WEBP does not, which is why the two slots'
 * image formats differ.
 *
 * A stale entry here is worse than no list at all, because it refuses a file
 * the runtime would have taken, or advertises one it cannot. If the runtime
 * grows a format, this table moves with it.
 *
 * **The table is the source; a field's `formats` is what gets read.** The
 * helpers below take a format LIST rather than a kind, because what a given
 * slot accepts can be narrower than its kind: a host whose server takes only
 * some of these types narrows the field tree once (`narrowFileFormats`), and
 * the dropzone's hint, its picker filter and its check all read the narrowed
 * list, so the three cannot disagree with each other or with that server.
 *
 * Pure data and pure functions over it. No React, no ajv, nothing imported.
 */

/** One accepted format: its MIME type and the extensions that carry it. */
export interface FileFormat {
  /** The canonical type: the one the runtime and a store give this format. */
  mimeType: string;
  /** Leading dot, lowercase — the shape a file input's `accept` wants. */
  extensions: string[];
  /**
   * How the format is named to a user: its family (`Word`, `Excel`), so the
   * current and the 97-2003 format of one application share a name.
   */
  label: string;
  /**
   * The other types a browser reports for this format, depending on the
   * user's machine rather than on the file: a machine with no Office
   * registered reports a `.docx` as `application/zip`, and Windows with Excel
   * installed reports a `.csv` as `application/vnd.ms-excel`. A file reported
   * as one of these is this format only when its extension is one of
   * `extensions` too, so a `.zip` reported as `application/zip` is still no
   * document. `narrowFileFormats` and `acceptMap` read `mimeType` alone.
   */
  alsoReportedAs?: readonly string[];
}

/** What a browser may report for a zip-based Office file on a machine with no Office. */
const ZIP_TYPES = ['application/zip', 'application/x-zip-compressed'] as const;

/**
 * What a `document` slot takes: PDF, the Office formats in their current and
 * 97-2003 forms, CSV, and the two image formats the extract model reads as a
 * single-page document.
 */
export const DOCUMENT_FORMATS: readonly FileFormat[] = [
  { mimeType: 'application/pdf', extensions: ['.pdf'], label: 'PDF' },
  {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
    label: 'Word',
    alsoReportedAs: ZIP_TYPES,
  },
  { mimeType: 'application/msword', extensions: ['.doc'], label: 'Word' },
  {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['.xlsx'],
    label: 'Excel',
    alsoReportedAs: ZIP_TYPES,
  },
  { mimeType: 'application/vnd.ms-excel', extensions: ['.xls'], label: 'Excel' },
  {
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extensions: ['.pptx'],
    label: 'PowerPoint',
    alsoReportedAs: ZIP_TYPES,
  },
  { mimeType: 'application/vnd.ms-powerpoint', extensions: ['.ppt'], label: 'PowerPoint' },
  {
    mimeType: 'text/csv',
    extensions: ['.csv'],
    label: 'CSV',
    alsoReportedAs: ['application/vnd.ms-excel', 'text/plain', 'application/csv', 'text/x-csv'],
  },
  { mimeType: 'image/jpeg', extensions: ['.jpg', '.jpeg'], label: 'JPG' },
  { mimeType: 'image/png', extensions: ['.png'], label: 'PNG' },
];

/**
 * What an `image` slot takes: PNG, JPEG, WEBP — all three measured through the
 * vision path.
 *
 * `.jpg` and `.jpeg` both ride `image/jpeg`. `JPG` is the label because that is
 * the spelling the runtime uses, but a file named `.jpeg` is the same bytes and
 * must not be refused over its spelling.
 */
export const IMAGE_FORMATS: readonly FileFormat[] = [
  { mimeType: 'image/png', extensions: ['.png'], label: 'PNG' },
  { mimeType: 'image/jpeg', extensions: ['.jpg', '.jpeg'], label: 'JPG' },
  { mimeType: 'image/webp', extensions: ['.webp'], label: 'WEBP' },
];

/**
 * The source table: every format a slot of this kind can take, before a host
 * narrows it. `buildRunFields` stamps this onto each `document` and `image`
 * field as its `formats`, and everything downstream reads the field's list
 * rather than coming back here - which is what lets a host narrow one list and
 * have the hint, the picker and the check all follow it.
 */
export function formatsForKind(kind: 'document' | 'image'): readonly FileFormat[] {
  return kind === 'image' ? IMAGE_FORMATS : DOCUMENT_FORMATS;
}

/**
 * A MIME type as the table spells it: no parameters, no surrounding space,
 * lowercase. `APPLICATION/PDF; version=1.7` is `application/pdf`.
 */
export function normalizeMimeType(type: string): string {
  return type.split(';', 1)[0]?.trim().toLowerCase() ?? '';
}

/**
 * The type that says nothing about a file. A browser or a store gives it to
 * bytes it could not identify, so it is read as no type at all and the
 * extension decides, which is how the runtime reads it too.
 */
const GENERIC_MIME_TYPE = 'application/octet-stream';

/**
 * The formats' names, each once, in the list's order: the current and the
 * 97-2003 format of one application share a label, and a person is told the
 * family once. What the hint, the refusal and the file picker's line name.
 */
export function formatLabels(formats: readonly FileFormat[]): string[] {
  return [...new Set(formats.map((format) => format.label))];
}

/** `"PDF, Word, Excel, PowerPoint, CSV, JPG, PNG"` - the hint shown under a dropzone. */
export function acceptLabel(formats: readonly FileFormat[]): string {
  return formatLabels(formats).join(', ');
}

/**
 * The format a filename's extension names, among these formats, or `undefined`
 * when it names none of them. Case-insensitive, because `PHOTO.PNG` is a PNG.
 */
export function formatOfFilename(
  formats: readonly FileFormat[],
  filename: string,
): FileFormat | undefined {
  const name = filename.toLowerCase();
  return formats.find((format) => format.extensions.some((ext) => name.endsWith(ext)));
}

/**
 * The format a file is, among these formats, or `undefined` when it is none of
 * them: what `isAcceptedFile` answers, and which format it was taken as.
 *
 * - **No type**, or `application/octet-stream`: the extension decides, because
 *   a browser's `File.type` is empty often enough to matter (an OS with no
 *   handler registered for a format reports `''`), and refusing that file
 *   would be refusing a valid one over a fact about the user's machine.
 * - **A type the extension's format answers to**, its canonical type or one of
 *   its `alsoReportedAs`: that format. This is how a `.csv` that Windows
 *   reports as `application/vnd.ms-excel` is read as the CSV it is rather than
 *   as the legacy Excel format that type is canonical for.
 * - **Otherwise, the format whose canonical type it is**, whatever the
 *   extension. A wrong-but-present type is still a refusal — a `notes.pdf`
 *   reported as `text/plain` is refused — and an alias alone never accepts a
 *   file: a `.zip` reported as `application/zip` is no document.
 */
export function formatOfFile(
  formats: readonly FileFormat[],
  file: { name: string; type: string },
): FileFormat | undefined {
  const mimeType = normalizeMimeType(file.type);
  const named = formatOfFilename(formats, file.name);
  if (!mimeType || mimeType === GENERIC_MIME_TYPE) return named;
  if (named && (named.mimeType === mimeType || named.alsoReportedAs?.includes(mimeType))) {
    return named;
  }
  return formats.find((format) => format.mimeType === mimeType);
}

/**
 * Whether a picked file is one of these formats: `formatOfFile` found one.
 *
 * It takes the field's own list, never the kind's, so a slot a host narrowed
 * refuses exactly what its hint no longer names.
 */
export function isAcceptedFile(
  formats: readonly FileFormat[],
  file: { name: string; type: string },
): boolean {
  return formatOfFile(formats, file) !== undefined;
}

/**
 * The accept map a file input wants: MIME type to extensions.
 *
 * Shaped for `react-dropzone`'s `accept`, which is the same shape the DOM's
 * `accept` attribute is built from. Listing extensions BESIDE the MIME type is
 * what makes the empty-`File.type` case above work in the OS picker too.
 *
 * **It carries the canonical types alone, never `alsoReportedAs`, and that is
 * enough.** react-dropzone flattens the map into one list of types and
 * extensions and takes a dropped or picked file when its type is in the list
 * OR its name ends with one of the extensions (`attr-accept`). So a `.docx`
 * reported as `application/zip` already passes on its extension and reaches
 * `isAcceptedFile`, which decides. Listing the aliases would add nothing for
 * those files and would widen the OS picker to every `.zip` and `.txt` on the
 * machine, files the check then refuses.
 */
export function acceptMap(formats: readonly FileFormat[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const format of formats) map[format.mimeType] = [...format.extensions];
  return map;
}
