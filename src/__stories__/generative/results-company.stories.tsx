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
 * The depth hero: a company down to its people - divisions, the teams in
 * each, the members of each team - four levels a page has to carry or
 * delegate. Whatever a producer does with the depth is the reading: cards per
 * division, collapsibles per team, a table of people, or a `MthdsResult`
 * delegation of the whole subtree, which is a valid outcome and the story
 * says so.
 */

const PIPE_REF = 'results.deep_result';
const hero = HEROES.find((candidate) => `${candidate.domain}.${candidate.pipeCode}` === PIPE_REF)!;
const data = loadResultHero(hero, CONTRACTS, OUTPUT_FORM, PAYLOADS);
const FIXTURES = [...SPECS, ...AUTHORED].filter((fixture) => fixture.pipeRef === PIPE_REF);

function CompanyHero({ source }: { source: string }) {
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
  title: 'Generative/Results/Company',
  component: CompanyHero,
} satisfies Meta<typeof CompanyHero>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

const payload = data.payload as {
  name: string;
  divisions: { name: string; teams: { members: { name: string }[] }[] }[];
};

/** The company's name and the first division's reach every page. */
const showsTheCompany: Story['play'] = skippable(async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByText(payload.name).length).toBeGreaterThanOrEqual(BOTH_THEMES);
  await expect(
    (await canvas.findAllByText(payload.divisions[0]!.name)).length,
  ).toBeGreaterThanOrEqual(BOTH_THEMES);
});

const stories = fixtureStories<Story>(FIXTURES, showsTheCompany);

export const KernelView: Story = {
  name: "The package's own result view",
  args: { source: 'kernel' },
  play: showsTheCompany,
};
export const Projection: Story = {
  name: 'Deterministic projection (the floor)',
  args: { source: 'projected' },
  play: showsTheCompany,
};
export const SessionByHand = stories.of('claude-code-session--claude-fable-5-1');
export const PipelexSonnet5 = stories.of('pipelex-method--claude-5-sonnet');
export const PipelexOpus48 = stories.of('pipelex-method--claude-4.8-opus');
export const PipelexGpt55 = stories.of('pipelex-method--gpt-5.5');
