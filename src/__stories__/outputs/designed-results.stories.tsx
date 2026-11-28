import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ResultView } from '../result-view';
import { SPEC_OUTPUT_CONTRACTS, SPEC_OUTPUT_FORM, SPEC_PAYLOADS } from '../_spec-shaped';

/**
 * What a method's meaning draws on a result page (MTHDS `9.2.0`): the verdict
 * first, in its tone; a record's title, summary and headline numbers; cards
 * for a list of records with a title; badges from an option's tone; money,
 * percentages and measures from a `unit`; a meter between two bounds; the
 * totals and averages a field declares; and a list counted by its verdict.
 *
 * Each payload is a real run's, unchanged; the descriptor is the generated
 * one annotated with those facts (`src/__stories__/_spec-shaped/`), until the
 * engine that generates the fixtures projects them itself. Every story
 * renders twice - the `ThemePair` decorator shows both themes.
 */

const meta = {
  title: 'Outputs/Designed Results',
  component: ResultView,
  args: {
    contracts: SPEC_OUTPUT_CONTRACTS,
    outputForm: SPEC_OUTPUT_FORM,
    domain: 'tables',
    pipeCode: 'links_annotated',
    value: SPEC_PAYLOADS['tables.links_annotated'],
    presentation: 'app',
    maxWidth: 720,
  },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

const BOTH_THEMES = 2;

interface Link {
  status: string;
  response_ms: number;
}
const links = SPEC_PAYLOADS['tables.links_annotated'] as Link[];

/**
 * A list of link checks, as cards: each its url as a title and its status as
 * a toned verdict, the list counted by status above them and the average
 * response time below them, in milliseconds.
 */
export const CountedCardsWithAverage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('[data-verdict-counts]')).toHaveLength(BOTH_THEMES);
    const up = links.filter((link) => link.status === 'up').length;
    await expect(canvas.getAllByRole('list', { name: 'By verdict' })[0]).toHaveTextContent(
      `${up} Up`,
    );
    await expect(canvasElement.querySelectorAll('[data-record-cards]')).toHaveLength(BOTH_THEMES);
    await expect(canvasElement.querySelectorAll('[data-aggregate="average"]')).toHaveLength(
      BOTH_THEMES,
    );
  },
};

/** The same list in `studio`: a table, its status column as badges, the response times right-aligned in their unit. */
export const TableInStudio: Story = {
  args: { presentation: 'studio' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('table')).toHaveLength(BOTH_THEMES);
    await expect(
      canvasElement.querySelectorAll('td [data-tone="negative"]').length,
    ).toBeGreaterThan(0);
  },
};

/**
 * An itinerary: its title as the heading, its overview as the lead, the
 * estimated total as a tile in euros, the days as cards, and the costs in
 * euros with their total under them.
 */
export const RecordAnatomy: Story = {
  args: {
    domain: 'trip_planner',
    pipeCode: 'itinerary_annotated',
    value: SPEC_PAYLOADS['trip_planner.itinerary_annotated'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('[data-record-title]').length).toBeGreaterThan(0);
    await expect(canvasElement.querySelectorAll('[data-metric-tiles]').length).toBeGreaterThan(0);
    await expect(canvas.getAllByText('€2,800.00').length).toBeGreaterThanOrEqual(BOTH_THEMES);
    await expect(canvasElement.querySelectorAll('[data-aggregate="sum"]')).toHaveLength(
      BOTH_THEMES,
    );
  },
};

/** A sentiment: the verdict first and large, in its tone, the confidence as a meter between 0 and 1. */
export const VerdictAndMeter: Story = {
  args: {
    domain: 'results',
    pipeCode: 'sentiment_annotated',
    value: SPEC_PAYLOADS['results.sentiment_annotated'],
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-verdict-line]')).toHaveLength(BOTH_THEMES);
    await expect(canvasElement.querySelectorAll('[role="meter"]')).toHaveLength(BOTH_THEMES);
  },
};

/** An invoice in euros: its total as a tile, its lines' prices in euros and their quantities summed. */
export const MoneyAndTotals: Story = {
  args: {
    domain: 'results',
    pipeCode: 'invoice_annotated',
    value: SPEC_PAYLOADS['results.invoice_annotated'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('€1,840.50').length).toBeGreaterThanOrEqual(BOTH_THEMES);
    await expect(canvasElement.querySelectorAll('[data-aggregate="sum"]')).toHaveLength(
      BOTH_THEMES,
    );
  },
};

/** The same invoice in French: the euro after the amount, a comma for the decimals. */
export const MoneyInFrench: Story = {
  args: {
    domain: 'results',
    pipeCode: 'invoice_annotated',
    value: SPEC_PAYLOADS['results.invoice_annotated'],
    locale: 'fr',
  },
};
