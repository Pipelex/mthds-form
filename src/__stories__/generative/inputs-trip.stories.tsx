import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { computeReadiness } from '../../core';
import { CONTRACTS, INPUT_FORM } from '../_generated/trips';
import { SPECS } from '../_generated/trips.specs';
import { CaseForm } from '../case-form';
import { AUTHORED } from './authored';
import { HEROES } from './heroes';
import { InputHeroPage, loadInputHero } from './hero-page';
import { revealInput } from './play-helpers';
import { projectInputSpec } from './project-spec';
import { fixtureStories, skippable } from './source-stories';

/**
 * The richer input hero: a trip request - who is going, where and when, the
 * budget, the spirit of it, a photo for the mood. Every app-shaped control has
 * a natural home in it, and "plan my trip" is the kind of page people expect
 * to look designed, which is what this hero exists to test.
 *
 * Same discipline as the invoice: the package's own form first, the floor
 * second, then one story per captured spec titled with what produced it. The
 * play types a budget into whichever control the producer chose and reads it
 * back off the receipt - as a NUMBER when the producer used NumberInput, and
 * as text when it did not, which the reading records rather than the gate.
 */

const PIPE_REF = 'trips.plan_trip';
const hero = HEROES.find((candidate) => `${candidate.domain}.${candidate.pipeCode}` === PIPE_REF)!;
const fields = loadInputHero(hero, CONTRACTS, INPUT_FORM);
const FIXTURES = [...SPECS, ...AUTHORED].filter((fixture) => fixture.pipeRef === PIPE_REF);

function TripInputs({ source }: { source: string }) {
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
  const spec =
    source === 'projected'
      ? projectInputSpec(fields, { title: hero.title, description: hero.summary })
      : FIXTURES.find((fixture) => fixtureStories.idOf(fixture) === source)?.spec;
  if (!spec) return <fixtureStories.Missing pipeRef={PIPE_REF} id={source} />;
  return <InputHeroPage fields={fields} spec={spec} idPrefix={source} />;
}

const meta = {
  title: 'Generative/Inputs/Trip',
  component: TripInputs,
} satisfies Meta<typeof TripInputs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

const writesThroughToInputs: Story['play'] = skippable(async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const receipts = canvas.getAllByTestId('inputs-receipt');
  await expect(receipts).toHaveLength(BOTH_THEMES);

  const budget = await revealInput(canvasElement, /budget/i, 'budget');
  await userEvent.type(budget, '2500');
  await expect(receipts[0]).toHaveTextContent(/"budget": "?2500"?/);

  const tree = JSON.parse(receipts[0]!.textContent ?? '{}') as Record<string, unknown>;
  const readiness = computeReadiness(fields, tree);
  await expect(canvas.getAllByTestId('readiness')[0]).toHaveTextContent(
    `readiness: ${readiness.ready}/${readiness.total}`,
  );
});

const showsTheForm: Story['play'] = skippable(async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByLabelText(/budget/i)).toHaveLength(BOTH_THEMES);
});

const stories = fixtureStories<Story>(FIXTURES, writesThroughToInputs);

export const KernelForm: Story = {
  name: "The package's own form",
  args: { source: 'kernel' },
  play: showsTheForm,
};
export const Projection: Story = {
  name: 'Deterministic projection (the floor)',
  args: { source: 'projected' },
  play: writesThroughToInputs,
};
export const SessionByHand = stories.of('claude-code-session--claude-fable-5-1');
export const PipelexSonnet5 = stories.of('pipelex-method--claude-5-sonnet');
export const PipelexOpus48 = stories.of('pipelex-method--claude-4.8-opus');
export const PipelexGpt55 = stories.of('pipelex-method--gpt-5.5');
export const PipelexOpus48Seeded = stories.of('pipelex-method--claude-4.8-opus--seeded');
export const PipelexGpt55Seeded = stories.of('pipelex-method--gpt-5.5--seeded');
export const SubagentFable51 = stories.of('claude-code-subagent--claude-fable-5-1');
export const SubagentOpus5 = stories.of('claude-code-subagent--claude-opus-5');
export const SubagentFable51Seeded = stories.of('claude-code-subagent--claude-fable-5-1--seeded');
export const SubagentOpus5Critic = stories.of('claude-code-subagent--claude-opus-5--critic');
