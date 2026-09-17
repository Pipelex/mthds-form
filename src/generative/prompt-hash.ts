import type { DesignerCatalog } from './designer-catalog';

/**
 * The hash that pairs a captured layout with the prompt it was produced
 * against: the first twelve hex digits of the SHA-256 of `promptHashSubject`,
 * which is the designer method's text and the catalog it was handed.
 *
 * The prompt is no longer one string this package renders: it is the method
 * (`methods/layout-design.mthds`, every paragraph as prose) applied to
 * the catalog as data (`designerCatalog()`). Both are what a run was actually
 * given, so both are hashed - a reworded rule and a renamed prop each move
 * the pin, exactly as they did when the prompt was rendered here. The model
 * pin in the method file moves it too, since the file is hashed whole; a
 * fixture records its model on its own, so that costs a regeneration, never a
 * misread.
 *
 * It is a PIN rather than a computation, so that this entry stays importable
 * from a browser (hashing would mean `node:crypto` or an async Web Crypto
 * call, and a host compares this value synchronously while deciding whether a
 * stored layout still stands - and the entry must not read the method file).
 * `__tests__/prompt.test.ts` recomputes it from the file and the catalog and
 * fails on any drift, so the pin cannot go stale quietly: a catalog, rule or
 * direction change is a failing test, which is exactly what it was for.
 *
 * A stored layout whose hash is not this one is not rendered - the host falls
 * back to the kernel's own form - because the vocabulary it was written in is
 * no longer the vocabulary this entry renders.
 */
export const PROMPT_HASH = 'a4e2e53582b1';

/**
 * What the hash is computed over: the method's text as shipped, then the
 * catalog as the run request carries it. The one recipe the test and the
 * fixture pass share, so the pin they check and the stamp they write agree.
 */
export function promptHashSubject(method: string, catalog: DesignerCatalog): string {
  return `${method}\n${JSON.stringify(catalog)}`;
}
