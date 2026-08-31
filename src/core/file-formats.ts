/**
 * What a `document` or an `image` slot actually accepts.
 *
 * **This is a mirror of the runtime's format enums, and it is a mirror on
 * purpose.** The wire says a slot's kind is `document` or `image` and stops
 * there — the input-form descriptor carries no accept list, because which bytes
 * a runtime can decode is a property of that runtime, not of the method. So the
 * list has to live somewhere on this side, and the only honest place is one
 * module that says out loud what it mirrors.
 *
 * The source is `pipelex`:
 *
 * | Here | There |
 * | --- | --- |
 * | `DOCUMENT_FORMATS` | `DocumentFormat` in `pipelex/tools/misc/document_utils.py` |
 * | `IMAGE_FORMATS` | `ImageFormat` in `pipelex/tools/misc/image_utils.py` |
 *
 * Both enums expose `get_supported_mime_types()`, and both are closed. If a
 * runtime grows a format, this table is the thing that has to move with it —
 * and a stale entry here is worse than none, because it rejects a file the
 * runtime would have taken.
 *
 * The previous arrangement was a hard-coded display string in `derive.ts`, and
 * it was wrong in both directions: it advertised `TXT`, which no
 * `DocumentFormat` member covers, and omitted `PPTX`, which is one. Nothing
 * caught that, because the string was never compared to anything and the
 * dropzone never enforced it.
 *
 * Pure data. No React, no ajv, nothing imported.
 */

/** One accepted format: its MIME type and the extensions that carry it. */
export interface FileFormat {
  mimeType: string;
  /** Leading dot, lowercase — the shape a file input's `accept` wants. */
  extensions: string[];
  /** How the format is named to a user, uppercase. */
  label: string;
}

/** Mirrors `DocumentFormat`: PDF, DOCX, PPTX. */
export const DOCUMENT_FORMATS: readonly FileFormat[] = [
  { mimeType: 'application/pdf', extensions: ['.pdf'], label: 'PDF' },
  {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
    label: 'DOCX',
  },
  {
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extensions: ['.pptx'],
    label: 'PPTX',
  },
];

/**
 * Mirrors `ImageFormat`: PNG, JPEG, WEBP.
 *
 * `.jpg` and `.jpeg` both ride `image/jpeg` — the runtime's `as_file_extension`
 * returns `jpg`, so that is the label, but a file named `.jpeg` is the same
 * bytes and must not be refused over its spelling.
 */
export const IMAGE_FORMATS: readonly FileFormat[] = [
  { mimeType: 'image/png', extensions: ['.png'], label: 'PNG' },
  { mimeType: 'image/jpeg', extensions: ['.jpg', '.jpeg'], label: 'JPG' },
  { mimeType: 'image/webp', extensions: ['.webp'], label: 'WEBP' },
];

export function formatsForKind(kind: 'document' | 'image'): readonly FileFormat[] {
  return kind === 'image' ? IMAGE_FORMATS : DOCUMENT_FORMATS;
}

/** `"PDF, DOCX, PPTX"` — the hint shown under a dropzone. */
export function acceptLabelForKind(kind: 'document' | 'image'): string {
  return formatsForKind(kind)
    .map((format) => format.label)
    .join(', ');
}

/**
 * Whether a picked file is one this kind accepts.
 *
 * Checks the MIME type first and falls back to the extension, because a
 * browser's `File.type` is empty often enough to matter: an OS with no handler
 * registered for `.docx` reports `''`, and refusing that file would be refusing
 * a valid one over a fact about the user's machine. A wrong-but-present MIME
 * type is still a rejection — that is the case this exists for.
 */
export function isAcceptedFile(
  kind: 'document' | 'image',
  file: { name: string; type: string },
): boolean {
  const formats = formatsForKind(kind);
  const mimeType = file.type.split(';', 1)[0]?.trim().toLowerCase() ?? '';
  if (mimeType) return formats.some((format) => format.mimeType === mimeType);
  const name = file.name.toLowerCase();
  return formats.some((format) => format.extensions.some((ext) => name.endsWith(ext)));
}

/**
 * The accept map a file input wants: MIME type to extensions.
 *
 * Shaped for `react-dropzone`'s `accept`, which is the same shape the DOM's
 * `accept` attribute is built from. Listing extensions BESIDE the MIME type is
 * what makes the empty-`File.type` case above work in the OS picker too.
 */
export function acceptMapForKind(kind: 'document' | 'image'): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const format of formatsForKind(kind)) map[format.mimeType] = [...format.extensions];
  return map;
}
