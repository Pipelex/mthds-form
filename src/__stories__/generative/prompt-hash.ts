import { createHash } from 'node:crypto';
import { catalogPrompt } from './catalog';

/**
 * The hash stamped on every captured and authored spec: the first twelve hex
 * digits of the SHA-256 of the catalog prompt, computed over the final string.
 *
 * Node-only on purpose - `node:crypto` must never reach a story or the registry,
 * which is why this is not in `catalog.ts`. The fixture pass computes it when a
 * spec is written; the corpus test recomputes it and compares, so a catalog
 * change that invalidates a fixture is a failing test rather than a stale page.
 */
export function promptHashOf(prompt: string): string {
  return createHash('sha256').update(prompt, 'utf8').digest('hex').slice(0, 12);
}

export function currentPromptHash(): string {
  return promptHashOf(catalogPrompt());
}
