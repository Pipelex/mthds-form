import type { RunField } from '../core';
import { isNativeCompositeNode, isNativeDateNode, isNativeHtmlNode } from '../core/native-content';
import { INPUTS_ROOT, RESULT_ROOT, joinPath } from './paths';

/**
 * The brief: the model's view of the descriptor, as Markdown.
 *
 * Rule 1, restated for a model. The model's input is the DESCRIPTOR, never JSON
 * Schema: it receives the kinds, the labels, the descriptions, the choices, the
 * presence and what gates the run - rendered from `RunField[]` here, and from
 * nowhere else. On the result side it also receives one real run's loaded
 * state, so it can judge magnitudes, but it never sees the wire: the state it
 * reads is what `payloadToState` produced, with the envelopes already gone.
 *
 * Pure, no React, and the only place the descriptor is rendered for a model.
 * What a path is marked as (delegated or not) is decided here too, so the
 * projection, the brief and the validator agree on which paths the kernel
 * renders.
 */

/**
 * The component that runs the page, named in the Run section so the brief and
 * the catalog agree on which one it is. A rename in the catalog does not have
 * to be caught here: a brief asking for a component the catalog no longer has
 * produces a layout the validator refuses, loudly, on the pass that made it.
 */
const RUN_COMPONENT = 'Cta';

export interface BriefSubject {
  /** `results.nested_result`. */
  pipeRef: string;
  /** The pipe's description, when the wire carries one. */
  description?: string;
  /**
   * The method's name as a host lists it - an authored method's, since a host
   * has one for every method it lists; absent on a synthesized carrier, which
   * no host lists. The brief hands it to the layout as the one product name
   * the page may carry, because the brand catalog's AppBar asks for a name
   * and a brief that gives none gets one invented.
   */
  name?: string;
}

/** On the input side, the kinds the catalog's inputs cannot enter. */
export function isDelegatedInput(field: RunField): boolean {
  return (
    field.kind === 'document' ||
    field.kind === 'image' ||
    field.kind === 'date' ||
    field.kind === 'list' ||
    field.kind === 'unknown'
  );
}

/** On the result side, the kinds and concepts the catalog cannot show. */
export function isDelegatedResult(field: RunField): boolean {
  if (isNativeHtmlNode(field) || isNativeDateNode(field) || isNativeCompositeNode(field)) {
    return true;
  }
  return (
    field.kind === 'document' ||
    field.kind === 'image' ||
    field.kind === 'date' ||
    field.kind === 'prose' ||
    field.kind === 'unknown'
  );
}

function kindLabel(field: RunField): string {
  if (isNativeHtmlNode(field)) return 'markup (native.Html)';
  if (isNativeDateNode(field)) return 'date (native.Date)';
  if (isNativeCompositeNode(field)) return 'composite (native.Composite)';
  switch (field.kind) {
    case 'text':
      return 'text';
    case 'prose':
      return 'prose (markdown)';
    case 'number':
      return field.integer ? 'integer' : 'number';
    case 'boolean':
      return 'boolean';
    case 'enum':
      return `choice of ${field.options.map((option) => JSON.stringify(option)).join(' | ')}`;
    case 'date':
      return field.datetime ? 'date with time' : 'date';
    case 'document':
      return 'document (a file)';
    case 'image':
      return 'image (a file)';
    case 'object':
      return `structure${field.conceptRef ? ` ${field.conceptRef}` : ''}`;
    case 'list':
      return `list of ${kindLabel(field.item)}`;
    case 'unknown':
      return 'unknown';
    default:
      return field satisfies never;
  }
}

function labelOf(field: RunField): string {
  return field.title && field.title !== field.name
    ? `${field.title} (\`${field.name}\`)`
    : `\`${field.name}\``;
}

function constraints(field: RunField): string[] {
  const notes: string[] = [];
  if (field.kind === 'number') {
    if (field.min !== undefined) notes.push(`min ${field.min}`);
    if (field.max !== undefined) notes.push(`max ${field.max}`);
  }
  if (field.kind === 'text' || field.kind === 'prose') {
    if (field.minLength !== undefined) notes.push(`at least ${field.minLength} characters`);
    if (field.maxLength !== undefined) notes.push(`at most ${field.maxLength} characters`);
    if (field.format) notes.push(`format ${field.format}`);
  }
  if (field.kind === 'list') {
    if (field.itemCount !== undefined) notes.push(`at least ${field.itemCount} items`);
    if (field.maxItemCount !== undefined) notes.push(`at most ${field.maxItemCount} items`);
  }
  if (field.defaultValue !== undefined) notes.push(`default ${JSON.stringify(field.defaultValue)}`);
  if (field.examples && field.examples.length > 0) {
    notes.push(`examples ${field.examples.map((example) => JSON.stringify(example)).join(', ')}`);
  }
  if (field.hints && Object.keys(field.hints).length > 0) {
    notes.push(
      `hints ${Object.entries(field.hints)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')}`,
    );
  }
  return notes;
}

interface Line {
  depth: number;
  text: string;
}

function describe(
  field: RunField,
  path: string,
  depth: number,
  side: 'input' | 'result',
  lines: Line[],
): void {
  const delegated = side === 'input' ? isDelegatedInput(field) : isDelegatedResult(field);
  const parts: string[] = [`\`${path}\` — ${kindLabel(field)}`];
  if (side === 'input') {
    parts.push(field.required ? 'required' : 'optional');
    if (field.gating) parts.push('gates the run');
  }
  const head = parts.join(', ');
  const tail = [labelOf(field), field.description ?? ''].filter(Boolean).join(': ');
  const notes = constraints(field);
  const delegation = delegated
    ? ` **[delegate: ${side === 'input' ? 'MthdsField' : 'MthdsResult'}]**`
    : '';
  lines.push({
    depth,
    text: `${head} — ${tail}${notes.length > 0 ? ` (${notes.join('; ')})` : ''}${delegation}`,
  });

  if (delegated) return;
  if (field.kind === 'object') {
    for (const child of field.fields) {
      describe(child, joinPath(path, child.name), depth + 1, side, lines);
    }
  }
  if (field.kind === 'list' && side === 'result') {
    const item = field.item;
    if (item.kind === 'object' && !isDelegatedResult(item)) {
      lines.push({
        depth: depth + 1,
        text: `each item is a ${kindLabel(item)}${item.description ? ` (${item.description})` : ''}, with these members (paths relative to one item, for DataTable columns or $item):`,
      });
      for (const child of item.fields) {
        describeRelative(child, child.name, depth + 2, lines);
      }
    } else {
      lines.push({ depth: depth + 1, text: `each item is a ${kindLabel(item)}` });
    }
  }
}

function describeRelative(
  field: RunField,
  relativePath: string,
  depth: number,
  lines: Line[],
): void {
  const notes = constraints(field);
  lines.push({
    depth,
    text: `\`${relativePath}\` — ${kindLabel(field)} — ${[labelOf(field), field.description ?? ''].filter(Boolean).join(': ')}${notes.length > 0 ? ` (${notes.join('; ')})` : ''}${isDelegatedResult(field) ? ' (a DataTable prints it as text; delegate the whole list to MthdsResult to render it properly)' : ''}`,
  });
  if (field.kind === 'object') {
    for (const child of field.fields)
      describeRelative(child, joinPath(relativePath, child.name), depth + 1, lines);
  }
  if (field.kind === 'list' && field.item.kind === 'object') {
    lines.push({ depth: depth + 1, text: `each item is a ${kindLabel(field.item)}, with:` });
    for (const child of field.item.fields) {
      describeRelative(child, joinPath(relativePath, '<i>', child.name), depth + 2, lines);
    }
  }
}

function render(lines: readonly Line[]): string {
  return lines.map((line) => `${'  '.repeat(line.depth)}- ${line.text}`).join('\n');
}

function collectDelegated(
  fields: readonly RunField[],
  root: string,
  side: 'input' | 'result',
): string[] {
  const out: string[] = [];
  const walk = (field: RunField, path: string) => {
    const delegated = side === 'input' ? isDelegatedInput(field) : isDelegatedResult(field);
    if (delegated) {
      out.push(`\`${path}\` (${kindLabel(field)})`);
      return;
    }
    if (field.kind === 'object') {
      for (const child of field.fields) walk(child, joinPath(path, child.name));
    }
  };
  for (const field of fields) walk(field, joinPath(root, field.name));
  return out;
}

function collectDefaults(fields: readonly RunField[], root: string): string[] {
  const out: string[] = [];
  const walk = (field: RunField, path: string) => {
    if (field.defaultValue !== undefined) {
      out.push(`\`${path}\` = ${JSON.stringify(field.defaultValue)}`);
      return;
    }
    if (field.kind === 'object') {
      for (const child of field.fields) walk(child, joinPath(path, child.name));
    }
  };
  for (const field of fields) walk(field, joinPath(root, field.name));
  return out;
}

/** The brief for an INPUT page: the form a run is started from. */
export function renderInputBrief(subject: BriefSubject, fields: readonly RunField[]): string {
  const lines: Line[] = [];
  for (const field of fields) describe(field, joinPath(INPUTS_ROOT, field.name), 0, 'input', lines);
  const delegated = collectDelegated(fields, INPUTS_ROOT, 'input');
  const defaults = collectDefaults(fields, INPUTS_ROOT);
  const gating = fields.filter((field) => field.gating).map((field) => `\`${field.name}\``);

  return [
    `# Input page: ${subject.pipeRef}`,
    '',
    subject.description ?? 'A method with the inputs below.',
    '',
    ...(subject.name
      ? [
          '## Name',
          '',
          `The method is called «${subject.name}», as the host lists it. That is the app's name wherever the layout asks for one; invent no other. Links, if the layout carries any, name this page's own sections. The page states nothing the method does not: no promise about storage, privacy, speed, or what happens after the run.`,
          '',
        ]
      : []),
    '## State',
    '',
    `The form's values live under \`${INPUTS_ROOT}\`, one member per input, exactly as listed. Bind each input with \`$bindState\` at its path; a structure's members bind at their own paths beneath it.`,
    '',
    render(lines),
    '',
    '## Delegated',
    '',
    delegated.length > 0
      ? `Render these with \`MthdsField\` at the path, and nothing else:\n\n${delegated.map((entry) => `- ${entry}`).join('\n')}`
      : "None: every input can be entered with the catalog's own inputs. `MthdsField` remains available for any you would rather not style.",
    '',
    '## Defaults',
    '',
    defaults.length > 0
      ? `Seed these, and only these, with \`/state\` patches (\`{"op":"add","path":"/state/inputs/...","value":...}\`):\n\n${defaults.map((entry) => `- ${entry}`).join('\n')}`
      : 'None. Emit no `/state` patches.',
    '',
    '## Run',
    '',
    gating.length > 0
      ? `The run waits for ${gating.join(', ')}; say so near the ${RUN_COMPONENT}, briefly.`
      : 'Nothing gates the run.',
    `The page has exactly one \`${RUN_COMPONENT}\`, \`on.press\` bound to \`validateForm\` then \`run\`; label it with what the method does, in a person's words.`,
    '',
  ].join('\n');
}

/** The brief for a RESULT page: what one run produced, laid out. */
export function renderResultBrief(subject: BriefSubject, field: RunField, state: unknown): string {
  const lines: Line[] = [];
  const delegatedWhole = isDelegatedResult(field);
  if (field.kind === 'object' && !delegatedWhole) {
    lines.push({
      depth: 0,
      text: `\`${RESULT_ROOT}\` — ${kindLabel(field)}${field.description ? `: ${field.description}` : ''}`,
    });
    for (const child of field.fields) {
      describe(child, joinPath(RESULT_ROOT, child.name), 1, 'result', lines);
    }
  } else {
    describe(field, RESULT_ROOT, 0, 'result', lines);
  }
  const delegated =
    field.kind === 'object' && !delegatedWhole
      ? collectDelegated(field.fields, RESULT_ROOT, 'result')
      : delegatedWhole
        ? [`\`${RESULT_ROOT}\` (${kindLabel(field)})`]
        : [];

  return [
    `# Result page: ${subject.pipeRef}`,
    '',
    subject.description ?? 'The result of a method, described below.',
    '',
    '## State',
    '',
    `The host loads the run's result under \`${RESULT_ROOT}\` before the page renders. Read every value with \`$state\`; emit no \`/state\` patches. Paths:`,
    '',
    render(lines),
    '',
    '## Delegated',
    '',
    delegated.length > 0
      ? `Render these with \`MthdsResult\` at the path - they are kinds the catalog cannot show properly:\n\n${delegated.map((entry) => `- ${entry}`).join('\n')}`
      : 'None. `MthdsResult` remains available for any structure you choose not to lay out.',
    '',
    '## One real run, as loaded',
    '',
    'The state of one actual run, so you can judge magnitudes and lengths. Bind to the paths; do not copy these values into the spec.',
    '',
    '```json',
    JSON.stringify(state, null, 2),
    '```',
    '',
  ].join('\n');
}
