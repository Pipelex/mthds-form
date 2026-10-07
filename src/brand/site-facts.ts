/**
 * A website's design facts, read off its HTML and stylesheets, as data.
 *
 * A brand producer's first input, and deliberately not a model: what a site
 * declares is a matter of fact - which class its `<html>` carries, which
 * custom properties its stylesheets set, under which selector, and which of
 * those declarations wins for the page as it is served, which colour
 * utilities its markup uses most, which typefaces it loads, which radii it
 * uses, which images could be its logo - and code reads facts exactly, every
 * time, for nothing. What a model is for is the judgement that follows: which
 * colour is the accent and which the canvas, what the light mode of a
 * dark-only site should be, which image is the logo. So the facts are
 * recorded verbatim, ranked by frequency where frequency is the evidence, and
 * capped so the record stays readable.
 *
 * NOTHING HERE FETCHES. The reader is two pure functions over texts the host
 * fetched: `stylesheetUrls` says which stylesheets a page links, and
 * `siteFacts` reads the page and those stylesheets. A host fetches behind its
 * own guard - a scheme, a size cap, a timeout - which is a policy this
 * package has no business setting, and the same reader then runs in a script
 * on a laptop and behind a platform's fetcher alike. Inline `<style>` blocks
 * are read too. There is no browser and no script execution, so a site that
 * paints itself from JavaScript alone yields fewer facts, which the record
 * then shows.
 *
 * HTML is read by regex, which is enough for tags and attributes and is all
 * this reads; CSS by a small scanner that keeps each rule's selector chain,
 * nested at-rules included.
 *
 * The page is a stranger's, so no reading may cost more than its length:
 * every scan moves forward and stops once nothing after it can close what it
 * opened (if no `>` follows one position, none follows any later one), and
 * `LIMITS` bounds the rest. Each limit is far above what a site written for a
 * browser reaches.
 */

/** How many of each list to keep: enough to see the pattern, not the tail. */
const KEEP = {
  properties: 80,
  values: 32,
  literals: 40,
  utilities: 60,
  fontFamilies: 20,
  fontFaces: 20,
  webfonts: 12,
  fontUtilities: 12,
  radii: 20,
  radiusProperties: 20,
  radiusUtilities: 16,
  themeColors: 8,
  colorSchemes: 8,
  logos: 12,
  headerSvgs: 6,
};

/** The bounds that keep a hostile page from costing more than its length. */
const LIMITS = {
  /** Blocks nested deeper than this are skipped whole. */
  depth: 32,
  /** A selector chain is recorded up to this many characters, then cut with an ellipsis. */
  under: 300,
  /** A colour function longer than this many characters is not read as a colour. */
  literal: 100,
  /** How many levels deep `var()` references and their fallbacks are followed. */
  varDepth: 16,
  /** How many characters `var()` substitution may add over the whole reading. */
  substitution: 1_000_000,
  /** A root attribute longer than this many characters is not searched for a substring (`*=`). */
  attribute: 10_000,
};

/** A page as the host fetched it. */
export interface FetchedPage {
  /** The URL that was asked for. */
  url: string;
  /** The URL the page was served from, after redirects; relative links resolve against it. */
  finalUrl: string;
  /** The day it was fetched, `YYYY-MM-DD`. A reader with no clock is told the date. */
  fetchedAt: string;
  html: string;
  /** Each stylesheet `stylesheetUrls` named, in that order: its text, or why it could not be had. */
  stylesheets: readonly FetchedStylesheet[];
}

export type FetchedStylesheet = { url: string; css: string } | { url: string; error: string };

export interface Ranked {
  value: string;
  count: number;
}

export interface PropertyFacts {
  name: string;
  /**
   * The value the page's content sees as served, among the declarations that
   * apply at the root: one set on every element over one set on the body over
   * one set on the root, since a custom property inherits; then an important
   * one over a normal one, then by cascade layer, then by specificity, then by
   * source order. Null when none applies.
   */
  asServed: string | null;
  /**
   * How many `var()` references name it across the stylesheets: how central it
   * is, and what decides which are kept when a site declares more than the
   * record holds.
   */
  references: number;
  /** Each declaration as written, with the selector chain it is set under, in source order, up to a cap. */
  values: { value: string; under: string }[];
}

export interface LogoCandidate {
  url: string | null;
  alt?: string;
  width?: string | null;
  height?: string | null;
  class?: string | null;
  /** The original file behind a Next.js image URL. */
  original?: string | null;
  rel?: string;
  sizes?: string | null;
  type?: string | null;
}

export interface SiteFacts {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  site: {
    name: string | null;
    title: string | null;
    description: string | null;
    lang: string | null;
  };
  scheme: {
    htmlClass: string | null;
    htmlDataAttributes: Record<string, string>;
    bodyClass: string | null;
    bodyDataAttributes: Record<string, string>;
    themeColorMetas: { content: string | null; media: string | null }[];
    colorSchemeDeclarations: string[];
    rulesUnderADarkSelector: number;
    rulesUnderPrefersDark: number;
  };
  stylesheets: { url: string; bytes?: number; error?: string }[];
  inlineStyleBlocks: number;
  colors: {
    customProperties: PropertyFacts[];
    literalsByFrequency: Ranked[];
    utilitiesByFrequency: (Ranked & { resolves: string | null })[];
  };
  typography: {
    fontFamiliesByFrequency: Ranked[];
    fontFaces: string[];
    webfontLinks: string[];
    googleFamilies: string[];
    fontPreloads: string[];
    utilitiesByFrequency: Ranked[];
  };
  shape: {
    radiiByFrequency: Ranked[];
    utilitiesByFrequency: Ranked[];
    radiusProperties: PropertyFacts[];
  };
  logos: {
    candidates: LogoCandidate[];
    headerSvgs: { ariaLabel: string | null; class: string | null; viewBox: string | null }[];
  };
}

type Attrs = Record<string, string>;

/**
 * The attribute an element was served with, or undefined. Only the element's
 * own: a selector naming `constructor` or `__proto__` must find nothing there,
 * never a function.
 */
function attribute(attrs: Attrs, name: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : undefined;
}

/**
 * An attribute's whitespace-separated words, split once per element and kept.
 * A page's root carries one class list and every selector in its sheets asks
 * about it, so splitting it per selector would cost the list's length times
 * the sheets'.
 */
const WORDS = new WeakMap<Attrs, Map<string, ReadonlySet<string>>>();

function wordsOf(attrs: Attrs, name: string): ReadonlySet<string> {
  let byName = WORDS.get(attrs);
  if (!byName) {
    byName = new Map();
    WORDS.set(attrs, byName);
  }
  let words = byName.get(name);
  if (!words) {
    words = new Set((attribute(attrs, name) ?? '').split(/\s+/).filter(Boolean));
    byName.set(name, words);
  }
  return words;
}

/** A percent-encoded value from the markup, or null when its escapes are malformed. */
function decoded(text: string): string | null {
  try {
    return decodeURIComponent(text);
  } catch {
    return null;
  }
}

function resolveUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/** Two strings by their UTF-16 code units: the same order on every machine, whatever its locale. */
function byCodeUnit(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

// ─── HTML, by regex ──────────────────────────────────────────────────────────

const ENTITIES: Record<string, string> = { amp: '&', quot: '"', '#39': "'", lt: '<', gt: '>' };

/** The entities an attribute value carries, decoded in one pass, so `&amp;quot;` reads `&quot;`. */
function decodeEntities(text: string): string {
  return text.replace(/&(amp|quot|#39|lt|gt);/g, (_entity, name: string) => ENTITIES[name]!);
}

/**
 * A tag's attributes, a boolean one (`disabled`) as the empty string, as HTML
 * reads it. The record has no prototype, so it holds what the markup set and
 * nothing else.
 */
function parseAttrs(text: string): Attrs {
  const attrs = Object.create(null) as Attrs;
  // A name starts where no name character precedes it, so a long run of them
  // is tried once rather than from each of its characters.
  for (const match of text.matchAll(
    /(?<![\w:.-])([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g,
  )) {
    attrs[match[1]!.toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}

/** Each `<name …>` tag's attributes in document order, up to `limit`. */
function tagsOf(html: string, name: string, limit = Number.POSITIVE_INFINITY): Attrs[] {
  const found: Attrs[] = [];
  const open = new RegExp(`<${name}\\b`, 'gi');
  for (let match = open.exec(html); match && found.length < limit; match = open.exec(html)) {
    const end = html.indexOf('>', open.lastIndex);
    if (end === -1) break;
    found.push(parseAttrs(html.slice(open.lastIndex, end)));
    open.lastIndex = end + 1;
  }
  return found;
}

function firstTag(html: string, name: string): Attrs {
  return tagsOf(html, name, 1)[0] ?? parseAttrs('');
}

/** The text of the first `<name>` element, or null when it is never closed. */
function textOf(html: string, name: string): string | null {
  const open = new RegExp(`<${name}\\b`, 'i').exec(html);
  if (!open) return null;
  const start = html.indexOf('>', open.index + open[0].length);
  if (start === -1) return null;
  const close = new RegExp(`</${name}>`, 'gi');
  close.lastIndex = start + 1;
  const end = close.exec(html);
  if (!end) return null;
  return decodeEntities(
    html
      .slice(start + 1, end.index)
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function metaContent(metas: Attrs[], key: string): string | null {
  const found = metas.find((meta) => meta.property === key || meta.name === key);
  return found?.content ?? null;
}

/** A `<link>` tag's attributes, or a `<style>` element's text and the media it applies under. */
type LinkOrStyle = { link: Attrs } | { style: string; media: string | null };

/**
 * The page's `<link>` tags and `<style>` texts in document order, as a browser
 * reads them: what an HTML comment or a `<script>` holds is neither, and a
 * `<style>` or a comment never closed runs to the end of the page.
 */
function linksAndStyles(html: string): LinkOrStyle[] {
  const found: LinkOrStyle[] = [];
  const open = /<(link|style|script)\b|<!--/gi;
  const ends = { style: /<\/style\s*>/gi, script: /<\/script\s*>/gi };
  for (let match = open.exec(html); match; match = open.exec(html)) {
    if (match[0] === '<!--') {
      const end = html.indexOf('-->', open.lastIndex);
      if (end === -1) break;
      open.lastIndex = end + '-->'.length;
      continue;
    }
    const tagEnd = html.indexOf('>', open.lastIndex);
    if (tagEnd === -1) break;
    const name = match[1]!.toLowerCase();
    if (name === 'link') {
      found.push({ link: parseAttrs(html.slice(open.lastIndex, tagEnd)) });
      open.lastIndex = tagEnd + 1;
      continue;
    }
    const close = ends[name as 'style' | 'script'];
    close.lastIndex = tagEnd + 1;
    const closed = close.exec(html);
    if (name === 'style') {
      const media = mediaOf(parseAttrs(html.slice(open.lastIndex, tagEnd)));
      found.push({ style: html.slice(tagEnd + 1, closed?.index), media });
    }
    if (!closed) break;
    open.lastIndex = close.lastIndex;
  }
  return found;
}

/** The page's `<link>` tags as a browser reads them. */
function linksOf(markup: readonly LinkOrStyle[]): Attrs[] {
  return markup.flatMap((item) => ('link' in item ? [item.link] : []));
}

/**
 * The stylesheets a page links, resolved against the URL it was served from,
 * in document order: what a host fetches before it calls `siteFacts`.
 */
export function stylesheetUrls(html: string, finalUrl: string): string[] {
  return linksOf(linksAndStyles(html))
    .map((link) => linkedStylesheet(link, finalUrl))
    .filter((url): url is string => url !== null);
}

/** The URL a `<link>` loads a stylesheet from, or null when it loads none. */
function linkedStylesheet(link: Attrs, base: string): string | null {
  if (!/\bstylesheet\b/i.test(link.rel ?? '') || !link.href) return null;
  return resolveUrl(link.href, base);
}

/**
 * Whether a linked sheet is in the page's cascade at all. A disabled one is
 * not, and neither is an alternate one, which a browser offers its reader
 * rather than applies.
 */
function inCascade(link: Attrs): boolean {
  return attribute(link, 'disabled') === undefined && !/\balternate\b/i.test(link.rel ?? '');
}

/**
 * The media a sheet applies under, or null when it applies on every medium. A
 * sheet linked as `print` that switches itself on once loaded
 * (`onload="this.media='all'"`) is the usual way to load CSS without blocking
 * the page, and applies everywhere.
 */
function mediaOf(attrs: Attrs): string | null {
  const media = attribute(attrs, 'media')?.trim();
  if (!media || /^all$/i.test(media)) return null;
  if (/\bmedia\b/.test(attribute(attrs, 'onload') ?? '')) return null;
  return media;
}

/** A sheet's text, and the media its `<link>` or `<style>` applies it under. */
interface SheetText {
  css: string;
  media: string | null;
}

/**
 * The page's CSS in document order: each linked sheet where its `<link>` is,
 * each `<style>` block where it is. Source order decides which of two equal
 * rules wins, so an inline block that precedes a link must be read before it.
 * A link takes the sheet the host fetched for its URL, and a sheet the markup
 * does not account for is read last. A sheet out of the cascade (disabled, or
 * alternate) is taken and not read. Each text is a sheet of its own, as in a
 * browser: what one leaves open closes at its end.
 */
function cssInDocumentOrder(
  page: FetchedPage,
  markup: readonly LinkOrStyle[],
): { texts: SheetText[]; inlineBlocks: number } {
  const texts: SheetText[] = [];
  let inlineBlocks = 0;
  // The sheets fetched for each URL, in order, and how many of them links have taken.
  const byUrl = new Map<string, { indices: number[]; taken: number }>();
  page.stylesheets.forEach((sheet, index) => {
    const queue = byUrl.get(sheet.url);
    if (queue) queue.indices.push(index);
    else byUrl.set(sheet.url, { indices: [index], taken: 0 });
  });
  const read = new Set<number>();
  const sheetText = (index: number, link: Attrs | null) => {
    const sheet = page.stylesheets[index]!;
    read.add(index);
    if (!('css' in sheet) || (link !== null && !inCascade(link))) return;
    texts.push({ css: sheet.css, media: link === null ? null : mediaOf(link) });
  };
  for (const item of markup) {
    if ('style' in item) {
      texts.push({ css: item.style, media: item.media });
      inlineBlocks += 1;
      continue;
    }
    const url = linkedStylesheet(item.link, page.finalUrl);
    const queue = url === null ? undefined : byUrl.get(url);
    if (queue && queue.taken < queue.indices.length) {
      sheetText(queue.indices[queue.taken++]!, item.link);
    }
  }
  page.stylesheets.forEach((_sheet, index) => {
    if (!read.has(index)) sheetText(index, null);
  });
  return { texts, inlineBlocks };
}

// ─── CSS, by a small scanner ─────────────────────────────────────────────────

/**
 * What a declaration that applies at the root is set on, in the order the
 * page's content inherits from: the root, then the body, then every element.
 * A custom property inherits, so the content sees the body's value over the
 * root's whatever either's cascade, and its own (`*`) over both.
 */
const ON_ROOT = 0;
const ON_BODY = 1;
const ON_EVERY = 2;

/**
 * A selector's specificity, as far as one matching at the root can carry: its
 * classes, attributes and pseudo-classes, then its types. An id is never
 * matched here, so it has no column.
 */
type Specificity = readonly [classes: number, types: number];

/** Where a rule applies at the root: what it is set on, and how specific the selector that matched it is. */
interface RootMatch {
  on: number;
  specificity: Specificity;
}

const NO_SPECIFICITY: Specificity = [0, 0];

function compareSpecificity(a: Specificity, b: Specificity): number {
  return a[0] - b[0] || a[1] - b[1];
}

/** Positive when match `a` reaches the content over `b`: set nearer it, then more specific. */
function compareMatches(a: RootMatch, b: RootMatch): number {
  return a.on - b.on || compareSpecificity(a.specificity, b.specificity);
}

/** What a block contributes to every rule inside it, worked out once, when it opens. */
interface Block {
  /** The selector chain, outermost first, at-rules included, cut at `LIMITS.under`. */
  under: string;
  cut: boolean;
  /** Where the chain applies at the document's root as served, or null when it does not. */
  match: RootMatch | null;
  dark: boolean;
  prefersDark: boolean;
  fontFace: boolean;
  /** The cascade layer, as the order of each step of its path; empty when unlayered. */
  layer: readonly number[];
  /** Whether every block around this one is a cascade layer, so a class rule in it styles that class anywhere. */
  plain: boolean;
  /** The class this block styles when it is a plain rule for one class, in plain context. */
  utility: string | null;
}

const ROOT: Block = {
  under: '',
  cut: false,
  match: { on: ON_ROOT, specificity: NO_SPECIFICITY },
  dark: false,
  prefersDark: false,
  fontFace: false,
  layer: [],
  plain: true,
  utility: null,
};

interface Rule {
  block: Block;
  /** Each declaration's text, in source order. */
  declarations: string[];
}

/**
 * The cascade layers, ordered by first appearance, as a browser orders them:
 * by an `@layer a, b;` statement or by the first block naming the layer. A
 * layer's path is the order of each of its steps, so `a.b` sits inside `a`.
 */
class LayerOrder {
  private readonly indices = new Map<string, number>();
  private anonymous = 0;

  /** The path of the layer `name` (dotted, or empty for an anonymous layer) declared inside `parent`. */
  path(parent: readonly number[], name: string): readonly number[] {
    const path = [...parent];
    const steps = name === '' ? [`\0${(this.anonymous += 1)}`] : name.split('.');
    for (const step of steps) {
      if (path.length >= LIMITS.depth) break;
      // Keyed by the parent's index rather than its dotted name, so a long name is never copied into its children.
      const key = `${path[path.length - 1] ?? -1}/${step.trim()}`;
      let index = this.indices.get(key);
      if (index === undefined) {
        index = this.indices.size;
        this.indices.set(key, index);
      }
      path.push(index);
    }
    return path;
  }
}

/**
 * Every block's declarations as rules, in source order across the sheets.
 *
 * A stylesheet here is a stranger's, possibly truncated by the host's size
 * cap, so the scan reads it the way a browser's tokenizer would rather than
 * trusting it to be well formed. A comment is dropped, and one never closed
 * runs to the end of the sheet. A brace inside a string (`content:"{"`) or
 * escaped in a selector is text, and so is a `;` inside parentheses
 * (`url(data:image/png;base64,…)`). A `;` at the top level ends a statement
 * (`@charset`, `@import`, `@layer a, b;`), so it never joins the next rule's
 * selector. A block's declarations written before a nested rule are a rule of
 * their own, placed before the nested one, so source order still decides which
 * value wins. And the end of a sheet closes every block it left open.
 */
class StylesheetScan {
  readonly rules: Rule[] = [];
  private readonly layers = new LayerOrder();

  constructor(
    private readonly htmlAttrs: Attrs,
    private readonly bodyAttrs: Attrs,
  ) {}

  /** Reads one sheet, under the media its `<link>` or `<style>` names, when it names one. */
  read(css: string, media: string | null = null): void {
    const stack: Block[] = [];
    // A sheet applied under a medium is read as if a `@media` block held it,
    // and a stray `}` cannot close that block, since it is not on the stack.
    const base = media === null ? ROOT : this.open(ROOT, `@media ${media}`);
    const current = () => stack[stack.length - 1] ?? base;
    let declarations: string[] = [];
    // The text since the last `{`, `}` or `;`, comments removed, and where the part not yet added to it starts.
    let pending = '';
    let segment = 0;
    let quote: string | null = null;
    let parens = 0;
    // How deep the scan is inside a block past `LIMITS.depth`, which it skips.
    let skipping = 0;
    const declare = (text: string) => {
      if (stack.length > 0 && text.trim()) declarations.push(text);
    };
    const emit = () => {
      if (declarations.length > 0) this.rules.push({ block: current(), declarations });
      declarations = [];
    };
    for (let i = 0; i < css.length; i += 1) {
      const char = css[i];
      if (quote !== null) {
        if (char === '\\') i += 1;
        // A newline ends an unclosed string, as it does in CSS.
        else if (char === quote || char === '\n') quote = null;
        continue;
      }
      if (char === '\\') {
        i += 1;
        continue;
      }
      if (char === '"' || char === "'") {
        quote = char;
        continue;
      }
      if (char === '/' && css[i + 1] === '*') {
        pending += css.slice(segment, i);
        const end = css.indexOf('*/', i + 2);
        i = end === -1 ? css.length : end + 1;
        segment = i + 1;
        continue;
      }
      if (char === '(') parens += 1;
      else if (char === ')') parens = Math.max(0, parens - 1);
      if (char !== '{' && char !== '}' && (char !== ';' || parens > 0)) continue;
      const text = pending + css.slice(segment, i);
      pending = '';
      segment = i + 1;
      if (char !== ';') parens = 0;
      if (skipping > 0) {
        if (char === '{') skipping += 1;
        else if (char === '}') skipping -= 1;
        continue;
      }
      if (char === '{') {
        emit();
        if (stack.length >= LIMITS.depth) skipping = 1;
        else stack.push(this.open(current(), text.trim()));
      } else if (char === '}') {
        // A close with nothing open is a stray, and is dropped.
        if (stack.length > 0) {
          declare(text);
          emit();
          stack.pop();
        }
      } else {
        const statement = text.trim();
        if (statement.startsWith('@')) this.statement(current(), statement);
        else declare(text);
      }
    }
    if (skipping === 0) declare(pending + css.slice(segment));
    while (stack.length > 0) {
      emit();
      stack.pop();
    }
  }

  private open(parent: Block, prelude: string): Block {
    const layered = /^@layer\b/.test(prelude);
    const layerName = layered ? prelude.slice('@layer'.length).trim() : '';
    // A block names one layer: `@layer a, b { … }` is invalid, and a browser drops it.
    const valid = !layered || !layerName.includes(',');
    const joined = parent.under ? `${parent.under} ${prelude}` : prelude;
    const cut = parent.cut || joined.length > LIMITS.under;
    return {
      under: parent.cut ? parent.under : cut ? `${joined.slice(0, LIMITS.under)}…` : joined,
      cut,
      match:
        valid && parent.match !== null
          ? matchWithin(parent.match, prelude, this.htmlAttrs, this.bodyAttrs)
          : null,
      dark: parent.dark || namesADarkScheme(prelude),
      prefersDark: parent.prefersDark || PREFERS_DARK.test(prelude),
      fontFace: parent.fontFace || prelude.startsWith('@font-face'),
      layer: layered && valid ? this.layers.path(parent.layer, layerName) : parent.layer,
      plain: parent.plain && layered && valid,
      utility: parent.plain && !prelude.startsWith('@') ? plainClass(prelude) : null,
    };
  }

  /** A statement's effect: `@layer a, b;` orders those layers; every other one is ignored. */
  private statement(parent: Block, text: string): void {
    if (!/^@layer\b/.test(text)) return;
    for (const name of text.slice('@layer'.length).split(',')) {
      if (name.trim()) this.layers.path(parent.layer, name.trim());
    }
  }
}

const PREFERS_DARK = /prefers-color-scheme\s*:\s*dark/;

/** A selector naming a scheme: `.dark`, or a `[data-…theme|scheme|mode…=…]` attribute. */
function namesADarkScheme(prelude: string): boolean {
  if (/\.dark\b/.test(prelude)) return true;
  for (const match of prelude.matchAll(/\[data-([\w-]*)=/g)) {
    if (/theme|scheme|mode/.test(match[1]!)) return true;
  }
  return false;
}

/** The class a plain single-class selector names, unescaped: `.bg-white\/10` -> `bg-white/10`. */
function plainClass(prelude: string): string | null {
  const match = /^\.((?:\\.|[\w-])+)$/.exec(prelude);
  return match ? match[1]!.replace(/\\(.)/g, '$1') : null;
}

interface Declaration {
  property: string;
  /** The value, without its `!important`. */
  value: string;
  /** The value as written. */
  written: string;
  important: boolean;
}

function declarationOf(text: string): Declaration | null {
  const colon = text.indexOf(':');
  if (colon === -1) return null;
  const property = text.slice(0, colon).trim();
  const written = text.slice(colon + 1).trim();
  // Read from the last `!`, so no pattern runs over the whole value.
  const bang = written.lastIndexOf('!');
  const important = bang !== -1 && /^!\s*important$/i.test(written.slice(bang));
  return {
    property,
    value: important ? written.slice(0, bang).trimEnd() : written,
    written,
    important,
  };
}

/** Whether an at-rule holds for the document AS SERVED: on a screen, in the scheme it starts in. */
function atRuleHolds(member: string): boolean {
  if (!/^@media\b/.test(member)) return /^@(?:layer|supports)\b/.test(member);
  if (PREFERS_DARK.test(member)) return false;
  return !/\bprint\b/.test(member) || /\bscreen\b/.test(member);
}

/**
 * Where a member of a rule's selector chain applies at the document's root as
 * served, given where its parent applies, or null when it does not: an
 * at-rule that holds keeps its parent's place, and a style rule takes the
 * strongest of its selectors that match, adding its parent's specificity as
 * nesting does. A selector this reader cannot parse (a descendant, most
 * pseudo-classes) is taken as not applying at the root.
 */
function matchWithin(
  parent: RootMatch,
  member: string,
  htmlAttrs: Attrs,
  bodyAttrs: Attrs,
): RootMatch | null {
  if (member.startsWith('@')) return atRuleHolds(member) ? parent : null;
  let best: RootMatch | null = null;
  for (const alternative of selectorList(member)) {
    const match = rootSelectorMatch(alternative, htmlAttrs, bodyAttrs);
    if (match !== null && (best === null || compareMatches(match, best) > 0)) best = match;
  }
  if (best === null) return null;
  return {
    on: best.on,
    specificity: [
      parent.specificity[0] + best.specificity[0],
      parent.specificity[1] + best.specificity[1],
    ],
  };
}

/**
 * A selector list cut at its top-level commas, each item trimmed: a comma
 * inside parentheses, brackets or a string, or escaped (`\,`, as Tailwind
 * writes one in a class name), separates nothing. One pass, so a list whose
 * brackets never close costs no more than its length.
 */
function selectorList(text: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '\\') {
      i += 1;
    } else if (quote !== null) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '(' || char === '[') {
      depth += 1;
    } else if ((char === ')' || char === ']') && depth > 0) {
      depth -= 1;
    } else if (char === ',' && depth === 0) {
      items.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  items.push(text.slice(start).trim());
  return items;
}

/**
 * A compound selector cut into its parts, or null when part of it is none of
 * them. The pattern is sticky, so each part must start where the last ended,
 * and a bracket never closed fails once rather than from every bracket. A
 * combinator is none of them, so a selector reaching past the element it
 * starts on fails here.
 */
function partsOf(text: string, part: RegExp): string[] | null {
  const parts: string[] = [];
  part.lastIndex = 0;
  while (part.lastIndex < text.length) {
    const match = part.exec(text);
    if (!match) return null;
    parts.push(match[0]);
  }
  return parts;
}

const COMPOUND_PART = /\.(?:\\.|[\w-])+|\[[^\]]*\]|:not\([^)]*\)|::?[\w-]+(?:\([^)]*\))?/y;
const NEGATED_PART = /\.(?:\\.|[\w-])+|\[[^\]]*\]/y;

/** The selectors a `:not(…)` part negates, each cut into its parts, or null when one is not a compound this reader reads. */
function negatedSelectors(part: string): string[][] | null {
  const selectors: string[][] = [];
  for (const item of selectorList(part.slice(':not('.length, -1))) {
    const parts = partsOf(item, NEGATED_PART);
    if (parts === null || parts.length === 0) return null;
    selectors.push(parts);
  }
  return selectors;
}

/** What one part of a compound adds to its specificity: one, or for `:not(…)` its most specific argument's. */
function partWeight(part: string): number {
  if (!part.startsWith(':not(')) return 1;
  return (negatedSelectors(part) ?? []).reduce((most, parts) => Math.max(most, parts.length), 0);
}

/**
 * A compound selector for the root or the body - `:root`, `html.dark`,
 * `body[data-theme=x]`, `[data-md-color-scheme="default"]`, `:not(.light)`,
 * `*` - matched against the attributes the page was served with: where it
 * applies, or null when it applies at neither.
 */
function rootSelectorMatch(selector: string, htmlAttrs: Attrs, bodyAttrs: Attrs): RootMatch | null {
  const head = /^(?::root|html|body|\*)/.exec(selector)?.[0] ?? null;
  const rest = head === null ? selector : selector.slice(head.length);
  if (head === null && rest === '') return null;
  const parts = partsOf(rest, COMPOUND_PART);
  if (parts === null) return null;
  const specificity: Specificity = [
    (head === ':root' ? 1 : 0) + parts.reduce((sum, part) => sum + partWeight(part), 0),
    head === 'html' || head === 'body' ? 1 : 0,
  ];
  if (head === '*' && parts.length === 0) return { on: ON_EVERY, specificity };
  const matches = (attrs: Attrs, root: boolean) =>
    parts.every((part) => partMatches(part, attrs, root));
  if (head !== ':root' && head !== 'html' && matches(bodyAttrs, false)) {
    return { on: ON_BODY, specificity };
  }
  if (head !== 'body' && matches(htmlAttrs, true)) return { on: ON_ROOT, specificity };
  return null;
}

/** Whether one part of a compound matches an element, given its attributes and whether it is the root. */
function partMatches(part: string, attrs: Attrs, root: boolean): boolean {
  if (part.startsWith('.'))
    return wordsOf(attrs, 'class').has(part.slice(1).replace(/\\(.)/g, '$1'));
  if (part.startsWith('[')) {
    const match = /^\[\s*([\w-]+)\s*(?:([~|^$*]?=)\s*("[^"]*"|'[^']*'|[^\]\s]+))?\s*\]$/.exec(part);
    if (!match) return false;
    const name = match[1]!.toLowerCase();
    const actual = attribute(attrs, name);
    if (actual === undefined) return false;
    if (!match[2]) return true;
    const wanted = match[3]!.replace(/^["']|["']$/g, '');
    switch (match[2]) {
      case '=':
        return actual === wanted;
      case '~=':
        return wordsOf(attrs, name).has(wanted);
      // An empty value matches nothing for the three substring tests.
      case '^=':
        return wanted !== '' && actual.startsWith(wanted);
      case '$=':
        return wanted !== '' && actual.endsWith(wanted);
      case '*=':
        // The one test whose cost is the attribute's length rather than the selector's.
        return wanted !== '' && actual.length <= LIMITS.attribute && actual.includes(wanted);
      case '|=':
        return actual === wanted || actual.startsWith(`${wanted}-`);
      default:
        return false;
    }
  }
  if (part.startsWith(':not(')) {
    const negated = negatedSelectors(part);
    return (
      negated !== null &&
      !negated.some((parts) => parts.every((inner) => partMatches(inner, attrs, root)))
    );
  }
  return part === ':root' && root;
}

/** Where a declaration stands in the cascade, as far as this reader weighs it. */
interface Standing {
  important: boolean;
  layer: readonly number[];
  /** Its selector's specificity, when the rule applies at the root; nothing otherwise. */
  specificity: Specificity;
  /** Its place in source order across the page's CSS. */
  order: number;
}

/**
 * Positive when `a` wins over `b` on one element, by the cascade as this
 * reader weighs it: importance, then cascade layer, then specificity, then
 * source order. Only declarations whose specificity was measured are
 * compared: the ones that apply at the root, and a utility's own rules, which
 * share one selector.
 */
function cascade(a: Standing, b: Standing): number {
  if (a.important !== b.important) return a.important ? 1 : -1;
  const layers = compareLayers(a.layer, b.layer);
  // An important declaration reverses the layer order, as the cascade does.
  if (layers !== 0) return a.important ? -layers : layers;
  return compareSpecificity(a.specificity, b.specificity) || a.order - b.order;
}

/**
 * Positive when layer `a` outranks layer `b` for a normal declaration: a later
 * layer beats an earlier one, and a layer's own declarations beat those of the
 * layers inside it - so unlayered ones, whose path is empty, beat every layer.
 */
function compareLayers(a: readonly number[], b: readonly number[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    if (a[i] !== b[i]) return a[i]! - b[i]!;
  }
  return b.length - a.length;
}

interface PropertyEntry extends Standing {
  value: string;
  written: string;
  under: string;
  /** What it is set on when it applies at the root (`ON_ROOT`, `ON_BODY`, `ON_EVERY`), or null. */
  on: number | null;
}

/**
 * The declaration the page's content sees as served, or null when none
 * applies: the one set nearest the content, then the cascade's winner there.
 */
function winning(entries: readonly PropertyEntry[]): PropertyEntry | null {
  let best: PropertyEntry | null = null;
  for (const entry of entries) {
    if (entry.on === null) continue;
    if (best === null || (entry.on - (best.on ?? ON_ROOT) || cascade(entry, best)) > 0) {
      best = entry;
    }
  }
  return best;
}

/**
 * The custom properties to record, at most `keep`: the most referenced, so a
 * site's own palette is not cut for a framework's that happens to come first,
 * then listed in the order they first appear.
 */
function recordedProperties(
  properties: ReadonlyMap<string, PropertyEntry[]>,
  references: ReadonlyMap<string, number>,
  keep: number,
): PropertyFacts[] {
  const names = [...properties.keys()];
  const kept = new Set(
    names
      .map((name, index) => ({ name, index, references: references.get(name) ?? 0 }))
      .sort((a, b) => b.references - a.references || a.index - b.index)
      .slice(0, keep)
      .map((entry) => entry.name),
  );
  return names
    .filter((name) => kept.has(name))
    .map((name) => {
      const entries = properties.get(name)!;
      return {
        name,
        asServed: winning(entries)?.value ?? null,
        references: references.get(name) ?? 0,
        values: entries
          .slice(0, KEEP.values)
          .map(({ written, under }) => ({ value: written, under })),
      };
    });
}

interface VarReference {
  name: string;
  fallback: string | null;
  /** Where the reference ends: after its `)`, or at the end of the value when it is never closed. */
  end: number;
}

const VAR_NAME = /\s*(--[\w-]+)\s*/y;

/** The `var()` reference that starts at `start`, or null when what follows `var(` is not one. */
function varAt(value: string, start: number): VarReference | null {
  VAR_NAME.lastIndex = start + 'var('.length;
  const name = VAR_NAME.exec(value);
  if (!name) return null;
  const after = VAR_NAME.lastIndex;
  if (value[after] === ')') return { name: name[1]!, fallback: null, end: after + 1 };
  if (value[after] !== ',') return null;
  // The fallback runs to the parenthesis that closes the reference, nested ones
  // included; a browser closes a function the value ends inside.
  let depth = 1;
  let close = after + 1;
  for (; close < value.length; close += 1) {
    if (value[close] === '(') depth += 1;
    else if (value[close] === ')' && --depth === 0) break;
  }
  return {
    name: name[1]!,
    fallback: value.slice(after + 1, close).trim(),
    end: Math.min(close + 1, value.length),
  };
}

/**
 * `var()` substitution, by the value each property has as served: a property
 * with none takes the reference's own fallback, and a reference with neither
 * is left as written, as is a cycle. A property is resolved once, and the
 * characters substitution adds over the whole reading are bounded, so no sheet
 * can make it costlier than its own length.
 */
class VarResolver {
  private readonly resolved = new Map<string, string | null>();
  private readonly resolving = new Set<string>();
  private budget = LIMITS.substitution;

  constructor(private readonly served: ReadonlyMap<string, string>) {}

  resolve(value: string, depth = 0): string {
    if (depth > LIMITS.varDepth || !value.includes('var(')) return value;
    let out = '';
    let from = 0;
    for (
      let start = value.indexOf('var(', from);
      start !== -1;
      start = value.indexOf('var(', from)
    ) {
      const reference = varAt(value, start);
      if (!reference) {
        out += value.slice(from, start + 'var('.length);
        from = start + 'var('.length;
        continue;
      }
      const replacement =
        this.property(reference.name, depth) ??
        (reference.fallback === null ? null : this.resolve(reference.fallback, depth + 1));
      const substituted = replacement !== null && replacement.length <= this.budget;
      if (substituted) this.budget -= replacement.length;
      out +=
        value.slice(from, start) + (substituted ? replacement : value.slice(start, reference.end));
      from = reference.end;
    }
    return out + value.slice(from);
  }

  private property(name: string, depth: number): string | null {
    const known = this.resolved.get(name);
    if (known !== undefined) return known;
    const served = this.served.get(name);
    // A property that refers back to itself is invalid as served, as in a browser.
    if (served === undefined || this.resolving.has(name)) return null;
    this.resolving.add(name);
    const resolved = this.resolve(served, depth + 1);
    this.resolving.delete(name);
    this.resolved.set(name, resolved);
    return resolved;
  }
}

const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/i;
const HEX = /#[0-9a-f]{3,8}\b/i;
const NAMED = /\b(?:white|black|transparent|currentcolor)\b/i;
const TRIPLET =
  /^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*$|^\s*\d{1,3}(?:\.\d+)?\s+\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%\s*$/;

function looksLikeColor(value: string): boolean {
  return HEX.test(value) || COLOR_FUNCTION.test(value) || NAMED.test(value) || TRIPLET.test(value);
}

function looksLikeColorProperty(name: string, value: string): boolean {
  return (
    looksLikeColor(value) ||
    /color|bg|background|fg|foreground|accent|primary|border|ring|surface|canvas|brand/i.test(name)
  );
}

const COLOR_PROPERTIES = new Set([
  'color',
  'background',
  'background-color',
  'border-color',
  'border-top-color',
  'border-bottom-color',
  'border-left-color',
  'border-right-color',
  'outline-color',
  'fill',
  'stroke',
  'box-shadow',
  'text-decoration-color',
  'caret-color',
  'accent-color',
]);

/**
 * Every colour literal in a value, nested parentheses included: `#00bb95`,
 * `rgb(0 187 149 / .5)`. One pass pairs each parenthesis with its opener, so
 * a function never closed costs nothing more; a browser closes one the value
 * ends inside, so it is read to the end of the value.
 */
function colorLiterals(value: string): string[] {
  const found: string[] = [];
  for (const match of value.matchAll(/#[0-9a-f]{3,8}\b/gi)) found.push(match[0].toLowerCase());
  const starts = new Map<number, number>();
  for (const match of value.matchAll(/\b(?:rgba?|hsla?|oklch|oklab|hwb|lab|lch)\(/gi)) {
    starts.set(match.index + match[0].length - 1, match.index);
  }
  if (starts.size === 0) return found;
  const literal = (start: number, end: number) => {
    if (end - start > LIMITS.literal) return;
    found.push(value.slice(start, end).toLowerCase().replace(/\s+/g, ' '));
  };
  // For each open parenthesis, where its colour function starts, or -1.
  const open: number[] = [];
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === '(') open.push(starts.get(i) ?? -1);
    else if (value[i] === ')' && open.length > 0) {
      const start = open.pop()!;
      if (start !== -1) literal(start, i + 1);
    }
  }
  for (const start of open) if (start !== -1) literal(start, value.length);
  return found;
}

function rank(counts: Map<string, number>, keep: number): Ranked[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || byCodeUnit(a[0], b[0]))
    .slice(0, keep)
    .map(([value, count]) => ({ value, count }));
}

function count(counts: Map<string, number>, key: string) {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

// ─── The utilities the markup uses, by frequency ─────────────────────────────

const NOT_A_COLOR: Record<string, RegExp> = {
  text: /^text-(?:(?:\d*x[sl]|sm|md|base|lg)(?:\/[\w.[\]-]+)?|left|center|right|justify|start|end|nowrap|wrap|balance|pretty|ellipsis|clip|top|middle|bottom|baseline|sub|super)$|^text-\[(?:\d|\.\d|length:|size:)/,
  bg: /^bg-(?:cover|contain|auto|center|top|bottom|left|right|no-repeat|repeat|fixed|local|scroll|clip|origin|none|blend|gradient|linear|radial|conic|\[url|\[image|\[length|\[position|\[size)/,
  border:
    /^border-(?:x|y|t|b|l|r|s|e|\d+|none|solid|dashed|dotted|double|hidden|collapse|separate|spacing)(?:-|$)|^border-\[\d/,
  ring: /^ring-(?:\d+|inset|offset)(?:-|$)|^ring-\[\d/,
  shadow: /^shadow-(?:xs|sm|md|lg|xl|2xl|none|inner)$|^shadow-\[\d/,
  outline: /^outline-(?:\d+|none|solid|dashed|dotted|double|offset|hidden)(?:-|$)/,
  divide: /^divide-(?:x|y|\d+|solid|dashed|dotted|double|none)(?:-|$)/,
  from: /^from-\d+%$/,
  via: /^via-\d+%$/,
  to: /^to-\d+%$/,
  fill: /^fill-none$/,
  stroke: /^stroke-\d+$/,
};

/** A class without its variants: `hover:md:bg-white/10` -> `bg-white/10`. */
function withoutVariants(cls: string): string {
  return cls.replace(/^(?:[a-z-]+:)*/, '');
}

/** What a utility's own rule declares, by the declaration that wins for each property. */
interface UtilityRule {
  /** The value its first colour property is set to, or null when it sets none. */
  paints: string | null;
  /** Whether it sets a type size and paints nothing: `text-xs-tight` is a size, whatever its name says. */
  sizeOnly: boolean;
}

function utilityRuleOf(
  bare: string,
  rules: ReadonlyMap<string, UtilityRule>,
): UtilityRule | undefined {
  return rules.get(bare) ?? rules.get(bare.replace(/\/\d+$/, ''));
}

function isColorUtility(cls: string, rules: ReadonlyMap<string, UtilityRule>): boolean {
  const match =
    /^(?:[a-z-]+:)*((text|bg|border|ring|shadow|outline|divide|from|via|to|fill|stroke|placeholder|decoration|accent|caret)-)/.exec(
      cls,
    );
  if (!match) return false;
  const bare = withoutVariants(cls);
  const exclusion = NOT_A_COLOR[match[2]!];
  if (exclusion && exclusion.test(bare)) return false;
  return !utilityRuleOf(bare, rules)?.sizeOnly;
}

const ARBITRARY_COLOR = /^(?:#[0-9a-f]{3,8}|(?:rgba?|hsla?|oklch|oklab|color)\(.*\))$/i;

/** The colour a utility paints, read from the stylesheets: `text-accent-teal` -> `#00bb95`. */
function resolveUtility(
  cls: string,
  rules: ReadonlyMap<string, UtilityRule>,
  resolver: VarResolver,
): string | null {
  const bare = withoutVariants(cls);
  const open = bare.indexOf('[');
  const close = open === -1 ? -1 : bare.indexOf(']', open);
  if (close !== -1) {
    const arbitrary = bare.slice(open + 1, close);
    if (ARBITRARY_COLOR.test(arbitrary)) return arbitrary;
  }
  const paints = utilityRuleOf(bare, rules)?.paints;
  return paints == null ? null : resolver.resolve(paints);
}

/** Where a Next.js image URL's original file is, or null when it is not one or its escapes are malformed. */
function nextImageOriginal(src: string, base: string): string | null {
  let url: URL;
  try {
    url = new URL(src, base);
  } catch {
    return null;
  }
  if (!url.pathname.endsWith('/_next/image')) return null;
  const param = url.search
    .slice(1)
    .split('&')
    .find((pair) => pair.startsWith('url='));
  const original = param ? decoded(param.slice('url='.length)) : null;
  return original ? resolveUrl(original, base) : null;
}

/** The `<svg>` tags inside each `<header>` or `<nav>`, a logo's usual place. */
function headerSvgs(html: string): SiteFacts['logos']['headerSvgs'] {
  const found: SiteFacts['logos']['headerSvgs'] = [];
  const open = /<(?:header|nav)\b/gi;
  const close = /<\/(?:header|nav)>/gi;
  for (let match = open.exec(html); match; match = open.exec(html)) {
    close.lastIndex = open.lastIndex;
    const end = close.exec(html);
    if (!end) break;
    for (const attrs of tagsOf(html.slice(match.index, end.index), 'svg')) {
      if (found.length === KEEP.headerSvgs) return found;
      found.push({
        ariaLabel: attrs['aria-label'] ?? null,
        class: attrs.class ?? null,
        viewBox: attrs.viewbox ?? null,
      });
    }
    open.lastIndex = close.lastIndex;
  }
  return found;
}

// ─── The reading ─────────────────────────────────────────────────────────────

export function siteFacts(page: FetchedPage): SiteFacts {
  const { html } = page;
  const base = page.finalUrl;
  const metas = tagsOf(html, 'meta');
  const markup = linksAndStyles(html);
  const links = linksOf(markup);
  const htmlAttrs = firstTag(html, 'html');
  const bodyAttrs = firstTag(html, 'body');

  const sheets = cssInDocumentOrder(page, markup);
  const scan = new StylesheetScan(htmlAttrs, bodyAttrs);
  for (const { css, media } of sheets.texts) scan.read(css, media);

  // Custom properties, with the selector chain they are declared under. A
  // site with two schemes declares the same name twice, under `:root` and
  // under `.dark` (or a `[data-…]` attribute), and the chain is what tells
  // them apart. Tailwind's own internals (`--tw-ring-color`, `--tw-shadow`,
  // the prose palette) are the framework's, not the site's.
  const custom = new Map<string, PropertyEntry[]>();
  const references = new Map<string, number>();
  // What the markup's utilities style, by class: the winning declaration of each property.
  const utilityDeclarations = new Map<string, Map<string, Standing & { value: string }>>();
  // The colour declarations, read once every property is known.
  const colorValues: string[] = [];
  const fontFamilies = new Map<string, number>();
  const fontFaces = new Set<string>();
  const radii = new Map<string, number>();
  const colorSchemes = new Map<string, number>();
  let darkSelectors = 0;
  let prefersDark = 0;
  let order = 0;
  for (const { block, declarations } of scan.rules) {
    if (block.dark) darkSelectors += 1;
    if (block.prefersDark) prefersDark += 1;
    const under = block.under || ':root';
    for (const text of declarations) {
      const declaration = declarationOf(text);
      if (!declaration) continue;
      const { property, value, important } = declaration;
      const standing: Standing = {
        important,
        layer: block.layer,
        specificity: block.match?.specificity ?? NO_SPECIFICITY,
        order: (order += 1),
      };
      for (const reference of value.matchAll(/var\(\s*(--[\w-]+)/g))
        count(references, reference[1]!);
      if (block.utility !== null) {
        let styled = utilityDeclarations.get(block.utility);
        if (!styled) {
          styled = new Map();
          utilityDeclarations.set(block.utility, styled);
        }
        const winner = styled.get(property);
        if (!winner || cascade(standing, winner) > 0) styled.set(property, { ...standing, value });
      }
      if (property.startsWith('--')) {
        if (property.startsWith('--tw-')) continue;
        let entries = custom.get(property);
        if (!entries) {
          entries = [];
          custom.set(property, entries);
        }
        entries.push({
          ...standing,
          value,
          written: declaration.written,
          under,
          on: block.match?.on ?? null,
        });
        continue;
      }
      if (property === 'font-family') count(fontFamilies, value.replace(/\s+/g, ' '));
      if (property === 'border-radius') count(radii, value);
      if (property === 'color-scheme') count(colorSchemes, `${value} @ ${under}`);
      if (block.fontFace && property === 'font-family') fontFaces.add(value.replace(/["']/g, ''));
      if (COLOR_PROPERTIES.has(property)) colorValues.push(value);
    }
  }

  // A radius is a length, whatever else its name says (`--border-radius`), so
  // it is kept on its own rather than read as a colour; a property is a colour
  // when its name says so or one of its values is one.
  const colorProperties = new Map<string, PropertyEntry[]>();
  const radiusProperties = new Map<string, PropertyEntry[]>();
  const served = new Map<string, string>();
  for (const [name, entries] of custom) {
    const winner = winning(entries);
    if (winner) served.set(name, winner.value);
    if (/radius/i.test(name)) radiusProperties.set(name, entries);
    else if (entries.some((entry) => looksLikeColorProperty(name, entry.value))) {
      colorProperties.set(name, entries);
    }
  }
  const resolver = new VarResolver(served);

  const literals = new Map<string, number>();
  for (const value of colorValues) {
    for (const literal of colorLiterals(resolver.resolve(value))) count(literals, literal);
  }

  const utilityRules = new Map<string, UtilityRule>();
  for (const [name, styled] of utilityDeclarations) {
    const paints = [...styled.entries()].find(([property]) => COLOR_PROPERTIES.has(property));
    utilityRules.set(name, {
      paints: paints ? paints[1].value : null,
      sizeOnly: !paints && styled.has('font-size'),
    });
  }

  // The classes the markup carries, by frequency, colour utilities only.
  const utilities = new Map<string, number>();
  const fontUtilities = new Map<string, number>();
  const radiusUtilities = new Map<string, number>();
  for (const match of html.matchAll(/\bclass(?:Name)?=(?:"([^"]*)"|'([^']*)')/g)) {
    for (const cls of (match[1] ?? match[2]!).split(/\s+/).filter(Boolean)) {
      const bare = withoutVariants(cls);
      if (isColorUtility(cls, utilityRules)) count(utilities, bare);
      if (
        /^font-(?!(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\[\d|\d))/.test(
          bare,
        )
      )
        count(fontUtilities, bare);
      if (/^rounded(?:-|$)/.test(bare)) count(radiusUtilities, bare);
    }
  }

  const webfontLinks = links
    .map((link) => link.href)
    .filter(
      (href): href is string =>
        !!href &&
        /fonts\.googleapis\.com|fonts\.bunny\.net|use\.typekit\.net|fonts\.cdnfonts\.com/.test(
          href,
        ),
    );
  const googleFamilies = webfontLinks.flatMap((href) =>
    [...href.matchAll(/family=([^&:]+)/g)]
      .map((match) => decoded(match[1]!)?.replace(/\+/g, ' ') ?? null)
      .filter((family): family is string => family !== null),
  );
  const fontPreloads = links
    .filter((link) => /\bpreload\b/i.test(link.rel ?? '') && link.as === 'font' && link.href)
    .map((link) => resolveUrl(link.href!, base))
    .filter((url): url is string => url !== null);

  // Logo candidates: an image whose alt, source or class says so, or whose alt
  // is the site's name; the icons; the social image. A Next.js image URL is
  // decoded to the original file too, since that is the one a page can load.
  const siteName =
    metaContent(metas, 'og:site_name') ?? metaContent(metas, 'application-name') ?? null;
  const logos: LogoCandidate[] = [];
  const seen = new Set<string>();
  const addLogo = (candidate: LogoCandidate) => {
    if (!candidate.url || seen.has(candidate.url)) return;
    seen.add(candidate.url);
    logos.push(candidate);
  };
  for (const img of tagsOf(html, 'img')) {
    const src = img.src ?? img['data-src'] ?? null;
    if (!src) continue;
    const alt = img.alt ?? '';
    const says = /logo|brand|wordmark/i.test(`${alt} ${src} ${img.class ?? ''}`);
    const named = siteName ? alt.toLowerCase().startsWith(siteName.toLowerCase()) : false;
    if (!says && !named) continue;
    const candidate: LogoCandidate = {
      url: resolveUrl(src, base),
      alt,
      width: img.width ?? null,
      height: img.height ?? null,
      class: img.class ?? null,
    };
    const original = nextImageOriginal(src, base);
    if (original) candidate.original = original;
    addLogo(candidate);
  }
  for (const link of links) {
    if (!/\b(?:icon|apple-touch-icon|mask-icon)\b/i.test(link.rel ?? '') || !link.href) continue;
    addLogo({
      url: resolveUrl(link.href, base),
      rel: link.rel!,
      sizes: link.sizes ?? null,
      type: link.type ?? null,
    });
  }
  const ogImage = metaContent(metas, 'og:image');
  if (ogImage) addLogo({ url: resolveUrl(ogImage, base), rel: 'og:image' });

  const themeColors = metas
    .filter((meta) => meta.name === 'theme-color')
    .slice(0, KEEP.themeColors)
    .map((meta) => ({ content: meta.content ?? null, media: meta.media ?? null }));

  const dataAttributes = (attrs: Attrs) =>
    Object.fromEntries(Object.entries(attrs).filter(([key]) => key.startsWith('data-')));

  const encoder = new TextEncoder();
  return {
    url: page.url,
    finalUrl: base,
    fetchedAt: page.fetchedAt,
    site: {
      name: siteName,
      title: textOf(html, 'title'),
      description: metaContent(metas, 'description') ?? metaContent(metas, 'og:description'),
      lang: htmlAttrs.lang ?? null,
    },
    scheme: {
      htmlClass: htmlAttrs.class ?? null,
      htmlDataAttributes: dataAttributes(htmlAttrs),
      bodyClass: bodyAttrs.class ?? null,
      bodyDataAttributes: dataAttributes(bodyAttrs),
      themeColorMetas: themeColors,
      colorSchemeDeclarations: rank(colorSchemes, KEEP.colorSchemes).map((entry) => entry.value),
      rulesUnderADarkSelector: darkSelectors,
      rulesUnderPrefersDark: prefersDark,
    },
    stylesheets: page.stylesheets.map((sheet) =>
      'css' in sheet ? { url: sheet.url, bytes: encoder.encode(sheet.css).byteLength } : sheet,
    ),
    inlineStyleBlocks: sheets.inlineBlocks,
    colors: {
      customProperties: recordedProperties(colorProperties, references, KEEP.properties),
      literalsByFrequency: rank(literals, KEEP.literals),
      utilitiesByFrequency: rank(utilities, KEEP.utilities).map((entry) => ({
        ...entry,
        resolves: resolveUtility(entry.value, utilityRules, resolver),
      })),
    },
    typography: {
      fontFamiliesByFrequency: rank(fontFamilies, KEEP.fontFamilies),
      fontFaces: [...fontFaces].slice(0, KEEP.fontFaces),
      webfontLinks: webfontLinks.slice(0, KEEP.webfonts),
      googleFamilies: [...new Set(googleFamilies)].slice(0, KEEP.webfonts),
      fontPreloads: fontPreloads.slice(0, KEEP.webfonts),
      utilitiesByFrequency: rank(fontUtilities, KEEP.fontUtilities),
    },
    shape: {
      radiiByFrequency: rank(radii, KEEP.radii),
      utilitiesByFrequency: rank(radiusUtilities, KEEP.radiusUtilities),
      radiusProperties: recordedProperties(radiusProperties, references, KEEP.radiusProperties),
    },
    logos: { candidates: logos.slice(0, KEEP.logos), headerSvgs: headerSvgs(html) },
  };
}
