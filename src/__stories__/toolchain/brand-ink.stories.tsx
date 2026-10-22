import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect } from 'storybook/test';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/scalars';

/**
 * The brand's ink, as a rendered fact: the colour brand-coloured text takes
 * when a host defines `--brand`, and when it does not.
 *
 * The class is an arbitrary value carrying its own `var()` chain,
 * `var(--brand, var(--primary, …))`, and `scripts/assert-bundle.mjs` proves the
 * chain is SPELLED, in source and in the built sheet. Whether Tailwind
 * generates that utility at all, and whether the browser resolves the chain to
 * the colour it names, are browser questions, answered here on the enum
 * pill's checkmark - one of the texts that used to be `text-primary`.
 *
 * Both panes of the theme pair are asserted, because the fallback must follow
 * each theme's `--primary`, and a host restates `--brand` per theme as it
 * restates every token.
 */

const meta = {
  title: 'Toolchain/Brand Ink',
  component: CaseForm,
  args: {
    contracts: CONTRACTS,
    inputForm: INPUT_FORM,
    domain: 'scalars',
    pipeCode: 'enum_kind',
    initialValues: { priority: { level: 'high' } },
  },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An amber's ink on a white page, as the `./brand` entry derives it. */
const INK = '#9c6406';
const INK_RGB = 'rgb(156, 100, 6)';

/** Every selected pill's checkmark on the canvas, one per pane. */
function checkmarks(canvasElement: HTMLElement): SVGElement[] {
  const marks = [...canvasElement.querySelectorAll<SVGElement>('[data-state="on"] svg')];
  expect(marks.length).toBeGreaterThan(0);
  return marks;
}

/**
 * What a colour value computes to where an element sits, measured on a probe
 * placed beside it, so the comparison is between two computed styles in the
 * same pane rather than against a hard-coded palette.
 */
function computedColor(beside: Element, value: string): string {
  const probe = document.createElement('span');
  probe.style.color = value;
  beside.parentElement!.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/** No `--brand`: the checkmark takes `--primary`, exactly as before `--brand` was read. */
export const WithoutBrand: Story = {
  play: async ({ canvasElement }) => {
    for (const mark of checkmarks(canvasElement)) {
      expect(getComputedStyle(mark).color).toBe(computedColor(mark, 'var(--primary)'));
    }
  },
};

/**
 * A host's `--brand`: the checkmark takes the ink rather than the button
 * colour, which stays the pill's tint, since the button colour is only ever a
 * fill.
 */
export const WithBrand: Story = {
  decorators: [
    (Story) => (
      <div style={{ '--brand': INK } as React.CSSProperties}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    for (const mark of checkmarks(canvasElement)) {
      expect(getComputedStyle(mark).color).toBe(INK_RGB);
      expect(getComputedStyle(mark).color).not.toBe(computedColor(mark, 'var(--primary)'));
    }
  },
};
