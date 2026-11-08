import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ValidationConfig } from '@json-render/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RunField } from '../../core';
import { FieldPresentationProvider } from '../../react';
import { useCheckedField } from '../checked-fields';
import { FrameHostProvider } from '../frame-host';
import { GenerativePage } from '../page';
import { generativeRegistry } from '../product-registry';

afterEach(() => {
  vi.restoreAllMocks();
});

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
 * The designer method tells a model writing a composer that the host's action
 * row says which inputs the run waits for, so the page writes nothing about
 * it; the action row drew only the time a run takes and the button, and so
 * nobody said it.
 */
describe('what a composer’s run waits for', () => {
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
  const field = (name: string, extra: Partial<RunField> = {}): RunField =>
    ({ kind: 'text', name, required: true, ...extra }) as RunField;

  it('names the inputs still empty beside the run button, which it describes', () => {
    const inputs = [
      field('destination', { title: 'Destination' }),
      field('travel_dates'),
      field('notes', { required: false }),
    ];
    const store = createStateStore({ inputs: {} });
    render(
      <FieldPresentationProvider presentation="app">
        <GenerativePage spec={COMPOSER} store={store} scope={{ inputs }} />
      </FieldPresentationProvider>,
    );
    const button = screen.getByRole('button', { name: /Plan my trip/ });
    expect(button).toHaveAccessibleDescription('Fill in Destination and Travel dates to run');
    act(() => store.set('/inputs/destination', 'Lisbon'));
    expect(button).toHaveAccessibleDescription('Fill in Travel dates to run');
    act(() => store.set('/inputs/travel_dates', 'May'));
    expect(button).not.toHaveAccessibleDescription();
    expect(screen.queryByText(/to run$/)).toBeNull();
  });

  it('counts an optional input once it is started, and the inputs past the first few', () => {
    const inputs = [
      field('a'),
      field('b'),
      field('c'),
      field('d'),
      field('e'),
      {
        kind: 'object',
        name: 'extra',
        required: false,
        fields: [field('x'), field('y')],
      } as RunField,
    ];
    const store = createStateStore({ inputs: { a: 'filled' } });
    render(
      <GenerativePage spec={COMPOSER} store={store} scope={{ inputs }} presentation="studio" />,
    );
    const button = screen.getByRole('button', { name: /Plan my trip/ });
    expect(button).toHaveAccessibleDescription('Fill in b, c, d and 1 more to run');
    act(() => store.set('/inputs/extra', { x: 'started' }));
    expect(button).toHaveAccessibleDescription('Fill in b, c, d and 2 more to run');
  });

  it('names the members a structure refuses, which a composer spreads over the page', () => {
    const inputs = [
      {
        kind: 'object',
        name: 'request',
        required: true,
        fields: [
          field('city', { title: 'City' }),
          field('budget', { title: 'Budget' }),
          field('notes', { required: false }),
          {
            kind: 'object',
            name: 'stay',
            title: 'Stay',
            required: false,
            fields: [field('hotel', { title: 'Hotel' }), field('nights', { title: 'Nights' })],
          } as RunField,
        ],
      } as RunField,
    ];
    const store = createStateStore({ inputs: {} });
    render(<GenerativePage spec={COMPOSER} store={store} scope={{ inputs }} />);
    const button = screen.getByRole('button', { name: /Plan my trip/ });
    expect(button).toHaveAccessibleDescription('Fill in City and Budget to run');
    act(() => store.set('/inputs/request', { city: 'Lisbon', stay: { hotel: 'Bairro' } }));
    expect(button).toHaveAccessibleDescription('Fill in Budget and Nights to run');
  });

  it('names the inputs as the page words and orders them, and as the descriptor does where the page does not', () => {
    const worded: Spec = {
      root: 'composer',
      elements: {
        composer: { ...COMPOSER.elements.composer!, children: ['city', 'name'] },
        name: {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            type: null,
            placeholder: null,
            value: { $bindState: '/inputs/request/title' },
            checks: null,
            validateOn: null,
          },
          children: [],
        },
        city: {
          type: 'MthdsField',
          props: { path: '/inputs/request/city', label: null, hint: null },
          children: [],
        },
      },
    };
    const inputs = [
      {
        kind: 'object',
        name: 'request',
        required: true,
        fields: [
          field('title', { title: 'Title' }),
          field('city', { title: 'City' }),
          field('budget', { title: 'Budget' }),
        ],
      } as RunField,
    ];
    render(
      <GenerativePage spec={worded} store={createStateStore({ inputs: {} })} scope={{ inputs }} />,
    );
    expect(screen.getByRole('button', { name: /Plan my trip/ })).toHaveAccessibleDescription(
      'Fill in City, Trip name and Budget to run',
    );
  });

  it('ranks a member where the page places its structure, and a structure where it places a member', () => {
    const placedWhole: Spec = {
      root: 'composer',
      elements: {
        composer: { ...COMPOSER.elements.composer!, children: ['a', 'request', 'b', 'c'] },
        a: {
          type: 'MthdsField',
          props: { path: '/inputs/a', label: null, hint: null },
          children: [],
        },
        request: {
          type: 'MthdsField',
          props: { path: '/inputs/request', label: null, hint: null },
          children: [],
        },
        b: {
          type: 'MthdsField',
          props: { path: '/inputs/b', label: null, hint: null },
          children: [],
        },
        c: {
          type: 'MthdsField',
          props: { path: '/inputs/c', label: null, hint: null },
          children: [],
        },
      },
    };
    const inputs = [
      field('b'),
      field('c'),
      field('a'),
      { kind: 'object', name: 'request', required: true, fields: [field('title')] } as RunField,
    ];
    render(
      <GenerativePage
        spec={placedWhole}
        store={createStateStore({ inputs: {} })}
        scope={{ inputs }}
        presentation="studio"
      />,
    );
    expect(screen.getByRole('button', { name: /Plan my trip/ })).toHaveAccessibleDescription(
      'Fill in a, title, b and 1 more to run',
    );
  });

  it('says which structure a member belongs to when two waiting members share a label', () => {
    const person = (name: string, title: string) =>
      ({
        kind: 'object',
        name,
        title,
        required: true,
        fields: [field('name', { title: 'Name' })],
      }) as RunField;
    render(
      <GenerativePage
        spec={COMPOSER}
        store={createStateStore({ inputs: {} })}
        scope={{ inputs: [person('sender', 'Sender'), person('recipient', 'Recipient')] }}
      />,
    );
    expect(screen.getByRole('button', { name: /Plan my trip/ })).toHaveAccessibleDescription(
      'Fill in Name (Sender) and Name (Recipient) to run',
    );
  });

  it('keeps the time a run takes beside what it waits for', () => {
    render(
      <FrameHostProvider host={{ eta: 'About a minute' }}>
        <GenerativePage
          spec={COMPOSER}
          store={createStateStore({ inputs: {} })}
          scope={{ inputs: [field('city', { title: 'City' })] }}
        />
      </FrameHostProvider>,
    );
    expect(screen.getByText('Fill in City to run')).toBeTruthy();
    expect(screen.getByText('About a minute')).toBeTruthy();
  });
});

/** A refused run focuses a radio group where its own tab stop is: the checked option. */
describe('a refused radio group', () => {
  it('takes the focus on its checked option', async () => {
    const spec: Spec = {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: { direction: 'vertical', gap: null, align: null, justify: null, className: null },
          children: ['mode', 'cta'],
        },
        mode: {
          type: 'Radio',
          props: {
            label: 'Mode',
            name: 'mode',
            options: ['train', 'car'],
            value: { $bindState: '/inputs/mode' },
            checks: [
              {
                type: 'equalTo',
                message: 'Pick the boat',
                args: { other: { $state: '/inputs/wanted' } },
              },
            ],
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
    const onRun = vi.fn();
    const store = createStateStore({ inputs: { mode: 'car', wanted: 'boat' } });
    render(
      <GenerativePage spec={spec} store={store} scope={{}} onRun={onRun} presentation="studio" />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    expect(onRun).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('radio', { name: 'car' })).toHaveFocus());
  });
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
    // React stopped, and the result written last hid the other's failure. The
    // spy is restored after each test, so a failing assertion here leaves the
    // console as it found it for the rest of the file.
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

/**
 * A tab, a step or a closed section keeps its fields mounted and hidden, so
 * their checks hold the run - and a run refused by one of them showed its
 * message inside a panel nobody could see. A refused run takes the person to
 * the first failing field instead: its panel opened, its message shown, the
 * focus on it.
 */
describe('a run refused by a field the person cannot see', () => {
  const STACK = { direction: 'vertical', gap: null, align: null, justify: null, className: null };
  const input = (name: string, label: string, message: string) => ({
    type: 'Input',
    props: {
      label,
      name,
      type: null,
      placeholder: null,
      value: { $bindState: `/inputs/${name}` },
      checks: [{ type: 'required', message }],
      validateOn: null,
    },
    children: [],
  });
  const cta = {
    type: 'Cta',
    props: { label: 'Plan my trip', hint: null },
    children: [],
    on: { press: [{ action: 'validateForm' }, { action: 'run' }] },
  };
  const note = { type: 'Text', props: { text: 'The trip', variant: null }, children: [] };
  const TABS = {
    type: 'Tabs',
    props: {
      tabs: [
        { label: 'Trip', value: 'trip' },
        { label: 'Where', value: 'where' },
      ],
    },
    children: ['first', 'second'],
  };

  function press(spec: Spec, inputs: Record<string, unknown> = { city: '' }) {
    const onRun = vi.fn();
    render(
      <GenerativePage spec={spec} store={createStateStore({ inputs })} scope={{}} onRun={onRun} />,
    );
    return onRun;
  }

  it('opens the tab holding the failing field, shows its message and puts the focus on it', async () => {
    const onRun = press({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: STACK, children: ['tabs', 'cta'] },
        tabs: TABS,
        first: { type: 'Stack', props: STACK, children: ['note'] },
        second: { type: 'Stack', props: STACK, children: ['city'] },
        note,
        city: input('city', 'City', 'Name a city'),
        cta,
      },
    });
    const field = screen.getByRole('textbox', { name: /City/, hidden: true });
    expect(field).not.toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    expect(onRun).not.toHaveBeenCalled();
    await waitFor(() => expect(field).toHaveFocus());
    expect(field).toBeVisible();
    expect(screen.getByText('Name a city')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Where' })).toHaveAttribute('aria-selected', 'true');
    // The message is the field's description, so it is heard with the focus.
    expect(field).toHaveAccessibleDescription('Name a city');
  });

  it('goes back to the step holding the failing field', async () => {
    const onRun = press({
      root: 'steps',
      elements: {
        steps: {
          type: 'Steps',
          props: { steps: ['Where', 'Go'], nextLabel: 'Next', backLabel: 'Back' },
          children: ['first', 'second'],
        },
        first: { type: 'Stack', props: STACK, children: ['city'] },
        second: { type: 'Stack', props: STACK, children: ['cta'] },
        city: input('city', 'City', 'Name a city'),
        cta,
      },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    const field = screen.getByRole('textbox', { name: /City/, hidden: true });
    expect(field).not.toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    await waitFor(() => expect(field).toHaveFocus());
    expect(field).toBeVisible();
    expect(screen.getByText('Name a city')).toBeVisible();
    expect(onRun).not.toHaveBeenCalled();
  });

  it('opens a closed section holding the failing field', async () => {
    const onRun = press({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: STACK, children: ['more', 'cta'] },
        more: {
          type: 'Collapsible',
          props: { title: 'More details', defaultOpen: false },
          children: ['city'],
        },
        city: input('city', 'City', 'Name a city'),
        cta,
      },
    });
    const field = screen.getByRole('textbox', { name: /City/, hidden: true });
    expect(field).not.toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    await waitFor(() => expect(field).toHaveFocus());
    expect(field).toBeVisible();
    expect(onRun).not.toHaveBeenCalled();
  });

  it('opens every panel around the failing field: a tab inside a step left behind', async () => {
    const onRun = press({
      root: 'steps',
      elements: {
        steps: {
          type: 'Steps',
          props: { steps: ['Where', 'Go'], nextLabel: 'Next', backLabel: 'Back' },
          children: ['tabs', 'last'],
        },
        tabs: TABS,
        first: { type: 'Stack', props: STACK, children: ['note'] },
        second: { type: 'Stack', props: STACK, children: ['city'] },
        last: { type: 'Stack', props: STACK, children: ['cta'] },
        note,
        city: input('city', 'City', 'Name a city'),
        cta,
      },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    const field = screen.getByRole('textbox', { name: /City/, hidden: true });
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    await waitFor(() => expect(field).toHaveFocus());
    expect(field).toBeVisible();
    expect(onRun).not.toHaveBeenCalled();
  });

  it('takes the person to the first failing field in the page, not the open one', async () => {
    press(
      {
        root: 'page',
        elements: {
          page: { type: 'Stack', props: STACK, children: ['tabs', 'cta'] },
          tabs: TABS,
          first: { type: 'Stack', props: STACK, children: ['city'] },
          second: { type: 'Stack', props: STACK, children: ['country'] },
          city: input('city', 'City', 'Name a city'),
          country: input('country', 'Country', 'Name a country'),
          cta,
        },
      },
      { city: '', country: '' },
    );
    await userEvent.click(screen.getByRole('tab', { name: 'Where' }));
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    const city = screen.getByRole('textbox', { name: /City/, hidden: true });
    await waitFor(() => expect(city).toHaveFocus());
    expect(city).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Trip' })).toHaveAttribute('aria-selected', 'true');
  });

  it("puts the focus on a host's own checked control that hands over its element", async () => {
    // A raw registry entry, as a host writes one beside this entry's.
    function HostCity() {
      const field = useCheckedField('/inputs/city', {
        checks: [{ type: 'required', message: 'Name a city' }],
      });
      return (
        <label>
          City
          <input ref={field.focusRef} aria-invalid={field.errors.length > 0 || undefined} />
        </label>
      );
    }
    const onRun = vi.fn();
    render(
      <GenerativePage
        spec={{
          root: 'page',
          elements: {
            page: { type: 'Stack', props: STACK, children: ['tabs', 'cta'] },
            tabs: TABS,
            first: { type: 'Stack', props: STACK, children: ['note'] },
            second: { type: 'Stack', props: STACK, children: ['city'] },
            note,
            city: { type: 'HostCity', props: { label: 'City' }, children: [] },
            cta,
          },
        }}
        store={createStateStore({ inputs: { city: '' } })}
        scope={{}}
        onRun={onRun}
        registry={{ ...generativeRegistry, HostCity: () => <HostCity /> }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    const field = screen.getByRole('textbox', { name: /City/, hidden: true });
    await waitFor(() => expect(field).toHaveFocus());
    expect(field).toBeVisible();
    expect(onRun).not.toHaveBeenCalled();
  });
});

/** A journey shows one step, and its own Back and Next move from the one shown. */
describe('a journey whose layout loses steps', () => {
  const STACK = { direction: 'vertical', gap: null, align: null, justify: null, className: null };
  const journey = (names: string[]): Spec => ({
    root: 'steps',
    elements: {
      steps: {
        type: 'Steps',
        props: { steps: names, nextLabel: 'Next', backLabel: 'Back' },
        children: names.map((_name, index) => `panel${index}`),
      },
      ...Object.fromEntries(
        names.map((_name, index) => [
          `panel${index}`,
          { type: 'Stack', props: STACK, children: [`text${index}`] },
        ]),
      ),
      ...Object.fromEntries(
        names.map((name, index) => [
          `text${index}`,
          { type: 'Text', props: { text: `On ${name}`, variant: null }, children: [] },
        ]),
      ),
    },
  });

  it('goes back one step from the step it shows, after a new layout removed the one reached', async () => {
    const store = createStateStore({});
    const { rerender } = render(
      <GenerativePage spec={journey(['A', 'B', 'C', 'D'])} store={store} scope={{}} />,
    );
    for (let step = 0; step < 3; step += 1) {
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    }
    expect(screen.getByText('On D')).toBeVisible();
    rerender(<GenerativePage spec={journey(['A', 'B'])} store={store} scope={{}} />);
    expect(screen.getByText('On B')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('On A')).toBeVisible();
  });
});

/**
 * A host's own checked control may make its checks conditional, as
 * json-render's validation config allows (`enabled`): the page's record must
 * not drop the condition when it combines a path's checks.
 */
describe("a host's conditional checks on a page", () => {
  const STACK = { direction: 'vertical', gap: null, align: null, justify: null, className: null };

  function host(config: ValidationConfig) {
    return function HostCity() {
      const field = useCheckedField('/inputs/city', config);
      return (
        <label>
          City
          <input ref={field.focusRef} />
        </label>
      );
    };
  }

  function renderWith(config: ValidationConfig, state: Record<string, unknown>, extra = false) {
    const HostCity = host(config);
    const onRun = vi.fn();
    render(
      <GenerativePage
        spec={{
          root: 'page',
          elements: {
            page: {
              type: 'Stack',
              props: STACK,
              children: extra ? ['city', 'again', 'cta'] : ['city', 'cta'],
            },
            city: { type: 'HostCity', props: { label: 'City' }, children: [] },
            again: {
              type: 'Input',
              props: {
                label: 'City again',
                name: 'again',
                type: null,
                placeholder: null,
                value: { $bindState: '/inputs/city' },
                checks: [{ type: 'maxLength', args: { max: 10 }, message: 'Ten letters at most' }],
                validateOn: null,
              },
              children: [],
            },
            cta: {
              type: 'Cta',
              props: { label: 'Plan my trip', hint: null },
              children: [],
              on: { press: { action: 'run' } },
            },
          },
        }}
        store={createStateStore(state)}
        scope={{}}
        onRun={onRun}
        registry={{ ...generativeRegistry, HostCity: () => <HostCity /> }}
      />,
    );
    return onRun;
  }

  const conditional: ValidationConfig = {
    checks: [{ type: 'required', message: 'Name a city' }],
    enabled: { $state: '/ui/strict' },
  };

  it('does not hold the run while its condition is off', async () => {
    const onRun = renderWith(conditional, { inputs: { city: '' }, ui: { strict: false } });
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    await waitFor(() => expect(onRun).toHaveBeenCalledTimes(1));
  });

  it('holds the run while its condition is on', async () => {
    const onRun = renderWith(conditional, { inputs: { city: '' }, ui: { strict: true } });
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: /City$/ })).toHaveFocus());
    expect(onRun).not.toHaveBeenCalled();
  });

  it('keeps each condition to its own checks when a catalog field shares the path', async () => {
    // The catalog's field asks for ten letters at most, always; the host's
    // asks for a city only while strict, which it is not.
    const onRun = renderWith(conditional, { inputs: { city: '' }, ui: { strict: false } }, true);
    await userEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
    await waitFor(() => expect(onRun).toHaveBeenCalledTimes(1));
  });
});
