'use client';

import * as React from 'react';

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
 * that failed. When it passes none, the boundary throws the error on, so the
 * page behaves exactly as json-render alone does: an element's throw is logged
 * and dropped, and a root's reaches the host's own boundary. The wrapping does
 * not depend on whether there is a handler, so a host that starts or stops
 * passing one remounts nothing.
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

interface BoundaryProps {
  type: string;
  report: React.RefObject<ElementErrorHandler | undefined>;
  /** A value whose change gives a failed boundary another try: the root's spec. */
  resetOn?: unknown;
  children: React.ReactNode;
}

interface BoundaryState {
  failed: boolean;
  error: unknown;
  resetOn: unknown;
}

/** One element's boundary: reports a render error to the host, or throws it on when there is none to report to. */
export class ElementBoundary extends React.Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { failed: false, error: undefined, resetOn: props.resetOn };
  }

  static getDerivedStateFromError(error: unknown): Partial<BoundaryState> {
    return { failed: true, error };
  }

  static getDerivedStateFromProps(
    props: BoundaryProps,
    state: BoundaryState,
  ): Partial<BoundaryState> | null {
    if (Object.is(props.resetOn, state.resetOn)) return null;
    return { failed: false, error: undefined, resetOn: props.resetOn };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    const componentStack = info.componentStack ?? undefined;
    this.props.report.current?.(error, {
      type: this.props.type,
      ...(componentStack ? { componentStack } : {}),
    });
  }

  override render(): React.ReactNode {
    if (!this.state.failed) return this.props.children;
    // No host to tell: the error goes on to json-render's boundary, or the
    // host's around the page, exactly as if this one were not here.
    if (!this.props.report.current) throw this.state.error;
    return null;
  }
}

/**
 * The registry with every renderer wrapped in a reporting boundary. Built once
 * per registry, so a renderer keeps its identity across renders and no element
 * remounts; the handler is read through `report` at the moment of the error,
 * so the host's latest callback is the one called.
 */
export function reportingRegistry<R extends Record<string, unknown>>(
  registry: R,
  report: React.RefObject<ElementErrorHandler | undefined>,
): R {
  const wrapped: Record<string, unknown> = {};
  for (const [type, Renderer] of Object.entries(registry)) {
    const Component = Renderer as React.ComponentType<Record<string, unknown>>;
    const Reported = (props: Record<string, unknown>) => (
      <ElementBoundary type={type} report={report}>
        <Component {...props} />
      </ElementBoundary>
    );
    Reported.displayName = `Reported(${type})`;
    wrapped[type] = Reported;
  }
  return wrapped as R;
}
