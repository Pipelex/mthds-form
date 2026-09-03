import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { computeReadiness } from '../../core';
import { CONTRACTS, INPUT_FORM } from '../_generated/structured';
import { SPECS } from '../_generated/structured.specs';
import { CaseForm } from '../case-form';
import { AUTHORED } from './authored';
import { HEROES } from './heroes';
import { InputHeroPage, loadInputHero } from './hero-page';
import { projectInputSpec } from './project-spec';

/**
 * The input hero: an invoice and the document it came from, as a form, laid
 * out four ways over the very same descriptor.
 *
 * `Kernel` is the package's own form. The three generative stories render a
 * spec over `/inputs` and show, under the page, the receipt a host never
 * shows: the `/inputs` tree as the run would receive it and the readiness the
 * kernel computes from it. That receipt is what the play function checks -
 * typing into a catalog input lands in the tree at the bound path, and the
 * readiness line agrees with `computeReadiness` over that very tree.
 */

const PIPE_REF = 'structured.invoice_with_source';
const hero = HEROES.find((candidate) => `${candidate.domain}.${candidate.pipeCode}` === PIPE_REF)!;
const fields = loadInputHero(hero, CONTRACTS, INPUT_FORM);

type Source = 'kernel' | 'projected' | 'authored' | 'generated';

function specFor(source: Exclude<Source, 'kernel'>) {
  switch (source) {
    case 'projected':
      return projectInputSpec(fields, { title: hero.title, description: hero.summary });
    case 'authored':
      return AUTHORED[PIPE_REF]!.spec;
    case 'generated':
      return SPECS[PIPE_REF]!.spec;
    default:
      return source satisfies never;
  }
}

function InvoiceInputs({ source }: { source: Source }) {
  if (source === 'kernel') {
    return (
      <CaseForm
        contracts={CONTRACTS}
        inputForm={INPUT_FORM}
        domain={hero.domain}
        pipeCode={hero.pipeCode}
      />
    );
  }
  return <InputHeroPage fields={fields} spec={specFor(source)} idPrefix={source} />;
}

const meta = {
  title: 'Generative/Inputs/Invoice',
  component: InvoiceInputs,
} satisfies Meta<typeof InvoiceInputs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

/**
 * Type a reference into the first pane's reference input and read it back off
 * the receipt; then check the readiness line against the kernel's own
 * computation over the receipt's tree. Both panes have a receipt; the first is
 * the one typed into.
 */
const writesThroughToInputs: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const receipts = canvas.getAllByTestId('inputs-receipt');
  await expect(receipts).toHaveLength(BOTH_THEMES);

  const reference = canvas.getAllByLabelText(/reference/i)[0]!;
  await userEvent.type(reference, 'INV-2026-0042');
  await expect(receipts[0]).toHaveTextContent('"reference": "INV-2026-0042"');

  const tree = JSON.parse(receipts[0]!.textContent ?? '{}') as Record<string, unknown>;
  const readiness = computeReadiness(fields, tree);
  await expect(canvas.getAllByTestId('readiness')[0]).toHaveTextContent(
    `readiness: ${readiness.ready}/${readiness.total}`,
  );
};

/** The kernel form has no receipt; it shows the reference control and that is the check. */
const showsTheForm: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByLabelText(/reference/i)).toHaveLength(BOTH_THEMES);
};

export const Kernel: Story = { args: { source: 'kernel' }, play: showsTheForm };
export const Projected: Story = { args: { source: 'projected' }, play: writesThroughToInputs };
export const Authored: Story = { args: { source: 'authored' }, play: writesThroughToInputs };
export const Generated: Story = { args: { source: 'generated' }, play: writesThroughToInputs };
