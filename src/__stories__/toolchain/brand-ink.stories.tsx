import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect, userEvent } from 'storybook/test';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/scalars';
import { CONTRACTS as TRIP_CONTRACTS, INPUT_FORM as TRIP_INPUT_FORM } from '../_generated/trips';
import { SPECS as TRIP_SPECS } from '../_generated/trips.specs';
import { GENERATIVE_STORY_PARAMETERS, heroFields, makeLayoutPage } from '../generative/layout-page';

/**
 * The brand's colours, as rendered facts: what the controls paint with the
 * optional `--brand`, `--brand-muted` and `--brand-muted-foreground` tokens a
 * branding host defines, and what they paint without them.
 *
 * Each class is an arbitrary value carrying its own `var()` chain, and
 * `scripts/assert-bundle.mjs` proves every chain is SPELLED, in source and in
 * the built sheet. Whether Tailwind generates those utilities at all, and
 * whether the browser resolves each chain to the colour it names, are browser
 * questions, answered here on every element that reads them: an enum pill's
 * fill and checkmark, a produced page's tag, a completed step's chip, and a
 * field's focus border.
 *
 * Without the tokens, each must compute to exactly what the `--primary`
 * expression it replaced computes to, measured on a probe beside it in the
 * same pane. Both panes of the theme pair are asserted, because a fallback
 * follows each theme's `--primary`.
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

/**
 * An amber team's ink and pale fill on a white page, as `deriveBrandRoles`
 * derives them. The ink on the fill is set a shade apart from the ink on the
 * page, so a story can tell which of the two tokens an element read.
 */
const BRAND = { ink: '#9c6406', fill: '#fef3e2', fillInk: '#8a5a05' };
const RGB = { ink: 'rgb(156, 100, 6)', fill: 'rgb(254, 243, 226)', fillInk: 'rgb(138, 90, 5)' };

function Branded({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={
        {
          '--brand': BRAND.ink,
          '--brand-muted': BRAND.fill,
          '--brand-muted-foreground': BRAND.fillInk,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

/**
 * What a CSS value computes to where an element sits, measured on a probe
 * placed beside it, so the comparison is between two computed styles in the
 * same pane rather than against a hard-coded palette.
 */
function computed(beside: Element, property: 'color' | 'backgroundColor', value: string): string {
  const probe = document.createElement('span');
  probe.style[property] = value;
  beside.parentElement!.appendChild(probe);
  const result = getComputedStyle(probe)[property];
  probe.remove();
  return result;
}

const PRIMARY = 'var(--primary)';
const tint = (percent: number) => `color-mix(in oklab, var(--primary) ${percent}%, transparent)`;

/** Every selected pill on the canvas, one per pane, with its checkmark. */
function selectedPills(canvasElement: HTMLElement): [HTMLElement, SVGElement][] {
  const pills = [...canvasElement.querySelectorAll<HTMLElement>('button[data-state="on"]')];
  expect(pills.length).toBeGreaterThan(0);
  return pills.map((pill) => [pill, pill.querySelector('svg')!]);
}

/** No tokens: the pill and its checkmark paint what `bg-primary/10` and `text-primary` did. */
export const PillWithoutBrand: Story = {
  play: async ({ canvasElement }) => {
    for (const [pill, mark] of selectedPills(canvasElement)) {
      expect(getComputedStyle(pill).backgroundColor).toBe(
        computed(pill, 'backgroundColor', tint(10)),
      );
      expect(getComputedStyle(mark).color).toBe(computed(mark, 'color', PRIMARY));
    }
  },
};

/** A host's tokens: the pill takes the pale accent fill, and its checkmark the ink on it. */
export const PillWithBrand: Story = {
  decorators: [
    (Story) => (
      <Branded>
        <Story />
      </Branded>
    ),
  ],
  play: async ({ canvasElement }) => {
    for (const [pill, mark] of selectedPills(canvasElement)) {
      expect(getComputedStyle(pill).backgroundColor).toBe(RGB.fill);
      expect(getComputedStyle(mark).color).toBe(RGB.fillInk);
    }
  },
};

const Trip = makeLayoutPage(
  heroFields(TRIP_CONTRACTS, TRIP_INPUT_FORM, 'trips', 'plan_trip'),
  TRIP_SPECS,
);

/**
 * Two captured trip-planner layouts, in the stock palette: one opens on an
 * app bar carrying the method's tag, the other stages the form in steps.
 */
function TripPages() {
  return (
    <div className="flex flex-col gap-12">
      <Trip layout="pipelex-method--claude-4.8-opus" brand="stock" />
      <Trip layout="pipelex-method--gpt-5.5" brand="stock" />
    </div>
  );
}

function tags(canvasElement: HTMLElement): HTMLElement[] {
  const found = [...canvasElement.querySelectorAll<HTMLElement>('header span')].filter(
    (span) => span.textContent === 'trips.plan_trip',
  );
  expect(found.length).toBeGreaterThan(0);
  return found;
}

/** Each pane's first completed step's chip, after moving each Steps one step on. */
async function completedSteps(canvasElement: HTMLElement): Promise<HTMLElement[]> {
  const nexts = [...canvasElement.querySelectorAll<HTMLElement>('[data-testid="steps-next"]')];
  expect(nexts.length).toBeGreaterThan(0);
  for (const next of nexts) await userEvent.click(next);
  return nexts.map((next) => {
    const steps = next.closest('div.flex.flex-col')!;
    return steps.querySelector<HTMLElement>('ol li:first-child span')!;
  });
}

/** Every trip name field on the canvas, in document order. */
function titleFields(canvasElement: HTMLElement): HTMLInputElement[] {
  const fields = [...canvasElement.querySelectorAll<HTMLInputElement>('input[name="title"]')];
  expect(fields.length).toBeGreaterThan(0);
  return fields;
}

/**
 * Focus a field the way a keyboard user does, by tabbing to it, which is what
 * `:focus-visible` answers to; a scripted `focus()` after a click would not
 * match it.
 */
async function tabTo(field: HTMLInputElement) {
  for (let step = 0; step < 400 && document.activeElement !== field; step++) await userEvent.tab();
  expect(document.activeElement).toBe(field);
  expect(field.matches(':focus-visible')).toBe(true);
  // The field's `transition-colors` eases its border into the focus colour, and
  // a computed style read mid-transition is the colour it started from.
  await Promise.all(field.getAnimations().map((animation) => animation.finished));
}

/**
 * No tokens: the tag, the completed step and a field's focus border paint
 * what `bg-primary/10`, `bg-primary/15`, `text-primary` and `border-primary`
 * did.
 */
export const ChipsWithoutBrand: Story = {
  parameters: GENERATIVE_STORY_PARAMETERS,
  render: () => <TripPages />,
  play: async ({ canvasElement }) => {
    for (const field of titleFields(canvasElement)) {
      await tabTo(field);
      expect(getComputedStyle(field).borderTopColor).toBe(computed(field, 'color', PRIMARY));
    }
    for (const tag of tags(canvasElement)) {
      expect(getComputedStyle(tag).backgroundColor).toBe(
        computed(tag, 'backgroundColor', tint(10)),
      );
      expect(getComputedStyle(tag).color).toBe(computed(tag, 'color', PRIMARY));
    }
    for (const chip of await completedSteps(canvasElement)) {
      expect(chip.textContent).toBe('1');
      expect(getComputedStyle(chip).backgroundColor).toBe(
        computed(chip, 'backgroundColor', tint(15)),
      );
      expect(getComputedStyle(chip).color).toBe(computed(chip, 'color', PRIMARY));
    }
  },
};

/**
 * A host's tokens: the tag and the completed step take the pale accent fill
 * and the ink on it, and a focused field's border takes the ink.
 */
export const ChipsWithBrand: Story = {
  parameters: GENERATIVE_STORY_PARAMETERS,
  render: () => (
    <Branded>
      <TripPages />
    </Branded>
  ),
  play: async ({ canvasElement }) => {
    for (const field of titleFields(canvasElement)) {
      await tabTo(field);
      expect(getComputedStyle(field).borderTopColor).toBe(RGB.ink);
    }
    for (const tag of tags(canvasElement)) {
      expect(getComputedStyle(tag).backgroundColor).toBe(RGB.fill);
      expect(getComputedStyle(tag).color).toBe(RGB.fillInk);
    }
    for (const chip of await completedSteps(canvasElement)) {
      expect(getComputedStyle(chip).backgroundColor).toBe(RGB.fill);
      expect(getComputedStyle(chip).color).toBe(RGB.fillInk);
    }
  },
};
