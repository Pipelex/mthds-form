'use client';

import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import { frameFocusOutlineClass } from './role-tokens';
import { cn } from './utils';

/**
 * An `<iframe>` that draws its keyboard focus in `--ring`, as everything else
 * the kernel puts in the tab order does.
 *
 * **No selector can draw it.** In Chromium an `<iframe>` whose document holds
 * focus matches neither `:focus` nor `:focus-visible`, no ancestor matches
 * `:focus-within`, and the browser draws no ring of its own, so a frame reached
 * with Tab is a stop that nothing marks - a `focus-visible:` outline on it is
 * a class that never applies. So the frame is marked by script instead: while a
 * keyboard has brought focus into it, it carries `data-focus-visible`, and
 * `frameFocusOutlineClass` draws the outline on that attribute.
 *
 * **What a script can hear.** When focus enters a frame from the page, the
 * page's window blurs with the frame as its active element, and when focus
 * comes back the window focuses again. Focus passing from one frame straight to
 * another is heard only by the two frames' own windows, which a page may listen
 * to only on a frame of its own origin. So every one of those events re-reads
 * `document.activeElement` for every frame on the page, and a move between two
 * frames of other origins is the one move nothing hears.
 *
 * **A keyboard brought it** when the last key or pointer press heard, in the
 * page or in a frame of its origin, was a key: the heuristic browsers apply to
 * `:focus-visible`. A click into a frame of the page's origin is heard there
 * and draws nothing; a click into a frame of another origin is not heard, so it
 * draws the outline only when the page's last press was a key.
 */
export function FocusFrame({ ref, className, ...props }: ComponentProps<'iframe'>) {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const focused = useKeyboardFocus(frame);
  const attach = useCallback(
    (node: HTMLIFrameElement | null) => {
      setFrame(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  return (
    <iframe
      {...props}
      ref={attach}
      {...(focused ? { 'data-focus-visible': '' } : {})}
      className={cn(className, frameFocusOutlineClass)}
    />
  );
}

/** Each mounted frame's re-read of where focus is. */
const frames = new Set<() => void>();
/** Whether the last press heard was a key rather than a pointer. */
let keyboard = false;

const refresh = () => {
  for (const check of frames) check();
};
const onKey = (event: KeyboardEvent) => {
  // A shortcut is not a move through the page, as `:focus-visible` reads it.
  if (!event.metaKey && !event.ctrlKey && !event.altKey) keyboard = true;
};
const onPointer = () => {
  keyboard = false;
};

/** The listeners on a window and its document, the page's or a frame's. */
function listen(win: Window) {
  win.addEventListener('blur', refresh);
  win.addEventListener('focus', refresh);
  win.document.addEventListener('keydown', onKey, true);
  win.document.addEventListener('pointerdown', onPointer, true);
}

function unlisten(win: Window) {
  win.removeEventListener('blur', refresh);
  win.removeEventListener('focus', refresh);
  win.document.removeEventListener('keydown', onKey, true);
  win.document.removeEventListener('pointerdown', onPointer, true);
}

function useKeyboardFocus(frame: HTMLIFrameElement | null): boolean {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!frame) return;
    // `hasFocus` is false once the person has gone to another window, where no
    // focus is drawn; it stays true while focus is inside one of the page's frames.
    const check = () =>
      setFocused(keyboard && document.hasFocus() && document.activeElement === frame);
    if (frames.size === 0) {
      listen(window);
      // Focus coming back to an element of the page, from a frame or not.
      document.addEventListener('focusin', refresh);
    }
    frames.add(check);
    // A frame's window and document are new on every load, so its listeners
    // are attached again on each; a frame of another origin refuses them.
    let own: Window | null = null;
    const attachOwn = () => {
      try {
        own = frame.contentWindow;
        if (own) listen(own);
      } catch {
        own = null;
      }
    };
    attachOwn();
    frame.addEventListener('load', attachOwn);
    return () => {
      frame.removeEventListener('load', attachOwn);
      try {
        if (own) unlisten(own);
      } catch {
        // Gone with its document.
      }
      frames.delete(check);
      if (frames.size === 0) {
        unlisten(window);
        document.removeEventListener('focusin', refresh);
      }
    };
  }, [frame]);
  return focused;
}
