import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { findFixture, type SpecFixture } from '../../../generative';
import type { InputForm, PipeIOContracts, RunField } from '../../../core';
import * as designSlides from '../../_generated/design_slides';
import { SPECS as DESIGN_SLIDES_SPECS } from '../../_generated/design_slides.specs';
import * as extractInvoice from '../../_generated/extract_invoice';
import { SPECS as EXTRACT_INVOICE_SPECS } from '../../_generated/extract_invoice.specs';
import * as summarizePeople from '../../_generated/summarize_people';
import { SPECS as SUMMARIZE_PEOPLE_SPECS } from '../../_generated/summarize_people.specs';
import * as trips from '../../_generated/trips';
import { SPECS as TRIPS_SPECS } from '../../_generated/trips.specs';
import { atWidth, expectTouchTarget, pinnedTo } from '../../touch-target';
import { GENERATIVE_STORY_PARAMETERS, assertRenderable, heroFields } from '../layout-page';
import { DesignedPage, Frame } from './frame';
import { AppScope, styleFontsReady } from './scope';
import { APP_STYLE_IDS, TYPEFACES, type AppStyleId, type TypefaceId } from './styles';
import { TEAM_KEYS, type TeamKey } from './teams';

/**
 * The app styles, worn by a host's page: a style (`quiet`, `soft`,
 * `editorial`, `bold`) and a team's colours (none, or `stripe`, `gov-uk`,
 * `typer`, each read off that site), on two kinds of page.
 *
 * - **The frame** - a host's compose-then-result frame around the kernel: the
 *   trip planner's plain form in a composer column (`compose`), and a real
 *   launch report in the kernel's result view under the request bar
 *   (`result`).
 * - **A captured layout** - each corpus page a model laid out, as the
 *   `Generative` stories render it, here on the host's page.
 *
 * Every story is titled by what produced it: the style, the team's colours
 * and the subject. The args are declared so a URL can set them
 * (`&args=subject:result;style:bold;team:typer`), which is how the matrix is
 * shot. `style: none` renders the host's page with no style class at all, the
 * reference `quiet` must match pixel for pixel.
 *
 * A spike: the stylesheet behind it is story-only and disposable, and the
 * values it applies live in `styles.ts`. See docs/storybook.md, "App styles".
 */

type Subject =
  'compose' | 'result' | 'trip-planner' | 'extract-invoice' | 'summarize-people' | 'design-slides';

const PINNED = 'pipelex-method--claude-4.8-opus';

interface Layout {
  /** The app's name, as the host's band shows it. */
  appName: string;
  fields: RunField[];
  fixture: SpecFixture;
}

function layoutOf(
  appName: string,
  module: { CONTRACTS: PipeIOContracts; INPUT_FORM: InputForm },
  specs: readonly SpecFixture[],
  domain: string,
  pipeCode: string,
): Layout {
  const fields = heroFields(module.CONTRACTS, module.INPUT_FORM, domain, pipeCode);
  const fixture = assertRenderable(findFixture(specs, `${domain}.${pipeCode}`, PINNED), fields);
  return { appName, fields, fixture };
}

const LAYOUTS: Record<Exclude<Subject, 'compose' | 'result'>, Layout> = {
  'trip-planner': layoutOf('Trip planner', trips, TRIPS_SPECS, 'trips', 'plan_trip'),
  'extract-invoice': layoutOf(
    'Invoice reader',
    extractInvoice,
    EXTRACT_INVOICE_SPECS,
    'invoice_extraction',
    'process_invoice',
  ),
  'summarize-people': layoutOf(
    'People summaries',
    summarizePeople,
    SUMMARIZE_PEOPLE_SPECS,
    'summarize_people',
    'summarize_people',
  ),
  'design-slides': layoutOf(
    'Slide directions',
    designSlides,
    DESIGN_SLIDES_SPECS,
    'slide_designer',
    'generate_design_proposals_from_rough_brief',
  ),
};

interface StyledPageArgs {
  subject: Subject;
  style: AppStyleId | 'none';
  team: TeamKey | 'none';
  typeface: TypefaceId | 'none';
}

function StyledPage({ subject, style, team, typeface }: StyledPageArgs) {
  const teamKey = team === 'none' ? null : team;
  const body =
    subject === 'compose' || subject === 'result' ? (
      <Frame moment={subject} team={teamKey} />
    ) : (
      <DesignedPage
        appName={LAYOUTS[subject].appName}
        fields={LAYOUTS[subject].fields}
        fixture={LAYOUTS[subject].fixture}
        team={teamKey}
        idPrefix={`${subject}-${style}-${team}`}
      />
    );
  return (
    <AppScope style={style} team={teamKey} typeface={typeface === 'none' ? null : typeface}>
      {body}
    </AppScope>
  );
}

const meta = {
  title: 'Generative/App styles',
  component: StyledPage,
  args: { subject: 'compose', style: 'quiet', team: 'none', typeface: 'none' },
  argTypes: {
    subject: {
      control: 'select',
      options: ['compose', 'result', ...Object.keys(LAYOUTS)],
    },
    style: { control: 'inline-radio', options: ['none', ...APP_STYLE_IDS] },
    team: { control: 'inline-radio', options: ['none', ...TEAM_KEYS] },
    typeface: {
      control: 'select',
      options: ['none', ...TYPEFACES.filter((face) => face.use === 'body').map((face) => face.id)],
    },
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
} satisfies Meta<typeof StyledPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `quiet`, no team: the host's own page, which a style that sets nothing leaves as it is. */
export const ComposeQuiet: Story = {
  name: 'Compose · quiet · no team',
  args: { subject: 'compose', style: 'quiet', team: 'none' },
};
export const ComposeSoft: Story = {
  name: 'Compose · soft · stripe.com colours',
  args: { subject: 'compose', style: 'soft', team: 'stripe' },
};
export const ComposeEditorial: Story = {
  name: 'Compose · editorial · gov.uk colours',
  args: { subject: 'compose', style: 'editorial', team: 'gov-uk' },
};
export const ComposeBold: Story = {
  name: 'Compose · bold · typer colours',
  args: { subject: 'compose', style: 'bold', team: 'typer' },
};

export const ResultQuiet: Story = {
  name: 'Result · quiet · typer colours',
  args: { subject: 'result', style: 'quiet', team: 'typer' },
};
export const ResultSoft: Story = {
  name: 'Result · soft · gov.uk colours',
  args: { subject: 'result', style: 'soft', team: 'gov-uk' },
};
export const ResultEditorial: Story = {
  name: 'Result · editorial · stripe.com colours',
  args: { subject: 'result', style: 'editorial', team: 'stripe' },
};
export const ResultBold: Story = {
  name: 'Result · bold · no team',
  args: { subject: 'result', style: 'bold', team: 'none' },
};

/** Each captured layout, in one style and one team's colours; the args reach the rest. */
export const TripPlannerSoft: Story = {
  name: 'Trip planner layout · soft · gov.uk colours',
  args: { subject: 'trip-planner', style: 'soft', team: 'gov-uk' },
};
export const InvoiceEditorial: Story = {
  name: 'Invoice extraction layout · editorial · typer colours',
  args: { subject: 'extract-invoice', style: 'editorial', team: 'typer' },
};
export const PeopleBold: Story = {
  name: 'People summaries layout · bold · stripe.com colours',
  args: { subject: 'summarize-people', style: 'bold', team: 'stripe' },
};
export const SlidesQuiet: Story = {
  name: 'Slide designer layout · quiet · no team',
  args: { subject: 'design-slides', style: 'quiet', team: 'none' },
};

/** A team's typeface on a style whose headings follow the body: Manrope on `soft`. */
export const TeamTypeface: Story = {
  name: 'Compose · soft · Manrope · stripe.com colours',
  args: { subject: 'compose', style: 'soft', team: 'stripe', typeface: 'manrope' },
};

// ─── On a phone ────────────────────────────────────────────────────────────

const CONTROLS =
  'button, input:not([type="hidden"]):not([type="file"]):not([aria-hidden="true"]), textarea';

/**
 * The controls that are short of 44px on a phone with no style as with one,
 * filed as L-261107-96ad4c: the kernel's enum options (36px) and the result
 * view's Download button (28px). A style sizes neither, so these stories hold
 * every other control and leave those to the kernel's own phone stories.
 */
function knownShort(control: Element): boolean {
  // An enum option is a toggle-group item; a file picker's choices, also radios, are held.
  if (control.matches('[role="radio"][data-radix-collection-item]')) return true;
  return control.textContent?.trim() === 'Download';
}

/**
 * On a phone, a style keeps the page in its width and every control a style
 * can reach - the host's band and action row, the kernel's fields - at 44px
 * or more to tap: its radius, its faces and its rhythm never shrink one.
 */
async function expectPhoneReady(canvasElement: HTMLElement) {
  await atWidth('phone');
  await styleFontsReady();
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  const controls = [...canvasElement.querySelectorAll(CONTROLS)].filter((control) => {
    const box = control.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && !knownShort(control);
  });
  await expect(controls.length).toBeGreaterThan(0);
  for (const control of controls) await expectTouchTarget(control);
}

function onAPhone(subject: 'compose' | 'result', style: AppStyleId, team: TeamKey): Story {
  return {
    name: `${subject === 'compose' ? 'Compose' : 'Result'} · ${style} · phone`,
    ...pinnedTo('phone'),
    args: { subject, style, team },
    play: async ({ canvasElement }) => expectPhoneReady(canvasElement),
  };
}

export const ComposeQuietPhone = onAPhone('compose', 'quiet', 'gov-uk');
export const ComposeSoftPhone = onAPhone('compose', 'soft', 'stripe');
export const ComposeEditorialPhone = onAPhone('compose', 'editorial', 'gov-uk');
export const ComposeBoldPhone = onAPhone('compose', 'bold', 'typer');
export const ResultEditorialPhone = onAPhone('result', 'editorial', 'stripe');
export const ResultBoldPhone = onAPhone('result', 'bold', 'typer');
