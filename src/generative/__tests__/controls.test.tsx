import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { BrandManifest } from '../manifest';
import { GenerativePage } from '../page';

/**
 * The generative page's controls, as DOM facts: what a label points at, what
 * a brand component finds in scope. These render, so they run in jsdom - the
 * `generative-dom` project - where the gates beside them run in node.
 */

const BRAND: BrandManifest = {
  name: 'Acme',
  website: 'https://example.com',
  logo: { onLight: 'https://example.com/dark.svg', onDark: 'https://example.com/light.svg' },
  webfont: null,
};

/** The one element every captured layout opens with. */
const APP_BAR: Spec = {
  root: 'bar',
  elements: { bar: { type: 'AppBar', props: { app: 'Trip planner' }, children: [] } },
};

/**
 * Every captured layout opens with an `AppBar`, and the entry's own registry
 * renders it off the brand in scope - a requirement that was stated nowhere a
 * host read. What a host without one saw was not even a thrown render:
 * json-render wraps each element in a boundary that catches the throw, logs
 * it and renders nothing, so the bar was simply missing from the page. The
 * page takes the brand itself now, and the message the boundary logs names
 * the cure.
 */
describe('the brand the product chrome reads', () => {
  it('is in scope for the app bar when the page is given one', () => {
    render(<GenerativePage spec={APP_BAR} store={createStateStore({})} scope={{}} brand={BRAND} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getAllByAltText('Acme').length).toBeGreaterThan(0);
    expect(screen.getByText('Trip planner')).toBeInTheDocument();
  });

  it('is named as the cure, in the error the boundary reports, when the page is given none', () => {
    const reported = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(<GenerativePage spec={APP_BAR} store={createStateStore({})} scope={{}} />);
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      const errors = reported.mock.calls.flat().filter((arg) => arg instanceof Error);
      expect(errors.some((error) => /Pass `brand` to GenerativePage/.test(error.message))).toBe(
        true,
      );
    } finally {
      reported.mockRestore();
    }
  });
});
