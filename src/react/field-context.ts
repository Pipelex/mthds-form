'use client';

import { createContext, use } from 'react';

/**
 * How many structures a field sits inside: 0 for a form's own field, one more
 * inside each structure. A list adds nothing to it, while the structure a
 * list's row holds counts like any other and draws nothing around its fields,
 * so a structure inside that row hangs from a rule rather than drawing a card
 * in the row's box.
 *
 * `ObjectField` reads it to group its fields, and in `app` the field chrome
 * reads it too: a field inside a structure is one row of the structure, its
 * label and description on the left and its control on the right, in the
 * compact height of a structure's controls.
 */
export const StructureDepthContext = createContext(0);

export function useStructureDepth(): number {
  return use(StructureDepthContext);
}

/**
 * Whether the control stands in a list's row, which sets it in the compact
 * height of a structure's controls in `app`, beside the row's number and its
 * remove button.
 */
export const ListRowContext = createContext(false);

/**
 * Whether the control sits inside a structure or a list's row: what sets an
 * app's control in the compact height of a structure's (36 pixels rather than
 * 40), as the mockup's form rows are.
 */
export function useCompactControl(): boolean {
  return use(StructureDepthContext) > 0 || use(ListRowContext);
}

/**
 * Whether the form's input this control heads was filled by a host's
 * synthetic inputs and not changed since, which `MethodForm`'s `generated`
 * states. Set for a form's own input only: a field inside it shows no mark of
 * its own, since the mark is about the whole input.
 */
export const GeneratedInputContext = createContext(false);

/**
 * Whether the input fills its cell of `MethodForm`'s grid: an empty file
 * input beside a neighbour, whose drop zone then grows to the row's height,
 * at least 136 pixels tall rather than the 200 it is alone.
 */
export const InputFillContext = createContext(false);
