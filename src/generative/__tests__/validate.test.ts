import { describe, expect, it } from 'vitest';
import { formatProblems, validateAgainstCatalog } from '../validate';

/**
 * The check a host runs on a layout before it renders it, beside `layoutFits`.
 *
 * A model writes the layout, so every rule here exists because a run broke it:
 * a component the catalog does not have, a prop it does not take, a literal of
 * the wrong type, a `Tabs` whose panels do not match its tabs, a heading order
 * that reads as a skipped section. The specs are written by hand because each
 * is the smallest shape that trips one rule - the corpus is what proves the
 * validator accepts the layouts we actually captured.
 */

describe('the validator', () => {
  it('rejects an unknown component, an unknown prop and a bad literal', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: { direction: 'sideways' }, children: ['a', 'b'] },
        a: { type: 'Carousel', props: {}, children: [] },
        b: { type: 'Heading', props: { text: 'x', size: 'xl' }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    const text = formatProblems(verdict.problems);
    expect(text).toContain('unknown component type "Carousel"');
    expect(text).toContain('Heading has no prop "size"');
    expect(text).toContain('Stack.direction');
  });

  it('wants one child per tab or step, two per split, and no Button as a panel', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: { type: 'Split', props: { ratio: '1:2' }, children: ['tabs', 'steps', 'x'] },
        tabs: {
          type: 'Tabs',
          props: {
            tabs: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ],
          },
          children: ['a'],
        },
        steps: { type: 'Steps', props: { steps: ['One', 'Two'] }, children: ['a', 'run'] },
        a: { type: 'Stack', props: {}, children: [] },
        x: { type: 'Stack', props: {}, children: [] },
        run: { type: 'Button', props: { label: 'Run' }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    const text = formatProblems(verdict.problems);
    expect(text).toContain('Tabs declares 2 panels but has 1 child');
    expect(text).toContain('Steps has a Button as a direct child');
    expect(text).toContain('Split takes exactly two children');
  });

  it('refuses a heading that skips a level, in render order', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['title', 'section', 'sub'] },
        title: { type: 'Heading', props: { text: 'Trip', level: 'h1' }, children: [] },
        section: { type: 'Heading', props: { text: 'Where', level: 'h3' }, children: [] },
        sub: { type: 'Heading', props: { text: 'Fine', level: 'h4' }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    const text = formatProblems(verdict.problems);
    expect(text).toContain('[section] Heading jumps to h3 after h1');
    expect(text).not.toContain('[sub]');
  });

  it('refuses an icon the catalog does not name', () => {
    const verdict = validateAgainstCatalog({
      root: 'i',
      elements: { i: { type: 'Icon', props: { name: 'Unicorn' }, children: [] } },
    });
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toContain('Icon.name');
  });

  it('accepts a bound prop where a literal would be the wrong type', () => {
    const verdict = validateAgainstCatalog({
      root: 'h',
      elements: {
        h: { type: 'Heading', props: { text: { $state: '/result/name' } }, children: [] },
      },
    });
    expect(verdict.ok, formatProblems(verdict.problems)).toBe(true);
  });
});
