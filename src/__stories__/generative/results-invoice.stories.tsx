import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/results';
import { PAYLOADS } from '../_generated/results.payloads';
import { SPECS } from '../_generated/results.specs';
import { ResultView } from '../result-view';
import { AUTHORED } from './authored';
import { HEROES } from './heroes';
import { ResultHeroPage, loadResultHero } from './hero-page';
import { projectResultSpec } from './project-spec';
import { fixtureStories, skippable } from './source-stories';

/**
 * The first hero: an invoice, as a run produced it, laid out by every producer
 * over the very same fixture so the only difference on screen is the layout.
 *
 * The package's own result view first - the faithful transcription - then the
 * deterministic projection into the catalog, the floor; then one story per
 * captured spec, titled with what produced it: the designer method on a named
 * model, or the Claude Code session writing by hand.
 */

const PIPE_REF = 'results.nested_result';
const hero = HEROES.find((candidate) => `${candidate.domain}.${candidate.pipeCode}` === PIPE_REF)!;
const data = loadResultHero(hero, CONTRACTS, OUTPUT_FORM, PAYLOADS);
const FIXTURES = [...SPECS, ...AUTHORED].filter((fixture) => fixture.pipeRef === PIPE_REF);

function InvoiceHero({ source }: { source: string }) {
  if (source === 'kernel') {
    return (
      <ResultView
        contracts={CONTRACTS}
        outputForm={OUTPUT_FORM}
        domain={hero.domain}
        pipeCode={hero.pipeCode}
        value={data.payload}
        maxWidth={640}
      />
    );
  }
  const spec =
    source === 'projected'
      ? projectResultSpec(data.field, { title: hero.title })
      : FIXTURES.find((fixture) => fixtureStories.idOf(fixture) === source)?.spec;
  if (!spec) return <fixtureStories.Missing pipeRef={PIPE_REF} id={source} />;
  return <ResultHeroPage data={data} spec={spec} />;
}

const meta = {
  title: 'Generative/Results/Invoice',
  component: InvoiceHero,
} satisfies Meta<typeof InvoiceHero>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The reference and the first line's label, read off the payload, reach the page. */
const showsTheInvoice: Story['play'] = skippable(async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const payload = data.payload as { reference: string; lines: { label: string }[] };
  await expect(
    canvas.getAllByText(new RegExp(escapeRegExp(payload.reference))).length,
  ).toBeGreaterThanOrEqual(BOTH_THEMES);
  await expect(canvas.getAllByText(payload.lines[0]!.label).length).toBeGreaterThanOrEqual(
    BOTH_THEMES,
  );
});

const stories = fixtureStories<Story>(FIXTURES, showsTheInvoice);

export const KernelView: Story = {
  name: "The package's own result view",
  args: { source: 'kernel' },
  play: showsTheInvoice,
};
export const Projection: Story = {
  name: 'Deterministic projection (the floor)',
  args: { source: 'projected' },
  play: showsTheInvoice,
};
export const SessionByHand = stories.of('claude-code-session--claude-fable-5-1');
export const PipelexSonnet5 = stories.of('pipelex-method--claude-5-sonnet');
export const PipelexOpus48 = stories.of('pipelex-method--claude-4.8-opus');
export const PipelexGpt55 = stories.of('pipelex-method--gpt-5.5');
