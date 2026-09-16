import type { Spec } from '@json-render/core';
import type { RunField, RunFieldKind } from '../core';
import { hasOwnProp } from '../core/own-property';
import { catalog } from './catalog';
import {
  INPUTS_ROOT,
  RESULT_ROOT,
  absoluteHatchPath,
  inputFieldAtPath,
  joinPath,
  parentMapOf,
  repeatBasePathOf,
  repeatListPathOf,
  resultFieldAtPath,
} from './paths';

/**
 * Whether a stored layout still fits the descriptor it will be rendered over.
 *
 * A layout is produced once per method version and stored; a descriptor is
 * derived from the method every time it is read. Those two can part company -
 * a method's input is renamed, a structure loses a member - and when they do,
 * a delegated path resolves to nothing and a bound path writes into a corner of
 * the state the run never reads. Neither fails loudly on its own, so the host
 * asks this before it renders and falls back to the kernel's own form when the
 * answer is no.
 *
 * Two directions, and the second is the one a corpus cannot notice. The first
 * is staleness: every path the layout MENTIONS is a path the descriptor still
 * has, which is the corpus test's check lifted out of the test and into the
 * product. The second is coverage: every path the descriptor REQUIRES is one
 * the layout offers somewhere. A layout that simply omits an input is not
 * stale and validates perfectly - it renders a page with no field for a
 * required input, the run gate then refuses the run for that input, and the
 * person has nowhere to type it. A page you cannot complete is worse than the
 * plain form, which is what the fallback is for.
 *
 * It answers with problems, not exceptions, and that is a promise rather than
 * a habit: a host calls this to decide whether it is safe to render, so a
 * throw leaves it with no verdict at the one moment it needs one. A layout is
 * model-produced and may be malformed in ways the walk below trips on
 * (`children: 5`, a null element, no `elements` map at all), and the other
 * gate, which refuses those shapes outright, is exported separately - so
 * neither may assume the other ran first.
 *
 * A third check sits between the two and is about KIND rather than presence:
 * a path a layout shows as a value must be a scalar, and a path it reads into
 * a prop that takes a list must be a list. A `SummaryRow` whose `value` reads
 * `/inputs/document`, a structure of a url and a filename, is not stale - the
 * path exists - and it validates perfectly; it renders `[object Object]`,
 * because the renderer stringifies what it is handed and nothing anywhere said
 * the path was not a value. An `AppBar` whose `links` read that same structure
 * is the mirror image: its renderer maps over what it is handed, renders
 * nothing for a structure and throws for a text. Only the descriptor knows
 * what kind a path is, so this is where that is said.
 *
 * What is NOT checked here is whether the layout validates against the catalog
 * - that is `validateAgainstCatalog`, and a host runs both.
 */

export interface LayoutDescriptor {
  /** The input page's top-level fields, for `/inputs/...` paths. */
  inputs?: readonly RunField[];
  /** The result page's descriptor, for `/result/...` paths. */
  result?: RunField;
}

/** Whether `path` is `root` itself or lies under it. */
function isUnder(root: string, path: string): boolean {
  return path === root || path.startsWith(`${root}/`);
}

/**
 * Every state path the layout mentions, sorted by what it does with it.
 *
 * `bound` is what it WRITES: `{ "$bindState": "/path" }`, and inside a repeat
 * `{ "$bindItem": "field" }`, which binds a member of the current item. `read`
 * is the rest. A binding is not the only way a layout names a path: the prompt
 * teaches `{ "$state": "/path" }` for a read-only value, `$cond` for a
 * condition (whose own condition object is a `$state`, so the same walk finds
 * it), `{ "$template": "Total ${/result/amount}" }` for an interpolation, a
 * top-level `visible` condition on the ELEMENT rather than in its props - which
 * is why `element.visible` is walked here beside `element.props` - and, inside
 * a repeat, `{ "$item": "field" }` for a member of the current item.
 *
 * Missing any of these was not cosmetic. A read that has gone stale renders a
 * placeholder where a value belongs; a stale `visible` condition compares
 * against nothing, never holds, and hides its element for good - so a section
 * carrying a required input silently never appears, while the coverage half
 * below still counts that input as offered because the binding is right there
 * in the props of an element nobody can see.
 *
 * The two item forms are RELATIVE, and json-render resolves them against the
 * item of the nearest repeat above the element: `$item: "name"` inside a
 * repeat over `/result/lines` reads `/result/lines/<i>/name`. They are resolved
 * here the way a relative hatch path is - through `repeatBasePathOf`, at the
 * first index, since every index resolves to the same descriptor node - so a
 * renamed member of a repeated item is the same stale path as a renamed input,
 * and a `$bindItem` under `/result` is the same forbidden write as a
 * `$bindState` there. One outside any repeat resolves to nothing at all; the
 * runtime warns and renders nothing, and `adrift` names the element so the
 * gate can say so.
 *
 * A `repeat` is a read too, and it is resolved separately (`staleRepeats`)
 * because a relative one names its list through the repeat above it.
 */
interface Mentioned {
  bound: string[];
  read: string[];
  /** The elements that read or bind the current item with no repeat above them. */
  adrift: string[];
}

/**
 * The absolute path an item-relative field of one element resolves to, or
 * nothing outside any repeat. Resolved lazily: most elements sit in no repeat
 * and mention no item.
 */
function itemPathResolver(
  spec: Spec,
  key: string,
  parents: Map<string, string>,
): (field: string) => string | undefined {
  let base: string | undefined;
  let resolvedBase = false;
  return (field) => {
    if (!resolvedBase) {
      base = repeatBasePathOf(spec, key, parents);
      resolvedBase = true;
    }
    if (base === undefined) return undefined;
    // The runtime joins the field under the item's own path, and reads
    // `""` (or `"/"`) as the item itself.
    const under = field.startsWith('/') ? field.slice(1) : field;
    return under === '' ? base : `${base}/${under}`;
  };
}

/**
 * The paths a template interpolates, resolved the way json-render resolves
 * them: `${/result/amount}` is absolute and read as written; a bare
 * `${amount}` is read off the item of the nearest repeat above the element,
 * and outside any repeat off the root of the state, as `/amount`. Inside a
 * repeat the runtime falls back to the root when the item has no such member,
 * but a layout that writes `${name}` in a repeat means the item's `name`, so
 * it is read as one here and a member the item has lost is stale rather than
 * quietly a root path. The pattern is json-render's own - one or more
 * characters - so an empty `${}` is the literal text it renders as, not an
 * interpolation of nothing.
 */
function interpolatedPaths(
  template: string,
  itemPath: (field: string) => string | undefined,
): string[] {
  return [...template.matchAll(/\$\{([^}]+)\}/g)].flatMap((match) => {
    const raw = match[1];
    if (raw === undefined) return [];
    if (raw.startsWith('/')) return [raw];
    return [itemPath(raw) ?? `/${raw}`];
  });
}

function mentionedPaths(spec: Spec, parents: Map<string, string>): Mentioned {
  const found: Mentioned = { bound: [], read: [], adrift: [] };
  for (const [key, element] of Object.entries(spec.elements)) {
    const itemPath = itemPathResolver(spec, key, parents);
    const walk = (value: unknown): void => {
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }
      if (typeof value !== 'object' || value === null) return;
      const record = value as Record<string, unknown>;
      if (typeof record.$bindState === 'string') found.bound.push(record.$bindState);
      if (typeof record.$state === 'string') found.read.push(record.$state);
      if (typeof record.$template === 'string') {
        found.read.push(...interpolatedPaths(record.$template, itemPath));
      }
      if (typeof record.$bindItem === 'string') {
        const path = itemPath(record.$bindItem);
        if (path === undefined) found.adrift.push(key);
        else found.bound.push(path);
      }
      if (typeof record.$item === 'string') {
        const path = itemPath(record.$item);
        if (path === undefined) found.adrift.push(key);
        else found.read.push(path);
      }
      Object.values(record).forEach(walk);
    };
    walk(element.props);
    walk(element.visible);
  }
  return found;
}

/**
 * The read paths this descriptor answers for, deduplicated.
 *
 * Only paths under the root in question: a layout may hold scratch state of its
 * own (a `$state` an element writes and reads back), and that is its business,
 * not the descriptor's. What the descriptor owns is `/inputs` on an input page
 * and `/result` on a result one, and a path under either that no longer
 * resolves is the staleness this predicate exists to catch. One line per path,
 * however many elements mention it.
 */
function staleReads(
  read: readonly string[],
  root: string,
  resolves: (path: string) => boolean,
): string[] {
  const under = read.filter((path) => isUnder(root, path));
  return [...new Set(under)].filter((path) => !resolves(path));
}

/**
 * The repeats whose list the descriptor no longer has.
 *
 * A repeat over a list the method has renamed renders nothing at all, and
 * nothing else notices: on a result page there is no coverage to miss it, and
 * on an input page an optional list is asked for by nobody. A required one was
 * caught, by the coverage half and for the wrong reason. The list is resolved
 * the way a hatch inside the repeat resolves its own path - through the chain
 * of repeats above it - and, as with every read, only under the root the
 * descriptor owns: a repeat over the layout's own scratch state is its
 * business.
 */
function staleRepeats(
  spec: Spec,
  parents: Map<string, string>,
  root: string,
  resolves: (path: string) => boolean,
  side: 'input' | 'result',
): string[] {
  const problems: string[] = [];
  for (const [key, element] of Object.entries(spec.elements)) {
    if (!element.repeat) continue;
    const listPath = repeatListPathOf(spec, key, parents);
    if (listPath === undefined || !isUnder(root, listPath)) continue;
    if (!resolves(listPath)) {
      problems.push(`${key}: repeats over ${listPath}, which no ${side} has`);
    }
  }
  return problems;
}

/**
 * What a path of each kind is, in the words of the refusal, for the kinds a
 * value cannot be. A scalar - text, prose, a date, a number, a boolean, a
 * choice - is left out, and so is `unknown`, which the descriptor cannot
 * speak for.
 */
const NOT_A_VALUE: Partial<Record<RunFieldKind, { what: string; instead: string }>> = {
  object: { what: 'a structure', instead: 'a structure is shown through its members' },
  list: { what: 'a list', instead: 'a list is laid out as a repeat or a DataTable' },
  document: { what: 'a file', instead: "a file is delegated to the kernel's own control" },
  image: { what: 'a file', instead: "a file is delegated to the kernel's own control" },
};

/**
 * What the items of a list-taking prop may be: values alone, for a prop
 * declared as an array of strings or numbers (an `AppBar`'s links), or
 * anything, for one declared over structures or left open (a `DataTable`'s
 * rows). What a list of the wrong item kind is, in the words of the refusal,
 * is `NOT_VALUES`: a `Steps` handed a list of structures for its step names
 * renders `[object Object]` per step, and a renderer that maps a structure
 * into a React child throws.
 */
type ListItems = 'values' | 'anything';
const NOT_VALUES: Partial<Record<RunFieldKind, string>> = {
  object: 'structures',
  list: 'lists',
  document: 'files',
  image: 'files',
};

/**
 * The props that take a list rather than a value, by component, and what their
 * items may be: every prop the catalog declares as an array, read from the
 * schemas so a new one is never a missing entry here, plus the rows a
 * `DataTable` lays out, declared `any` because their shape is the
 * descriptor's. A `$state` read into one of these must be the list it wants;
 * into any other prop it is shown as a value.
 */
let listPropsCache: Map<string, Map<string, ListItems>> | undefined;
function listProps(): Map<string, Map<string, ListItems>> {
  if (listPropsCache) return listPropsCache;
  const found = new Map<string, Map<string, ListItems>>([
    ['DataTable', new Map([['rows', 'anything']])],
  ]);
  const components = catalog.data.components as Record<string, { props?: unknown }>;
  for (const [type, definition] of Object.entries(components)) {
    const shape = (definition.props as { shape?: Record<string, unknown> } | undefined)?.shape;
    for (const [prop, schema] of Object.entries(shape ?? {})) {
      const items = listItemsOf(schema);
      if (items === undefined) continue;
      if (!found.has(type)) found.set(type, new Map());
      found.get(type)!.set(prop, items);
    }
  }
  listPropsCache = found;
  return found;
}

/** The zod schemas whose values a list-taking prop can render as they are. */
const VALUE_SCHEMAS = new Set(['string', 'number', 'boolean', 'enum', 'literal']);

/** A zod definition, under the `.nullable()` / `.optional()` / `.default()` most props carry. */
function unwrapped(schema: unknown): { type?: string; element?: unknown } | undefined {
  let current: unknown = schema;
  for (let depth = 0; depth < 8; depth += 1) {
    const def = (current as { def?: { type?: string; innerType?: unknown; element?: unknown } })
      .def;
    if (!def) return undefined;
    if (def.innerType === undefined) return def;
    current = def.innerType;
  }
  return undefined;
}

/** What a prop declared as an array takes as its items, or nothing for a prop that is not one. */
function listItemsOf(schema: unknown): ListItems | undefined {
  const def = unwrapped(schema);
  if (def?.type !== 'array') return undefined;
  const element = unwrapped(def.element);
  return element?.type !== undefined && VALUE_SCHEMAS.has(element.type) ? 'values' : 'anything';
}

/**
 * The reads that show a path of the wrong kind as a value, or read one of the
 * wrong kind into a prop that takes a list.
 *
 * A read sits in one of two places. In a CONDITION - the object under a
 * `$cond`, or the element's own `visible` - it asks whether a value is set,
 * and any path may be asked; the `visible` field is not walked here at all.
 * Anywhere else in a prop it is shown: the renderer receives what the path
 * holds and stringifies it, and for a structure, a list or a file that is
 * `[object Object]`, a comma-joined list or a url where a name belongs. Every
 * form that shows a value is held to it - `$state`, the item-relative `$item`
 * resolved through the repeat above it, and every interpolation of a
 * `$template`, which stringifies what it interpolates, resolved the same way.
 *
 * A prop that takes a list is held the other way round. Written as one
 * expression, it reads a whole list, and the path must be one: a renderer
 * maps over what it is handed, so a structure or a file there renders nothing
 * and a text throws, and a list of structures where the prop takes values is
 * `[object Object]` per item or a throw, both past every gate. Written as an
 * array literal, each entry is a value and is walked as one. A path the
 * descriptor does not have is not repeated here: the staleness check names it.
 */
function nonScalarReads(
  spec: Spec,
  parents: Map<string, string>,
  root: string,
  fieldAt: (path: string) => RunField | undefined,
): string[] {
  const problems: string[] = [];
  const lists = listProps();
  for (const [key, element] of Object.entries(spec.elements)) {
    const itemPath = itemPathResolver(spec, key, parents);
    const listy = lists.get(element.type);
    const check = (prop: string, path: string): void => {
      if (!isUnder(root, path)) return;
      const field = fieldAt(path);
      if (!field) return;
      const wrong = hasOwnProp(NOT_A_VALUE, field.kind) ? NOT_A_VALUE[field.kind] : undefined;
      if (!wrong) return;
      problems.push(
        `${key}: ${prop} shows ${path}, which is ${wrong.what} and not a value; a prop that shows a value takes a scalar path, and ${wrong.instead}`,
      );
    };
    const checkList = (prop: string, path: string, items: ListItems): void => {
      if (!isUnder(root, path)) return;
      const field = fieldAt(path);
      if (!field || field.kind === 'unknown') return;
      if (field.kind !== 'list') {
        const what = hasOwnProp(NOT_A_VALUE, field.kind)
          ? NOT_A_VALUE[field.kind]!.what
          : 'a value';
        problems.push(
          `${key}: ${prop} takes a list, and ${path} is ${what}; a prop that takes a list reads a list path`,
        );
        return;
      }
      if (items !== 'values') return;
      const of = hasOwnProp(NOT_VALUES, field.item.kind) ? NOT_VALUES[field.item.kind] : undefined;
      if (!of) return;
      problems.push(
        `${key}: ${prop} takes a list of values, and ${path} is a list of ${of}; a list of ${of} is laid out as a repeat or a DataTable`,
      );
    };
    const walk = (prop: string, value: unknown): void => {
      if (Array.isArray(value)) {
        value.forEach((entry) => walk(prop, entry));
        return;
      }
      if (typeof value !== 'object' || value === null) return;
      const record = value as Record<string, unknown>;
      if (typeof record.$state === 'string') check(prop, record.$state);
      if (typeof record.$item === 'string') {
        const path = itemPath(record.$item);
        if (path !== undefined) check(prop, path);
      }
      if (typeof record.$template === 'string') {
        for (const path of interpolatedPaths(record.$template, itemPath)) check(prop, path);
      }
      for (const [name, entry] of Object.entries(record)) {
        if (name !== '$cond') walk(prop, entry);
      }
    };
    for (const [prop, value] of Object.entries(element.props ?? {})) {
      const items = listy?.get(prop);
      if (items === undefined || Array.isArray(value)) {
        walk(prop, value);
        continue;
      }
      if (typeof value !== 'object' || value === null) continue;
      const record = value as Record<string, unknown>;
      if (typeof record.$state === 'string') checkList(prop, record.$state, items);
      if (typeof record.$item === 'string') {
        const path = itemPath(record.$item);
        if (path !== undefined) checkList(prop, path, items);
      }
    }
  }
  return problems;
}

/**
 * The bound paths a layout may not write, under one rule for both pages - the
 * rule the read side above and the validator's `setState` check already apply.
 * `/inputs` is the person's: on an input page a binding there must name an
 * input the descriptor has, and a result page, which writes nothing, may not
 * bind there at all. `/result` is the run's, and no page may bind into it.
 * Anything else is the layout's own scratch state - a `Switch` bound to
 * `/ui/showDetails` is the natural way to drive a `visible` condition - and it
 * is left alone, as a read of it is.
 */
function boundProblems(
  bound: readonly string[],
  inputs: readonly RunField[] | undefined,
): string[] {
  const problems: string[] = [];
  const underInputs = bound.filter((path) => isUnder(INPUTS_ROOT, path));
  if (!inputs) {
    if (underInputs.length > 0) {
      problems.push(`a result page binds ${underInputs.join(', ')}; a result page writes nothing`);
    }
  } else {
    for (const path of underInputs) {
      if (!inputFieldAtPath(inputs, path)) {
        problems.push(`${path} is bound, and no input has it`);
      }
    }
  }
  for (const path of bound) {
    if (isUnder(RESULT_ROOT, path)) {
      problems.push(
        `${path} is bound; a layout may not write into ${RESULT_ROOT}, which the run fills`,
      );
    }
  }
  return problems;
}

/** The list path of every `repeat` in the spec: how a layout lays a list out. */
function repeatPaths(spec: Spec): string[] {
  const found: string[] = [];
  for (const element of Object.values(spec.elements)) {
    const statePath = element.repeat?.statePath;
    if (typeof statePath === 'string') found.push(statePath);
  }
  return found;
}

/**
 * Where a person can enter this path: bound to a control, laid out as a
 * repeat, or delegated to the kernel's own control at this path or at any
 * ancestor of it - an `MthdsField` on a structure renders the whole subtree.
 */
function isOffered(path: string, offered: Offered): boolean {
  if (offered.bound.has(path) || offered.repeated.has(path)) return true;
  return offered.delegated.some((at) => path === at || path.startsWith(`${at}/`));
}

interface Offered {
  bound: Set<string>;
  repeated: Set<string>;
  delegated: string[];
}

/**
 * The required paths under `field` that the layout offers nowhere.
 *
 * A structure is covered by covering what it requires, so a layout may leave
 * out an optional member and still fit; a list is covered whole, by a repeat
 * or by delegation, because its items are the layout's business and not this
 * predicate's.
 */
function uncoveredUnder(field: RunField, path: string, offered: Offered): string[] {
  if (isOffered(path, offered)) return [];
  if (field.kind === 'object') {
    return field.fields
      .filter((child) => child.required)
      .flatMap((child) => uncoveredUnder(child, joinPath(path, child.name), offered));
  }
  return [path];
}

/**
 * Every way this layout no longer fits, in the words a host can count by:
 * one line per element or path, empty when it fits.
 *
 * The checks live in `collectLayoutProblems`; this is the boundary that keeps
 * the promise in the header around them. A malformed spec is one line, naming
 * what the walk tripped on, which is a verdict the fallback can act on where a
 * throw was not.
 */
export function layoutProblems(descriptor: LayoutDescriptor, spec: Spec): string[] {
  try {
    return collectLayoutProblems(descriptor, spec);
  } catch (error) {
    return [`the layout is not a well-formed spec: ${String(error)}`];
  }
}

function collectLayoutProblems(descriptor: LayoutDescriptor, spec: Spec): string[] {
  const problems: string[] = [];
  const delegated: string[] = [];
  const parents = parentMapOf(spec);

  for (const [key, element] of Object.entries(spec.elements)) {
    const written = (element.props as { path?: unknown } | undefined)?.path;
    const path =
      typeof written === 'string' ? absoluteHatchPath(spec, key, written, parents) : undefined;
    if (element.type === 'MthdsField') {
      if (!path || !inputFieldAtPath(descriptor.inputs ?? [], path)) {
        problems.push(`${key}: MthdsField delegates ${String(written)}, which no input has`);
      } else {
        delegated.push(path);
      }
    }
    if (element.type === 'MthdsResult') {
      if (!path || !descriptor.result || !resultFieldAtPath(descriptor.result, path)) {
        problems.push(`${key}: MthdsResult delegates ${String(written)}, which no result has`);
      }
    }
  }

  const { bound, read, adrift } = mentionedPaths(spec, parents);
  for (const key of new Set(adrift)) {
    problems.push(`${key}: reads the current item, and no repeat above it has one`);
  }
  problems.push(...boundProblems(bound, descriptor.inputs));

  if (!descriptor.inputs) {
    const result = descriptor.result;
    const fieldAt = (path: string): RunField | undefined =>
      result ? resultFieldAtPath(result, path) : undefined;
    const resolves = (path: string): boolean => fieldAt(path) !== undefined;
    problems.push(...staleRepeats(spec, parents, RESULT_ROOT, resolves, 'result'));
    for (const path of staleReads(read, RESULT_ROOT, resolves)) {
      problems.push(`${path} is read, and no result has it`);
    }
    problems.push(...nonScalarReads(spec, parents, RESULT_ROOT, fieldAt));
    return problems;
  }

  const inputs = descriptor.inputs;
  const fieldAt = (path: string): RunField | undefined => inputFieldAtPath(inputs, path);
  const resolves = (path: string): boolean => fieldAt(path) !== undefined;
  problems.push(...staleRepeats(spec, parents, INPUTS_ROOT, resolves, 'input'));
  for (const path of staleReads(read, INPUTS_ROOT, resolves)) {
    problems.push(`${path} is read, and no input has it`);
  }
  problems.push(...nonScalarReads(spec, parents, INPUTS_ROOT, fieldAt));

  const offered: Offered = {
    bound: new Set(bound),
    repeated: new Set(repeatPaths(spec)),
    delegated,
  };
  for (const field of inputs) {
    if (!field.required) continue;
    for (const path of uncoveredUnder(field, joinPath(INPUTS_ROOT, field.name), offered)) {
      problems.push(`${path} is required, and the layout offers nowhere to enter it`);
    }
  }

  return problems;
}

/** The predicate: `layoutProblems` is empty. */
export function layoutFits(descriptor: LayoutDescriptor, spec: Spec): boolean {
  return layoutProblems(descriptor, spec).length === 0;
}
