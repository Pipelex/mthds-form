'use client';

import { createContext, use, useMemo, type ReactNode } from 'react';

/**
 * Where in a result the node being rendered sits, and what its saved files are
 * named after. Internal to the result view.
 *
 * ## Why a file's button needs to know
 *
 * A file with no name of its own is saved under the base name and its place in
 * the result (`report-output-figures-0-image.png`), because two unnamed images
 * from one result must not both land as `image.png`. The whole-result download
 * reads that place off the descriptor walk in core. A file's own button is drawn
 * by the arm that paints the file, deep in the tree, and holds only the file's
 * value — so without this, the same file would be saved under two different
 * names depending on which control the reader used.
 *
 * The path is built the way `collectStuffFiles` builds it: the root node's
 * name, then a field's name for each record entered, then an entry's index for
 * each list entered. Each branch of `ResultField` that renders a child wraps it
 * in {@link ResultAt}, and every branch that does not can hold no file.
 */
export interface ResultLocation {
  /** Names the saved files: the panel's download base name, or the root node's name. */
  baseName: string;
  /** The node's place, one segment per record field or list index, from the root node's name. */
  path: readonly string[];
}

const ResultLocationContext = createContext<ResultLocation | undefined>(undefined);

/** Where the node being rendered sits, or `undefined` above the root of a result. */
export function useResultLocation(): ResultLocation | undefined {
  return use(ResultLocationContext);
}

/**
 * Establishes where a rendered tree sits in its result: the panel does, at the
 * root, and so does the outermost `ResultField` when nothing above it did.
 *
 * `path` is usually the root node's name alone. A view that renders one
 * subtree of a result on its own, as a generative layout's result hatch does,
 * passes the subtree's whole place instead, root name first, so its files are
 * named as the whole-result download names them.
 */
export function ResultRoot({
  baseName,
  path,
  children,
}: {
  baseName: string;
  /** The rendered node's place, one segment per record field or list index, from the root node's name. */
  path: readonly string[];
  children: ReactNode;
}) {
  // Keyed on the segments rather than the array, which a caller builds anew
  // each render, so the tree beneath is not handed a new location every time.
  // No segment holds a NUL: each is a field's name or an index.
  const key = path.join('\u0000');
  const location = useMemo(() => ({ baseName, path: key.split('\u0000') }), [baseName, key]);
  return <ResultLocationContext value={location}>{children}</ResultLocationContext>;
}

/** One step down: into a record's field (its name) or a list's entry (its index). */
export function ResultAt({ segment, children }: { segment: string; children: ReactNode }) {
  const parent = use(ResultLocationContext);
  const location = useMemo(
    () => (parent ? { baseName: parent.baseName, path: [...parent.path, segment] } : undefined),
    [parent, segment],
  );
  return <ResultLocationContext value={location}>{children}</ResultLocationContext>;
}
