'use client';

import { useLayoutEffect, useSyncExternalStore, type CSSProperties } from 'react';

/*
 * The part of the viewport that is on screen, which the overlays sit in.
 *
 * On a page the viewport is the screen, and an overlay laid out against it, a
 * bottom sheet `fixed` to `top: 1.5rem; bottom: 0`, a dialog centred by
 * `inset: 0; margin: auto`, is where the person looks. A form inside a chat
 * host's frame is not on a page: such a host grows its frame with the view's
 * content (the MCP Apps SDK reports the document's whole height, and the host
 * sets the frame to it), so the frame's viewport is as tall as the view, and
 * most of it is scrolled out of sight in the conversation around it. Laid out
 * against that viewport, the team's files' sheet was as tall as the whole view,
 * its head and its Use button far outside what the person saw.
 *
 * A frame cannot read where its host has scrolled it, but an
 * `IntersectionObserver` with no root reports how much of a target the screen
 * shows, through every frame and every clipping scroller around it, a
 * cross-origin host's included. So the viewport is covered by `fixed`, hidden
 * bands that are observed, and the part on screen runs from the top of the
 * highest band showing to the bottom of the lowest. Bands rather than one
 * probe because the observer reports only when a target's visible share
 * crosses a threshold: a single probe taller than the screen keeps the same
 * share while the conversation scrolls across its middle, and would report
 * nothing as the part on screen moved. A band holding an edge of the screen
 * changes its share with every step that edge moves.
 *
 * The overlays read the result as two insets, `--mthds-frame-top` and
 * `--mthds-frame-bottom`, the distances from the viewport's top and bottom edges to
 * the part on screen, each with `0px` as its fallback: where nothing is
 * measured (no observer, a server render, a frame entirely off screen) they
 * lay out against the viewport exactly as before, and on a page the bands all
 * show whole and both insets are 0.
 */

/** The distances, in pixels, from the viewport's top and bottom edges to the part on screen. */
export interface FrameInView {
  top: number;
  bottom: number;
}

/**
 * The least room an overlay is given, or the whole viewport when that is less.
 * A frame scrolled almost out of sight shows a sliver; a sheet squeezed into it
 * would hold nothing, so the room grows around the sliver, into the viewport,
 * up to this.
 */
export const FRAME_IN_VIEW_FLOOR_PX = 480;

/** How many bands cover the viewport. */
export const FRAME_BANDS = 10;

/** A band reports each time its visible share crosses a fiftieth. */
const BAND_THRESHOLDS = Array.from({ length: 51 }, (_, step) => step / 50);

/**
 * The insets of the part on screen, from the visible span (top and bottom, in
 * the viewport's coordinates) and the viewport's height. `null` when nothing is
 * on screen, so the overlays fall back to the whole viewport. A span shorter
 * than the floor grows around its middle, kept inside the viewport.
 */
export function frameInViewOf(
  visible: { top: number; bottom: number } | null,
  viewportHeight: number,
): FrameInView | null {
  if (visible === null || !(viewportHeight > 0)) return null;
  let top = Math.min(Math.max(visible.top, 0), viewportHeight);
  let bottom = Math.min(Math.max(visible.bottom, 0), viewportHeight);
  if (!(bottom > top)) return null;
  const floor = Math.min(viewportHeight, FRAME_IN_VIEW_FLOOR_PX);
  if (bottom - top < floor) {
    top = Math.max(0, top - (floor - (bottom - top)) / 2);
    bottom = Math.min(viewportHeight, top + floor);
    top = bottom - floor;
  }
  return { top: Math.round(top), bottom: Math.round(viewportHeight - bottom) };
}

/** The visible span of the bands that show, or `null` when none does. */
export function visibleSpanOf(
  bands: Iterable<{ top: number; bottom: number } | null>,
): { top: number; bottom: number } | null {
  let span: { top: number; bottom: number } | null = null;
  for (const band of bands) {
    if (band === null || !(band.bottom > band.top)) continue;
    span =
      span === null
        ? { top: band.top, bottom: band.bottom }
        : { top: Math.min(span.top, band.top), bottom: Math.max(span.bottom, band.bottom) };
  }
  return span;
}

const listeners = new Set<() => void>();
let current: FrameInView | null = null;
let watch: { refresh: () => void; stop: () => void } | null = null;

function publish(next: FrameInView | null) {
  if (next?.top === current?.top && next?.bottom === current?.bottom) return;
  current = next;
  for (const listener of listeners) listener();
}

/**
 * Puts the bands on the page and observes them. Nothing is put anywhere where
 * there is no observer to read them.
 */
function startWatching(): { refresh: () => void; stop: () => void } | null {
  if (typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return null;
  }
  const shown = new Map<Element, { top: number; bottom: number } | null>();
  const bands = Array.from({ length: FRAME_BANDS }, (_, index) => {
    const band = document.createElement('div');
    band.setAttribute('aria-hidden', 'true');
    band.setAttribute('data-mthds-frame-band', String(index));
    Object.assign(band.style, {
      position: 'fixed',
      left: '0',
      width: '1px',
      top: `${(index * 100) / FRAME_BANDS}%`,
      height: `${100 / FRAME_BANDS}%`,
      visibility: 'hidden',
      pointerEvents: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.append(band);
    shown.set(band, null);
    return band;
  });
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const { top, bottom } = entry.intersectionRect;
        shown.set(entry.target, entry.isIntersecting ? { top, bottom } : null);
      }
      publish(frameInViewOf(visibleSpanOf(shown.values()), window.innerHeight));
    },
    { threshold: BAND_THRESHOLDS },
  );
  const observeAll = () => {
    for (const band of bands) observer.observe(band);
  };
  observeAll();
  // A change of the viewport's own size moves every band; observing them again
  // has the observer report each from scratch.
  const refresh = () => {
    observer.disconnect();
    observeAll();
  };
  window.addEventListener('resize', refresh);
  return {
    refresh,
    stop: () => {
      window.removeEventListener('resize', refresh);
      observer.disconnect();
      for (const band of bands) band.remove();
      current = null;
    },
  };
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) watch = startWatching();
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    watch?.stop();
    watch = null;
  };
}

const snapshot = () => current;
const serverSnapshot = () => null;

/**
 * The part of the viewport on screen, while the calling component is mounted:
 * the first component to call it starts the watch and the last to unmount ends
 * it. A component that holds a dialog shut calls it too, so the reading is
 * there before the dialog opens rather than one frame after.
 */
export function useFrameInView(): FrameInView | null {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/**
 * An overlay's style with the insets of the part on screen set on it as
 * `--mthds-frame-top` and `--mthds-frame-bottom`, which its classes read with a `0px`
 * fallback. Mounting it asks the bands to report again, since the conversation
 * may have scrolled in the time since they last crossed a threshold.
 */
export function useFrameInViewStyle(style?: CSSProperties): CSSProperties | undefined {
  const inView = useFrameInView();
  useLayoutEffect(() => {
    watch?.refresh();
  }, []);
  if (inView === null) return style;
  return {
    '--mthds-frame-top': `${inView.top}px`,
    '--mthds-frame-bottom': `${inView.bottom}px`,
    ...style,
  } as CSSProperties;
}
