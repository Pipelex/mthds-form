'use client';

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import type {
  ExampleSource,
  FileSource,
  PipeIOContract,
  PipeInputFormDescriptor,
  Readiness,
  RunField,
} from '../core';
import { buildRunFields } from '../core/derive';
import { ownProp } from '../core/own-property';
import {
  anyOptionalStructureOpen,
  computeReadiness,
  fieldFilled,
  isFilled,
  isFoldedOptional,
  isOptionalStructure,
  mustBeFilled,
  optionalStructureOpen,
} from '../core/readiness';
import { closeOptionalStructures, openOptionalStructures, seedInputs } from '../core/seed';
import { apiInputsFromRunValues, sameRunValues, setValueAtPath } from '../core/values';
import { FillWithExample } from './example-fill';
import { FieldRenderer, type FieldEnv } from './field-renderer';
import type { UploadedFile } from './file-field';
import { FieldPresentationProvider, type FieldPresentation } from './field-presentation';
import { FieldStringsProvider, useFieldStrings, type FieldStrings } from './field-strings';
import { OptionalToggle } from './optional-toggle';
import { destinationOf, movedId, type RowMove } from './row-moves';
import { cn } from './utils';

/**
 * A whole method's input form: every input of one pipe, built from its
 * input-form descriptor and its contract, with the state a host would
 * otherwise hand-write around `FieldRenderer` - the seed, the uploads, the
 * top-level optional disclosure, the required marks and the run gate.
 *
 * It is two pieces, so the consumer keeps what is its own. `useMethodForm`
 * holds the state and hands back the values, the run inputs and whether they
 * are ready, wherever in the host's tree it is called - typically beside the
 * run button. `MethodForm` renders the fields for that state and nothing else:
 * no panel, no heading, no run button, no history, no `<form>` element. See
 * docs/method-form.md.
 */

/** The form's values, keyed by input name, in the controls' own shape. */
export type MethodFormValues = Record<string, unknown>;

/**
 * Where a dropped file goes: its field's id, which is its value path, split.
 * It is the id the file was dropped at; if `removeItem` or `moveItem` moves
 * that row while the file is arriving, the form writes the result at the
 * row's new id.
 */
export interface MethodFormUploadContext {
  /** The field's id, a dotted value path (`photos.1`, `invoice.source`). */
  id: string;
  /** The same path, split: what `setValueAtPath` takes. */
  path: string[];
}

export interface UseMethodFormOptions {
  /** The pipe's input-form descriptor (`getPipeInputForm`). */
  descriptor: PipeInputFormDescriptor;
  /** The pipe's entry in `pipe_io_contracts` (`getPipeIOContract`). */
  contract: PipeIOContract;
  /**
   * A transform over the derived fields, applied once before anything else
   * reads them: narrowing a file slot (`narrowFileFormats`), dropping a child
   * the host never sends. Pass a stable function (module-level or memoized):
   * the fields are re-derived when it changes.
   */
  prepareFields?: (fields: RunField[]) => RunField[];
  /**
   * Input names to show first, in this order. Every input not named keeps its
   * descriptor order after them; a name no input has is ignored.
   */
  order?: readonly string[];
  /**
   * What the form holds until its first edit. Absent or `null`, the method's
   * own seed (`seedInputs`: the authored defaults, every optional structure
   * closed). A function receives that seed and returns the values, for a host
   * that lays something the method cannot know over it (today's date). Read on
   * every render until the first edit, so it may change after hydration; from
   * the first edit the form owns its values, and `reset` goes back to it.
   */
  initialValues?: MethodFormValues | ((seed: MethodFormValues) => MethodFormValues) | null;
  /**
   * Stores a dropped or picked file and resolves to what the field holds. Its
   * presence is the capability: without it every file field is link-only (see
   * docs/upload-seam.md). A rejection marks the field's upload as failed with
   * `FieldStrings.uploadFailed`, unless another file was written in its place
   * while it was in flight. The next file dropped there clears the mark, and
   * so does any write that changes the file at that path: a file chosen from
   * `fileSource`, a typed link, a clear, a `setValues`. When it resolves to a
   * bare URL, or omits the name, the file's own name is kept.
   */
  uploadFile?: (file: File, context: MethodFormUploadContext) => Promise<UploadedFile>;
  /**
   * Where a file field can take a file the host already stores. Its presence
   * is the capability, as `uploadFile`'s is: every empty file field then offers
   * "Choose from your team's files", and a list of files offers it for several
   * at once. The choice is written as `{ url, filename }`, as an upload's
   * result is. See docs/sources.md.
   */
  fileSource?: FileSource;
  /**
   * Where the form can take a saved example of the method. When given,
   * `MethodForm` offers "Fill with an example" above the fields, which sets
   * every value at once (as `reset` does) and never starts a run; a touched
   * form asks before it replaces what was entered. See docs/sources.md.
   */
  exampleSource?: ExampleSource;
}

/** What the form says to its consumer: the values, the run inputs, the gate. */
export interface MethodFormState {
  /** The fields the form renders, derived, prepared and ordered. */
  fields: RunField[];
  /** The current values, in the controls' shape. */
  values: MethodFormValues;
  /**
   * The values as a run takes them: each input as `{ concept, content }`, an
   * unfilled optional input left out, an empty plural input sent as `[]`
   * (`apiInputsFromRunValues`). What a run call's `inputs` takes.
   */
  inputs: Record<string, unknown>;
  /** How many of the inputs that gate a run are filled, and which are not. */
  readiness: Readiness;
  /** Whether a file upload is still in flight. */
  uploading: boolean;
  /** Whether a run may start: every gating input filled and no upload in flight. */
  ready: boolean;
  /** Whether `attempt` has been called since the last reset: required marks show. */
  attempted: boolean;
  /**
   * Whether the form holds work of the person's own: a value that sends a
   * different run from the one it was given (its initial values as they stood
   * at the first edit, or the last `reset`), or a file still arriving. A value typed and erased again, or an
   * optional structure opened and left empty, sends the same run and does not
   * count. "Fill with an example" asks before replacing a touched form.
   */
  touched: boolean;
}

/** The handle `useMethodForm` returns, and `MethodForm` renders. */
export interface MethodFormController extends MethodFormState {
  /**
   * Replace the values, or update them from the previous ones. A write that
   * changes the file at an id in `failedUploadIds` ends that failure.
   *
   * A write is read by position: what the form keeps by id (a failed upload,
   * an upload in flight) stays at its id, whatever the write did to the rows
   * of a list. A value carries no identity for its rows, so a write that moves
   * them cannot be told from one that replaces them; rows are moved with
   * `removeItem` and `moveItem`, which carry all of it along.
   */
  setValues: (next: MethodFormValues | ((previous: MethodFormValues) => MethodFormValues)) => void;
  /**
   * Removes the row at `index` of the list at `listId` (an id, the list's
   * dotted value path: `attachments`, `candidates.1.letters`), and moves with
   * every later row what the form keeps by its id: a failed upload's mark, an
   * upload in flight, and the file that upload was dropped over. What it kept
   * for the removed row goes with it, and an upload still arriving there
   * writes nothing. `MethodForm` hands this to its lists as
   * `FieldEnv.onRemoveItem`, so their remove buttons use it; a host rendering
   * its own fields passes it the same way. A call naming no row of a list
   * changes nothing.
   */
  removeItem: (listId: string, index: number) => void;
  /**
   * Moves the row at `from` of the list at `listId` to `to`, the rows between
   * them shifting by one, and carries what the form keeps by each moved row's
   * id along with it, as `removeItem` does. A host reordering a list moves its
   * rows with this rather than through `setValues`, which is read by
   * position. A call naming no row of a list changes nothing.
   */
  moveItem: (listId: string, from: number, to: number) => void;
  /**
   * Every move `removeItem` and `moveItem` have made since the last reset,
   * oldest first. `MethodForm` hands it to its lists as `FieldEnv.rowMoves`,
   * and a list replays it on the identities of its rows, so a row's controls
   * move with the row whoever moved it; a host rendering its own fields passes
   * it the same way, beside `removeItem`.
   */
  rowMoves: readonly RowMove[];
  /**
   * Back to `values` (a past run's inputs, say), or to the initial values when
   * none is given. Forgets the edits, the attempt, the failed uploads and any
   * upload still in flight, whose result is then dropped.
   */
  reset: (values?: MethodFormValues | null) => void;
  /**
   * The run button's press: marks the attempt, so every gating input still
   * empty shows its required mark, and answers whether the run may start.
   */
  attempt: () => boolean;
  /**
   * How many times `reset` has run. `MethodForm` keys its fields by it, so a
   * reset remounts them and nothing a control kept for the values it replaced
   * outlives them: the preview of a file still arriving, a refused drop, an
   * open preview. A host rendering its own fields keys them the same way.
   */
  resets: number;
  /**
   * Ids (value paths) with an upload in flight, each at its row's id as it is
   * now: `removeItem` and `moveItem` carry an upload along with its row. Read
   * by `MethodForm`.
   */
  uploadingIds: ReadonlySet<string>;
  /**
   * Ids whose last upload failed, and whose file nothing has replaced since:
   * an upload marks its id only if its place still holds the file it was
   * dropped over, and an id leaves the set when a new file is dropped there,
   * when a write changes the file at its path (to another file or to none),
   * when `removeItem` removes its row, and on a reset. `removeItem` and
   * `moveItem` carry it to its row's new id. Read by `MethodForm`.
   */
  failedUploadIds: ReadonlySet<string>;
  /**
   * The upload seam `MethodForm` hands its file fields, when the host uploads:
   * stores the file through `uploadFile` and writes it at the id's path, or at
   * its row's new id when `removeItem` or `moveItem` moved that row while the
   * file was arriving. It returns the upload, which resolves to the file it
   * wrote once it lands, and rejects when it writes nothing: when it fails,
   * or when a newer file dropped at the same id, a reset or the removal of its
   * row replaces it. A file field matches that answer to its value, so a host
   * rendering its own fields passes this as `FieldEnv.onDropFile` unchanged.
   * Ignoring the promise is safe: the form handles its rejection itself.
   */
  dropFile: ((id: string, file: File) => Promise<{ url: string; filename: string }>) | undefined;
  /** The host's file source, which `MethodForm` hands its file fields. */
  fileSource: FileSource | undefined;
  /** The host's example source, which `MethodForm` offers above the fields. */
  exampleSource: ExampleSource | undefined;
}

const EMPTY_IDS: ReadonlySet<string> = new Set<string>();

function withId(ids: ReadonlySet<string>, id: string): ReadonlySet<string> {
  if (ids.has(id)) return ids;
  const next = new Set(ids);
  next.add(id);
  return next;
}

function withoutId(ids: ReadonlySet<string>, id: string): ReadonlySet<string> {
  if (!ids.has(id)) return ids;
  const next = new Set(ids);
  next.delete(id);
  return next;
}

/** An upload in flight, as the form keeps it under the id it writes back to. */
interface InFlight {
  /** Which drop started it: a newer drop at the same id replaces the entry. */
  token: number;
  /**
   * The address of the file its place held when it was dropped (`undefined`
   * for none): the file a failure of that upload would be about.
   */
  over: string | undefined;
}

/**
 * What the form holds of its own: the values since the first edit, the
 * uploads that failed, the uploads in flight and the rows it has moved. One
 * state rather than several, because one write changes them together: a file put where an upload
 * failed ends that failure (`written`), an upload's failure counts only while
 * its place holds what it was dropped over (`uploadFailed`), and a row moved
 * in a list carries both with it (`rowsMoved`).
 *
 * The failures and the uploads are keyed by id, a value path, and a list's
 * rows have no identity in the values: an empty row is nothing at all, and a
 * structure row is a new object after every keystroke. So the form follows a
 * row only through the moves it makes itself, and reads every other write by
 * position.
 */
interface HeldState {
  /** `null` while nothing is edited, when the form shows the live initial values. */
  edited: MethodFormValues | null;
  /** Ids whose last upload failed, and whose file nothing has replaced since. */
  failed: ReadonlySet<string>;
  /** The uploads in flight, by the id each one writes back to. */
  uploads: ReadonlyMap<string, InFlight>;
  /**
   * The rows moved since the last reset, oldest first: what the lists replay
   * on the identities of their rows, so they agree with the ids above.
   */
  moves: readonly RowMove[];
}

const NO_UPLOADS: ReadonlyMap<string, InFlight> = new Map();
const NO_MOVES: readonly RowMove[] = [];
const NOTHING_HELD: HeldState = {
  edited: null,
  failed: EMPTY_IDS,
  uploads: NO_UPLOADS,
  moves: NO_MOVES,
};

/** `entries` without `id`, the same map when it held none. */
function withoutEntry<V>(entries: ReadonlyMap<string, V>, id: string): ReadonlyMap<string, V> {
  if (!entries.has(id)) return entries;
  const next = new Map(entries);
  next.delete(id);
  return next;
}

/**
 * The address of the file the values hold at a field id (a dotted value path,
 * `photos.1` or `invoice.source`), or `undefined` when there is none. The URL
 * is the file's identity, as everywhere a file value is compared: it is what
 * the run sends, and what the file field itself watches to tell that another
 * file was written in.
 */
function fileUrlAt(values: MethodFormValues, id: string): string | undefined {
  const node = valueAt(values, id);
  if (node === null || typeof node !== 'object') return undefined;
  const url = ownProp(node as Record<string, unknown>, 'url');
  return typeof url === 'string' && url !== '' ? url : undefined;
}

/** What the values hold at a field id (a dotted value path), `undefined` for nothing. */
function valueAt(values: MethodFormValues, id: string): unknown {
  let node: unknown = values;
  for (const key of id.split('.')) {
    if (node === null || typeof node !== 'object') return undefined;
    node = ownProp(node as Record<string, unknown>, key);
  }
  return node;
}

/**
 * The form after a write of its values, with every failed upload whose file
 * the write replaced left out of the failed ids.
 *
 * A failure is about a file that never arrived, so whatever stands in its
 * place afterwards is a newer answer than it, whoever wrote it: a file chosen
 * from the host's files, a typed link, a list's sheet filling the row, the
 * host's own `setValues`. A clear counts too: the field's own controls take
 * every one of these, the clear included, as the person moving past the
 * failure, and a mark the kernel kept after the control had dismissed it came
 * back as "upload failed" on the next control mounted over that id. A write
 * that leaves the file at that path as it was (another input, a row added
 * after the failed one) keeps the failure.
 *
 * The write is read by position, as everything but `rowsMoved` is: a failure
 * and an upload in flight stay at their ids. A write that moved rows reads as
 * one that replaced them, since the values cannot say which it was.
 *
 * A write that hands back the values it was given returns `held` itself, so
 * React skips the render, as it did when the values were a state of their own.
 */
function written(
  held: HeldState,
  initial: MethodFormValues,
  update: (before: MethodFormValues) => MethodFormValues,
): HeldState {
  const before = held.edited ?? initial;
  const after = update(before);
  // While nothing is edited, even the initial values handed back are a first
  // edit: the form owns its values from then on.
  if (after === held.edited) return held;
  const replaced = [...held.failed].filter((id) => fileUrlAt(before, id) !== fileUrlAt(after, id));
  if (replaced.length === 0) return { ...held, edited: after };
  const failed = new Set(held.failed);
  for (const id of replaced) failed.delete(id);
  return { ...held, edited: after, failed };
}

/**
 * The form as a file is dropped at `id`: a new attempt, which no failure is
 * about yet, and which replaces any upload still arriving there.
 */
function uploadDropped(
  held: HeldState,
  initial: MethodFormValues,
  id: string,
  token: number,
): HeldState {
  const uploads = new Map(held.uploads);
  uploads.set(id, { token, over: fileUrlAt(held.edited ?? initial, id) });
  return { ...held, failed: withoutId(held.failed, id), uploads };
}

/**
 * Where the upload started by drop `token` writes back now, with what the
 * form keeps of it, or `undefined` once nothing waits on it: a newer drop at
 * its id, a reset or the removal of its row replaced it.
 */
function placeOf(held: HeldState, token: number): [string, InFlight] | undefined {
  for (const entry of held.uploads) if (entry[1].token === token) return entry;
  return undefined;
}

/**
 * The form as the upload started by drop `token` fails: marked failed only
 * while its place still holds the file it was dropped over. A file written
 * there while it was in flight (a host's `setValues`, a list's sheet) is a
 * newer answer than the failure, exactly as one written after it would be, so
 * it marks nothing. An upload nothing waits on any more changes nothing.
 */
function uploadFailed(held: HeldState, initial: MethodFormValues, token: number): HeldState {
  const place = placeOf(held, token);
  if (!place) return held;
  const [id, upload] = place;
  const stillThere = fileUrlAt(held.edited ?? initial, id) === upload.over;
  return {
    ...held,
    failed: stillThere ? withId(held.failed, id) : held.failed,
    uploads: withoutEntry(held.uploads, id),
  };
}

/**
 * The form as the upload started by drop `token` lands: its file written at
 * its place, over whatever was written there while it was in flight, since
 * the newest file dropped at a field wins. Its place is its row's id as it is
 * now, which `rowsMoved` carried along while the file was arriving.
 */
function uploadLanded(
  held: HeldState,
  initial: MethodFormValues,
  token: number,
  value: { url: string; filename: string },
): HeldState {
  const place = placeOf(held, token);
  if (!place) return held;
  const [id] = place;
  const next = written(held, initial, (before) => setValueAtPath(before, id.split('.'), value));
  return { ...next, uploads: withoutEntry(next.uploads, id) };
}

/**
 * The form after the rows of the list at `listId` are put in a new order:
 * `order` is handed the rows and answers, for each row of the new list, the
 * index that row held before, leaving out a row that is removed, or `null`
 * when there is nothing to do. Everything the form keeps by id moves with its
 * row: a failure, an upload in flight and what it was dropped over, at the row
 * itself (`attachments.2`) or anywhere inside it (`candidates.2.resume`,
 * `candidates.2.letters.0`). What it kept for a removed row goes with the row.
 *
 * This is the one write the form reads by row rather than by position, and it
 * can because it makes the move itself: a value cannot say that a row moved,
 * so a write handed to `written` could only be guessed at. The move joins the
 * log under `seq`, for the lists to move their rows' identities the same way.
 */
function rowsMoved(
  held: HeldState,
  initial: MethodFormValues,
  listId: string,
  order: (rows: readonly unknown[]) => readonly number[] | null,
  seq: number,
): HeldState {
  const before = held.edited ?? initial;
  const rows = valueAt(before, listId);
  if (!Array.isArray(rows)) return held;
  const sources = order(rows);
  if (!sources) return held;
  const after = setValueAtPath(
    before,
    listId.split('.'),
    sources.map((source) => rows[source]),
  );
  const destination = destinationOf(sources);
  const failed = new Set<string>();
  for (const id of held.failed) {
    const moved = movedId(id, listId, destination);
    if (moved !== undefined) failed.add(moved);
  }
  const uploads = new Map<string, InFlight>();
  for (const [id, upload] of held.uploads) {
    const moved = movedId(id, listId, destination);
    if (moved !== undefined) uploads.set(moved, upload);
  }
  const moves = [...held.moves, { seq, listId, order: sources }];
  return { edited: after, failed, uploads, moves };
}

/** Whether `index` names a row of `rows`. */
function isRow(rows: readonly unknown[], index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < rows.length;
}

/** The rows' old indices once the row at `index` is removed, or `null` for no row there. */
function withoutRow(index: number) {
  return (rows: readonly unknown[]): number[] | null =>
    isRow(rows, index) ? rows.map((_, i) => i).filter((i) => i !== index) : null;
}

/** The rows' old indices once the row at `from` moves to `to`, or `null` for no move. */
function rowMovedTo(from: number, to: number) {
  return (rows: readonly unknown[]): number[] | null => {
    if (!isRow(rows, from) || !isRow(rows, to) || from === to) return null;
    const order = rows.map((_, i) => i).filter((i) => i !== from);
    order.splice(to, 0, from);
    return order;
  };
}

/**
 * The fields in the host's order: the named ones first, in the order given,
 * then the rest in descriptor order. Stable, and never drops a field.
 */
function orderFields(fields: RunField[], order: readonly string[] | undefined): RunField[] {
  if (!order || order.length === 0) return fields;
  const rank = (field: RunField) => {
    const index = order.indexOf(field.name);
    return index === -1 ? order.length : index;
  };
  return fields
    .map((field, index) => ({ field, index }))
    .sort((a, b) => rank(a.field) - rank(b.field) || a.index - b.index)
    .map(({ field }) => field);
}

/**
 * The state of one method's input form. See `UseMethodFormOptions` for what it
 * takes and `MethodFormController` for what it gives back; render it with
 * `<MethodForm form={...} />`.
 *
 * A different method is a different form: remount (a new `key`) when the
 * descriptor changes, as values belong to the inputs they were typed for.
 */
export function useMethodForm({
  descriptor,
  contract,
  prepareFields,
  order,
  initialValues,
  uploadFile,
  fileSource,
  exampleSource,
}: UseMethodFormOptions): MethodFormController {
  // A joined key rather than the array, so an inline `order` literal does not
  // re-derive the fields on every render.
  const orderKey = order ? order.join('\u0000') : '';
  const fields = useMemo(() => {
    const derived = buildRunFields(descriptor, contract.inputs);
    const prepared = prepareFields ? prepareFields(derived) : derived;
    return orderFields(prepared, orderKey ? orderKey.split('\u0000') : undefined);
  }, [descriptor, contract.inputs, prepareFields, orderKey]);

  const initial = useMemo<MethodFormValues>(() => {
    if (typeof initialValues === 'function') return initialValues(seedInputs(fields));
    return initialValues ?? seedInputs(fields);
  }, [initialValues, fields]);

  // The held state's truth is `store`, which every change reads and replaces
  // at once, from an event handler or an upload's callback, never in render;
  // `held` is the same state as last rendered. An upload's callback has to
  // know, when it runs, whether anything still waits on it and where its row
  // has moved, and a state updater could only tell it during the next render.
  // A change that hands back the state it was given renders nothing.
  const store = useRef<HeldState>(NOTHING_HELD);
  const [held, setHeld] = useState<HeldState>(NOTHING_HELD);
  const commit = useCallback((next: HeldState) => {
    if (next === store.current) return;
    store.current = next;
    setHeld(next);
  }, []);
  const edited = held.edited;
  const failedUploadIds = held.failed;
  const uploadingIds = useMemo<ReadonlySet<string>>(
    () => (held.uploads.size === 0 ? EMPTY_IDS : new Set(held.uploads.keys())),
    [held.uploads],
  );

  // What the person's edits are measured against: the values of the last
  // `reset`, or the initial values as they stood at the first edit since.
  // `null` while nothing is edited, when the form shows the live initial
  // values. Taken once, so a host changing its initial values later does not
  // move it, and an edit stays the person's own. `touched` compares with it.
  const [given, setGiven] = useState<MethodFormValues | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [resets, setResets] = useState(0);
  const uploadCounter = useRef(0);
  // Numbers the row moves, and is never reset: a list mounted before a reset
  // must not mistake a move made after it for one it has already replayed.
  const moveCounter = useRef(0);

  const values = edited ?? initial;

  const setValues = useCallback<MethodFormController['setValues']>(
    (next) => {
      setGiven((previous) => previous ?? initial);
      commit(
        written(store.current, initial, (before) =>
          typeof next === 'function' ? next(before) : next,
        ),
      );
    },
    [initial, commit],
  );

  const moveRows = useCallback(
    (listId: string, order: (rows: readonly unknown[]) => readonly number[] | null) => {
      const seq = moveCounter.current + 1;
      const next = rowsMoved(store.current, initial, listId, order, seq);
      if (next === store.current) return;
      moveCounter.current = seq;
      setGiven((previous) => previous ?? initial);
      commit(next);
    },
    [initial, commit],
  );
  const removeItem = useCallback<MethodFormController['removeItem']>(
    (listId, index) => moveRows(listId, withoutRow(index)),
    [moveRows],
  );
  const moveItem = useCallback<MethodFormController['moveItem']>(
    (listId, from, to) => moveRows(listId, rowMovedTo(from, to)),
    [moveRows],
  );

  const reset = useCallback<MethodFormController['reset']>(
    (next) => {
      commit({ edited: next ?? null, failed: EMPTY_IDS, uploads: NO_UPLOADS, moves: NO_MOVES });
      setGiven(next ?? null);
      setAttempted(false);
      setResets((count) => count + 1);
    },
    [commit],
  );

  const dropFile = useMemo(() => {
    if (!uploadFile) return undefined;
    return (id: string, file: File) => {
      // The drop is told apart by its token rather than its id, since its row
      // may move while the file is arriving and its id with it.
      const token = ++uploadCounter.current;
      commit(uploadDropped(store.current, initial, id, token));
      const path = id.split('.');
      let upload: Promise<UploadedFile>;
      try {
        upload = Promise.resolve(uploadFile(file, { id, path }));
      } catch (error) {
        upload = Promise.reject(error);
      }
      // What this upload wrote, handed back to whoever dropped the file: the
      // field matches its URL to the value, which is how it knows its upload's
      // own result whatever render the result lands in. An upload that writes
      // nothing rejects, the one a newer drop, a reset or the removal of its
      // row replaced included, since the field must not wait on a file that
      // will never arrive.
      const landed = upload.then((stored) => {
        if (!placeOf(store.current, token)) {
          throw new Error(
            `A newer file, a reset or the removal of its row replaced the upload dropped at "${id}".`,
          );
        }
        const value =
          typeof stored === 'string'
            ? { url: stored, filename: file.name }
            : { url: stored.url, filename: stored.filename ?? file.name };
        setGiven((previous) => previous ?? initial);
        commit(uploadLanded(store.current, initial, token, value));
        return value;
      });
      // The form handles the rejection itself, so a caller that ignores the
      // promise leaves no unhandled rejection behind. One that nothing waits
      // on any more changes nothing.
      landed.then(undefined, () => commit(uploadFailed(store.current, initial, token)));
      return landed;
    };
  }, [uploadFile, initial, commit]);

  const readiness = useMemo(() => computeReadiness(fields, values), [fields, values]);
  const inputs = useMemo(
    () => apiInputsFromRunValues(values, fields, contract.inputs),
    [values, fields, contract.inputs],
  );
  const uploading = uploadingIds.size > 0;
  const ready = readiness.ready === readiness.total && !uploading;
  const touched = useMemo(
    () => uploading || (edited !== null && given !== null && !sameRunValues(edited, given, fields)),
    [uploading, edited, given, fields],
  );

  const attempt = useCallback(() => {
    setAttempted(true);
    return ready;
  }, [ready]);

  return {
    fields,
    values,
    inputs,
    readiness,
    uploading,
    ready,
    attempted,
    touched,
    setValues,
    removeItem,
    moveItem,
    rowMoves: held.moves,
    reset,
    attempt,
    resets,
    uploadingIds,
    failedUploadIds,
    dropFile,
    fileSource,
    exampleSource,
  };
}

export interface MethodFormProps {
  /** The state to render, from `useMethodForm`. */
  form: MethodFormController;
  /** Holds every control read-only, as a host does while a run is in flight. */
  disabled?: boolean;
  /** `FieldEnv.allowUrl`: `false` takes the "paste a URL instead" link away. */
  allowUrl?: boolean;
  /** `FieldEnv.resolveUrl`: turns a stored reference into a URL a preview can load. */
  resolveUrl?: (uri: string) => Promise<string | null>;
  /**
   * Whether the empty optional inputs fold behind a "+ N optional inputs"
   * disclosure (the default), as they do inside a structure. `false` shows
   * every input; a closed optional structure still folds, since the
   * disclosure is what opens it.
   */
  foldOptional?: boolean;
  /**
   * A message per input name, shown on that input over the form's own marks:
   * a server gate's verdict, say.
   */
  errors?: Readonly<Record<string, string>>;
  /** Mounts `FieldStringsProvider` with this locale (`fr`, `fr-FR`…). */
  locale?: string;
  /** Mounts `FieldStringsProvider` with these keys over the locale's pack. */
  strings?: Partial<FieldStrings>;
  /** Mounts `FieldPresentationProvider`; absent, the nearest one applies. */
  presentation?: FieldPresentation;
  /** Classes for the stack the fields sit in. */
  className?: string;
}

/**
 * Every input of the method `form` holds, rendered through `FieldRenderer`.
 *
 * Each input's id is its name, so a file's upload id is its value path. A
 * gating input still empty after `form.attempt()` is marked `requiredField`,
 * and an optional input started but not complete `incompleteField`; a host's
 * `errors` entry replaces either. The top-level "+ N optional inputs"
 * disclosure folds and opens exactly as the one inside a structure does,
 * optional structures included.
 */
export function MethodForm({ locale, strings, presentation, ...props }: MethodFormProps) {
  let body: ReactNode = <MethodFormFields {...props} />;
  if (presentation) {
    body = (
      <FieldPresentationProvider presentation={presentation}>{body}</FieldPresentationProvider>
    );
  }
  if (locale !== undefined || strings !== undefined) {
    body = (
      <FieldStringsProvider locale={locale} strings={strings}>
        {body}
      </FieldStringsProvider>
    );
  }
  return body;
}

type MethodFormFieldsProps = Omit<MethodFormProps, 'locale' | 'strings' | 'presentation'>;

function MethodFormFields({
  form,
  disabled,
  allowUrl,
  resolveUrl,
  foldOptional = true,
  errors,
  className,
}: MethodFormFieldsProps) {
  const s = useFieldStrings();
  const [showOptional, setShowOptional] = useState(false);
  const {
    fields,
    values,
    setValues,
    removeItem,
    rowMoves,
    reset,
    attempted,
    touched,
    resets,
    uploadingIds,
    failedUploadIds,
    dropFile,
    fileSource,
    exampleSource,
  } = form;

  const uploadErrors = useMemo(
    () => new Map([...failedUploadIds].map((id) => [id, s.uploadFailed] as const)),
    [failedUploadIds, s.uploadFailed],
  );
  const env = useMemo<FieldEnv>(
    () => ({
      disabled,
      onDropFile: dropFile,
      uploadingIds,
      uploadErrors,
      // A list's remove button goes through the form, which carries a failed
      // upload, or one in flight, along with the rows it renumbers, and logs
      // the move for every list to move its rows' identities the same way,
      // whether the button or the host moved them.
      onRemoveItem: removeItem,
      rowMoves,
      allowUrl,
      resolveUrl,
      fileSource,
    }),
    [
      disabled,
      dropFile,
      uploadingIds,
      uploadErrors,
      removeItem,
      rowMoves,
      allowUrl,
      resolveUrl,
      fileSource,
    ],
  );

  // The same disclosure the object control draws inside a structure, at the
  // top level. With folding off, only a closed optional structure folds: it
  // has no control of its own, and the disclosure is what opens it.
  const folds = (field: RunField) => {
    const value = ownProp(values, field.name);
    return foldOptional
      ? isFoldedOptional(field, value)
      : isOptionalStructure(field) && !optionalStructureOpen(value);
  };
  const folded = fields.filter(folds);
  const structureOpen = anyOptionalStructureOpen(fields, values);
  const expanded = showOptional || structureOpen;
  const visible = expanded ? fields : fields.filter((field) => !folds(field));
  const hasStructure = fields.some(isOptionalStructure);

  const toggle = () => {
    setShowOptional(!expanded);
    if (hasStructure) {
      setValues((previous) =>
        expanded
          ? closeOptionalStructures(fields, previous)
          : openOptionalStructures(fields, previous),
      );
    }
  };

  const errorFor = (field: RunField): string | undefined => {
    const hostError = errors ? ownProp(errors, field.name) : undefined;
    if (hostError) return hostError;
    if (!attempted) return undefined;
    const value = ownProp(values, field.name);
    if (mustBeFilled(field)) return fieldFilled(field, value) ? undefined : s.requiredField;
    return isFilled(value) && !fieldFilled(field, value) ? s.incompleteField : undefined;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {exampleSource && (
        <FillWithExample
          source={exampleSource}
          fields={fields}
          touched={touched}
          // Filling is a reset to the example's values: the attempt, the
          // failed uploads and any upload in flight go with what was there.
          onFill={(next) => reset(next)}
          disabled={disabled}
        />
      )}
      {visible.map((field) => (
        <FieldRenderer
          // Remounted on each reset, so no control keeps what it held for the
          // values the reset replaced (a file still arriving, a failed drop).
          key={`${field.name}:${resets}`}
          field={field}
          id={field.name}
          value={ownProp(values, field.name)}
          error={errorFor(field)}
          env={env}
          onChange={(next) => setValues((previous) => ({ ...previous, [field.name]: next }))}
        />
      ))}
      {(folded.length > 0 || structureOpen) && (
        <OptionalToggle count={folded.length} expanded={expanded} onToggle={toggle} noun="input" />
      )}
    </div>
  );
}
