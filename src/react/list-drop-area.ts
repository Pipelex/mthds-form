'use client';

import { createContext, useContext } from 'react';

/** A file the list's drop area handed to the host for one of its rows. */
export interface PlacedFile {
  file: File;
  /** What the host's `onDropFile` returned for it: an upload's promise, or nothing. */
  upload: unknown;
}

/**
 * What a list that offers a drop area for several files tells the file fields
 * in its rows. Every list provides it around its rows, `null` when it offers no
 * such area, so the nearest list is the one that answers.
 *
 * A single file field that is handed a batch reads it to say where a batch
 * goes. And a row the area filled takes its file from it: the list hands the
 * file to the host itself, so without this the row would never see the file it
 * now holds, and would show none of what a file dropped on it directly shows -
 * the local preview once it lands, and a refusal on screen giving way to the
 * new file.
 *
 * The list gives it a new identity each time it places files, which is what
 * tells a row that is already mounted to look for one. The upload is the
 * list's, never the row's, so nothing a row does can upload a file twice.
 * React's strict mode, which runs a new row's effects twice in development,
 * therefore costs that row its local preview there and nothing else.
 *
 * Internal, and kept off `FieldEnv` on purpose: a member there would be public
 * API, and this is a fact one control tells another inside the package.
 */
export interface ListDropArea {
  /**
   * The file the area placed in the row with this id, handed over once: a
   * second call for the same placement returns nothing.
   */
  takePlaced(rowId: string): PlacedFile | undefined;
}

export const ListDropAreaContext = createContext<ListDropArea | null>(null);

/** The drop area of the list this field is a row of, or `null` when it has none. */
export function useListDropArea(): ListDropArea | null {
  return useContext(ListDropAreaContext);
}
