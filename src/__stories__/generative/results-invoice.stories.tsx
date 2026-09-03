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

/**
 * The first hero: an invoice, as a run produced it, laid out four ways over
 * the very same fixture so the only difference on screen is the layout.
 *
 * `Kernel` is the package's own result view - the faithful transcription.
 * `Projected` is the deterministic projection of the descriptor into the
 * catalog's font: the floor. `Authored` was written by hand from the brief and
 * the catalog prompt: the ceiling of what the vocabulary can express.
 * `Generated` is what the designer method produced from the same two inputs,
 * captured by `make fixtures-specs` and never edited.
 *
 * The reading at the checkpoint follows from the bounds: `Generated` close to
 * `Authored` clears the model; `Authored` dull too indicts the catalog, which
 * is ours; `Projected` nearly as good as either says the layer has not earned
 * its place over the kernel.
 */

const PIPE_REF = 'results.nested_result';
const hero = HEROES.find((candidate) => `${candidate.domain}.${candidate.pipeCode}` === PIPE_REF)!;
const data = loadResultHero(hero, CONTRACTS, OUTPUT_FORM, PAYLOADS);

type Source = 'kernel' | 'projected' | 'authored' | 'generated';

function specFor(source: Exclude<Source, 'kernel'>) {
  switch (source) {
    case 'projected':
      return projectResultSpec(data.field, { title: hero.title });
    case 'authored':
      return AUTHORED[PIPE_REF]!.spec;
    case 'generated':
      return SPECS[PIPE_REF]!.spec;
    default:
      return source satisfies never;
  }
}

function InvoiceHero({ source }: { source: Source }) {
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
  return <ResultHeroPage data={data} spec={specFor(source)} />;
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
const showsTheInvoice: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const payload = data.payload as { reference: string; lines: { label: string }[] };
  await expect(canvas.getAllByText(new RegExp(escapeRegExp(payload.reference)))).toHaveLength(
    BOTH_THEMES,
  );
  await expect(canvas.getAllByText(payload.lines[0]!.label)).toHaveLength(BOTH_THEMES);
};

export const Kernel: Story = { args: { source: 'kernel' }, play: showsTheInvoice };
export const Projected: Story = { args: { source: 'projected' }, play: showsTheInvoice };
export const Authored: Story = { args: { source: 'authored' }, play: showsTheInvoice };
export const Generated: Story = { args: { source: 'generated' }, play: showsTheInvoice };
