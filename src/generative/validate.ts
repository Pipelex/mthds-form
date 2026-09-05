import type { Spec } from '@json-render/core';
import { validateSpec } from '@json-render/core';
import type { z } from 'zod';
import { catalog as defaultCatalog } from './catalog';
import { INPUTS_ROOT, RESULT_ROOT } from './paths';
import { hasOwnProp } from '../core/own-property';

/**
 * Whether a spec is one this catalog can render - the check every source
 * passes, whoever wrote it.
 *
 * Three layers, because json-render's own `catalog.validate()` covers only the
 * first two once a catalog has more than one component: it checks the element
 * TYPE against the component names, but `propsOf` degrades to "any record"
 * when several definitions could apply, so a misspelt or invented prop passes.
 * The per-component prop check is therefore this module's, and it has to be
 * expression-aware: a bound prop's raw value is `{ "$state": "/path" }`, which
 * the component's own zod schema (`z.string()`) would reject, so a dynamic
 * expression is accepted wherever the prop EXISTS and a literal is parsed
 * against the prop's schema.
 *
 * The checks are the same whichever catalog a spec was written against; the
 * catalog is a parameter, this entry's own by default, so a host that defines
 * a vocabulary of its own is validated by the same code and not by a copy of
 * it.
 */

/** What the validator reads off a catalog: its names and its definitions. */
export interface ValidationCatalog {
  componentNames: readonly string[];
  /** The catalog's own action names. A `defineCatalog` result carries this already. */
  actionNames?: readonly string[];
  data: unknown;
  /** The schema the catalog was defined against, for the actions its runtime handles without a handler. */
  schema?: { builtInActions?: readonly { name: string }[] };
}

export interface SpecProblem {
  elementKey?: string;
  message: string;
}

export interface SpecVerdict {
  ok: boolean;
  problems: SpecProblem[];
}

const EXPRESSION_KEYS = [
  '$state',
  '$item',
  '$index',
  '$bindState',
  '$bindItem',
  '$cond',
  '$computed',
  '$template',
];

/** The two escape hatches: their `path` is resolved by the layer, so it is never an expression. */
const HATCHES = new Set(['MthdsField', 'MthdsResult']);

function isExpression(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).some((key) => EXPRESSION_KEYS.includes(key))
  );
}

/**
 * The closed vocabularies a prop can be declared with, unwrapped through the
 * `.optional()` / `.nullable()` most of them carry.
 *
 * An expression-valued prop skips the literal check below, which is right for a
 * value the host supplies at render - but not for a prop whose whole meaning is
 * that it is one of a fixed set. A `{ "$template": "script" }` carries no
 * interpolation, so json-render resolves it to the literal string `script`,
 * and a renderer that trusted the prop's declared union turned that into a DOM
 * tag name. A closed vocabulary has no dynamic form: if the value is not one of
 * the names, no expression can make it one.
 */
function isClosedVocabulary(schema: z.ZodType): boolean {
  let current: unknown = schema;
  for (let depth = 0; depth < 8; depth += 1) {
    const def = (current as { def?: { type?: string; innerType?: unknown } }).def;
    if (!def) return false;
    if (def.type === 'enum' || def.type === 'literal') return true;
    if (def.innerType === undefined) return false;
    current = def.innerType;
  }
  return false;
}

/** The catalog's definition of one component, or nothing for a type it does not have. */
function definitionOf(
  catalog: ValidationCatalog,
  type: string,
): { props?: unknown; events?: unknown } | undefined {
  const components = (catalog.data as { components: Record<string, { props?: unknown }> })
    .components;
  // `hasOwnProp`, because the type is model-written and a prototype key would
  // find a function where a definition belongs.
  return hasOwnProp(components, type) ? components[type] : undefined;
}

/** The zod object each component's props are declared with, by component name. */
function propsSchemaOf(catalog: ValidationCatalog, type: string): z.ZodObject | undefined {
  const props = definitionOf(catalog, type)?.props;
  return props && typeof props === 'object' && 'shape' in props
    ? (props as z.ZodObject)
    : undefined;
}

/**
 * The events a component's renderer emits, as its definition declares them -
 * an empty list for a component that emits nothing. `undefined` only for a
 * type the catalog does not have, which section 2 reports on its own.
 */
function eventsOf(catalog: ValidationCatalog, type: string): readonly string[] | undefined {
  const definition = definitionOf(catalog, type);
  if (!definition) return undefined;
  return Array.isArray(definition.events)
    ? definition.events.filter((event): event is string => typeof event === 'string')
    : [];
}

/**
 * The deepest element chain this entry judges.
 *
 * Every walk below recurses, json-render's `validateSpec` included, so a deep
 * enough chain overflows the stack inside the gate: a chain of a thousand
 * elements validates in about no time, six thousand throws. The stack limit is
 * a property of the engine and not of the layout, so without a cap the same
 * stored bytes can pass under node and fail in a browser - and a stored artifact
 * deserves one verdict wherever it is checked. The number is far past any page
 * a person reads and far short of where any engine's stack gives out.
 */
const MAX_ELEMENT_DEPTH = 512;

function childKeysOf(spec: Spec, key: string): string[] {
  const element = spec.elements[key] as { children?: unknown; slots?: unknown } | null | undefined;
  if (!element) return [];
  const children = Array.isArray(element.children) ? (element.children as string[]) : [];
  const slots =
    typeof element.slots === 'object' && element.slots !== null
      ? Object.values(element.slots as Record<string, unknown>).flatMap((slot) =>
          Array.isArray(slot) ? (slot as string[]) : [],
        )
      : [];
  return [...children, ...slots].filter((child) => typeof child === 'string');
}

/**
 * The longest chain of elements in the spec, measured without recursing.
 *
 * Iterative on purpose: a check whose whole job is to catch a walk that
 * overflows must not be able to overflow itself. Post-order with a memo, so it
 * is linear in the tree rather than in its paths, and a back edge is ignored
 * for depth - a cycle is section 1b's to report, not this one's.
 */
function deepestChain(spec: Spec): number {
  const below = new Map<string, number>();
  const onPath = new Set<string>();
  let deepest = 0;
  for (const start of Object.keys(spec.elements)) {
    if (below.has(start)) continue;
    const stack: string[] = [start];
    while (stack.length > 0) {
      const key = stack[stack.length - 1] as string;
      if (below.has(key)) {
        onPath.delete(key);
        stack.pop();
        continue;
      }
      const children = childKeysOf(spec, key).filter((child) => !onPath.has(child));
      const pending = children.filter((child) => !below.has(child));
      if (pending.length > 0) {
        onPath.add(key);
        stack.push(...pending);
        continue;
      }
      below.set(
        key,
        children.reduce((tallest, child) => Math.max(tallest, below.get(child) ?? 0), 0) + 1,
      );
      onPath.delete(key);
      stack.pop();
    }
    deepest = Math.max(deepest, below.get(start) ?? 0);
  }
  return deepest;
}

/**
 * Whether a spec is one this catalog can render.
 *
 * The checks live in `checkAgainstCatalog`; this is the boundary that keeps the
 * documented promise around them - it answers with problems, not exceptions.
 * That promise was not kept: `validateSpec` throws on `repeat: null`, on
 * `children: 5`, on `props: 5`, on a null element and on a missing `elements`
 * map, all of which a model can emit. A host calls this to decide whether it is
 * safe to render, so a throw leaves it with no verdict at the one moment it
 * needs one, and the fallback to the plain form never fires.
 */
export function validateAgainstCatalog(
  spec: Spec,
  catalog: ValidationCatalog = defaultCatalog,
): SpecVerdict {
  try {
    return checkAgainstCatalog(spec, catalog);
  } catch (error) {
    return {
      ok: false,
      problems: [{ message: `the layout is not a well-formed spec: ${String(error)}` }],
    };
  }
}

function checkAgainstCatalog(spec: Spec, catalog: ValidationCatalog): SpecVerdict {
  const problems: SpecProblem[] = [];

  // 0. Depth, before anything that recurses - including json-render's own walk.
  const depth = deepestChain(spec);
  if (depth > MAX_ELEMENT_DEPTH) {
    return {
      ok: false,
      problems: [
        {
          message: `the element tree is ${depth} deep; this entry renders at most ${MAX_ELEMENT_DEPTH}.`,
        },
      ],
    };
  }

  // 1. Structure: root, children, misplaced fields, and the elements the root
  //    never reaches. json-render reports an orphan at `warning` severity, so
  //    forwarding errors alone made `checkOrphans` a flag with no effect on the
  //    verdict - while `stream.ts` deliberately keeps an unreachable element in
  //    the JSONL "so a validator can report it". An orphan is a branch of the
  //    page the model wrote and never attached: it renders as nothing at all,
  //    which is exactly the silent half-page the fallback exists for.
  const structure = validateSpec(spec, { checkOrphans: true });
  for (const issue of structure.issues) {
    if (issue.severity === 'error' || issue.code === 'orphaned_element') {
      problems.push({ elementKey: issue.elementKey, message: issue.message });
    }
  }

  // 1b. No element is its own ancestor.
  //
  //     json-render's `validateSpec` guards its OWN walks against a cycle but
  //     reports nothing about one, so `children: ["self"]` passes it in silence.
  //     What follows is not silent: the renderer walks children to paint the
  //     page and recurses until the stack goes. Catching it here is what makes
  //     the fallback fire instead, and it is the reason `repeatBasePathOf` also
  //     carries a `seen` guard of its own - the two predicates are exported
  //     separately, so neither may assume the other ran first.
  const cyclic = new Set<string>();
  const state = new Map<string, 'open' | 'done'>();
  const descend = (key: string): void => {
    const mark = state.get(key);
    if (mark === 'done') return;
    if (mark === 'open') {
      cyclic.add(key);
      return;
    }
    state.set(key, 'open');
    const element = spec.elements[key];
    for (const child of element?.children ?? []) descend(child);
    for (const slot of Object.values(element?.slots ?? {}))
      for (const child of slot) descend(child);
    state.set(key, 'done');
  };
  for (const key of Object.keys(spec.elements)) descend(key);
  for (const key of cyclic) {
    problems.push({
      elementKey: key,
      message: `"${key}" is its own descendant: an element tree may not contain a cycle.`,
    });
  }

  // 2. Every type is in the catalog.
  const known = new Set(catalog.componentNames);
  for (const [key, element] of Object.entries(spec.elements)) {
    if (!known.has(element.type)) {
      problems.push({ elementKey: key, message: `unknown component type "${element.type}"` });
    }
  }

  // 3. Every prop exists on its component, and every literal parses.
  for (const [key, element] of Object.entries(spec.elements)) {
    const schema = propsSchemaOf(catalog, element.type);
    if (!schema) continue;
    const shape = schema.shape as Record<string, z.ZodType>;
    const props = (element.props ?? {}) as Record<string, unknown>;
    for (const [name, value] of Object.entries(props)) {
      const propSchema = shape[name];
      if (!propSchema) {
        problems.push({
          elementKey: key,
          message: `${element.type} has no prop "${name}" (known: ${Object.keys(shape).join(', ')})`,
        });
        continue;
      }
      if (isExpression(value)) {
        if (HATCHES.has(element.type) && name === 'path') {
          problems.push({
            elementKey: key,
            message: `${element.type}.path must be a literal string - absolute, or the item's field name inside a repeat - never an expression.`,
          });
        } else if (isClosedVocabulary(propSchema)) {
          problems.push({
            elementKey: key,
            message: `${element.type}.${name} is one of a fixed set of names, so it must be written as a literal, never as an expression.`,
          });
        }
        continue;
      }
      const parsed = propSchema.safeParse(value);
      if (!parsed.success) {
        problems.push({
          elementKey: key,
          message: `${element.type}.${name}: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`,
        });
      }
    }
    // A required prop that is absent. Optional ones are `.nullable()` in the
    // shadcn definitions, so "required" here means neither optional nor nullable.
    for (const [name, propSchema] of Object.entries(shape)) {
      if (name in props) continue;
      if (propSchema.safeParse(undefined).success || propSchema.safeParse(null).success) continue;
      problems.push({
        elementKey: key,
        message: `${element.type} is missing required prop "${name}"`,
      });
    }
  }

  // 4. A panelled container has one child per panel, in order. The renderer
  //    would silently show fewer panels than tabs, or a step with nothing in
  //    it; the validator says so instead.
  for (const [key, element] of Object.entries(spec.elements)) {
    const props = (element.props ?? {}) as Record<string, unknown>;
    const panels =
      element.type === 'Tabs'
        ? (props.tabs as unknown[] | undefined)?.length
        : element.type === 'Steps'
          ? (props.steps as unknown[] | undefined)?.length
          : undefined;
    if (panels === undefined) continue;
    const children = element.children?.length ?? 0;
    if (children !== panels) {
      problems.push({
        elementKey: key,
        message: `${element.type} declares ${panels} panel${panels === 1 ? '' : 's'} but has ${children} child${children === 1 ? '' : 'ren'}: exactly one child per ${element.type === 'Tabs' ? 'tab' : 'step'}, in order.`,
      });
    }
    if (element.type === 'Steps' || element.type === 'Tabs') {
      const runs = (element.children ?? []).filter(
        (child) => spec.elements[child]?.type === 'Button',
      );
      if (runs.length > 0) {
        problems.push({
          elementKey: key,
          message: `${element.type} has a Button as a direct child; a panel is a container (a Stack), and the Button belongs inside the last one.`,
        });
      }
    }
  }
  // 5. Heading levels increase by one, in render order. The Storybook a11y
  //    gate runs axe's `heading-order` at error, and a page that jumps from
  //    h1 to h3 fails it; saying so here makes it a rejected spec with a
  //    re-run rather than a failing story with a fixture nobody may edit.
  const levels: { key: string; level: number }[] = [];
  const seen = new Set<string>();
  const walk = (key: string) => {
    if (seen.has(key)) return;
    seen.add(key);
    const element = spec.elements[key];
    if (!element) return;
    if (element.type === 'Heading') {
      const level = String((element.props as { level?: unknown }).level ?? 'h2');
      const match = /^h([1-4])$/.exec(level);
      if (match) levels.push({ key, level: Number(match[1]) });
    }
    for (const child of element.children ?? []) walk(child);
    for (const slot of Object.values(element.slots ?? {})) for (const child of slot) walk(child);
  };
  if (spec.root) walk(spec.root);
  // The first heading sets the page's level, as axe reads it; every one after
  // it may go deeper by one at most.
  let previous: number | undefined;
  for (const heading of levels) {
    if (previous !== undefined && heading.level > previous + 1) {
      problems.push({
        elementKey: heading.key,
        message: `Heading jumps to h${heading.level} after h${previous}: levels increase by one, never by more.`,
      });
    }
    previous = heading.level;
  }

  // 6. A container that takes a fixed number of children, and would drop the
  //    rest in silence: its renderer destructures the ones it lays out and
  //    paints nothing for a third. The product rules state the count for a
  //    Workspace, and this is where a layout is held to it. `hasOwnProp`,
  //    because the type is model-written and a prototype key would find a
  //    function.
  const CHILD_COUNTS: Record<string, { count: number; roles: string }> = {
    Split: { count: 2, roles: 'left, right' },
    Workspace: { count: 2, roles: 'work, rail' },
  };
  for (const [key, element] of Object.entries(spec.elements)) {
    const rule = hasOwnProp(CHILD_COUNTS, element.type) ? CHILD_COUNTS[element.type] : undefined;
    if (!rule) continue;
    const children = element.children?.length ?? 0;
    if (children !== rule.count) {
      problems.push({
        elementKey: key,
        message: `${element.type} takes exactly ${rule.count} children (${rule.roles}); this one has ${children}.`,
      });
    }
  }

  // 7. The `on` field, which nothing looked at before.
  //
  //    `props` was checked exhaustively while the other half of what a layout
  //    can say went unread, and the failures that hid there are ends of the
  //    same gap. An action name the catalog does not have is accepted, so a
  //    `Cta` bound to a misspelt `run` renders a page that validates, fits,
  //    and whose only button does nothing - with no fallback, because both
  //    checks said yes. An EVENT name the component never emits is the same
  //    dead button by the other door: a `Cta` emits `press` and nothing else,
  //    so `on.click` bound to a perfectly good `run` fires never, and the
  //    action check alone waved it through. And json-render's runtime applies
  //    `setState` to whatever `statePath` it is handed, so a layout could write
  //    a value the person never saw into `/inputs` and have it leave in the run
  //    payload. That is rule 1 inverted: a layout names a path, and the two
  //    trees the descriptor owns are the host's to fill - `/inputs` from the
  //    person through the controls and `seedInputs`, `/result` from the run.
  //    Scratch state of the layout's own, at any other path, stays its business.
  //
  //    The write ban covers EVERY destination an action writes, not the one
  //    parameter that happens to be named `statePath` on the obvious three:
  //    `validateForm` writes its verdict at its own `statePath`, and
  //    `pushState` clears a second path, `clearStatePath`, after it appends.
  //    Both went unread, and either put a value into `/inputs` through an
  //    action the ban never looked at. And the runtime's pointer parser treats
  //    `inputs/city` exactly as `/inputs/city` - a missing leading slash is
  //    supplied, never refused - so a destination is judged with the slash the
  //    runtime will give it, not the one the model wrote.
  //
  //    The name check needs a catalog that declares its actions. Both fields are
  //    optional on `ValidationCatalog` and a `defineCatalog` result carries
  //    both, so this entry's catalog is always checked - but a host that hands
  //    in a vocabulary of its own without them gets the write ban and no
  //    unknown-action verdict, rather than every action refused for want of a
  //    list to check against.
  //
  //    And a binding does not only sit under `on`. A `watch` fires its
  //    bindings when the state at its key changes, with no event and no
  //    person in between; and any binding may carry an `onSuccess` and an
  //    `onError`, which the runtime applies after the handler returns or
  //    throws: a `set` there writes each key straight into the state with
  //    no handler between, and an `action` there is a binding of its own,
  //    run through the same executor. Every one of those is a door into
  //    `/inputs` that the walk over `on` never saw, so a binding is checked
  //    wherever it sits, and a chain is followed as far as it goes.
  const declared = [
    ...(catalog.actionNames ?? []),
    ...(catalog.schema?.builtInActions ?? []).map((action) => action.name),
  ];
  const knownActions = declared.length > 0 ? new Set(declared) : undefined;
  // Every parameter each state-writing action writes to. A destination the
  // runtime falls back on when the parameter is absent (`validateForm` writes
  // `/formValidation`; `pushState` clears nothing) is not the layout's to name,
  // so those are `optional`; the others are refused when they are not a literal.
  const STATE_WRITES: Record<string, readonly { param: string; optional?: boolean }[]> = {
    setState: [{ param: 'statePath' }],
    pushState: [{ param: 'statePath' }, { param: 'clearStatePath', optional: true }],
    removeState: [{ param: 'statePath' }],
    validateForm: [{ param: 'statePath', optional: true }],
  };
  const OWNED_ROOTS = [INPUTS_ROOT, RESULT_ROOT];
  /** The owned root a destination lands in, judged with the leading slash the runtime supplies. */
  const ownedRootOf = (written: string): string | undefined => {
    const statePath = written.startsWith('/') ? written : `/${written}`;
    return OWNED_ROOTS.find((root) => statePath === root || statePath.startsWith(`${root}/`));
  };
  const bindingsOf = (binding: unknown): unknown[] =>
    Array.isArray(binding) ? binding : [binding];
  const refusal = (owned: string, statePath: string): string =>
    `a layout may not write into ${owned}, which the host fills. Bind the value with { "$bindState": "${statePath}" } or delegate it with MthdsField instead.`;

  /**
   * One binding, wherever it sits - under `on.<event>`, under `watch.<path>`,
   * or as the `onSuccess` or `onError` of another - held to the name check,
   * the write ban, and then to its own callbacks. `site` is the spelling a
   * problem names the binding by.
   */
  const checkBinding = (key: string, site: string, entry: unknown): void => {
    const action = (entry as { action?: unknown } | null)?.action;
    if (typeof action !== 'string') {
      problems.push({ elementKey: key, message: `${site} has an entry with no "action" name.` });
      return;
    }
    if (knownActions && !knownActions.has(action)) {
      problems.push({
        elementKey: key,
        message: `${site} names the unknown action "${action}" (known: ${[...knownActions].join(', ')}); nothing would handle it.`,
      });
      return;
    }
    // `hasOwnProp`: the action is model-written, and `constructor` would
    // find a function where a list of destinations belongs.
    const writes = hasOwnProp(STATE_WRITES, action) ? STATE_WRITES[action] : undefined;
    if (writes) {
      const params = (entry as { params?: unknown }).params;
      for (const { param, optional } of writes) {
        const written =
          typeof params === 'object' && params !== null
            ? (params as Record<string, unknown>)[param]
            : undefined;
        if (written === undefined || written === null) {
          if (!optional) {
            problems.push({
              elementKey: key,
              message: `${site} calls ${action} without a literal "${param}".`,
            });
          }
          continue;
        }
        if (typeof written !== 'string') {
          problems.push({
            elementKey: key,
            message: `${site} calls ${action} with a "${param}" that is not a literal string; where an action writes must be named, never computed.`,
          });
          continue;
        }
        const owned = ownedRootOf(written);
        if (owned) {
          const where = param === 'statePath' ? `on "${written}"` : `with ${param} "${written}"`;
          problems.push({
            elementKey: key,
            message: `${site} calls ${action} ${where}: ${refusal(owned, written.startsWith('/') ? written : `/${written}`)}`,
          });
        }
      }
    }
    // What the runtime does once the handler has returned or thrown. A `set`
    // writes each of its keys straight into the state, with no handler in
    // between; an `action` is a binding of its own, run through the same
    // executor, so it is checked as one - callbacks included.
    for (const hook of ['onSuccess', 'onError'] as const) {
      const follow = (entry as Record<string, unknown>)[hook];
      if (follow === undefined || follow === null) continue;
      const hookSite = `${site}.${hook}`;
      if (typeof follow !== 'object' || Array.isArray(follow)) {
        problems.push({
          elementKey: key,
          message: `${hookSite} must be an object: a { "set" } of state paths to values, or an { "action" } binding.`,
        });
        continue;
      }
      const record = follow as Record<string, unknown>;
      if (record.set !== undefined && record.set !== null) {
        if (typeof record.set !== 'object' || Array.isArray(record.set)) {
          problems.push({
            elementKey: key,
            message: `${hookSite}.set must be an object mapping a state path to its value.`,
          });
        } else {
          for (const written of Object.keys(record.set as Record<string, unknown>)) {
            const owned = ownedRootOf(written);
            if (owned) {
              problems.push({
                elementKey: key,
                message: `${hookSite} sets "${written}": ${refusal(owned, written.startsWith('/') ? written : `/${written}`)}`,
              });
            }
          }
        }
      }
      if (record.action !== undefined) checkBinding(key, hookSite, record);
    }
  };

  for (const [key, element] of Object.entries(spec.elements)) {
    const on = (element as { on?: unknown }).on;
    if (on !== undefined && on !== null) {
      if (typeof on !== 'object' || Array.isArray(on)) {
        problems.push({
          elementKey: key,
          message: '"on" must be an object mapping an event name to its actions.',
        });
      } else {
        const emitted = eventsOf(catalog, element.type);
        for (const [event, binding] of Object.entries(on as Record<string, unknown>)) {
          if (emitted && !emitted.includes(event)) {
            problems.push({
              elementKey: key,
              message:
                emitted.length > 0
                  ? `on.${event}: ${element.type} never emits "${event}" (it emits: ${emitted.join(', ')}), so nothing bound there would ever fire.`
                  : `on.${event}: ${element.type} emits no events, so nothing bound there would ever fire.`,
            });
          }
          for (const entry of bindingsOf(binding)) checkBinding(key, `on.${event}`, entry);
        }
      }
    }
    // A watch has no event to check against a definition: its key is the
    // state path whose change fires it. Its bindings are held to everything
    // else.
    const watch = (element as { watch?: unknown }).watch;
    if (watch !== undefined && watch !== null) {
      if (typeof watch !== 'object' || Array.isArray(watch)) {
        problems.push({
          elementKey: key,
          message:
            '"watch" must be an object mapping a state path to the actions its change fires.',
        });
      } else {
        for (const [path, binding] of Object.entries(watch as Record<string, unknown>)) {
          for (const entry of bindingsOf(binding)) checkBinding(key, `watch.${path}`, entry);
        }
      }
    }
  }

  return { ok: problems.length === 0, problems };
}

/** The problems as one block, for a failing test or a repair prompt. */
export function formatProblems(problems: readonly SpecProblem[]): string {
  return problems
    .map((problem) =>
      problem.elementKey ? `[${problem.elementKey}] ${problem.message}` : problem.message,
    )
    .join('\n');
}
