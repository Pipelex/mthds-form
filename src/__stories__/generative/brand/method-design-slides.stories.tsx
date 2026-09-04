import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../_generated/brands/index.css';
import { BRANDS } from '../../_generated/brands/brands';
import { CONTRACTS, INPUT_FORM } from '../../_generated/design_slides';
import { SPECS } from '../../_generated/design_slides.brand.specs';
import { loadInputHero } from '../hero-page';
import { methodPlays } from './brand-plays';
import { BRAND_STORY_PARAMETERS, brandStories } from './brand-stories';
import { makeMethodPage, methodHero, methodLayouts } from './method-page';

/**
 * The slide designer: one structure of texts and choices in, an HTML report out. The one method of the three whose every input the brand catalog can render itself.
 *
 * The join, on an authored method: the designer method's layout, written
 * against the brand catalog from a brief nobody tuned, under the tokens the
 * brand method wrote - titled by what produced each half. The bundle is the
 * cookbook's, verbatim (`data/methods/design_slides/`).
 */

const BRAND = 'pipelex';
const hero = methodHero('slide_designer.generate_design_proposals_from_rough_brief');
const fields = loadInputHero(hero, CONTRACTS, INPUT_FORM);
const layouts = methodLayouts(hero, SPECS);
const Page = makeMethodPage({ brand: BRAND, hero, fields, layouts });

const meta = {
  title: 'Generative/Methods/Slide designer',
  component: Page,
  parameters: BRAND_STORY_PARAMETERS,
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

const stories = brandStories<Story>(BRANDS, layouts, BRAND, methodPlays(fields, layouts));

const TOKENS = 'pipelex-method--claude-4.8-opus';
export const BrandLayoutOpus48 = stories.join(TOKENS, 'pipelex-method--claude-4.8-opus--brand');
