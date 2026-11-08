import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { act, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BrandManifest } from '../../brand/manifest';
import { BrandProvider } from '../brand-context';
import { contentOf } from '../element-errors';
import { BrandBar, GenerativePage, generativeRegistry } from '../index';
import type { ElementErrorInfo } from '../index';

/**
 * json-render wraps every element in a boundary that catches what it throws,
 * logs it and renders nothing, so a host's own boundary around the page never
 * fires: the page arrives with an element missing and the host has nothing to
 * act on. `onElementError` is how the page tells it, so the documented
 * fallback - a render error means the plain view - can mean what it says.
 */

const BRAND: BrandManifest = {
  name: 'Acme',
  website: 'https://example.com',
  logo: { onLight: 'https://example.com/dark.svg', onDark: 'https://example.com/light.svg' },
  webfont: null,
};

/** What json-render's own boundary logged. */
let logged: unknown[][] = [];
beforeEach(() => {
  logged = [];
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    logged.push(args);
  });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

/** A page whose app bar throws, for want of a brand, above a heading that renders. */
const BARRED: Spec = {
  root: 'page',
  elements: {
    page: { type: 'Stack', props: { direction: 'vertical' }, children: ['bar', 'title'] },
    bar: { type: 'AppBar', props: { app: 'Trip planner', links: null, tag: null }, children: [] },
    title: {
      type: 'Heading',
      props: { text: 'Plan the trip', level: 'h1' },
      children: [],
    },
  },
};

describe('an element that throws while rendering', () => {
  it('is reported to the host once, by its type, and the rest of the page still renders', () => {
    const reports: [unknown, ElementErrorInfo][] = [];
    render(
      <GenerativePage
        spec={BARRED}
        store={createStateStore({})}
        scope={{}}
        onElementError={(error, info) => reports.push([error, info])}
      />,
    );
    expect(reports).toHaveLength(1);
    const [error, info] = reports[0]!;
    expect(String(error)).toContain('no brand in scope');
    expect(info.type).toBe('AppBar');
    expect(typeof info.componentStack).toBe('string');
    expect(screen.getByRole('heading', { name: 'Plan the trip' })).toBeTruthy();
  });

  it('lets the host fall back to its plain view from the report', () => {
    function Host() {
      const [failed, setFailed] = React.useState(false);
      return failed ? (
        <p>plain form</p>
      ) : (
        <GenerativePage
          spec={BARRED}
          store={createStateStore({})}
          scope={{}}
          onElementError={() => setFailed(true)}
        />
      );
    }
    render(<Host />);
    expect(screen.getByText('plain form')).toBeTruthy();
  });

  it('is reported by the element whose children threw, when a run returns a list as a word', () => {
    // A repeat maps over what its path holds, and a payload is the run's: the
    // descriptor's list arrived as a text. The throw is in the repeat, which
    // renders as the children of the element that carries it.
    const spec: Spec = {
      root: 'lines',
      elements: {
        lines: {
          type: 'Stack',
          props: { direction: 'vertical' },
          repeat: { statePath: '/result/lines' },
          children: ['line'],
        },
        line: { type: 'Text', props: { text: { $item: 'label' }, variant: null }, children: [] },
      },
    };
    const onElementError = vi.fn();
    render(
      <GenerativePage
        spec={spec}
        store={createStateStore({ result: { lines: 'not a list' } })}
        scope={{}}
        brand={BRAND}
        onElementError={onElementError}
      />,
    );
    expect(onElementError).toHaveBeenCalledTimes(1);
    expect(onElementError.mock.calls[0]![1]).toMatchObject({ type: 'Stack' });
  });

  it('calls the latest callback the host passed, not the one the page mounted with', () => {
    const first = vi.fn();
    const second = vi.fn();
    const store = createStateStore({});
    const { rerender } = render(
      <GenerativePage spec={null} store={store} scope={{}} onElementError={first} />,
    );
    rerender(<GenerativePage spec={BARRED} store={store} scope={{}} onElementError={second} />);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('is reported, not thrown out of the page, when the root element fails while its props resolve', () => {
    // json-render resolves a `$template` before any renderer runs, and writes
    // out what it interpolates with `String`, which throws on JSON carrying a
    // `toString` member; at the root no element's boundary is above it.
    const spec: Spec = {
      root: 'title',
      elements: {
        title: {
          type: 'Heading',
          props: { text: { $template: 'For ${/result/name}' }, level: 'h1' },
          children: [],
        },
      },
    };
    const onElementError = vi.fn();
    const mount = () =>
      render(
        <GenerativePage
          spec={spec}
          store={createStateStore({ result: { name: { toString: 1 } } })}
          scope={{}}
          brand={BRAND}
          onElementError={onElementError}
        />,
      );
    expect(mount).not.toThrow();
    expect(onElementError).toHaveBeenCalledTimes(1);
    expect(onElementError.mock.calls[0]![1]).toMatchObject({ type: 'Heading' });
  });

  it('is reported by the element it is in, when a repeat path cannot be resolved', () => {
    // A repeat path relative to the list around it, written without its
    // member, throws as json-render resolves it - inside the element's render,
    // where its own boundary catches it and reports it. The list around it is
    // a Card, so the type reported says which of the two boundaries it was.
    const spec: Spec = {
      root: 'rows',
      elements: {
        rows: {
          type: 'Card',
          props: { title: null, description: null },
          repeat: { statePath: '/rows' },
          children: ['cells'],
        },
        cells: {
          type: 'Stack',
          props: { direction: 'horizontal' },
          repeat: { statePath: {} as { $item: string } },
          children: ['cell'],
        },
        cell: { type: 'Text', props: { text: 'cell', variant: null }, children: [] },
      },
    };
    const onElementError = vi.fn();
    render(
      <GenerativePage
        spec={spec}
        store={createStateStore({ rows: [{ cells: [1] }] })}
        scope={{}}
        onElementError={onElementError}
      />,
    );
    expect(onElementError).toHaveBeenCalledTimes(1);
    expect(onElementError.mock.calls[0]![1]).toMatchObject({ type: 'Stack' });
  });

  it('keeps every element mounted when the host starts or stops passing the callback', () => {
    const store = createStateStore({});
    const page = (onElementError?: () => void) => (
      <GenerativePage
        spec={BARRED}
        store={store}
        scope={{}}
        brand={BRAND}
        {...(onElementError ? { onElementError } : {})}
      />
    );
    const { rerender } = render(page());
    const heading = screen.getByRole('heading', { name: 'Plan the trip' });
    rerender(page(() => {}));
    expect(screen.getByRole('heading', { name: 'Plan the trip' })).toBe(heading);
    rerender(page());
    expect(screen.getByRole('heading', { name: 'Plan the trip' })).toBe(heading);
  });

  it('keeps every element mounted when the host hands a registry rebuilt on each render', () => {
    const store = createStateStore({});
    const page = () => (
      <GenerativePage
        spec={BARRED}
        store={store}
        scope={{}}
        brand={BRAND}
        registry={{ ...generativeRegistry }}
      />
    );
    const { rerender } = render(page());
    const heading = screen.getByRole('heading', { name: 'Plan the trip' });
    rerender(page());
    expect(screen.getByRole('heading', { name: 'Plan the trip' })).toBe(heading);
  });

  it('reports to a callback the host starts passing in the very render that fails', () => {
    const onElementError = vi.fn();
    const store = createStateStore({});
    const { rerender } = render(<GenerativePage spec={null} store={store} scope={{}} />);
    rerender(
      <GenerativePage spec={BARRED} store={store} scope={{}} onElementError={onElementError} />,
    );
    expect(onElementError).toHaveBeenCalledTimes(1);
  });

  it('hands the error on to json-render when the host stops passing the callback in the render that fails', () => {
    const store = createStateStore({});
    const { rerender } = render(
      <GenerativePage spec={null} store={store} scope={{}} onElementError={() => {}} />,
    );
    rerender(<GenerativePage spec={BARRED} store={store} scope={{}} />);
    expect(
      logged.some(
        (args) => typeof args[0] === 'string' && args[0].includes('Rendering error in <AppBar>'),
      ),
    ).toBe(true);
  });

  it('reports a failing root once to a host that builds its spec in render and counts the reports', () => {
    // A spec parsed inline is a new object at every render, and a report that
    // sets the host's state renders it again: a root boundary that retried on
    // every new spec object threw and reported until React gave up.
    const stored = JSON.stringify({
      root: 'title',
      elements: {
        title: {
          type: 'Heading',
          props: { text: { $template: 'For ${/result/name}' }, level: 'h1' },
          children: [],
        },
      },
    });
    const store = createStateStore({ result: { name: { toString: 1 } } });
    let reports = 0;
    function Host() {
      const [, setCount] = React.useState(0);
      return (
        <GenerativePage
          spec={JSON.parse(stored) as Spec}
          store={store}
          scope={{}}
          brand={BRAND}
          onElementError={() => {
            reports += 1;
            setCount((count) => count + 1);
          }}
        />
      );
    }
    expect(() => render(<Host />)).not.toThrow();
    expect(reports).toBe(1);
  });

  it('records a failure once, at json-render, when the host passes no callback', () => {
    const caught: unknown[] = [];
    render(<GenerativePage spec={BARRED} store={createStateStore({})} scope={{}} />, {
      onCaughtError: (error) => caught.push(error),
    });
    expect(caught).toHaveLength(1);
  });

  it('reports nothing for a page that renders cleanly', () => {
    const onElementError = vi.fn();
    render(
      <GenerativePage
        spec={BARRED}
        store={createStateStore({})}
        scope={{}}
        brand={BRAND}
        onElementError={onElementError}
      />,
    );
    expect(onElementError).not.toHaveBeenCalled();
  });

  it('is still dropped and logged, as json-render does, when the host passes no callback', () => {
    render(<GenerativePage spec={BARRED} store={createStateStore({})} scope={{}} />);
    expect(screen.getByRole('heading', { name: 'Plan the trip' })).toBeTruthy();
    expect(
      logged.some(
        (args) => typeof args[0] === 'string' && args[0].includes('Rendering error in <AppBar>'),
      ),
    ).toBe(true);
  });
});

/**
 * json-render's own boundary latches: an element that threw once stays blank
 * for as long as it is mounted. A host that keeps a designed page up while
 * its state changes - a run's payload arriving, a field corrected - could not
 * recover it without remounting the page, so this boundary tries again when
 * what the element renders from changes, and only then.
 */
describe('an element that threw, once what it renders from is corrected', () => {
  const STACK = { direction: 'vertical', gap: null, align: null, justify: null, className: null };
  const LINES: Spec = {
    root: 'page',
    elements: {
      page: { type: 'Stack', props: STACK, children: ['list'] },
      list: {
        type: 'Stack',
        props: STACK,
        repeat: { statePath: '/result/lines' },
        children: ['line'],
      },
      line: { type: 'Text', props: { text: { $item: 'name' }, variant: null }, children: [] },
    },
  };

  it.each([
    ['with a handler', true],
    ['without one', false],
  ])('draws again without remounting the page, %s', (_name, withHandler) => {
    const store = createStateStore({ result: { lines: 'not a list' } });
    const onElementError = vi.fn();
    render(
      <GenerativePage
        spec={LINES}
        store={store}
        scope={{}}
        onElementError={withHandler ? onElementError : undefined}
      />,
    );
    expect(screen.queryByText('Lyon')).toBeNull();
    act(() => store.set('/result/lines', [{ name: 'Lyon' }]));
    expect(screen.getByText('Lyon')).toBeTruthy();
    if (withHandler) expect(onElementError).toHaveBeenCalledTimes(1);
  });

  it('draws a child whose props threw, once the store holds what they read', () => {
    // A child's props are resolved inside the child's render, so its throw is
    // caught by the element above, whose own props have not changed.
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: STACK, children: ['title'] },
        title: {
          type: 'Heading',
          props: { text: { $template: 'For ${/result/name}' }, level: 'h1' },
          children: [],
        },
      },
    };
    const store = createStateStore({ result: { name: { toString: 1 } } });
    const onElementError = vi.fn();
    render(<GenerativePage spec={spec} store={store} scope={{}} onElementError={onElementError} />);
    expect(onElementError).toHaveBeenCalledTimes(1);
    act(() => store.set('/result/name', 'Lyon'));
    expect(screen.getByRole('heading', { name: 'For Lyon' })).toBeTruthy();
    expect(onElementError).toHaveBeenCalledTimes(1);
  });

  it('draws a repeated child whose props threw, once the store outside the list holds what they read', () => {
    // A repeated child's props are resolved in its render, under the item's
    // scope, and a throw there is the repeating element's to catch - whose
    // own props and list have not changed.
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: STACK, children: ['list'] },
        list: {
          type: 'Stack',
          props: STACK,
          repeat: { statePath: '/result/lines' },
          children: ['line'],
        },
        line: {
          type: 'Text',
          props: { text: { $template: '${/result/unit}: ${name}' }, variant: null },
          children: [],
        },
      },
    };
    const store = createStateStore({
      result: { lines: [{ name: 'Lyon' }], unit: { toString: 1 } },
    });
    const onElementError = vi.fn();
    render(<GenerativePage spec={spec} store={store} scope={{}} onElementError={onElementError} />);
    expect(onElementError).toHaveBeenCalledTimes(1);
    act(() => store.set('/result/unit', 'City'));
    expect(screen.getByText('City: Lyon')).toBeTruthy();
    expect(onElementError).toHaveBeenCalledTimes(1);
  });

  it('draws a root whose props threw, once the store holds what they read', () => {
    const spec: Spec = {
      root: 'title',
      elements: {
        title: {
          type: 'Heading',
          props: { text: { $template: 'For ${/result/name}' }, level: 'h1' },
          children: [],
        },
      },
    };
    const store = createStateStore({ result: { name: { toString: 1 } } });
    const onElementError = vi.fn();
    render(<GenerativePage spec={spec} store={store} scope={{}} onElementError={onElementError} />);
    expect(onElementError).toHaveBeenCalledTimes(1);
    act(() => store.set('/result/name', 'Lyon'));
    expect(screen.getByRole('heading', { name: 'For Lyon' })).toBeTruthy();
  });

  it('draws once a layout patched in place is handed again, judged against what failed', () => {
    // What the root failed on is read when it fails: read later, a layout the
    // host corrected in place before its next render was taken for the one
    // that failed, and the correction never drew.
    const spec: Spec = {
      root: 'title',
      elements: {
        title: {
          type: 'Heading',
          props: { text: { $template: 'For ${/result/name}' }, level: 'h1' },
          children: [],
        },
      },
    };
    const store = createStateStore({ result: { name: { toString: 1 } } });
    const onElementError = vi.fn();
    const { rerender } = render(
      <GenerativePage spec={spec} store={store} scope={{}} onElementError={onElementError} />,
    );
    expect(onElementError).toHaveBeenCalledTimes(1);
    spec.elements.title!.props = { text: 'For anyone', level: 'h1' };
    rerender(
      <GenerativePage
        spec={{ ...spec }}
        store={store}
        scope={{}}
        onElementError={onElementError}
      />,
    );
    expect(screen.getByRole('heading', { name: 'For anyone' })).toBeTruthy();
  });

  it('reports once an element that starts failing after it drew', () => {
    // React runs the update hook before the catch in the commit that throws,
    // and the boundary took the input that threw for a corrected one.
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: STACK, children: ['title'] },
        title: {
          type: 'Heading',
          props: { text: { $template: 'For ${/result/name}' }, level: 'h1' },
          children: [],
        },
      },
    };
    const store = createStateStore({ result: { name: 'Lyon' } });
    const onElementError = vi.fn();
    render(<GenerativePage spec={spec} store={store} scope={{}} onElementError={onElementError} />);
    expect(screen.getByRole('heading', { name: 'For Lyon' })).toBeTruthy();
    act(() => store.set('/result/name', { toString: 1 }));
    expect(onElementError).toHaveBeenCalledTimes(1);
  });

  it('does not try again at every render when what it renders from is no JSON', () => {
    // A host's store may hold a big integer, which JSON cannot write; read
    // afresh as a new object at each render, it once compared as changed.
    const store = createStateStore({ result: { lines: { count: BigInt(10) } } });
    const onElementError = vi.fn();
    render(
      <GenerativePage spec={LINES} store={store} scope={{}} onElementError={onElementError} />,
    );
    act(() => store.set('/ui/elsewhere', 1));
    act(() => store.set('/ui/elsewhere', 2));
    expect(onElementError).toHaveBeenCalledTimes(1);
  });

  it('neither tries again nor reports again while what it renders from is unchanged', () => {
    const store = createStateStore({ result: { lines: 'not a list' } });
    const onElementError = vi.fn();
    render(
      <GenerativePage spec={LINES} store={store} scope={{}} onElementError={onElementError} />,
    );
    act(() => store.set('/ui/elsewhere', 1));
    act(() => store.set('/ui/elsewhere', 2));
    expect(onElementError).toHaveBeenCalledTimes(1);
  });

  it('reports nothing while the layout is loading, and what still fails once it ends', () => {
    const store = createStateStore({ result: { lines: 'not a list' } });
    const onElementError = vi.fn();
    const { rerender } = render(
      <GenerativePage
        spec={LINES}
        store={store}
        scope={{}}
        loading
        onElementError={onElementError}
      />,
    );
    expect(onElementError).not.toHaveBeenCalled();
    rerender(
      <GenerativePage
        spec={LINES}
        store={store}
        scope={{}}
        loading={false}
        onElementError={onElementError}
      />,
    );
    expect(onElementError).toHaveBeenCalledTimes(1);
  });
});

/**
 * What a failed boundary compares, to tell a corrected input from the one it
 * failed on: the content, whatever objects carry it.
 */
describe('the content a failed boundary compares', () => {
  it('writes a structure held at two places out at both', () => {
    const shared = { name: 'Lyon' };
    expect(contentOf({ list: [shared], read: shared })).toBe(
      contentOf({ list: [{ name: 'Lyon' }], read: { name: 'Lyon' } }),
    );
  });

  it('sees a change at the second place a structure was held', () => {
    const shared = { name: 'Lyon' };
    expect(contentOf({ list: [shared], read: shared })).not.toBe(
      contentOf({ list: [shared], read: '[cycle]' }),
    );
  });

  it('still writes a structure inside itself out, once', () => {
    const loop: Record<string, unknown> = { name: 'Lyon' };
    loop.self = loop;
    expect(contentOf(loop)).toBe('{"name":"Lyon","self":"[cycle]"}');
  });

  it('gives up on sharing nested so deep that writing it out would freeze the page', () => {
    let shared: object = { v: 1 };
    for (let level = 0; level < 30; level += 1) shared = { a: shared, b: shared };
    const started = Date.now();
    expect(contentOf(shared)).toBe('an input that cannot be written out');
    expect(Date.now() - started).toBeLessThan(1000);
  });
});

/**
 * The brand's mark, for a host to draw as its own chrome: over a plain form,
 * or above a designed page whose layout has no app bar. It used to be drawn
 * only by the catalog's `AppBar`, so a host built a one-element spec and a
 * second page to show its own logo.
 */
describe('the brand bar a host draws itself', () => {
  it("draws the brand's logo pair and the app's name off the brand in scope", () => {
    const { container } = render(
      <BrandProvider manifest={BRAND}>
        <BrandBar app="Trip planner" tag="travel.plan_trip" />
      </BrandProvider>,
    );
    const banner = screen.getByRole('banner');
    expect(banner.textContent).toContain('Trip planner');
    expect(banner.textContent).toContain('travel.plan_trip');
    const logos = [...container.querySelectorAll('img')];
    expect(logos.map((img) => img.getAttribute('src'))).toEqual([
      BRAND.logo.onLight,
      BRAND.logo.onDark,
    ]);
    expect(logos.every((img) => img.getAttribute('referrerpolicy') === 'no-referrer')).toBe(true);
  });

  it("is what the catalog's AppBar draws", () => {
    const own = render(
      <BrandProvider manifest={BRAND}>
        <BrandBar app="Trip planner" links={['Docs']} />
      </BrandProvider>,
    );
    const ownHtml = own.container.innerHTML;
    own.unmount();
    const spec: Spec = {
      root: 'bar',
      elements: {
        bar: {
          type: 'AppBar',
          props: { app: 'Trip planner', links: ['Docs'], tag: null },
          children: [],
        },
      },
    };
    const page = render(
      <GenerativePage spec={spec} store={createStateStore({})} scope={{}} brand={BRAND} />,
    );
    expect(page.container.innerHTML).toBe(ownHtml);
  });

  it('draws a link the layout names twice twice, under keys React can tell apart', () => {
    const { container } = render(
      <BrandProvider manifest={BRAND}>
        <BrandBar app="Trip planner" links={['Docs', 'Docs']} />
      </BrandProvider>,
    );
    expect(container.querySelectorAll('nav a')).toHaveLength(2);
    expect(logged.flat().join(' ')).not.toMatch(/same key/);
  });

  it('names the cure when no brand is in scope', () => {
    expect(() => render(<BrandBar app="Trip planner" />)).toThrow(/no brand in scope/);
  });
});
