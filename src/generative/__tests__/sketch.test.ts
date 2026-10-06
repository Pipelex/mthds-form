import { describe, expect, it } from 'vitest';
import type { RunField } from '../../core';
import { formatsForKind } from '../../core/file-formats';
import { catalog } from '../catalog';
import { layoutProblems } from '../layout-fits';
import { type PageSketch, type SketchBlock, sketchBrief, sketchToSpec } from '../sketch';
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
    const brief = sketchBrief({ name: 'Qualify bid', produces: 'A go/no-go sheet' }, fields);
    expect(brief.name).toBe('Qualify bid');
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
