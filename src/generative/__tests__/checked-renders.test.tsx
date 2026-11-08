import type { Spec } from '@json-render/core';
import { createStateStore } from '@json-render/core';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { z } from 'zod';
import type { BrandManifest } from '../../brand/manifest';
import type { RunField } from '../../core';
import { catalog } from '../catalog';
import { layoutProblems } from '../layout-fits';
import { GenerativePage } from '../page';
import { validateAgainstCatalog } from '../validate';

/**
 * Whatever passes the checks renders without throwing.
 *
 * A host renders a layout because both checks said yes, so a renderer that
 * throws on one leaves the host with an element missing and nothing to say
 * why. json-render catches the throw in the boundary it wraps around every
 * element and logs it, which is how these tests see one.
 *
 * The checks hold the paths the descriptor owns, `/inputs` and `/result`, to
 * what the descriptor says they are; a layout's own scratch state is its
 * business, and its value is any JSON a `setState` wrote. So every prop a
 * layout may write as an expression is bound here to a scratch path holding
 * each hostile value in turn, and the layout is checked first: the property
 * is about layouts the checks accept.
 */

const BRAND: BrandManifest = {
  name: 'Acme',
  website: 'https://example.com',
  logo: { onLight: 'https://example.com/dark.svg', onDark: 'https://example.com/light.svg' },
  webfont: null,
};

/** The values a scratch path can hold: whatever JSON a layout's own `setState` wrote. */
const HOSTILE: readonly unknown[] = [
  undefined,
  null,
  42,
  'text',
  true,
  { a: 1 },
  // JSON a model wrote can carry a `toString` member, which `String` throws on.
  { toString: 1 },
  [],
  [null],
  [1, 'x', { a: 1 }, null, [2], { toString: 1 }],
];

/**
 * The escape hatches read the descriptor's own trees, which a layout may not
 * write, and a `Picture` names its path literally, which the checks refuse to
 * see as an expression; each is asserted on its own below.
 */
const SKIPPED = new Set(['MthdsField', 'MthdsResult', 'Picture']);

/** The children a container's renderer lays out, where it takes a fixed number. */
function childCount(type: string): number {
  const rule = (catalog.renders as Record<string, { children?: { count: number } }>)[type];
  return rule?.children?.count ?? 0;
}

function isClosedVocabulary(schema: z.ZodType): boolean {
  let current: unknown = schema;
  for (let depth = 0; depth < 8; depth += 1) {
    const def = (current as { def?: { type?: string; innerType?: unknown } }).def;
    if (!def) return false;
    if (def.type === 'enum' || def.type === 'literal') return true;
    if (def.innerType === undefined) return false;
    current = def.innerType;
  }
  return false;
}

/** A literal the closed prop's schema accepts: null where it may be, else its first option. */
function closedLiteral(schema: z.ZodType): unknown {
  if (schema.safeParse(null).success) return null;
  let current: unknown = schema;
  for (let depth = 0; depth < 8; depth += 1) {
    const def = (
      current as {
        def?: { type?: string; innerType?: unknown; entries?: object; values?: unknown[] };
      }
    ).def;
    if (!def) return undefined;
    if (def.type === 'enum') return Object.values(def.entries ?? {})[0];
    if (def.type === 'literal') return def.values?.[0];
    current = def.innerType;
  }
  return undefined;
}

/** One element of `type`, every open prop bound to its own scratch path, with the children it needs. */
function hostileSpec(type: string): Spec {
  const definition = (catalog.data.components as Record<string, { props: z.ZodObject }>)[type]!;
  const shape = definition.props.shape as Record<string, z.ZodType>;
  const props: Record<string, unknown> = {};
  for (const [name, schema] of Object.entries(shape)) {
    props[name] = isClosedVocabulary(schema)
      ? closedLiteral(schema)
      : { $state: `/scratch/${name}` };
  }
  const children = Array.from({ length: childCount(type) }, (_, index) => `child${index}`);
  const elements: Spec['elements'] = { only: { type, props, children } };
  for (const child of children) {
    elements[child] = { type: 'Text', props: { text: 'x', variant: null }, children: [] };
  }
  return { root: 'only', elements };
}

/** The render errors json-render's element boundary logged. */
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

function renderErrors(): string[] {
  return logged
    .filter((args) => typeof args[0] === 'string' && args[0].includes('Rendering error'))
    .map((args) => `${String(args[0])} ${String(args[1])}`);
}

describe('a component whose props read scratch state', () => {
  const types = (catalog.componentNames as readonly string[]).filter((type) => !SKIPPED.has(type));

  it.each(types)('renders %s without throwing, whatever JSON the state holds', (type) => {
    const spec = hostileSpec(type);
    // The property is about what the checks accept: a closed prop is a
    // literal, every other prop reads the layout's own scratch state.
    const verdict = validateAgainstCatalog(spec, {
      componentNames: catalog.componentNames,
      actionNames: catalog.actionNames,
      data: catalog.data,
      schema: catalog.schema,
    });
    // What the catalog says of the element's props; a page-level rule (one
    // h1, a landmark once) is about a whole page, not this element.
    const propProblems = verdict.problems
      .map((problem) => problem.message)
      .filter((message) => message.startsWith(type));
    expect(propProblems).toEqual([]);
    expect(layoutProblems({ inputs: [] }, spec)).toEqual([]);

    const failures: string[] = [];
    for (const value of HOSTILE) {
      const shape = (catalog.data.components as Record<string, { props: z.ZodObject }>)[type]!.props
        .shape as Record<string, unknown>;
      const scratch =
        value === undefined
          ? {}
          : Object.fromEntries(Object.keys(shape).map((name) => [name, value]));
      logged = [];
      const { unmount } = render(
        <GenerativePage
          spec={spec}
          store={createStateStore({ scratch })}
          scope={{}}
          brand={BRAND}
        />,
      );
      unmount();
      for (const error of renderErrors())
        failures.push(`${String(JSON.stringify(value))}: ${error}`);
    }
    expect(failures).toEqual([]);
  });
});

/** A result page's one element, over a store holding `result`. */
function resultPage(type: string, props: Record<string, unknown>, result: unknown) {
  const spec: Spec = { root: 'only', elements: { only: { type, props, children: [] } } };
  return render(
    <GenerativePage spec={spec} store={createStateStore({ result })} scope={{}} brand={BRAND} />,
  );
}

const SHARE = {
  label: 'Costs',
  total: null,
  of: null,
  unit: null,
  labelKey: 'category',
  valueKey: 'amount',
};

describe('a share whose parts are not all structures', () => {
  it('draws the parts that are, when the list a run returned holds a null', () => {
    const { container } = resultPage(
      'ProportionBar',
      { ...SHARE, items: { $state: '/result/costs' } },
      { costs: [null, { category: 'Food', amount: 40 }, 'Lodging', 7] },
    );
    expect(renderErrors()).toEqual([]);
    expect(container.querySelectorAll('li')).toHaveLength(1);
    expect(container.textContent).toContain('Food');
  });

  it('draws the parts whose amount is a number, when another amount is a structure carrying its own toString', () => {
    // `Number` throws on such a structure, which dropped the whole bar.
    const { container } = resultPage(
      'ProportionBar',
      { ...SHARE, items: { $state: '/result/costs' } },
      {
        costs: [
          { category: 'Food', amount: 40 },
          { category: 'Lodging', amount: { toString: 1 } },
        ],
      },
    );
    expect(renderErrors()).toEqual([]);
    expect(container.querySelectorAll('li')).toHaveLength(1);
    expect(container.textContent).toContain('Food');
  });

  it('draws the parts that are, when an inline entry is an expression that resolved to nothing', () => {
    const { container } = resultPage(
      'ProportionBar',
      {
        ...SHARE,
        items: [
          { $state: '/result/missing' },
          { category: 'Food', amount: { $state: '/result/food' } },
        ],
      },
      { food: 40 },
    );
    expect(renderErrors()).toEqual([]);
    expect(container.querySelectorAll('li')).toHaveLength(1);
  });
});

describe('a picture whose path is not a literal', () => {
  it('shows nothing inside a repeat over images, rather than the item itself, when the path resolves to nothing', () => {
    // Inside a repeat, `""` is the item itself, so a path held to the empty
    // text drew every item's image where the layout meant none.
    const spec: Spec = {
      root: 'shots',
      elements: {
        shots: {
          type: 'Stack',
          props: { direction: 'vertical' },
          repeat: { statePath: '/result/shots' },
          children: ['shot'],
        },
        shot: {
          type: 'Picture',
          props: { path: { $item: 'missing' }, alt: null, aspect: null },
          children: [],
        },
      },
    };
    const { container } = render(
      <GenerativePage
        spec={spec}
        store={createStateStore({
          result: { shots: [{ url: 'https://cdn.test/a.png', caption: 'A' }] },
        })}
        scope={{}}
        brand={BRAND}
      />,
    );
    expect(renderErrors()).toEqual([]);
    expect(container.querySelector('img')).toBeNull();
  });

  it('shows nothing, and does not throw, when a layout rendered past the checks binds it to nothing', () => {
    const { container } = resultPage(
      'Picture',
      { path: { $state: '/result/cover_url' }, alt: null, aspect: null },
      // The expression resolves to nothing: the result has no such member.
      {},
    );
    expect(renderErrors()).toEqual([]);
    expect(container.querySelector('img')).toBeNull();
  });
});

/**
 * A value a renderer writes out that is a structure, out of the layout's own
 * scratch state, used to read `[object Object]`; it shows what an absent
 * value shows.
 */
describe('a structure where a value is shown', () => {
  it.each([
    ['Fact', { label: 'Where', value: { $state: '/ui/place' }, detail: null }, '—'],
    ['Metric', { label: 'Total', value: { $state: '/ui/place' }, unit: null, format: null }, '—'],
  ])('is no text in a %s', (type, props, shown) => {
    const spec: Spec = { root: 'only', elements: { only: { type, props, children: [] } } };
    const { container } = render(
      <GenerativePage
        spec={spec}
        store={createStateStore({ ui: { place: { city: 'Lyon' } } })}
        scope={{}}
        brand={BRAND}
      />,
    );
    expect(container.textContent).not.toContain('[object Object]');
    expect(container.textContent).toContain(shown);
  });
});

/**
 * A hatch's `path` is relative inside a repeat, so one a layout rendered past
 * the checks read as a number from scratch state must not be written out as
 * text: `0` would bind the field to the item's first entry.
 */
describe("a hatch's path that is not a text", () => {
  it('resolves to nothing rather than to the entry its number names', () => {
    const spec: Spec = {
      root: 'rows',
      elements: {
        rows: {
          type: 'Stack',
          props: { direction: 'vertical', gap: null, align: null, justify: null, className: null },
          repeat: { statePath: '/inputs/matrix' },
          children: ['cell'],
        },
        cell: {
          type: 'MthdsField',
          props: { path: { $state: '/ui/index' }, label: null, hint: null },
          children: [],
        },
      },
    };
    const cell: RunField = { kind: 'text', name: 'cell', required: true };
    const matrix: RunField = {
      kind: 'list',
      name: 'matrix',
      required: true,
      item: { kind: 'list', name: 'row', required: true, item: cell },
    };
    render(
      <GenerativePage
        spec={spec}
        store={createStateStore({ inputs: { matrix: [['a']] }, ui: { index: 0 } })}
        scope={{ inputs: [matrix] }}
        brand={BRAND}
      />,
    );
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('No input at 0');
  });
});

/** Two tabs a layout wrote with one value are still two tabs. */
describe('tabs that share a value', () => {
  it('open one panel at a time, under keys React can tell apart', async () => {
    const STACK = { direction: 'vertical', gap: null, align: null, justify: null, className: null };
    const spec: Spec = {
      root: 'tabs',
      elements: {
        tabs: {
          type: 'Tabs',
          props: {
            tabs: [
              { label: 'One', value: 'same' },
              { label: 'Two', value: 'same' },
            ],
          },
          children: ['one', 'two'],
        },
        one: { type: 'Stack', props: STACK, children: ['first'] },
        two: { type: 'Stack', props: STACK, children: ['second'] },
        first: { type: 'Text', props: { text: 'First panel', variant: null }, children: [] },
        second: { type: 'Text', props: { text: 'Second panel', variant: null }, children: [] },
      },
    };
    render(<GenerativePage spec={spec} store={createStateStore({})} scope={{}} brand={BRAND} />);
    expect(screen.getByText('First panel')).toBeTruthy();
    expect(screen.queryByText('Second panel')).toBeNull();
    expect(logged.flat().join(' ')).not.toMatch(/same key/);
  });
});
