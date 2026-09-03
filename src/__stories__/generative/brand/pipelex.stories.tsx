import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../_generated/brands/index.css';
import { BRANDS } from '../../_generated/brands/brands';
import { CONTRACTS, INPUT_FORM } from '../../_generated/trips';
import { HEROES } from '../heroes';
import { loadInputHero } from '../hero-page';
import { BrandPage } from './brand-page';
import { type BrandStoryArgs, brandStories } from './brand-stories';
import {
  HAND_LAYOUT,
  TRIP_LAYOUTS,
  TRIP_PIPE_REF,
  tripLayout,
  tripLayoutFixture,
} from './trip-layouts';
import { tripPlays } from './trip-plays';

/**
 * The Pipelex brand: the trip planner as a product page, painted from each
 * producer's `data/brands/pipelex/<producer>/` - one story per producer with
 * the hand-written layout, titled by what produced the tokens; then the JOIN,
 * one story per captured layout under the method's tokens, titled by what
 * produced each half. The page and the components are the same in every
 * story; only the data differs, which is the point.
 *
 * Both themes, side by side, because a brand is two palettes: the tokens
 * carry a light and a dark value each, and the pair view is how a wrong
 * derived mode is seen. Full width, at the size a web page is.
 */

const BRAND = 'pipelex';
const hero = HEROES.find(
  (candidate) => `${candidate.domain}.${candidate.pipeCode}` === TRIP_PIPE_REF,
)!;
const fields = loadInputHero(hero, CONTRACTS, INPUT_FORM);

function PipelexTripPlanner({ producerId, layout }: BrandStoryArgs) {
  const brand = BRANDS.find(
    (candidate) => candidate.brand === BRAND && candidate.producerId === producerId,
  );
  if (!brand) return <brandStories.Missing brand={BRAND} id={producerId} />;
  const spec = tripLayout(layout);
  if (!spec) return <brandStories.Missing brand={BRAND} id={producerId} layout={layout} />;
  // A layout from the layer's own catalog brings no chrome and no container.
  const bare = layout !== HAND_LAYOUT && tripLayoutFixture(layout)?.catalog !== 'brand';
  return (
    <BrandPage
      brand={brand}
      fields={fields}
      spec={spec}
      idPrefix={`${producerId}-${layout}`}
      contained={bare}
    />
  );
}

const meta = {
  title: 'Generative/Brand/Pipelex · trip planner',
  component: PipelexTripPlanner,
  parameters: {
    themePairPadding: 0,
    /**
     * The page has a banner, a complementary rail and a contentinfo, as a
     * product page should - and the pair view renders it twice on one
     * document, so axe sees two of each landmark with the same name. That is
     * the decorator's doing, not the page's: a host renders one. The rules
     * that count landmarks per document are therefore off for the brand
     * stories only, and every other rule still fails the build; the
     * preview's `color-contrast` exclusion is restated because a parameter
     * array replaces rather than merges.
     */
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: false },
          { id: 'landmark-unique', enabled: false },
          { id: 'landmark-no-duplicate-banner', enabled: false },
          { id: 'landmark-no-duplicate-contentinfo', enabled: false },
        ],
      },
    },
  },
} satisfies Meta<typeof PipelexTripPlanner>;

export default meta;
type Story = StoryObj<typeof meta>;

const stories = brandStories<Story>(BRANDS, TRIP_LAYOUTS, BRAND, tripPlays(fields));

// The reference: the hand-written brand spec under each producer's tokens.
export const SessionByHand = stories.of('claude-code-session--claude-fable-5-1');
export const MethodOpus48 = stories.of('pipelex-method--claude-4.8-opus');

// The join, Experiment A: the method's base-catalog layouts under the method's tokens.
const TOKENS = 'pipelex-method--claude-4.8-opus';
export const LayoutOpus48 = stories.join(TOKENS, 'pipelex-method--claude-4.8-opus');
export const LayoutOpus48Seeded = stories.join(TOKENS, 'pipelex-method--claude-4.8-opus--seeded');
export const LayoutSonnet5 = stories.join(TOKENS, 'pipelex-method--claude-5-sonnet');
export const LayoutGpt55 = stories.join(TOKENS, 'pipelex-method--gpt-5.5');
export const LayoutGpt55Seeded = stories.join(TOKENS, 'pipelex-method--gpt-5.5--seeded');

// The join, Experiment B: the method handed the brand catalog, under the method's tokens.
export const BrandLayoutOpus48 = stories.join(TOKENS, 'pipelex-method--claude-4.8-opus--brand');
export const BrandLayoutSonnet5 = stories.join(TOKENS, 'pipelex-method--claude-5-sonnet--brand');
export const BrandLayoutGpt55 = stories.join(TOKENS, 'pipelex-method--gpt-5.5--brand');
