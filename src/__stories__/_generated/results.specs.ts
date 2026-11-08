/**
 * Specs captured for the heroes of src/__stories__/_structures/results.mthds - DO NOT EDIT.
 *
 * Regenerate the designer method's entries with `make fixtures-specs`, which runs
 * `methods/layout-design.mthds` on the hosted API through `@pipelex/sdk` over
 * each hero's brief (MODEL=, SEED= and TEMPERATURE= choose the run) and validates
 * what came back against the catalog. Take in another producer's JSONL with the
 * `--capture` command of scripts/generate-fixtures.mjs, which validates it the same
 * way. Both cost inference budget, which is why neither is implied by `make fixtures`.
 *
 * **A spec is a payload's twin: the one artifact no projection can produce.** Each
 * entry records WHO produced it (the method on the hosted API, a coding agent in a
 * fresh context, or the session working in this repo, by hand), on which model, with
 * which seed and critic loop when there was one, and the hash of the prompt it was
 * produced against - the designer method and the catalog data, together; the corpus
 * test compares that hash with the current one, so a prompt change that invalidates a
 * spec is a failing test rather than a stale page. An entry the method produced also
 * carries the planner's `plan`, read from the run's working memory: the intermediate
 * the builder was handed, which is where a page got its shape.
 */
import type { SpecFixture } from '../../generative/fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['results.deep_result', 'results.nested_result'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'results.deep_result',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/results.deep_result.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["company-context","divisions"]}}\n{"op":"add","path":"/elements/company-context","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["hero","company-overview"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Explore the company"},"children":[]}}\n{"op":"add","path":"/elements/company-overview","value":{"type":"Grid","props":{"columns":2,"gap":"xl"},"children":["company-introduction","company-facts"]}}\n{"op":"add","path":"/elements/company-introduction","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["company-name","company-summary"]}}\n{"op":"add","path":"/elements/company-name","value":{"type":"Text","props":{"text":{"$state":"/result/name"},"variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/company-summary","value":{"type":"MthdsResult","props":{"path":"/result/summary","hideLabel":true},"children":[]}}\n{"op":"add","path":"/elements/company-facts","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["founded-date","public-status"]}}\n{"op":"add","path":"/elements/founded-date","value":{"type":"MthdsResult","props":{"path":"/result/founded_on"},"children":[]}}\n{"op":"add","path":"/elements/public-status","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["public-status-label","public-status-value"]}}\n{"op":"add","path":"/elements/public-status-label","value":{"type":"Text","props":{"text":"Publicly traded","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/public-status-value","value":{"type":"Text","props":{"text":{"$cond":{"$state":"/result/is_public"},"$then":"Yes","$else":"No"}},"children":[]}}\n{"op":"add","path":"/elements/divisions","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["division-section"],"repeat":{"statePath":"/result/divisions"}}}\n{"op":"add","path":"/elements/division-section","value":{"type":"Section","props":{"title":{"$item":"name"}},"children":["division-facts","division-teams"]}}\n{"op":"add","path":"/elements/division-facts","value":{"type":"Stack","props":{"direction":"horizontal","gap":"lg","align":"center"},"children":["division-region","division-budget"]}}\n{"op":"add","path":"/elements/division-region","value":{"type":"Badge","props":{"text":{"$item":"region"},"variant":"secondary"},"children":[]}}\n{"op":"add","path":"/elements/division-budget","value":{"type":"Metric","props":{"label":"Annual budget","value":{"$item":"budget"},"unit":"M","format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/division-teams","value":{"type":"MthdsResult","props":{"path":"teams"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['company-context', 'divisions'],
        },
        'company-context': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['hero', 'company-overview'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Explore the company',
          },
          children: [],
        },
        'company-overview': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'xl',
          },
          children: ['company-introduction', 'company-facts'],
        },
        'company-introduction': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['company-name', 'company-summary'],
        },
        'company-name': {
          type: 'Text',
          props: {
            text: {
              $state: '/result/name',
            },
            variant: 'lead',
          },
          children: [],
        },
        'company-summary': {
          type: 'MthdsResult',
          props: {
            path: '/result/summary',
            hideLabel: true,
          },
          children: [],
        },
        'company-facts': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['founded-date', 'public-status'],
        },
        'founded-date': {
          type: 'MthdsResult',
          props: {
            path: '/result/founded_on',
          },
          children: [],
        },
        'public-status': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['public-status-label', 'public-status-value'],
        },
        'public-status-label': {
          type: 'Text',
          props: {
            text: 'Publicly traded',
            variant: 'muted',
          },
          children: [],
        },
        'public-status-value': {
          type: 'Text',
          props: {
            text: {
              $cond: {
                $state: '/result/is_public',
              },
              $then: 'Yes',
              $else: 'No',
            },
          },
          children: [],
        },
        divisions: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['division-section'],
          repeat: {
            statePath: '/result/divisions',
          },
        },
        'division-section': {
          type: 'Section',
          props: {
            title: {
              $item: 'name',
            },
          },
          children: ['division-facts', 'division-teams'],
        },
        'division-facts': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'lg',
            align: 'center',
          },
          children: ['division-region', 'division-budget'],
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
        'division-teams': {
          type: 'MthdsResult',
          props: {
            path: 'teams',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone exploring a company understand what it does, how its divisions are organised, and who works in each team.',
      title: 'Explore the company',
      composition:
        "Use a spacious single-column page with one Hero headline, followed by an unboxed company overview: the company name and summary occupy the wider left side, while founding date and public-trading status sit together on the right; stack these on narrow screens. Below, repeat one flat Section per division in source order, with the division name as its h2 and a compact row for region and annual budget. Render each division's complete team hierarchy beneath that row with MthdsResult so team missions, joining dates and individual focus areas retain their proper rendering; keep the hierarchy visible rather than hiding it behind tabs or collapsibles. Use only h1 and h2 headings in the page-authored layout, no cards or peripheral rail, and no run control.",
      regions: [
        {
          title: null,
          purpose:
            'Identify the company and give its context before the reader enters the organisational hierarchy.',
          container: 'Stack',
          elements: [
            'Hero: headline "Explore the company"; the page\'s only h1; no eyebrow or subtitle.',
            'Grid: two columns in a 2:1 proportion on wide screens, one column on narrow screens; holds the company introduction and company facts in that order.',
            'Stack in the first Grid column: holds company name and summary.',
            'Text: reads /result/name; prominent company name, no label.',
            'MthdsResult: path /result/summary; hideLabel true; render the markdown summary.',
            'Stack in the second Grid column: holds founding date and public-trading status.',
            'MthdsResult: path /result/founded_on; label "Founded".',
            'Text: reads /result/is_public; label "Publicly traded"; display true as "Yes" and false as "No".',
          ],
        },
        {
          title: null,
          purpose:
            'Let the reader move division by division from operating context to teams and their people.',
          container: 'Stack',
          elements: [
            'Stack: repeat a Section for every item in /result/divisions, preserving source order; all relative paths below refer to the current division.',
            'Section: title reads name as an h2; holds a horizontal Stack of division facts followed by the complete team hierarchy.',
            'Stack: horizontal division facts, wrapping on narrow screens; holds region and annual budget.',
            'Badge: reads region; display its stored value unchanged: "emea" | "americas" | "apac".',
            'Metric: reads budget; label "Annual budget"; unit "M"; format decimal; do not add a currency.',
            'MthdsResult: path teams relative to the current division; label "Teams and people"; render the entire list, including team names, markdown missions, headcounts, members, joining dates, remote status and focus areas; do not replace it with a DataTable.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [
        '/result/founded_on — required delegation for the founding date.',
        '/result/summary — required delegation for markdown prose.',
        'teams — within each item of /result/divisions; delegate the complete team hierarchy to preserve markdown missions, member dates and nested focus-area lists.',
      ],
    },
  },
  {
    pipeRef: 'results.deep_result',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'xWe2EZl0LcLIQjmrGdctzpmcPAifPFpN',
    frame: 'result',
    style: 'soft',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/results.deep_result.result.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"company-page"}\n{"op":"add","path":"/elements/company-page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["introduction","company-context","division-directory"]}}\n{"op":"add","path":"/elements/introduction","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["company-header"]}}\n{"op":"add","path":"/elements/company-header","value":{"type":"ResultHeader","props":{"title":{"$template":"Meet ${/result/name}"}},"children":[]}}\n{"op":"add","path":"/elements/company-context","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["company-facts","company-summary"]}}\n{"op":"add","path":"/elements/company-facts","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["founding-date","publicly-traded"]}}\n{"op":"add","path":"/elements/founding-date","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["founded-label","founded-date"]}}\n{"op":"add","path":"/elements/founded-label","value":{"type":"Text","props":{"text":"Founded","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/founded-date","value":{"type":"DateText","props":{"value":{"$state":"/result/founded_on"},"style":"long","tone":"muted"},"children":[]}}\n{"op":"add","path":"/elements/publicly-traded","value":{"type":"Fact","props":{"label":"Publicly traded","value":{"$cond":{"$state":"/result/is_public"},"$then":"Yes","$else":"No"}},"children":[]}}\n{"op":"add","path":"/elements/company-summary","value":{"type":"MthdsResult","props":{"path":"/result/summary","hideLabel":true},"children":[]}}\n{"op":"add","path":"/elements/division-directory","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["division-repeat"]}}\n{"op":"add","path":"/elements/division-repeat","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"repeat":{"statePath":"/result/divisions"},"children":["division-section"]}}\n{"op":"add","path":"/elements/division-section","value":{"type":"Section","props":{"title":{"$item":"name"}},"children":["division-operating-facts","division-teams"]}}\n{"op":"add","path":"/elements/division-operating-facts","value":{"type":"Stack","props":{"direction":"horizontal","gap":"lg","align":"start"},"children":["division-region","division-budget"]}}\n{"op":"add","path":"/elements/division-region","value":{"type":"Detail","props":{"label":"Region","value":{"$item":"region"}},"children":[]}}\n{"op":"add","path":"/elements/division-budget","value":{"type":"Detail","props":{"label":"Annual budget (millions)","value":{"$item":"budget"}},"children":[]}}\n{"op":"add","path":"/elements/division-teams","value":{"type":"MthdsResult","props":{"path":"teams","hideLabel":true},"children":[]}}',
    spec: {
      root: 'company-page',
      elements: {
        'company-page': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['introduction', 'company-context', 'division-directory'],
        },
        introduction: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['company-header'],
        },
        'company-header': {
          type: 'ResultHeader',
          props: {
            title: {
              $template: 'Meet ${/result/name}',
            },
          },
          children: [],
        },
        'company-context': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['company-facts', 'company-summary'],
        },
        'company-facts': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['founding-date', 'publicly-traded'],
        },
        'founding-date': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['founded-label', 'founded-date'],
        },
        'founded-label': {
          type: 'Text',
          props: {
            text: 'Founded',
            variant: 'muted',
          },
          children: [],
        },
        'founded-date': {
          type: 'DateText',
          props: {
            value: {
              $state: '/result/founded_on',
            },
            style: 'long',
            tone: 'muted',
          },
          children: [],
        },
        'publicly-traded': {
          type: 'Fact',
          props: {
            label: 'Publicly traded',
            value: {
              $cond: {
                $state: '/result/is_public',
              },
              $then: 'Yes',
              $else: 'No',
            },
          },
          children: [],
        },
        'company-summary': {
          type: 'MthdsResult',
          props: {
            path: '/result/summary',
            hideLabel: true,
          },
          children: [],
        },
        'division-directory': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['division-repeat'],
        },
        'division-repeat': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          repeat: {
            statePath: '/result/divisions',
          },
          children: ['division-section'],
        },
        'division-section': {
          type: 'Section',
          props: {
            title: {
              $item: 'name',
            },
          },
          children: ['division-operating-facts', 'division-teams'],
        },
        'division-operating-facts': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'lg',
            align: 'start',
          },
          children: ['division-region', 'division-budget'],
        },
        'division-region': {
          type: 'Detail',
          props: {
            label: 'Region',
            value: {
              $item: 'region',
            },
          },
          children: [],
        },
        'division-budget': {
          type: 'Detail',
          props: {
            label: 'Annual budget (millions)',
            value: {
              $item: 'budget',
            },
          },
          children: [],
        },
        'division-teams': {
          type: 'MthdsResult',
          props: {
            path: 'teams',
            hideLabel: true,
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone exploring a company understand what it does, how its divisions fit together, and who works in each team.',
      title: 'Meet the company',
      composition:
        "Use a spacious, full-width vertical page with a short, company-named headline and the host's result actions in ResultHeader. Follow it with two quiet company facts and the company summary, then a sequence of flat division sections in source order. Each division has an h2 name and a compact, wrapping line of operating facts above its complete team directory; keep the teams and people visible rather than hiding them in tabs or collapsibles. Use generous space between divisions, no nested cards, and no headings beyond h1 and h2; the host retains all surrounding chrome and rerun controls.",
      regions: [
        {
          title: null,
          purpose: "Introduce the company once and provide the host's place for result actions.",
          container: 'Stack',
          elements: [
            'ResultHeader: title is a template reading /result/name, rendered as “Meet {name}”; this is the only h1. No eyebrow or subtitle. Host download and share actions occupy its action slot.',
          ],
        },
        {
          title: null,
          purpose: 'Give the reader the company’s basic context before its organizational detail.',
          container: 'Stack',
          elements: [
            'Grid: two equal columns holding the founding-date Stack and the publicly-traded Fact; stack into one column on narrow screens.',
            'Stack: holds Text “Founded” followed by DateText.',
            'DateText: value {$state: /result/founded_on}; format long, tone muted.',
            'Fact: label “Publicly traded”; value {$state: /result/is_public}, displayed as “Yes” or “No”.',
            'MthdsResult: path /result/summary; hideLabel true; placed below the facts.',
          ],
        },
        {
          title: null,
          purpose:
            'Walk through each division and its teams without flattening the company’s hierarchy or losing the team missions and member details.',
          container: 'Stack',
          elements: [
            'Stack: repeat over {$state: /result/divisions} in source order; each item holds one Section.',
            "Section: title reads the division item's name as its h2; no number or subtitle. Holds the operating-facts Stack followed by MthdsResult for teams.",
            'Stack: horizontal, wrapping; holds the division’s region and annual-budget Details.',
            'Detail: label “Region”; value {$item: region}; retain the state’s spelling.',
            'Detail: label “Annual budget (millions)”; value {$item: budget}; no currency suffix.',
            'MthdsResult: path teams relative to each division item; hideLabel true. Delegate the complete team list so markdown missions, headcounts, members, roles, joining dates, remote status and focus areas remain together in the kernel’s read-only rendering.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [
        '/result/summary — mandated delegation for markdown prose; rendered without its own label.',
        'teams within each item of /result/divisions — delegate the complete nested team list, including markdown missions and member records; MthdsResult uses the relative path teams.',
      ],
    },
  },
  {
    pipeRef: 'results.deep_result',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'F0wbZ21wZoXDSSPnyJyCc9p0UOi7ZnxX',
    frame: 'result',
    style: 'editorial',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/results.deep_result.result.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"company-page"}\n{"op":"add","path":"/elements/company-page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["header-region","facts-region","summary-region","directory-region"]}}\n{"op":"add","path":"/elements/header-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["company-header"]}}\n{"op":"add","path":"/elements/company-header","value":{"type":"ResultHeader","props":{"eyebrow":"Company directory","title":{"$template":"The people of ${/result/name}"}},"children":[]}}\n{"op":"add","path":"/elements/facts-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["company-facts"]}}\n{"op":"add","path":"/elements/company-facts","value":{"type":"Stack","props":{"direction":"horizontal","gap":"xl","align":"start"},"children":["founding-date-group","public-trading-fact"]}}\n{"op":"add","path":"/elements/founding-date-group","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["founded-label","founded-date"]}}\n{"op":"add","path":"/elements/founded-label","value":{"type":"Text","props":{"text":"Founded","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/founded-date","value":{"type":"DateText","props":{"value":{"$state":"/result/founded_on"},"style":"long","tone":"muted"},"children":[]}}\n{"op":"add","path":"/elements/public-trading-fact","value":{"type":"Fact","props":{"label":"Publicly traded","value":{"$cond":{"$state":"/result/is_public"},"$then":"Yes","$else":"No"}},"children":[]}}\n{"op":"add","path":"/elements/summary-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"md","align":"start"},"children":["company-summary"]}}\n{"op":"add","path":"/elements/company-summary","value":{"type":"MthdsResult","props":{"path":"/result/summary","hideLabel":true},"children":[]}}\n{"op":"add","path":"/elements/directory-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["division-list"]}}\n{"op":"add","path":"/elements/division-list","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"repeat":{"statePath":"/result/divisions"},"children":["division-section"]}}\n{"op":"add","path":"/elements/division-section","value":{"type":"Section","props":{"title":{"$item":"name"}},"children":["division-context","division-teams"]}}\n{"op":"add","path":"/elements/division-context","value":{"type":"Stack","props":{"direction":"horizontal","gap":"xl","align":"start"},"children":["division-region","division-budget"]}}\n{"op":"add","path":"/elements/division-region","value":{"type":"Detail","props":{"label":"Region","value":{"$item":"region"}},"children":[]}}\n{"op":"add","path":"/elements/division-budget","value":{"type":"Metric","props":{"label":"Annual budget","value":{"$item":"budget"},"format":"decimal","unit":"M"},"children":[]}}\n{"op":"add","path":"/elements/division-teams","value":{"type":"MthdsResult","props":{"path":"teams","hideLabel":true},"children":[]}}',
    spec: {
      root: 'company-page',
      elements: {
        'company-page': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['header-region', 'facts-region', 'summary-region', 'directory-region'],
        },
        'header-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['company-header'],
        },
        'company-header': {
          type: 'ResultHeader',
          props: {
            eyebrow: 'Company directory',
            title: {
              $template: 'The people of ${/result/name}',
            },
          },
          children: [],
        },
        'facts-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['company-facts'],
        },
        'company-facts': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'xl',
            align: 'start',
          },
          children: ['founding-date-group', 'public-trading-fact'],
        },
        'founding-date-group': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['founded-label', 'founded-date'],
        },
        'founded-label': {
          type: 'Text',
          props: {
            text: 'Founded',
            variant: 'muted',
          },
          children: [],
        },
        'founded-date': {
          type: 'DateText',
          props: {
            value: {
              $state: '/result/founded_on',
            },
            style: 'long',
            tone: 'muted',
          },
          children: [],
        },
        'public-trading-fact': {
          type: 'Fact',
          props: {
            label: 'Publicly traded',
            value: {
              $cond: {
                $state: '/result/is_public',
              },
              $then: 'Yes',
              $else: 'No',
            },
          },
          children: [],
        },
        'summary-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
            align: 'start',
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
        'directory-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['division-list'],
        },
        'division-list': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          repeat: {
            statePath: '/result/divisions',
          },
          children: ['division-section'],
        },
        'division-section': {
          type: 'Section',
          props: {
            title: {
              $item: 'name',
            },
          },
          children: ['division-context', 'division-teams'],
        },
        'division-context': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'xl',
            align: 'start',
          },
          children: ['division-region', 'division-budget'],
        },
        'division-region': {
          type: 'Detail',
          props: {
            label: 'Region',
            value: {
              $item: 'region',
            },
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
            format: 'decimal',
            unit: 'M',
          },
          children: [],
        },
        'division-teams': {
          type: 'MthdsResult',
          props: {
            path: 'teams',
            hideLabel: true,
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone getting to know a company understand what it does, how its divisions are organised, and the people behind each team.',
      title: 'The people of the company',
      composition:
        "Use a full-width, unboxed editorial page with generous space between a short company introduction and the organisational directory. Open with the sole h1, personalised with the company name, and the host's result actions; follow with a compact horizontal band of company facts and a reading-width summary. Below, repeat one flat Section per division in source order: its name is the h2, its region and annual budget sit together beneath it, and its complete team directory follows across the available width. Keep all divisions visible rather than hiding them in tabs; stack horizontal groups on narrow screens. Add no surrounding navigation, request recap, side panel, footer or run control.",
      regions: [
        {
          title: null,
          purpose:
            "Identify whose people the reader is meeting and provide the header location for the host's result actions.",
          container: 'Stack',
          elements: [
            'ResultHeader — title template "The people of {name}", with name read from /result/name; sole h1; eyebrow "Company directory"; no subtitle; host result actions at the right.',
          ],
        },
        {
          title: null,
          purpose:
            "Give the reader the company's founding date and public-trading status before the descriptive introduction.",
          container: 'Stack',
          elements: [
            'Stack — horizontal, holding the founding-date group and public-trading fact; stack vertically on narrow screens.',
            'Stack — holds Text "Founded" and DateText reading /result/founded_on, format long, tone muted.',
            'Fact — label "Publicly traded", value read from /result/is_public; display true as "Yes" and false as "No".',
          ],
        },
        {
          title: null,
          purpose:
            'Explain what the company does in a quiet, reading-width introduction without flattening its markdown.',
          container: 'Stack',
          elements: ['MthdsResult — /result/summary; hideLabel true.'],
        },
        {
          title: null,
          purpose:
            "Let readers browse the company division by division, with each division's operating context immediately above its teams and people.",
          container: 'Stack',
          elements: [
            'Stack — repeat over /result/divisions in source order; hold one Section per item.',
            'Section — title read from name relative to the current /result/divisions item, rendered as h2; holds the division context and delegated teams; no stage number or subtitle.',
            'Stack — horizontal within each Section, holding Detail for the region and Metric for the budget; stack vertically on narrow screens.',
            'Detail — label "Region", value read from region relative to the current /result/divisions item.',
            'Metric — label "Annual budget", value read from budget relative to the current /result/divisions item; format decimal; unit "M"; no currency added.',
            'MthdsResult — path teams relative to the current /result/divisions item; hideLabel true; render the complete team subtree, including missions, headcounts, members and their details, only here.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [
        '/result/summary — required delegation for markdown prose.',
        'teams, relative to each item in /result/divisions — delegate each complete team list so markdown missions and the nested member records render together without duplicating their values.',
      ],
    },
  },
  {
    pipeRef: 'results.deep_result',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: '8nX7qLuUCjMZRzn0pariRb5PBPvbeiRD',
    frame: 'result',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/results.deep_result.result.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["company-overview","division-list"]}}\n{"op":"add","path":"/elements/company-overview","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["company-header","company-facts","company-summary"]}}\n{"op":"add","path":"/elements/company-header","value":{"type":"ResultHeader","props":{"eyebrow":"Company","title":{"$template":"Meet the people at ${/result/name}"}},"children":[]}}\n{"op":"add","path":"/elements/company-facts","value":{"type":"Grid","props":{"columns":2,"gap":"sm"},"children":["founding-date","public-status"]}}\n{"op":"add","path":"/elements/founding-date","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["founded-label","founded-value"]}}\n{"op":"add","path":"/elements/founded-label","value":{"type":"Text","props":{"text":"Founded","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/founded-value","value":{"type":"DateText","props":{"value":{"$state":"/result/founded_on"},"style":"short"},"children":[]}}\n{"op":"add","path":"/elements/public-status","value":{"type":"Fact","props":{"label":"Publicly traded","value":{"$cond":{"$state":"/result/is_public"},"$then":"Yes","$else":"No"}},"children":[]}}\n{"op":"add","path":"/elements/company-summary","value":{"type":"MthdsResult","props":{"path":"/result/summary","hideLabel":true},"children":[]}}\n{"op":"add","path":"/elements/division-list","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["division-repeat"]}}\n{"op":"add","path":"/elements/division-repeat","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"repeat":{"statePath":"/result/divisions"},"children":["division-section"]}}\n{"op":"add","path":"/elements/division-section","value":{"type":"Section","props":{"title":{"$item":"name"}},"children":["division-figures","division-teams"]}}\n{"op":"add","path":"/elements/division-figures","value":{"type":"Grid","props":{"columns":2,"gap":"sm"},"children":["annual-budget","division-region"]}}\n{"op":"add","path":"/elements/annual-budget","value":{"type":"Metric","props":{"label":"Annual budget","value":{"$item":"budget"},"format":"decimal","unit":"M"},"children":[]}}\n{"op":"add","path":"/elements/division-region","value":{"type":"Fact","props":{"label":"Region","value":{"$item":"region"}},"children":[]}}\n{"op":"add","path":"/elements/division-teams","value":{"type":"MthdsResult","props":{"path":"teams","hideLabel":true},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['company-overview', 'division-list'],
        },
        'company-overview': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['company-header', 'company-facts', 'company-summary'],
        },
        'company-header': {
          type: 'ResultHeader',
          props: {
            eyebrow: 'Company',
            title: {
              $template: 'Meet the people at ${/result/name}',
            },
          },
          children: [],
        },
        'company-facts': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'sm',
          },
          children: ['founding-date', 'public-status'],
        },
        'founding-date': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['founded-label', 'founded-value'],
        },
        'founded-label': {
          type: 'Text',
          props: {
            text: 'Founded',
            variant: 'muted',
          },
          children: [],
        },
        'founded-value': {
          type: 'DateText',
          props: {
            value: {
              $state: '/result/founded_on',
            },
            style: 'short',
          },
          children: [],
        },
        'public-status': {
          type: 'Fact',
          props: {
            label: 'Publicly traded',
            value: {
              $cond: {
                $state: '/result/is_public',
              },
              $then: 'Yes',
              $else: 'No',
            },
          },
          children: [],
        },
        'company-summary': {
          type: 'MthdsResult',
          props: {
            path: '/result/summary',
            hideLabel: true,
          },
          children: [],
        },
        'division-list': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['division-repeat'],
        },
        'division-repeat': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          repeat: {
            statePath: '/result/divisions',
          },
          children: ['division-section'],
        },
        'division-section': {
          type: 'Section',
          props: {
            title: {
              $item: 'name',
            },
          },
          children: ['division-figures', 'division-teams'],
        },
        'division-figures': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'sm',
          },
          children: ['annual-budget', 'division-region'],
        },
        'annual-budget': {
          type: 'Metric',
          props: {
            label: 'Annual budget',
            value: {
              $item: 'budget',
            },
            format: 'decimal',
            unit: 'M',
          },
          children: [],
        },
        'division-region': {
          type: 'Fact',
          props: {
            label: 'Region',
            value: {
              $item: 'region',
            },
          },
          children: [],
        },
        'division-teams': {
          type: 'MthdsResult',
          props: {
            path: 'teams',
            hideLabel: true,
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone reviewing a company understand what it does, how its divisions are resourced, and who works in each team.',
      title: 'Meet the people at {/result/name}',
      composition:
        "Open with a full-width ResultHeader whose company-led title is the only h1, followed immediately by a compact row of company facts and the company summary. Below, stack divisions in source order as flat, tightly spaced Sections, each named with an h2; place its region and prominent annual budget together above its teams. Keep the division hierarchy visible without tabs or collapsed content, and delegate each division's complete team tree so missions retain their markdown and people remain grouped under their teams. Use no outer cards, extra heading levels, request recap, navigation, or run control; the host's result actions sit in ResultHeader.",
      regions: [
        {
          title: null,
          purpose:
            'Identify the company and give its founding date, public-trading status, and purpose before the organizational detail.',
          container: 'Stack',
          elements: [
            "ResultHeader: title uses /result/name through $state in the template “Meet the people at {name}”; eyebrow “Company”; no subtitle; retain the host's result actions.",
            'Grid: two compact columns holding the founding-date Stack and public-trading Fact; stack on narrow screens.',
            'Stack: Text “Founded”, then DateText reading /result/founded_on with format short.',
            'Fact: label “Publicly traded”; value reads /result/is_public with $state, displayed as “Yes” for true and “No” for false.',
            'MthdsResult: path /result/summary; hideLabel true.',
          ],
        },
        {
          title: null,
          purpose:
            "Show each division's operating region and budget, then its complete teams and people without flattening the organizational hierarchy.",
          container: 'Stack',
          elements: [
            'Stack: repeat over /result/divisions in source order; each item holds one Section.',
            'Section: title reads name relative to the current /result/divisions item; render as h2; contains the division figures Grid followed by MthdsResult.',
            'Grid: two columns holding Metric and Fact; stack on narrow screens.',
            'Metric: label “Annual budget”; value reads budget relative to the current /result/divisions item; format decimal; unit “M”; do not add a currency.',
            'Fact: label “Region”; value reads region relative to the current /result/divisions item; display the carried choice, one of "emea" | "americas" | "apac".',
            'MthdsResult: path teams relative to the current /result/divisions item; hideLabel true; delegate the whole list, including team names, markdown missions, headcounts, members, roles, joining dates, remote status, and focus areas.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [
        '/result/summary — required delegation for markdown prose.',
        'teams, relative to each item of /result/divisions — delegate the complete team tree to preserve markdown missions and its nested member structures without duplicating any of its values.',
      ],
    },
  },
  {
    pipeRef: 'results.deep_result',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'OsqNB0HGCYGq8xjaADUkh1FZsaD1qfky',
    frame: 'result',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-08',
    brief: 'data/briefs/results.deep_result.result.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"company-directory"}\n{"op":"add","path":"/elements/company-directory","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["identity","company-overview","divisions-region"]}}\n{"op":"add","path":"/elements/identity","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["company-header"]}}\n{"op":"add","path":"/elements/company-header","value":{"type":"ResultHeader","props":{"eyebrow":"Company directory","title":{"$state":"/result/name"}},"children":[]}}\n{"op":"add","path":"/elements/company-overview","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["company-facts","company-summary"]}}\n{"op":"add","path":"/elements/company-facts","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["founded-fact","public-trading-fact"]}}\n{"op":"add","path":"/elements/founded-fact","value":{"type":"Fact","props":{"label":"Founded","value":{"$state":"/result/founded_on"}},"children":[]}}\n{"op":"add","path":"/elements/public-trading-fact","value":{"type":"Fact","props":{"label":"Publicly traded","value":{"$cond":{"$state":"/result/is_public","eq":true},"$then":"Yes","$else":"No"}},"children":[]}}\n{"op":"add","path":"/elements/company-summary","value":{"type":"MthdsResult","props":{"path":"/result/summary","hideLabel":true},"children":[]}}\n{"op":"add","path":"/elements/divisions-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["division-list"]}}\n{"op":"add","path":"/elements/division-list","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"repeat":{"statePath":"/result/divisions"},"children":["division-section"]}}\n{"op":"add","path":"/elements/division-section","value":{"type":"Section","props":{"title":{"$item":"name"}},"children":["division-metadata","division-teams"]}}\n{"op":"add","path":"/elements/division-metadata","value":{"type":"Stack","props":{"direction":"horizontal","gap":"lg","align":"start"},"children":["division-region","division-budget"]}}\n{"op":"add","path":"/elements/division-region","value":{"type":"Detail","props":{"label":"Region","value":{"$item":"region"}},"children":[]}}\n{"op":"add","path":"/elements/division-budget","value":{"type":"Metric","props":{"label":"Annual budget","value":{"$item":"budget"},"format":"decimal","unit":"M"},"children":[]}}\n{"op":"add","path":"/elements/division-teams","value":{"type":"MthdsResult","props":{"path":"teams","hideLabel":true},"children":[]}}',
    spec: {
      root: 'company-directory',
      elements: {
        'company-directory': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['identity', 'company-overview', 'divisions-region'],
        },
        identity: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['company-header'],
        },
        'company-header': {
          type: 'ResultHeader',
          props: {
            eyebrow: 'Company directory',
            title: {
              $state: '/result/name',
            },
          },
          children: [],
        },
        'company-overview': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['company-facts', 'company-summary'],
        },
        'company-facts': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['founded-fact', 'public-trading-fact'],
        },
        'founded-fact': {
          type: 'Fact',
          props: {
            label: 'Founded',
            value: {
              $state: '/result/founded_on',
            },
          },
          children: [],
        },
        'public-trading-fact': {
          type: 'Fact',
          props: {
            label: 'Publicly traded',
            value: {
              $cond: {
                $state: '/result/is_public',
                eq: true,
              },
              $then: 'Yes',
              $else: 'No',
            },
          },
          children: [],
        },
        'company-summary': {
          type: 'MthdsResult',
          props: {
            path: '/result/summary',
            hideLabel: true,
          },
          children: [],
        },
        'divisions-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['division-list'],
        },
        'division-list': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          repeat: {
            statePath: '/result/divisions',
          },
          children: ['division-section'],
        },
        'division-section': {
          type: 'Section',
          props: {
            title: {
              $item: 'name',
            },
          },
          children: ['division-metadata', 'division-teams'],
        },
        'division-metadata': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'lg',
            align: 'start',
          },
          children: ['division-region', 'division-budget'],
        },
        'division-region': {
          type: 'Detail',
          props: {
            label: 'Region',
            value: {
              $item: 'region',
            },
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
            format: 'decimal',
            unit: 'M',
          },
          children: [],
        },
        'division-teams': {
          type: 'MthdsResult',
          props: {
            path: 'teams',
            hideLabel: true,
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone exploring a company understand what it does, how its divisions are organized, and who works in each team.',
      title: 'Explore the company',
      composition:
        "Use a full-width, open directory with generous space and no enclosing cards. The ResultHeader names the company, followed by a compact two-fact band and its summary. Below, show divisions in their source order as flat Sections: each division's name is its h2, its region and annual budget sit in a compact horizontal row, and its teams and people follow beneath in the kernel's read-only rendering. Keep all divisions visible rather than hiding them in tabs or collapsibles; separate the Sections with their built-in hairlines. On narrow screens, the fact band and division metadata stack. Build nothing outside the result, and add no run control.",
      regions: [
        {
          title: null,
          purpose:
            "Identify the company and place the host's result actions beside the page's only h1.",
          container: 'Stack',
          elements: [
            'ResultHeader: eyebrow "Company directory"; h1 title reads /result/name with $state; no subtitle; reserve its action slot for the host.',
          ],
        },
        {
          title: null,
          purpose: "Give the company's basic facts before explaining what it does.",
          container: 'Stack',
          elements: [
            'Grid: two columns, stacking to one on narrow screens; holds the founding date and public-trading status.',
            'Fact: label "Founded"; value reads /result/founded_on with $state, formatted as a date in words.',
            'Fact: label "Publicly traded"; value reads /result/is_public with $state, displayed as "Yes" for true and "No" for false.',
            'MthdsResult: path /result/summary; hideLabel true; render the markdown summary below the fact band.',
          ],
        },
        {
          title: null,
          purpose:
            "Let readers move through the company's divisions and reach each team's mission and member details without flattening the hierarchy.",
          container: 'Stack',
          elements: [
            'Stack: repeat over /result/divisions with $state, in source order; each item contains one Section.',
            "Section: repeated division container; h2 title reads the item's name with $item; contains a metadata Stack and MthdsResult.",
            'Stack: horizontal division metadata, stacking on narrow screens; contains Detail and Metric.',
            'Detail: label "Region"; value reads the division item\'s region with $item; display the stored choice as written: "emea" | "americas" | "apac".',
            'Metric: label "Annual budget"; value reads the division item\'s budget with $item; format decimal; unit "M", meaning millions, with no invented currency.',
            'MthdsResult: within each division repeat, path "teams"; hideLabel true; delegate the entire teams subtree, including team names, markdown missions, headcounts, and members with their roles, joining dates, remote status, and focus areas.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [
        '/result/summary — required delegation for the markdown company summary.',
        '/result/divisions → each item\'s teams, using MthdsResult path "teams" — delegate the nested team-and-member structure whole so markdown missions and the people hierarchy render together.',
      ],
    },
  },
  {
    pipeRef: 'results.nested_result',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/results.nested_result.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-review"}\n{"op":"add","path":"/elements/invoice-review","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["review-header","invoice-overview","billable-lines"]}}\n{"op":"add","path":"/elements/review-header","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["review-title"]}}\n{"op":"add","path":"/elements/review-title","value":{"type":"Heading","props":{"text":"Review the invoice","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/invoice-overview","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["invoice-details","invoice-total"]}}\n{"op":"add","path":"/elements/invoice-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["invoice-reference","invoice-issued","invoice-paid"]}}\n{"op":"add","path":"/elements/invoice-reference","value":{"type":"SummaryRow","props":{"label":"Reference","value":{"$state":"/result/reference"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-issued","value":{"type":"MthdsResult","props":{"path":"/result/issued_on"},"children":[]}}\n{"op":"add","path":"/elements/invoice-paid","value":{"type":"SummaryRow","props":{"label":"Paid","value":{"$cond":{"$state":"/result/paid"},"$then":"Yes","$else":"No"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-total","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["total-metric"]}}\n{"op":"add","path":"/elements/total-metric","value":{"type":"Metric","props":{"label":"Invoice total","value":{"$state":"/result/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/billable-lines","value":{"type":"Section","props":{"title":"Billable lines"},"children":["lines-table"]}}\n{"op":"add","path":"/elements/lines-table","value":{"type":"DataTable","props":{"rows":{"$state":"/result/lines"},"columns":[{"path":"label","label":"Item","format":"text"},{"path":"quantity","label":"Quantity","format":"number"},{"path":"unit_price","label":"Unit price","format":"number"}]},"children":[]}}',
    spec: {
      root: 'invoice-review',
      elements: {
        'invoice-review': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['review-header', 'invoice-overview', 'billable-lines'],
        },
        'review-header': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['review-title'],
        },
        'review-title': {
          type: 'Heading',
          props: {
            text: 'Review the invoice',
            level: 'h1',
          },
          children: [],
        },
        'invoice-overview': {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['invoice-details', 'invoice-total'],
        },
        'invoice-details': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['invoice-reference', 'invoice-issued', 'invoice-paid'],
        },
        'invoice-reference': {
          type: 'SummaryRow',
          props: {
            label: 'Reference',
            value: {
              $state: '/result/reference',
            },
          },
          children: [],
        },
        'invoice-issued': {
          type: 'MthdsResult',
          props: {
            path: '/result/issued_on',
          },
          children: [],
        },
        'invoice-paid': {
          type: 'SummaryRow',
          props: {
            label: 'Paid',
            value: {
              $cond: {
                $state: '/result/paid',
              },
              $then: 'Yes',
              $else: 'No',
            },
          },
          children: [],
        },
        'invoice-total': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['total-metric'],
        },
        'total-metric': {
          type: 'Metric',
          props: {
            label: 'Invoice total',
            value: {
              $state: '/result/total',
            },
            format: 'decimal',
          },
          children: [],
        },
        'billable-lines': {
          type: 'Section',
          props: {
            title: 'Billable lines',
          },
          children: ['lines-table'],
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
                format: 'text',
              },
              {
                path: 'quantity',
                label: 'Quantity',
                format: 'number',
              },
              {
                path: 'unit_price',
                label: 'Unit price',
                format: 'number',
              },
            ],
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person checking an extracted invoice confirm its identity, payment status, total, and billable lines at a glance.',
      title: 'Review the invoice',
      composition:
        'Use a centered, moderately narrow single-column page with an unboxed h1 and generous space above the invoice details. Beneath it, a 2:1 Split places compact reference, issue date, and payment details on the left and the prominent total on the right; stack these in that order on narrow screens. A flat Section below holds the full-width billable-lines table. Keep everything visible, use theme-aware text and separators, and include no currency, calculated amounts, navigation, or actions.',
      regions: [
        {
          title: null,
          purpose: "Name the review task without competing with the invoice's own reference.",
          container: 'Stack',
          elements: ['Heading — h1, "Review the invoice".'],
        },
        {
          title: null,
          purpose:
            'Pair invoice identity and settlement information with the figure the reader needs to verify first.',
          container: 'Split',
          elements: [
            'Split — ratio 2:1; exactly two children: a Stack of invoice details, then a Stack containing the total Metric.',
            'Stack — left child; holds Reference SummaryRow, issued-on MthdsResult, and Paid SummaryRow in that order.',
            'SummaryRow — value reads /result/reference with $state; label "Reference".',
            'MthdsResult — path /result/issued_on; label "Issued"; retain its read-only date rendering.',
            'SummaryRow — value reads /result/paid with $state; label "Paid"; show the boolean as "Yes" or "No".',
            'Stack — right child; holds the total Metric.',
            'Metric — value reads /result/total with $state; label "Invoice total"; format decimal; no unit.',
          ],
        },
        {
          title: 'Billable lines',
          purpose:
            'Let the reader check what was sold and the quantities and unit prices behind the invoice total.',
          container: 'Section',
          elements: [
            'DataTable — rows reads /result/lines with $state; columns in order: label, header "Item", format text; quantity, header "Quantity", format number; unit_price, header "Unit price", format number. No derived line totals, currency symbols, or extra summary row.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: ['/result/issued_on — the brief requires MthdsResult for the issue date.'],
    },
  },
  {
    pipeRef: 'results.nested_result',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'abr80eAwZaU2ZFBM2t1x8HT7mtMs2Bn3',
    frame: 'result',
    style: 'soft',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/results.nested_result.result.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-page"}\n{"op":"add","path":"/elements/invoice-page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["invoice-header-group","financial-overview","billable-lines"]}}\n{"op":"add","path":"/elements/invoice-header-group","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["invoice-header","issue-date"]}}\n{"op":"add","path":"/elements/invoice-header","value":{"type":"ResultHeader","props":{"title":{"$template":"Review invoice ${/result/reference}"}},"children":[]}}\n{"op":"add","path":"/elements/issue-date","value":{"type":"DateText","props":{"value":{"$state":"/result/issued_on"},"style":"long","tone":"muted"},"children":[]}}\n{"op":"add","path":"/elements/financial-overview","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["total-metric","payment-status"]}}\n{"op":"add","path":"/elements/total-metric","value":{"type":"Metric","props":{"label":"Total","value":{"$state":"/result/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/payment-status","value":{"type":"Fact","props":{"label":"Paid","value":{"$cond":{"$state":"/result/paid"},"$then":"Yes","$else":"No"}},"children":[]}}\n{"op":"add","path":"/elements/billable-lines","value":{"type":"Section","props":{"title":"Billable lines"},"children":["lines-table"]}}\n{"op":"add","path":"/elements/lines-table","value":{"type":"DataTable","props":{"rows":{"$state":"/result/lines"},"columns":[{"path":"label","label":"Item","format":"text"},{"path":"quantity","label":"Quantity","format":"number"},{"path":"unit_price","label":"Unit price","format":"number"}]},"children":[]}}',
    spec: {
      root: 'invoice-page',
      elements: {
        'invoice-page': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['invoice-header-group', 'financial-overview', 'billable-lines'],
        },
        'invoice-header-group': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['invoice-header', 'issue-date'],
        },
        'invoice-header': {
          type: 'ResultHeader',
          props: {
            title: {
              $template: 'Review invoice ${/result/reference}',
            },
          },
          children: [],
        },
        'issue-date': {
          type: 'DateText',
          props: {
            value: {
              $state: '/result/issued_on',
            },
            style: 'long',
            tone: 'muted',
          },
          children: [],
        },
        'financial-overview': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['total-metric', 'payment-status'],
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
        'payment-status': {
          type: 'Fact',
          props: {
            label: 'Paid',
            value: {
              $cond: {
                $state: '/result/paid',
              },
              $then: 'Yes',
              $else: 'No',
            },
          },
          children: [],
        },
        'billable-lines': {
          type: 'Section',
          props: {
            title: 'Billable lines',
          },
          children: ['lines-table'],
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
                format: 'text',
              },
              {
                path: 'quantity',
                label: 'Quantity',
                format: 'number',
              },
              {
                path: 'unit_price',
                label: 'Unit price',
                format: 'number',
              },
            ],
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person checking an invoice extracted from a note confirm its identity, total, payment status and billable lines at a glance.',
      title: 'Review invoice {reference}',
      composition:
        "Use a full-width, vertical composition with three generously spaced groups: a short result header, a compact financial overview, and the billable-lines table. The header's single h1 reads “Review invoice ” followed by the reference, with the issue date underneath and the host's result actions at the right. Below it, a two-column Grid gives the total the strongest visual emphasis beside a smaller payment-status fact; stack these on narrow screens. Finish with a flat Section containing the table, without an enclosing Card, tabs or collapsed content. Use the components' Soft styling unchanged, and add no request summary, side panel, footer or run control.",
      regions: [
        {
          title: null,
          purpose:
            "Identify the invoice and its issue date before the reader checks the amounts, while accommodating the host's result actions.",
          container: 'Stack',
          elements: [
            'ResultHeader — title is a template reading “Review invoice ” followed by $state /result/reference; this is the only h1; omit eyebrow and description; host result actions occupy its action area.',
            'DateText — value $state /result/issued_on; format long; tone muted.',
          ],
        },
        {
          title: null,
          purpose:
            'Make the total immediately findable and clarify whether the invoice has been settled, without repeating either value elsewhere.',
          container: 'Grid',
          elements: [
            'Metric — value $state /result/total; label “Total”; format decimal; no unit or currency suffix.',
            'Fact — value $state /result/paid; label “Paid”; render the boolean as “Yes” or “No”.',
          ],
        },
        {
          title: 'Billable lines',
          purpose:
            'Let the reader inspect what was sold, the number of units and each unit price in a straightforward table.',
          container: 'Section',
          elements: [
            'Section — h2 “Billable lines”; contains DataTable; no number or helper text.',
            'DataTable — rows $state /result/lines; columns in order: label, header “Item”, format text; quantity, header “Quantity”, format number; unit_price, header “Unit price”, format number. Do not add currency symbols, computed line totals or a total footer.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'results.nested_result',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: '7yOrujcmcMIYSgQl8pnBLVqLEaXt71cC',
    frame: 'result',
    style: 'editorial',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/results.nested_result.result.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-page"}\n{"op":"add","path":"/elements/invoice-page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["invoice-header-region","invoice-overview","billable-lines"]}}\n{"op":"add","path":"/elements/invoice-header-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["invoice-header"]}}\n{"op":"add","path":"/elements/invoice-header","value":{"type":"ResultHeader","props":{"title":{"$template":"Invoice ${/result/reference}"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-overview","value":{"type":"Grid","props":{"columns":2,"gap":"xl"},"children":["invoice-total","invoice-status"]}}\n{"op":"add","path":"/elements/invoice-total","value":{"type":"Metric","props":{"label":"Invoice total","value":{"$state":"/result/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/invoice-status","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm","align":"start"},"children":["invoice-issued-date","invoice-paid-badge"]}}\n{"op":"add","path":"/elements/invoice-issued-date","value":{"type":"DateText","props":{"value":{"$state":"/result/issued_on"},"style":"long","tone":"muted"},"children":[]}}\n{"op":"add","path":"/elements/invoice-paid-badge","value":{"type":"Badge","props":{"text":{"$cond":{"$state":"/result/paid"},"$then":"Paid","$else":"Unpaid"},"variant":"secondary"},"children":[]}}\n{"op":"add","path":"/elements/billable-lines","value":{"type":"Section","props":{"title":"Billable lines"},"children":["billable-lines-table"]}}\n{"op":"add","path":"/elements/billable-lines-table","value":{"type":"DataTable","props":{"rows":{"$state":"/result/lines"},"columns":[{"path":"label","label":"Description","format":"text"},{"path":"quantity","label":"Quantity","format":"number"},{"path":"unit_price","label":"Unit price","format":"number"}]},"children":[]}}',
    spec: {
      root: 'invoice-page',
      elements: {
        'invoice-page': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['invoice-header-region', 'invoice-overview', 'billable-lines'],
        },
        'invoice-header-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['invoice-header'],
        },
        'invoice-header': {
          type: 'ResultHeader',
          props: {
            title: {
              $template: 'Invoice ${/result/reference}',
            },
          },
          children: [],
        },
        'invoice-overview': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'xl',
          },
          children: ['invoice-total', 'invoice-status'],
        },
        'invoice-total': {
          type: 'Metric',
          props: {
            label: 'Invoice total',
            value: {
              $state: '/result/total',
            },
            format: 'decimal',
          },
          children: [],
        },
        'invoice-status': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
            align: 'start',
          },
          children: ['invoice-issued-date', 'invoice-paid-badge'],
        },
        'invoice-issued-date': {
          type: 'DateText',
          props: {
            value: {
              $state: '/result/issued_on',
            },
            style: 'long',
            tone: 'muted',
          },
          children: [],
        },
        'invoice-paid-badge': {
          type: 'Badge',
          props: {
            text: {
              $cond: {
                $state: '/result/paid',
              },
              $then: 'Paid',
              $else: 'Unpaid',
            },
            variant: 'secondary',
          },
          children: [],
        },
        'billable-lines': {
          type: 'Section',
          props: {
            title: 'Billable lines',
          },
          children: ['billable-lines-table'],
        },
        'billable-lines-table': {
          type: 'DataTable',
          props: {
            rows: {
              $state: '/result/lines',
            },
            columns: [
              {
                path: 'label',
                label: 'Description',
                format: 'text',
              },
              {
                path: 'quantity',
                label: 'Quantity',
                format: 'number',
              },
              {
                path: 'unit_price',
                label: 'Unit price',
                format: 'number',
              },
            ],
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person checking an extracted invoice verify its total, payment status and billable lines at a glance.',
      title: 'Invoice {reference}',
      composition:
        "Use a full-width, open reading column with generous margins and no cards. Begin with a large ResultHeader naming the invoice from its reference and accommodating the host's result actions. Below it, place the total prominently on the left of a two-column Grid, with the issue date and payment status in a compact Stack on the right; stack these columns on narrow screens. Leave generous space before a single flat section containing the billable-lines table, with numeric columns aligned right. Show every value once, use theme-native styling, and add no request summary, footer or run control.",
      regions: [
        {
          title: null,
          purpose:
            "Identify the invoice immediately and provide the header location for the host's result actions.",
          container: 'Stack',
          elements: [
            'ResultHeader — title uses $template "Invoice {/result/reference}", reading /result/reference; the page\'s only h1; no eyebrow or subtitle.',
          ],
        },
        {
          title: null,
          purpose:
            'Put the invoice total first, with its issue date and settlement status alongside it for quick verification.',
          container: 'Grid',
          elements: [
            'Grid — two columns holding Metric first and Stack second; one column on narrow screens.',
            'Metric — value { "$state": "/result/total" }; label "Invoice total"; format decimal; no unit because the result carries no currency.',
            'Stack — holds DateText followed by Badge.',
            'DateText — value { "$state": "/result/issued_on" }; format long; tone muted.',
            'Badge — reads { "$state": "/result/paid" }; display "Paid" when true and "Unpaid" when false.',
          ],
        },
        {
          title: 'Billable lines',
          purpose:
            "Let the reader check what was sold, how many units were billed and each unit's price without inventing calculated line totals.",
          container: 'Section',
          elements: [
            'Section — h2 "Billable lines"; no number or helper text; holds DataTable.',
            'DataTable — rows { "$state": "/result/lines" }; columns in order: label, header "Description", text; quantity, header "Quantity", number; unit_price, header "Unit price", number. Right-align the two numeric columns; show no additional total or currency.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [],
    },
  },
  {
    pipeRef: 'results.nested_result',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'zAlJKjKZpQFkRMaNnhq62JZZHKK275Lo',
    frame: 'result',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/results.nested_result.result.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-page"}\n{"op":"add","path":"/elements/invoice-page","value":{"type":"Stack","props":{"direction":"vertical","gap":"md","align":"stretch"},"children":["invoice-header-group","invoice-facts","lines-separator","billable-lines"]}}\n{"op":"add","path":"/elements/invoice-header-group","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["invoice-header"]}}\n{"op":"add","path":"/elements/invoice-header","value":{"type":"ResultHeader","props":{"title":{"$template":"Invoice · ${/result/reference}"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-facts","value":{"type":"Grid","props":{"columns":3,"gap":"md"},"children":["total-metric","paid-fact","issued-group"]}}\n{"op":"add","path":"/elements/total-metric","value":{"type":"Metric","props":{"label":"Total","value":{"$state":"/result/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/paid-fact","value":{"type":"Fact","props":{"label":"Paid","value":{"$cond":{"$state":"/result/paid"},"$then":"Yes","$else":"No"}},"children":[]}}\n{"op":"add","path":"/elements/issued-group","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["issued-label","issued-date"]}}\n{"op":"add","path":"/elements/issued-label","value":{"type":"Text","props":{"text":"Issued","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/issued-date","value":{"type":"DateText","props":{"value":{"$state":"/result/issued_on"},"style":"short","tone":"muted"},"children":[]}}\n{"op":"add","path":"/elements/lines-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/billable-lines","value":{"type":"Section","props":{"title":"Billable lines"},"children":["lines-table"]}}\n{"op":"add","path":"/elements/lines-table","value":{"type":"DataTable","props":{"rows":{"$state":"/result/lines"},"columns":[{"path":"label","label":"Item","format":"text"},{"path":"quantity","label":"Quantity","format":"number"},{"path":"unit_price","label":"Unit price","format":"number"}]},"children":[]}}',
    spec: {
      root: 'invoice-page',
      elements: {
        'invoice-page': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
            align: 'stretch',
          },
          children: ['invoice-header-group', 'invoice-facts', 'lines-separator', 'billable-lines'],
        },
        'invoice-header-group': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['invoice-header'],
        },
        'invoice-header': {
          type: 'ResultHeader',
          props: {
            title: {
              $template: 'Invoice · ${/result/reference}',
            },
          },
          children: [],
        },
        'invoice-facts': {
          type: 'Grid',
          props: {
            columns: 3,
            gap: 'md',
          },
          children: ['total-metric', 'paid-fact', 'issued-group'],
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
        'paid-fact': {
          type: 'Fact',
          props: {
            label: 'Paid',
            value: {
              $cond: {
                $state: '/result/paid',
              },
              $then: 'Yes',
              $else: 'No',
            },
          },
          children: [],
        },
        'issued-group': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['issued-label', 'issued-date'],
        },
        'issued-label': {
          type: 'Text',
          props: {
            text: 'Issued',
            variant: 'muted',
          },
          children: [],
        },
        'issued-date': {
          type: 'DateText',
          props: {
            value: {
              $state: '/result/issued_on',
            },
            style: 'short',
            tone: 'muted',
          },
          children: [],
        },
        'lines-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'billable-lines': {
          type: 'Section',
          props: {
            title: 'Billable lines',
          },
          children: ['lines-table'],
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
                format: 'text',
              },
              {
                path: 'quantity',
                label: 'Quantity',
                format: 'number',
              },
              {
                path: 'unit_price',
                label: 'Unit price',
                format: 'number',
              },
            ],
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person reviewing an extracted invoice check its total, payment status and billable lines at a glance.',
      title: 'Invoice · {reference}',
      composition:
        'A compact, full-width invoice sheet with three firm horizontal groups: a short, heavy result header, a band of key facts, then the billable-lines table. The header reads “Invoice · ” followed by the result reference and reserves the component’s action area for the host. In the facts band, the total leads and is largest; payment status and issue date sit alongside it in three equal columns, stacking in that order on narrow screens. Keep all lines visible in one table below a hairline, with no cards, folded sections, repeated values or added currency.',
      regions: [
        {
          title: null,
          purpose:
            'Identify the invoice immediately and give the host its designated place for result actions.',
          container: 'Stack',
          elements: [
            'ResultHeader: eyebrow omitted; h1 title uses $template to join the literal “Invoice · ” with {$state: "/result/reference"}; muted line omitted; host-owned result actions remain in its action area.',
          ],
        },
        {
          title: null,
          purpose: 'Put the amount first, then the two facts needed to interpret the invoice.',
          container: 'Grid',
          elements: [
            'Grid: three equal columns holding Metric, Fact, and a Stack; collapse to one column on narrow screens.',
            'Metric: label “Total”; value {$state: "/result/total"}; format decimal; no unit.',
            'Fact: label “Paid”; value {$state: "/result/paid"}; render the boolean as “Yes” or “No”; no detail.',
            'Stack: holds Text “Issued” in muted tone, then DateText.',
            'DateText: value {$state: "/result/issued_on"}; format short; tone muted.',
          ],
        },
        {
          title: 'Billable lines',
          purpose:
            'Show exactly what was billed in a compact table without calculating additional amounts.',
          container: 'Section',
          elements: [
            'Section: h2 “Billable lines”; no number or helper line; hairline separation from the facts band.',
            'DataTable: rows {$state: "/result/lines"}; columns in order: label — “Item” — text; quantity — “Quantity” — number; unit_price — “Unit price” — number. Item column takes the remaining width; numeric columns are compact and right-aligned.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'results.nested_result',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'XPlLR14PuknpQXVEL13mxC989jn0wKQy',
    frame: 'result',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-08',
    brief: 'data/briefs/results.nested_result.result.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"invoice-page"}\n{"op":"add","path":"/elements/invoice-page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["header-group","invoice-facts","billable-lines"]}}\n{"op":"add","path":"/elements/header-group","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["invoice-header"]}}\n{"op":"add","path":"/elements/invoice-header","value":{"type":"ResultHeader","props":{"title":{"$template":"Invoice ${/result/reference}"}},"children":[]}}\n{"op":"add","path":"/elements/invoice-facts","value":{"type":"Grid","props":{"columns":3,"gap":"lg"},"children":["total-metric","issued-date","paid-fact"]}}\n{"op":"add","path":"/elements/total-metric","value":{"type":"Metric","props":{"label":"Invoice total","value":{"$state":"/result/total"},"format":"decimal"},"children":[]}}\n{"op":"add","path":"/elements/issued-date","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["issued-label","issued-value"]}}\n{"op":"add","path":"/elements/issued-label","value":{"type":"Text","props":{"text":"Issued","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/issued-value","value":{"type":"DateText","props":{"value":{"$state":"/result/issued_on"},"style":"long","tone":"muted"},"children":[]}}\n{"op":"add","path":"/elements/paid-fact","value":{"type":"Fact","props":{"label":"Paid","value":{"$cond":{"$state":"/result/paid"},"$then":"Yes","$else":"No"}},"children":[]}}\n{"op":"add","path":"/elements/billable-lines","value":{"type":"Stack","props":{"direction":"vertical","gap":"md","align":"stretch"},"children":["lines-heading","lines-table"]}}\n{"op":"add","path":"/elements/lines-heading","value":{"type":"Heading","props":{"text":"Billable lines","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/lines-table","value":{"type":"DataTable","props":{"rows":{"$state":"/result/lines"},"columns":[{"path":"label","label":"Item","format":"text"},{"path":"quantity","label":"Quantity","format":"number"},{"path":"unit_price","label":"Unit price","format":"number"}]},"children":[]}}',
    spec: {
      root: 'invoice-page',
      elements: {
        'invoice-page': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['header-group', 'invoice-facts', 'billable-lines'],
        },
        'header-group': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['invoice-header'],
        },
        'invoice-header': {
          type: 'ResultHeader',
          props: {
            title: {
              $template: 'Invoice ${/result/reference}',
            },
          },
          children: [],
        },
        'invoice-facts': {
          type: 'Grid',
          props: {
            columns: 3,
            gap: 'lg',
          },
          children: ['total-metric', 'issued-date', 'paid-fact'],
        },
        'total-metric': {
          type: 'Metric',
          props: {
            label: 'Invoice total',
            value: {
              $state: '/result/total',
            },
            format: 'decimal',
          },
          children: [],
        },
        'issued-date': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['issued-label', 'issued-value'],
        },
        'issued-label': {
          type: 'Text',
          props: {
            text: 'Issued',
            variant: 'muted',
          },
          children: [],
        },
        'issued-value': {
          type: 'DateText',
          props: {
            value: {
              $state: '/result/issued_on',
            },
            style: 'long',
            tone: 'muted',
          },
          children: [],
        },
        'paid-fact': {
          type: 'Fact',
          props: {
            label: 'Paid',
            value: {
              $cond: {
                $state: '/result/paid',
              },
              $then: 'Yes',
              $else: 'No',
            },
          },
          children: [],
        },
        'billable-lines': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
            align: 'stretch',
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
                label: 'Item',
                format: 'text',
              },
              {
                path: 'quantity',
                label: 'Quantity',
                format: 'number',
              },
              {
                path: 'unit_price',
                label: 'Unit price',
                format: 'number',
              },
            ],
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person reviewing an extracted invoice check its total, settlement status and billable lines at a glance.',
      title: 'Invoice',
      composition:
        'Use a full-width, flat vertical Stack with generous space between three groups: the result header, a compact band of invoice facts, and the billable-lines table. The header’s sole h1 reads “Invoice” followed by the reference and reserves its action area for the host. Below it, a three-column Grid places the total first and largest, followed by the issue date and paid status; these stack in that order on narrow screens. Finish with a full-width table under a single h2, without cards, decorative icons, extra summaries or calculated amounts.',
      regions: [
        {
          title: null,
          purpose:
            'Identify the invoice immediately and provide the host’s result-action placement.',
          container: 'Stack',
          elements: [
            'ResultHeader — title uses a $template reading /result/reference: “Invoice {reference}”; no eyebrow or subtitle; the only h1; host-owned actions at the right.',
          ],
        },
        {
          title: null,
          purpose:
            'Put the invoice total first, with the date and settlement status alongside it for a quick check.',
          container: 'Grid',
          elements: [
            'Metric — value reads $state /result/total; label “Invoice total”; format decimal; no unit or currency suffix.',
            'Stack — holds Text “Issued” and DateText reading $state /result/issued_on; format long; muted tone.',
            'Fact — value reads $state /result/paid; label “Paid”; render the boolean as “Yes” or “No”; no detail.',
          ],
        },
        {
          title: 'Billable lines',
          purpose:
            'Show exactly what was sold and its quantity and unit price, without inventing line totals or currency.',
          container: 'Stack',
          elements: [
            'Heading — h2 “Billable lines”.',
            'DataTable — rows read $state /result/lines; columns in order: label, header “Item”, format text; quantity, header “Quantity”, format number; unit_price, header “Unit price”, format number; no currency suffix, calculated columns or total row.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: null,
    },
  },
];
