import type { Meta, StoryObj } from '@storybook/react-vite';
import { findFixture } from '../../generative';
import { CONTRACTS, INPUT_FORM } from '../_generated/trips';
import { SPECS } from '../_generated/trips.specs';
import { MTHDS, PIPELEX, STOCK } from './brands';
import {
  GENERATIVE_STORY_PARAMETERS,
  heroFields,
  layoutStory,
  makeLayoutPage,
  onAPhone,
} from './layout-page';

/**
 * The trip planner, as the designer method lays out a whole page for it on
 * the model it pins.
 *
 * The synthesized carrier with the widest input surface in the corpus: text,
 * a number, enums, a boolean, a nested structure, two dates and a list, plus
 * an optional image. It is the case a layout has the most room to get wrong:
 * the page is free in its composition, since the method prescribes none, and
 * binds the descriptor's paths, which are not its own.
 *
 * Two stories are the layout under someone else's tokens. A page that only
 * reads in the stock palette is a page with a problem the palette is hiding.
 * The last is the layout on a phone, where every control the page draws is
 * held to the 44 pixels a finger needs.
 */

const fields = heroFields(CONTRACTS, INPUT_FORM, 'trips', 'plan_trip');
const Page = makeLayoutPage(fields, SPECS);
const layout = (id: string) => findFixture(SPECS, 'trips.plan_trip', id);

const meta = {
  title: 'Generative/Trip planner',
  component: Page,
  parameters: GENERATIVE_STORY_PARAMETERS,
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

const PINNED = 'pipelex-method--gpt-6.1-sol';

export const Gpt61Sol: Story = layoutStory(layout(PINNED), STOCK);
export const MthdsTokens: Story = layoutStory(layout(PINNED), MTHDS);
export const PipelexTokens: Story = layoutStory(layout(PINNED), PIPELEX);

export const Gpt61SolPhone: Story = onAPhone(layoutStory(layout(PINNED), STOCK));
