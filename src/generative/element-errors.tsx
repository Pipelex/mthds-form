'use client';

import * as React from 'react';
import { getByPath, resolveRepeatStatePath } from '@json-render/core';
import { useRepeatScope, useStateStore } from '@json-render/react';

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
 * Unlike json-render's, a failed boundary tries again when what its element
 * renders from changes - for an element, its resolved props and, for one that
 * repeats, the list it repeats over; for the root, the layout - so an element
 * that threw on a word where its list belongs draws once the store holds the
 * list, without remounting the page. What changed is judged by content, and
 * only while the boundary has failed, so a host that hands an equal value as
 * a new object at every render - a spec parsed inline, props resolved afresh
 * - does not retry, throw and report again at every render. And while the
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
   * What the element renders from. A failed boundary tries again when it
   * changes - by identity while the page is loading, by content after.
   */
  resetOn?: unknown;
  /** The root's boundary: with no handler, it throws the error on to the host's boundary rather than logging it. */
  root?: boolean;
  children: React.ReactNode;
}

interface BoundaryState {
  failed: boolean;
  error: unknown;
}

/**
 * A value as the text of its content, for telling a new value from the same
 * one handed again as a new object. What a boundary renders from is JSON a
 * model wrote and the store holds, so it has one; anything that does not
 * stringify is compared as itself.
 */
function contentOf(value: unknown): unknown {
  try {
    return JSON.stringify(value);
  } catch {
    return value;
  }
}

/** One element's boundary: reports a render error to the host, or logs it, and tries again when its element's input changes. */
export class ElementBoundary extends React.Component<BoundaryProps, BoundaryState> {
  /** What the element rendered from when it failed, and that value's content, worked out when first compared. */
  private failedOn: { value: unknown; content?: unknown } | undefined;

  constructor(props: BoundaryProps) {
    super(props);
    this.state = { failed: false, error: undefined };
  }

  static getDerivedStateFromError(error: unknown): Partial<BoundaryState> {
    return { failed: true, error };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    this.failedOn = { value: this.props.resetOn };
    // Held while the layout streams; tried again when it ends.
    if (this.props.loading) return;
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

  override componentDidUpdate(previous: BoundaryProps): void {
    if (!this.state.failed || !this.failedOn) return;
    const streamEnded = previous.loading === true && !this.props.loading;
    if (streamEnded || this.inputChanged(previous)) {
      this.failedOn = undefined;
      this.setState({ failed: false, error: undefined });
    }
  }

  /** Whether what the element renders from is no longer what it failed on. */
  private inputChanged(previous: BoundaryProps): boolean {
    const failedOn = this.failedOn;
    if (!failedOn || Object.is(this.props.resetOn, previous.resetOn)) return false;
    // While a layout streams, each new value is a new layout; after, an equal
    // one handed as a new object is the same input, and is not tried again.
    if (this.props.loading) return true;
    if (!('content' in failedOn)) failedOn.content = contentOf(failedOn.value);
    return !Object.is(contentOf(this.props.resetOn), failedOn.content);
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

/**
 * What one element renders from, for its boundary to tell a corrected input
 * from the one it failed on: its resolved props and, when it repeats, the
 * list it repeats over, which json-render reads inside the element's render.
 */
function useRenderedFrom(element: unknown): unknown {
  const { state } = useStateStore();
  const scope = useRepeatScope();
  const { props, repeat } = (element ?? {}) as {
    props?: unknown;
    repeat?: { statePath?: Parameters<typeof resolveRepeatStatePath>[0] };
  };
  if (repeat?.statePath === undefined) return props;
  const path = resolveRepeatStatePath(repeat.statePath, scope?.basePath);
  return { props, list: path === undefined ? undefined : getByPath(state, path) };
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
      const renderedFrom = useRenderedFrom(props.element);
      return (
        <ElementBoundary
          type={type}
          report={report}
          reporting={reporting}
          loading={props.loading === true}
          resetOn={renderedFrom}
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
