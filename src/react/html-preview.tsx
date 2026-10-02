'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { HtmlContentView } from '../core/native-content';
import { useFieldStrings } from './field-strings';
import {
  DEFAULT_IMG_SRC,
  frameDocument,
  frameStyles,
  isWholeDocument,
  pageTypography,
} from './html-frame';
import {
  answerFor,
  askBulkUntimed,
  MARKUP_RESOLVE_TIMEOUT_MS,
  mayHoldStorageRefs,
  rewriteStorageRefs,
  storageRefsIn,
  type BulkAnswer,
} from './markup-storage';
import { useMarkupResolvers, usePdfSaveShown } from './result-env';
import { PdfDownloadButton } from './pdf-download-button';
import { cn } from './utils';

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
 *   styles allowed, `img-src` carrying whatever `imgSrc` says — the host's own
 *   origin, `data:` and `https:` by default — and `font-src` whatever `fontSrc`
 *   says, which follows `imgSrc` unless set. A font, like an image, is a fetch
 *   that runs nothing; `font-src` used to be left to `default-src 'none'`, so a
 *   page that links the face it was designed in (`/fonts/…` on the host, or a
 *   font service) rendered in a fallback face.
 *
 *   `https:` was NOT in that list at first, and the reasoning was that markup
 *   carrying `<img src="https://tracker/…">` phones home the moment a result is
 *   displayed — a privacy leak that survives the sandbox, since it needs no
 *   script. That is a real leak and it is still the reason `imgSrc` exists as a
 *   prop. What it got wrong is whose markup this is: a method's HTML result
 *   embeds the images that method produced, so blocking remote images broke the
 *   ordinary case — a generated report rendered with a broken-image glyph where
 *   its own illustration belongs — to defend against an unusual one. A host that
 *   would rather pay that cost passes `imgSrc="data:"`, or names its own origin.
 *
 *   Everything else stays shut: no scripts, no fetch, no forms, no navigation.
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
 * ## A whole document is shown as the page it is
 *
 * A method that renders a printable page (a quote, an invoice) writes a whole
 * document with its own head, and reads as that page or not at all. So a whole
 * document is continued rather than nested in ours (`html-frame.ts` says how),
 * shown on white in black ink whatever the theme around it, edge to edge
 * without the preview's padding, and as tall as it is: no `maxHeight` applies
 * unless the host passes one. A fragment is the rest of this comment.
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

/** SSR has no layout to measure; `useEffect` on the server is a no-op anyway. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface HtmlPreviewProps {
  content: HtmlContentView;
  /**
   * Beyond this the frame scrolls rather than growing.
   *
   * Generous on purpose. A `native.Html` result is usually a whole report, and
   * 480px showed three paragraphs of one with a scrollbar down the side while
   * the panel around it sat empty — the reader scrolls twice to read once. The
   * frame still sizes itself to its CONTENT, so a short snippet stays short;
   * this only says how far it may grow before scrolling instead. A whole
   * document has no limit unless one is passed: it is a page, and is read whole.
   */
  maxHeight?: number;
  /**
   * The frame's `img-src`. Defaults to `'self' data: https:` — a method's HTML
   * result embeds the images that method produced. Pass `"data:"` to block
   * remote images entirely, or name an origin to allow only your own storage.
   */
  imgSrc?: string;
  /**
   * The frame's `font-src`. Follows `imgSrc` when unset: a page's fonts come
   * from where its images do, the host's own origin or a font service, and a
   * blocked one silently changes the face the page was designed in.
   */
  fontSrc?: string;
  /**
   * Draw the "Download PDF" control above the page. Follows the result
   * environment's `downloads.pdf` when unset, which draws it. The result view
   * passes `false` and draws its own in the page's control row.
   */
  downloadPdf?: boolean;
  /** The PDF's file name, without the extension. `page` when unset. */
  pdfFileName?: string;
  /**
   * Draw a whole document with no border and no rounding, edge to edge with
   * its container: for a page that IS the view (a result that is one page),
   * where a box around it is chrome around chrome. A fragment keeps its themed
   * box either way, since that box is its padding.
   */
  bare?: boolean;
  /**
   * Let a whole document's frame shrink to the height its container leaves it
   * and scroll inside itself, when that container is a flex column of bounded
   * height (a host's scrolling panel, `flex min-h-0 flex-col overflow-y-auto`).
   * The page is then the one scroll container under the pointer, so the first
   * wheel gesture over it scrolls it. In any other container the frame stays
   * as tall as the page. The result view passes it for a result that is one
   * page; a fragment ignores it.
   */
  fill?: boolean;
}

/** The fragment preview's default height limit; a whole document has none. */
const FRAGMENT_MAX_HEIGHT = 1400;

/**
 * How short a filling page's frame may get before its container scrolls
 * instead: below this, a panel squeezed by its own chrome would show the page
 * through a slit.
 */
const FILL_MIN_HEIGHT = 320;

export function HtmlPreview({
  content,
  maxHeight,
  imgSrc = DEFAULT_IMG_SRC,
  fontSrc,
  downloadPdf,
  pdfFileName,
  bare = false,
  fill = false,
}: HtmlPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const s = useFieldStrings();
  const [doc, setDoc] = useState<string | null>(null);
  const [height, setHeight] = useState(0);
  const resolvedHtml = useResolvedMarkup(content.innerHtml);
  const resolved = useMemo(
    () =>
      resolvedHtml === undefined
        ? undefined
        : resolvedHtml === content.innerHtml
          ? content
          : { ...content, innerHtml: resolvedHtml },
    [content, resolvedHtml],
  );
  const page = isWholeDocument(content.innerHtml);
  const pdfSetting = usePdfSaveShown();
  const pdfShown = downloadPdf ?? pdfSetting;
  const limit = maxHeight ?? (page ? undefined : FRAGMENT_MAX_HEIGHT);
  const filling = page && fill;

  // The frame's document is built in an effect, not during render, because it
  // reads the host's COMPUTED style - which does not exist until the element is
  // in the document, and differs between the two themes a story renders at once.
  useIsomorphicLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || !resolved) return;
    const computed = getComputedStyle(host);
    const typography = page
      ? pageTypography(computed.fontFamily)
      : {
          color: computed.color,
          mutedColor: computed.getPropertyValue('--muted-foreground').trim() || computed.color,
          borderColor: computed.borderColor || computed.color,
          font: computed.fontFamily,
        };
    setDoc(
      frameDocument(resolved, {
        styles: frameStyles(typography),
        imgSrc,
        fontSrc: fontSrc ?? imgSrc,
      }),
    );
  }, [resolved, imgSrc, fontSrc, page]);

  // Size the frame to its content. `allow-same-origin` is what makes this
  // readable; a frame we could not measure would be a fixed box with a scrollbar
  // around two lines of markup. The root's height counts what the body's does
  // not: a whole document's own body margin.
  const measure = () => {
    const frameDoc = frameRef.current?.contentDocument;
    const body = frameDoc?.body;
    if (!frameDoc || !body) return;
    setHeight(Math.max(body.scrollHeight, frameDoc.documentElement.scrollHeight));
  };

  const onLoad = () => {
    measure();
    // A linked font arrives after `load` and reflows the page, often taller.
    void frameRef.current?.contentDocument?.fonts?.ready.then(measure, () => undefined);
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

  const frameBox = (
    <div
      ref={hostRef}
      {...(page ? { 'data-html-page': '' } : {})}
      className={cn(
        page
          ? bare
            ? 'overflow-hidden bg-white text-[13px] text-black'
            : 'overflow-hidden rounded-lg border border-border bg-white text-[13px] text-black'
          : 'overflow-hidden rounded-lg border border-border bg-card/40 px-3.5 py-3 text-[13px] text-foreground',
        // A flex column that may shrink, so the frame inside can.
        filling && 'flex min-h-0 flex-col',
      )}
    >
      {resolved === undefined ? (
        // The page's stored pictures are being resolved: a short wait, said
        // as such, rather than a page painted with broken images first.
        <div
          role="status"
          data-html-resolving
          className="flex min-h-24 items-center justify-center gap-2 text-[12px] text-muted-foreground"
        >
          <Loader2 aria-hidden className="size-4 animate-spin" />
          <span>{s.pageLoading}</span>
        </div>
      ) : doc === null ? null : (
        <iframe
          ref={frameRef}
          title={content.cssClass ? `HTML result (${content.cssClass})` : 'HTML result'}
          srcDoc={doc}
          onLoad={onLoad}
          sandbox="allow-same-origin"
          style={{
            display: 'block',
            width: '100%',
            border: 0,
            height:
              height === 0 ? undefined : limit === undefined ? height : Math.min(height, limit),
            ...(limit === undefined ? {} : { maxHeight: limit }),
            // Its height is the page's, as a flex basis: in a bounded flex
            // column it shrinks to what is left (never below the floor) and the
            // page scrolls inside the frame; anywhere else it is the page's.
            // `minHeight` is explicit because a replaced element's automatic
            // minimum is its own height, which would forbid the shrink.
            ...(filling && height > 0
              ? { flex: '0 1 auto', minHeight: Math.min(height, FILL_MIN_HEIGHT) }
              : {}),
          }}
        />
      )}
    </div>
  );
  if (!pdfShown) return frameBox;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-end">
        <PdfDownloadButton
          content={content}
          imgSrc={imgSrc}
          {...(fontSrc === undefined ? {} : { fontSrc })}
          {...(pdfFileName === undefined ? {} : { fileName: pdfFileName })}
        />
      </div>
      {frameBox}
    </div>
  );
}

/**
 * The page's markup with the stored references its pictures name resolved
 * through the result environment's resolvers (`markup-storage.ts`), or
 * `undefined` while that is under way.
 *
 * Markup that cannot hold a reference, or a host with no resolver, is the
 * markup itself, at once and on the server alike. Otherwise the work is done
 * in an effect, since the parser it needs is the browser's: with only the
 * synchronous `resolveUrl` it lands on the next render; with a bulk
 * `resolveUrls` it lands when that answers, and if that takes longer than
 * `MARKUP_RESOLVE_TIMEOUT_MS` the page is shown first with what `resolveUrl`
 * answers, then again with the bulk answer if it arrives late.
 *
 * A resolution of the same markup is kept on screen while a new one runs (a
 * host that recreates its resolver on every render would otherwise flash the
 * loading state each time).
 */
function useResolvedMarkup(markup: string): string | undefined {
  const resolvers = useMarkupResolvers();
  const needed =
    (resolvers.resolveUrl !== undefined || resolvers.resolveUrls !== undefined) &&
    mayHoldStorageRefs(markup);
  const [shown, setShown] = useState<{ source: string; html: string } | null>(null);

  useEffect(() => {
    if (!needed) return;
    let live = true;
    const show = (bulk?: BulkAnswer) => {
      if (!live) return;
      let html = markup;
      try {
        html = rewriteStorageRefs(markup, answerFor(bulk, resolvers.resolveUrl));
      } catch {
        // The page without its pictures is still the page.
      }
      setShown({ source: markup, html });
    };
    let refs: string[] = [];
    try {
      refs = storageRefsIn(markup);
    } catch {
      refs = [];
    }
    if (refs.length === 0 || !resolvers.resolveUrls) {
      show();
      return () => {
        live = false;
      };
    }
    const timer = setTimeout(() => show(), MARKUP_RESOLVE_TIMEOUT_MS);
    void askBulkUntimed(resolvers.resolveUrls, refs).then((bulk) => {
      clearTimeout(timer);
      show(bulk);
    });
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [needed, markup, resolvers]);

  if (!needed) return markup;
  return shown?.source === markup ? shown.html : undefined;
}
