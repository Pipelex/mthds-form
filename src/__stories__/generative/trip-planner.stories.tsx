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
} from './layout-page';

/**
 * The trip planner, as three models laid it out.
 *
 * The synthesized carrier with the widest input surface in the corpus: text,
 * a number, enums, a boolean, a nested structure, two dates and a list, plus
 * an optional image. It is the case a layout has the most room to get wrong,
 * which is why three models were run over the same brief - the pages differ
 * in section order, in what goes in the rail and in how much copy they write,
 * and every one of them binds the same paths, because the paths are the
 * descriptor's and not theirs.
 *
 * The last two stories are the pinned layout under someone else's tokens. A
 * page that only reads in the stock palette is a page with a problem the
 * palette is hiding.
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

const PINNED = 'pipelex-method--claude-4.8-opus';

export const Opus48: Story = layoutStory(layout(PINNED), STOCK);
export const Sonnet5: Story = layoutStory(layout('pipelex-method--claude-5-sonnet'), STOCK);
export const Gpt55: Story = layoutStory(layout('pipelex-method--gpt-5.5'), STOCK);
export const MthdsTokens: Story = layoutStory(layout(PINNED), MTHDS);
export const PipelexTokens: Story = layoutStory(layout(PINNED), PIPELEX);
