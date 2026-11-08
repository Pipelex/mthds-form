import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { BrandManifest } from '../../brand/manifest';
import { GenerativePage } from '../page';

/**
 * The panels a style dresses on a produced page, the rail and the card, mark
 * themselves `data-style-panel`, the hook a host writes the style's field fill
 * through (`--input`), as on its own panel. Without it a field inside `bold`'s
 * muted panel takes the host's fill, which all but matches the panel, and in
 * the dark theme loses its edge. See docs/theming.md § "Style tokens".
 */
describe("a produced page's style panels", () => {
  const BRAND: BrandManifest = {
    name: 'Acme',
    website: 'https://example.com',
    logo: { onLight: 'https://example.com/dark.svg', onDark: 'https://example.com/light.svg' },
    webfont: null,
  };

  const PANELS: Spec = {
    root: 'page',
    elements: {
      page: { type: 'Stack', props: {}, children: ['rail', 'card'] },
      rail: { type: 'Rail', props: { title: 'At a glance' }, children: [] },
      card: { type: 'Card', props: { title: 'Your trip' }, children: [] },
    },
  };

  it('marks the rail and the card, and nothing else, as a style panel', () => {
    const { container } = render(
      <GenerativePage spec={PANELS} store={createStateStore({})} scope={{}} brand={BRAND} />,
    );
    const panels = [...container.querySelectorAll('[data-style-panel]')];
    expect(panels).toHaveLength(2);
    expect(panels[0]).toContainElement(screen.getByText('At a glance'));
    expect(panels[1]).toContainElement(screen.getByText('Your trip'));
  });
});
