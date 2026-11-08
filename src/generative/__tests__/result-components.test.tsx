import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
    await act(async () => finish());
    await act(async () => {
      fireEvent.click(button);
    });
    expect(calls).toHaveLength(2);
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
    await act(async () => finish());
    await act(async () => {
      fireEvent.click(button);
    });
    expect(calls).toHaveLength(2);
  });
});
