'use client';

import * as React from 'react';

/**
 * What the page paints under the work column, when there is anything to paint.
 *
 * No spec names a result: the layout a model writes is the INPUT page, and the
 * result has shapes of its own. So the page leaves a slot instead, and the host
 * fills it with whatever the run yielded - the kernel's own viewer over the
 * output descriptor, a line while the run is in flight, a failure. The slot is
 * a React node and nothing more: this entry knows how to place it in the page's
 * grammar and nothing about how a run is started, followed or delivered.
 *
 * A host that provides nothing gets a page with no result section at all, which
 * is what an input page is before its first run.
 */

export interface ResultSlot {
  /** What to paint. Nothing is painted at all while this is absent or `null`. */
  content: React.ReactNode;
  /** The heading above it. "Result" unless the host names it. */
  title?: string;
}

const ResultSlotContext = React.createContext<ResultSlot | null>(null);

export function ResultSlotProvider({
  slot,
  children,
}: {
  slot: ResultSlot | null;
  children: React.ReactNode;
}) {
  return <ResultSlotContext.Provider value={slot}>{children}</ResultSlotContext.Provider>;
}

/** The slot the nearest page provides, or `null` on a page with no result yet. */
export function useResultSlot(): ResultSlot | null {
  return React.useContext(ResultSlotContext);
}
