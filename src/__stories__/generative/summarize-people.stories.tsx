import type { Meta, StoryObj } from '@storybook/react-vite';
import { findFixture } from '../../generative';
import { CONTRACTS, INPUT_FORM } from '../_generated/summarize_people';
import { SPECS } from '../_generated/summarize_people.specs';
import { MTHDS, PIPELEX, STOCK } from './brands';
import {
  GENERATIVE_STORY_PARAMETERS,
  heroFields,
  layoutStory,
  makeLayoutPage,
} from './layout-page';

/**
 * People in, summaries out.
 *
 * The authored method with a plural input, so its layout has to decide what a
 * list of people looks like before anything is in it - the one shape a
 * descriptor describes and an empty form cannot show. Taken in verbatim,
 * brief untuned.
 */

const fields = heroFields(CONTRACTS, INPUT_FORM, 'summarize_people', 'summarize_people');
const Page = makeLayoutPage(fields, SPECS);
const PINNED = 'pipelex-method--claude-4.8-opus';
const layout = findFixture(SPECS, 'summarize_people.summarize_people', PINNED);

const meta = {
  title: 'Generative/People summaries',
  component: Page,
  parameters: GENERATIVE_STORY_PARAMETERS,
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Opus48: Story = layoutStory(layout, STOCK);
export const MthdsTokens: Story = layoutStory(layout, MTHDS);
export const PipelexTokens: Story = layoutStory(layout, PIPELEX);
