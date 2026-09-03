/**
 * Specs captured for the heroes of data/structures/results.mthds - DO NOT EDIT.
 *
 * Regenerate the designer method's entries with `make fixtures-specs`, which runs
 * `data/generative/ui-designer.mthds` through the real `pipelex run bundle` CLI over
 * each hero's brief (MODEL=, SEED= and TEMPERATURE= choose the run) and validates
 * what came back against the catalog. Take in another producer's JSONL with the
 * `--capture` command of scripts/generate-fixtures.mjs, which validates it the same
 * way. Both cost inference budget, which is why neither is implied by `make fixtures`.
 *
 * **A spec is a payload's twin: the one artifact no projection can produce.** Each
 * entry records WHO produced it (the method through the CLI, a Claude Code subagent in
 * a fresh context, or the Claude Code session by hand), on which model, with which
 * seed and critic loop when there was one, and the hash of the catalog prompt it was
 * produced against; the corpus test compares that hash with the current prompt, so a
 * prompt change that invalidates a spec is a failing test rather than a stale page.
 */
import type { SpecFixture } from '../generative/spec-fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['results.deep_result', 'results.nested_result'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'results.deep_result',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/results.deep_result.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header","overview","divisions-heading","divisions"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"center"},"children":["header-icon","header-titles"]}}\n{"op":"add","path":"/elements/header-icon","value":{"type":"Icon","props":{"name":"Building2","size":"lg"},"children":[]}}\n{"op":"add","path":"/elements/header-titles","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["title","subtitle"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":{"$state":"/result/name"},"level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle","value":{"type":"Text","props":{"text":{"$cond":{"$state":"/result/is_public","eq":true},"$then":"Publicly traded","$else":"Privately held"},"variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/overview","value":{"type":"Split","props":{"ratio":"2:1","gap":"lg"},"children":["overview-summary","overview-facts"]}}\n{"op":"add","path":"/elements/overview-summary","value":{"type":"Card","props":{"title":"About"},"children":["summary-body"]}}\n{"op":"add","path":"/elements/summary-body","value":{"type":"MthdsResult","props":{"path":"/result/summary","hideLabel":true},"children":[]}}\n{"op":"add","path":"/elements/overview-facts","value":{"type":"Card","props":{},"children":["founded"]}}\n{"op":"add","path":"/elements/founded","value":{"type":"MthdsResult","props":{"path":"/result/founded_on"},"children":[]}}\n{"op":"add","path":"/elements/divisions-heading","value":{"type":"Heading","props":{"text":"Divisions","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/divisions","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["division-card"],"repeat":{"statePath":"/result/divisions","key":"name"}}}\n{"op":"add","path":"/elements/division-card","value":{"type":"Card","props":{},"children":["division-head","division-teams-heading","division-teams"]}}\n{"op":"add","path":"/elements/division-head","value":{"type":"Split","props":{"ratio":"2:1","gap":"md"},"children":["division-name-region","division-budget"]}}\n{"op":"add","path":"/elements/division-name-region","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["division-name","division-region"]}}\n{"op":"add","path":"/elements/division-name","value":{"type":"Heading","props":{"text":{"$item":"name"},"level":"h3"},"children":[]}}\n{"op":"add","path":"/elements/division-region","value":{"type":"Badge","props":{"text":{"$item":"region"},"variant":"secondary"},"children":[]}}\n{"op":"add","path":"/elements/division-budget","value":{"type":"Metric","props":{"label":"Annual budget","value":{"$item":"budget"},"unit":"M","format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/division-teams-heading","value":{"type":"Heading","props":{"text":"Teams","level":"h4"},"children":[]}}\n{"op":"add","path":"/elements/division-teams","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["team-card"],"repeat":{"statePath":{"$item":"teams"},"key":"name"}}}\n{"op":"add","path":"/elements/team-card","value":{"type":"Card","props":{},"children":["team-head","team-detail"]}}\n{"op":"add","path":"/elements/team-head","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center","justify":"between"},"children":["team-name","team-headcount"]}}\n{"op":"add","path":"/elements/team-name","value":{"type":"Heading","props":{"text":{"$item":"name"},"level":"h4"},"children":[]}}\n{"op":"add","path":"/elements/team-headcount","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["team-headcount-icon","team-headcount-badge"]}}\n{"op":"add","path":"/elements/team-headcount-icon","value":{"type":"Icon","props":{"name":"Users","size":"sm"},"children":[]}}\n{"op":"add","path":"/elements/team-headcount-badge","value":{"type":"Badge","props":{"text":{"$template":"${headcount} people"},"variant":"outline"},"children":[]}}\n{"op":"add","path":"/elements/team-detail","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["team-mission","team-members-label","team-members"]}}\n{"op":"add","path":"/elements/team-mission","value":{"type":"MthdsResult","props":{"path":"mission","hideLabel":true},"children":[]}}\n{"op":"add","path":"/elements/team-members-label","value":{"type":"Text","props":{"text":"Members","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/team-members","value":{"type":"MthdsResult","props":{"path":"members","hideLabel":true},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header', 'overview', 'divisions-heading', 'divisions'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'center',
          },
          children: ['header-icon', 'header-titles'],
        },
        'header-icon': {
          type: 'Icon',
          props: {
            name: 'Building2',
            size: 'lg',
          },
          children: [],
        },
        'header-titles': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['title', 'subtitle'],
        },
        title: {
          type: 'Heading',
          props: {
            text: {
              $state: '/result/name',
            },
            level: 'h1',
          },
          children: [],
        },
        subtitle: {
          type: 'Text',
          props: {
            text: {
              $cond: {
                $state: '/result/is_public',
                eq: true,
              },
              $then: 'Publicly traded',
              $else: 'Privately held',
            },
            variant: 'muted',
          },
          children: [],
        },
        overview: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'lg',
          },
          children: ['overview-summary', 'overview-facts'],
        },
        'overview-summary': {
          type: 'Card',
          props: {
            title: 'About',
          },
          children: ['summary-body'],
        },
        'summary-body': {
          type: 'MthdsResult',
          props: {
            path: '/result/summary',
            hideLabel: true,
          },
          children: [],
        },
        'overview-facts': {
          type: 'Card',
          props: {},
          children: ['founded'],
        },
        founded: {
          type: 'MthdsResult',
          props: {
            path: '/result/founded_on',
          },
          children: [],
        },
        'divisions-heading': {
          type: 'Heading',
          props: {
            text: 'Divisions',
            level: 'h2',
          },
          children: [],
        },
        divisions: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['division-card'],
          repeat: {
            statePath: '/result/divisions',
            key: 'name',
          },
        },
        'division-card': {
          type: 'Card',
          props: {},
          children: ['division-head', 'division-teams-heading', 'division-teams'],
        },
        'division-head': {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'md',
          },
          children: ['division-name-region', 'division-budget'],
        },
        'division-name-region': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['division-name', 'division-region'],
        },
        'division-name': {
          type: 'Heading',
          props: {
            text: {
              $item: 'name',
            },
            level: 'h3',
          },
          children: [],
        },
        'division-region': {
          type: 'Badge',
          props: {
            text: {
              $item: 'region',
            },
            variant: 'secondary',
          },
          children: [],
        },
        'division-budget': {
          type: 'Metric',
          props: {
            label: 'Annual budget',
            value: {
              $item: 'budget',
            },
            unit: 'M',
            format: 'decimal',
          },
          children: [],
        },
        'division-teams-heading': {
          type: 'Heading',
          props: {
            text: 'Teams',
            level: 'h4',
          },
          children: [],
        },
        'division-teams': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['team-card'],
          repeat: {
            statePath: {
              $item: 'teams',
            },
            key: 'name',
          },
        },
        'team-card': {
          type: 'Card',
          props: {},
          children: ['team-head', 'team-detail'],
        },
        'team-head': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
            justify: 'between',
          },
          children: ['team-name', 'team-headcount'],
        },
        'team-name': {
          type: 'Heading',
          props: {
            text: {
              $item: 'name',
            },
            level: 'h4',
          },
          children: [],
        },
        'team-headcount': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['team-headcount-icon', 'team-headcount-badge'],
        },
        'team-headcount-icon': {
          type: 'Icon',
          props: {
            name: 'Users',
            size: 'sm',
          },
          children: [],
        },
        'team-headcount-badge': {
          type: 'Badge',
          props: {
            text: {
              $template: '${headcount} people',
            },
            variant: 'outline',
          },
          children: [],
        },
        'team-detail': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['team-mission', 'team-members-label', 'team-members'],
        },
        'team-mission': {
          type: 'MthdsResult',
          props: {
            path: 'mission',
            hideLabel: true,
          },
          children: [],
        },
        'team-members-label': {
          type: 'Text',
          props: {
            text: 'Members',
            variant: 'caption',
          },
          children: [],
        },
        'team-members': {
          type: 'MthdsResult',
          props: {
            path: 'members',
            hideLabel: true,
          },
          children: [],
        },
      },
    },
  },
  {
    pipeRef: 'results.deep_result',
    producer: 'pipelex-method',
    model: 'claude-5-sonnet',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/results.deep_result.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header","divisions-section"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["title-row","founded-result","summary-result"]}}\n{"op":"add","path":"/elements/title-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"center","justify":"between"},"children":["name-heading","public-badge"]}}\n{"op":"add","path":"/elements/name-heading","value":{"type":"Heading","props":{"text":{"$state":"/result/name"},"level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/public-badge","value":{"type":"Badge","props":{"text":{"$cond":{"$state":"/result/is_public"},"$then":"Public","$else":"Private"},"variant":"secondary"},"children":[]}}\n{"op":"add","path":"/elements/founded-result","value":{"type":"MthdsResult","props":{"path":"/result/founded_on"},"children":[]}}\n{"op":"add","path":"/elements/summary-result","value":{"type":"MthdsResult","props":{"path":"/result/summary"},"children":[]}}\n{"op":"add","path":"/elements/divisions-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["divisions-heading-row","divisions-list"]}}\n{"op":"add","path":"/elements/divisions-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["divisions-icon","divisions-heading-text"]}}\n{"op":"add","path":"/elements/divisions-icon","value":{"type":"Icon","props":{"name":"Building2","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/divisions-heading-text","value":{"type":"Heading","props":{"text":"Divisions","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/divisions-list","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"repeat":{"statePath":"/result/divisions","key":"name"},"children":["division-card"]}}\n{"op":"add","path":"/elements/division-card","value":{"type":"Card","props":{},"children":["division-header","division-metrics","division-teams-result"]}}\n{"op":"add","path":"/elements/division-header","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"center","justify":"between"},"children":["division-name","division-region-badge"]}}\n{"op":"add","path":"/elements/division-name","value":{"type":"Heading","props":{"text":{"$item":"name"},"level":"h3"},"children":[]}}\n{"op":"add","path":"/elements/division-region-badge","value":{"type":"Badge","props":{"text":{"$item":"region"},"variant":"outline"},"children":[]}}\n{"op":"add","path":"/elements/division-metrics","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["division-budget-metric","division-teams-metric"]}}\n{"op":"add","path":"/elements/division-budget-metric","value":{"type":"Metric","props":{"label":"Budget","value":{"$item":"budget"},"unit":"M","format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/division-teams-metric","value":{"type":"Metric","props":{"label":"Teams","value":{"$item":"teams"},"format":"integer"},"children":[]}}\n{"op":"add","path":"/elements/division-teams-result","value":{"type":"MthdsResult","props":{"path":"teams"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header', 'divisions-section'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['title-row', 'founded-result', 'summary-result'],
        },
        'title-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'center',
            justify: 'between',
          },
          children: ['name-heading', 'public-badge'],
        },
        'name-heading': {
          type: 'Heading',
          props: {
            text: {
              $state: '/result/name',
            },
            level: 'h1',
          },
          children: [],
        },
        'public-badge': {
          type: 'Badge',
          props: {
            text: {
              $cond: {
                $state: '/result/is_public',
              },
              $then: 'Public',
              $else: 'Private',
            },
            variant: 'secondary',
          },
          children: [],
        },
        'founded-result': {
          type: 'MthdsResult',
          props: {
            path: '/result/founded_on',
          },
          children: [],
        },
        'summary-result': {
          type: 'MthdsResult',
          props: {
            path: '/result/summary',
          },
          children: [],
        },
        'divisions-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['divisions-heading-row', 'divisions-list'],
        },
        'divisions-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['divisions-icon', 'divisions-heading-text'],
        },
        'divisions-icon': {
          type: 'Icon',
          props: {
            name: 'Building2',
            size: 'md',
          },
          children: [],
        },
        'divisions-heading-text': {
          type: 'Heading',
          props: {
            text: 'Divisions',
            level: 'h2',
          },
          children: [],
        },
        'divisions-list': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          repeat: {
            statePath: '/result/divisions',
            key: 'name',
          },
          children: ['division-card'],
        },
        'division-card': {
          type: 'Card',
          props: {},
          children: ['division-header', 'division-metrics', 'division-teams-result'],
        },
        'division-header': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'center',
            justify: 'between',
          },
          children: ['division-name', 'division-region-badge'],
        },
        'division-name': {
          type: 'Heading',
          props: {
            text: {
              $item: 'name',
            },
            level: 'h3',
          },
          children: [],
        },
        'division-region-badge': {
          type: 'Badge',
          props: {
            text: {
              $item: 'region',
            },
            variant: 'outline',
          },
          children: [],
        },
        'division-metrics': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['division-budget-metric', 'division-teams-metric'],
        },
        'division-budget-metric': {
          type: 'Metric',
          props: {
            label: 'Budget',
            value: {
              $item: 'budget',
            },
            unit: 'M',
            format: 'decimal',
          },
          children: [],
        },
        'division-teams-metric': {
          type: 'Metric',
          props: {
            label: 'Teams',
            value: {
              $item: 'teams',
            },
            format: 'integer',
          },
          children: [],
        },
        'division-teams-result': {
          type: 'MthdsResult',
          props: {
            path: 'teams',
          },
          children: [],
        },
      },
    },
  },
  {
    pipeRef: 'results.deep_result',
    producer: 'pipelex-method',
    model: 'gpt-5.5',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/results.deep_result.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["hero","content"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["hero-top"]}}\n{"op":"add","path":"/elements/hero-top","value":{"type":"Stack","props":{"direction":"horizontal","gap":"lg","align":"start","justify":"between"},"children":["name-block","status-badge"]}}\n{"op":"add","path":"/elements/name-block","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["company-name","tagline"]}}\n{"op":"add","path":"/elements/company-name","value":{"type":"Heading","props":{"text":{"$state":"/result/name"},"level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/tagline","value":{"type":"Text","props":{"text":"A clear map of divisions, teams, and the people doing the work.","variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/status-badge","value":{"type":"Badge","props":{"text":{"$cond":{"$state":"/result/is_public","eq":true},"$then":"Public","$else":"Private"},"variant":{"$cond":{"$state":"/result/is_public","eq":true},"$then":"default","$else":"secondary"}},"children":[]}}\n{"op":"add","path":"/elements/content","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["main-column","side-rail"]}}\n{"op":"add","path":"/elements/main-column","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["divisions-overview","division-section"]}}\n{"op":"add","path":"/elements/divisions-overview","value":{"type":"Card","props":{"title":"Divisions at a glance"},"children":["divisions-table"]}}\n{"op":"add","path":"/elements/divisions-table","value":{"type":"DataTable","props":{"rows":{"$state":"/result/divisions"},"columns":[{"path":"name","label":"Division"},{"path":"region","label":"Region"},{"path":"budget","label":"Budget (M)"}]},"children":[]}}\n{"op":"add","path":"/elements/division-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["division-section-title-row","divisions-list"]}}\n{"op":"add","path":"/elements/division-section-title-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["map-icon","division-section-title"]}}\n{"op":"add","path":"/elements/map-icon","value":{"type":"Icon","props":{"name":"Layers","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/division-section-title","value":{"type":"Heading","props":{"text":"Teams and people","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/divisions-list","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"repeat":{"statePath":"/result/divisions","key":"name"},"children":["division-card"]}}\n{"op":"add","path":"/elements/division-card","value":{"type":"Card","props":{"title":{"$item":"name"},"description":{"$template":"${region} · ${budget}M budget"}},"children":["division-teams"]}}\n{"op":"add","path":"/elements/division-teams","value":{"type":"MthdsResult","props":{"path":"teams","hideLabel":true},"children":[]}}\n{"op":"add","path":"/elements/side-rail","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["profile-card","story-card"]}}\n{"op":"add","path":"/elements/profile-card","value":{"type":"Card","props":{"title":"Profile"},"children":["profile-stack"]}}\n{"op":"add","path":"/elements/profile-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["founded-on","separator","status-row"]}}\n{"op":"add","path":"/elements/founded-on","value":{"type":"MthdsResult","props":{"path":"/result/founded_on"},"children":[]}}\n{"op":"add","path":"/elements/separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/status-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["status-icon","status-text"]}}\n{"op":"add","path":"/elements/status-icon","value":{"type":"Icon","props":{"name":"Shield","size":"sm"},"children":[]}}\n{"op":"add","path":"/elements/status-text","value":{"type":"Text","props":{"text":{"$cond":{"$state":"/result/is_public","eq":true},"$then":"Publicly traded","$else":"Privately held"},"variant":"body"},"children":[]}}\n{"op":"add","path":"/elements/story-card","value":{"type":"Card","props":{"title":"Company note"},"children":["company-summary"]}}\n{"op":"add","path":"/elements/company-summary","value":{"type":"MthdsResult","props":{"path":"/result/summary","hideLabel":true},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['hero', 'content'],
        },
        hero: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['hero-top'],
        },
        'hero-top': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'lg',
            align: 'start',
            justify: 'between',
          },
          children: ['name-block', 'status-badge'],
        },
        'name-block': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['company-name', 'tagline'],
        },
        'company-name': {
          type: 'Heading',
          props: {
            text: {
              $state: '/result/name',
            },
            level: 'h1',
          },
          children: [],
        },
        tagline: {
          type: 'Text',
          props: {
            text: 'A clear map of divisions, teams, and the people doing the work.',
            variant: 'lead',
          },
          children: [],
        },
        'status-badge': {
          type: 'Badge',
          props: {
            text: {
              $cond: {
                $state: '/result/is_public',
                eq: true,
              },
              $then: 'Public',
              $else: 'Private',
            },
            variant: {
              $cond: {
                $state: '/result/is_public',
                eq: true,
              },
              $then: 'default',
              $else: 'secondary',
            },
          },
          children: [],
        },
        content: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['main-column', 'side-rail'],
        },
        'main-column': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['divisions-overview', 'division-section'],
        },
        'divisions-overview': {
          type: 'Card',
          props: {
            title: 'Divisions at a glance',
          },
          children: ['divisions-table'],
        },
        'divisions-table': {
          type: 'DataTable',
          props: {
            rows: {
              $state: '/result/divisions',
            },
            columns: [
              {
                path: 'name',
                label: 'Division',
              },
              {
                path: 'region',
                label: 'Region',
              },
              {
                path: 'budget',
                label: 'Budget (M)',
              },
            ],
          },
          children: [],
        },
        'division-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['division-section-title-row', 'divisions-list'],
        },
        'division-section-title-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['map-icon', 'division-section-title'],
        },
        'map-icon': {
          type: 'Icon',
          props: {
            name: 'Layers',
            size: 'md',
          },
          children: [],
        },
        'division-section-title': {
          type: 'Heading',
          props: {
            text: 'Teams and people',
            level: 'h2',
          },
          children: [],
        },
        'divisions-list': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          repeat: {
            statePath: '/result/divisions',
            key: 'name',
          },
          children: ['division-card'],
        },
        'division-card': {
          type: 'Card',
          props: {
            title: {
              $item: 'name',
            },
            description: {
              $template: '${region} · ${budget}M budget',
            },
          },
          children: ['division-teams'],
        },
        'division-teams': {
          type: 'MthdsResult',
          props: {
            path: 'teams',
            hideLabel: true,
          },
          children: [],
        },
        'side-rail': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['profile-card', 'story-card'],
        },
        'profile-card': {
          type: 'Card',
          props: {
            title: 'Profile',
          },
          children: ['profile-stack'],
        },
        'profile-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['founded-on', 'separator', 'status-row'],
        },
        'founded-on': {
          type: 'MthdsResult',
          props: {
            path: '/result/founded_on',
          },
          children: [],
        },
        separator: {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'status-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['status-icon', 'status-text'],
        },
        'status-icon': {
          type: 'Icon',
          props: {
            name: 'Shield',
            size: 'sm',
          },
          children: [],
        },
        'status-text': {
          type: 'Text',
          props: {
            text: {
              $cond: {
                $state: '/result/is_public',
                eq: true,
              },
              $then: 'Publicly traded',
              $else: 'Privately held',
            },
            variant: 'body',
          },
          children: [],
        },
        'story-card': {
          type: 'Card',
          props: {
            title: 'Company note',
          },
          children: ['company-summary'],
        },
        'company-summary': {
          type: 'MthdsResult',
          props: {
            path: '/result/summary',
            hideLabel: true,
          },
          children: [],
        },
      },
    },
  },
  {
    pipeRef: 'results.nested_result',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/results.nested_result.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["main","rail"]}}\n{"op":"add","path":"/elements/main","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["headrow","subtitle","lines-heading","lines-table"]}}\n{"op":"add","path":"/elements/headrow","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"center"},"children":["invoice-icon","title"]}}\n{"op":"add","path":"/elements/invoice-icon","value":{"type":"Icon","props":{"name":"Receipt","size":"lg"},"children":[]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":{"$state":"/result/reference"},"level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle","value":{"type":"MthdsResult","props":{"path":"/result/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/lines-heading","value":{"type":"Heading","props":{"text":"Billable lines","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/lines-table","value":{"type":"DataTable","props":{"rows":{"$state":"/result/lines"},"columns":[{"path":"label","label":"Item"},{"path":"quantity","label":"Qty"},{"path":"unit_price","label":"Unit price"}]},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Card","props":{},"children":["rail-stack"]}}\n{"op":"add","path":"/elements/rail-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg","align":"stretch"},"children":["total-metric","status-sep","status-badge"]}}\n{"op":"add","path":"/elements/total-metric","value":{"type":"Metric","props":{"label":"Total due","value":{"$state":"/result/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/status-sep","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/status-badge","value":{"type":"Badge","props":{"text":{"$cond":{"$state":"/result/paid","eq":true},"$then":"Paid","$else":"Outstanding"},"variant":{"$cond":{"$state":"/result/paid","eq":true},"$then":"default","$else":"destructive"}},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['main', 'rail'],
        },
        main: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['headrow', 'subtitle', 'lines-heading', 'lines-table'],
        },
        headrow: {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'center',
          },
          children: ['invoice-icon', 'title'],
        },
        'invoice-icon': {
          type: 'Icon',
          props: {
            name: 'Receipt',
            size: 'lg',
          },
          children: [],
        },
        title: {
          type: 'Heading',
          props: {
            text: {
              $state: '/result/reference',
            },
            level: 'h1',
          },
          children: [],
        },
        subtitle: {
          type: 'MthdsResult',
          props: {
            path: '/result/issued_on',
          },
          children: [],
        },
        'lines-heading': {
          type: 'Heading',
          props: {
            text: 'Billable lines',
            level: 'h2',
          },
          children: [],
        },
        'lines-table': {
          type: 'DataTable',
          props: {
            rows: {
              $state: '/result/lines',
            },
            columns: [
              {
                path: 'label',
                label: 'Item',
              },
              {
                path: 'quantity',
                label: 'Qty',
              },
              {
                path: 'unit_price',
                label: 'Unit price',
              },
            ],
          },
          children: [],
        },
        rail: {
          type: 'Card',
          props: {},
          children: ['rail-stack'],
        },
        'rail-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
            align: 'stretch',
          },
          children: ['total-metric', 'status-sep', 'status-badge'],
        },
        'total-metric': {
          type: 'Metric',
          props: {
            label: 'Total due',
            value: {
              $state: '/result/total',
            },
            format: 'decimal',
          },
          children: [],
        },
        'status-sep': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'status-badge': {
          type: 'Badge',
          props: {
            text: {
              $cond: {
                $state: '/result/paid',
                eq: true,
              },
              $then: 'Paid',
              $else: 'Outstanding',
            },
            variant: {
              $cond: {
                $state: '/result/paid',
                eq: true,
              },
              $then: 'default',
              $else: 'destructive',
            },
          },
          children: [],
        },
      },
    },
  },
  {
    pipeRef: 'results.nested_result',
    producer: 'pipelex-method',
    model: 'claude-5-sonnet',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/results.nested_result.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Split","props":{"ratio":"1:2","gap":"xl"},"children":["summary-rail","lines-work"]}}\n{"op":"add","path":"/elements/summary-rail","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["header-stack","status-badge","total-metric","issued-date"]}}\n{"op":"add","path":"/elements/header-stack","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["header-icon","header-heading"]}}\n{"op":"add","path":"/elements/header-icon","value":{"type":"Icon","props":{"name":"Receipt","size":"lg"},"children":[]}}\n{"op":"add","path":"/elements/header-heading","value":{"type":"Heading","props":{"text":{"$template":"Invoice ${/result/reference}"},"level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/status-badge","value":{"type":"Badge","props":{"text":{"$cond":{"$state":"/result/paid","eq":true},"$then":"Paid","$else":"Unpaid"}},"children":[]}}\n{"op":"add","path":"/elements/total-metric","value":{"type":"Metric","props":{"label":"Total due","value":{"$state":"/result/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/issued-date","value":{"type":"MthdsResult","props":{"path":"/result/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/lines-work","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["lines-heading","lines-table"]}}\n{"op":"add","path":"/elements/lines-heading","value":{"type":"Heading","props":{"text":"Billable lines","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/lines-table","value":{"type":"DataTable","props":{"rows":{"$state":"/result/lines"},"columns":[{"path":"label","label":"Description"},{"path":"quantity","label":"Qty"},{"path":"unit_price","label":"Unit price"}],"caption":"Every line on this invoice"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Split',
          props: {
            ratio: '1:2',
            gap: 'xl',
          },
          children: ['summary-rail', 'lines-work'],
        },
        'summary-rail': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['header-stack', 'status-badge', 'total-metric', 'issued-date'],
        },
        'header-stack': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['header-icon', 'header-heading'],
        },
        'header-icon': {
          type: 'Icon',
          props: {
            name: 'Receipt',
            size: 'lg',
          },
          children: [],
        },
        'header-heading': {
          type: 'Heading',
          props: {
            text: {
              $template: 'Invoice ${/result/reference}',
            },
            level: 'h1',
          },
          children: [],
        },
        'status-badge': {
          type: 'Badge',
          props: {
            text: {
              $cond: {
                $state: '/result/paid',
                eq: true,
              },
              $then: 'Paid',
              $else: 'Unpaid',
            },
          },
          children: [],
        },
        'total-metric': {
          type: 'Metric',
          props: {
            label: 'Total due',
            value: {
              $state: '/result/total',
            },
            format: 'decimal',
          },
          children: [],
        },
        'issued-date': {
          type: 'MthdsResult',
          props: {
            path: '/result/issued_on',
          },
          children: [],
        },
        'lines-work': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['lines-heading', 'lines-table'],
        },
        'lines-heading': {
          type: 'Heading',
          props: {
            text: 'Billable lines',
            level: 'h2',
          },
          children: [],
        },
        'lines-table': {
          type: 'DataTable',
          props: {
            rows: {
              $state: '/result/lines',
            },
            columns: [
              {
                path: 'label',
                label: 'Description',
              },
              {
                path: 'quantity',
                label: 'Qty',
              },
              {
                path: 'unit_price',
                label: 'Unit price',
              },
            ],
            caption: 'Every line on this invoice',
          },
          children: [],
        },
      },
    },
  },
  {
    pipeRef: 'results.nested_result',
    producer: 'pipelex-method',
    model: 'gpt-5.5',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/results.nested_result.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["invoice-header","invoice-layout"]}}\n{"op":"add","path":"/elements/invoice-header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm","align":"stretch"},"children":["invoice-title-row","invoice-subtitle"]}}\n{"op":"add","path":"/elements/invoice-title-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"center","justify":"between"},"children":["invoice-title-group","paid-badge"]}}\n{"op":"add","path":"/elements/invoice-title-group","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"center"},"children":["invoice-icon","invoice-title"]}}\n{"op":"add","path":"/elements/invoice-icon","value":{"type":"Icon","props":{"name":"Receipt","size":"lg"},"children":[]}}\n{"op":"add","path":"/elements/invoice-title","value":{"type":"Heading","props":{"text":{"$template":"Invoice ${/result/reference}"},"level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/paid-badge","value":{"type":"Badge","props":{"text":{"$cond":{"$state":"/result/paid","eq":true},"$then":"Paid","$else":"Unpaid"},"variant":{"$cond":{"$state":"/result/paid","eq":true},"$then":"default","$else":"outline"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-subtitle","value":{"type":"Text","props":{"text":"A clean read of the invoice: date, total, status and billable work.","variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/invoice-layout","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["work-column","summary-column"]}}\n{"op":"add","path":"/elements/work-column","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg","align":"stretch"},"children":["lines-card"]}}\n{"op":"add","path":"/elements/lines-card","value":{"type":"Card","props":{},"children":["lines-heading-row","lines-table"]}}\n{"op":"add","path":"/elements/lines-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["lines-icon","lines-heading"]}}\n{"op":"add","path":"/elements/lines-icon","value":{"type":"Icon","props":{"name":"ListChecks","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/lines-heading","value":{"type":"Heading","props":{"text":"Billable lines","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/lines-table","value":{"type":"DataTable","props":{"rows":{"$state":"/result/lines"},"columns":[{"path":"label","label":"Item"},{"path":"quantity","label":"Qty"},{"path":"unit_price","label":"Unit price"}],"caption":"Invoice line items"},"children":[]}}\n{"op":"add","path":"/elements/summary-column","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg","align":"stretch"},"children":["total-card","details-card"]}}\n{"op":"add","path":"/elements/total-card","value":{"type":"Card","props":{},"children":["total-heading-row","total-metric"]}}\n{"op":"add","path":"/elements/total-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["total-icon","total-heading"]}}\n{"op":"add","path":"/elements/total-icon","value":{"type":"Icon","props":{"name":"Wallet","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/total-heading","value":{"type":"Heading","props":{"text":"Amount due","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/total-metric","value":{"type":"Metric","props":{"label":"Total","value":{"$state":"/result/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/details-card","value":{"type":"Card","props":{},"children":["details-heading-row","details-grid"]}}\n{"op":"add","path":"/elements/details-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["details-icon","details-heading"]}}\n{"op":"add","path":"/elements/details-icon","value":{"type":"Icon","props":{"name":"FileText","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/details-heading","value":{"type":"Heading","props":{"text":"Invoice details","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/details-grid","value":{"type":"Grid","props":{"columns":1,"gap":"md"},"children":["reference-text","issued-on-result","status-text"]}}\n{"op":"add","path":"/elements/reference-text","value":{"type":"Text","props":{"text":{"$template":"Reference ${/result/reference}"},"variant":"body"},"children":[]}}\n{"op":"add","path":"/elements/issued-on-result","value":{"type":"MthdsResult","props":{"path":"/result/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/status-text","value":{"type":"Text","props":{"text":{"$cond":{"$state":"/result/paid","eq":true},"$then":"This invoice has been settled.","$else":"This invoice is still open."},"variant":"muted"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['invoice-header', 'invoice-layout'],
        },
        'invoice-header': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
            align: 'stretch',
          },
          children: ['invoice-title-row', 'invoice-subtitle'],
        },
        'invoice-title-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'center',
            justify: 'between',
          },
          children: ['invoice-title-group', 'paid-badge'],
        },
        'invoice-title-group': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'center',
          },
          children: ['invoice-icon', 'invoice-title'],
        },
        'invoice-icon': {
          type: 'Icon',
          props: {
            name: 'Receipt',
            size: 'lg',
          },
          children: [],
        },
        'invoice-title': {
          type: 'Heading',
          props: {
            text: {
              $template: 'Invoice ${/result/reference}',
            },
            level: 'h1',
          },
          children: [],
        },
        'paid-badge': {
          type: 'Badge',
          props: {
            text: {
              $cond: {
                $state: '/result/paid',
                eq: true,
              },
              $then: 'Paid',
              $else: 'Unpaid',
            },
            variant: {
              $cond: {
                $state: '/result/paid',
                eq: true,
              },
              $then: 'default',
              $else: 'outline',
            },
          },
          children: [],
        },
        'invoice-subtitle': {
          type: 'Text',
          props: {
            text: 'A clean read of the invoice: date, total, status and billable work.',
            variant: 'lead',
          },
          children: [],
        },
        'invoice-layout': {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['work-column', 'summary-column'],
        },
        'work-column': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
            align: 'stretch',
          },
          children: ['lines-card'],
        },
        'lines-card': {
          type: 'Card',
          props: {},
          children: ['lines-heading-row', 'lines-table'],
        },
        'lines-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['lines-icon', 'lines-heading'],
        },
        'lines-icon': {
          type: 'Icon',
          props: {
            name: 'ListChecks',
            size: 'md',
          },
          children: [],
        },
        'lines-heading': {
          type: 'Heading',
          props: {
            text: 'Billable lines',
            level: 'h2',
          },
          children: [],
        },
        'lines-table': {
          type: 'DataTable',
          props: {
            rows: {
              $state: '/result/lines',
            },
            columns: [
              {
                path: 'label',
                label: 'Item',
              },
              {
                path: 'quantity',
                label: 'Qty',
              },
              {
                path: 'unit_price',
                label: 'Unit price',
              },
            ],
            caption: 'Invoice line items',
          },
          children: [],
        },
        'summary-column': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
            align: 'stretch',
          },
          children: ['total-card', 'details-card'],
        },
        'total-card': {
          type: 'Card',
          props: {},
          children: ['total-heading-row', 'total-metric'],
        },
        'total-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['total-icon', 'total-heading'],
        },
        'total-icon': {
          type: 'Icon',
          props: {
            name: 'Wallet',
            size: 'md',
          },
          children: [],
        },
        'total-heading': {
          type: 'Heading',
          props: {
            text: 'Amount due',
            level: 'h2',
          },
          children: [],
        },
        'total-metric': {
          type: 'Metric',
          props: {
            label: 'Total',
            value: {
              $state: '/result/total',
            },
            format: 'decimal',
          },
          children: [],
        },
        'details-card': {
          type: 'Card',
          props: {},
          children: ['details-heading-row', 'details-grid'],
        },
        'details-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['details-icon', 'details-heading'],
        },
        'details-icon': {
          type: 'Icon',
          props: {
            name: 'FileText',
            size: 'md',
          },
          children: [],
        },
        'details-heading': {
          type: 'Heading',
          props: {
            text: 'Invoice details',
            level: 'h2',
          },
          children: [],
        },
        'details-grid': {
          type: 'Grid',
          props: {
            columns: 1,
            gap: 'md',
          },
          children: ['reference-text', 'issued-on-result', 'status-text'],
        },
        'reference-text': {
          type: 'Text',
          props: {
            text: {
              $template: 'Reference ${/result/reference}',
            },
            variant: 'body',
          },
          children: [],
        },
        'issued-on-result': {
          type: 'MthdsResult',
          props: {
            path: '/result/issued_on',
          },
          children: [],
        },
        'status-text': {
          type: 'Text',
          props: {
            text: {
              $cond: {
                $state: '/result/paid',
                eq: true,
              },
              $then: 'This invoice has been settled.',
              $else: 'This invoice is still open.',
            },
            variant: 'muted',
          },
          children: [],
        },
      },
    },
  },
];
