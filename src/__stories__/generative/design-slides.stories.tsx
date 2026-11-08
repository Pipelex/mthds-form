import type { Meta, StoryObj } from '@storybook/react-vite';
import { findFixture } from '../../generative';
import { CONTRACTS, INPUT_FORM } from '../_generated/design_slides';
import { SPECS } from '../_generated/design_slides.specs';
import { MTHDS, PIPELEX, STOCK } from './brands';
import {
  GENERATIVE_STORY_PARAMETERS,
  heroFields,
  layoutStory,
  makeLayoutPage,
  onAPhone,
} from './layout-page';

/**
 * A rough brief in, design proposals out.
 *
 * The authored method whose pipe pins an image model, which is why projecting
 * it needs the model deck at all: it is the case that keeps the corpus honest
 * about being read off real bundles rather than off ones shaped to be easy.
 * Taken in verbatim, brief untuned.
 */

const fields = heroFields(
  CONTRACTS,
  INPUT_FORM,
  'slide_designer',
  'generate_design_proposals_from_rough_brief',
);
const Page = makeLayoutPage(fields, SPECS);
const PINNED = 'pipelex-method--gpt-6.1-sol';
const layout = findFixture(
  SPECS,
  'slide_designer.generate_design_proposals_from_rough_brief',
  PINNED,
);

const meta = {
  title: 'Generative/Slide designer',
  component: Page,
  parameters: GENERATIVE_STORY_PARAMETERS,
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gpt61Sol: Story = layoutStory(layout, STOCK);
export const MthdsTokens: Story = layoutStory(layout, MTHDS);
export const PipelexTokens: Story = layoutStory(layout, PIPELEX);

/** The pinned layout on a phone: its segmented choices at the 44 pixels a finger needs. */
export const Gpt61SolPhone: Story = onAPhone(layoutStory(layout, STOCK));
