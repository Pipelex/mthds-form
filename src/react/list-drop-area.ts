'use client';

import { createContext, useContext } from 'react';

/**
 * Whether the field reading it is a row of a list that offers a drop area for
 * several files, so a single file field that is handed a batch can say where a
 * batch goes. Every list provides it around its rows, `false` when it offers no
 * such area, so the nearest list is the one that answers.
 *
 * Internal, and kept off `FieldEnv` on purpose: a flag there would be public
 * API, and this is a fact one control tells another inside the package.
 */
export const ListDropAreaContext = createContext(false);

/** True inside a row of a list that offers a drop area for several files. */
export function useInListWithDropArea(): boolean {
  return useContext(ListDropAreaContext);
}
