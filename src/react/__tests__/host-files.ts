/**
 * A host that serves its run's stored files on its own origin, as the suites
 * that frame a document need one to.
 *
 * The result view frames only a document its host's resolver answered on the
 * page's own origin, never a URL the payload names, so a suite that asserts a
 * frame stores its document (`stored`) and resolves it the way a host's asset
 * route does (`hostFiles`, onto `served`). A payload's own `https:` URL is a
 * third party's page, which the view links instead.
 */
import type { ResolveUrl } from '../result-env';

const STORED = 'pipelex-storage://run/';

/** The stored reference a run writes for `name`. */
export const stored = (name: string) => `${STORED}${name}`;

/** Where the host serves `name`: a path on its own origin. */
export const served = (name: string) => `/api/assets/${name}`;

/** The host's resolver: its own stored files onto its own origin, nothing else. */
export const hostFiles: ResolveUrl = (url) =>
  url.startsWith(STORED) ? served(url.slice(STORED.length)) : undefined;
