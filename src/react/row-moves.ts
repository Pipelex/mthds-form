/**
 * The moves a host makes to a list's rows, and what a move does to an id.
 *
 * A field's id is its value path, so a row's id is its position (`cvs.1`), and
 * moving rows renumbers them. Two parties hold something by row and must move
 * it when the rows move: the host, which keys what it knows about each upload
 * by id, and the list control, which keys each row's React element by an
 * identity of its own so the row's controls travel with it. `useMethodForm`
 * makes every move itself (`removeItem`, `moveItem`), re-keys its own records
 * as it does, and hands the list a log of those moves (`FieldEnv.rowMoves`),
 * which the list replays on its row identities. One log, read by both, is what
 * keeps them agreeing about which row is which. See docs/upload-seam.md, "What
 * the form keeps by id moves with the rows it moves".
 */

/** One move of a list's rows, as a host records it for the list to replay. */
export interface RowMove {
  /**
   * The move's number: each move is numbered above the one before it, for as
   * long as the host lives, so a list knows which moves it has replayed.
   */
  seq: number;
  /** The list's id, the one its rows' ids extend (`cvs` for `cvs.1`). */
  listId: string;
  /**
   * For each row of the list after the move, the index that row held before
   * it. A row whose index is left out was removed.
   */
  order: readonly number[];
}

/** For each index a row held before a move, the index it holds after it. */
export function destinationOf(order: readonly number[]): ReadonlyMap<number, number> {
  return new Map(order.map((source, index) => [source, index]));
}

/**
 * `id` once the rows of the list at `listId` have moved, each from its old
 * index to `destination`'s entry for it: the same id outside that list, the id
 * under the row's new index inside it (`cvs.2.resume` becoming `cvs.1.resume`),
 * and `undefined` for an id under a row that is gone. The dot after the list's
 * id keeps a sibling input called `cvs_extra` out of a list called `cvs`.
 */
export function movedId(
  id: string,
  listId: string,
  destination: ReadonlyMap<number, number>,
): string | undefined {
  const prefix = `${listId}.`;
  if (!id.startsWith(prefix)) return id;
  const rest = id.slice(prefix.length);
  const dot = rest.indexOf('.');
  const row = dot === -1 ? rest : rest.slice(0, dot);
  if (!/^\d+$/.test(row)) return id;
  const index = destination.get(Number(row));
  if (index === undefined) return undefined;
  return `${prefix}${index}${dot === -1 ? '' : rest.slice(dot)}`;
}
