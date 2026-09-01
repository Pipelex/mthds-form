'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { HtmlContentView } from '../core/native-content';

/**
 * A `native.Html` result, rendered as the markup it is — inside a sandbox.
 *
 * ## Why this is not `dangerouslySetInnerHTML`
 *
 * The markup is **model output**. Injecting it into the host's document would
 * put a script tag, an `onerror` handler and a form posting to somewhere else
 * one prompt away from executing on the host's origin, with the host's cookies.
 * A kernel cannot make that decision for every consumer, and "the host should
 * sanitize it" is not a decision either — it is a hope, and the failure is
 * silent until it is a breach.
 *
 * The alternative would be shipping a sanitizer, and that is a real cost this
 * package's [dependency budget](../../docs/dependency-budget.md) makes a
 * reviewed decision rather than a convenience. So the markup goes into an
 * iframe, which is the platform's own answer and weighs nothing.
 *
 * ## What the sandbox actually stops
 *
 * Two mechanisms, and they cover different things:
 *
 * - **`sandbox` without `allow-scripts`.** No JavaScript runs in the frame at
 *   all: no `<script>`, no `on*` handler, no `javascript:` URL. This is the load
 *   bearing one. `allow-same-origin` IS granted, and that pairing is the safe
 *   one — same-origin is only dangerous *together with* scripts, and without it
 *   the parent could not measure the content to size the frame.
 * - **A `Content-Security-Policy` meta.** `default-src 'none'` with inline
 *   styles allowed and `img-src data:` — so the frame reaches the network for
 *   nothing. Markup carrying `<img src="https://tracker/…">` would otherwise
 *   phone home the moment a result was displayed, which is a privacy leak rather
 *   than a script one and survives the sandbox on its own.
 *
 * Navigation is not granted either (`allow-top-navigation` is absent and no
 * `allow-popups`), so a link cannot move the host anywhere.
 *
 * **Chrome logs `Blocked script execution in 'about:srcdoc'` for every frame
 * here, and it is not a bug to chase.** It is reproducible with a bare
 * `<iframe sandbox="allow-same-origin" srcdoc="<h2>Hi</h2>">` — no CSP, no
 * script anywhere in the document — so it is the browser reporting that the
 * sandbox is on, not a report that something in the markup tried to run.
 *
 * ## Why the styles are copied in rather than inherited
 *
 * A frame is a separate document: none of the host's CSS crosses into it, so
 * unstyled markup would render as the browser's 1996 defaults in the middle of a
 * themed panel — and in a dark theme, black on white. So the few properties that
 * make it belong (colour, font, size) are read off the mount point with
 * `getComputedStyle` and written into the frame's own stylesheet. Reading them
 * from the DOM rather than from tokens is what makes it follow a host's theme
 * without this package knowing what the host's tokens are called.
 */

/** The frame's own stylesheet: the host's typography, and table chrome. */
function frameStyles(color: string, mutedColor: string, borderColor: string, font: string): string {
  return `
    :root { color-scheme: inherit; }
    body {
      margin: 0;
      color: ${color};
      font-family: ${font};
      font-size: 13px;
      line-height: 1.55;
      background: transparent;
      overflow-wrap: anywhere;
    }
    :where(h1, h2, h3, h4, h5, h6) { margin: 0 0 0.4em; line-height: 1.25; }
    :where(h1) { font-size: 1.4em; }
    :where(h2) { font-size: 1.2em; }
    :where(h3) { font-size: 1.05em; }
    :where(p, ul, ol, table, pre, blockquote) { margin: 0 0 0.75em; }
    :where(ul, ol) { padding-inline-start: 1.25em; }
    :where(table) { border-collapse: collapse; width: 100%; }
    :where(th, td) {
      border: 1px solid ${borderColor};
      padding: 4px 8px;
      text-align: left;
      vertical-align: top;
    }
    :where(th) { font-weight: 600; }
    :where(caption) { caption-side: top; color: ${mutedColor}; padding-bottom: 4px; text-align: left; }
    :where(a) { color: inherit; }
    :where(code, pre) { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.92em; }
    :where(pre) { white-space: pre-wrap; }
    :where(blockquote) { border-inline-start: 2px solid ${borderColor}; margin-inline-start: 0; padding-inline-start: 0.75em; color: ${mutedColor}; }
    :where(img) { max-width: 100%; height: auto; }
    :where(hr) { border: 0; border-top: 1px solid ${borderColor}; }
    :where(*:last-child) { margin-bottom: 0; }
  `;
}

/** The whole frame document. The CSP rides a meta because there is no header. */
function frameDocument(content: HtmlContentView, styles: string): string {
  const body = content.cssClass
    ? // The class the value states, honoured the way the runtime's own HTML
      // rendering honours it: as a wrapper, not as something merged into ours.
      `<div class="${escapeAttribute(content.cssClass)}">${content.innerHtml}</div>`
    : content.innerHtml;
  return [
    '<!doctype html><html><head><meta charset="utf-8">',
    `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'">`,
    `<style>${styles}</style></head><body>${body}</body></html>`,
  ].join('');
}

/** A class name is written into an attribute, so its quotes must not close it. */
function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** SSR has no layout to measure; `useEffect` on the server is a no-op anyway. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface HtmlPreviewProps {
  content: HtmlContentView;
  /** Beyond this the frame scrolls rather than growing. */
  maxHeight?: number;
}

export function HtmlPreview({ content, maxHeight = 480 }: HtmlPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [doc, setDoc] = useState<string | null>(null);
  const [height, setHeight] = useState(0);

  // The frame's document is built in an effect, not during render, because it
  // reads the host's COMPUTED style - which does not exist until the element is
  // in the document, and differs between the two themes a story renders at once.
  useIsomorphicLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const computed = getComputedStyle(host);
    setDoc(
      frameDocument(
        content,
        frameStyles(
          computed.color,
          computed.getPropertyValue('--muted-foreground').trim() || computed.color,
          computed.borderColor || computed.color,
          computed.fontFamily,
        ),
      ),
    );
  }, [content]);

  // Size the frame to its content. `allow-same-origin` is what makes this
  // readable; a frame we could not measure would be a fixed box with a scrollbar
  // around two lines of markup.
  const measure = () => {
    const body = frameRef.current?.contentDocument?.body;
    if (body) setHeight(body.scrollHeight);
  };

  useEffect(() => {
    // Re-measure on resize: the frame reflows with the column, and a table that
    // was two lines wide at 720px is four at 360.
    //
    // Guarded on the API existing rather than assumed, and not only for jsdom
    // (which has no `ResizeObserver`): this is an enhancement over the `onLoad`
    // measurement, so an environment without it gets a frame sized once instead
    // of a component that throws. A control that hard-requires a browser API it
    // does not need is a control a host cannot render on the server.
    if (!doc || !hostRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [doc]);

  return (
    <div
      ref={hostRef}
      className="overflow-hidden rounded-lg border border-border bg-card/40 px-3.5 py-3 text-[13px] text-foreground"
    >
      {doc === null ? null : (
        <iframe
          ref={frameRef}
          title={content.cssClass ? `HTML result (${content.cssClass})` : 'HTML result'}
          srcDoc={doc}
          onLoad={measure}
          sandbox="allow-same-origin"
          style={{
            display: 'block',
            width: '100%',
            border: 0,
            height: height === 0 ? undefined : Math.min(height, maxHeight),
            maxHeight,
          }}
        />
      )}
    </div>
  );
}
