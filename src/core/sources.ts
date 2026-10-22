/**
 * The two optional host seams beside the upload: a **file source**, which lets
 * a file field take a file the host already stores, and an **example source**,
 * which lets a whole form take a set of values someone saved for the method.
 *
 * The kernel states the shapes and applies the answers; the host answers. It
 * knows nothing of any platform's routes, records or permissions: a host maps
 * its own list onto these shapes, and a host that gives neither seam gets the
 * form it had before. The controls that use them are `./react`'s
 * (`FilePicker`, `FillWithExample`), and docs/sources.md is the contract.
 *
 * Shapes and pure functions only, so a host's server can import the types it
 * answers with, and the rules that write an answer into a value are tested in
 * node. No React, no fetch.
 */

/** Whose files a file source lists: the person's own, or the whole team's. */
export type FileSourceScope = 'mine' | 'everyone';

/** One page of a file source's list, as the picker asks for it. */
export interface FileSourceQuery {
  /** What the person searched for, trimmed; empty when they searched for nothing. */
  search: string;
  /** Whose files to list. */
  scope: FileSourceScope;
  /**
   * The MIME types the field accepts, after any narrowing a host applied
   * (`narrowFileFormats`), in the field's own order. The list must hold only
   * files of these types: the picker writes what is chosen straight into the
   * field, and a field that refuses a dropped file of another type must not
   * be handed one this way.
   */
  mediaTypes: readonly string[];
  /** Where to continue: absent for the first page, else the previous page's `nextCursor`. */
  cursor?: string;
  /** Aborted when the answer is no longer wanted: a newer search, a closed picker. */
  signal: AbortSignal;
}

/** One row of a file source's list: a file the host already stores. */
export interface SourceFile {
  /** The row's identity in the host's list, which a choice is kept by. */
  id: string;
  /**
   * The stored file's address, written into the field as its `url`, exactly as
   * an upload's result is. Several rows may share one address.
   */
  url: string;
  /** The file's name, shown on the row and written into the field as its `filename`. */
  name: string;
  /** The file's MIME type, which names its format on the row. */
  mediaType?: string;
  /** The file's size in bytes. */
  size?: number;
  /** How the file came to be. A `test` file is marked "Test file" at the head of its row's second line. */
  kind?: 'uploaded' | 'generated' | 'test';
  /** When the file was stored, as an ISO 8601 timestamp; the row says it as a date. */
  createdAt?: string;
  /**
   * Where the file came from, in the host's own words ("Uploaded by Ana",
   * "Made by Invoice extraction"), shown on the row's second line as it is.
   */
  origin?: string;
}

/** One page of a file source's answer. */
export interface FileSourcePage {
  /** The page's files, newest first. A page may be empty and still carry a cursor. */
  files: readonly SourceFile[];
  /** Where the next page starts, or nothing when this page is the last. */
  nextCursor?: string | null;
}

/**
 * Where a file field can take a file the host already stores. When a form has
 * one, every file field offers "Choose from your team's files", and a list of
 * files offers it for several at once.
 */
export interface FileSource {
  /** Lists one page of files for a query. Rejecting shows the failure with Try again. */
  list: (query: FileSourceQuery) => Promise<FileSourcePage>;
  /** Which of Mine and Everyone the picker opens on. */
  initialScope: FileSourceScope;
}

/** One example of a method: a name and the inputs a run of it sends. */
export interface FormExample {
  /** The example's identity in the host's list. */
  id: string;
  /** The example's name, shown on its row. */
  name: string;
  /**
   * The inputs as a run takes them: each input `{ concept, content }`, an
   * optional input left out, an empty plural input a bare `[]`. It is the
   * shape `apiInputsFromRunValues` produces, so a host saves an example from
   * `form.inputs` and hands it back as it is.
   */
  inputs: Readonly<Record<string, unknown>>;
}

/** One page of an example source's list. */
export interface ExampleSourceQuery {
  /** Where to continue: absent for the first page, else the previous page's `nextCursor`. */
  cursor?: string;
  /** Aborted when the answer is no longer wanted. */
  signal: AbortSignal;
}

/** One page of an example source's answer. */
export interface ExampleSourcePage {
  /** The page's examples, in the order the list shows them. */
  examples: readonly FormExample[];
  /** Where the next page starts, or nothing when this page is the last. */
  nextCursor?: string | null;
}

/**
 * Where a form can take a whole set of values. When a form has one, it offers
 * "Fill with an example". `rename` and `delete` are capabilities: each is
 * offered on a row's menu only when given, so a host gives them only to a
 * person allowed to change examples.
 */
export interface ExampleSource {
  /** Lists one page of the method's examples. Rejecting shows the failure with Try again. */
  list: (query: ExampleSourceQuery) => Promise<ExampleSourcePage>;
  /**
   * Renames an example. Resolving to the example as stored replaces the row;
   * resolving to nothing keeps the row under the new name.
   */
  rename?: (example: FormExample, name: string) => Promise<FormExample | void>;
  /** Deletes an example. Asked for only after the person confirmed it. */
  delete?: (example: FormExample) => Promise<void>;
  /**
   * Whether "Fill with an example" is left out while the method has no
   * example. `false` by default, when the empty list says how to make one.
   * A host sets it for a person who cannot save an example, to whom an empty
   * list has nothing to offer; the form then asks for the first page as it
   * mounts, to know whether to offer the control.
   */
  hideWhenEmpty?: boolean;
}

/** What a chosen file writes into its field: the same `{ url, filename }` an upload writes. */
export function sourceFileValue(file: SourceFile): { url: string; filename: string } {
  return { url: file.url, filename: file.name };
}

/** The `url` a list item holds, when it is a file value holding one. */
function heldUrl(item: unknown): string | undefined {
  if (!item || typeof item !== 'object') return undefined;
  const url = (item as { url?: unknown }).url;
  return typeof url === 'string' && url !== '' ? url : undefined;
}

/**
 * A list of files with the chosen files added after what it holds, one row
 * each, in the order they were chosen. A file whose address the list already
 * holds is not added again, and neither is a second choice of one address:
 * two rows of a source may name the same stored file. Returns a new array and
 * leaves `held` as it was.
 */
export function addChosenFiles(
  held: readonly unknown[] | undefined,
  chosen: readonly SourceFile[],
): unknown[] {
  const items = [...(held ?? [])];
  const urls = new Set(items.map(heldUrl).filter((url): url is string => url !== undefined));
  for (const file of chosen) {
    if (urls.has(file.url)) continue;
    urls.add(file.url);
    items.push(sourceFileValue(file));
  }
  return items;
}
