import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { unringed } from '../../react/__tests__/unringed';
import { GenerativePage } from '../page';

/**
 * A produced page's controls draw their keyboard focus in `--ring`, as the
 * kernel's do (`src/react/__tests__/focus-ring.test.tsx` judges those). A
 * native radio or check box that draws none shows the browser's own ring,
 * which no token reaches.
 */
describe('a produced page', () => {
  const CHOICES: Spec = {
    root: 'page',
    elements: {
      page: { type: 'Stack', props: {}, children: ['pace', 'insured'] },
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
    },
  };

  it('draws a radio group’s and a check box’s focus in --ring', () => {
    const { container } = render(
      <GenerativePage spec={CHOICES} store={createStateStore({})} scope={{}} />,
    );
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByRole('checkbox', { name: 'Insured' })).toBeInTheDocument();
    expect(unringed(container)).toEqual([]);
  });
});
