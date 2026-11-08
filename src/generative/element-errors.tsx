'use client';

import * as React from 'react';

/**
 * How a page tells its host that one of its elements failed to render.
 *
 * json-render wraps every element in a boundary of its own that catches what
 * the element throws, logs it and renders nothing, so a boundary a host puts
 * around the page never fires: the page arrives with an element missing, its
 * call to action perhaps still there, and the host has nothing to act on. When
 * a host asks to hear of it, every renderer of the page's registry is wrapped
 * in a boundary of this module's, inside json-render's, which catches the
 * throw first, renders nothing in its place as json-render's would, and hands
 * the error to the host after the commit, once per element that failed.
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
  children: React.ReactNode;
}

class ElementBoundary extends React.Component<BoundaryProps, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    const componentStack = info.componentStack ?? undefined;
    this.props.report.current?.(error, {
      type: this.props.type,
      ...(componentStack ? { componentStack } : {}),
    });
  }

  override render(): React.ReactNode {
    return this.state.failed ? null : this.props.children;
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
