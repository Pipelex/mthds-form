import type { Spec, UIElement } from '@json-render/core';
import type { RunField } from '../core';
import { isNativeCompositeNode, isNativeDateNode, isNativeHtmlNode } from '../core/native-content';
import { INPUTS_ROOT, joinPath } from './paths';

/**
 * The sketch designer's three halves in code: the brief it is handed, the
 * parse of the outline it returns, and the assembly of that outline into a
 * json-render spec.
 *
 * `experiments/page-sketch.mthds` asks a model for the only things a model has to
 * decide about an input page - what it is for, its title, its composition and
 * its copy - as a light Markdown outline, returned as text. The outline's
 * grammar is this file's, so it is parsed here rather than by a second model
 * call: `sketchFromOutline` reads it into a `PageSketch` and names every line it
 * cannot read. Everything else a layout carries is derivable, so it is derived
 * here and never asked for: the element keys, the children arrays, the root,
 * the bindings, the path of every input, the heading levels, the call to
 * action's events, and the props each block becomes. The spec this builds is
 * then judged by `validateAgainstCatalog` and `layoutProblems` exactly as a
 * spec a model wrote patch by patch would be.
 *
 * An experiment beside `brief.ts` and `layout-design.mthds`, for input pages
 * only. The brief's shape restates the method's concepts by hand rather than
 * through codegen, because the method is not shipped yet; a field renamed in
 * the bundle is caught by the run that sends it, not by the type check.
 */

/** The concept a run request names for the sketch designer's `brief` input. */
export const SKETCH_BRIEF_CONCEPT = 'generative.SketchBrief';

/** `SketchInput` of `experiments/page-sketch.mthds`: one top-level input. */
export interface SketchInput {
  name: string;
  title?: string;
  kind: string;
  required: boolean;
  description?: string;
}

/** `SketchBrief` of `experiments/page-sketch.mthds`. */
export interface SketchBrief {
  name: string;
  about?: string;
  produces?: string;
  inputs: SketchInput[];
}

/**
 * The blocks an outline may use, each with the json-render component it
 * becomes. The method's prompt names exactly these; a block missing here is
 * refused by name.
 */
export const SKETCH_BLOCKS = {
  Section: 'Section',
  Side: 'Rail',
  Row: 'Grid',
  Fold: 'Collapsible',
  Steps: 'Steps',
  Step: 'Stack',
  Tabs: 'Tabs',
  Tab: 'Stack',
  Text: 'Text',
  Field: 'MthdsField',
  Run: 'Cta',
} as const;

export type SketchBlockName = keyof typeof SKETCH_BLOCKS;

/**
 * One bullet of the outline: how deeply it is indented (0 at the margin), its
 * block, the words after the block's colon, and the words after " — ".
 */
export interface SketchBlock {
  depth: number;
  block: SketchBlockName;
  text?: string | null;
  line?: string | null;
}

/** An outline as data: what the page is for, its title, the line under it, and its bullets in order. */
export interface PageSketch {
  purpose: string;
  title: string;
  lede?: string | null;
  blocks: SketchBlock[];
}

/** What `sketchFromOutline` answers: the outline as data, or every line it could not read. */
export type SketchParse = { ok: true; sketch: PageSketch } | { ok: false; problems: string[] };

const PURPOSE_LINE = /^\**purpose:\**\s*(.*)$/i;
const TITLE_LINE = /^#\s+(.+)$/;
const HEADING_LINE = /^#+\s/;
const BULLET_LINE = /^([ \t]*)[-*]\s+(.*)$/;
const FENCE_LINE = /^```/;
/** The block word, optionally in bold, then what follows it. */
const BULLET_BODY = /^\*{0,2}([A-Za-z]+)\*{0,2}(.*)$/;
/** The separator between a bullet's words and its optional line: an em or en dash between spaces. */
const LINE_SEPARATOR = /\s+[—–]\s+/;

/** A run of leading whitespace as a width, a tab counting as two spaces. */
function widthOf(indent: string): number {
  return indent.replace(/\t/g, '  ').length;
}

/** `briefing`, `` `briefing` `` and `"briefing"` are one input name. */
function unquoted(words: string): string {
  return words.replace(/^[`"'*]+|[`"'*.]+$/g, '').trim();
}

/**
 * The outline the sketch designer wrote, read into a `PageSketch`.
 *
 * The grammar is the one the method's prompt teaches: a `Purpose:` line, a
 * `# ` title, optional plain lines under it (the lede), then bullets, one block
 * each, nesting by indentation. Indentation is read relative to the bullets
 * above it, so two spaces and four both work: a bullet indented further than
 * the one before is its child, and one indented less closes every bullet
 * deeper than itself. Blank lines and a Markdown code fence around the whole
 * outline are ignored, and so is anything before the title other than the
 * purpose. Anything else is a problem, named with its line number: the parse
 * never guesses, so a refusal shows what the model wrote.
 *
 * It checks the grammar only. Whether the blocks make a page - every input
 * placed once, one Run, a Step under Steps - is `sketchToSpec`'s to judge.
 */
export function sketchFromOutline(outline: string): SketchParse {
  const problems: string[] = [];
  let purpose = '';
  let title = '';
  const lede: string[] = [];
  const blocks: SketchBlock[] = [];
  /** The indentation widths of the open bullets, outermost first. */
  const widths: number[] = [];

  outline.split(/\r?\n/).forEach((raw, position) => {
    const number = position + 1;
    const line = raw.trimEnd();
    const bare = line.trim();
    if (bare === '' || FENCE_LINE.test(bare)) return;

    const bullet = BULLET_LINE.exec(line);
    if (bullet === null) {
      if (blocks.length > 0) {
        problems.push(`line ${number} is not a bullet, after the bullets began: "${bare}"`);
        return;
      }
      if (title === '') {
        const purposeMatch = PURPOSE_LINE.exec(bare);
        if (purposeMatch !== null) purpose = purposeMatch[1]!.trim();
        const titleMatch = TITLE_LINE.exec(bare);
        if (titleMatch !== null) title = titleMatch[1]!.trim();
        return;
      }
      if (HEADING_LINE.test(bare)) {
        problems.push(`line ${number} is a second heading; the page has one title: "${bare}"`);
        return;
      }
      lede.push(bare);
      return;
    }

    if (title === '') {
      problems.push(`line ${number} is a bullet before the title line`);
      return;
    }
    const width = widthOf(bullet[1]!);
    while (widths.length > 0 && width < widths[widths.length - 1]!) widths.pop();
    if (widths.length === 0 || width > widths[widths.length - 1]!) widths.push(width);

    const body = BULLET_BODY.exec(bullet[2]!.trim());
    const word = body?.[1];
    if (body === null || word === undefined || !Object.hasOwn(SKETCH_BLOCKS, word)) {
      const opening = bullet[2]!.trim().split(/\s/)[0];
      problems.push(
        `line ${number} starts with "${opening}", which is not a block the outline knows`,
      );
      return;
    }
    const block = word as SketchBlockName;
    const after = body[2]!.trim();
    if (after !== '' && after !== '.' && !after.startsWith(':')) {
      problems.push(`line ${number} has no colon after "${block}": "${bare}"`);
      return;
    }
    const rest = after.startsWith(':') ? after.slice(1).trim() : '';
    // A Text is one sentence, so a dash in it is part of it; every other block's
    // dash separates its words from its line.
    const [words = '', ...tail] = block === 'Text' ? [rest] : rest.split(LINE_SEPARATOR);
    const text = block === 'Field' ? unquoted(words) : words.trim();
    blocks.push({
      depth: widths.length - 1,
      block,
      ...(text === '' ? {} : { text }),
      ...(tail.length === 0 ? {} : { line: tail.join(' — ').trim() }),
    });
  });

  if (title === '') problems.push('the outline has no title line ("# …")');
  if (blocks.length === 0 && problems.length === 0) problems.push('the outline has no bullets');
  if (problems.length > 0) return { ok: false, problems };
  return {
    ok: true,
    sketch: { purpose, title, ...(lede.length === 0 ? {} : { lede: lede.join(' ') }), blocks },
  };
}

/** What an input holds, in the words a person filling the page would use. */
function kindWords(field: RunField): string {
  if (isNativeDateNode(field)) return 'a date, optionally with a time';
  if (isNativeHtmlNode(field)) return 'markup';
  if (isNativeCompositeNode(field)) return 'a composite value';
  switch (field.kind) {
    case 'text':
      return 'a short text';
    case 'prose':
      return 'a long text';
    case 'number':
      return field.integer ? 'a whole number' : 'a number';
    case 'boolean':
      return 'yes or no';
    case 'enum':
      return `one of ${field.options.map((option) => JSON.stringify(option)).join(', ')}`;
    case 'date':
      return field.datetime ? 'a date and time' : 'a date';
    case 'document':
      return 'a document (a file)';
    case 'image':
      return 'an image (a file)';
    case 'object':
      return `a group of ${field.fields.length} fields (${field.fields.map((child) => child.name).join(', ')})`;
    case 'list':
      return `a list, each item ${kindWords(field.item)}`;
    case 'unknown':
      return 'a value';
    default:
      return field satisfies never;
  }
}

/**
 * The brief for an input page: the method's name, what it does in its
 * author's words, what a run produces, and its top-level inputs. No path,
 * constraint or default travels: every input is placed whole with `Field`,
 * whose control owns all three.
 */
export function sketchBrief(
  subject: { name: string; about?: string; produces?: string },
  fields: readonly RunField[],
): SketchBrief {
  return {
    name: subject.name,
    ...(subject.about ? { about: subject.about } : {}),
    ...(subject.produces ? { produces: subject.produces } : {}),
    inputs: fields.map((field): SketchInput => ({
      name: field.name,
      ...(field.title && field.title !== field.name ? { title: field.title } : {}),
      kind: kindWords(field),
      required: field.required,
      ...(field.description ? { description: field.description } : {}),
    })),
  };
}

/** What `sketchToSpec` answers: a spec, or the reasons there is none. */
export type SketchAssembly = { ok: true; spec: Spec } | { ok: false; problems: string[] };

/** The blocks that hold other blocks. */
const HOLDERS = new Set<SketchBlockName>([
  'Section',
  'Side',
  'Row',
  'Fold',
  'Steps',
  'Step',
  'Tabs',
  'Tab',
]);
/** The blocks whose bullet must carry words after the colon. */
const WORDED = new Set<SketchBlockName>([
  'Section',
  'Side',
  'Fold',
  'Step',
  'Tab',
  'Text',
  'Field',
  'Run',
]);

interface Node {
  block: SketchBlockName;
  text: string;
  line: string;
  /** 1-based, as the outline numbers its bullets, for a problem to name. */
  index: number;
  children: Node[];
}

function trimmed(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function describeNode(node: Node): string {
  return `block ${node.index} (${node.block}${node.text ? ` "${node.text}"` : ''})`;
}

/** The outline's bullets as a tree, from their depths: a bullet one level deeper than the one before is its child. */
function treeOf(blocks: readonly SketchBlock[], problems: string[]): Node[] {
  const roots: Node[] = [];
  const open: Node[] = [];
  blocks.forEach((raw, position) => {
    const index = position + 1;
    const block = raw?.block;
    if (typeof block !== 'string' || !Object.hasOwn(SKETCH_BLOCKS, block)) {
      problems.push(
        `block ${index} is a "${String(block)}", which is not a block the outline knows`,
      );
      return;
    }
    const depth = Number.isInteger(raw.depth) && raw.depth >= 0 ? raw.depth : -1;
    if (depth < 0) {
      problems.push(`block ${index} (${block}) has no valid depth`);
      return;
    }
    if (depth > open.length) {
      problems.push(`block ${index} (${block}) is nested deeper than the block before it allows`);
      return;
    }
    const node: Node = {
      block,
      text: trimmed(raw.text),
      line: trimmed(raw.line),
      index,
      children: [],
    };
    open.length = depth;
    const parent = open[depth - 1];
    if (parent === undefined) roots.push(node);
    else if (!HOLDERS.has(parent.block)) {
      problems.push(
        `${describeNode(node)} is nested under ${describeNode(parent)}, which holds nothing`,
      );
      return;
    } else parent.children.push(node);
    open.push(node);
  });
  return roots;
}

/**
 * The tree with every Side the outline put in a Row moved to the margin. A
 * model that wants a panel beside some blocks reaches for a Row to put it
 * there, and a Side is already beside the whole page, so a Side in a Row has
 * one reading. A Row left holding one block gives way to that block. Only a
 * Side whose way up passes through Rows and Sections is moved: one in a Fold,
 * a Step or a Tab would leave what holds it, so it stays where it is, to be
 * refused as nested.
 */
function liftSides(roots: readonly Node[]): Node[] {
  const lifted: Node[] = [];
  const settle = (siblings: readonly Node[], liftable: boolean): Node[] =>
    siblings.flatMap((node) => {
      if (liftable && node.block === 'Row') {
        const sides = node.children.filter((child) => child.block === 'Side');
        if (sides.length > 0) {
          lifted.push(...sides);
          const kept = node.children.filter((child) => child.block !== 'Side');
          if (kept.length <= 1) return settle(kept, liftable);
          node.children = kept;
        }
      }
      node.children = settle(
        node.children,
        liftable && (node.block === 'Row' || node.block === 'Section'),
      );
      return [node];
    });
  return [...settle(roots, true), ...lifted];
}

function walk(
  nodes: readonly Node[],
  visit: (node: Node, parent: Node | undefined) => void,
  parent?: Node,
): void {
  for (const node of nodes) {
    visit(node, parent);
    walk(node.children, visit, node);
  }
}

/** Everything wrong with the tree that the outline's own rules forbid, before a spec is built. */
function treeProblems(
  roots: readonly Node[],
  fields: readonly RunField[],
  problems: string[],
): void {
  const inputs = new Map(fields.map((field) => [field.name, 0]));
  let runs = 0;
  walk(roots, (node, parent) => {
    if (WORDED.has(node.block) && node.text === '')
      problems.push(`${describeNode(node)} has no words`);
    if (HOLDERS.has(node.block) && node.children.length === 0) {
      problems.push(`${describeNode(node)} holds nothing`);
    }
    if (node.block === 'Side' && parent !== undefined) {
      problems.push(`${describeNode(node)} is nested; a Side sits at the margin`);
    }
    if ((node.block === 'Step' || node.block === 'Tab') && parent?.block !== `${node.block}s`) {
      problems.push(`${describeNode(node)} is not held by ${node.block}s`);
    }
    if (node.block === 'Steps' || node.block === 'Tabs') {
      const member = node.block.slice(0, -1);
      if (node.children.some((child) => child.block !== member)) {
        problems.push(`${describeNode(node)} holds something other than ${member} blocks`);
      } else if (node.children.length < 2) {
        problems.push(`${describeNode(node)} holds fewer than two ${member} blocks`);
      }
    }
    if (node.block === 'Field') {
      const seen = inputs.get(node.text);
      if (seen === undefined) problems.push(`${describeNode(node)} names no input of this method`);
      else inputs.set(node.text, seen + 1);
    }
    if (node.block === 'Run') runs += 1;
  });
  if (roots.filter((node) => node.block === 'Side').length > 1)
    problems.push('the outline has more than one Side');
  for (const [name, count] of inputs) {
    if (count === 0) problems.push(`the input "${name}" has no Field`);
    if (count > 1) problems.push(`the input "${name}" has ${count} Fields`);
  }
  if (runs !== 1) problems.push(`the outline has ${runs} Run blocks; it needs exactly one`);
  walk(roots, (node) => {
    if (node.block !== 'Steps') return;
    const earlier = node.children.slice(0, -1);
    const runsEarly = earlier.some((step) => {
      let found = false;
      walk(step.children, (inner) => {
        if (inner.block === 'Run') found = true;
      });
      return found;
    });
    if (runsEarly) problems.push(`${describeNode(node)} has its Run before the last step`);
  });
}

/** A key for an element, unique in the spec: the block's name, then a counter when it repeats. */
function keyMaker(): (base: string) => string {
  const used = new Map<string, number>();
  return (base) => {
    const slug =
      base
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'block';
    const count = (used.get(slug) ?? 0) + 1;
    used.set(slug, count);
    return count === 1 ? slug : `${slug}-${count}`;
  };
}

/**
 * The spec an outline describes, over the method's own fields, or why there is
 * none. A malformed outline is refused with every problem named rather than
 * repaired: the bench learns what the model got wrong, and the host falls back
 * to the plain form as it does for any refused layout. A Side held by a Row is
 * read, not repaired: it is the page's panel, and it moves to the margin.
 *
 * The page is a vertical column: the title (a `Hero`, the one h1), then the
 * blocks at the margin. A `Side` turns it into a `Workspace`: the other
 * blocks in the work column, the `Side` as the sticky panel beside it, which
 * is also where the kernel paints a run's result - under the work.
 */
export function sketchToSpec(sketch: PageSketch, fields: readonly RunField[]): SketchAssembly {
  const problems: string[] = [];
  const title = trimmed(sketch?.title);
  if (title === '') problems.push('the outline has no title');
  const blocks = Array.isArray(sketch?.blocks) ? sketch.blocks : [];
  if (blocks.length === 0) problems.push('the outline has no blocks');
  const roots = liftSides(treeOf(blocks, problems));
  treeProblems(roots, fields, problems);
  if (problems.length > 0) return { ok: false, problems };

  const elements: Record<string, UIElement> = {};
  const keyFor = keyMaker();
  const add = (key: string, element: UIElement): string => {
    elements[key] = element;
    return key;
  };

  const build = (node: Node): string => {
    const children = (): string[] => node.children.map(build);
    const words = node.text;
    // In the outline a line continues its bullet after a dash, so the model
    // often starts it in lower case; on the page it stands as its own sentence.
    const line = node.line ? node.line.charAt(0).toUpperCase() + node.line.slice(1) : undefined;
    switch (node.block) {
      case 'Section':
        return add(keyFor(`section-${words}`), {
          type: 'Section',
          props: { title: words, ...(line ? { lede: line } : {}) },
          children: children(),
        });
      case 'Side':
        return add(keyFor('side'), { type: 'Rail', props: { title: words }, children: children() });
      case 'Row':
        return add(keyFor('row'), {
          type: 'Grid',
          props: { columns: Math.min(node.children.length, 4), gap: 'lg' },
          children: children(),
        });
      case 'Fold':
        return add(keyFor(`fold-${words}`), {
          type: 'Collapsible',
          props: { title: words, ...(line ? { description: line } : {}), defaultOpen: false },
          children: children(),
        });
      case 'Steps':
        return add(keyFor('steps'), {
          type: 'Steps',
          props: { steps: node.children.map((step) => step.text) },
          children: children(),
        });
      case 'Tabs':
        return add(keyFor('tabs'), {
          type: 'Tabs',
          props: {
            tabs: node.children.map((tab, position) => ({
              label: tab.text,
              value: `tab-${position + 1}`,
            })),
          },
          children: children(),
        });
      case 'Step':
      case 'Tab':
        return add(keyFor(`${node.block}-${words}`), {
          type: 'Stack',
          props: { direction: 'vertical', gap: 'lg' },
          children: children(),
        });
      case 'Text':
        return add(keyFor('text'), {
          type: 'Text',
          props: { text: words, variant: 'muted' },
          children: [],
        });
      case 'Field':
        return add(keyFor(`field-${words}`), {
          type: 'MthdsField',
          props: { path: joinPath(INPUTS_ROOT, words) },
          children: [],
        });
      case 'Run':
        return add(keyFor('run'), {
          type: 'Cta',
          props: { label: words, ...(line ? { hint: line } : {}) },
          on: { press: [{ action: 'validateForm' }, { action: 'run' }] },
          children: [],
        });
      default:
        return node.block satisfies never;
    }
  };

  const lede = trimmed(sketch.lede);
  const hero = add('hero', {
    type: 'Hero',
    props: { headline: title, ...(lede ? { lede } : {}) },
    children: [],
  });
  const side = roots.find((node) => node.block === 'Side');
  const work = roots.filter((node) => node !== side).map(build);
  let body: string[];
  if (side) {
    const column = add('work', {
      type: 'Stack',
      props: { direction: 'vertical', gap: 'xl' },
      children: work,
    });
    const panel = build(side);
    body = [
      add('workspace', { type: 'Workspace', props: { rail: 'right' }, children: [column, panel] }),
    ];
  } else {
    body = work;
  }
  add('page', {
    type: 'Stack',
    props: { direction: 'vertical', gap: 'xl' },
    children: [hero, ...body],
  });
  return { ok: true, spec: { root: 'page', elements } };
}
