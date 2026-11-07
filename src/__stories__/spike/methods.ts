/**
 * SPIKE ONLY (L-261107-a6a35f, never merged): the three methods of the layout
 * mockups, as a host would hold them - the descriptors and one real run's
 * payload, from the run's own results (`data/*.json`), plus what only the host
 * knows: the team whose app it is, its style, how long a run takes and what
 * the result's actions are called.
 */
import type {
  InputForm,
  OutputForm,
  PipeInputFormDescriptor,
  PipeIOContract,
  PipeIOContracts,
  RunField,
} from '../../core';
import { buildResultField, buildRunFields } from '../../core';
import invoiceData from './data/invoice.json';
import slidesData from './data/slides.json';
import tripData from './data/trip.json';
import direction1 from './assets/direction-1.jpg';
import direction2 from './assets/direction-2.jpg';
import direction3 from './assets/direction-3.jpg';

export type MethodKey = 'invoice' | 'trip' | 'slides';
export type StyleId = 'quiet' | 'soft' | 'editorial' | 'bold';
export type TeamKey = 'northfield' | 'wayfarer' | 'kiln';

export interface TeamColours {
  band: string | null;
  onBand: string | null;
  primary: string;
  onPrimary: string;
  link: string;
}

export interface Team {
  key: TeamKey;
  name: string;
  light: TeamColours;
  dark: TeamColours;
}

/** The mockups' three teams, their colours copied from `wip/app-styles/layouts/index.html`. */
export const TEAMS: Record<TeamKey, Team> = {
  northfield: {
    key: 'northfield',
    name: 'Northfield Ledger',
    light: {
      band: '#12312b',
      onBand: '#ffffff',
      primary: '#1f7a5a',
      onPrimary: '#ffffff',
      link: '#1a6b4f',
    },
    dark: {
      band: '#0f2823',
      onBand: '#ffffff',
      primary: '#4cc79a',
      onPrimary: '#04130d',
      link: '#6fd6ae',
    },
  },
  wayfarer: {
    key: 'wayfarer',
    name: 'Wayfarer & Co',
    light: {
      band: '#0e4d64',
      onBand: '#ffffff',
      primary: '#f2994a',
      onPrimary: '#1a0e02',
      link: '#0b6782',
    },
    dark: {
      band: '#0b3a4b',
      onBand: '#ffffff',
      primary: '#f5a65f',
      onPrimary: '#1a0e02',
      link: '#5cc3e0',
    },
  },
  kiln: {
    key: 'kiln',
    name: 'Studio Kiln',
    light: { band: null, onBand: null, primary: '#161616', onPrimary: '#ffffff', link: '#b8235a' },
    dark: { band: null, onBand: null, primary: '#f1f1f1', onPrimary: '#0a0a0a', link: '#f06595' },
  },
};

/** What a host knows about an app that no descriptor says. */
export interface HostKnowledge {
  /** The app's name as the band shows it. */
  appName: string;
  team: TeamKey;
  style: StyleId;
  /** How long a run usually takes, from the app's past runs. */
  eta: string;
  /** The result's actions, drawn by the host. */
  actions: string[];
  /** Run again, in the host's generic words. */
  again: string;
}

export interface SpikeMethod {
  key: MethodKey;
  pipeRef: string;
  /** The method's name, as a host lists it. */
  name: string;
  /** The main pipe's own description. */
  description: string;
  inputFields: RunField[];
  resultField: RunField;
  /** The input descriptor and the contract, as `useMethodForm` takes them. */
  descriptor: PipeInputFormDescriptor;
  contract: PipeIOContract;
  /** The inputs the real run was given, which the composer is filled with. */
  inputs: Record<string, unknown>;
  /** What the real run returned, as the results route carries it. */
  payload: unknown;
  run: string;
  producedBy: string;
  host: HostKnowledge;
}

interface RunData {
  pipeRef: string;
  name: string;
  description: string | null;
  run: string;
  producedBy: string;
  input_form: InputForm;
  output_form: OutputForm;
  pipe_io_contracts: PipeIOContracts;
  payload: unknown;
}

function fieldsOf(data: RunData): {
  inputFields: RunField[];
  resultField: RunField;
  descriptor: PipeInputFormDescriptor;
  contract: PipeIOContract;
} {
  const ref = data.pipeRef;
  const contract = data.pipe_io_contracts[ref];
  const inputForm = data.input_form[ref];
  const outputForm = data.output_form[ref];
  if (!contract || !inputForm || !outputForm) throw new Error(`${ref}: missing descriptors`);
  return {
    descriptor: inputForm,
    contract,
    inputFields: buildRunFields(inputForm, contract.inputs),
    resultField: buildResultField(outputForm, contract.output.json_schema),
  };
}

/** The slide images, served by Storybook, in place of the run's storage references. */
const SLIDE_IMAGES = [direction1, direction2, direction3];

function slidesPayload(payload: unknown): unknown {
  const p = payload as { directions: Array<{ mockup: Record<string, unknown> }> };
  return {
    ...p,
    directions: p.directions.map((direction, i) => ({
      ...direction,
      mockup: { ...direction.mockup, url: SLIDE_IMAGES[i], public_url: SLIDE_IMAGES[i] },
    })),
  };
}

const invoice = invoiceData as unknown as RunData;
const trip = tripData as unknown as RunData;
const slides = slidesData as unknown as RunData;

export const METHODS: Record<MethodKey, SpikeMethod> = {
  invoice: {
    key: 'invoice',
    pipeRef: invoice.pipeRef,
    name: invoice.name,
    description: invoice.description ?? '',
    ...fieldsOf(invoice),
    // A real host's upload lands in its storage, which the control does not print.
    inputs: {
      document: {
        url: 'pipelex-storage://uploads/restaurant_invoice.pdf',
        filename: 'restaurant_invoice.pdf',
      },
    },
    payload: invoice.payload,
    run: invoice.run,
    producedBy: invoice.producedBy,
    host: {
      appName: 'Receipt reader',
      team: 'northfield',
      style: 'bold',
      eta: 'Takes about 30 seconds',
      actions: ['Download CSV'],
      again: 'Run again',
    },
  },
  trip: {
    key: 'trip',
    pipeRef: trip.pipeRef,
    name: trip.name,
    description: trip.description ?? '',
    ...fieldsOf(trip),
    inputs: {
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
    payload: trip.payload,
    run: trip.run,
    producedBy: trip.producedBy,
    host: {
      appName: 'Trip planner',
      team: 'wayfarer',
      style: 'soft',
      eta: 'Takes about 10 seconds',
      actions: ['Download PDF', 'Share'],
      again: 'Run again',
    },
  },
  slides: {
    key: 'slides',
    pipeRef: slides.pipeRef,
    name: slides.name,
    description: slides.description ?? '',
    ...fieldsOf(slides),
    inputs: {
      brief: {
        topic: 'Q4 2025 Financial Results',
        goal: 'keynote',
        audience: 'executives',
        tone: 'formal',
      },
    },
    payload: slidesPayload(slides.payload),
    run: slides.run,
    producedBy: slides.producedBy,
    host: {
      appName: 'Deck directions',
      team: 'kiln',
      style: 'editorial',
      eta: 'Takes about 40 seconds',
      actions: ['Download PDF'],
      again: 'Run again',
    },
  },
};
