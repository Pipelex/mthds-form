import { defineAuthoredSpec, element } from '../authoring';

/**
 * AUTHORED by Claude Code on 2026-09-03, from
 * `wip/generative-ui/briefs/results.deep_result.md` and the catalog prompt it
 * carries (hash `b452d10a8ff7`), and from nothing else.
 *
 * The depth test's ceiling: four levels - company, divisions, teams, members -
 * laid out all the way down rather than delegated, to find out what the
 * catalog can carry. Choices, recorded because the checkpoint reads them
 * against the model's:
 *  - the company's name is the title, and whether it is public is a badge
 *    beside it; the founding date and the summary are the kernel's rendering,
 *    the one because it is a date and the other because it is prose;
 *  - each division is a card, repeated over the list and titled by its name,
 *    with its region as a badge and its budget as a metric in millions - the
 *    unit is the brief's, which says the budget is "in millions";
 *  - each team is a collapsible inside its division's card, open by default,
 *    repeated over the division's own teams through the `$item` form of
 *    `repeat`, with its mission as a muted line; the headcount is left to the
 *    table below, which shows the people rather than a count of them;
 *  - the members are a table, one per team, with the date and the focus areas
 *    as text: the brief notes a table prints them plainly, and plainly is what
 *    a joining date and a list of two words read best as in a row. Delegating
 *    the whole list to keep the date typeset would have cost the table.
 */
export const AUTHORED_COMPANY = defineAuthoredSpec({
  pipeRef: 'results.deep_result',
  model: 'claude-fable-5-1',
  date: '2026-09-03',
  promptHash: '74ecce11615e',
  brief: 'wip/generative-ui/briefs/results.deep_result.md',
  spec: {
    root: 'page',
    elements: {
      page: element(
        'Stack',
        { direction: 'vertical', gap: 'lg' },
        { children: ['header', 'about', 'divider', 'divisions-title', 'division'] },
      ),
      header: element(
        'Stack',
        { direction: 'horizontal', align: 'center', justify: 'between', gap: 'md' },
        { children: ['title', 'listing'] },
      ),
      title: element('Heading', { text: { $state: '/result/name' }, level: 'h1' }),
      listing: element('Badge', {
        text: {
          $cond: { $state: '/result/is_public', eq: true },
          $then: 'Public',
          $else: 'Private',
        },
        variant: {
          $cond: { $state: '/result/is_public', eq: true },
          $then: 'default',
          $else: 'outline',
        },
      }),
      about: element('Grid', { columns: 2, gap: 'lg' }, { children: ['founded', 'summary'] }),
      founded: element('MthdsResult', { path: '/result/founded_on' }),
      summary: element('MthdsResult', { path: '/result/summary' }),
      divider: element('Separator', {}),
      'divisions-title': element('Heading', { text: 'Divisions', level: 'h2' }),
      division: element(
        'Card',
        { title: { $item: 'name' } },
        {
          repeat: { statePath: '/result/divisions', key: 'name' },
          children: ['division-facts', 'team'],
        },
      ),
      'division-facts': element(
        'Stack',
        { direction: 'horizontal', align: 'center', gap: 'lg' },
        { children: ['region', 'budget'] },
      ),
      region: element('Badge', { text: { $item: 'region' }, variant: 'secondary' }),
      budget: element('Metric', {
        label: 'Annual budget',
        value: { $item: 'budget' },
        unit: 'M',
        format: 'decimal',
      }),
      team: element(
        'Collapsible',
        { title: { $item: 'name' }, defaultOpen: true },
        {
          repeat: { statePath: { $item: 'teams' }, key: 'name' },
          children: ['mission', 'members'],
        },
      ),
      mission: element('Text', { text: { $item: 'mission' }, variant: 'muted' }),
      members: element('DataTable', {
        rows: { $item: 'members' },
        columns: [
          { path: 'name', label: 'Name' },
          { path: 'role', label: 'Role' },
          { path: 'started_on', label: 'Joined' },
          { path: 'remote', label: 'Remote' },
          { path: 'focus_areas', label: 'Focus' },
        ],
      }),
    },
  },
});
