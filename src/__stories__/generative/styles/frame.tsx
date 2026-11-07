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
  type FieldEnv,
} from '../../../react';
import { GenerativePage, pathFromDomId, seedInputs, type SpecFixture } from '../../../generative';
import { deriveBrandRoles, type BrandManifest } from '../../../brand';
import { CONTRACTS as TRIP_CONTRACTS, INPUT_FORM as TRIP_INPUT_FORM } from '../../_generated/trips';
import {
  CONTRACTS as COMPOSITE_CONTRACTS,
  OUTPUT_FORM as COMPOSITE_OUTPUT_FORM,
} from '../../_generated/composites';
import { PAYLOADS as COMPOSITE_PAYLOADS } from '../../_generated/composites.payloads';
import { STOCK } from '../brands';
import { HOST_PAGE, TEAMS, type TeamKey } from './teams';

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

/** The host's upload: a picked file becomes a local link, as a real upload becomes a stored one. */
async function upload(file: File) {
  return { url: URL.createObjectURL(file), filename: file.name };
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
 * team's colours. On a team's band, the mark is the one drawn for that band's
 * ground - the light mark on a dark band - in both themes; on the host's own
 * band, the theme decides.
 */
function Logo({ team }: { team: TeamKey | null }) {
  const { name, logo } = team
    ? TEAMS[team]
    : { name: STOCK.manifest.name, logo: { ...STOCK.manifest.logo, wide: true } };
  const onBand = team ? deriveBrandRoles(TEAMS[team].seeds, HOST_PAGE.light).onHeader : undefined;
  const marks: Array<['on-light' | 'on-dark' | 'on-band', string]> =
    onBand === undefined
      ? [
          ['on-light', logo.onLight],
          ['on-dark', logo.onDark],
        ]
      : [['on-band', onBand === '#ffffff' ? logo.onDark : logo.onLight]];
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
      <button type="button" className="af-band-btn">
        <Icon d={HISTORY} /> History
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
    <div className="af">
      <Band appName={moment === 'compose' ? TRIP_APP.appName : LAUNCH_APP.appName} team={team} />
      {moment === 'compose' ? <ComposeBody /> : <ResultBody />}
    </div>
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

/** Whether a layout draws its own app bar, in which case it is the whole page and the host draws no band. */
function drawsItsOwnBar(fixture: SpecFixture): boolean {
  const { root, elements } = fixture.spec as {
    root: string;
    elements: Record<string, { type: string; children?: string[] }>;
  };
  return (elements[root]?.children ?? []).some((child) => elements[child]?.type === 'AppBar');
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
  const store = React.useMemo(() => createStateStore({ inputs: seedInputs(fields) }), [fields]);
  const env = React.useMemo<FieldEnv>(
    () => ({
      onDropFile: (id, file) => {
        const path = pathFromDomId(idPrefix, id);
        if (path) store.set(path, { url: URL.createObjectURL(file), filename: file.name });
      },
    }),
    [idPrefix, store],
  );
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
  if (drawsItsOwnBar(fixture)) return <div className="af">{page}</div>;
  return (
    <div className="af">
      <Band appName={appName} team={team} />
      <main className="af-stage af-designed">{page}</main>
    </div>
  );
}
