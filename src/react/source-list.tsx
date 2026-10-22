'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useFieldStrings } from './field-strings';
import { cn } from './utils';

/*
 * What the file picker and the examples list share: a host's list read one
 * page at a time, and the rows and lines that say where that read stands.
 * Internal to the control set; the seams' shapes are the core's (`./sources`).
 */

/** One page of a host's list, in the shape both seams answer with. */
export interface SourcePage<T> {
  items: readonly T[];
  nextCursor?: string | null;
}

/** Asks the host for one page: from the start when `cursor` is absent. */
export type LoadSourcePage<T> = (
  cursor: string | undefined,
  signal: AbortSignal,
) => Promise<SourcePage<T>>;

/** Where a host's list stands, and the two things a person can do about it. */
export interface SourcePages<T> {
  /**
   * The first read: `idle` before it is asked for, `loading` until its rows
   * arrive, `ready` once they have (an empty list is ready only once its cursor
   * has ended), `failed` when the host refused.
   */
  status: 'idle' | 'loading' | 'ready' | 'failed';
  /** Every row read so far, in the host's order. */
  items: T[];
  /** Whether the host has said there is more to read. */
  hasMore: boolean;
  /**
   * Whether the list is known to hold nothing: read to its end with no row
   * left. Rows a delete took away do not make a list empty while the host has
   * more to read, which is read at once instead.
   */
  empty: boolean;
  /** The read of the next page: `failed` keeps the rows shown and offers Try again. */
  more: 'idle' | 'loading' | 'failed';
  /** Reads the next page. Does nothing while one is being read or none is left. */
  loadMore: () => void;
  /** Reads again whatever failed: the first page, or the next one. */
  retry: () => void;
  /** Changes the rows already read (a rename, a delete), keeping where the list stands. */
  updateItems: (update: (items: T[]) => T[]) => void;
}

interface PagesState<T> {
  /** The key this state was read for. */
  key: string | null;
  status: SourcePages<T>['status'];
  items: T[];
  cursor: string | null;
  more: SourcePages<T>['more'];
}

/** Where a list stands before its first page for `key` has arrived. */
function startFor(key: string | null): PagesState<never> {
  return { key, status: key === null ? 'idle' : 'loading', items: [], cursor: null, more: 'idle' };
}

/**
 * A host's list read one page at a time, restarted whenever `key` changes and
 * left alone while it is `null`.
 *
 * **An empty page with a cursor is followed by itself.** A host that filters
 * after reading, as a search over stored records does, can answer an empty
 * page that is not the end; showing "No files match" over it would say
 * something false, and a Show more under no rows asks the person to do the
 * list's work. So an empty page that carries a cursor is followed at once,
 * and an empty list is reported only once its cursor has ended. The same
 * holds when the person empties the rows read so far, by deleting them: the
 * next page is read at once rather than "nothing" said over a list that has
 * more. A cursor the list has already read from ends it, so a host whose
 * cursors go round in a circle cannot keep the list asking forever.
 *
 * A new key is a new list from the render that names it: the rows read for the
 * old key are never reported under the new one, not even for the frame before
 * the new read starts.
 *
 * A newer key, a retry and an unmount each abort the read in flight, through
 * the signal the host was handed, and its answer is dropped if it lands anyway.
 * `load` is read when a read starts, so a host may pass a new function on every
 * render without restarting the list.
 */
export function useSourcePages<T>(load: LoadSourcePage<T>, key: string | null): SourcePages<T> {
  const [stored, setState] = useState<PagesState<T>>(() => startFor(key));
  if (stored.key !== key) setState(startFor(key));
  const state: PagesState<T> = stored.key === key ? stored : startFor(key);
  const loadRef = useRef(load);
  const inFlight = useRef<AbortController | null>(null);
  // The cursors this list has read from since its first page. Taken over from
  // a read only once it succeeds, so a failed read leaves nothing behind that
  // would stop its retry.
  const followed = useRef<ReadonlySet<string>>(new Set());

  useEffect(() => {
    loadRef.current = load;
  });

  const read = useCallback(
    (forKey: string | null, cursor: string | undefined, phase: 'first' | 'more') => {
      inFlight.current?.abort();
      const controller = new AbortController();
      inFlight.current = controller;
      const seen = new Set(phase === 'first' ? [] : followed.current);
      const follow = (from: string | undefined) => {
        if (from !== undefined) seen.add(from);
        let page: Promise<SourcePage<T>>;
        try {
          page = Promise.resolve(loadRef.current(from, controller.signal));
        } catch (error) {
          page = Promise.reject(error);
        }
        page.then(
          (answer) => {
            if (inFlight.current !== controller) return;
            // Only an absent cursor ends the list: an empty string is a cursor
            // like any other, and a host may page with one.
            const offered = answer.nextCursor ?? null;
            const next = offered !== null && seen.has(offered) ? null : offered;
            const items = [...answer.items];
            if (items.length === 0 && next !== null) {
              follow(next);
              return;
            }
            inFlight.current = null;
            followed.current = seen;
            // Dropped when the list has moved to another key since the read
            // started, which can land before the effect that aborts it runs.
            setState((previous) =>
              previous.key !== forKey
                ? previous
                : {
                    key: forKey,
                    status: 'ready',
                    items: phase === 'first' ? items : [...previous.items, ...items],
                    cursor: next,
                    more: 'idle',
                  },
            );
          },
          () => {
            if (inFlight.current !== controller) return;
            inFlight.current = null;
            setState((previous) =>
              previous.key !== forKey
                ? previous
                : phase === 'first'
                  ? { key: forKey, status: 'failed', items: [], cursor: null, more: 'idle' }
                  : { ...previous, more: 'failed' },
            );
          },
        );
      };
      follow(cursor);
    },
    [],
  );

  useEffect(() => {
    if (key === null) {
      inFlight.current?.abort();
      inFlight.current = null;
      return;
    }
    read(key, undefined, 'first');
  }, [key, read]);

  useEffect(
    () => () => {
      inFlight.current?.abort();
      inFlight.current = null;
    },
    [],
  );

  const loadMore = useCallback(() => {
    if (state.status !== 'ready' || state.cursor === null || state.more === 'loading') return;
    setState((previous) => ({ ...previous, more: 'loading' }));
    read(state.key, state.cursor, 'more');
  }, [state.key, state.status, state.cursor, state.more, read]);

  const retry = useCallback(() => {
    if (state.status === 'failed') {
      setState((previous) => startFor(previous.key));
      read(state.key, undefined, 'first');
    } else if (state.more === 'failed') {
      loadMore();
    }
  }, [state.key, state.status, state.more, read, loadMore]);

  const updateItems = useCallback((update: (items: T[]) => T[]) => {
    setState((previous) => ({ ...previous, items: update(previous.items) }));
  }, []);

  // Rows taken away down to none, with more to read: read it rather than say
  // the list is empty, or leave Show more under nothing.
  const drained =
    state.status === 'ready' &&
    state.items.length === 0 &&
    state.cursor !== null &&
    state.more === 'idle';
  useEffect(() => {
    if (drained) loadMore();
  }, [drained, loadMore]);

  return {
    status: state.status,
    items: state.items,
    hasMore: state.cursor !== null,
    empty: state.status === 'ready' && state.items.length === 0 && state.cursor === null,
    more: state.more,
    loadMore,
    retry,
    updateItems,
  };
}

/**
 * The rows of a list still being read: static and dim, with no pulse, so a
 * wait is not drawn as motion. Hidden from assistive technology, which hears
 * the wait from the list's status line instead.
 */
export function DimRows({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true" data-dim-rows className="divide-y divide-border">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex min-h-16 items-center gap-3 px-4 py-3 opacity-60">
          <span className="size-8 shrink-0 rounded-md bg-muted" />
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="h-3.5 w-2/5 rounded-sm bg-muted" />
            <span className="h-3 w-3/5 rounded-sm bg-muted" />
          </span>
        </div>
      ))}
    </div>
  );
}

/** A secondary button inside a list's sheet: Try again, Clear search, Show more. */
export function ListAction({
  onClick,
  children,
  className,
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 text-[14px] text-foreground transition-colors hover:bg-muted sm:min-h-9',
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * What a list says in place of its rows: the reason there are none, and the
 * one or two things that can be done about it.
 */
export function ListMessage({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <p className="text-[14px] text-foreground">{text}</p>
      {children && <div className="flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

/** Under the rows read so far: Show more, the wait for it, or its failure with Try again. */
export function MoreFooter<T>({ pages }: { pages: SourcePages<T> }) {
  const s = useFieldStrings();
  if (pages.more === 'failed') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-4">
        <p className="text-[13px] text-muted-foreground">{s.loadMoreFailed}</p>
        <ListAction onClick={pages.retry}>{s.tryAgain}</ListAction>
      </div>
    );
  }
  if (pages.more === 'loading') {
    return (
      <p className="flex items-center justify-center gap-2 px-4 py-4 text-[13px] text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {s.loadingMore}
      </p>
    );
  }
  if (!pages.hasMore) return null;
  return (
    <div className="flex justify-center px-4 py-4">
      <ListAction onClick={pages.loadMore}>{s.showMore}</ListAction>
    </div>
  );
}
