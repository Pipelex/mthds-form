import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GenerativePage } from '../page';

const one = (type: string, props: Record<string, unknown>): Spec => ({
  root: 'only',
  elements: { only: { type, props, children: [] } },
});

describe("a result page's components read result text as data", () => {
  it('paints a swatch only for a colour value, and never as a background image', () => {
    const { container } = render(
      <GenerativePage
        spec={one('Swatches', { colors: { $state: '/result/colors' } })}
        store={createStateStore({
          result: {
            colors: ['#102A43', 'url(https://attacker.test/collect?d=1)', 'oklch(70% 0.1 200)'],
          },
        })}
        scope={{}}
      />,
    );
    // The written values are what a reader sees under each tile; the URL is
    // dropped whole, tile and text.
    expect(container.textContent).toContain('#102A43');
    expect(container.textContent).toContain('oklch(70% 0.1 200)');
    expect(container.textContent).not.toContain('attacker');
    for (const tile of container.querySelectorAll<HTMLElement>('span[style]')) {
      expect(tile.style.backgroundImage).toBe('');
      expect(tile.getAttribute('style')).not.toMatch(/url\(/);
    }
  });

  it('keys a share by position, so two parts with one label both draw', () => {
    const { container } = render(
      <GenerativePage
        spec={one('ProportionBar', {
          label: 'Costs',
          total: null,
          of: null,
          unit: null,
          items: { $state: '/result/costs' },
          labelKey: 'category',
          valueKey: 'amount',
        })}
        store={createStateStore({
          result: {
            costs: [
              { category: 'Food', amount: 40 },
              { category: 'Food', amount: 25 },
            ],
          },
        })}
        scope={{}}
      />,
    );
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('lays out bullets as an unordered list and numbers as an ordered one', () => {
    const items = ['Pack light', 'Book early'];
    const { container, rerender } = render(
      <GenerativePage
        spec={one('TextList', { items, marker: 'bullet' })}
        store={createStateStore({})}
        scope={{}}
      />,
    );
    expect(container.querySelector('ul')).not.toBeNull();
    expect(container.querySelector('ol')).toBeNull();
    rerender(
      <GenerativePage
        spec={one('TextList', { items, marker: 'number' })}
        store={createStateStore({})}
        scope={{}}
      />,
    );
    expect(container.querySelector('ol')).not.toBeNull();
  });

  it('reads a date column as the calendar day written, whatever time stands beside it', () => {
    const { container } = render(
      <GenerativePage
        spec={one('DataTable', {
          rows: { $state: '/result/rows' },
          columns: [{ path: 'when', label: 'When', format: 'date' }],
          caption: null,
        })}
        store={createStateStore({
          result: { rows: [{ when: '2025-03-09 00:30' }, { when: '2025-03-09T23:30:00-08:00' }] },
        })}
        scope={{}}
      />,
    );
    const cells = [...container.querySelectorAll('td')].map((td) => td.textContent);
    expect(cells).toEqual(['9 Mar 2025', '9 Mar 2025']);
  });

  it('reads a native date in a date column by its day, never as its structure', () => {
    const { container } = render(
      <GenerativePage
        spec={one('DataTable', {
          rows: { $state: '/result/rows' },
          columns: [{ path: 'when', label: 'When', format: 'date' }],
          caption: null,
        })}
        store={createStateStore({
          result: { rows: [{ when: { date: '2025-03-09', time: '23:30' } }] },
        })}
        scope={{}}
      />,
    );
    expect([...container.querySelectorAll('td')].map((td) => td.textContent)).toEqual([
      '9 Mar 2025',
    ]);
  });

  it('shows a picture at its public URL when no host resolves its stored reference', () => {
    const { container } = render(
      <GenerativePage
        spec={one('Picture', { path: '/result/cover', alt: 'Cover', aspect: null })}
        store={createStateStore({
          result: {
            cover: {
              url: 'pipelex-storage://x/cover.png',
              public_url: 'https://cdn.test/cover.png',
            },
          },
        })}
        scope={{}}
      />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://cdn.test/cover.png');
  });

  it("sends no referrer to a picture's host, and names it by its caption when the layout does not", () => {
    const { container } = render(
      <GenerativePage
        spec={one('Picture', { path: '/result/cover', alt: null, aspect: null })}
        store={createStateStore({
          result: { cover: { url: 'https://cdn.test/cover.png', caption: 'The harbour at dawn' } },
        })}
        scope={{}}
      />,
    );
    const img = container.querySelector('img');
    expect(img?.getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(img?.getAttribute('alt')).toBe('The harbour at dawn');
  });
});

/**
 * Every number, amount and day a result component writes comes from one
 * formatter (`../format`), in one locale, with a currency's own cents.
 */
describe("a result page's components write numbers and days one way", () => {
  const share = (total: unknown, of: unknown = null): Spec =>
    one('ProportionBar', {
      label: 'Costs',
      total,
      of,
      unit: 'EUR',
      items: { $state: '/result/costs' },
      labelKey: 'category',
      valueKey: 'amount',
    });
  const costs = {
    costs: [
      { category: 'Coffee', amount: 3.99 },
      { category: 'Croissant', amount: 1.49 },
    ],
  };
  const figure = (container: HTMLElement) => container.querySelector('strong')?.textContent;

  it('keeps the cents of a share of money, so its parts add up to its total', () => {
    const { container } = render(
      <GenerativePage spec={share(null)} store={createStateStore({ result: costs })} scope={{}} />,
    );
    expect(figure(container)).toBe('€5.48');
    expect([...container.querySelectorAll('li')].map((li) => li.textContent)).toEqual([
      'Coffee €3.99',
      'Croissant €1.49',
    ]);
  });

  it('reads a total the payload carries as text as the number it writes out', () => {
    const { container } = render(
      <GenerativePage
        spec={share({ $state: '/result/total' }, { $state: '/result/budget' })}
        store={createStateStore({ result: { ...costs, total: '2400', budget: '3000.5' } })}
        scope={{}}
      />,
    );
    expect(figure(container)).toBe('€2,400');
    expect(container.textContent).toContain('of €3,000.50');
  });

  it('shows no figure for a total it cannot read, never the sum of its parts in its place', () => {
    const { container } = render(
      <GenerativePage
        spec={share({ $state: '/result/total' })}
        store={createStateStore({ result: { ...costs, total: 'about two thousand' } })}
        scope={{}}
      />,
    );
    expect(container.querySelector('strong')).toBeNull();
    expect(container.textContent).not.toContain('€5.48');
    // The parts still draw.
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('writes a text column as written, a number column grouped, and no format as a cell', () => {
    const { container } = render(
      <GenerativePage
        spec={one('DataTable', {
          rows: { $state: '/result/rows' },
          columns: [
            { path: 'year', label: 'Year', format: 'text' },
            { path: 'units', label: 'Units', format: 'number' },
            { path: 'raw', label: 'Raw', format: null },
          ],
          caption: null,
        })}
        store={createStateStore({
          result: {
            rows: [
              { year: 2024, units: '1234567.5', raw: 1234567 },
              // Written out in full, never in exponent notation; and a code
              // that `Number` would read as hexadecimal stays the text it is.
              { year: 1e21, units: '0x1A', raw: 1 },
            ],
          },
        })}
        scope={{}}
      />,
    );
    expect([...container.querySelectorAll('td')].map((td) => td.textContent)).toEqual([
      '2024',
      '1,234,567.5',
      '1,234,567',
      '1000000000000000000000',
      '0x1A',
      '1',
    ]);
  });

  it('writes a metric in the style it names, in the one locale', () => {
    const metric = (format: string | null) =>
      one('Metric', { label: 'Visitors', value: { $state: '/result/n' }, unit: null, format });
    const store = () => createStateStore({ result: { n: 1250000 } });
    const { container, rerender } = render(
      <GenerativePage spec={metric('compact')} store={store()} scope={{}} />,
    );
    expect(container.textContent).toContain('1.3m');
    rerender(<GenerativePage spec={metric('decimal')} store={store()} scope={{}} />);
    expect(container.textContent).toContain('1,250,000.00');
    rerender(<GenerativePage spec={metric(null)} store={store()} scope={{}} />);
    expect(container.textContent).toContain('1250000');
  });

  it('writes a date text as the day it names, as a date column does', () => {
    const { container } = render(
      <GenerativePage
        spec={one('DateText', { value: { $state: '/result/day' }, style: 'short', tone: null })}
        store={createStateStore({ result: { day: '2025-03-09 00:30' } })}
        scope={{}}
      />,
    );
    expect(container.textContent).toBe('9 Mar 2025');
  });

  it('shows no picture for a relative path outside any repeat, as a hatch resolves none', () => {
    const { container } = render(
      <GenerativePage
        spec={one('Picture', { path: 'cover', alt: null, aspect: null })}
        store={createStateStore({ cover: { url: 'https://cdn.test/cover.png' } })}
        scope={{}}
      />,
    );
    expect(container.querySelector('img')).toBeNull();
  });

  it('shows each image of a repeat when a picture names the item itself', () => {
    const { container } = render(
      <GenerativePage
        spec={{
          root: 'shots',
          elements: {
            shots: {
              type: 'Stack',
              props: { direction: 'vertical' },
              repeat: { statePath: '/result/shots' },
              children: ['shot'],
            },
            shot: { type: 'Picture', props: { path: '', alt: null, aspect: null }, children: [] },
          },
        }}
        store={createStateStore({
          result: {
            shots: [
              { url: 'https://cdn.test/a.png', caption: 'A' },
              { url: 'https://cdn.test/b.png', caption: 'B' },
            ],
          },
        })}
        scope={{}}
      />,
    );
    expect([...container.querySelectorAll('img')].map((img) => img.getAttribute('src'))).toEqual([
      'https://cdn.test/a.png',
      'https://cdn.test/b.png',
    ]);
  });
});

describe('a run starts once per press while it is going', () => {
  const PAGE: Spec = {
    root: 'cta',
    elements: {
      cta: {
        type: 'Cta',
        props: { label: 'Plan my trip', hint: null },
        children: [],
        on: { press: [{ action: 'run' }] },
      },
    },
  };

  it('ignores a second press while the run the first one started is pending', async () => {
    let finish: () => void = () => {};
    const calls: unknown[] = [];
    const onRun = (state: unknown) => {
      calls.push(state);
      return new Promise<void>((resolve) => {
        finish = resolve;
      });
    };
    render(<GenerativePage spec={PAGE} store={createStateStore({})} scope={{}} onRun={onRun} />);
    const button = screen.getByRole('button', { name: /Plan my trip/ });
    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
    });
    expect(calls).toHaveLength(1);
    // The guard outlasts the settled run by one task, the task json-render
    // runs the binding's chain in; a person's next press comes after it. The
    // release is scheduled only once the settled promise's callbacks have run,
    // after a timer set here at once, so the press waits a task beyond that.
    await act(async () => {
      finish();
      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(calls).toHaveLength(2);
  });

  // A run chained under the binding that ran is refused by the catalog
  // check, and the page holds to one run per press for a layout rendered
  // past it all the same: the guard used to be released as `onRun` settled,
  // before json-render reached the chain, so a rejected run started again.
  it.each([
    ['onError, after a run the host rejects', 'onError', () => Promise.reject(new Error('quota'))],
    ['onSuccess, after a run that returns nothing', 'onSuccess', () => undefined],
    ['onSuccess, after a run the host resolves', 'onSuccess', () => Promise.resolve()],
  ])('starts no second run from a chain under %s', async (_name, hook, outcome) => {
    const onRun = vi.fn(outcome);
    const chained: Spec = {
      root: 'cta',
      elements: {
        cta: {
          ...PAGE.elements.cta!,
          on: { press: { action: 'run', [hook]: { action: 'run' } } },
        },
      },
    };
    render(<GenerativePage spec={chained} store={createStateStore({})} scope={{}} onRun={onRun} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Plan my trip/ }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it('holds the guard for any thenable the host returns, not only a native promise', async () => {
    let finish: () => void = () => {};
    const calls: unknown[] = [];
    const onRun = (state: unknown) => {
      calls.push(state);
      const settled = new Promise<void>((resolve) => {
        finish = resolve;
      });
      // A promise from another realm fails `instanceof Promise`; a bare
      // thenable stands for it here.
      return { then: settled.then.bind(settled) } as unknown as Promise<void>;
    };
    render(<GenerativePage spec={PAGE} store={createStateStore({})} scope={{}} onRun={onRun} />);
    const button = screen.getByRole('button', { name: /Plan my trip/ });
    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
    });
    expect(calls).toHaveLength(1);
    // The guard outlasts the settled run by one task, the task json-render
    // runs the binding's chain in; a person's next press comes after it. The
    // release is scheduled only once the settled promise's callbacks have run,
    // after a timer set here at once, so the press waits a task beyond that.
    await act(async () => {
      finish();
      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(calls).toHaveLength(2);
  });
});
