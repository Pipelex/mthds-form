/**
 * The overlays sit in the part of the viewport on screen.
 *
 * In a chat host's frame that grows with its content, the viewport is as tall
 * as the whole view and mostly scrolled out of sight: the team's files' sheet,
 * `fixed` from 1.5rem under the viewport's top to its bottom, was as tall as
 * the view, its head and its Use button far from what the person saw. The
 * overlays now read the part on screen, which hidden `fixed` bands report
 * through an `IntersectionObserver`, as two insets, and lay out between them.
 *
 * jsdom has no `IntersectionObserver` and lays nothing out, so these tests
 * stand one in and report what a browser would; `Inputs/Team Files in a Chat
 * Frame` holds the browser half.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog';
import {
  FRAME_BANDS,
  FRAME_IN_VIEW_FLOOR_PX,
  frameInViewOf,
  visibleSpanOf,
} from '../ui/frame-in-view';

describe('frameInViewOf', () => {
  it('reads a viewport shown whole as no inset at all', () => {
    expect(frameInViewOf({ top: 0, bottom: 1200 }, 1200)).toEqual({ top: 0, bottom: 0 });
  });

  it('reads the slice a conversation shows of a tall frame as the distances to its edges', () => {
    expect(frameInViewOf({ top: 700, bottom: 1500 }, 2100)).toEqual({ top: 700, bottom: 600 });
  });

  it('reads nothing on screen as no reading, so the overlays fall back to the viewport', () => {
    expect(frameInViewOf(null, 1200)).toBeNull();
    expect(frameInViewOf({ top: 300, bottom: 300 }, 1200)).toBeNull();
    expect(frameInViewOf({ top: 0, bottom: 100 }, 0)).toBeNull();
  });

  it('grows a sliver around its middle to the floor, inside the viewport', () => {
    const sliver = frameInViewOf({ top: 900, bottom: 1000 }, 2000);
    expect(sliver).toEqual({ top: 710, bottom: 810 });
    expect(2000 - sliver!.top - sliver!.bottom).toBe(FRAME_IN_VIEW_FLOOR_PX);
    // Held at the viewport's edges rather than pushed past them.
    expect(frameInViewOf({ top: 0, bottom: 80 }, 2000)).toEqual({
      top: 0,
      bottom: 2000 - FRAME_IN_VIEW_FLOOR_PX,
    });
    expect(frameInViewOf({ top: 1950, bottom: 2000 }, 2000)).toEqual({
      top: 2000 - FRAME_IN_VIEW_FLOOR_PX,
      bottom: 0,
    });
  });

  it('gives a viewport shorter than the floor all of itself', () => {
    expect(frameInViewOf({ top: 100, bottom: 200 }, 400)).toEqual({ top: 0, bottom: 0 });
  });
});

describe('visibleSpanOf', () => {
  it('runs from the top of the highest band showing to the bottom of the lowest', () => {
    expect(
      visibleSpanOf([
        null,
        { top: 250, bottom: 300 },
        { top: 300, bottom: 400 },
        { top: 400, bottom: 430 },
        null,
      ]),
    ).toEqual({ top: 250, bottom: 430 });
  });

  it('is nothing when no band shows', () => {
    expect(visibleSpanOf([null, { top: 20, bottom: 20 }])).toBeNull();
  });
});

/** An `IntersectionObserver` standing in for a browser's, reporting what a test tells it. */
class StandInObserver {
  static all: StandInObserver[] = [];
  readonly targets = new Set<Element>();
  constructor(readonly callback: IntersectionObserverCallback) {
    StandInObserver.all.push(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
  }
  takeRecords() {
    return [];
  }
}

/** The bands on the page, in order from the viewport's top. */
function bands(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-mthds-frame-band]'));
}

/**
 * Reports the part of the viewport from `top` to `bottom` as on screen, band
 * by band, as a browser's observer would: each band showing reports the part
 * of itself inside that span.
 */
function showSpan(top: number, bottom: number) {
  const height = window.innerHeight / FRAME_BANDS;
  const entries = bands().map((band, index) => {
    const bandTop = index * height;
    const shownTop = Math.max(bandTop, top);
    const shownBottom = Math.min(bandTop + height, bottom);
    const isIntersecting = shownBottom > shownTop;
    return {
      target: band,
      isIntersecting,
      intersectionRect: isIntersecting
        ? { top: shownTop, bottom: shownBottom }
        : { top: 0, bottom: 0 },
    } as unknown as IntersectionObserverEntry;
  });
  const observer = StandInObserver.all.at(-1);
  if (!observer) throw new Error('nothing observes the bands');
  act(() => observer.callback(entries, observer as unknown as IntersectionObserver));
}

function standInObserver() {
  StandInObserver.all = [];
  vi.stubGlobal('IntersectionObserver', StandInObserver);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function TeamFiles({ open }: { open: boolean }) {
  return (
    <Dialog open={open}>
      {open && (
        <DialogContent layout="sheet">
          <DialogTitle>Your team’s files</DialogTitle>
          <DialogDescription>Pick one</DialogDescription>
        </DialogContent>
      )}
    </Dialog>
  );
}

describe('a sheet in the part of the viewport on screen', () => {
  it('watches from the moment its dialog mounts shut, and stops when it goes', () => {
    standInObserver();
    const { unmount } = render(<TeamFiles open={false} />);
    expect(bands()).toHaveLength(FRAME_BANDS);
    expect(StandInObserver.all.at(-1)?.targets.size).toBe(FRAME_BANDS);
    for (const band of bands()) {
      expect(band.getAttribute('aria-hidden')).toBe('true');
      expect(band.style.position).toBe('fixed');
      expect(band.style.visibility).toBe('hidden');
      expect(band.style.pointerEvents).toBe('none');
      // As wide as the viewport, so a host clipping one column of the frame
      // leaves the rest of each band to intersect.
      expect(band.style.left).toBe('0px');
      expect(band.style.right).toBe('0px');
      expect(band.style.width).toBe('');
    }
    unmount();
    expect(bands()).toHaveLength(0);
  });

  it('lays the sheet out between the insets of the slice on screen, and follows it', () => {
    standInObserver();
    const viewport = window.innerHeight;
    const { rerender, unmount } = render(<TeamFiles open={false} />);
    // A conversation showing the middle of a frame taller than the screen.
    showSpan(viewport * 0.25, viewport * 0.9);
    rerender(<TeamFiles open />);
    const sheet = screen.getByRole('dialog');
    expect(sheet.style.getPropertyValue('--mthds-frame-top')).toBe(
      `${Math.round(viewport * 0.25)}px`,
    );
    expect(sheet.style.getPropertyValue('--mthds-frame-bottom')).toBe(
      `${Math.round(viewport * 0.1)}px`,
    );
    // The classes read the insets, each with the viewport's own edge as its fallback.
    expect(sheet.className).toContain('top-[calc(var(--mthds-frame-top,0px)+1.5rem)]');
    expect(sheet.className).toContain('bottom-[var(--mthds-frame-bottom,0px)]');
    expect(sheet.className).not.toMatch(/(^|\s)top-6(\s|$)/);

    showSpan(0, viewport * 0.7);
    expect(sheet.style.getPropertyValue('--mthds-frame-top')).toBe('0px');
    expect(sheet.style.getPropertyValue('--mthds-frame-bottom')).toBe(
      `${Math.round(viewport * 0.3)}px`,
    );
    unmount();
  });

  it('keeps a style the sheet is given, a drag’s transform among them', () => {
    standInObserver();
    const { unmount } = render(
      <Dialog open>
        <DialogContent layout="sheet" style={{ transform: 'translateY(40px)' }}>
          <DialogTitle>Your team’s files</DialogTitle>
          <DialogDescription>Pick one</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    showSpan(100, 600);
    const sheet = screen.getByRole('dialog');
    expect(sheet.style.transform).toBe('translateY(40px)');
    expect(sheet.style.getPropertyValue('--mthds-frame-top')).toBe('100px');
    unmount();
  });

  it('centres a question between the same insets', () => {
    standInObserver();
    const { unmount } = render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Replace what you entered?</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    showSpan(200, 700);
    const question = screen.getByRole('alertdialog');
    expect(question.style.getPropertyValue('--mthds-frame-top')).toBe('200px');
    expect(question.className).toContain('top-[var(--mthds-frame-top,0px)]');
    expect(question.className).toContain('m-auto');
    unmount();
  });

  it('lays out against the viewport, and adds nothing to the page, where nothing observes', () => {
    // jsdom's own window: no `IntersectionObserver`.
    expect(typeof IntersectionObserver).toBe('undefined');
    const { unmount } = render(<TeamFiles open />);
    const sheet = screen.getByRole('dialog');
    expect(sheet.style.getPropertyValue('--mthds-frame-top')).toBe('');
    expect(bands()).toHaveLength(0);
    unmount();
  });
});
