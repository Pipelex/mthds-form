import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { findFixture, type SpecFixture } from '../../../generative';
import type { BooleanRunField, InputForm, PipeIOContracts, RunField } from '../../../core';
import { BooleanField, FieldPresentationProvider } from '../../../react';
import * as designSlides from '../../_generated/design_slides';
import { SPECS as DESIGN_SLIDES_SPECS } from '../../_generated/design_slides.specs';
import * as extractInvoice from '../../_generated/extract_invoice';
import { SPECS as EXTRACT_INVOICE_SPECS } from '../../_generated/extract_invoice.specs';
import * as summarizePeople from '../../_generated/summarize_people';
import { SPECS as SUMMARIZE_PEOPLE_SPECS } from '../../_generated/summarize_people.specs';
import * as trips from '../../_generated/trips';
import { SPECS as TRIPS_SPECS } from '../../_generated/trips.specs';
import { atWidth, expectEveryTouchTarget, pinnedTo } from '../../touch-target';
import { GENERATIVE_STORY_PARAMETERS, assertRenderable, heroFields } from '../layout-page';
import { DesignedPage, Frame } from './frame';
import { AppScope, styleFontsReady } from './scope';
import { APP_STYLE_IDS, TYPEFACES, type AppStyleId, type TypefaceId } from '../../../brand';
import { TEAM_KEYS, type TeamKey } from './teams';
import { backgroundOf, paintedContrast } from '../../painted-color';

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
 * The values are the `./brand` entry's: `deriveStyleRoles` returns the roles a
 * style and a typeface set, `styles.ts` writes them onto this host's tokens,
 * and the kernel's controls and the generative layer read the tokens
 * themselves. See docs/storybook.md, "App styles".
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

// ─── The style reaches the page ────────────────────────────────────────────

/** The labels of a layout's calls to action, read off its spec rather than off the DOM's classes. */
function callsToAction(subject: Subject): string[] {
  if (subject === 'compose' || subject === 'result') return [];
  const { elements } = LAYOUTS[subject].fixture.spec as {
    elements: Record<string, { type: string; props?: { label?: unknown } }>;
  };
  return Object.values(elements).flatMap((element) =>
    element.type === 'Cta' && typeof element.props?.label === 'string' ? [element.props.label] : [],
  );
}

/**
 * `value` as the browser computes `property` for an element standing where
 * `beside` stands, at its font size: the token resolved in the same context
 * and in the same normal form as the element's own computed value.
 */
function resolvedBeside(beside: HTMLElement, property: string, value: string): string {
  const probe = document.createElement('span');
  probe.style.fontSize = getComputedStyle(beside).fontSize;
  probe.style.setProperty(property, value);
  (beside.parentElement ?? beside).appendChild(probe);
  try {
    return getComputedStyle(probe).getPropertyValue(property);
  } finally {
    probe.remove();
  }
}

/**
 * Each component reads the tokens itself, so a heading or a button that
 * stopped reading one would drop a style's treatment with every other check
 * green. This holds each host page to what its scope sets: every title's
 * weight and tracking, and its face where a style or a team's typeface sets
 * one; a result's own headings under a style; the layout's call to action,
 * found by its role and label, wearing `--action-shadow` and, while it has
 * keyboard focus, the focus outline no shadow can hide; the host's own main
 * action wearing the same shadow; every panel the style dresses on a produced
 * page in a panel's corner; and the band's focus outline reading on the band.
 */
async function expectStyleReachesPage(canvasElement: HTMLElement, subject: Subject) {
  const pages = [...canvasElement.querySelectorAll<HTMLElement>('.app-host')];
  await expect(pages.length, 'host pages').toBeGreaterThan(0);
  for (const page of pages) {
    const styled = page.matches('.app-style:not(.app-style-quiet)');
    const facesSet = styled || page.matches('[data-typeface]');
    const titles = [...page.querySelectorAll<HTMLElement>('h1, h2, h3')].filter(
      (heading) =>
        !heading.classList.contains('uppercase') && (styled || !heading.closest('.af-result')),
    );
    await expect(titles.length, 'titles').toBeGreaterThan(0);
    for (const title of titles) {
      const drawn = getComputedStyle(title);
      const name = title.textContent?.trim() ?? title.tagName;
      await expect(drawn.fontWeight, `${name}: weight`).toBe(
        resolvedBeside(title, 'font-weight', 'var(--heading-weight)'),
      );
      await expect(drawn.letterSpacing, `${name}: tracking`).toBe(
        resolvedBeside(title, 'letter-spacing', 'var(--heading-tracking)'),
      );
      if (facesSet)
        await expect(drawn.fontFamily, `${name}: face`).toBe(
          resolvedBeside(title, 'font-family', 'var(--font-heading, var(--font-sans))'),
        );
    }
    for (const label of callsToAction(subject)) {
      const action = within(page).getByRole('button', { name: label });
      await expect(getComputedStyle(action).boxShadow, `${label}: shadow`).toBe(
        resolvedBeside(action, 'box-shadow', 'var(--action-shadow)'),
      );
      action.focus({ preventScroll: true });
      try {
        await expect(action.matches(':focus-visible'), `${label}: focus-visible`).toBe(true);
        // The button transitions every property, its outline included, so the
        // outline is read once it has settled.
        await Promise.all(action.getAnimations().map((animation) => animation.finished));
        const focused = getComputedStyle(action);
        await expect(focused.outlineStyle, `${label}: focus outline`).toBe('solid');
        await expect(focused.outlineWidth, `${label}: focus outline`).toBe('2px');
      } finally {
        action.blur();
      }
    }
    for (const main of page.querySelectorAll<HTMLElement>('.af-btn:not(.ghost, .link)')) {
      await expect(getComputedStyle(main).boxShadow, 'the host action: shadow').toBe(
        resolvedBeside(main, 'box-shadow', 'var(--action-shadow)'),
      );
    }
    // Every panel a style dresses on a produced page, the rail and the card,
    // takes a panel's corner, one and a half times a control's.
    for (const panel of page.querySelectorAll<HTMLElement>('[data-style-panel]')) {
      await expect(getComputedStyle(panel).borderTopLeftRadius, 'a style panel: corner').toBe(
        resolvedBeside(panel, 'border-top-left-radius', 'calc(var(--radius) * 1.5)'),
      );
    }
    for (const button of page.querySelectorAll<HTMLElement>('.af-band-btn')) {
      await expectFocusReadsOn(button, button.closest<HTMLElement>('.af-band')!, 'the band');
    }
  }
}

/**
 * `control`'s focus outline, drawn while it has keyboard focus, reads at 3:1
 * on `ground` (WCAG 1.4.11), the surface the outline is drawn over. A team's
 * accent ink is measured on the page and the panels; a band in the team's
 * header colour is none of those, so its controls' outline is held here.
 */
async function expectFocusReadsOn(control: HTMLElement, ground: HTMLElement, where: string) {
  control.focus({ preventScroll: true });
  try {
    await expect(control.matches(':focus-visible'), `${where}: focus-visible`).toBe(true);
    const outline = getComputedStyle(control);
    await expect(outline.outlineStyle, `${where}: focus outline`).toBe('solid');
    await expect(
      paintedContrast(outline.outlineColor, backgroundOf(ground)),
      `${where}: focus outline contrast`,
    ).toBeGreaterThanOrEqual(3);
  } finally {
    control.blur();
  }
}

const meta = {
  title: 'Generative/App styles',
  component: StyledPage,
  args: { subject: 'compose', style: 'quiet', team: 'none', typeface: 'none' },
  play: async ({ canvasElement, args }) => expectStyleReachesPage(canvasElement, args.subject),
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

/**
 * On a phone, a style keeps the page in its width and every control on it -
 * the host's band and action row, the kernel's fields, the result view's
 * actions - at 44px or more to tap: its radius, its faces and its rhythm
 * never shrink one.
 */
async function expectPhoneReady(canvasElement: HTMLElement) {
  await atWidth('phone');
  await styleFontsReady();
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  await expectEveryTouchTarget(canvasElement);
}

function onAPhone(subject: 'compose' | 'result', style: AppStyleId, team: TeamKey): Story {
  return {
    name: `${subject === 'compose' ? 'Compose' : 'Result'} · ${style} · phone`,
    ...pinnedTo('phone'),
    args: { subject, style, team },
    play: async ({ canvasElement }) => {
      await expectPhoneReady(canvasElement);
      await expectStyleReachesPage(canvasElement, subject);
    },
  };
}

export const ComposeQuietPhone = onAPhone('compose', 'quiet', 'gov-uk');
export const ComposeSoftPhone = onAPhone('compose', 'soft', 'stripe');
export const ComposeEditorialPhone = onAPhone('compose', 'editorial', 'gov-uk');
export const ComposeBoldPhone = onAPhone('compose', 'bold', 'typer');
export const ResultEditorialPhone = onAPhone('result', 'editorial', 'stripe');
export const ResultBoldPhone = onAPhone('result', 'bold', 'typer');

// ─── A switch, in every style ──────────────────────────────────────────────

const SWITCHES: BooleanRunField[] = [
  { kind: 'boolean', name: 'with_children', conceptRef: 'native.Boolean', required: false },
  { kind: 'boolean', name: 'step_free', conceptRef: 'native.Boolean', required: false },
];

/**
 * The kernel's boolean, off and on, in the host's panel under every style,
 * with a team's colours: the field fill a style gives its panel is the row
 * the switch sits in, so the off track must show on it as well as on the
 * host's own grey.
 */
function SwitchesInEveryStyle({ team }: { team: TeamKey | null }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['none', ...APP_STYLE_IDS] as const).map((style) => (
        <AppScope key={style} style={style} team={team}>
          <div className="af" style={{ minHeight: 0, padding: 16 }}>
            <div className="af-panel" style={{ display: 'grid', gap: 12, padding: 16 }}>
              <FieldPresentationProvider presentation="app">
                {SWITCHES.map((field, index) => (
                  <BooleanField
                    key={field.name}
                    field={field}
                    value={index === 1}
                    onChange={() => undefined}
                    id={`${style}-${field.name}`}
                  />
                ))}
              </FieldPresentationProvider>
            </div>
          </div>
        </AppScope>
      ))}
    </div>
  );
}

/**
 * An off switch's track reads at 3:1 on the row it sits in, which is the
 * field fill of the panel around it (WCAG 1.4.11), and the thumb reads on
 * the track, in every style and both themes.
 */
export const SwitchesEveryStyle: Story = {
  name: 'Switches · every style · stripe.com colours',
  args: { subject: 'compose', style: 'quiet', team: 'stripe' },
  render: (args) => <SwitchesInEveryStyle team={args.team === 'none' ? null : args.team} />,
  play: async ({ canvasElement, globals }) => {
    const off = [...canvasElement.querySelectorAll<HTMLElement>('[role="switch"]')].filter(
      (track) => track.getAttribute('aria-checked') === 'false',
    );
    // One off switch for no style and for each style, in each theme pane the
    // toolbar shows.
    const panes = globals.themeView === 'light' || globals.themeView === 'dark' ? 1 : 2;
    await expect(off).toHaveLength((APP_STYLE_IDS.length + 1) * panes);
    for (const track of off) {
      const row = track.parentElement!;
      const style = track.closest('.app-host')?.className ?? '';
      await expect(
        paintedContrast(getComputedStyle(track).backgroundColor, backgroundOf(row)),
        `${style}: the off track on its row`,
      ).toBeGreaterThanOrEqual(3);
      const thumb = track.firstElementChild!;
      await expect(
        paintedContrast(getComputedStyle(thumb).backgroundColor, backgroundOf(track)),
        `${style}: the thumb on the off track`,
      ).toBeGreaterThanOrEqual(3);
    }
  },
};
