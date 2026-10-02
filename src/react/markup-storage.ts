import { viewableUrl } from '../core/native-content';
import { ownProp } from '../core/own-property';
import { isWholeDocument } from './html-frame';

/**
 * The `pipelex-storage://` references inside an HTML page, exchanged for URLs a
 * browser can load before the page is framed, rasterised or saved.
 *
 * A method that renders a page (a quote, an invoice) embeds the pictures it
 * produced as `<img src="pipelex-storage://…">`. The file arms of the result
 * view hand such a reference to the host's resolver, but a page is markup, and
 * nothing inside it went through that seam: the frame's policy refuses the
 * scheme, so every picture showed as a broken image, and a host had to rewrite
 * the markup itself before handing it over. Here it is done once, for every
 * place a page goes: the preview, the PDF and the HTML download.
 *
 * ## What is read, and how
 *
 * The markup is parsed with `DOMParser`, never searched with a pattern, because
 * an attribute value a regex finds may be inside a comment, a `<textarea>` or
 * another attribute, and an `<img>` it misses may be spelled with single
 * quotes, no quotes or an uppercase tag. A `DOMParser` document is inert: no
 * script runs and nothing is fetched while it is read. A whole document is
 * parsed as one; a fragment is parsed as a `<template>`'s content, which keeps
 * a leading `<style>` or `<meta>` where it was rather than moving it into a
 * head the fragment never had.
 *
 * The references read are the ones a page fetches as a picture: `src` and
 * `srcset` on `<img>` and `<source>`, a `<video>`'s `poster`, the legacy
 * `background` attribute, an SVG `<image>`'s `href`, and every CSS `url()` in a
 * `style` attribute or a `<style>` element (inside CSS, which is text, the
 * `url()` tokens are found with a pattern; the HTML around them never is).
 *
 * ## How each reference is answered
 *
 * Every distinct reference is asked for once. When the host gave a bulk
 * resolver (`resolveUrls`), all of them go in one call, which is one round trip
 * for a page with twenty pictures; its answer is then checked by the URL gate
 * (`viewableUrl`), as every resolver's answer is. A reference the bulk answer
 * left out, or answered with something the gate refuses, is asked of the
 * per-reference resolver (`resolveUrl`) next. A reference neither answers is
 * left as it was: the picture stays broken, and the page still shows.
 *
 * A bulk resolver that rejects, throws or takes longer than `timeoutMs` is
 * read as having answered nothing, so a page never waits on it for good.
 *
 * ## What comes back
 *
 * The markup with each answered reference replaced, serialised from the parsed
 * tree. Markup holding no reference that changed comes back as the very same
 * string, so a page with no stored pictures is never re-serialised.
 */

/** Answers a batch of stored references; see `ResultEnvProvider`'s `resolveUrls`. */
export type ResolveUrls = (
  uris: readonly string[],
) => Promise<
  | ReadonlyMap<string, string | null | undefined>
  | Readonly<Record<string, string | null | undefined>>
>;

export interface MarkupResolvers {
  /** One reference at a time, synchronously, as the result view's file arms ask. */
  resolveUrl?: (url: string) => string | undefined;
  /** Every reference of the page in one call. Asked first when present. */
  resolveUrls?: ResolveUrls;
}

/** How long a page waits on a bulk resolver before it shows without its answer. */
export const MARKUP_RESOLVE_TIMEOUT_MS = 10_000;

const STORAGE_SCHEME = 'pipelex-storage:';

/**
 * Whether the markup may hold a stored reference at all: a substring test, so a
 * page with none is never parsed. It decides only whether to look, never what a
 * reference is.
 */
export function mayHoldStorageRefs(markup: string): boolean {
  return markup.toLowerCase().includes('pipelex-storage');
}

function isStorageRef(value: string): boolean {
  return value.trim().toLowerCase().startsWith(STORAGE_SCHEME);
}

/** The parsed markup, and how to write it back out. */
interface ParsedMarkup {
  root: ParentNode;
  serialize: () => string;
}

function parseMarkup(markup: string): ParsedMarkup | undefined {
  if (typeof DOMParser === 'undefined') return undefined;
  const parser = new DOMParser();
  if (isWholeDocument(markup)) {
    const doc = parser.parseFromString(markup, 'text/html');
    return {
      root: doc,
      serialize: () =>
        (doc.doctype ? `<!DOCTYPE ${doc.doctype.name}>` : '') + doc.documentElement.outerHTML,
    };
  }
  const doc = parser.parseFromString('<!doctype html><body></body>', 'text/html');
  const template = doc.createElement('template');
  template.innerHTML = markup;
  return { root: template.content, serialize: () => template.innerHTML };
}

/** A CSS `url()` token: its quote, and what it holds. */
const CSS_URL = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;

/** One `srcset` candidate: the URL, and its descriptor when it has one. */
interface SrcsetCandidate {
  url: string;
  descriptor: string;
}

/**
 * A `srcset` value read as the HTML specification's candidate list: a URL is a
 * run of non-space characters, trailing commas end a candidate with no
 * descriptor, and a descriptor runs to the next comma outside parentheses.
 */
function parseSrcset(value: string): SrcsetCandidate[] {
  const candidates: SrcsetCandidate[] = [];
  let at = 0;
  while (at < value.length) {
    while (at < value.length && /[\s,]/.test(value[at] ?? '')) at += 1;
    if (at >= value.length) break;
    const start = at;
    while (at < value.length && !/\s/.test(value[at] ?? '')) at += 1;
    let url = value.slice(start, at);
    if (url.endsWith(',')) {
      url = url.replace(/,+$/, '');
      candidates.push({ url, descriptor: '' });
      continue;
    }
    let depth = 0;
    const descriptorStart = at;
    while (at < value.length) {
      const char = value[at];
      if (char === '(') depth += 1;
      else if (char === ')') depth = Math.max(0, depth - 1);
      else if (char === ',' && depth === 0) break;
      at += 1;
    }
    candidates.push({ url, descriptor: value.slice(descriptorStart, at).trim() });
  }
  return candidates;
}

/** A URL written back into CSS: quoted, with the characters that would end the string escaped. */
function cssUrl(url: string): string {
  return `url("${url.replace(/[\\"]/g, (char) => `\\${char}`).replace(/[\n\r\f]/g, ' ')}")`;
}

/**
 * Every place in the parsed markup a picture's URL is written, as a reader of
 * the references it holds and a writer that replaces them. One walk, so the
 * references collected and the references rewritten cannot disagree.
 */
interface UrlSite {
  refs: () => string[];
  /** Rewrite through `answer`; true when anything changed. */
  rewrite: (answer: (ref: string) => string | undefined) => boolean;
}

function attributeSite(element: Element, name: string): UrlSite {
  return {
    refs: () => {
      const value = element.getAttribute(name) ?? '';
      return isStorageRef(value) ? [value.trim()] : [];
    },
    rewrite: (answer) => {
      const value = element.getAttribute(name) ?? '';
      if (!isStorageRef(value)) return false;
      const url = answer(value.trim());
      if (url === undefined) return false;
      element.setAttribute(name, url);
      return true;
    },
  };
}

function srcsetSite(element: Element, name: string): UrlSite {
  const read = () => parseSrcset(element.getAttribute(name) ?? '');
  return {
    refs: () => read().flatMap(({ url }) => (isStorageRef(url) ? [url] : [])),
    rewrite: (answer) => {
      let changed = false;
      const candidates = read().map((candidate) => {
        if (!isStorageRef(candidate.url)) return candidate;
        const url = answer(candidate.url);
        if (url === undefined) return candidate;
        changed = true;
        // A resolved URL may carry a comma or a space, which would split the
        // candidate; percent-encoding them leaves the same URL to a browser.
        return { ...candidate, url: url.replace(/,/g, '%2C').replace(/\s/g, '%20') };
      });
      if (changed) {
        element.setAttribute(
          name,
          candidates
            .map(({ url, descriptor }) => (descriptor ? `${url} ${descriptor}` : url))
            .join(', '),
        );
      }
      return changed;
    },
  };
}

function cssSite(read: () => string, write: (css: string) => void): UrlSite {
  return {
    refs: () =>
      Array.from(read().matchAll(CSS_URL), (match) => (match[2] ?? '').trim()).filter(isStorageRef),
    rewrite: (answer) => {
      let changed = false;
      const css = read().replace(CSS_URL, (token, _quote: string, inner: string) => {
        const ref = inner.trim();
        if (!isStorageRef(ref)) return token;
        const url = answer(ref);
        if (url === undefined) return token;
        changed = true;
        return cssUrl(url);
      });
      if (changed) write(css);
      return changed;
    },
  };
}

function urlSites(root: ParentNode): UrlSite[] {
  const sites: UrlSite[] = [];
  for (const element of Array.from(root.querySelectorAll('*'))) {
    const tag = element.localName;
    if (tag === 'img' || tag === 'source') {
      sites.push(attributeSite(element, 'src'), srcsetSite(element, 'srcset'));
    }
    if (tag === 'video') sites.push(attributeSite(element, 'poster'));
    if (tag === 'image') {
      sites.push(attributeSite(element, 'href'), attributeSite(element, 'xlink:href'));
    }
    if (element.hasAttribute('background')) sites.push(attributeSite(element, 'background'));
    if (element.hasAttribute('style')) {
      sites.push(
        cssSite(
          () => element.getAttribute('style') ?? '',
          (css) => element.setAttribute('style', css),
        ),
      );
    }
    if (tag === 'style') {
      sites.push(
        cssSite(
          () => element.textContent ?? '',
          (css) => {
            element.textContent = css;
          },
        ),
      );
    }
  }
  return sites;
}

/** The distinct stored references the markup's pictures name, in document order. */
export function storageRefsIn(markup: string): string[] {
  if (!mayHoldStorageRefs(markup)) return [];
  const parsed = parseMarkup(markup);
  if (!parsed) return [];
  return Array.from(new Set(urlSites(parsed.root).flatMap((site) => site.refs())));
}

/**
 * The markup with each stored reference replaced by `answer`'s URL. A reference
 * it answers `undefined` for is left as it was; markup with nothing replaced
 * comes back as the same string.
 */
export function rewriteStorageRefs(
  markup: string,
  answer: (ref: string) => string | undefined,
): string {
  if (!mayHoldStorageRefs(markup)) return markup;
  const parsed = parseMarkup(markup);
  if (!parsed) return markup;
  let changed = false;
  for (const site of urlSites(parsed.root)) {
    if (site.rewrite(answer)) changed = true;
  }
  return changed ? parsed.serialize() : markup;
}

/** A bulk answer, read the same way whichever of the two shapes the host returned. */
export type BulkAnswer = (ref: string) => string | undefined;

function readBulk(result: unknown): BulkAnswer {
  if (result instanceof Map) {
    return (ref) => {
      const url: unknown = result.get(ref);
      return typeof url === 'string' ? url : undefined;
    };
  }
  if (result !== null && typeof result === 'object') {
    const record = result as Record<string, unknown>;
    return (ref) => {
      const url = ownProp(record, ref);
      return typeof url === 'string' ? url : undefined;
    };
  }
  return () => undefined;
}

/**
 * Ask the bulk resolver for every reference, in one call, for as long as it
 * takes. Never rejects: a resolver that throws or rejects answers nothing.
 */
export async function askBulkUntimed(
  resolveUrls: ResolveUrls,
  refs: readonly string[],
): Promise<BulkAnswer> {
  try {
    return readBulk(await resolveUrls(refs));
  } catch {
    return () => undefined;
  }
}

/**
 * Ask the bulk resolver for every reference, in one call. Never rejects: a
 * resolver that throws, rejects or answers nothing usable is an answer of
 * nothing, and so is one still running after `timeoutMs`.
 */
export async function askBulk(
  resolveUrls: ResolveUrls,
  refs: readonly string[],
  timeoutMs: number = MARKUP_RESOLVE_TIMEOUT_MS,
): Promise<BulkAnswer> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<BulkAnswer>((resolve) => {
    timer = setTimeout(() => resolve(() => undefined), timeoutMs);
  });
  const asked = askBulkUntimed(resolveUrls, refs);
  try {
    return await Promise.race([asked, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The answer for one reference: the bulk answer when the URL gate admits it,
 * else the per-reference resolver's when the gate admits that, else none. The
 * gate's own normalised string is the one written into the page.
 */
export function answerFor(
  bulk: BulkAnswer | undefined,
  resolveUrl: MarkupResolvers['resolveUrl'],
): (ref: string) => string | undefined {
  return (ref) => {
    const fromBulk = viewableUrl(bulk?.(ref));
    if (fromBulk !== undefined) return fromBulk;
    try {
      return viewableUrl(resolveUrl?.(ref));
    } catch {
      return undefined;
    }
  };
}

/**
 * The markup with every stored reference its pictures name resolved through
 * the host's resolvers; see the module comment for the order they are asked in.
 * Never rejects, and never waits on a bulk resolver past `timeoutMs`.
 */
export async function resolveHtmlStorageUrls(
  markup: string,
  { resolveUrl, resolveUrls }: MarkupResolvers,
  { timeoutMs = MARKUP_RESOLVE_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<string> {
  if (!resolveUrl && !resolveUrls) return markup;
  try {
    const refs = storageRefsIn(markup);
    if (refs.length === 0) return markup;
    const bulk = resolveUrls ? await askBulk(resolveUrls, refs, timeoutMs) : undefined;
    return rewriteStorageRefs(markup, answerFor(bulk, resolveUrl));
  } catch {
    // A page whose pictures could not be resolved is still the page.
    return markup;
  }
}
