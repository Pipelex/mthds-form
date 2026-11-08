'use client';

import * as React from 'react';
import {
  evaluateVisibility,
  getByPath,
  resolveElementProps,
  resolveRepeatItemStatePath,
  resolveRepeatStatePath,
} from '@json-render/core';
import { useRepeatScope, useVisibility } from '@json-render/react';
import { ownProp } from '../core/own-property';

/**
 * How a page tells its host that one of its elements failed to render.
 *
 * json-render wraps every element in a boundary of its own that catches what
 * the element throws, logs it and renders nothing, so a boundary a host puts
 * around the page never fires: the page arrives with an element missing, its
 * call to action perhaps still there, and the host has nothing to act on.
 * Every renderer of the page's registry is wrapped in a boundary of this
 * module's, inside json-render's, and the page's root gets one too, since
 * json-render resolves an element's props before its renderer runs and puts no
 * boundary above the root. When the host passes a handler, the boundary
 * catches the throw first, renders nothing in its place as json-render's
 * would, and hands the error to the host after the commit, once per element
 * that failed. When it passes none, an element's boundary logs the error as
 * json-render's would and renders nothing, and the root's throws it on, to
 * the host's own boundary. The wrapping does not depend on whether there is a
 * handler, so a host that starts or stops passing one remounts nothing.
 *
 * Unlike json-render's, a failed boundary tries again when what it caught a
 * throw from changes - for an element, its resolved props, the list it
 * repeats over when it repeats, and each child's props and visibility as they
 * resolve, since a child's props are resolved in the child's render and a
 * throw there is the element above's to catch; for the root, the layout and
 * the root's own resolved props - so an element that threw on a word where
 * its list belongs draws once the store holds the list, without remounting
 * the page. What changed is judged by content, read when the boundary fails
 * and again only while it has failed, so a host that hands an equal value as
 * a new object at every render - a spec parsed inline, props resolved afresh
 * - does not retry, throw and report again at every render, and one that
 * corrects its layout in place is judged against what failed. And while the
 * page is `loading`, a failure is neither reported nor logged: a layout still
 * streaming may be caught half-written, so the boundary tries again with each
 * new value and once more when the stream ends, and reports only what still
 * fails then.
 */

/** What a host is told of an element that failed to render. */
export interface ElementErrorInfo {
  /** The component type the element named, or the element whose children threw. */
  type: string;
  /** React's component stack at the throw, when React gave one. */
  componentStack?: string;
}

/** The host's hook for an element's render error. */
export type ElementErrorHandler = (error: unknown, info: ElementErrorInfo) => void;

/**
 * Whether the host passes a handler, read by every element's boundary as it
 * renders. A boolean, so a host passing a new callback at every render
 * re-renders no element; only starting or stopping does.
 */
export const ReportingContext = React.createContext(false);

interface BoundaryProps {
  type: string;
  report: React.RefObject<ElementErrorHandler | undefined>;
  /** Whether the host passes a handler, as of this render. */
  reporting: boolean;
  /** Whether the layout is still streaming: a failure is held, and tried again when it ends. */
  loading?: boolean;
  /**
   * A value that changes whenever what the element renders from may have:
   * the cue to read `inputOf` again, while the boundary has failed. A list
   * is compared entry by entry, so the cue can be written inline.
   */
  resetOn?: unknown;
  /**
   * What the element renders from, read only while the boundary has failed:
   * once when it fails, and again at each new `resetOn`. A failed boundary
   * tries again when it reads differently - at each new `resetOn` while the
   * page is loading.
   */
  inputOf?: () => unknown;
  /** The root's boundary: with no handler, it throws the error on to the host's boundary rather than logging it. */
  root?: boolean;
  children: React.ReactNode;
}

interface BoundaryState {
  failed: boolean;
  error: unknown;
}

/** An error as text, for a failure the input itself raises; never throws. */
function said(error: unknown): string {
  try {
    return String(error);
  } catch {
    return 'an error that cannot be written out';
  }
}

/**
 * A value as the text of its content, for telling a new value from the same
 * one handed again as a new object. What a boundary renders from is mostly
 * JSON a model wrote and the store holds, but a host's store may hold what
 * JSON cannot write - a big integer, a structure that contains itself - so
 * those are written out too, and anything still unwritable is one text: an
 * input read afresh is a new object every time, and compared as itself it
 * would read as changed at every render, retrying and reporting each time.
 *
 * Only a structure inside itself is a cycle. A structure held at two places -
 * a list a repeat lays out that a child's props read again, two members
 * sharing one value - is written out at each, so the same content shared
 * differently reads the same, and what one place shows is never left to the
 * other to show. json-render calls the replacer with the structure holding
 * each entry, so the structures open above an entry are the ones down the
 * chain of holders, and a structure is closed once the walk leaves it.
 *
 * Exported for its test; not part of the entry.
 */
export function contentOf(value: unknown): string {
  const open: object[] = [];
  let entries = 0;
  try {
    return (
      JSON.stringify(value, function (this: unknown, _key, entry: unknown) {
        // A structure shared at several places is written out at each, so
        // sharing nested level under level doubles the text at every level:
        // past a bound no real input reaches, it is an input that cannot be
        // written out, rather than a page frozen writing it.
        if (++entries > MAX_CONTENT_ENTRIES) throw new RangeError('too large to compare');
        // Close every structure the walk has left: the one holding this
        // entry is the innermost still open.
        while (open.length > 0 && open[open.length - 1] !== this) open.pop();
        if (typeof entry === 'bigint') return `${entry}n`;
        if (typeof entry === 'object' && entry !== null) {
          if (open.includes(entry)) return '[cycle]';
          open.push(entry);
        }
        return entry;
      }) ?? 'undefined'
    );
  } catch {
    return 'an input that cannot be written out';
  }
}

/** How many values `contentOf` writes out before it gives up on an input. */
// A failed repeat writes each repeated child out once per item, a few dozen
// values an item, so the bound sits well above a list of tens of thousands of
// rows and well below what sharing nested level under level reaches.
const MAX_CONTENT_ENTRIES = 2_000_000;

/** Whether two cues are the same: a list entry by entry, anything else by identity. */
function sameCue(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((entry, index) => Object.is(entry, b[index]));
  }
  return Object.is(a, b);
}

/** One element's boundary: reports a render error to the host, or logs it, and tries again when its element's input changes. */
export class ElementBoundary extends React.Component<BoundaryProps, BoundaryState> {
  /**
   * The content of what the element rendered from when it failed, read at
   * the catch: a spec patched in place afterwards must not move it.
   */
  private failedOn: unknown;

  constructor(props: BoundaryProps) {
    super(props);
    this.state = { failed: false, error: undefined };
  }

  static getDerivedStateFromError(error: unknown): Partial<BoundaryState> {
    return { failed: true, error };
  }

  /** What the element renders from, as text; total, since it reads a model's layout and the store. */
  private input(): unknown {
    try {
      return contentOf(this.props.inputOf ? this.props.inputOf() : this.props.resetOn);
    } catch (error) {
      return `the input could not be read: ${said(error)}`;
    }
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    // Held while the layout streams; tried again with each new value and
    // when it ends, so its content is not read at every patch.
    if (this.props.loading) {
      this.failedOn = undefined;
      return;
    }
    this.failedOn = this.input();
    const componentStack = info.componentStack ?? undefined;
    if (this.props.reporting) {
      this.props.report.current?.(error, {
        type: this.props.type,
        ...(componentStack ? { componentStack } : {}),
      });
      return;
    }
    // The root throws the error on as it renders its failure, and the host's
    // boundary records it; an element records it here, as json-render's own
    // boundary would have.
    if (!this.props.root) {
      // eslint-disable-next-line no-console -- the record json-render's boundary writes, in its words.
      console.error(
        `[json-render] Rendering error in <${this.props.type}>:`,
        error,
        componentStack,
      );
    }
  }

  override componentDidUpdate(previous: BoundaryProps, previousState: BoundaryState): void {
    // React runs this before `componentDidCatch` in the commit that caught
    // the throw, with the input that threw: only a boundary that had already
    // failed before this update can be looking at a corrected input.
    if (!this.state.failed || !previousState.failed) return;
    const streamEnded = previous.loading === true && !this.props.loading;
    if (streamEnded || this.inputChanged(previous)) {
      this.failedOn = undefined;
      this.setState({ failed: false, error: undefined });
    }
  }

  /** Whether what the element renders from is no longer what it failed on. */
  private inputChanged(previous: BoundaryProps): boolean {
    if (sameCue(this.props.resetOn, previous.resetOn)) return false;
    // While a layout streams, each new value is a new layout; after, an equal
    // one handed as a new object is the same input, and is not tried again.
    if (this.props.loading || this.failedOn === undefined) return true;
    return !Object.is(this.input(), this.failedOn);
  }

  // Whether the root throws the error on is decided as it renders its
  // failure, from whether the host passes a handler in this very render:
  // decided later, it cost a blank commit and a second record of the same
  // error, and decided from the ref, it read the previous render's callback.
  // No host to tell: the root's error goes on, in the same render, to the
  // host's boundary around the page, which records it once.
  override render(): React.ReactNode {
    if (!this.state.failed) return this.props.children;
    if (this.props.root && !this.props.reporting && !this.props.loading) throw this.state.error;
    return null;
  }
}

/** An element as json-render hands it to a renderer, or as it carries a child: what is read of it here. */
interface ElementLike {
  props?: Record<string, unknown>;
  visible?: unknown;
  repeat?: { statePath?: unknown };
  children?: unknown;
  slots?: unknown;
}

type ResolveContext = Parameters<typeof resolveElementProps>[1];

/**
 * An element's props and visibility as json-render resolves them under
 * `ctx`, or the throw resolving them raises, written out: what tells a
 * corrected input from the one that threw, for an element whose resolution
 * is what failed.
 */
function resolvedOf(element: ElementLike | undefined, ctx: ResolveContext): unknown {
  if (!element) return undefined;
  try {
    return {
      props: resolveElementProps(element.props ?? {}, ctx),
      visible:
        element.visible === undefined ? true : evaluateVisibility(element.visible as never, ctx),
    };
  } catch (error) {
    return `throws: ${said(error)}`;
  }
}

/**
 * The raw element a child node carries, when json-render rendered it for one
 * of the spec's elements - which it names by its key. The node a repeating
 * element gets in its children's place names none, and carries the
 * element's own props, already resolved.
 */
function childElementOf(node: React.ReactNode): ElementLike | undefined {
  if (!React.isValidElement(node)) return undefined;
  const { element, elementKey } = node.props as { element?: unknown; elementKey?: unknown };
  if (typeof elementKey !== 'string') return undefined;
  return typeof element === 'object' && element !== null ? (element as ElementLike) : undefined;
}

/**
 * The children json-render repeats under an element, when `node` is the one
 * node it hands a repeating element in their place: that node names no
 * element of its own, and carries the layout and the repeating element, whose
 * `children` are the keys of the elements laid out once per item.
 */
function repeatOf(
  node: React.ReactNode,
):
  { keys: readonly unknown[]; elements: Record<string, unknown>; itemFilter: unknown } | undefined {
  if (!React.isValidElement(node)) return undefined;
  const { element, spec, elementKey, itemFilter } = node.props as {
    element?: ElementLike;
    spec?: { elements?: unknown };
    elementKey?: unknown;
    itemFilter?: unknown;
  };
  if (elementKey !== undefined || element?.repeat === undefined) return undefined;
  const elements = spec?.elements;
  if (typeof elements !== 'object' || elements === null || !Array.isArray(element.children)) {
    return undefined;
  }
  return { keys: element.children, elements: elements as Record<string, unknown>, itemFilter };
}

/**
 * What one element renders from, for its boundary to tell a corrected input
 * from the one it failed on: its own props as resolved; for one that
 * repeats, the list it repeats over, which json-render reads inside the
 * element's render; and each child json-render renders under it, as written
 * and as resolved, since a child's props are resolved inside the child's
 * render and a throw there is caught by this boundary, the element above -
 * for one that repeats, each child for each item it lays out, resolved
 * against that item, so a repeated child that threw on what the store holds
 * outside the list draws again once that changes. Read only while the
 * boundary has failed, so a render that does not fail pays for none of it.
 */
function inputOfElement(
  props: Record<string, unknown>,
  visibility: ResolveContext,
  scope: ReturnType<typeof useRepeatScope>,
): unknown {
  const element = props.element as ElementLike | undefined;
  const state = visibility.stateModel;
  const ctx: ResolveContext = {
    ...visibility,
    ...(scope
      ? { repeatItem: scope.item, repeatIndex: scope.index, repeatBasePath: scope.basePath }
      : {}),
  };
  const statePath = element?.repeat?.statePath;
  let list: unknown;
  let listPath: string | undefined;
  if (statePath !== undefined) {
    try {
      listPath = resolveRepeatStatePath(statePath as never, scope?.basePath);
      list = listPath === undefined ? undefined : getByPath(state, listPath);
    } catch (error) {
      list = `throws: ${said(error)}`;
    }
  }
  // Each child under each item json-render lays out, as it resolves there:
  // the items its filter keeps, each child under the item's own scope.
  const repeated = (repeat: NonNullable<ReturnType<typeof repeatOf>>): unknown => {
    if (listPath === undefined || !Array.isArray(list)) return null;
    const path = listPath;
    return list.map((item: unknown, index: number) => {
      const itemCtx: ResolveContext = {
        ...visibility,
        repeatItem: item,
        repeatIndex: index,
        repeatBasePath: resolveRepeatItemStatePath(path, index),
      };
      if (repeat.itemFilter !== undefined) {
        try {
          if (!evaluateVisibility(repeat.itemFilter as never, itemCtx)) return null;
        } catch (error) {
          return `throws: ${said(error)}`;
        }
      }
      return repeat.keys.map((key) => {
        const child =
          typeof key === 'string'
            ? (ownProp(repeat.elements, key) as ElementLike | undefined)
            : undefined;
        return child ? { element: child, resolved: resolvedOf(child, itemCtx) } : null;
      });
    });
  };
  const under = (nodes: unknown) =>
    React.Children.toArray(nodes as React.ReactNode).map((node) => {
      const repeat = repeatOf(node);
      if (repeat) return { repeated: repeated(repeat) };
      const child = childElementOf(node);
      return child ? { element: child, resolved: resolvedOf(child, ctx) } : null;
    });
  const slots =
    typeof props.slots === 'object' && props.slots !== null
      ? Object.fromEntries(Object.entries(props.slots).map(([name, nodes]) => [name, under(nodes)]))
      : undefined;
  return { props: element?.props, list, children: under(props.children), slots };
}

/**
 * What the page's root renders from: the layout, and the root element's
 * props and visibility as resolved against the store, since json-render
 * resolves them before any boundary of an element's, and a throw there is
 * the root boundary's to catch.
 */
function inputOfRoot(spec: SpecLike | null | undefined, visibility: ResolveContext): unknown {
  const root = spec?.elements?.[spec.root as string] as ElementLike | undefined;
  return { spec, root: resolvedOf(root, visibility) };
}

/** A layout, as far as the root's boundary reads one. */
interface SpecLike {
  root?: unknown;
  elements?: Record<string, unknown>;
}

/**
 * The boundary around a page's root. It is placed inside json-render's
 * provider, to read the store: a root whose props threw on what the store
 * held tries again when the store changes, as an element does.
 */
export function RootBoundary(props: {
  type: string;
  report: React.RefObject<ElementErrorHandler | undefined>;
  reporting: boolean;
  loading: boolean;
  spec: SpecLike | null | undefined;
  children: React.ReactNode;
}): React.ReactElement {
  const { ctx } = useVisibility();
  return (
    <ElementBoundary
      type={props.type}
      report={props.report}
      reporting={props.reporting}
      loading={props.loading}
      resetOn={[props.spec, ctx]}
      inputOf={() => inputOfRoot(props.spec, ctx)}
      root
    >
      {props.children}
    </ElementBoundary>
  );
}

/** The wrappers a page has made, by component type, with the renderer each wraps. */
export type ReportedRenderers = Map<string, { renderer: unknown; wrapper: unknown }>;

/**
 * The registry with every renderer wrapped in a reporting boundary. A wrapper
 * is made once per type and renderer, and kept in `made` across registries,
 * so a host that hands a registry object rebuilt on each render - its own
 * spread over this entry's, written inline - keeps every component's identity
 * and remounts nothing, as json-render alone would. The handler is read
 * through `report` at the moment of the error, so the host's latest callback
 * is the one called.
 */
export function reportingRegistry<R extends Record<string, unknown>>(
  registry: R,
  report: React.RefObject<ElementErrorHandler | undefined>,
  made: ReportedRenderers,
): R {
  const wrapped: Record<string, unknown> = {};
  for (const [type, Renderer] of Object.entries(registry)) {
    const kept = made.get(type);
    if (kept && kept.renderer === Renderer) {
      wrapped[type] = kept.wrapper;
      continue;
    }
    const Component = Renderer as React.ComponentType<Record<string, unknown>>;
    const Reported = (props: Record<string, unknown>) => {
      const reporting = React.useContext(ReportingContext);
      const { ctx } = useVisibility();
      const scope = useRepeatScope();
      return (
        <ElementBoundary
          type={type}
          report={report}
          reporting={reporting}
          loading={props.loading === true}
          // A new element or a new store is the cue; what changed is read
          // only once the boundary has failed.
          resetOn={[props.element, props.children, props.slots, ctx, scope]}
          inputOf={() => inputOfElement(props, ctx, scope)}
        >
          <Component {...props} />
        </ElementBoundary>
      );
    };
    Reported.displayName = `Reported(${type})`;
    made.set(type, { renderer: Renderer, wrapper: Reported });
    wrapped[type] = Reported;
  }
  return wrapped as R;
}
