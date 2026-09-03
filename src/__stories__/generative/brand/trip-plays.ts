import type { Spec } from '@json-render/core';
import { expect, userEvent, within } from 'storybook/test';
import type { RunField } from '../../../core';
import { computeReadiness } from '../../../core';
import { BRANDS } from '../../_generated/brands/brands';
import { revealButton, revealInput } from '../play-helpers';
import { skippable } from '../source-stories';
import { resolveColor } from './tokens-schema';
import { tripLayout } from './trip-layouts';

/**
 * What a brand story proves, whichever layout it paints.
 *
 * Three plays over one core. The core is the claim every brand page makes:
 * the tokens reach the paint (the one button that runs the method is the
 * brand's accent, the page is set in the brand's typeface) and the kernel
 * still owns the inputs (what is typed lands in the /inputs tree, and the
 * readiness on the receipt is the kernel's own). The brand-catalog plays add
 * the manifest - one logo per pane - and the page's grammar: the one h1, the
 * budget arriving as a NUMBER. The reference play, for the hand-written spec,
 * adds the rail mirroring the budget through a bound SummaryRow, which is a
 * choice that spec made rather than a rule.
 */

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

/** `rgb(r, g, b)`, as a browser reports a computed opaque colour. */
function computedRgb(components: readonly number[]) {
  return `rgb(${components.map((channel) => Math.round(channel * 255)).join(', ')})`;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The label of the one element that runs the method - a Cta or a Button bound to `run`. */
function runLabel(spec: Spec): RegExp {
  const runner = Object.values(spec.elements).find((element) => {
    if (element.type !== 'Cta' && element.type !== 'Button') return false;
    const press = element.on?.press;
    const actions = (Array.isArray(press) ? press : [press]).map((binding) => binding?.action);
    return actions.includes('run');
  });
  const label = (runner?.props as { label?: unknown } | undefined)?.label;
  if (typeof label !== 'string') throw new Error('The spec has no Cta or Button that runs.');
  return new RegExp(`^${escapeRegExp(label)}$`, 'i');
}

interface Core {
  canvasElement: HTMLElement;
  layout: string;
  fields: RunField[];
  /** Whether the layout was written against the brand catalog. */
  chrome: boolean;
}

async function paintsFromTheTokens({ canvasElement, layout, fields, chrome }: Core) {
  const canvas = within(canvasElement);
  const [lightPage] = canvas.getAllByTestId('brand-page');
  const brand = BRANDS.find(
    (candidate) =>
      candidate.brand === lightPage!.dataset.brand &&
      candidate.producerId === lightPage!.dataset.producer,
  )!;
  const spec = tripLayout(layout)!;

  if (chrome) {
    // The manifest reaches the page: one logo per pane, each pane showing the
    // mark for its own canvas and hiding the other; and the Hero carries the
    // page's only h1.
    await expect(canvas.getAllByRole('img', { name: brand.manifest.name })).toHaveLength(
      BOTH_THEMES,
    );
    await expect(within(lightPage!).getAllByRole('heading', { level: 1 })).toHaveLength(1);
  }

  // The kernel still owns the inputs: what is typed lands in the /inputs tree
  // - as a NUMBER on a brand-catalog page, where the rules ask for NumberInput
  // on a number path; as whatever the producer's control writes on a
  // base-catalog page, which the reading records rather than the gate - and
  // the readiness on the receipt is the kernel's own over that tree.
  const budget = await revealInput(lightPage!, /budget/i, 'budget');
  await userEvent.type(budget, '2500');
  const [receipt] = within(lightPage!).getAllByTestId('inputs-receipt');
  await expect(receipt).toHaveTextContent(chrome ? /"budget": 2500/ : /"budget": "?2500"?/);
  const tree = JSON.parse(receipt!.textContent ?? '{}') as Record<string, unknown>;
  const readiness = computeReadiness(fields, tree);
  await expect(within(lightPage!).getAllByTestId('readiness')[0]).toHaveTextContent(
    `readiness ${readiness.ready}/${readiness.total}`,
  );
  // The tokens reach the paint: the one button that runs is the brand's
  // accent in the light pane, and the page is set in the brand's typeface.
  // Found AFTER the budget: on a wizard the button sits in the last step, and
  // the helpers only ever walk forward.
  const run = await revealButton(lightPage!, runLabel(spec));
  const primary = resolveColor(brand.tokens, 'primary', 'light')!;
  await expect(getComputedStyle(run).backgroundColor).toBe(computedRgb(primary.components));
  await expect(getComputedStyle(lightPage!).fontFamily).toContain(
    brand.tokens.font.sans.$value[0]!,
  );
  return { canvas, lightPage: lightPage! };
}

type Play = (context: {
  canvasElement: HTMLElement;
  args?: Record<string, unknown>;
}) => Promise<void>;

/** The three plays of a brand's story file, over the trip planner's fields. */
export function tripPlays(fields: RunField[]): {
  reference: Play;
  join: Play;
  brandCatalog: Play;
} {
  const layoutOf = (args?: Record<string, unknown>) => String(args?.layout ?? '');
  return {
    reference: skippable(async ({ canvasElement, args }) => {
      const { lightPage } = await paintsFromTheTokens({
        canvasElement,
        layout: layoutOf(args),
        fields,
        chrome: true,
      });
      // The rail mirrors the budget through a bound SummaryRow, not a second input.
      await expect(within(lightPage).getAllByText(/^2500$/)[0]).toBeInTheDocument();
    }),
    join: skippable(async ({ canvasElement, args }) => {
      await paintsFromTheTokens({ canvasElement, layout: layoutOf(args), fields, chrome: false });
    }),
    brandCatalog: skippable(async ({ canvasElement, args }) => {
      await paintsFromTheTokens({ canvasElement, layout: layoutOf(args), fields, chrome: true });
    }),
  };
}
