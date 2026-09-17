/**
 * The hatch that lets the designer method be worked on without re-running the
 * captured corpus on every edit.
 *
 * A captured layout is stamped with the hash of the prompt it was produced
 * against, and the corpus test holds every stamp to `PROMPT_HASH`. That is the
 * point of the stamp: a layout written in a vocabulary the package no longer
 * ships is one no host will render, so a corpus the entry would refuse is not
 * a corpus to commit. But the prompt IS the method, hashed whole, so every
 * edit to a paragraph of it - a rule reworded, a heading moved - invalidates
 * every capture at once, and restoring them costs inference budget and returns
 * new pages that want a design review. That is a price to pay when the method
 * is done, not between two edits of a prompt.
 *
 * `METHOD_WIP=1` therefore turns the two stamp assertions into skips, and
 * nothing else. A captured layout still has to compile from its own JSONL,
 * validate against the catalog and fit the descriptor it was written for,
 * because none of that went stale with the prompt. The skips show in the
 * reporter and the line below names the hatch on stderr, so a run under it
 * cannot be mistaken for a clean one.
 *
 * It is a LOCAL hatch: under CI the variable is ignored and the stamps are
 * held, so a branch cannot merge with a corpus the entry would refuse to
 * render. The last edit to the method is paid for by one `make fixtures-specs`
 * sweep, once, instead of by every edit before it.
 *
 * The pin stays honest either way. `src/generative/__tests__/prompt.test.ts`
 * still demands that `PROMPT_HASH` be the hash of the method and the catalog
 * as they are now, and `make prompt-hash` moves it there in one command - so
 * what this hatch defers is the paid capture, never the entry's own statement
 * about what it ships.
 */

const REQUESTED = process.env.METHOD_WIP === '1';
const ON_CI = Boolean(process.env.CI);

/** Whether the captured layouts' prompt stamps go unchecked for this run. */
export const METHOD_WIP = REQUESTED && !ON_CI;

if (REQUESTED) {
  process.stderr.write(
    METHOD_WIP
      ? 'METHOD_WIP=1: the captured layouts are not held to the prompt they were produced against. Run `make fixtures-specs` before this branch merges.\n'
      : 'METHOD_WIP=1 is ignored under CI: the captured layouts are held to the prompt the package ships.\n',
  );
}
