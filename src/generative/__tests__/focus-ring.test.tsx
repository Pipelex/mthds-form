import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { BrandManifest } from '../../brand/manifest';
import { unringed } from '../../react/__tests__/unringed';
import { GenerativePage } from '../page';

/**
 * A produced page's controls draw their keyboard focus in `--ring`, as the
 * kernel's do (`src/react/__tests__/focus-ring.test.tsx` judges those). A
 * native radio or check box, an app bar's link or a collapsible section's
 * summary that draws none shows the browser's own ring, which no token reaches.
 */
describe('a produced page', () => {
  const BRAND: BrandManifest = {
    name: 'Acme',
    website: 'https://example.com',
    logo: { onLight: 'https://example.com/dark.svg', onDark: 'https://example.com/light.svg' },
    webfont: null,
  };

  const CHOICES: Spec = {
    root: 'page',
    elements: {
      page: { type: 'Stack', props: {}, children: ['bar', 'pace', 'insured', 'more'] },
      bar: {
        type: 'AppBar',
        props: { app: 'Trip planner', links: ['Trips', 'Help'] },
        children: [],
      },
      pace: {
        type: 'Radio',
        props: { label: 'Pace', name: 'pace', options: ['slow', 'fast'] },
        children: [],
      },
      insured: {
        type: 'Checkbox',
        props: { label: 'Insured', name: 'insured' },
        children: [],
      },
      more: { type: 'Collapsible', props: { title: 'More options' }, children: [] },
    },
  };

  it('draws the focus of an app bar’s links, a collapsible section, a radio group and a check box in --ring', () => {
    const { container } = render(
      <GenerativePage spec={CHOICES} store={createStateStore({})} scope={{}} brand={BRAND} />,
    );
    for (const name of ['Trips', 'Help']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
    expect(container.querySelector('summary')).toHaveTextContent('More options');
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByRole('checkbox', { name: 'Insured' })).toBeInTheDocument();
    expect(unringed(container)).toEqual([]);
  });
});
