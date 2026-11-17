'use client';

import { useSyncExternalStore } from 'react';

/**
 * The origin of the page this view is drawn in, or `undefined` where nothing
 * can be asked yet.
 *
 * The document frame admits a host's absolute URL only when it is on this
 * origin (`frameableUrl` in `./result-field`), so it has to know the origin, and
 * it can only know it in a browser. **The server snapshot is `undefined`**,
 * which the frame rule reads as "not this origin": during hydration React
 * renders with it first and renders again with the browser's answer straight
 * after, so a server render and the hydration after it agree, and an absolute
 * same-origin URL gains its frame one render later. A root-relative path needs
 * no answer at all, being on this origin by construction.
 *
 * The answer does not change while a page is open, so nothing is subscribed to.
 */
const subscribe = () => () => {};

function browserOrigin(): string | undefined {
  return window.location.origin;
}

function serverOrigin(): string | undefined {
  return undefined;
}

export function usePageOrigin(): string | undefined {
  return useSyncExternalStore(subscribe, browserOrigin, serverOrigin);
}
