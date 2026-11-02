'use client';

import { useSyncExternalStore } from 'react';

/**
 * Whether this browser draws a PDF inside a frame: `'yes'`, `'no'`, or
 * `'unknown'` where nothing can be asked yet.
 *
 * **A frame onto a PDF is blank where there is no viewer.** Android's browsers
 * and headless browsers draw no PDF in a page, and say so through
 * `navigator.pdfViewerEnabled`, which is `false` there. A frame pointed at a PDF
 * in such a browser is an empty box, or a download nobody asked for, so the
 * result view shows a card in its place: the file's name, a sentence saying it
 * cannot be shown here, and ways to open it in a tab and to save it.
 *
 * **`undefined` reads as a viewer.** A browser too old to have the property
 * drew PDFs in frames on every desktop, which is where it is still met, and
 * reading its silence as "no" would take the preview from those readers to
 * spare a case the property was added to answer.
 *
 * **Never read during a server render.** `navigator` is not the reader's on a
 * server (Node has its own, with no such property), so the server snapshot is
 * `'unknown'` and the store is read only in the browser. During hydration React
 * renders with the server snapshot first and renders again with the browser's
 * answer straight after, so a page rendered on a server shows neither a frame
 * nor the card until the browser has been asked: a PDF on Android never flashes
 * as a blank frame. A tree rendered in the browser alone reads the answer on its
 * first render.
 *
 * The answer does not change while a page is open, so nothing is subscribed to.
 */
export type PdfViewer = 'yes' | 'no' | 'unknown';

const subscribe = () => () => {};

/** The browser's answer. `pdfViewerEnabled` is missing on older browsers. */
function browserViewer(): PdfViewer {
  return (navigator as { pdfViewerEnabled?: boolean }).pdfViewerEnabled === false ? 'no' : 'yes';
}

function serverViewer(): PdfViewer {
  return 'unknown';
}

export function usePdfViewer(): PdfViewer {
  return useSyncExternalStore(subscribe, browserViewer, serverViewer);
}
