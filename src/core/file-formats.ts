/**
 * What a `document` or an `image` slot actually accepts.
 *
 * **This is a client-side mirror of a runtime fact, and the fact was measured
 * rather than read off a list.** The wire says a slot's kind is `document` or
 * `image` and stops there — which bytes a runtime can decode is a property of
 * that runtime, not of the method — so the list has to live on this side, and
 * the only honest place is one module that says where it came from.
 *
 * There is no single enum to copy. In `pipelex`, what a slot accepts is derived
 * per model:
 *
 *   ModelSpec.supported_document_types = {"pdf","docx","pptx"} & set(inputs)
 *   ModelSpec.is_vision_supported      = "images" in inputs
 *
 * so the effective set is that vocabulary intersected with the **model deck's**
 * declared `inputs`. No model in the shipped deck declares `docx` or `pptx`;
 * every LLM entry is `["text", "images", "pdf"]`, and the default extract model
 * (`azure-document-intelligence`) is `["image", "pdf"]`.
 *
 * Confirmed by running each format end to end:
 *
 * | Format | PipeExtract | PipeLLM |
 * | --- | --- | --- |
 * | PDF  | yes | yes |
 * | PNG  | yes | n/a |
 * | JPEG | yes | n/a |
 * | WEBP | no  | no  |
 * | DOCX | no  | no — `does not support docx documents` |
 * | PPTX | no  | no — detected as `zip`, so it never even reaches the check |
 *
 * The gateway states its own list in the failure: *"Supported formats:
 * application/pdf, image/jpeg, image/png as base64 data URLs."*
 *
 * Images were measured the same way: PNG, JPEG and WEBP pass; BMP and TIFF fail
 * on the provider's image enum; GIF fails too, though it is *in* that enum — it
 * arrives at the provider as a document block rather than an image one, which
 * looks like a routing bug upstream rather than an unsupported format.
 *
 * **A document slot's PNG and JPEG only work in an extract pipe.** The
 * descriptor never says which operator consumes the slot, so this table cannot
 * distinguish them; it matches the extract model's declared inputs, because
 * extraction is the operator that actually reads a document's bytes.
 *
 * What was here before was built on `DocumentFormat` (PDF/DOCX/PPTX), an enum
 * that is referenced nowhere in the runtime outside commented-out code and is
 * being deleted. A dead enum is the worst kind of source: it reads exactly like
 * a live one.
 *
 * A stale entry here is worse than no list at all, because it refuses a file the
 * runtime would have taken. If the deck grows a format, this table moves with it.
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
  mimeType: string;
  /** Leading dot, lowercase — the shape a file input's `accept` wants. */
  extensions: string[];
  /** How the format is named to a user, uppercase. */
  label: string;
}

/**
 * What a `document` slot takes: PDF, plus the two image formats the extract
 * model reads as a single-page document.
 */
export const DOCUMENT_FORMATS: readonly FileFormat[] = [
  { mimeType: 'application/pdf', extensions: ['.pdf'], label: 'PDF' },
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

/** `"PDF, JPG, PNG"` - the hint shown under a dropzone. */
export function acceptLabel(formats: readonly FileFormat[]): string {
  return formats.map((format) => format.label).join(', ');
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
 * Whether a picked file is one of these formats.
 *
 * Checks the MIME type first and falls back to the extension, because a
 * browser's `File.type` is empty often enough to matter: an OS with no handler
 * registered for `.docx` reports `''`, and refusing that file would be refusing
 * a valid one over a fact about the user's machine. A wrong-but-present MIME
 * type is still a rejection — that is the case this exists for.
 *
 * It takes the field's own list, never the kind's, so a slot a host narrowed
 * refuses exactly what its hint no longer names.
 */
export function isAcceptedFile(
  formats: readonly FileFormat[],
  file: { name: string; type: string },
): boolean {
  const mimeType = normalizeMimeType(file.type);
  if (mimeType) return formats.some((format) => format.mimeType === mimeType);
  return formatOfFilename(formats, file.name) !== undefined;
}

/**
 * The accept map a file input wants: MIME type to extensions.
 *
 * Shaped for `react-dropzone`'s `accept`, which is the same shape the DOM's
 * `accept` attribute is built from. Listing extensions BESIDE the MIME type is
 * what makes the empty-`File.type` case above work in the OS picker too.
 */
export function acceptMap(formats: readonly FileFormat[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const format of formats) map[format.mimeType] = [...format.extensions];
  return map;
}
