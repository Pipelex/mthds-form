import { expect, within } from 'storybook/test';
import type { RunField } from '../../../core';
import { skippable } from '../source-stories';
import { type BrandPlays, paintsFromTheTokens, type TextTarget } from './brand-plays';
import { tripLayout } from './trip-layouts';

/**
 * The trip planner's plays: the brand core (`brand-plays.ts`) over the trip
 * planner's fields, typing the budget. The budget rather than the first text
 * input because it is the field that proves the most: it must arrive as a
 * NUMBER on a brand-catalog page, where the rules ask for NumberInput on a
 * number path, and as whatever the producer's control writes on a
 * base-catalog page, which the reading records rather than the gate. The
 * reference play, for the hand-written spec, adds the rail mirroring the
 * budget through a bound SummaryRow, which is a choice that spec made rather
 * than a rule.
 */

function budget(chrome: boolean): TextTarget {
  return {
    name: 'budget',
    label: /budget/i,
    text: '2500',
    receipt: chrome ? /"budget": 2500/ : /"budget": "?2500"?/,
  };
}

/** The three plays of a brand's story file, over the trip planner's fields. */
export function tripPlays(fields: RunField[]): BrandPlays {
  const specOf = (args?: Record<string, unknown>) => tripLayout(String(args?.layout ?? ''))!;
  return {
    reference: skippable(async ({ canvasElement, args }) => {
      const { lightPage } = await paintsFromTheTokens({
        canvasElement,
        spec: specOf(args),
        fields,
        chrome: true,
        typing: budget(true),
      });
      // The rail mirrors the budget through a bound SummaryRow, not a second input.
      await expect(within(lightPage).getAllByText(/^2500$/)[0]).toBeInTheDocument();
    }),
    join: skippable(async ({ canvasElement, args }) => {
      await paintsFromTheTokens({
        canvasElement,
        spec: specOf(args),
        fields,
        chrome: false,
        typing: budget(false),
      });
    }),
    brandCatalog: skippable(async ({ canvasElement, args }) => {
      await paintsFromTheTokens({
        canvasElement,
        spec: specOf(args),
        fields,
        chrome: true,
        typing: budget(true),
      });
    }),
  };
}
