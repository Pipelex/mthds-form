import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BrandManifest } from '../../brand/manifest';
import { BrandProvider } from '../brand-context';
import { BrandBar, GenerativePage } from '../index';
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

  it('names the cure when no brand is in scope', () => {
    expect(() => render(<BrandBar app="Trip planner" />)).toThrow(/no brand in scope/);
  });
});
