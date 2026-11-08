import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { findFixture, type SpecFixture } from '../../../generative';
import type { AppStyleId } from '../../../brand';
import { atWidth, expectEveryTouchTarget, pinnedTo, type Viewport } from '../../touch-target';
import { GENERATIVE_STORY_PARAMETERS } from '../layout-page';
import { APPS, type AppKey } from './apps';
import { AppMoment, checkedLayout, type Moment } from './frame';
import { AppScope, styleFontsReady } from './scope';
import type { TeamKey } from './teams';

/**
 * A designed page fits the width it is given, whatever the browser's is.
 *
 * A host may set a designed page in a pane beside something else, say a
 * chat, so the page reads the width of the box it stands in and not the
 * viewport's. The stories here set a host's compose-then-result frame in a
 * 560px pane and a 400px pane on a wide screen, and at 375 and 1280 pixels, and
 * hold each to what its width is meant to draw: two columns from 512px, one
 * below it.
 */

/** The model every layout here was captured on: the one the designer method pins. */
const MODEL = 'gpt-6.1-sol';

interface PaneArgs {
  app: AppKey;
  moment: Moment;
  style: AppStyleId;
  team: TeamKey | 'none';
  /** The pane's width in pixels; absent, the page fills what it is given. */
  pane?: number;
  /** A stand-in for the run: what the host's state would hold instead of its payload. */
  stripResult?: readonly string[];
}

/** A payload with these members gone wherever they sit, as a sample's left-out paths are. */
function withoutMembers(value: unknown, members: readonly string[]): unknown {
  if (Array.isArray(value)) return value.map((item) => withoutMembers(item, members));
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !members.includes(key))
      .map(([key, held]) => [key, withoutMembers(held, members)]),
  );
}

function layoutFor(app: AppKey, moment: Moment, style: AppStyleId): SpecFixture {
  const frame = moment === 'compose' ? 'composer' : 'result';
  const host = APPS[app];
  return checkedLayout(
    host,
    findFixture(host.specs, host.pipeRef, `pipelex-method--${MODEL}--${frame}--${style}--seeded`),
  );
}

function Pane({ app, moment, style, team, pane, stripResult }: PaneArgs) {
  const host = React.useMemo(() => {
    const base = APPS[app];
    if (!stripResult) return base;
    const payload = withoutMembers(structuredClone(base.result.payload), stripResult);
    return { ...base, result: { ...base.result, payload } };
  }, [app, stripResult]);
  const teamKey = team === 'none' ? null : team;
  return (
    <AppScope style={style} team={teamKey}>
      <div data-pane="" style={pane ? { width: pane, maxWidth: '100%' } : undefined}>
        <AppMoment
          app={host}
          moment={moment}
          layout={layoutFor(app, moment, style)}
          team={teamKey}
        />
      </div>
    </AppScope>
  );
}

const meta = {
  title: 'Generative/Pane widths',
  component: Pane,
  args: { app: 'trip', moment: 'compose', style: 'soft', team: 'none' },
  parameters: {
    ...GENERATIVE_STORY_PARAMETERS,
    a11y: {
      config: {
        rules: [
          ...GENERATIVE_STORY_PARAMETERS.a11y.config.rules,
          // The pair view renders the host's page twice on one document, so
          // its one `main` is two. A host renders one.
          { id: 'landmark-no-duplicate-main', enabled: false },
          { id: 'landmark-one-main', enabled: false },
        ],
      },
    },
  },
} satisfies Meta<typeof Pane>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each designed page's root, the box its components read the width of, one per theme pane. */
function pageRoots(canvasElement: HTMLElement): HTMLElement[] {
  const roots = [...canvasElement.querySelectorAll<HTMLElement>('main [class*="@container"]')];
  return roots.filter((root) => root.parentElement?.closest('[class*="@container"]') === null);
}

/** A box that sits `position: fixed` inside the page covers the viewport, as a kernel dialog must. */
function expectFixedBoxCoversViewport(root: HTMLElement) {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;inset:0;visibility:hidden';
  root.append(probe);
  const box = probe.getBoundingClientRect();
  probe.remove();
  return expect({ x: box.x, y: box.y, width: box.width, height: box.height }).toEqual({
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  });
}

interface Expected {
  /** The headline's size in this page's layout. */
  headlinePx: number;
  /** The direction of a `ResultHeader` or of the Composer's action row. */
  direction: 'row' | 'column';
  /** The number of columns a `Composer` set in two columns shows. */
  columns: '2' | 'auto';
}

/** What a page of width below or from 512px draws: the two layouts of every frame component. */
const WIDE: Expected = { headlinePx: 38, direction: 'row', columns: '2' };
const NARROW: Expected = { headlinePx: 32, direction: 'column', columns: 'auto' };

async function expectLayout(
  canvasElement: HTMLElement,
  moment: Moment,
  expected: Expected,
  spec: SpecFixture['spec'],
): Promise<void> {
  await styleFontsReady();
  const roots = pageRoots(canvasElement);
  await expect(roots.length, 'one designed page per theme pane').toBe(2);
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  for (const root of roots) {
    await expect(getComputedStyle(root).containerType).toBe('inline-size');
    await expectFixedBoxCoversViewport(root);
    const headline = root.querySelector('h1')!;
    await expect(headline).toBeTruthy();
    if (moment === 'compose') {
      await expect(getComputedStyle(headline).fontSize).toBe(`${expected.headlinePx}px`);
      const group = root.querySelector('section')?.parentElement;
      await expect(group, 'the composer groups the inputs').toBeTruthy();
      const composer = Object.values(spec.elements).find((element) => element.type === 'Composer');
      const setInTwo = (composer?.props as { columns?: string } | undefined)?.columns === '2';
      await expect(getComputedStyle(group!).columnCount).toBe(setInTwo ? expected.columns : 'auto');
      const row = root.querySelector<HTMLElement>('[data-style-panel] .sticky');
      await expect(getComputedStyle(row!).flexDirection).toBe(
        expected.direction === 'row' ? 'row' : 'column-reverse',
      );
    } else {
      const header = headline.closest<HTMLElement>('.justify-between')!;
      await expect(getComputedStyle(header).flexDirection).toBe(expected.direction);
      await expect(getComputedStyle(headline).fontSize).toBe(
        expected.direction === 'row' ? '32px' : '28px',
      );
    }
  }
}

function inAPane(
  app: AppKey,
  moment: Moment,
  style: AppStyleId,
  pane: number,
  expected: Expected,
): Story {
  return {
    name: `${APPS[app].appName} · ${moment === 'compose' ? 'composer' : 'result'} · a ${pane}px pane on a wide screen`,
    args: { app, moment, style, team: 'none', pane },
    ...pinnedTo('desktop'),
    parameters: { ...pinnedTo('desktop').parameters, themePairStacked: true },
    play: async ({ canvasElement }) => {
      await atWidth('desktop');
      await expectLayout(canvasElement, moment, expected, layoutFor(app, moment, style).spec);
    },
  };
}

function atAViewport(
  app: AppKey,
  moment: Moment,
  style: AppStyleId,
  viewport: Viewport,
  expected: Expected,
): Story {
  const pinned = pinnedTo(viewport);
  return {
    name: `${APPS[app].appName} · ${moment === 'compose' ? 'composer' : 'result'} · at ${viewport === 'phone' ? 375 : 1280} pixels`,
    args: { app, moment, style, team: 'none' },
    ...pinned,
    parameters: { ...pinned.parameters, themePairStacked: true },
    play: async ({ canvasElement }) => {
      await atWidth(viewport);
      await expectLayout(canvasElement, moment, expected, layoutFor(app, moment, style).spec);
      if (viewport === 'phone') await expectEveryTouchTarget(canvasElement);
    },
  };
}

export const ComposerInA560Pane = inAPane('trip', 'compose', 'soft', 560, WIDE);
export const ResultInA560Pane = inAPane('invoice', 'result', 'soft', 560, WIDE);
export const ComposerInA400Pane = inAPane('trip', 'compose', 'soft', 400, NARROW);
export const ResultInA400Pane = inAPane('invoice', 'result', 'soft', 400, NARROW);
export const ComposerAt375 = atAViewport('trip', 'compose', 'soft', 'phone', NARROW);
export const ResultAt375 = atAViewport('invoice', 'result', 'soft', 'phone', NARROW);
export const ComposerAt1280 = atAViewport('trip', 'compose', 'soft', 'desktop', WIDE);
export const ResultAt1280 = atAViewport('invoice', 'result', 'soft', 'desktop', WIDE);

/**
 * What a written sample leaves out: the state the host holds with the
 * delegated and file paths absent, as a page designed with no run draws it.
 * The layout's picture, and each hatch over a file, is held to draw nothing
 * rather than an error or a broken image.
 */
export const ResultWithDelegatedPathsAbsent: Story = {
  name: 'Slide directions · result · the delegated paths absent',
  args: {
    app: 'slides',
    moment: 'result',
    style: 'editorial',
    team: 'none',
    stripResult: ['mockup'],
  },
  play: async ({ canvasElement }) => {
    await styleFontsReady();
    for (const page of pageRoots(canvasElement)) {
      await expect(page.querySelector('h1')).toBeTruthy();
      await expect(page.querySelector('img'), 'no picture of a file left out').toBeNull();
    }
  },
};
