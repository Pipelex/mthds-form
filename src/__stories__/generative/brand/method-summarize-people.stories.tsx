import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../_generated/brands/index.css';
import { BRANDS } from '../../_generated/brands/brands';
import bundle from '../../../../data/methods/summarize_people/bundle.mthds?raw';
import { CONTRACTS, INPUT_FORM, OUTPUT_FORM } from '../../_generated/summarize_people';
import { SPECS } from '../../_generated/summarize_people.brand.specs';
import { loadInputHero } from '../hero-page';
import { methodPlays } from './brand-plays';
import { BRAND_STORY_PARAMETERS, brandStories } from './brand-stories';
import { makeMethodPage, methodHero, methodLayouts } from './method-page';
import { methodRunTarget } from './method-run';

/**
 * People summaries: a list of records in, a list of rows out. The list is delegated whole to the kernel, rows and all, under the brand tokens.
 *
 * The join, on an authored method: the designer method's layout, written
 * against the brand catalog from a brief nobody tuned, under the tokens the
 * brand method wrote - titled by what produced each half. The bundle is the
 * cookbook's, verbatim (`data/methods/summarize_people/`).
 */

const BRAND = 'pipelex';
const hero = methodHero('summarize_people.summarize_people');
const fields = loadInputHero(hero, CONTRACTS, INPUT_FORM);
const layouts = methodLayouts(hero, SPECS);
const run = methodRunTarget(hero, CONTRACTS, OUTPUT_FORM, { 'bundle.mthds': bundle });
const Page = makeMethodPage({ brand: BRAND, hero, fields, layouts, run });

const meta = {
  title: 'Generative/Methods/People summaries',
  component: Page,
  parameters: BRAND_STORY_PARAMETERS,
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

const stories = brandStories<Story>(BRANDS, layouts, BRAND, methodPlays(fields, layouts));

const TOKENS = 'pipelex-method--claude-4.8-opus';
export const BrandLayoutOpus48 = stories.join(TOKENS, 'pipelex-method--claude-4.8-opus--brand');
