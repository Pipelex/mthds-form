import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { findFixture } from '../../../generative';
import { APP_STYLE_IDS, type AppStyleId } from '../../../brand';
import { atWidth, expectEveryTouchTarget, pinnedTo } from '../../touch-target';
import { GENERATIVE_STORY_PARAMETERS } from '../layout-page';
import { APPS, APP_KEYS, type AppKey } from './apps';
import { AppMoment, checkedLayout, type Moment } from './frame';
import { AppScope, styleFontsReady } from './scope';
import { TEAM_KEYS, type TeamKey } from './teams';

/**
 * The designer method in a host's frames: each moment of three apps - the trip
 * planner, the receipt reader and the slide directions - as the kernel's plain
 * view draws it and as the designer method laid it out for that moment, in an
 * app style and a team's colours, over one real run of the app.
 *
 * Every page is titled by what produced it. `kernel` is the plain form or the
 * kernel's result view, the host drawing the title and the action row itself;
 * `designer` is the layout `methods/layout-design.mthds` wrote on gpt-6.1-sol,
 * from a brief that named the frame and the style, with a seed, captured by
 * `make fixtures-specs` - one layout per app, moment and style, so the style
 * arg picks both how the page is painted and which layout is rendered.
 *
 * The args are declared so a URL can set them
 * (`&args=app:slides;moment:result;style:bold;team:typer;producer:designer`),
 * which is how the matrix is shot for the visual gate.
 */

type Producer = 'kernel' | 'designer';

/** The model every layout here was captured on: the one the designer method pins. */
const MODEL = 'gpt-6.1-sol';

interface MomentArgs {
  app: AppKey;
  moment: Moment;
  style: AppStyleId;
  team: TeamKey | 'none';
  producer: Producer;
}

function layoutFor(app: AppKey, moment: Moment, style: AppStyleId) {
  const frame = moment === 'compose' ? 'composer' : 'result';
  const host = APPS[app];
  return checkedLayout(
    host,
    findFixture(host.specs, host.pipeRef, `pipelex-method--${MODEL}--${frame}--${style}--seeded`),
  );
}

function StyledMoment({ app, moment, style, team, producer }: MomentArgs) {
  const teamKey = team === 'none' ? null : team;
  return (
    <AppScope style={style} team={teamKey}>
      <AppMoment
        app={APPS[app]}
        moment={moment}
        layout={producer === 'designer' ? layoutFor(app, moment, style) : null}
        team={teamKey}
      />
    </AppScope>
  );
}

/**
 * Each page has one h1 - the host's title on the kernel's page, the
 * Composer's or the ResultHeader's on a layout - and every title wears the
 * style's weight; the action that runs the method, wherever the page puts it,
 * wears the style's action shadow. A table in the kernel's result, which the
 * host frames in its panel, draws no box of its own inside that panel.
 */
async function expectFramedPage(canvasElement: HTMLElement) {
  await styleFontsReady();
  const pages = [...canvasElement.querySelectorAll<HTMLElement>('.app-host')];
  await expect(pages.length, 'host pages').toBeGreaterThan(0);
  for (const table of canvasElement.querySelectorAll<HTMLElement>('.af-result [data-table-box]')) {
    await expect(table.dataset.tableBox, 'a table in a framed result').toBe('framed');
    await expect(getComputedStyle(table).borderTopWidth, 'its own outline').toBe('0px');
  }
  for (const page of pages) {
    await expect(page.querySelectorAll('h1').length, 'one h1').toBe(1);
    const weight = getComputedStyle(page).getPropertyValue('--heading-weight').trim();
    for (const title of page.querySelectorAll<HTMLElement>('h1, h2')) {
      if (title.classList.contains('uppercase') || title.closest('.af-result')) continue;
      if (weight)
        await expect(getComputedStyle(title).fontWeight, title.textContent ?? 'title').toBe(weight);
    }
  }
}

const meta = {
  title: 'Generative/Designer frames',
  component: StyledMoment,
  args: { app: 'trip', moment: 'compose', style: 'soft', team: 'stripe', producer: 'designer' },
  play: async ({ canvasElement }) => expectFramedPage(canvasElement),
  argTypes: {
    app: { control: 'inline-radio', options: [...APP_KEYS] },
    moment: { control: 'inline-radio', options: ['compose', 'result'] },
    style: { control: 'inline-radio', options: [...APP_STYLE_IDS] },
    team: { control: 'inline-radio', options: ['none', ...TEAM_KEYS] },
    producer: { control: 'inline-radio', options: ['kernel', 'designer'] },
  },
  parameters: {
    ...GENERATIVE_STORY_PARAMETERS,
    a11y: {
      config: {
        rules: [
          ...GENERATIVE_STORY_PARAMETERS.a11y.config.rules,
          // The pair view renders the host's page twice on one document, so
          // its one `main` is two. A host renders one.
          { id: 'landmark-no-duplicate-main', enabled: false },
          { id: 'landmark-one-main', enabled: false },
        ],
      },
    },
  },
} satisfies Meta<typeof StyledMoment>;

export default meta;
type Story = StoryObj<typeof meta>;

function story(
  app: AppKey,
  moment: Moment,
  style: AppStyleId,
  team: TeamKey | 'none',
  producer: Producer,
): Story {
  const what = producer === 'designer' ? `designer method · ${MODEL}` : 'kernel';
  const colours = team === 'none' ? 'no team' : `${team} colours`;
  return {
    name: `${APPS[app].appName} · ${moment === 'compose' ? 'composer' : 'result'} · ${what} · ${style} · ${colours}`,
    args: { app, moment, style, team, producer },
  };
}

export const TripComposer = story('trip', 'compose', 'soft', 'stripe', 'designer');
export const TripComposerKernel = story('trip', 'compose', 'soft', 'stripe', 'kernel');
export const TripResult = story('trip', 'result', 'soft', 'stripe', 'designer');
export const TripResultKernel = story('trip', 'result', 'soft', 'stripe', 'kernel');
export const InvoiceComposer = story('invoice', 'compose', 'bold', 'typer', 'designer');
export const InvoiceResult = story('invoice', 'result', 'bold', 'typer', 'designer');
export const InvoiceResultKernel = story('invoice', 'result', 'bold', 'typer', 'kernel');
export const SlidesComposer = story('slides', 'compose', 'editorial', 'gov-uk', 'designer');
export const SlidesResult = story('slides', 'result', 'editorial', 'gov-uk', 'designer');
export const SlidesResultKernel = story('slides', 'result', 'editorial', 'gov-uk', 'kernel');
export const QuietComposer = story('trip', 'compose', 'quiet', 'none', 'designer');
export const QuietResult = story('invoice', 'result', 'quiet', 'none', 'designer');

// ─── On a phone ────────────────────────────────────────────────────────────

/**
 * On a phone, a layout keeps the page in its width and every control it draws
 * - the Composer's action row, the ResultHeader's actions, the fields the
 * layout places - at 44px or more to tap.
 */
function onAPhone(app: AppKey, moment: Moment, style: AppStyleId, team: TeamKey): Story {
  const base = story(app, moment, style, team, 'designer');
  return {
    ...base,
    name: `${base.name} · phone`,
    ...pinnedTo('phone'),
    play: async ({ canvasElement }) => {
      await atWidth('phone');
      await styleFontsReady();
      await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
      await expectEveryTouchTarget(canvasElement);
      await expectFramedPage(canvasElement);
    },
  };
}

export const TripComposerPhone = onAPhone('trip', 'compose', 'soft', 'stripe');
export const TripResultPhone = onAPhone('trip', 'result', 'soft', 'stripe');
export const SlidesResultPhone = onAPhone('slides', 'result', 'editorial', 'gov-uk');
export const InvoiceComposerPhone = onAPhone('invoice', 'compose', 'bold', 'typer');
