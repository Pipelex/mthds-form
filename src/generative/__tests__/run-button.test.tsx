import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

/**
 * A field may carry checks of its own, which `validateForm` runs - and
 * json-render runs the binding after it whatever it recorded, so
 * `[validateForm, run]` started a billed run of a form its own checks had just
 * refused. The run is started only when every field's checks pass.
 */
describe('a run pressed while a field fails its own checks', () => {
  const CHECKED: Spec = {
    root: 'page',
    elements: {
      page: {
        type: 'Stack',
        props: { direction: 'vertical', gap: null, align: null, justify: null, className: null },
        children: ['city', 'cta'],
      },
      city: {
        type: 'Input',
        props: {
          label: 'City',
          name: 'city',
          type: null,
          placeholder: null,
          value: { $bindState: '/inputs/city' },
          checks: [{ type: 'required', message: 'Name a city' }],
          validateOn: null,
        },
        children: [],
      },
      cta: {
        type: 'Cta',
        props: { label: 'Plan my trip', hint: null },
        children: [],
        on: { press: [{ action: 'validateForm' }, { action: 'run' }] },
      },
    },
  };

  it('starts nothing, and shows the field its message, until the field passes', async () => {
    const onRun = vi.fn();
    const store = createStateStore({ inputs: { city: '' } });
    render(<GenerativePage spec={CHECKED} store={store} scope={{}} onRun={onRun} />);
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    expect(onRun).not.toHaveBeenCalled();
    expect(await screen.findByText('Name a city')).toBeTruthy();
    await userEvent.type(screen.getByRole('textbox', { name: /City/ }), 'Lyon');
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    await waitFor(() => expect(onRun).toHaveBeenCalledTimes(1));
  });
});
