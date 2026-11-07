import * as React from 'react';
import { createStateStore } from '@json-render/core';
import type { RunField } from '../../../core';
import {
  buildResultField,
  getPipeIOContract,
  getPipeInputForm,
  getPipeOutputForm,
} from '../../../core';
import {
  FieldPresentationProvider,
  MethodForm,
  ResultEnvProvider,
  StuffViewer,
  useMethodForm,
} from '../../../react';
import {
  FrameHostProvider,
  GenerativePage,
  layoutCheckProblems,
  pathFromDomId,
  payloadToState,
  type SpecFixture,
} from '../../../generative';
import type { BrandManifest } from '../../../brand';
import { CONTRACTS as TRIP_CONTRACTS, INPUT_FORM as TRIP_INPUT_FORM } from '../../_generated/trips';
import {
  CONTRACTS as COMPOSITE_CONTRACTS,
  OUTPUT_FORM as COMPOSITE_OUTPUT_FORM,
} from '../../_generated/composites';
import { PAYLOADS as COMPOSITE_PAYLOADS } from '../../_generated/composites.payloads';
import { STOCK } from '../brands';
import { useLayoutStore } from '../layout-page';
import { standInUpload } from '../../stand-in-upload';
import type { HostApp } from './apps';
import { TEAMS, teamTokens, type TeamKey } from './teams';

/**
 * A host's compose-then-result frame, drawn around the kernel: the band with
 * the team's logo and the app's name, then either the headline over a
 * composer column whose foot is the action row (compose), or the request bar
 * over the result across the page (result). The host draws all of it except
 * what fills the composer and the result, which is the kernel's plain form in
 * its `app` presentation and the kernel's result view over a real run.
 *
 * What the host knows and no descriptor says - the app's name, the headline,
 * how long a run takes, the result's actions - is stated here, once per app,
 * the way a host holds it.
 */

/** Where the host's frame turns into its phone layout: frame.css's `data-narrow` rules. */
const NARROW_PX = 640;

/**
 * The host's frame element, marked `data-narrow` while it is 640px wide or
 * less. Measured with a ResizeObserver rather than queried as a size
 * container: a size container contains its layout and becomes the containing
 * block of every `position: fixed` descendant, which pinned the kernel's
 * dialogs and sheets to the frame instead of the viewport. The first
 * measure is taken before paint, so the first frame is already laid out.
 */
function AppFrame({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = React.useState(false);
  React.useLayoutEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const measure = () => setNarrow(frame.getBoundingClientRect().width <= NARROW_PX);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="af" data-narrow={narrow ? '' : undefined}>
      {children}
    </div>
  );
}

/** The host's upload, as a story stands it in. */
async function upload(file: File) {
  return standInUpload(file);
}

function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
const CLOCK = 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
const HISTORY = 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l4 2';
const ARROW = 'M5 12h14M13 6l6 6-6 6';
const PENCIL = 'M4 20h4L19 9l-4-4L4 16v4z';

/**
 * The logo the band draws: the team's, or the host's own when the app wears no
 * team's colours. On a light page a team's band is its header colour, so the
 * mark is the one drawn for that ground - the light mark on a dark band; on a
 * dark page the band is the page itself (`bandOn`), so it takes the light
 * mark. With no band, the theme decides.
 */
function Logo({ team }: { team: TeamKey | null }) {
  const { name, logo } = team
    ? TEAMS[team]
    : { name: STOCK.manifest.name, logo: { ...STOCK.manifest.logo, wide: true } };
  const onBand = team ? teamTokens(TEAMS[team], 'light')['--on-band'] : undefined;
  const marks: Array<['on-light' | 'on-dark', string]> = [
    ['on-light', onBand === '#ffffff' ? logo.onDark : logo.onLight],
    ['on-dark', logo.onDark],
  ];
  return (
    <span className="af-logo">
      {marks.map(([which, src]) => (
        <img
          key={which}
          src={src}
          alt={logo.wide ? name : ''}
          referrerPolicy="no-referrer"
          className={`${which}${logo.wide ? ' wide' : ''}`}
          style={'height' in logo && logo.height ? { height: logo.height } : undefined}
        />
      ))}
      {logo.wide ? null : <span>{name}</span>}
    </span>
  );
}

function Band({ appName, team }: { appName: string; team: TeamKey | null }) {
  return (
    <header className="af-band">
      <div className="af-band-l">
        <Logo team={team} />
        <span className="af-band-sep" aria-hidden="true" />
        <span className="af-band-app">{appName}</span>
      </div>
      <button type="button" className="af-band-btn" aria-label="History">
        <Icon d={HISTORY} /> <span className="af-band-btn-label">History</span>
      </button>
    </header>
  );
}

// ─── Compose: the trip planner's plain form ────────────────────────────────

const TRIP_DESCRIPTOR = getPipeInputForm(TRIP_INPUT_FORM, 'trips', 'plan_trip');
const TRIP_CONTRACT = getPipeIOContract(TRIP_CONTRACTS, 'trips', 'plan_trip');
if (!TRIP_DESCRIPTOR || !TRIP_CONTRACT) {
  throw new Error('trips.plan_trip: no input form or contract in the generated fixtures.');
}

/** What the host knows about the trip planner, the lede in its own words. */
const TRIP_APP = {
  appName: 'Trip planner',
  headline: 'Plan a trip',
  lede: 'Tell us who is going, where and when, and the budget. Add a photo for the mood if you have one.',
  eta: 'Takes about 20 seconds',
  run: 'Run',
};

function ComposeBody() {
  const form = useMethodForm({
    descriptor: TRIP_DESCRIPTOR!,
    contract: TRIP_CONTRACT!,
    uploadFile: upload,
  });
  return (
    <main className="af-page">
      <div className="af-col">
        <div>
          <h1 className="af-display">{TRIP_APP.headline}</h1>
          <p className="af-lead">{TRIP_APP.lede}</p>
        </div>
        <div className="af-panel af-comp">
          <MethodForm form={form} presentation="app" />
          <div className="af-act">
            <span className="af-eta">
              <Icon d={CLOCK} /> {TRIP_APP.eta}
            </span>
            <button type="button" className="af-btn">
              {TRIP_APP.run} <Icon d={ARROW} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

// ─── Result: the launch report a real run returned ─────────────────────────

const LAUNCH_PAYLOAD = COMPOSITE_PAYLOADS['composites.launch_report'] as {
  cover_picture: { url: string };
};
const LAUNCH_DESCRIPTOR = getPipeOutputForm(COMPOSITE_OUTPUT_FORM, 'composites', 'launch_report');
const LAUNCH_CONTRACT = getPipeIOContract(COMPOSITE_CONTRACTS, 'composites', 'launch_report');
if (!LAUNCH_DESCRIPTOR || !LAUNCH_CONTRACT) {
  throw new Error(
    'composites.launch_report: no output form or contract in the generated fixtures.',
  );
}
const LAUNCH_FIELD: RunField = buildResultField(
  LAUNCH_DESCRIPTOR,
  LAUNCH_CONTRACT.output.json_schema,
);

/** The host's resolver for the run's one stored picture, as in `Outputs/Composites`. */
function resolveLaunchPicture(url: string): string | undefined {
  return url === LAUNCH_PAYLOAD.cover_picture.url ? '/figure_1.jpg' : undefined;
}

/** What the host knows about the launch report. */
const LAUNCH_APP = {
  appName: 'Launch brief',
  eyebrow: 'Your result',
  title: 'Launch report',
  request: 'From your launch notes',
  again: 'Run again',
  actions: ['Share'],
};

function ResultBody() {
  return (
    <>
      <div className="af-req">
        <div className="af-req-i">
          <span className="af-req-l">{LAUNCH_APP.request}</span>
          <button type="button" className="af-btn link">
            <Icon d={PENCIL} size={14} /> Edit
          </button>
          <button type="button" className="af-btn ghost">
            {LAUNCH_APP.again}
          </button>
        </div>
      </div>
      <main className="af-stage">
        <div className="af-res-head">
          <div>
            <p className="af-eyebrow">{LAUNCH_APP.eyebrow}</p>
            <h1 className="af-res-title">{LAUNCH_APP.title}</h1>
          </div>
          <div className="af-actions">
            {LAUNCH_APP.actions.map((label) => (
              <button key={label} type="button" className="af-btn ghost">
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="af-panel af-result">
          <ResultEnvProvider resolveUrl={resolveLaunchPicture}>
            <FieldPresentationProvider presentation="app">
              <StuffViewer
                field={LAUNCH_FIELD}
                value={COMPOSITE_PAYLOADS['composites.launch_report']}
              />
            </FieldPresentationProvider>
          </ResultEnvProvider>
        </div>
      </main>
    </>
  );
}

// ─── The frame ─────────────────────────────────────────────────────────────

export type Moment = 'compose' | 'result';

export function Frame({ moment, team }: { moment: Moment; team: TeamKey | null }) {
  return (
    <AppFrame>
      <Band appName={moment === 'compose' ? TRIP_APP.appName : LAUNCH_APP.appName} team={team} />
      {moment === 'compose' ? <ComposeBody /> : <ResultBody />}
    </AppFrame>
  );
}

// ─── A captured layout, on the host's page ─────────────────────────────────

/** The manifest a designed page's bar reads: the team's name and logo, or the host's own. */
export function manifestFor(team: TeamKey | null): BrandManifest {
  if (!team) return STOCK.manifest;
  const { name, site, logo } = TEAMS[team];
  return {
    name,
    website: site,
    logo: { onLight: logo.onLight, onDark: logo.onDark },
    webfont: null,
  };
}

/**
 * Whether a layout draws its own app bar, in which case it is the whole page
 * and the host draws no band. Wherever the layout places it: the catalog
 * allows one `AppBar` a page, as its banner, so a host band beside it would
 * be a second app bar however deep the layout's sits.
 */
function drawsItsOwnBar(fixture: SpecFixture): boolean {
  const { root, elements } = fixture.spec as {
    root: string;
    elements: Record<string, { type: string; children?: string[] }>;
  };
  const seen = new Set<string>();
  const hasBar = (key: string): boolean => {
    const element = elements[key];
    if (!element || seen.has(key)) return false;
    seen.add(key);
    return element.type === 'AppBar' || (element.children ?? []).some(hasBar);
  };
  return hasBar(root);
}

/**
 * A captured layout over the descriptor it was written for, rendered as the
 * host renders one: in the `app` presentation, its inputs written back where
 * the layout's paths say, a dropped file uploaded the host's way. A layout
 * that draws its own app bar is the whole page; any other sits under the
 * host's band, in the host's page column.
 */
export function DesignedPage({
  appName,
  fields,
  fixture,
  team,
  idPrefix,
}: {
  appName: string;
  fields: RunField[];
  fixture: SpecFixture;
  team: TeamKey | null;
  idPrefix: string;
}) {
  const { store, env } = useLayoutStore(fields, idPrefix);
  const page = (
    <div>
      <FieldPresentationProvider presentation="app">
        <GenerativePage
          spec={fixture.spec}
          store={store}
          scope={{ inputs: fields, idPrefix, env }}
          brand={manifestFor(team)}
        />
      </FieldPresentationProvider>
    </div>
  );
  if (drawsItsOwnBar(fixture)) return <AppFrame>{page}</AppFrame>;
  return (
    <AppFrame>
      <Band appName={appName} team={team} />
      <main className="af-stage">{page}</main>
    </AppFrame>
  );
}

// ─── A moment of an app: the plain form, or a layout written for it ────────

/**
 * The composer as a host with no designer draws it: the app's name and the
 * method's own description over the kernel's plain form, filled with what the
 * real run was given, in a raised panel whose foot is the host's action row.
 */
function PlainComposer({ app }: { app: HostApp }) {
  const form = useMethodForm({
    descriptor: app.composer.descriptor,
    contract: app.composer.contract,
    initialValues: app.composer.values,
    uploadFile: upload,
  });
  return (
    <main className="af-page">
      <div className="af-col">
        <div>
          <h1 className="af-display">{app.appName}</h1>
          {app.lede ? <p className="af-lead">{app.lede}</p> : null}
        </div>
        <div className="af-panel af-comp">
          <MethodForm form={form} presentation="app" />
          <div className="af-act">
            <span className="af-eta">
              <Icon d={CLOCK} /> {app.eta}
            </span>
            <button type="button" className="af-btn">
              Run <Icon d={ARROW} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * A layout written for the composer frame, rendered as a host renders one:
 * over the same inputs, filled the same way, in the `app` presentation, with
 * the host's one fact the layout cannot know - how long a run takes - handed
 * to the Composer that places the action row.
 */
function DesignedComposer({ app, fixture }: { app: HostApp; fixture: SpecFixture }) {
  const idPrefix = `dc-${app.key}`;
  const store = React.useMemo(
    () => createStateStore({ inputs: structuredClone(app.composer.values) }),
    [app],
  );
  const env = React.useMemo(
    () => ({
      onDropFile: (id: string, file: File) => {
        const path = pathFromDomId(idPrefix, id);
        if (path) store.set(path, standInUpload(file));
      },
    }),
    [idPrefix, store],
  );
  return (
    <main className="af-page">
      <FrameHostProvider host={{ eta: app.eta }}>
        <FieldPresentationProvider presentation="app">
          <GenerativePage
            spec={fixture.spec}
            store={store}
            scope={{ inputs: app.composer.fields, idPrefix, env }}
          />
        </FieldPresentationProvider>
      </FrameHostProvider>
    </main>
  );
}

/** The host's request bar over a result page: what was asked, and the way back to change it. */
function RequestBar({ app }: { app: HostApp }) {
  return (
    <div className="af-req">
      <div className="af-req-i">
        <span className="af-req-l">{app.request}</span>
        <button type="button" className="af-btn link">
          <Icon d={PENCIL} size={14} /> Edit
        </button>
        <button type="button" className="af-btn ghost">
          Run again
        </button>
      </div>
    </div>
  );
}

/** The result page as a host with no designer draws it: its own header over the kernel's result view. */
function PlainResult({ app }: { app: HostApp }) {
  return (
    <main className="af-stage">
      <div className="af-res-head">
        <div>
          <p className="af-eyebrow">Your result</p>
          <h1 className="af-res-title">{app.appName}</h1>
        </div>
        <div className="af-actions">
          {app.actions.map((label) => (
            <button key={label} type="button" className="af-btn ghost">
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="af-panel af-result">
        <ResultEnvProvider resolveUrl={app.result.resolveUrl}>
          <FieldPresentationProvider presentation="app">
            <StuffViewer field={app.result.field} value={app.result.payload} />
          </FieldPresentationProvider>
        </ResultEnvProvider>
      </div>
    </main>
  );
}

/**
 * A layout written for the result frame over the same run, its actions the
 * host's, placed where the layout's ResultHeader says.
 */
function DesignedResult({ app, fixture }: { app: HostApp; fixture: SpecFixture }) {
  const store = React.useMemo(
    () =>
      createStateStore({
        result: payloadToState(app.result.field, app.result.payload) as Record<string, unknown>,
      }),
    [app],
  );
  return (
    <main className="af-stage">
      <FrameHostProvider host={{ actions: app.actions }}>
        <ResultEnvProvider resolveUrl={app.result.resolveUrl}>
          <FieldPresentationProvider presentation="app">
            <GenerativePage
              spec={fixture.spec}
              store={store}
              scope={{ result: app.result.field, idPrefix: `dr-${app.key}` }}
            />
          </FieldPresentationProvider>
        </ResultEnvProvider>
      </FrameHostProvider>
    </main>
  );
}

/**
 * The layout a host would render for a moment, or a loud failure: the checks
 * a host runs before it renders a stored layout (`layoutCheckProblems`), so a
 * story never shows a layout a host would have refused for the plain form.
 */
export function checkedLayout(app: HostApp, fixture: SpecFixture): SpecFixture {
  const frame = fixture.frame ?? 'page';
  const problems = layoutCheckProblems(fixture.spec, {
    frame,
    descriptor: frame === 'result' ? { result: app.result.field } : { inputs: app.composer.fields },
  });
  if (problems.length > 0) throw new Error(`${fixture.pipeRef}: ${problems.join('; ')}`);
  return fixture;
}

/**
 * One moment of an app in the host's frame: the band, then the composer or
 * the request bar over the result page, each either the kernel's plain view
 * (`layout` null) or a layout the designer wrote for that moment.
 */
export function AppMoment({
  app,
  moment,
  layout,
  team,
}: {
  app: HostApp;
  moment: Moment;
  layout: SpecFixture | null;
  team: TeamKey | null;
}) {
  return (
    <AppFrame>
      <Band appName={app.appName} team={team} />
      {moment === 'compose' ? (
        layout ? (
          <DesignedComposer app={app} fixture={layout} />
        ) : (
          <PlainComposer app={app} />
        )
      ) : (
        <>
          <RequestBar app={app} />
          {layout ? <DesignedResult app={app} fixture={layout} /> : <PlainResult app={app} />}
        </>
      )}
    </AppFrame>
  );
}
