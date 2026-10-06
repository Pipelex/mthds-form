import { describe, expect, it } from 'vitest';
import type { RunField } from '../../core';
import { formatsForKind } from '../../core/file-formats';
import { catalog } from '../catalog';
import { layoutProblems } from '../layout-fits';
import {
  type PageSketch,
  type SketchBlock,
  sketchBrief,
  sketchFromOutline,
  sketchToSpec,
} from '../sketch';
import { validateAgainstCatalog } from '../validate';

/**
 * The sketch designer's code half: the brief it is handed, and the spec its
 * outline is assembled into. The descriptor is written by hand, as in
 * `brief.test.ts`, and shaped like Qualify bid - a document, a long text and
 * an optional date - because that is the page the experiment is judged on.
 */
const fields: RunField[] = [
  {
    kind: 'document',
    name: 'briefing',
    required: true,
    description: "A funder's briefing deck, as a PDF",
    formats: formatsForKind('document'),
  },
  { kind: 'prose', name: 'criteria', required: true, description: "The company's bid criteria" },
  {
    kind: 'object',
    name: 'briefing_date',
    conceptRef: 'native.Date',
    required: false,
    description: 'A calendar date',
    fields: [
      { kind: 'date', name: 'date', required: true, datetime: false },
      { kind: 'text', name: 'time', required: false },
    ],
  },
];

const block = (
  depth: number,
  name: SketchBlock['block'],
  text?: string,
  line?: string,
): SketchBlock => ({
  depth,
  block: name,
  ...(text === undefined ? {} : { text }),
  ...(line === undefined ? {} : { line }),
});

const sketch = (blocks: SketchBlock[], lede?: string): PageSketch => ({
  purpose: 'A bid manager decides whether to bid.',
  title: 'Qualify a bid',
  ...(lede === undefined ? {} : { lede }),
  blocks,
});

const columnPage = sketch(
  [
    block(0, 'Section', 'The deck', 'The briefing you were sent'),
    block(1, 'Field', 'briefing'),
    block(1, 'Fold', 'When was it?'),
    block(2, 'Field', 'briefing_date'),
    block(0, 'Section', 'Your criteria'),
    block(1, 'Field', 'criteria'),
    block(0, 'Run', 'Qualify the bid', 'Needs the deck and the criteria'),
  ],
  'Go or no-go, before the meeting.',
);

describe('the brief', () => {
  it('lists the top-level inputs only, in plain words, with no path', () => {
    const brief = sketchBrief(
      {
        name: 'Qualify bid',
        about: 'Assess a briefing against criteria',
        produces: 'A go/no-go sheet',
      },
      fields,
    );
    expect(brief.name).toBe('Qualify bid');
    expect(brief.about).toBe('Assess a briefing against criteria');
    expect(brief.produces).toBe('A go/no-go sheet');
    expect(brief.inputs.map((input) => input.name)).toEqual([
      'briefing',
      'criteria',
      'briefing_date',
    ]);
    expect(brief.inputs.map((input) => input.kind)).toEqual([
      'a document (a file)',
      'a long text',
      'a date, optionally with a time',
    ]);
    expect(brief.inputs.map((input) => input.required)).toEqual([true, true, false]);
    expect(JSON.stringify(brief)).not.toContain('/inputs');
  });

  it('omits a title that only restates the name', () => {
    const [input] = sketchBrief({ name: 'x' }, [
      { kind: 'text', name: 'city', title: 'city', required: true },
    ]).inputs;
    expect(input).not.toHaveProperty('title');
  });
});

describe('a well-formed outline', () => {
  const assembly = sketchToSpec(columnPage, fields);
  if (!assembly.ok) throw new Error(assembly.problems.join('\n'));
  const { spec } = assembly;

  it('assembles into a spec both gates accept', () => {
    expect(validateAgainstCatalog(spec, catalog).ok).toBe(true);
    expect(layoutProblems({ inputs: fields }, spec)).toEqual([]);
  });

  it('puts the title on the page as its Hero, under a column root', () => {
    expect(spec.elements[spec.root]?.type).toBe('Stack');
    expect(spec.elements.hero).toMatchObject({
      type: 'Hero',
      props: { headline: 'Qualify a bid', lede: 'Go or no-go, before the meeting.' },
    });
  });

  it('binds every Field at its input path and wires the one Run', () => {
    const paths = Object.values(spec.elements)
      .filter((element) => element.type === 'MthdsField')
      .map((element) => element.props.path);
    expect(paths.sort()).toEqual(['/inputs/briefing', '/inputs/briefing_date', '/inputs/criteria']);
    const runs = Object.values(spec.elements).filter((element) => element.type === 'Cta');
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({
      props: { label: 'Qualify the bid', hint: 'Needs the deck and the criteria' },
      on: { press: [{ action: 'validateForm' }, { action: 'run' }] },
    });
  });

  it('starts a line the outline wrote in lower case with a capital', () => {
    const lowered = sketchToSpec(
      sketch([
        block(0, 'Section', 'The deck', 'the briefing you were sent'),
        ...columnPage.blocks.slice(1),
      ]),
      fields,
    );
    if (!lowered.ok) throw new Error(lowered.problems.join('\n'));
    expect(lowered.spec.elements['section-the-deck']?.props.lede).toBe(
      'The briefing you were sent',
    );
  });

  it('nests by depth', () => {
    const fold = Object.values(spec.elements).find((element) => element.type === 'Collapsible');
    expect(fold?.children).toHaveLength(1);
    expect(spec.elements[fold!.children![0]!]?.props.path).toBe('/inputs/briefing_date');
  });
});

describe('a Side', () => {
  it('turns the page into a Workspace, the Side as its panel', () => {
    const assembly = sketchToSpec(
      sketch([
        block(0, 'Section', 'The deck'),
        block(1, 'Field', 'briefing'),
        block(1, 'Field', 'briefing_date'),
        block(0, 'Side', 'Your criteria'),
        block(1, 'Field', 'criteria'),
        block(1, 'Run', 'Qualify the bid'),
      ]),
      fields,
    );
    if (!assembly.ok) throw new Error(assembly.problems.join('\n'));
    const { spec } = assembly;
    const workspace = spec.elements.workspace;
    expect(workspace?.type).toBe('Workspace');
    expect(workspace?.children?.map((key) => spec.elements[key]?.type)).toEqual(['Stack', 'Rail']);
    expect(validateAgainstCatalog(spec, catalog).ok).toBe(true);
    expect(layoutProblems({ inputs: fields }, spec)).toEqual([]);
  });
});

describe('Steps and Tabs', () => {
  it('take their labels from the blocks they hold', () => {
    const assembly = sketchToSpec(
      sketch([
        block(0, 'Steps'),
        block(1, 'Step', 'The deck'),
        block(2, 'Field', 'briefing'),
        block(2, 'Field', 'briefing_date'),
        block(1, 'Step', 'The criteria'),
        block(2, 'Field', 'criteria'),
        block(2, 'Run', 'Qualify the bid'),
      ]),
      fields,
    );
    if (!assembly.ok) throw new Error(assembly.problems.join('\n'));
    expect(assembly.spec.elements.steps?.props.steps).toEqual(['The deck', 'The criteria']);
    expect(validateAgainstCatalog(assembly.spec, catalog).ok).toBe(true);
  });
});

describe('a malformed outline is refused, every problem named', () => {
  const problemsOf = (blocks: SketchBlock[]): string[] => {
    const assembly = sketchToSpec(sketch(blocks), fields);
    return assembly.ok ? [] : assembly.problems;
  };
  const complete = [
    block(0, 'Field', 'briefing'),
    block(0, 'Field', 'criteria'),
    block(0, 'Field', 'briefing_date'),
  ];

  it('an input with no Field, or with two', () => {
    expect(
      problemsOf([
        block(0, 'Field', 'briefing'),
        block(0, 'Field', 'briefing'),
        block(0, 'Run', 'Go'),
      ]),
    ).toEqual(
      expect.arrayContaining([
        'the input "briefing" has 2 Fields',
        'the input "criteria" has no Field',
        'the input "briefing_date" has no Field',
      ]),
    );
  });

  it('a Field that names no input', () => {
    expect(problemsOf([...complete, block(0, 'Field', 'deck'), block(0, 'Run', 'Go')])).toEqual([
      'block 4 (Field "deck") names no input of this method',
    ]);
  });

  it('no Run, or two', () => {
    expect(problemsOf(complete)).toEqual(['the outline has 0 Run blocks; it needs exactly one']);
    expect(problemsOf([...complete, block(0, 'Run', 'Go'), block(0, 'Run', 'Again')])).toEqual([
      'the outline has 2 Run blocks; it needs exactly one',
    ]);
  });

  it('a bullet nested under one that holds nothing, or two levels at once', () => {
    expect(problemsOf([block(0, 'Text', 'Hello'), block(1, 'Field', 'briefing')])).toContain(
      'block 2 (Field "briefing") is nested under block 1 (Text "Hello"), which holds nothing',
    );
    expect(problemsOf([block(0, 'Section', 'A'), block(2, 'Field', 'briefing')])).toContain(
      'block 2 (Field) is nested deeper than the block before it allows',
    );
  });

  it('a Run before the last step', () => {
    expect(
      problemsOf([
        block(0, 'Steps'),
        block(1, 'Step', 'One'),
        block(2, 'Field', 'briefing'),
        block(2, 'Run', 'Go'),
        block(1, 'Step', 'Two'),
        block(2, 'Field', 'criteria'),
        block(2, 'Field', 'briefing_date'),
      ]),
    ).toContain('block 1 (Steps) has its Run before the last step');
  });

  it('a block the outline does not know', () => {
    expect(
      problemsOf([{ depth: 0, block: 'Hero' as SketchBlock['block'], text: 'x' }, ...complete]),
    ).toContain('block 1 is a "Hero", which is not a block the outline knows');
  });
});

describe('the outline', () => {
  /** An outline the designer wrote for Qualify bid, verbatim. */
  const written = [
    'Purpose: for a bid lead deciding whether to pursue an opportunity, to hand over the briefing and the house criteria and receive a go/no-go sheet.',
    '',
    '# Qualify a bid',
    'Turn a briefing and your criteria into a go/no-go sheet.',
    '',
    '- Side: What a run produces',
    '  - Text: A go/no-go sheet: the opportunity, a recommendation by your rule — and the questions it raises.',
    "- Section: The briefing — the call for funding or tender you're weighing up.",
    '  - Field: briefing',
    '- Section: Your criteria',
    '  - Field: criteria',
    '- Fold: Briefing date',
    '  - Field: `briefing_date`',
    '- Run: Qualify this bid — produces a go/no-go sheet.',
  ].join('\n');

  it('reads the purpose, the title, the line under it and every bullet', () => {
    const parse = sketchFromOutline(written);
    if (!parse.ok) throw new Error(parse.problems.join('\n'));
    expect(parse.sketch).toEqual({
      purpose:
        'for a bid lead deciding whether to pursue an opportunity, to hand over the briefing and the house criteria and receive a go/no-go sheet.',
      title: 'Qualify a bid',
      lede: 'Turn a briefing and your criteria into a go/no-go sheet.',
      blocks: [
        block(0, 'Side', 'What a run produces'),
        block(
          1,
          'Text',
          'A go/no-go sheet: the opportunity, a recommendation by your rule — and the questions it raises.',
        ),
        block(0, 'Section', 'The briefing', "the call for funding or tender you're weighing up."),
        block(1, 'Field', 'briefing'),
        block(0, 'Section', 'Your criteria'),
        block(1, 'Field', 'criteria'),
        block(0, 'Fold', 'Briefing date'),
        block(1, 'Field', 'briefing_date'),
        block(0, 'Run', 'Qualify this bid', 'produces a go/no-go sheet.'),
      ],
    });
    expect(sketchToSpec(parse.sketch, fields).ok).toBe(true);
  });

  it('reads nesting relative to the bullets above, at any indentation', () => {
    const parse = sketchFromOutline(
      [
        '```markdown',
        '# Qualify a bid',
        '- Steps',
        '    - Step: The deck',
        '        - Field: briefing',
        '    - Step: The rest',
        '        - Field: criteria',
        '- Row',
        '  - Field: briefing_date',
        '```',
      ].join('\n'),
    );
    if (!parse.ok) throw new Error(parse.problems.join('\n'));
    expect(parse.sketch.blocks.map((one) => [one.depth, one.block])).toEqual([
      [0, 'Steps'],
      [1, 'Step'],
      [2, 'Field'],
      [1, 'Step'],
      [2, 'Field'],
      [0, 'Row'],
      [1, 'Field'],
    ]);
    expect(parse.sketch).not.toHaveProperty('lede');
  });

  it('refuses what is not the grammar, every line named', () => {
    const parse = sketchFromOutline(
      [
        'Purpose: x',
        '- Field: briefing',
        '# Qualify a bid',
        '## Details',
        '- Hero: Qualify',
        '- Section The deck',
        '- Run: Go',
        'Hope this helps!',
      ].join('\n'),
    );
    expect(parse.ok).toBe(false);
    expect(parse.ok ? [] : parse.problems).toEqual([
      'line 2 is a bullet before the title line',
      'line 4 is a second heading; the page has one title: "## Details"',
      'line 5 starts with "Hero:", which is not a block the outline knows',
      'line 6 has no colon after "Section": "- Section The deck"',
      'line 8 is not a bullet, after the bullets began: "Hope this helps!"',
    ]);
  });

  it('refuses an outline with no title or no bullets', () => {
    expect(sketchFromOutline('Purpose: x\n- Run: Go')).toEqual({
      ok: false,
      problems: [
        'line 2 is a bullet before the title line',
        'the outline has no title line ("# …")',
      ],
    });
    expect(sketchFromOutline('# A title\nA line.')).toEqual({
      ok: false,
      problems: ['the outline has no bullets'],
    });
  });
});
