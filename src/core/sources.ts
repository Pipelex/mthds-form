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
 * node. No React, no fetch. What a row SAYS is data here (`SourceFile`'s
 * `typeLabel` and `origin` are the host's words); how a row DRAWS is a
 * rendering, so the glyph a host draws on a row is `./react`'s
 * (`FilePickerSource.renderGlyph`), never a field of these shapes.
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
  /**
   * The file's MIME type, which picks the field's format the row's file is:
   * the row names that format's label ("PNG") unless `typeLabel` words the
   * type, and draws an image's glyph or a document's from it unless the
   * host draws its own.
   */
  mediaType?: string;
  /**
   * The file's type in the host's own words ("Picture", "PDF document"), said
   * on the row's second line in place of the format's label, so a row reads
   * as the host's own list of files does. An empty string counts as none.
   */
  typeLabel?: string;
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

/** The addresses a list's items hold, each once. */
function heldUrls(items: readonly unknown[]): Set<string> {
  return new Set(items.map(heldUrl).filter((url): url is string => url !== undefined));
}

/**
 * A list of files with the chosen files written into it, in the order they
 * were chosen: first into the rows that hold no file yet (a row the person
 * added and left empty), then as new rows after the last. A file whose address
 * the list already holds is not written again, and neither is a second choice
 * of one address: two rows of a source may name the same stored file. Returns
 * a new array and leaves `held` as it was.
 */
export function addChosenFiles(
  held: readonly unknown[] | undefined,
  chosen: readonly SourceFile[],
): unknown[] {
  const items = [...(held ?? [])];
  const urls = heldUrls(items);
  let free = 0;
  for (const file of chosen) {
    if (urls.has(file.url)) continue;
    urls.add(file.url);
    while (free < items.length && heldUrl(items[free]) !== undefined) free += 1;
    if (free < items.length) items[free] = sourceFileValue(file);
    else items.push(sourceFileValue(file));
    free += 1;
  }
  return items;
}

/** Where `placeDroppedFiles` puts a batch of files, and what it leaves out. */
export interface DroppedFilesPlacement {
  /**
   * The list once the rows the batch needs are appended: `held` as it was,
   * then one empty row (`undefined`) per file that did not go into a free row.
   * A new array whenever rows are appended, and a copy of `held` otherwise.
   */
  items: unknown[];
  /** How many rows were appended, so a caller writes the list only when it grew. */
  appended: number;
  /** The row each placed file goes to, in the order the files were given. */
  targets: number[];
  /** How many files, from the end of the batch, found no room. */
  leftOut: number;
}

/**
 * Where a batch of `count` files dropped on a list of files goes: first into
 * the rows that are free, in index order, then into new rows after the last,
 * as far as `maxItemCount` allows. The files keep the order they were given,
 * and those beyond the room are left out from the end of the batch.
 *
 * A row is free when it holds no file (its value carries no `url`) and
 * `isFree` says so too. The caller's predicate is where it adds what only it
 * knows of a row: that a file is still arriving there, whose write-back the row
 * must be kept for, or that the host reports a failure there, the only record
 * that one of the person's files did not arrive. Without one, every row holding
 * no file is free.
 *
 * It mirrors `addChosenFiles`, so the two ways several files enter a list fill
 * it alike, and it knows nothing of `File`: the caller judges each file and
 * hands over how many it accepted.
 */
export function placeDroppedFiles(
  held: readonly unknown[] | undefined,
  count: number,
  maxItemCount: number | undefined,
  isFree: (index: number) => boolean = () => true,
): DroppedFilesPlacement {
  const items = [...(held ?? [])];
  const targets: number[] = [];
  for (let index = 0; index < items.length && targets.length < count; index += 1) {
    if (heldUrl(items[index]) === undefined && isFree(index)) targets.push(index);
  }
  let appended = 0;
  while (targets.length < count && (maxItemCount === undefined || items.length < maxItemCount)) {
    targets.push(items.length);
    items.push(undefined);
    appended += 1;
  }
  return { items, appended, targets, leftOut: count - targets.length };
}

/**
 * How many files `placeDroppedFiles` can place in `held`: its free rows, by the
 * same test, and the rows its bound still allows after the last. `undefined`
 * when the list has no bound, since appending then never runs out.
 */
export function roomForDroppedFiles(
  held: readonly unknown[] | undefined,
  maxItemCount: number | undefined,
  isFree: (index: number) => boolean = () => true,
): number | undefined {
  if (maxItemCount === undefined) return undefined;
  const items = held ?? [];
  let free = 0;
  for (let index = 0; index < items.length; index += 1) {
    if (heldUrl(items[index]) === undefined && isFree(index)) free += 1;
  }
  return free + Math.max(0, maxItemCount - items.length);
}

/**
 * How many files `addChosenFiles` writes for `chosen` into `held`: the choices
 * whose address the list does not hold yet, each address once. This is what a
 * choice spends of `roomForChosenFiles`, so a held file chosen again, or a
 * second row naming a chosen file, takes no room.
 */
export function chosenFilesAdded(
  held: readonly unknown[] | undefined,
  chosen: readonly SourceFile[],
): number {
  const urls = heldUrls(held ?? []);
  const before = urls.size;
  for (const file of chosen) urls.add(file.url);
  return urls.size - before;
}

/**
 * How many files a list may still take from a source: its bound less the files
 * it holds, since `addChosenFiles` writes into its empty rows before adding
 * any. `undefined` when the list has no bound.
 */
export function roomForChosenFiles(
  held: readonly unknown[] | undefined,
  maxItemCount: number | undefined,
): number | undefined {
  if (maxItemCount === undefined) return undefined;
  const files = (held ?? []).filter((item) => heldUrl(item) !== undefined).length;
  return Math.max(0, maxItemCount - files);
}
