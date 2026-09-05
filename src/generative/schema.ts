import { defineSchema, type PromptContext } from '@json-render/core';
import { APP_DIRECTION, SEED_PROCEDURE } from './direction';

/**
 * Our own json-render schema: the React schema's SHAPE and built-in actions,
 * verbatim, with our own rules and our own prompt.
 *
 * Why not `@json-render/react`'s `schema` with `customRules` appended: its
 * prompt is written for a model that INVENTS data. The template carries an
 * "INITIAL STATE" section saying in capitals that /state patches are required
 * for every bound path, and its default rules ask three times for realistic
 * sample data. A rule appended at position twenty argues with a CRITICAL above
 * it and loses. This layer's posture is the opposite - every value is bound to
 * a path the HOST loads - so the prompt is composed here, from the same
 * building blocks (the component list is rendered with the package's own
 * `formatZodType`), the design direction and the seed procedure are its own
 * sections (`direction.ts`), and the sample-data rules never reach the model.
 *
 * The spec shape is unchanged because the renderer, the stream compiler and the
 * validator read it, and because a spec written against it renders through any
 * json-render registry.
 */
export const generativeSchema = defineSchema(
  (s) => ({
    spec: s.object({
      root: s.string(),
      elements: s.record(
        s.object({
          type: s.ref('catalog.components'),
          props: s.propsOf('catalog.components'),
          children: s.array(s.string()),
          slots: { ...s.record(s.array(s.string())), ...s.optional() },
          visible: { ...s.any(), ...s.optional() },
          repeat: { ...s.any(), ...s.optional() },
        }),
      ),
    }),
    catalog: s.object({
      components: s.map({
        props: s.zod(),
        slots: s.array(s.string()),
        description: s.string(),
        example: s.any(),
      }),
      actions: s.map({
        params: s.zod(),
        description: s.string(),
      }),
    }),
  }),
  {
    // The runtime handles these four without a registry handler; the names and
    // the wording are the React schema's, so a model that has seen json-render
    // before recognises them.
    builtInActions: [
      {
        name: 'setState',
        description:
          'Update a value in the state model at the given statePath. Params: { statePath: string, value: any }',
      },
      {
        name: 'pushState',
        description:
          'Append an item to an array in state. Params: { statePath: string, value: any, clearStatePath?: string }.',
      },
      {
        name: 'removeState',
        description:
          'Remove an item from an array in state by index. Params: { statePath: string, index: number }',
      },
      {
        name: 'validateForm',
        description:
          'Validate all registered form fields and write the result to state. Params: { statePath?: string }. Defaults to /formValidation.',
      },
    ],
    // The React schema's integrity and placement rules, kept; its three
    // sample-data rules, dropped.
    defaultRules: [
      'INTEGRITY: every key in every "children" array must be emitted as its own element. A missing child makes that whole branch of the page invisible. After emitting the tree, walk it from the root and emit any element you referenced but did not define.',
      'Every element is {"type", "props", "children"}; "children" is an array of element keys, empty for a leaf. "visible", "repeat" and "on" are fields of the ELEMENT, never of "props".',
      'ONLY use component types from the AVAILABLE COMPONENTS list. Use unique, descriptive element keys ("header", "total-metric", "lines-table").',
      'Group content in containers and title sections with Heading. Use Grid for values that read side by side and Stack for a column.',
    ],
    promptTemplate: renderPrompt,
  },
);

/**
 * The prompt, section by section. Same vocabulary and section order as
 * json-render's default so a model's priors apply; different content where
 * the posture differs.
 */
function renderPrompt(context: PromptContext): string {
  const { catalog, componentNames, actionNames, options, formatZodType } = context;
  const data = catalog as {
    components?: Record<
      string,
      { props?: unknown; slots?: string[]; events?: string[]; description?: string }
    >;
    actions?: Record<string, { description?: string }>;
  };
  const lines: string[] = [];

  lines.push(
    options.system ??
      'You are a product designer with taste. You lay out ONE page for a method - its inputs, or its result - as a JSON spec over a fixed catalog of components, bound to state the host provides. The page must read as a small, purpose-built web app, never as a form.',
  );
  lines.push('');
  lines.push('OUTPUT FORMAT (JSONL, RFC 6902 JSON Patch):');
  lines.push(
    'Output ONLY JSONL: one JSON object per line, no prose, no markdown, no code fences. Each line is a patch operation building the spec.',
  );
  lines.push(
    'First set /root, then add each element under /elements/<key>, parents before children, so the page fills in progressively as it streams.',
  );
  lines.push('');
  lines.push('Example output (each line is a separate JSON object):');
  lines.push('');
  lines.push(
    [
      JSON.stringify({ op: 'add', path: '/root', value: 'page' }),
      JSON.stringify({
        op: 'add',
        path: '/elements/page',
        value: {
          type: 'Stack',
          props: { direction: 'vertical', gap: 'lg' },
          children: ['title', 'total'],
        },
      }),
      JSON.stringify({
        op: 'add',
        path: '/elements/title',
        value: { type: 'Heading', props: { text: { $state: '/result/reference' } }, children: [] },
      }),
      JSON.stringify({
        op: 'add',
        path: '/elements/total',
        value: {
          type: 'Metric',
          props: { label: 'Total', value: { $state: '/result/total' }, format: 'decimal' },
          children: [],
        },
      }),
    ].join('\n'),
  );
  lines.push('');
  lines.push('STATE:');
  lines.push(
    'The host owns the state. The brief you are given lists every path in it, with its kind and meaning. Read a value with { "$state": "/path" }; bind an input two-way with { "$bindState": "/path" }. Inside a repeated element, read the current item with { "$item": "field" } and bind with { "$bindItem": "field" }.',
  );
  lines.push(
    'Do NOT invent data. On a result page, never emit /state patches: the host loads /result. On an input page, /state patches are for the listed defaults only.',
  );
  lines.push('');
  lines.push('DYNAMIC LISTS (repeat field):');
  lines.push(
    'An element with a top-level "repeat": { "statePath": "/path/to/array", "key": "<id field>" } renders its children once per array item. For an array held on the enclosing item, use "repeat": { "statePath": { "$item": "field" } } - valid only inside another repeat. "repeat" is a field of the element, not of "props".',
  );
  lines.push(
    'A DataTable is the simpler way to show a list of structures: bind its rows once and name the columns. Use repeat when each item deserves its own card.',
  );
  lines.push('');
  lines.push('DYNAMIC PROPS:');
  lines.push(
    '1. Read-only value: { "$state": "/path" }. 2. Two-way input binding: { "$bindState": "/path" } on value/checked. 3. Conditional: { "$cond": <condition>, "$then": <value>, "$else": <value> }, where a condition is { "$state": "/path" } (truthy), with optional "eq", "neq", "gt", "gte", "lt", "lte" or "not": true. 4. Template: { "$template": "Invoice ${/result/reference}" } interpolates state paths; inside a repeat, bare names read the item.',
  );
  lines.push('');
  lines.push('DESIGN DIRECTION:');
  for (const paragraph of APP_DIRECTION) lines.push(`- ${paragraph}`);
  lines.push('');
  lines.push(`AVAILABLE COMPONENTS (${componentNames.length}):`);
  lines.push('');
  for (const name of componentNames) {
    const def = data.components?.[name];
    if (!def) continue;
    const propsStr = def.props ? formatZodType(def.props as never) : '{}';
    const slots = def.slots ?? [];
    const acceptsChildren = slots.includes('default');
    const named = slots.filter((slot) => slot !== 'default');
    const slotsStr = [
      acceptsChildren ? 'accepts children' : '',
      named.length > 0 ? `slots: ${named.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('; ');
    const events = def.events && def.events.length > 0 ? ` [events: ${def.events.join(', ')}]` : '';
    const description = def.description ? ` - ${def.description}` : '';
    lines.push(`- ${name}: ${propsStr}${description}${slotsStr ? ` [${slotsStr}]` : ''}${events}`);
  }
  lines.push('');
  lines.push('AVAILABLE ACTIONS:');
  lines.push('');
  for (const action of generativeSchema.builtInActions ?? []) {
    lines.push(`- ${action.name}: ${action.description} [built-in]`);
  }
  for (const name of actionNames) {
    const def = data.actions?.[name];
    lines.push(`- ${name}${def?.description ? `: ${def.description}` : ''}`);
  }
  lines.push('');
  lines.push('EVENTS (the `on` field):');
  lines.push(
    'Bind an event to actions with a top-level "on" field on the element: "on": { "press": [{ "action": "validateForm" }, { "action": "run" }] }. A single binding may be an object instead of an array. Never put actions inside "props".',
  );
  lines.push('');
  lines.push('VISIBILITY (the `visible` field):');
  lines.push(
    'A top-level "visible" field hides an element unless its condition holds: "visible": { "$state": "/result/paid", "eq": true }. Conditions take exactly one of eq/neq/gt/gte/lt/lte, or "not": true; an array of conditions is an AND; { "$or": [...] } is an OR.',
  );
  lines.push('');
  lines.push('RULES:');
  const rules = [...(generativeSchema.defaultRules ?? []), ...(options.customRules ?? [])];
  rules.forEach((rule, index) => lines.push(`${index + 1}. ${rule}`));
  lines.push('');
  lines.push('CREATIVE SEED:');
  for (const paragraph of SEED_PROCEDURE) lines.push(paragraph);
  return lines.join('\n');
}
