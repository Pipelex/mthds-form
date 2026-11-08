import type { InputForm, OutputForm, PipeIOContracts, RunField } from '../../../core';
import {
  buildResultField,
  buildRunFields,
  getPipeIOContract,
  getPipeInputForm,
  getPipeOutputForm,
} from '../../../core';
import type { SpecFixture } from '../../../generative';
import * as extractInvoice from '../../_generated/extract_invoice';
import { PAYLOADS as INVOICE_PAYLOADS } from '../../_generated/extract_invoice.payloads';
import { SPECS as INVOICE_SPECS } from '../../_generated/extract_invoice.specs';
import * as planTrip from '../../_generated/plan_trip';
import { PAYLOADS as TRIP_PAYLOADS } from '../../_generated/plan_trip.payloads';
import { SPECS as TRIP_SPECS } from '../../_generated/plan_trip.specs';
import * as slideDirections from '../../_generated/slide_directions';
import { PAYLOADS as SLIDES_PAYLOADS } from '../../_generated/slide_directions.payloads';
import { SPECS as SLIDES_SPECS } from '../../_generated/slide_directions.specs';

/**
 * The three apps a host's compose-then-result frame is drawn for, each one
 * method from the corpus with one real run: the trip planner and the slide
 * directions written here, and the invoice extractor as the methods library
 * carries it. Each carries what the host knows and no descriptor says - the
 * app's name, how long a run takes, the result's actions, the request's
 * summary - and the inputs the real run was given, which the composer is
 * filled with, so the composer and the result are the two pages of one run.
 */

export type AppKey = 'trip' | 'invoice' | 'slides';
export const APP_KEYS: readonly AppKey[] = ['trip', 'invoice', 'slides'];

interface CaseModule {
  CONTRACTS: PipeIOContracts;
  INPUT_FORM: InputForm;
  OUTPUT_FORM: OutputForm;
  PIPE_DESCRIPTIONS: Record<string, string>;
}

export interface HostApp {
  key: AppKey;
  /** The app's name, as the band shows it and the plain composer's title. */
  appName: string;
  /** The method's own description: what a host with no designer writes under the title. */
  lede: string;
  /** How long a run takes, from the app's past runs. */
  eta: string;
  /** The request, as the host's bar summarizes it on the result page. */
  request: string;
  /** The result's actions, primary first. */
  actions: readonly string[];
  pipeRef: string;
  composer: {
    descriptor: NonNullable<ReturnType<typeof getPipeInputForm>>;
    contract: NonNullable<ReturnType<typeof getPipeIOContract>>;
    fields: RunField[];
    /** What the real run was given. */
    values: Record<string, unknown>;
  };
  result: {
    field: RunField;
    payload: unknown;
    /** The host's resolver for the run's stored files, as a story stands them in. */
    resolveUrl?: (url: string) => string | undefined;
  };
  /** Every layout captured for the app's two moments. */
  specs: readonly SpecFixture[];
}

function hostApp(
  module: CaseModule,
  payloads: Record<string, unknown>,
  specs: readonly SpecFixture[],
  domain: string,
  pipeCode: string,
  facts: Omit<HostApp, 'pipeRef' | 'lede' | 'composer' | 'result' | 'specs'> & {
    values: Record<string, unknown>;
    resolveUrl?: (url: string) => string | undefined;
  },
): HostApp {
  const pipeRef = `${domain}.${pipeCode}`;
  const contract = getPipeIOContract(module.CONTRACTS, domain, pipeCode);
  const descriptor = getPipeInputForm(module.INPUT_FORM, domain, pipeCode);
  const output = getPipeOutputForm(module.OUTPUT_FORM, domain, pipeCode);
  if (!contract || !descriptor || !output || !(pipeRef in payloads)) {
    throw new Error(`${pipeRef}: no contract, descriptor or payload in the generated fixtures.`);
  }
  const { values, resolveUrl, ...host } = facts;
  return {
    ...host,
    pipeRef,
    lede: module.PIPE_DESCRIPTIONS[pipeRef] ?? '',
    composer: {
      descriptor,
      contract,
      fields: buildRunFields(descriptor, contract.inputs),
      values,
    },
    result: {
      field: buildResultField(output, contract.output.json_schema),
      payload: payloads[pipeRef],
      resolveUrl,
    },
    specs,
  };
}

/** The slide run's three title slides, served by Storybook from `data/inputs/`, in the run's order. */
const SLIDE_PICTURES = [
  '/slide-direction-1.jpg',
  '/slide-direction-2.jpg',
  '/slide-direction-3.jpg',
];

function slideResolver(): (url: string) => string | undefined {
  const { directions } = SLIDES_PAYLOADS[
    'slide_directions.generate_design_proposals_from_rough_brief'
  ] as { directions: Array<{ mockup: { url: string } }> };
  const local = new Map(
    directions.map((direction, i) => [direction.mockup.url, SLIDE_PICTURES[i]]),
  );
  return (url) => local.get(url);
}

export const APPS: Record<AppKey, HostApp> = {
  trip: hostApp(planTrip, TRIP_PAYLOADS, TRIP_SPECS, 'trip_planner', 'plan_trip', {
    key: 'trip',
    appName: 'Trip planner',
    eta: 'Takes about 20 seconds',
    request: 'Lisbon in April · 3 travellers · €3,200',
    actions: ['Download PDF', 'Share'],
    values: {
      request: {
        title: 'Lisbon in April',
        stay: {
          city: 'Lisbon',
          country: 'Portugal',
          arriving_on: '2027-04-14',
          leaving_on: '2027-04-19',
          must_see: ['Belém Tower', 'Sintra', 'LX Factory'],
        },
        travellers: [
          { name: 'Maya Okafor', age: 38, dietary: 'Vegetarian' },
          { name: 'Tom Okafor', age: 40 },
          { name: 'Ada Okafor', age: 9 },
        ],
        budget: 3200,
        currency: 'EUR',
        pace: 'balanced',
        style: 'family',
        with_children: true,
        notes: 'Ada loves trams and anything with pastries. We would like one day out of the city.',
      },
    },
  }),
  invoice: hostApp(
    extractInvoice,
    INVOICE_PAYLOADS,
    INVOICE_SPECS,
    'invoice_extraction',
    'process_invoice',
    {
      key: 'invoice',
      appName: 'Receipt reader',
      eta: 'Takes about 30 seconds',
      request: 'restaurant_invoice.pdf',
      actions: ['Download CSV'],
      // A real host's upload lands in its storage, which the control does not print.
      values: {
        document: {
          url: 'pipelex-storage://uploads/restaurant_invoice.pdf',
          filename: 'restaurant_invoice.pdf',
        },
      },
    },
  ),
  slides: hostApp(
    slideDirections,
    SLIDES_PAYLOADS,
    SLIDES_SPECS,
    'slide_directions',
    'generate_design_proposals_from_rough_brief',
    {
      key: 'slides',
      appName: 'Slide directions',
      eta: 'Takes about 40 seconds',
      request: 'Q4 2025 Financial Results · keynote · executives',
      actions: ['Download PDF'],
      values: {
        brief: {
          topic: 'Q4 2025 Financial Results',
          goal: 'keynote',
          audience: 'executives',
          tone: 'formal',
        },
      },
      resolveUrl: slideResolver(),
    },
  ),
};
