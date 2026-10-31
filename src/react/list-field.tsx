'use client';

import { shownAsOptional } from '../core/readiness';
import {
  addChosenFiles,
  placeDroppedFiles,
  roomForChosenFiles,
  roomForDroppedFiles,
} from '../core/sources';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { focusOutlineClass, selectedHoverBorderClass } from './role-tokens';
import { cn } from './utils';
import type { ListRunField, RunField } from '../core';
import { ConceptPill } from './concept-pill';
import { fieldLabel, useFieldPresentation } from './field-presentation';
import { FieldRenderer, type FieldEnv } from './field-renderer';
import { useFieldStrings } from './field-strings';
import { FilePicker, FilePickerEntry } from './file-picker';
import { firstFocusable } from './focus';
import { ListDropAreaContext } from './list-drop-area';
import { ListFileDrop } from './list-file-drop';
import { destinationOf, movedId, type RowMove } from './row-moves';

interface ListFieldProps {
  field: ListRunField;
  value: unknown[] | undefined;
  onChange: (value: unknown[]) => void;
  id: string;
  error?: string;
  env?: FieldEnv;
}

/**
 * A repeatable list of one element type. Each item is an indexed row with its
 * own remove control; "Add" appends a fresh entry. The element renders through
 * the same `FieldRenderer`, so a list of documents gets dropzones and a list of
 * structured concepts gets nested cards - no special-casing per element type.
 *
 * **A row is a thing, not a slot.** Its React key is generated when the row
 * appears and travels with it, so removing an earlier row moves the later ones
 * instead of renumbering them into each other - which is what used to drop a
 * half-typed value or a pending preview onto the neighbouring row. The row's
 * field ID stays POSITIONAL (`cvs.1`), because that ID is a PATH: a host writes
 * an upload back with `setValueAtPath(values, id.split('.'), value)`, and
 * `setValueAtPath` is a pure function of the value tree. Handing out an opaque
 * token instead would mean the kernel keeping a live token-to-index registry for
 * that function to consult, which is exactly the kind of hidden state the
 * headless core does not have.
 *
 * The positional ID is why removal is BLOCKED while a file is arriving anywhere
 * in this list - see `listIsBusy`. Together those two are the whole fix: a
 * generated key cannot rescue a write-back either, because the keys live in this
 * control's state and not in the value, so a host that replaces `values`
 * wholesale reconciles by length just as positions do. What a stable identity
 * buys over a position is exactly the reorderings the KERNEL performs, and it
 * performs one, plus those a host tells it of: a host that moves rows itself
 * logs each move in `FieldEnv.rowMoves`, as `useMethodForm` does, and the list
 * replays the log on its keys (see `useRowKeys`).
 */
export function ListField({ field, value, onChange, id, error, env }: ListFieldProps) {
  const s = useFieldStrings();
  // Same label chrome switch as `FieldShell` - this control owns its own label
  // because the items-count badge sits beside it. See `field-presentation.tsx`.
  const presentation = useFieldPresentation();
  const isApp = presentation === 'app';
  const items = value ?? [];
  const [rowKeys, setRowKeys] = useRowKeys(items.length, id, env?.rowMoves);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerEntryRef = useRef<HTMLButtonElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  // The row the sheet's last chosen file was written into, set as the sheet
  // closes on Use and read once as focus goes back.
  const landedRow = useRef<number | null>(null);
  // Upload failures a removal left at the wrong position; see `rowEnv` below.
  const [staleErrors, setStaleErrors] = useState<ReadonlyMap<string, string>>(NO_ERRORS);

  const setItem = (index: number, itemValue: unknown) => {
    const next = items.slice();
    next[index] = itemValue;
    onChange(next);
  };
  const removeItem = (index: number) => {
    // Drop the identity WITH the row rather than letting the length
    // reconciliation lop one off the end, or every row below this one would
    // take its neighbour's key and remount holding its neighbour's state. A
    // host that logs its moves records this one too, and the identities move
    // when the list replays it, on the one path every other move takes.
    if (!env?.rowMoves) setRowKeys((prev) => prev.filter((_, i) => i !== index));
    // A host that follows rows removes this one itself, moving what it keeps
    // by a later row's id along with the row, so there is nothing to hold back.
    const hostRemoves = env?.onRemoveItem;
    if (hostRemoves) {
      hostRemoves(id, index);
      return;
    }
    setStaleErrors((prev) => withRenumberedErrors(prev, id, index, env?.uploadErrors));
    onChange(items.filter((_, i) => i !== index));
  };
  const addItem = () => onChange([...items, emptyValue(field.item)]);

  // A file arriving anywhere in this list - a row that IS a dropzone, or one
  // that contains one - pins the row numbering until it lands. Removing a row
  // renumbers every row after it, and an upload the host is still holding
  // resolves against the ID it was handed at drop time: the file would be
  // written into whichever row had moved into that position. Silently, and with
  // the form still looking correctly filled.
  //
  // ADD stays available on purpose. Appending leaves every existing index where
  // it was, so an in-flight write-back is unaffected, and freezing it would make
  // filling a list of files needlessly serial.
  const busy = listIsBusy(id, env?.uploadingIds);

  // An upload failure is keyed by position like everything else here, and it
  // outlives its upload, so the busy rule above cannot cover it: removing a row
  // renumbers every row after it, and the host's message for `cvs.1` would then
  // show on whichever row moved into `cvs.1`, while the row that failed showed
  // nothing. A host handed only the shorter array cannot re-key its map, so
  // the list pays for the staleness where it creates it: each failure at a
  // renumbered position is held back from the rows until the host removes or
  // changes it, or a new file is dropped at that position. A host that takes
  // removals through `onRemoveItem` re-keys its map itself, and nothing is held
  // back from it (see `removeItem`).
  const hostErrors = env?.uploadErrors;
  useEffect(() => {
    setStaleErrors((prev) => {
      if (prev.size === 0) return prev;
      const next = new Map([...prev].filter(([key, message]) => hostErrors?.get(key) === message));
      return next.size === prev.size ? prev : next;
    });
  }, [hostErrors]);
  const rowEnv = useMemo<FieldEnv | undefined>(() => {
    if (!env || staleErrors.size === 0) return env;
    const drop = env.onDropFile;
    return {
      ...env,
      uploadErrors: new Map(
        [...(env.uploadErrors ?? [])].filter(([key, message]) => staleErrors.get(key) !== message),
      ),
      // A new file at a position is a new attempt there, so what the host says
      // about that position from now on is about the file that is there.
      onDropFile: drop
        ? (dropId, file) => {
            setStaleErrors((prev) => {
              if (!prev.has(dropId)) return prev;
              const next = new Map(prev);
              next.delete(dropId);
              return next;
            });
            return drop(dropId, file);
          }
        : undefined,
    };
  }, [env, staleErrors]);
  // A `Concept[N]` slot is full at N. The bound is the method's, read off the
  // same `maxItems` ajv enforces, so offering one more row would offer one the
  // gate then refuses. It is deliberately NOT `itemCount`, which is the LOWER
  // bound: a schema stating "at least two" would otherwise be presented as a
  // list of exactly two, with Add dead over a list the method lets you grow.
  const isFull = field.maxItemCount !== undefined && items.length >= field.maxItemCount;

  // A list of files takes several of the host's files at once: into the rows
  // the person added and left empty first, then as new rows after the last
  // (`addChosenFiles`), so its room is its bound less the files it holds. A
  // list of structures holding a file does not: a file is not a structure, so
  // each nested file field offers its own. It is shut while a row's file is
  // arriving, as the remove buttons are, because the row an upload will write
  // back to is still empty and would otherwise be filled under it.
  const fileSource = env?.fileSource;
  const fileItem =
    field.item.kind === 'document' || field.item.kind === 'image' ? field.item : null;
  const room = roomForChosenFiles(items, field.maxItemCount);

  // A list of files also takes several files from the person's device at once,
  // dropped or picked on a drop area of its own, exactly when the host can
  // upload one. Each accepted file goes into a free row first, then into a new
  // one (`placeDroppedFiles`), and is handed to the host as if it had been
  // dropped on that row. A row is free when it holds no file, no file is still
  // arriving there (its write-back's target, which must not be filled under
  // it) and the rows show no failure there (the only record that one of the
  // person's files did not arrive). The area stays open while files are
  // arriving, as Add does, because appending moves no row and the free-row test
  // never targets one in flight. See docs/upload-seam.md, "A list of files
  // takes several files at once".
  const dropFile = rowEnv?.onDropFile;
  const dropOffered = fileItem !== null && dropFile !== undefined;
  const isFreeRow = (index: number) => {
    const rowId = `${id}.${index}`;
    return !env?.uploadingIds?.has(rowId) && !rowEnv?.uploadErrors?.has(rowId);
  };
  const dropRoom = dropOffered ? roomForDroppedFiles(items, field.maxItemCount, isFreeRow) : 0;
  const placeFiles = (files: readonly File[]): number => {
    if (!dropFile) return 0;
    const placement = placeDroppedFiles(items, files.length, field.maxItemCount, isFreeRow);
    // Written before the first upload is asked for, so a host that records what
    // each upload was dropped over sees the rows it is dropped into.
    if (placement.appended > 0) onChange(placement.items);
    placement.targets.forEach((index, order) => {
      const file = files[order];
      if (!file) return;
      // The host reports a failure through `uploadErrors`, on the row. Nothing
      // here waits on the upload, so its rejection is handled, not left to
      // surface as an unhandled one.
      void Promise.resolve(dropFile(`${id}.${index}`, file)).catch(() => {});
    });
    return placement.targets.length;
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className={cn(
            'text-[13px] font-medium leading-none text-foreground',
            isApp ? 'text-[13.5px]' : 'font-mono',
          )}
        >
          {fieldLabel(field.title, field.name, presentation)}
        </span>
        {!isApp && <ConceptPill conceptRef={field.conceptRef} category="list" />}
        <span className="font-mono text-[10.5px] text-muted-foreground">
          {/* "of N" is a claim about an EXACT count, so it needs both bounds and
              needs them equal. Read off `itemCount` alone - the LOWER bound - a
              model saying "at least two" was announced as a list of exactly two
              and then read `3 of 2 items` the moment a third row arrived. Every
              other list is a plain count, which is the honest thing to say
              about a slot with room to grow. */}
          {field.itemCount !== undefined && field.maxItemCount === field.itemCount
            ? s.itemsCountOf(items.length, field.itemCount)
            : s.itemsCount(items.length)}
        </span>
        {shownAsOptional(field) && (
          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {s.optionalBadge}
          </span>
        )}
      </div>
      {field.description && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{field.description}</p>
      )}

      <div ref={rowsRef} className="space-y-2">
        {/* With a drop area, the area stands in for this line: its own words
            say what to do, and three dashed boxes one above another would read
            as three equal choices. */}
        {items.length === 0 && !dropOffered && (
          <p className="rounded-md border border-dashed border-border bg-input/50 px-3 py-4 text-center text-[12px] text-muted-foreground">
            {s.noItemsYet}
          </p>
        )}
        <ListDropAreaContext.Provider value={dropOffered}>
          {items.map((item, index) => (
            <div
              key={rowKeys[index] ?? index}
              data-list-row
              className="flex items-start gap-2 rounded-md border border-border bg-card/40 p-3"
            >
              <span className="mt-1 w-5 shrink-0 text-center font-mono text-[11px] text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <FieldRenderer
                  // `required: true`: a row is in the array because the person
                  // added it, so it is never optional - an object row is never an
                  // optional structure that folds or closes.
                  field={{
                    ...field.item,
                    title: '',
                    name: `${field.name}[${index}]`,
                    required: true,
                  }}
                  value={item}
                  onChange={(v) => setItem(index, v)}
                  id={`${id}.${index}`}
                  env={rowEnv}
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={env?.disabled || busy}
                aria-label={s.removeItemAria(index + 1)}
                className={cn(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50 max-sm:mt-0 max-sm:size-11',
                  focusOutlineClass,
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </ListDropAreaContext.Provider>

        {dropOffered && fileItem && (
          <ListFileDrop
            label={fieldLabel(field.title, field.name, presentation)}
            formats={fileItem.formats}
            shut={!!env?.disabled || dropRoom === 0}
            onPlace={placeFiles}
          />
        )}

        <button
          type="button"
          onClick={addItem}
          disabled={env?.disabled || isFull}
          className={cn(
            'inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border text-[13px] text-muted-foreground transition-colors max-sm:h-11',
            // The edge under the pointer is the accent's, as a selected pill's
            // is; the fill under it stays neutral.
            'hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50',
            selectedHoverBorderClass,
            focusOutlineClass,
          )}
        >
          <Plus className="h-4 w-4" />
          {s.addItem}
        </button>
        {fileSource && fileItem && (
          <>
            <FilePickerEntry
              ref={pickerEntryRef}
              label={fieldLabel(field.title, field.name, presentation)}
              disabled={env?.disabled || busy || room === 0}
              onOpen={() => setPickerOpen(true)}
            />
            <FilePicker
              source={fileSource}
              formats={fileItem.formats}
              multiple
              maxChoices={room}
              held={items}
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              disabled={env?.disabled || busy}
              returnFocusTo={pickerEntryRef}
              onCloseAutoFocus={(event) => {
                // Focus goes back to the row that opened the sheet, unless the
                // choice filled the list and shut that row: then to the row
                // the last chosen file was written into.
                const landed = landedRow.current;
                landedRow.current = null;
                if (landed === null || !pickerEntryRef.current?.disabled) return;
                const rows = rowsRef.current?.querySelectorAll(':scope > [data-list-row]');
                const target = firstFocusable(rows?.[landed]);
                if (!target) return;
                event.preventDefault();
                target.focus();
              }}
              onUse={(files) => {
                const next = addChosenFiles(items, files);
                landedRow.current = lastWrittenRow(items, next);
                onChange(next);
              }}
            />
          </>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The last row `addChosenFiles` wrote into, or `null` when it wrote none. It
 * copies the rows it leaves alone, so a written row is one that changed.
 */
function lastWrittenRow(before: readonly unknown[], after: readonly unknown[]): number | null {
  let index = after.length - 1;
  while (index >= 0 && after[index] === before[index]) index -= 1;
  return index >= 0 ? index : null;
}

/**
 * True when a file is arriving anywhere inside this list.
 *
 * A prefix test rather than an exact one, because the busy row is not always the
 * list's own row: a list of DOCUMENTS uploads at `cvs.1`, a list of structures
 * holding a document uploads at `cvs.1.resume`. The dot is what keeps `cvs.` off
 * a sibling input called `cvs_extra`.
 */
function listIsBusy(id: string, uploadingIds: ReadonlySet<string> | undefined): boolean {
  if (!uploadingIds?.size) return false;
  const prefix = `${id}.`;
  for (const uploading of uploadingIds) if (uploading.startsWith(prefix)) return true;
  return false;
}

const NO_ERRORS: ReadonlyMap<string, string> = new Map();

/**
 * The failures a removal at `removed` leaves at the wrong position: every entry
 * the host holds for this list's rows at that index or after it, since each of
 * those positions now names a different row, or none. Nested ids count by their
 * row (`cvs.2.resume` is row 2), and the dot keeps a sibling input called
 * `cvs_extra` out, as in `listIsBusy`.
 */
function withRenumberedErrors(
  stale: ReadonlyMap<string, string>,
  listId: string,
  removed: number,
  hostErrors: ReadonlyMap<string, string> | undefined,
): ReadonlyMap<string, string> {
  if (!hostErrors?.size) return stale;
  const prefix = `${listId}.`;
  const next = new Map(stale);
  for (const [key, message] of hostErrors) {
    if (!key.startsWith(prefix)) continue;
    const row = key.slice(prefix.length).split('.')[0] ?? '';
    if (/^\d+$/.test(row) && Number(row) >= removed) next.set(key, message);
  }
  return next.size === stale.size && [...next].every(([k, m]) => stale.get(k) === m) ? stale : next;
}

interface RowKeyState {
  keys: number[];
  next: number;
  /** The `seq` of the last of the host's row moves this list has replayed. */
  seq: number;
  /** The list's id as it stood after that move: an outer list's move renames it. */
  id: string;
}

/**
 * One identity per row, minted when the row appears and kept until it goes.
 *
 * The keys are React keys and nothing else - they are never rendered, never put
 * in an ID, and never leave this control - so the counter lives in component
 * state rather than in a module, and a server render and its hydration can
 * disagree about the numbers without disagreeing about the markup.
 *
 * A row moves its identity in one of two ways. A host that logs its row moves
 * (`FieldEnv.rowMoves`, as `useMethodForm` does) is replayed: every move made
 * to this list since it last rendered permutes the keys as it permuted the
 * rows, and a move of an outer list's rows renames this list on the way, so a
 * move made under its new id is still recognised. Without a log, `removeItem`
 * drops the right key itself.
 *
 * Both adjustments run during render, which is the supported way to adjust
 * state when props change: React re-renders immediately without committing the
 * first pass. The length reconciliation after them is the fallback for a value
 * that changed from OUTSIDE the control with nothing said about it (a host
 * seeding or replacing `values`), where there is nothing to match rows by and
 * length is the only honest answer.
 */
function useRowKeys(
  length: number,
  id: string,
  moves: readonly RowMove[] | undefined,
): [number[], (update: (prev: number[]) => number[]) => void] {
  const latest = moves?.[moves.length - 1]?.seq ?? 0;
  const [state, setState] = useState<RowKeyState>(() => ({
    keys: Array.from({ length }, (_, i) => i),
    next: length,
    seq: latest,
    id,
  }));

  if (state.seq !== latest || state.id !== id || state.keys.length !== length) {
    setState((prev) => withLength(replayed(prev, moves, latest, id), length));
  }

  const update = (fn: (prev: number[]) => number[]) =>
    setState((prev) => ({ ...prev, keys: fn(prev.keys) }));

  return [state.keys, update];
}

/**
 * The row keys once every move in `moves` newer than the last one replayed is
 * replayed: a move of this list's rows permutes them, a key for a row that was
 * not known yet being minted, and a move of an outer list's rows only renames
 * the list. The state then records `latest` and the list's id as it is now.
 */
function replayed(
  state: RowKeyState,
  moves: readonly RowMove[] | undefined,
  latest: number,
  id: string,
): RowKeyState {
  let { keys, next } = state;
  let tracked: string | undefined = state.id;
  for (const move of moves ?? []) {
    if (move.seq <= state.seq || tracked === undefined) continue;
    if (move.listId === tracked) {
      const before = keys;
      keys = [];
      for (const source of move.order) {
        const key = before[source];
        if (key === undefined) keys.push(next++);
        else keys.push(key);
      }
    } else {
      tracked = movedId(tracked, move.listId, destinationOf(move.order));
    }
  }
  return { keys, next, seq: latest, id };
}

/** The row keys cut or extended to `length`, extended ones minted fresh. */
function withLength(state: RowKeyState, length: number): RowKeyState {
  if (state.keys.length === length) return state;
  if (length < state.keys.length) return { ...state, keys: state.keys.slice(0, length) };
  const added = length - state.keys.length;
  return {
    ...state,
    keys: [...state.keys, ...Array.from({ length: added }, (_, i) => state.next + i)],
    next: state.next + added,
  };
}

/** A sensible empty starting value for a freshly added list item. */
function emptyValue(field: RunField): unknown {
  switch (field.kind) {
    case 'boolean':
      return false;
    case 'object':
      return {};
    case 'list':
      return [];
    case 'document':
    case 'image':
      return undefined;
    default:
      return undefined;
  }
}
