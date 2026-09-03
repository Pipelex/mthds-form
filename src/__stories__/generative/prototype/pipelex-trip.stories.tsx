import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CONTRACTS, INPUT_FORM } from '../../_generated/trips';
import { HEROES } from '../heroes';
import { loadInputHero } from '../hero-page';
import { revealInput } from '../play-helpers';
import { skippable } from '../source-stories';
import { BrandPage } from './brand-page';
import { PIPELEX_TRIP_SPEC, PROTOTYPE_LABEL } from './pipelex-trip.spec';

/**
 * The branded prototype: ONE page, the trip planner as a product page in the
 * Pipelex brand, on the layer's technical setting - a spec over a catalog,
 * rendered through a registry, the five inputs the kernel owns rendered by the
 * kernel's own controls at their paths. A spike, and the one story that pins
 * its theme: the brand is dark, so it renders dark, full width, at the size a
 * web page is. It renders through the stock tokens until the brand build
 * exists: the hand-written brand stylesheet was retired with the orbs.
 */

const PIPE_REF = 'trips.plan_trip';
const hero = HEROES.find((candidate) => `${candidate.domain}.${candidate.pipeCode}` === PIPE_REF)!;
const fields = loadInputHero(hero, CONTRACTS, INPUT_FORM);

function PipelexTripPlanner() {
  return <BrandPage fields={fields} spec={PIPELEX_TRIP_SPEC} />;
}

const meta = {
  title: 'Generative/Prototype/Pipelex trip planner',
  component: PipelexTripPlanner,
  parameters: { themeView: 'dark', themePairPadding: 0 },
} satisfies Meta<typeof PipelexTripPlanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SubagentFable51ByHand: Story = {
  name: PROTOTYPE_LABEL,
  play: skippable(async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('img', { name: 'Pipelex' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(/trip/i);

    const budget = await revealInput(canvasElement, /^budget$/i, 'budget');
    await userEvent.type(budget, '2500');
    const receipt = canvas.getByTestId('inputs-receipt');
    await expect(receipt).toHaveTextContent(/"budget": 2500/);

    // The rail mirrors what was typed: a bound SummaryRow, not a second input.
    await expect(canvas.getByText(/^2500$/)).toBeInTheDocument();
  }),
};
