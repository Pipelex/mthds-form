import { dataUrlExtensions, readDataUrl, viewableUrl } from './native-content';
import { collectStuffFiles, type StuffFile, type StuffFileKind } from './stuff-files';
import type { RunField } from './descriptor';

/**
 * What saving a result MEANS, decided with no DOM: which files, what each is
 * called, what type it is, and where its bytes are.
 *
 * ## Why the plan is separate from the delivery
 *
 * Handing bytes to a reader is the part that depends on where the view runs.
 * An ordinary browser tab saves through an object URL and a clicked link; a
 * view inside a sandboxed frame is refused all of that and has to ask its host
 * to do it, typically by passing links and inline contents across a bridge that
 * fetches the links itself. What to save is the same answer in both places, so
 * it is computed once, here, and a delivery only has to carry it out. The
 * default browser delivery lives in `./react`; a host supplies its own through
 * `ResultEnvProvider`'s `saveFiles`. See docs/result-view.md § "Saving a
 * result".
 *
 * ## Why a planned file carries a URL rather than bytes
 *
 * A host's download bridge takes links and fetches them itself, which is also
 * what keeps a cross-origin fetch out of a frame that cannot make one. So a
 * stored file is planned as the URL the gate admitted, and only the default
 * browser delivery fetches it. Content the stuff carries inline (the JSON copy
 * of the data, an HTML page) is planned as its text.
 */

/** What a planned file is: one of the stuff's own files, or the JSON copy of its data. */
export type SaveFileKind = StuffFileKind | 'data';

interface SaveFileCommon {
  /**
   * What to save it as: a bare file name, never a path. The file's own
   * `filename` when it states one, else the base name and the file's place
   * below the result's root (`report-figures-0-image.png`), or the base name
   * alone for a file that is the whole result (`output.png`). No two files in
   * one plan share a name, compared without case.
   */
  name: string;
  /**
   * The media type. For a `data:` URL it is the type the gate admitted; for any
   * other URL it is what the payload states, or what the name's extension
   * implies, or `application/octet-stream` when nothing says.
   */
  mimeType: string;
  kind: SaveFileKind;
  /** Where it sat in the result, dotted (`output.figures.0.image`); the root's name for the JSON copy. */
  path: string;
}

/**
 * One file to hand to the reader: exactly one of `url` and `text` is set.
 *
 * `url` is the string the URL gate returned, after the host's resolver was
 * asked first, so a delivery never acts on a member nothing judged. It may be a
 * root-relative path, which a planner with no document cannot resolve; the
 * result view makes one absolute against its own document before a delivery
 * sees it. `text` is content the result carries inline.
 */
export type SaveFile =
  | (SaveFileCommon & { url: string; text?: undefined })
  | (SaveFileCommon & { text: string; url?: undefined });

/** A file the result holds that cannot be saved, because no URL the gate admits was found for it. */
export interface UnavailableFile {
  /** What it would have been saved as, so the reader can be told which one. */
  name: string;
  kind: StuffFileKind;
  path: string;
}

/** Everything saving a whole result involves. */
export interface SavePlan {
  /** What to deliver, in the order the result shows it, the JSON copy last. */
  files: SaveFile[];
  /**
   * What the result holds and cannot be delivered. The JSON copy still carries
   * each one's reference, so the reader keeps it even without the bytes.
   */
  unavailable: UnavailableFile[];
}

/** A file a delivery did not hand over, and why when it knows. */
export interface SaveFailure {
  file: SaveFile;
  reason?: string;
}

/**
 * What a delivery reports. Every planned file not listed in `failed` was
 * delivered, so an empty list means everything went out.
 */
export interface SaveResult {
  failed: SaveFailure[];
}

/**
 * How files reach the reader. The default saves them in the browser; a host
 * whose view runs in a sandboxed frame supplies one that asks the host to.
 *
 * It resolves rather than rejects when a file does not go out, and names that
 * file in `failed`, so the control that asked can tell the reader. A throw or
 * a rejection is read as every file having failed.
 */
export type SaveFiles = (files: readonly SaveFile[]) => Promise<SaveResult>;

export interface SavePlanOptions {
  /**
   * Names the whole stuff: the JSON copy is `<baseName>.json`, a file with no
   * name of its own below the root is `<baseName>-<place>`, and a file that is
   * the whole stuff is `<baseName>.<ext>`.
   */
  baseName: string;
  /** The same resolver the result view paints through, asked before the payload's own URLs. */
  resolveUrl?: (url: string) => string | undefined;
}

/**
 * Everything a stuff contains, planned for saving.
 *
 * The data goes down as JSON, and any image, document or HTML page inside it
 * goes down as ITSELF: a JSON file holding a URL to a picture is not the
 * picture, and a reader who saves a report with three attachments wants the
 * three attachments.
 *
 * The JSON copy is planned whenever the stuff is anything more than one file. A
 * result that IS one image has nothing left over once the image is saved, so
 * `{"url": …}` beside it would be a second file saying less than the first. That
 * holds only when the image can be saved: a bare file the gate refuses leaves
 * the JSON copy as the one thing the reader gets, because it still carries the
 * reference.
 */
export function planStuffSave(field: RunField, value: unknown, options: SavePlanOptions): SavePlan {
  const found = collectStuffFiles(field, value);
  const files: SaveFile[] = [];
  const unavailable: UnavailableFile[] = [];
  for (const file of found) {
    const planned = planFileSave(file, options);
    if (planned) files.push(planned);
    else
      unavailable.push({ name: nameFor(file, options.baseName), kind: file.kind, path: file.path });
  }

  // A stuff that is nothing BUT one file, read from the collector rather than
  // from `field.kind`: a `native.Html` node's kind is `object`, and the whole
  // stuff is still the page.
  const isBareFile = found.length === 1 && found[0]?.path === field.name;
  if (isBareFile && files.length === 1) return { files, unavailable };

  const jsonName = `${safeName(options.baseName) || 'result'}.json`;
  return {
    files: [
      ...distinctNames(files, jsonName),
      {
        name: jsonName,
        mimeType: 'application/json',
        kind: 'data',
        path: field.name,
        text: jsonCopy(value),
      },
    ],
    unavailable,
  };
}

/**
 * The plan's files with no two sharing a name, and none taking the JSON copy's.
 *
 * A name derived from a file's place is unique by construction, but a name the
 * payload states is not: two documents a method wrote as `scan.pdf`, or one it
 * called `report.json` beside the JSON copy of `report`. A browser suffixes a
 * duplicate download itself, but a host's delivery may write the names as given,
 * into a folder or an archive, where the second file silently replaces the
 * first. So the first file keeps its name and each later one gets a number
 * before its extension (`scan-2.pdf`), compared without case, as the file
 * systems readers mostly use compare them.
 *
 * That is the whole plan's concern: a file's own button saves one file, which
 * collides with nothing, under its own name.
 */
function distinctNames(files: readonly SaveFile[], reserved: string): SaveFile[] {
  const taken = new Set([reserved.toLowerCase()]);
  return files.map((file) => {
    let name = file.name;
    for (let count = 2; taken.has(name.toLowerCase()); count += 1) {
      name = numbered(file.name, count);
    }
    taken.add(name.toLowerCase());
    return name === file.name ? file : { ...file, name };
  });
}

/** `scan.pdf` as `scan-2.pdf`: the number before the extension, so the type still reads. */
function numbered(name: string, count: number): string {
  const extension = extensionOf(name);
  return extension
    ? `${name.slice(0, -(extension.length + 1))}-${count}.${name.slice(-extension.length)}`
    : `${name}-${count}`;
}

/**
 * One file, planned on its own — what a file's own download button saves.
 *
 * The file's `path` starts at the root's name, as `collectStuffFiles` builds
 * it: the name leaves that first segment out, because the base name already
 * stands for the root.
 *
 * `undefined` when the file cannot be saved: a stored reference the host's
 * resolver does not answer and no URL the gate admits beside it. The button is
 * not drawn then, so a reader is never offered a download that cannot happen.
 */
export function planFileSave(file: StuffFile, options: SavePlanOptions): SaveFile | undefined {
  const common = { kind: file.kind, path: file.path };
  if (file.text !== undefined) {
    return {
      ...common,
      name: nameFor(file, options.baseName),
      mimeType: 'text/html',
      text: file.text,
    };
  }
  // Judged by the same gate the result view paints through, in the same
  // durability order: the host's resolver over the durable reference first,
  // then `public_url`, then the reference itself. What the gate returns is what
  // is planned, never the raw member.
  const url =
    viewableUrl(options.resolveUrl?.(file.url ?? '')) ??
    viewableUrl(file.publicUrl) ??
    viewableUrl(file.url);
  if (!url) return undefined;
  const encoded = readDataUrl(url);
  if (encoded) {
    // A `data:` URL is its own file, and the gate admitted it for its declared
    // type alone. That type names it: the payload's `filename` and the tail of
    // the payload are both the payload's say, and a `data:image/png` URL saved
    // under `image.html` is a page that runs when the reader opens it.
    return {
      ...common,
      name: nameFor(file, options.baseName, dataUrlExtensions(encoded.mediaType)),
      mimeType: encoded.mediaType,
      url,
    };
  }
  const name = nameFor(file, options.baseName);
  return { ...common, name, mimeType: file.mimeType ?? typeForName(name), url };
}

/** The type a name's extension implies, for a stored file whose payload states none. */
const TYPE_FOR_EXTENSION: Readonly<Record<string, string>> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  html: 'text/html',
};

function typeForName(name: string): string {
  const extension = name.match(/\.([A-Za-z0-9]{1,8})$/)?.[1]?.toLowerCase();
  return (extension && TYPE_FOR_EXTENSION[extension]) || 'application/octet-stream';
}

/**
 * What a saved file is called.
 *
 * The file's own `filename` wins when it has one: it is the name the producer
 * chose and the reader recognises. Otherwise the base name and the file's place
 * below the root name it (`report-attachments-2`), which is unlovely but
 * unambiguous, since two images from one result must not both land as
 * `image.png` and overwrite each other in the download folder.
 *
 * The path's first segment is left out because it is always the root's name,
 * and the base name already stands for the root, as it does in `<base>.json`:
 * keeping it would save the one image a pipe outputs as `output-output.png`. A
 * file that IS the root has no place below it and is named by the base name
 * alone. Every segment is a field's name or an index, neither of which holds a
 * dot, so splitting on dots recovers them.
 *
 * `allowed` is set for a `data:` URL, whose admitted type is the only thing
 * allowed to decide the extension: a name carrying one of those extensions
 * keeps it, and any other extension is replaced by the type's own.
 */
function nameFor(file: StuffFile, base: string, allowed?: readonly string[]): string {
  const own = file.filename ? safeName(file.filename) : '';
  const place = file.path.split('.').slice(1).join('-');
  const named = safeName(base) || 'result';
  const stem = own || (place ? `${named}-${place}` : named);
  const stated = own ? extensionOf(own) : '';
  if (allowed) {
    if (stated && allowed.includes(stated)) return stem;
    const bare = stated ? stem.slice(0, -(stated.length + 1)) : stem;
    const extension = allowed[0];
    return extension ? `${bare}.${extension}` : bare;
  }
  if (own) return own;
  const extension = file.extension ?? extensionOf(pathOf(file.url ?? ''));
  return extension ? `${stem}.${extension}` : stem;
}

/** The extension a name ends in, lowercased, or none. Never guessed from the bytes. */
function extensionOf(name: string): string {
  return name.match(/\.([A-Za-z0-9]{1,8})$/)?.[1]?.toLowerCase() ?? '';
}

/** A URL without its query and fragment, so `x.png?sig=…` still ends in `.png`. */
function pathOf(url: string): string {
  return url.split(/[?#]/)[0] ?? url;
}

/**
 * A name safe to hand a delivery: its last path segment, without control
 * characters, trimmed. A browser sanitises a download name itself, but a host's
 * bridge may write it to disk as given, and a payload's `filename` is the
 * payload's say. Empty when nothing is left.
 */
function safeName(name: string): string {
  const trimmed = (printable(name).split(/[/\\]/).pop() ?? '').trim();
  return trimmed === '.' || trimmed === '..' ? '' : trimmed;
}

/** The name without its control characters, which no file system wants in a name. */
function printable(name: string): string {
  return Array.from(name)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code > 0x1f && code !== 0x7f;
    })
    .join('');
}

/**
 * A planned name split at its extension, the way the plan reads one:
 * `devis.pdf` is `devis` and `.pdf`, `report.final.html` is `report.final` and
 * `.html`, and a name with no extension of one to eight letters and digits is
 * all stem. The extension keeps its dot, so a name rebuilt from the two halves
 * is the name.
 */
export function splitFileName(name: string): { stem: string; extension: string } {
  const extension = name.match(/\.[A-Za-z0-9]{1,8}$/)?.[0] ?? '';
  return extension && extension.length < name.length
    ? { stem: name.slice(0, -extension.length), extension }
    : { stem: name, extension: '' };
}

/**
 * The name a reader typed for a file, made safe the way a planned name is, and
 * a little stricter, since this one is typed rather than produced.
 *
 * Control characters go, as from every planned name. A path separator is
 * REPLACED rather than cut at: a planned name keeps its last path segment
 * because a payload's `filename` may be a path, but a reader who types
 * `Devis 12/2026` means a name, and keeping `2026` alone would throw away what
 * they wrote. The characters a common file system refuses in a name
 * (`: * ? " < > |`) are replaced the same way, with a hyphen, because a host's
 * bridge may write the name to disk as given. Leading dots go, so the file is
 * not hidden, and trailing dots and spaces, which one file system drops
 * silently. A copy of the extension the reader typed at the end is dropped,
 * since the extension is added back after it: `devis.pdf` stays `devis.pdf`
 * rather than becoming `devis.pdf.pdf`.
 *
 * Empty when nothing is left, which the caller reads as "keep the planned name".
 */
export function typedFileStem(typed: string, extension: string): string {
  let stem = printable(typed)
    .replace(/[/\\:*?"<>|]/g, '-')
    .trim();
  if (extension && stem.toLowerCase().endsWith(extension.toLowerCase())) {
    stem = stem.slice(0, -extension.length);
  }
  return stem
    .replace(/^[.\s]+/, '')
    .replace(/[.\s]+$/, '')
    .trim();
}

/**
 * The data as JSON, the way the JSON view shows it. A BigInt, which a JSON
 * parser configured to produce one can hand over, is written as its digits
 * rather than failing the whole save.
 */
function jsonCopy(value: unknown): string {
  const text = JSON.stringify(
    value,
    (_key, member: unknown) => (typeof member === 'bigint' ? member.toString() : member),
    2,
  );
  return text ?? 'null';
}
