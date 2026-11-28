import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CaseForm } from '../case-form';
import { SPEC_INPUT_CONTRACTS, SPEC_INPUT_FORM } from '../_spec-shaped';

/**
 * The controls a method's meaning draws (MTHDS `9.2.0`): a number's unit and
 * bounds, a text's format, length and pattern, its examples, described and
 * toned options, and the `intent` hints. Each story is a generated fixture
 * annotated with those facts (`src/__stories__/_spec-shaped/`), until the
 * engine that generates the fixtures projects them itself.
 *
 * Every story renders twice - the `ThemePair` decorator shows both themes -
 * so each assertion counts two.
 */

const meta = {
  title: 'Inputs/Designed Controls',
  component: CaseForm,
  args: {
    contracts: SPEC_INPUT_CONTRACTS,
    inputForm: SPEC_INPUT_FORM,
    domain: 'scalars',
    pipeCode: 'amount_in_euros',
    presentation: 'app',
  },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const BOTH_THEMES = 2;

/** An amount in euros: the symbol where the locale writes it, the bounds in euros, examples as chips that fill it. */
export const AmountInEuros: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('[data-unit-affix]')).toHaveLength(BOTH_THEMES);
    const chips = canvas.getAllByRole('button', { name: /€1,200\.00/ });
    await userEvent.click(chips[0]!);
    await expect(canvas.getAllByRole('spinbutton')[0]).toHaveValue(1200);
  },
};

/** A share in percent, between its bounds: a slider beside the input, `%` after it. */
export const ShareInPercent: Story = {
  args: { pipeCode: 'share_in_percent' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-number-slider]')).toHaveLength(BOTH_THEMES);
  },
};

/** A rating from 1 to 5: a row of steps, one per value. */
export const RatingScale: Story = {
  args: { pipeCode: 'rating_scale' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('[data-rating-scale]')).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByRole('radio', { name: '4 out of 5' })).toHaveLength(BOTH_THEMES);
  },
};

/** A measure in square metres, above zero: the unit's symbol after the value. */
export const AreaInSquareMetres: Story = { args: { pipeCode: 'area_in_m2' } };

/** A capped headline with its counter and examples, and a question's composer box. */
export const CappedTextAndQuestion: Story = {
  args: { pipeCode: 'capped_and_question' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('0 / 60')).toHaveLength(BOTH_THEMES);
    await expect(canvasElement.querySelectorAll('textarea[data-intent="question"]')).toHaveLength(
      BOTH_THEMES,
    );
  },
};

/** An email, a web address and a time of day, each in the browser's own input. */
export const FormatAwareText: Story = {
  args: { pipeCode: 'formats', domain: 'scalars' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('input[type="email"]')).toHaveLength(BOTH_THEMES);
    await expect(canvasElement.querySelectorAll('input[type="url"]')).toHaveLength(BOTH_THEMES);
    await expect(canvasElement.querySelectorAll('input[type="time"]')).toHaveLength(BOTH_THEMES);
  },
};

/** An IBAN under a pattern, set in monospace as an identifier, with an example. */
export const IdentifierWithPattern: Story = {
  args: { domain: 'structured', pipeCode: 'identifiers' },
};

/** Code: monospace, no spelling help, lines kept whole. */
export const CodeInput: Story = {
  args: { domain: 'lists', pipeCode: 'code_input' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('textarea[data-intent="code"]')).toHaveLength(
      BOTH_THEMES,
    );
  },
};

/** Options the method describes, as cards, one carrying a caution tone; a bounded quantity; a capped footnote. */
export const DescribedOptionCards: Story = {
  args: { domain: 'states', pipeCode: 'described_options' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('[data-option-cards]')).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText('Opens in any browser; reflows on a phone.')).toHaveLength(
      BOTH_THEMES,
    );
  },
};

/** A photo: the camera first, the file picker after it. */
export const PhotoFirst: Story = { args: { domain: 'files', pipeCode: 'photo_first' } };

/** A screenshot: a paste button beside the dropzone, and pasting into it works too. */
export const ScreenshotPaste: Story = {
  args: { domain: 'files', pipeCode: 'screenshot_paste' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-paste-screenshot]')).toHaveLength(
      BOTH_THEMES,
    );
  },
};

/** A scan: the camera first, named for scanning pages. */
export const ScanFlow: Story = { args: { domain: 'files', pipeCode: 'scan_flow' } };
