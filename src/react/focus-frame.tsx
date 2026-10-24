'use client';

import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import { frameFocusOutlineClass } from './role-tokens';
import { cn } from './utils';

/**
 * An `<iframe>` that draws its focus in `--ring`, as everything else the kernel
 * puts in the tab order does.
 *
 * **No selector can draw it.** In Chromium an `<iframe>` whose document holds
 * focus matches neither `:focus` nor `:focus-visible`, no ancestor matches
 * `:focus-within`, and the browser draws no ring of its own, so a frame reached
 * with Tab is a stop that nothing marks - a `focus-visible:` outline on it is
 * a class that never applies. So the frame is marked by script instead: while
 * its document holds focus and the page's window has focus, it carries
 * `data-focus-visible`, and `frameFocusOutlineClass` draws the outline on that
 * attribute.
 *
 * **A key or a pointer, alike.** A frame takes keyboard input - it scrolls, and
 * its document may hold fields - so it is marked as a browser marks a text
 * field, which matches `:focus-visible` however focus arrived.
 *
 * **What a script can hear.** When focus enters a frame from the page, the
 * page's window blurs with the frame as its active element, and when focus
 * comes back the window focuses again. Focus passing from one frame straight to
 * another is heard only by the two frames' own windows, which a page may listen
 * to only on a frame of its own origin. So every one of those events re-reads
 * `document.activeElement` for every frame on the page, and a move between two
 * frames of other origins is the one move nothing hears. A window can blur
 * before focus has settled on its new element, so a blur is read again once it
 * has: the frame being left clears and the one entered is marked.
 */
export function FocusFrame({ ref, className, ...props }: ComponentProps<'iframe'>) {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);
  const focused = useFrameFocus(frame);
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
/**
 * The re-read after a blur, once focus has settled on its new element. The last
 * frame's unmount cancels it; a frame unmounted before has left `frames`, so it
 * never reaches that one.
 */
let settling: ReturnType<typeof setTimeout> | undefined;

const refresh = () => {
  for (const check of frames) check();
};
const onBlur = () => {
  refresh();
  clearTimeout(settling);
  settling = setTimeout(refresh, 0);
};

/** The listeners on a window, the page's or a frame's. */
function listen(win: Window) {
  win.addEventListener('blur', onBlur);
  win.addEventListener('focus', refresh);
}

function unlisten(win: Window) {
  win.removeEventListener('blur', onBlur);
  win.removeEventListener('focus', refresh);
}

function useFrameFocus(frame: HTMLIFrameElement | null): boolean {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!frame) return;
    // `hasFocus` is false once the person has gone to another window, where no
    // focus is drawn; it stays true while focus is inside one of the page's frames.
    const check = () => setFocused(document.hasFocus() && document.activeElement === frame);
    if (frames.size === 0) {
      listen(window);
      // Focus coming back to an element of the page, from a frame or not.
      document.addEventListener('focusin', refresh);
    }
    frames.add(check);
    // A frame's window is new on every load, so its listeners are attached
    // again on each; a frame of another origin refuses them.
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
        clearTimeout(settling);
        settling = undefined;
      }
    };
  }, [frame]);
  return focused;
}
