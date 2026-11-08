import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { act, render, screen, waitFor } from '@testing-library/react';
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

  it('is not refused by a field hidden since it registered its checks', async () => {
    // json-render's validation never forgets a field: a field hidden by its
    // `visible` condition kept its checks, and a run gated on all of them was
    // refused by a field nobody could see or correct.
    const hideable: Spec = {
      ...CHECKED,
      elements: {
        ...CHECKED.elements,
        city: { ...CHECKED.elements.city!, visible: { $state: '/ui/city' } },
      },
    };
    const onRun = vi.fn();
    const store = createStateStore({ inputs: { city: '' }, ui: { city: true } });
    render(<GenerativePage spec={hideable} store={store} scope={{}} onRun={onRun} />);
    expect(screen.getByRole('textbox', { name: /City/ })).toBeTruthy();
    act(() => store.set('/ui/city', false));
    expect(screen.queryByRole('textbox', { name: /City/ })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    await waitFor(() => expect(onRun).toHaveBeenCalledTimes(1));
  });

  it('is refused by the checks of a radio group, as by those of a text field', async () => {
    // The radio group, the checkbox and the switch render through another
    // helper than the text fields, which the run gate once did not see.
    const radio: Spec = {
      ...CHECKED,
      elements: {
        ...CHECKED.elements,
        city: {
          type: 'Radio',
          props: {
            label: 'Mode',
            name: 'mode',
            options: ['train', 'car'],
            value: { $bindState: '/inputs/mode' },
            checks: [{ type: 'required', message: 'Pick a mode' }],
            validateOn: null,
          },
          children: [],
        },
      },
    };
    const onRun = vi.fn();
    render(
      <GenerativePage
        spec={radio}
        store={createStateStore({ inputs: { mode: '' } })}
        scope={{}}
        onRun={onRun}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    expect(await screen.findByText('Pick a mode')).toBeTruthy();
    expect(onRun).not.toHaveBeenCalled();
  });

  it('holds two fields bound to one path to both their checks, and shows the failure', async () => {
    // Each registered its own checks over the other's at every render, a loop
    // React stopped, and the result written last hid the other's failure.
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const twice: Spec = {
      ...CHECKED,
      elements: {
        ...CHECKED.elements,
        page: { ...CHECKED.elements.page!, children: ['city', 'again', 'cta'] },
        again: {
          ...CHECKED.elements.city!,
          props: {
            ...CHECKED.elements.city!.props,
            label: 'City again',
            name: 'again',
            checks: [{ type: 'maxLength', args: { max: 10 }, message: 'Ten letters at most' }],
          },
        },
      },
    };
    const onRun = vi.fn();
    render(
      <GenerativePage
        spec={twice}
        store={createStateStore({ inputs: { city: '' } })}
        scope={{}}
        onRun={onRun}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    expect(onRun).not.toHaveBeenCalled();
    expect((await screen.findAllByText('Name a city')).length).toBeGreaterThan(0);
    expect(errors.mock.calls.flat().join(' ')).not.toMatch(/Maximum update depth/);
    errors.mockRestore();
  });

  it('is refused by a field on a step left behind, which stays mounted and hidden', async () => {
    // A step's panel used to unmount, taking its fields' checks out of the
    // page's record, so a run pressed on the last step started past them.
    const STACK = { direction: 'vertical', gap: null, align: null, justify: null, className: null };
    const stepped: Spec = {
      root: 'steps',
      elements: {
        steps: {
          type: 'Steps',
          props: { steps: ['Where', 'Go'], nextLabel: 'Next', backLabel: 'Back' },
          children: ['first', 'second'],
        },
        first: { type: 'Stack', props: STACK, children: ['city'] },
        second: { type: 'Stack', props: STACK, children: ['cta'] },
        city: CHECKED.elements.city!,
        cta: CHECKED.elements.cta!,
      },
    };
    const onRun = vi.fn();
    render(
      <GenerativePage
        spec={stepped}
        store={createStateStore({ inputs: { city: '' } })}
        scope={{}}
        onRun={onRun}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    await waitFor(() => expect(screen.getByText('Name a city')).toBeTruthy());
    expect(onRun).not.toHaveBeenCalled();
  });
});
