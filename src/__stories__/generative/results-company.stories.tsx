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
 * The depth hero: a company down to its people - divisions, the teams in
 * each, the members of each team - four levels a page has to carry or
 * delegate. Whatever a source does with the depth is the reading: cards per
 * division, collapsibles per team, a table of members, or a `MthdsResult`
 * delegation of the whole subtree, which is a valid outcome and the story
 * says so.
 */

const PIPE_REF = 'results.deep_result';
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

function CompanyHero({ source }: { source: Source }) {
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
const showsTheCompany: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getAllByText(payload.name)).toHaveLength(BOTH_THEMES);
  await expect(
    (await canvas.findAllByText(payload.divisions[0]!.name)).length,
  ).toBeGreaterThanOrEqual(BOTH_THEMES);
};

/**
 * The deepest leaf - the first member of the first team of the first division
 * - is on the page too. Only a source that laid the depth out shows it: the
 * kernel's view and the projection fold a nested list behind a disclosure.
 */
const showsThePeople: Story['play'] = async (context) => {
  await showsTheCompany(context);
  const canvas = within(context.canvasElement);
  const deepest = payload.divisions[0]!.teams[0]!.members[0]!.name;
  await expect((await canvas.findAllByText(deepest)).length).toBeGreaterThanOrEqual(BOTH_THEMES);
};

export const Kernel: Story = { args: { source: 'kernel' }, play: showsTheCompany };
export const Projected: Story = { args: { source: 'projected' }, play: showsTheCompany };
export const Authored: Story = { args: { source: 'authored' }, play: showsThePeople };
export const Generated: Story = { args: { source: 'generated' }, play: showsThePeople };
