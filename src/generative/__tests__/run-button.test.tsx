import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GenerativePage } from '../page';

/**
 * The control that starts a run is held while one is going. A host says so
 * through `env.disabled`, as it does for the plain form's submit; a page whose
 * run button ignored it let every extra press start a second billed run.
 */
describe('the run button of a produced page', () => {
  const PAGE: Spec = {
    root: 'page',
    elements: {
      page: {
        type: 'Stack',
        props: { direction: 'vertical', gap: null, align: null, justify: null },
        children: ['cta'],
      },
      cta: { type: 'Cta', props: { label: 'Plan my trip', hint: null }, children: [] },
    },
  };

  const COMPOSER: Spec = {
    root: 'composer',
    elements: {
      composer: {
        type: 'Composer',
        props: {
          headline: 'Plan a trip',
          lede: null,
          runLabel: 'Plan my trip',
          columns: null,
          notes: null,
        },
        children: [],
      },
    },
  };

  for (const [name, spec] of [
    ['a whole page’s Cta', PAGE],
    ['a Composer’s action row', COMPOSER],
  ] as const) {
    it(`holds ${name} while the host says a run is going`, () => {
      const { rerender } = render(
        <GenerativePage spec={spec} store={createStateStore({})} scope={{}} />,
      );
      expect(screen.getByRole('button', { name: /Plan my trip/ })).toBeEnabled();
      rerender(
        <GenerativePage
          spec={spec}
          store={createStateStore({})}
          scope={{ env: { disabled: true } }}
        />,
      );
      expect(screen.getByRole('button', { name: /Plan my trip/ })).toBeDisabled();
    });
  }
});
