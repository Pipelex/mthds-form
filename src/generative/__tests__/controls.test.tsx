import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { BrandManifest } from '../manifest';
import { GenerativePage } from '../page';
import { pick, pickKey } from '../ui/shadcn';

/**
 * The generative page's controls, as DOM facts: what a label points at, what
 * a brand component finds in scope. These render, so they run in jsdom - the
 * `generative-dom` project - where the gates beside them run in node.
 */

const BRAND: BrandManifest = {
  name: 'Acme',
  website: 'https://example.com',
  logo: { onLight: 'https://example.com/dark.svg', onDark: 'https://example.com/light.svg' },
  webfont: null,
};

/** The one element every captured layout opens with. */
const APP_BAR: Spec = {
  root: 'bar',
  elements: { bar: { type: 'AppBar', props: { app: 'Trip planner' }, children: [] } },
};

/**
 * Every captured layout opens with an `AppBar`, and the entry's own registry
 * renders it off the brand in scope - a requirement that was stated nowhere a
 * host read. What a host without one saw was not even a thrown render:
 * json-render wraps each element in a boundary that catches the throw, logs
 * it and renders nothing, so the bar was simply missing from the page. The
 * page takes the brand itself now, and the message the boundary logs names
 * the cure.
 */
describe('the brand the product chrome reads', () => {
  it('is in scope for the app bar when the page is given one', () => {
    render(<GenerativePage spec={APP_BAR} store={createStateStore({})} scope={{}} brand={BRAND} />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getAllByAltText('Acme').length).toBeGreaterThan(0);
    expect(screen.getByText('Trip planner')).toBeInTheDocument();
  });

  it('is named as the cure, in the error the boundary reports, when the page is given none', () => {
    const reported = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(<GenerativePage spec={APP_BAR} store={createStateStore({})} scope={{}} />);
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      const errors = reported.mock.calls.flat().filter((arg) => arg instanceof Error);
      expect(errors.some((error) => /Pass `brand` to GenerativePage/.test(error.message))).toBe(
        true,
      );
    } finally {
      reported.mockRestore();
    }
  });
});

/**
 * A layout lays a list out as a `repeat`, and every row of it mounts the same
 * controls. Five of the catalog's controls minted their DOM ids from
 * `props.name` alone, so every row minted the same id: clicking row three's
 * label focused row one's input, and axe reported duplicate ids. `useControlId`
 * already minted a per-instance id for every shadcn renderer; these are the
 * controls that predated it.
 */
describe('the ids the catalog controls mint', () => {
  const REPEATED: Spec = {
    root: 'page',
    elements: {
      page: { type: 'Stack', props: {}, children: ['rows'] },
      rows: {
        type: 'Stack',
        props: {},
        children: ['amount', 'note', 'pace', 'memo'],
        repeat: { statePath: '/inputs/lines' },
      },
      amount: { type: 'NumberInput', props: { label: 'Amount', name: 'amount' }, children: [] },
      note: { type: 'Input', props: { label: 'Note', name: 'note' }, children: [] },
      pace: {
        type: 'Segmented',
        props: { label: 'Pace', name: 'pace', options: ['slow', 'fast'] },
        children: [],
      },
      memo: { type: 'Textarea', props: { label: 'Memo', name: 'memo' }, children: [] },
    },
  };

  it('are unique across the rows of a repeat, and each label names its own control', () => {
    const { container } = render(
      <GenerativePage
        spec={REPEATED}
        store={createStateStore({ inputs: { lines: [{}, {}] } })}
        scope={{}}
        brand={BRAND}
      />,
    );
    const ids = [...container.querySelectorAll('[id]')].map((element) => element.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const label of container.querySelectorAll('label[for]')) {
      const target = container.querySelector(`[id="${label.getAttribute('for')}"]`);
      expect(target).not.toBeNull();
      expect(label.parentElement?.contains(target)).toBe(true);
    }
    for (const group of container.querySelectorAll('[aria-labelledby]')) {
      const name = container.querySelector(`[id="${group.getAttribute('aria-labelledby')}"]`);
      expect(name).not.toBeNull();
      expect(group.parentElement?.contains(name)).toBe(true);
    }
    expect(screen.getAllByLabelText('Amount')).toHaveLength(2);
    expect(screen.getAllByLabelText('Note')).toHaveLength(2);
    expect(screen.getAllByLabelText('Memo')).toHaveLength(2);
    expect(screen.getAllByRole('radiogroup', { name: 'Pace' })).toHaveLength(2);
  });
});

/**
 * Every renderer that maps a prop onto a class reads a closed map, and the
 * prop is model-written: an expression-valued prop skips the zod check and a
 * `$template` with nothing to interpolate resolves to a literal, so the key
 * can be any string at all. A bare lookup answers `constructor` with a
 * function off `Object.prototype`. `Heading` guarded that alone; the guard is
 * one function now, and every map goes through it.
 */
describe('the closed maps the renderers read', () => {
  const TABLE = { body: 'text-sm', caption: 'text-xs' };

  it('answer a prototype name with the fallback, never with what the map inherits', () => {
    expect(pick(TABLE, 'constructor', 'body')).toBe('text-sm');
    expect(pick(TABLE, 'toString', 'body')).toBe('text-sm');
    expect(pickKey(TABLE, '__proto__', 'caption')).toBe('caption');
    expect(pick(TABLE, null, 'caption')).toBe('text-xs');
    expect(pick(TABLE, undefined, 'body')).toBe('text-sm');
    expect(pick(TABLE, 'caption', 'body')).toBe('text-xs');
  });

  it('hold at the renderer: a prototype-named level is an h2, a prototype-named type is a status', () => {
    const PROTOTYPE_KEYED: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: { gap: 'constructor' }, children: ['title', 'note'] },
        title: { type: 'Heading', props: { text: 'Trip', level: 'constructor' }, children: [] },
        note: { type: 'Alert', props: { title: 'Saved', type: 'constructor' }, children: [] },
      },
    };
    const { container } = render(
      <GenerativePage spec={PROTOTYPE_KEYED} store={createStateStore({})} scope={{}} />,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Trip');
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(container.querySelectorAll('[class*="function"]')).toHaveLength(0);
  });
});
