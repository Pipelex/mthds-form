'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * Where a result view draws a modal surface opened from deep inside it: at the
 * root of the result, rather than beside the control that opened it. Internal.
 *
 * ## Why not in place
 *
 * The vendored dialogs are drawn in place rather than through a portal to the
 * page's body, so the theme class and a brand's scoped tokens on the host's
 * own element still reach them, and they cover the viewport as `fixed`
 * boxes. A `fixed` box is placed against the viewport only while no ancestor
 * is a containing block for it, and the result view makes one of its own: a
 * table that stacks its rows (`tableLayout="stack"`) is a size container,
 * which CSS gives layout containment, so a picture's viewer opened from a
 * thumbnail in such a table, or from the record of a row opened there, would
 * have been drawn inside the table's box and clipped by it.
 *
 * So the root of a result (the panel, or the outermost `ResultField`, or a
 * generative layout's result hatch: whoever starts its `ResultRoot`) holds an
 * empty element while a surface needs it, and the surface is portalled into
 * that element. It is still inside the host's element, so the tokens reach it,
 * and it is outside every box the result view draws. React's context follows
 * a portal, so a control inside the surface still reads where in the result
 * it sits.
 *
 * The element exists only while a surface is open, and is absolutely
 * positioned and of no size, so it moves nothing in the host's layout and a
 * result with nothing open renders exactly the markup it always did.
 */

interface OverlayLayerValue {
  /** The element surfaces are drawn into, once it is mounted. */
  target: HTMLElement | null;
  /** Ask for the element; the function returned gives it back. */
  acquire: () => () => void;
}

const OverlayLayerContext = createContext<OverlayLayerValue | null>(null);

/**
 * The layer for everything beneath it, unless a layer above already serves
 * it: the outermost root of a result holds the one element.
 */
export function OverlayLayer({ children }: { children: ReactNode }) {
  const outer = use(OverlayLayerContext);
  const [holders, setHolders] = useState(0);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const acquire = useCallback(() => {
    setHolders((count) => count + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setHolders((count) => count - 1);
    };
  }, []);
  const layer = useMemo(() => ({ target, acquire }), [target, acquire]);
  if (outer) return children;
  return (
    <OverlayLayerContext value={layer}>
      {/* First rather than last, so the host's `:last-child` rules (a stack's
          spacing among them) still land on the last thing it laid out. */}
      {holders > 0 && <span ref={setTarget} data-overlay-layer className="absolute size-0" />}
      {children}
    </OverlayLayerContext>
  );
}

/**
 * Draws its children in the result's overlay layer while it is mounted, or in
 * place where no layer serves it. Renders nothing for the moment between
 * asking for the layer and the layer's element mounting.
 */
export function InOverlayLayer({ children }: { children: ReactNode }) {
  const layer = use(OverlayLayerContext);
  const acquire = layer?.acquire;
  useEffect(() => acquire?.(), [acquire]);
  if (!layer) return children;
  return layer.target ? createPortal(children, layer.target) : null;
}
