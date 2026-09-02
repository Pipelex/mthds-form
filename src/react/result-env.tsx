'use client';

import { createContext, use, useMemo, type ReactNode } from 'react';

/**
 * The host's seam for turning a stored reference into something a browser can
 * fetch.
 *
 * ## Why a result view needs one at all
 *
 * A run's files do not come back as public URLs. They come back as
 * `pipelex-storage://…` references, which are an identity in the runtime's
 * store and resolve nowhere in a browser. Without a way to exchange them, every
 * file arm in the result view degrades to naming the file — a PDF that cannot
 * be previewed, an image gallery of blank tiles — and no amount of care in
 * those arms can fix it, because the missing thing is a fact only the host has.
 *
 * ## Why it is SYNCHRONOUS
 *
 * The obvious shape is `(uri) => Promise<string | null>`, and it is the wrong
 * one here. It would put a loading state, a race and an effect into every arm
 * that paints a file — inside table cells and gallery tiles, which are the
 * places least able to carry them — and a gallery of twenty images would make
 * twenty independent round trips as it scrolled.
 *
 * A host that resolves by REWRITING (the common case: map the reference onto
 * its own `/assets` route, which checks ownership and streams the object) has
 * no round trip to make and is served exactly by a pure function. A host that
 * genuinely must presign is better off resolving the run's references in one
 * batch — it holds the payload before it renders it — and closing over the
 * result, which is also the only shape that does not make a gallery quadratic.
 *
 * So the seam is a pure function, and the async case is a lookup in a map the
 * host filled. That is a real constraint on a host and it is stated rather than
 * hidden.
 *
 * ## The contract
 *
 * Return `undefined` for a reference this host cannot resolve, and the view
 * falls back to naming the file — which is what it does with no resolver at
 * all. Never return a URL that will 404: a broken image tile says less than a
 * filename.
 */
export type ResolveUrl = (url: string) => string | undefined;

/**
 * How a stored reference becomes a URL that works OUTSIDE this page — pasted
 * into another tab, another app, a colleague's message.
 *
 * Separate from `resolveUrl`, because the two answer different questions and a
 * host's answers genuinely differ. A display URL may be a path on the host's
 * own origin behind its session (`/api/assets/…`), which is what lets a strict
 * `img-src 'self'` policy stand and what keeps a picture from expiring while
 * the tab is open. That URL is useless on the clipboard: whoever pastes it has
 * no session. A share URL therefore carries its own credential — a freshly
 * minted presigned URL — and is minted per click rather than held, because it
 * starts expiring the moment it exists.
 *
 * Async for the same reason: minting one is a round trip. Omit it and the copy
 * control falls back to the display URL, which is right for a host whose
 * storage is public anyway.
 */
export type ResolveShareUrl = (url: string) => Promise<string | undefined>;

interface ResultEnv {
  resolveUrl?: ResolveUrl;
  resolveShareUrl?: ResolveShareUrl;
}

const ResultEnvContext = createContext<ResultEnv>({});

export function ResultEnvProvider({
  resolveUrl,
  resolveShareUrl,
  children,
}: ResultEnv & { children: ReactNode }) {
  const env = useMemo(() => ({ resolveUrl, resolveShareUrl }), [resolveUrl, resolveShareUrl]);
  return <ResultEnvContext value={env}>{children}</ResultEnvContext>;
}

/**
 * The resolver, already applied.
 *
 * Every file arm calls this rather than reading the context and remembering to
 * apply it: `useResolvedUrl(url)` is the URL to actually use, and a component
 * that forgets to call it is the bug this shape prevents. An unresolvable
 * reference comes back as the reference, so the arms' existing
 * `isViewableUrl` check still decides whether it can be linked or only named.
 */
export function useResolvedUrl(url: string): string {
  return use(ResultEnvContext).resolveUrl?.(url) ?? url;
}

/** For the non-React readers that need the same answer (previewability). */
export function useResolveUrl(): ResolveUrl | undefined {
  return use(ResultEnvContext).resolveUrl;
}

/** The share-URL minter, when the host supplies one. */
export function useResolveShareUrl(): ResolveShareUrl | undefined {
  return use(ResultEnvContext).resolveShareUrl;
}
