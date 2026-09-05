/**
 * The hash that pairs a captured layout with the prompt it was produced
 * against: the first twelve hex digits of the SHA-256 of `catalogPrompt()`.
 *
 * It is a PIN rather than a computation, so that this entry stays importable
 * from a browser (hashing would mean `node:crypto` or an async Web Crypto
 * call, and a host compares this value synchronously while deciding whether a
 * stored layout still stands). `__tests__/prompt.test.ts` recomputes it from
 * the prompt and fails on any drift, so the pin cannot go stale quietly: a
 * catalog, rule or direction change is a failing test, which is exactly what
 * it was for.
 *
 * A stored layout whose hash is not this one is not rendered - the host falls
 * back to the kernel's own form - because the vocabulary it was written in is
 * no longer the vocabulary this entry renders.
 */
export const PROMPT_HASH = '4dcf6d57cb71';
