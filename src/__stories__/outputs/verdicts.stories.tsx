import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/verdicts';
import { PAYLOADS } from '../_generated/verdicts.payloads';
import { DEFAULT_FIELD_STRINGS, FR_FIELD_STRINGS } from '../../react';
// The kernel's own wording, read as an oracle. It is internal and not part of
// the public API, which is why a story reaches it by its deep path.
import { humanizeEnumValue } from '../../react/field-presentation';
import { ResultView } from '../result-view';

/**
 * A judge's VERDICT — a yes or no, a rating on a scale of described levels,
 * one option of a declared set — in the two presentations.
 *
 * Each pipe is a `PipeJudge` carrier generated from
 * `src/__stories__/_structures/verdicts.mthds`, and each payload is what a real
 * run returned, measures included. In `app` a verdict is the answer, large,
 * and the producer's measure under it; the concept the descriptor states is
 * what says the record is a verdict, never the keys the value holds. In
 * `studio` it stays the record of its members, which is what a builder checks
 * a judge against.
 *
 * The assertions read the expected answer out of the payload rather than
 * naming it, for the reason `Outputs/Results` gives: a re-captured run may
 * answer differently, and the renderer is what is under test.
 */

const meta = {
  title: 'Outputs/Verdicts',
  component: ResultView,
  args: {
    contracts: CONTRACTS,
    outputForm: OUTPUT_FORM,
    domain: 'verdicts',
    pipeCode: 'yes_no_verdict',
    value: PAYLOADS['verdicts.yes_no_verdict'],
    presentation: 'app',
  },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

const s = DEFAULT_FIELD_STRINGS;

interface YesNo {
  yes_no: boolean;
  probability?: number;
}
interface Rating {
  level: number;
  label?: string;
  confidence?: number;
}
interface Choice {
  choice: string;
  confidence?: number;
}

const YES_NO = PAYLOADS['verdicts.yes_no_verdict'] as YesNo;
const RATING = PAYLOADS['verdicts.rating_verdict'] as Rating;
const CHOICE = PAYLOADS['verdicts.choice_verdict'] as Choice;

/**
 * A yes or no in `app`: the answer, and the probability of yes under it. No
 * "Output" title over it and no record of its members.
 */
export const YesNoInApp: Story = {
  name: 'Yes or no in app',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(YES_NO.yes_no ? s.yes : s.no)).toHaveLength(BOTH_THEMES);
    if (YES_NO.probability !== undefined) {
      await expect(canvas.getAllByText(s.yesProbability(YES_NO.probability))).toHaveLength(
        BOTH_THEMES,
      );
    }
    await expect(canvas.queryByText('Output')).toBeNull();
    await expect(canvas.queryByText('Yes no')).toBeNull();
  },
};

/** A rating in `app`: the name of the level, and the confidence in it. */
export const RatingInApp: Story = {
  name: 'Rating in app',
  args: { pipeCode: 'rating_verdict', value: RATING },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const answer = RATING.label ?? s.ratingLevel(RATING.level + 1);
    await expect(canvas.getAllByText(answer)).toHaveLength(BOTH_THEMES);
    if (RATING.confidence !== undefined) {
      await expect(canvas.getAllByText(s.verdictConfidence(RATING.confidence))).toHaveLength(
        BOTH_THEMES,
      );
    }
    await expect(canvas.queryByText('Probabilities')).toBeNull();
  },
};

/** A choice in `app`: the option in words, and the confidence in it. */
export const ChoiceInApp: Story = {
  name: 'Choice in app',
  args: { pipeCode: 'choice_verdict', value: CHOICE },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(humanizeEnumValue(CHOICE.choice))).toHaveLength(BOTH_THEMES);
    if (CHOICE.confidence !== undefined) {
      await expect(canvas.getAllByText(s.verdictConfidence(CHOICE.confidence))).toHaveLength(
        BOTH_THEMES,
      );
    }
  },
};

/** The same yes or no in French: the answer and its measure in the host's language. */
export const YesNoInFrench: Story = {
  name: 'Yes or no in French',
  args: { locale: 'fr' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fr = FR_FIELD_STRINGS;
    await expect(canvas.getAllByText(YES_NO.yes_no ? fr.yes : fr.no)).toHaveLength(BOTH_THEMES);
    if (YES_NO.probability !== undefined) {
      // The page's text is matched with its spaces collapsed, and French puts
      // a no-break space before the colon and the percent sign.
      const measure = fr.yesProbability(YES_NO.probability).replace(/\s+/g, ' ');
      await expect(canvas.getAllByText(measure)).toHaveLength(BOTH_THEMES);
    }
  },
};

/**
 * A rating in `studio`: the record of its members as the runtime states them,
 * under the method's own names, which a builder checks a judge against.
 */
export const RatingInStudio: Story = {
  name: 'Rating in studio',
  args: { pipeCode: 'rating_verdict', value: RATING, presentation: 'studio' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('level')).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText('confidence')).toHaveLength(BOTH_THEMES);
    if (RATING.confidence !== undefined) {
      await expect(canvas.queryByText(s.verdictConfidence(RATING.confidence))).toBeNull();
    }
  },
};
