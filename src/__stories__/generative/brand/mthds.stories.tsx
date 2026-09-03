import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import '../../_generated/brands/index.css';
import { BRANDS } from '../../_generated/brands/brands';
import { CONTRACTS, INPUT_FORM } from '../../_generated/trips';
import { HEROES } from '../heroes';
import { loadInputHero } from '../hero-page';
import { revealInput } from '../play-helpers';
import { skippable } from '../source-stories';
import { BrandPage } from './brand-page';
import { brandStories } from './brand-stories';
import { PIPELEX_TRIP_SPEC } from './pipelex-trip.spec';
import { resolveColor } from './tokens-schema';

/**
 * The MTHDS brand: the trip planner as a product page, painted from each
 * producer's `data/brands/mthds/<producer>/` - one story per producer,
 * titled by what produced the tokens. The page, the spec and the components
 * are the same in every story; only the data differs, which is the point.
 *
 * Both themes, side by side, because a brand is two palettes: the tokens
 * carry a light and a dark value each, and the pair view is how a wrong
 * derived mode is seen. Full width, at the size a web page is.
 */

const BRAND = 'mthds';
const PIPE_REF = 'trips.plan_trip';
const hero = HEROES.find((candidate) => `${candidate.domain}.${candidate.pipeCode}` === PIPE_REF)!;
const fields = loadInputHero(hero, CONTRACTS, INPUT_FORM);

function MthdsTripPlanner({ producerId }: { producerId: string }) {
  const brand = BRANDS.find(
    (candidate) => candidate.brand === BRAND && candidate.producerId === producerId,
  );
  if (!brand) return <brandStories.Missing brand={BRAND} id={producerId} />;
  return <BrandPage brand={brand} fields={fields} spec={PIPELEX_TRIP_SPEC} idPrefix={producerId} />;
}

const meta = {
  title: 'Generative/Brand/MTHDS · trip planner',
  component: MthdsTripPlanner,
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
} satisfies Meta<typeof MthdsTripPlanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

/** `rgb(r, g, b)`, as a browser reports a computed opaque colour. */
function computedRgb(components: readonly number[]) {
  return `rgb(${components.map((channel) => Math.round(channel * 255)).join(', ')})`;
}

const paintsFromTheTokens: Story['play'] = skippable(async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const [lightPage] = canvas.getAllByTestId('brand-page');
  const brand = BRANDS.find(
    (candidate) =>
      candidate.brand === lightPage!.dataset.brand &&
      candidate.producerId === lightPage!.dataset.producer,
  )!;

  // The manifest reaches the page: one logo per pane, each pane showing the
  // mark for its own canvas and hiding the other.
  await expect(canvas.getAllByRole('img', { name: brand.manifest.name })).toHaveLength(BOTH_THEMES);
  await expect(canvas.getAllByRole('heading', { level: 1 })[0]).toHaveTextContent(/trip/i);

  // The tokens reach the paint: the call to action is the brand's accent in
  // the light pane, and the page is set in the brand's typeface.
  const [cta] = within(lightPage!).getAllByRole('button', { name: /plan my trip/i });
  const primary = resolveColor(brand.tokens, 'primary', 'light')!;
  await expect(getComputedStyle(cta!).backgroundColor).toBe(computedRgb(primary.components));
  await expect(getComputedStyle(lightPage!).fontFamily).toContain(
    brand.tokens.font.sans.$value[0]!,
  );

  // The kernel still owns the inputs: what is typed lands in the /inputs tree
  // and the rail mirrors it through a bound SummaryRow, not a second input.
  const budget = await revealInput(canvasElement, /^budget$/i, 'budget');
  await userEvent.type(budget, '2500');
  await expect(canvas.getAllByTestId('inputs-receipt')[0]).toHaveTextContent(/"budget": 2500/);
  await expect(canvas.getAllByText(/^2500$/)[0]).toBeInTheDocument();
});

const stories = brandStories<Story>(BRANDS, BRAND, paintsFromTheTokens);

export const MethodOpus48 = stories.of('pipelex-method--claude-4.8-opus');
