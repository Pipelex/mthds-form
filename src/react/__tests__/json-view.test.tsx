/**
 * The JSON view's block takes keyboard focus while it scrolls, and only then,
 * as a result table's box does. A result of several short values drew a tab
 * stop per block that scrolled nothing, each announced as a group named
 * "JSON". jsdom lays nothing out, so the widths are what a browser measures.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { DEFAULT_FIELD_STRINGS } from '../field-strings';
import { JsonView } from '../stuff-viewer';

const block = () => screen.getByRole('group', { name: DEFAULT_FIELD_STRINGS.viewJson });

/** The block's widths as the browser would measure them: its content's, then its own. */
function laidOut(scrollWidth: number, clientWidth: number) {
  vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(scrollWidth);
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(clientWidth);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("the JSON view's block", () => {
  it('is no tab stop while every line fits', () => {
    laidOut(240, 320);
    render(<JsonView value={{ total: 42 }} />);
    // Still named, so it says what it is to assistive technology; a stop with
    // nothing to scroll is what it no longer is.
    expect(block().hasAttribute('tabindex')).toBe(false);
  });

  it('takes focus while a line is wider than the block', () => {
    laidOut(900, 320);
    render(<JsonView value={{ note: 'A line long enough to scroll the block sideways.' }} />);
    expect(block().getAttribute('tabindex')).toBe('0');
  });

  it('measures again when the block resizes', () => {
    // jsdom lays nothing out and observes nothing, so an observer stands in
    // that the test can fire, as a browser does when the panel narrows.
    let resized: (() => void) | undefined;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    laidOut(300, 320);
    render(<JsonView value={{ note: 'Fits the wide panel, not the narrow one.' }} />);
    expect(block().hasAttribute('tabindex')).toBe(false);
    laidOut(300, 240);
    act(() => resized!());
    expect(block().getAttribute('tabindex')).toBe('0');
  });

  it('measures again once a webfont arrives, which widens its lines in a box that keeps its size', () => {
    // jsdom has no font set, so one stands in that can announce a load.
    const fonts = new EventTarget();
    Object.defineProperty(document, 'fonts', { value: fonts, configurable: true });
    try {
      laidOut(300, 320);
      render(<JsonView value={{ note: 'Fits in the fallback face, not in the webfont.' }} />);
      expect(block().hasAttribute('tabindex')).toBe(false);
      laidOut(340, 320);
      act(() => {
        fonts.dispatchEvent(new Event('loadingdone'));
      });
      expect(block().getAttribute('tabindex')).toBe('0');
    } finally {
      Reflect.deleteProperty(document, 'fonts');
    }
  });
});
