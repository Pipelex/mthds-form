/**
 * Narrowing what a form's file slots accept to what a host will take.
 *
 * `buildRunFields` gives every `document` and `image` field the whole of its
 * kind's table (`./file-formats`): everything the runtime can decode. A host's
 * own upload path can be narrower - a method that only ever reads photographs,
 * a server that stores only some types - and a dropzone that advertises more
 * than the server takes refuses the file only after the upload has been asked
 * for. So a host narrows the tree once, with the list of canonical MIME types
 * its server takes, and the control reads the narrowed list for its hint, its
 * picker filter and its check. The server checks an upload with that same
 * check, `isAcceptedFile(field.formats, { name, type })` over the narrowed
 * field, never by comparing the reported type with the list: the check also
 * takes a file reported under one of a format's `alsoReportedAs` types when
 * its extension is the format's, and reads `application/octet-stream` as no
 * type, so a plain type comparison would refuse files the form accepted.
 *
 * It reads `RunField`, the kernel's own output, and never a JSON Schema: which
 * bytes a runtime can decode is not a wire fact, so there is nothing in the
 * schema to read, and the two schema walks the kernel allows stay the only two.
 *
 * It lives in the core rather than on `FieldEnv` so that a host's server, which
 * renders no control, can hold the very list its form was narrowed with.
 *
 * Pure: no React, no ajv, and the input tree is never mutated.
 */

import type { RunField } from './descriptor';
import { acceptLabel, normalizeMimeType } from './file-formats';

/**
 * The field tree with every `document` and `image` field narrowed to the
 * formats whose MIME type is in `mimeTypes`, walking nested structures and
 * list items.
 *
 * One list serves every slot: it is intersected with each slot's own formats,
 * so a list of PDF, PNG and JPEG leaves a document slot with all three and an
 * image slot with PNG and JPEG. Narrowing never widens a slot - a MIME type the
 * slot's kind cannot take is simply not in the intersection - and each slot
 * keeps its own table's order, whatever order the list is in. The list is
 * read against each format's canonical `mimeType` alone, without parameters
 * and case-insensitively: an `alsoReportedAs` type names no format a host can
 * allow, so `application/zip` keeps no Word file. Those types belong to
 * `isAcceptedFile`, which takes a file reported as one with the format's
 * extension, and reads `application/octet-stream` as no type.
 *
 * **Throws when a slot would be left accepting nothing**, naming the field. A
 * dropzone that refuses every file is a host's configuration error, and a form
 * that renders one has already failed the person holding the file.
 *
 * The input tree is never mutated: a file slot, a structure or a list comes
 * back as a copy, and every other field as the same object it was.
 */
export function narrowFileFormats(
  fields: readonly RunField[],
  mimeTypes: readonly string[],
): RunField[] {
  const allowed = new Set(mimeTypes.map(normalizeMimeType));
  const named = mimeTypes.length > 0 ? mimeTypes.join(', ') : 'no MIME type';

  const narrow = (field: RunField, path: string): RunField => {
    switch (field.kind) {
      case 'document':
      case 'image': {
        const formats = field.formats.filter((format) => allowed.has(format.mimeType));
        if (formats.length === 0) {
          throw new Error(
            `narrowFileFormats: the ${field.kind} field "${path}" would accept no format. ` +
              `It takes ${acceptLabel(field.formats) || 'nothing'}, and the list names ${named}.`,
          );
        }
        return { ...field, formats };
      }
      case 'object':
        return {
          ...field,
          fields: field.fields.map((child) => narrow(child, `${path}.${child.name}`)),
        };
      case 'list':
        // The item carries the list's own name, so the path marks the step into
        // an item rather than repeating the name: `gallery[]`, `cvs[].resume`.
        return { ...field, item: narrow(field.item, `${path}[]`) };
      default:
        return field;
    }
  };

  return fields.map((field) => narrow(field, field.name));
}
