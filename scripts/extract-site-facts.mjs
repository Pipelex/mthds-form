#!/usr/bin/env node
/**
 * Pull a website's design facts off its HTML and stylesheets, as data.
 *
 * The brand producer's first input, and deliberately not a model: what a
 * site declares is a matter of fact - which class its `<html>` carries, which
 * custom properties its stylesheets set and under which selector, which colour
 * utilities its markup uses most, which typefaces it loads, which radii it
 * uses, which images could be its logo - and a script reads facts exactly,
 * every time, for nothing. What a model is for is the JUDGMENT that follows:
 * which of these colours is the accent and which the canvas, what the light
 * mode of a dark-only site should be, which image is the logo. So the facts
 * are recorded verbatim, ranked by frequency where frequency is the evidence,
 * capped so the record stays readable, and handed to the method as text.
 *
 *   node scripts/extract-site-facts.mjs <url> [--out <file>]
 *
 * Fetches the page and every stylesheet it links; reads inline `<style>`
 * blocks too. No browser, no script execution: a site that paints itself from
 * JavaScript alone yields fewer facts, which the record then shows. Also
 * importable: `extractSiteFacts(url)` returns the same object the command
 * writes, and `scripts/generate-brand.mjs` calls it before the method.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const USER_AGENT = 'Mozilla/5.0 (compatible; mthds-form-site-facts/1.0)';

/** How many of each ranked list to keep: enough to see the pattern, not the tail. */
const KEEP = {
  properties: 80,
  literals: 40,
  utilities: 60,
  fontFamilies: 20,
  fontUtilities: 12,
  radii: 20,
  radiusUtilities: 16,
  logos: 12,
};

// ─── Fetching ────────────────────────────────────────────────────────────────

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': USER_AGENT }, redirect: 'follow' });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return { url: response.url, text: await response.text() };
}

function resolveUrl(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

// ─── HTML, by regex: enough for tags and attributes, which is all this reads ─

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseAttrs(text) {
  const attrs = {};
  for (const match of text.matchAll(
    /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g,
  )) {
    attrs[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}

function tagsOf(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map((match) =>
    parseAttrs(match[1]),
  );
}

function firstTag(html, name) {
  const match = new RegExp(`<${name}\\b([^>]*)>`, 'i').exec(html);
  return match ? parseAttrs(match[1]) : {};
}

function textOf(html, name) {
  const match = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i').exec(html);
  return match ? decodeEntities(match[1].replace(/\s+/g, ' ').trim()) : null;
}

function metaContent(metas, key) {
  const found = metas.find((meta) => meta.property === key || meta.name === key);
  return found?.content ?? null;
}

// ─── CSS, by a small scanner: rules with their selector chain, nested at-rules kept ─

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Every leaf block as `{ selectors: [...outer, own], body }`, at-rules included in the chain. */
function rulesOf(css) {
  const rules = [];
  const stack = [];
  let prelude = '';
  let body = '';
  let depth = 0;
  for (let i = 0; i < css.length; i += 1) {
    const char = css[i];
    if (char === '{') {
      stack.push(prelude.trim());
      prelude = '';
      body = '';
      depth += 1;
    } else if (char === '}') {
      if (body.trim()) rules.push({ selectors: [...stack], body: body.trim() });
      stack.pop();
      depth -= 1;
      body = '';
      prelude = '';
    } else if (depth === 0) {
      prelude += char;
    } else {
      // Inside a block: text before a nested `{` is a prelude, text otherwise is body.
      const nextOpen = css.indexOf('{', i);
      const nextClose = css.indexOf('}', i);
      if (nextOpen !== -1 && nextOpen < nextClose) {
        prelude = css.slice(i, nextOpen);
        // Declarations before a nested rule belong to the enclosing block.
        const semicolon = prelude.lastIndexOf(';');
        if (semicolon !== -1) {
          body += prelude.slice(0, semicolon + 1);
          prelude = prelude.slice(semicolon + 1);
        }
        i = nextOpen - 1;
      } else {
        body = css.slice(i, nextClose);
        i = nextClose - 1;
      }
    }
  }
  return rules;
}

function declarationsOf(body) {
  return body
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const colon = part.indexOf(':');
      return colon === -1
        ? null
        : { property: part.slice(0, colon).trim(), value: part.slice(colon + 1).trim() };
    })
    .filter(Boolean);
}

const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/i;
const HEX = /#[0-9a-f]{3,8}\b/i;
const NAMED = /\b(?:white|black|transparent|currentcolor)\b/i;
const TRIPLET =
  /^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*$|^\s*\d{1,3}(?:\.\d+)?\s+\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%\s*$/;

function looksLikeColor(value) {
  return HEX.test(value) || COLOR_FUNCTION.test(value) || NAMED.test(value) || TRIPLET.test(value);
}

function looksLikeColorProperty(name, value) {
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

/** Every colour literal in a value, nested parentheses included: `#00bb95`, `rgb(0 187 149 / .5)`. */
function colorLiterals(value) {
  const found = [];
  for (const match of value.matchAll(/#[0-9a-f]{3,8}\b/gi)) found.push(match[0].toLowerCase());
  const open = /\b(?:rgba?|hsla?|oklch|oklab|hwb|lab|lch)\(/gi;
  let match;
  while ((match = open.exec(value)) !== null) {
    let depth = 0;
    let end = match.index + match[0].length - 1;
    for (; end < value.length; end += 1) {
      if (value[end] === '(') depth += 1;
      if (value[end] === ')') depth -= 1;
      if (depth === 0) break;
    }
    found.push(
      value
        .slice(match.index, end + 1)
        .toLowerCase()
        .replace(/\s+/g, ' '),
    );
  }
  return found;
}

function rank(counts, keep) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, keep)
    .map(([value, count]) => ({ value, count }));
}

function count(counts, key) {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

/** Substitute `var(--x)` from the collected properties, a few levels deep, when the value is known. */
function resolveVars(value, properties, depth = 0) {
  if (depth > 4 || !/var\(/.test(value)) return value;
  const substituted = value.replace(
    /var\((--[\w-]+)(?:\s*,\s*([^)]*))?\)/g,
    (whole, name, fallback) => {
      const known = properties.get(name);
      if (known) return known[0].value;
      return fallback ?? whole;
    },
  );
  return substituted === value ? value : resolveVars(substituted, properties, depth + 1);
}

// ─── The utilities the markup uses, by frequency ─────────────────────────────

const NOT_A_COLOR = {
  text: /^text-(?:xs|sm|base|lg|[2-9]?xl|\[\d|left|center|right|justify|start|end|nowrap|wrap|balance|pretty|ellipsis|clip|top|middle|bottom|baseline|sub|super)$/,
  bg: /^bg-(?:cover|contain|auto|center|top|bottom|left|right|no-repeat|repeat|fixed|local|scroll|clip|origin|none|blend|linear|radial|conic|\[url|\[image|\[length|\[position|\[size)/,
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

function isColorUtility(cls) {
  const match =
    /^(?:[a-z-]+:)*((text|bg|border|ring|shadow|outline|divide|from|via|to|fill|stroke|placeholder|decoration|accent|caret)-)/.exec(
      cls,
    );
  if (!match) return false;
  const bare = cls.replace(/^(?:[a-z-]+:)*/, '');
  const prefix = match[2];
  const exclusion = NOT_A_COLOR[prefix];
  return !(exclusion && exclusion.test(bare));
}

/** The colour a utility paints, read from the stylesheets: `text-accent-teal` -> `#00bb95`. */
function resolveUtility(cls, utilityRules, properties) {
  const bare = cls.replace(/^(?:[a-z-]+:)*/, '');
  const arbitrary = /\[(#[0-9a-f]{3,8}|(?:rgba?|hsla?|oklch|oklab|color)\([^\]]*\))\]/i.exec(bare);
  if (arbitrary) return arbitrary[1];
  const rule = utilityRules.get(bare) ?? utilityRules.get(bare.replace(/\/\d+$/, ''));
  if (!rule) return null;
  const declaration = rule.find((entry) => COLOR_PROPERTIES.has(entry.property));
  return declaration ? resolveVars(declaration.value, properties) : null;
}

// ─── The extraction ──────────────────────────────────────────────────────────

export async function extractSiteFacts(inputUrl) {
  const page = await fetchText(inputUrl);
  const html = page.text;
  const base = page.url;
  const metas = tagsOf(html, 'meta');
  const links = tagsOf(html, 'link');
  const htmlAttrs = firstTag(html, 'html');
  const bodyAttrs = firstTag(html, 'body');

  const stylesheets = [];
  for (const link of links) {
    if (!/\bstylesheet\b/i.test(link.rel ?? '') || !link.href) continue;
    const url = resolveUrl(link.href, base);
    if (!url) continue;
    try {
      const sheet = await fetchText(url);
      stylesheets.push({ url, bytes: sheet.text.length, css: sheet.text });
    } catch (error) {
      stylesheets.push({ url, error: error instanceof Error ? error.message : String(error) });
    }
  }
  const inline = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]);
  const css = stripComments([...stylesheets.map((sheet) => sheet.css ?? ''), ...inline].join('\n'));
  const rules = rulesOf(css);

  // Custom properties, with the selector chain they are declared under. A
  // site with two schemes declares the same name twice, under `:root` and
  // under `.dark` (or a `[data-…]` attribute), and the chain is what tells
  // them apart.
  const properties = new Map();
  const literals = new Map();
  const fontFamilies = new Map();
  const fontFaces = new Set();
  const radii = new Map();
  const colorSchemes = new Map();
  const utilityRules = new Map();
  let darkSelectors = 0;
  let prefersDark = 0;
  for (const rule of rules) {
    const chain = rule.selectors.join(' ');
    if (/\.dark\b|\[data-[\w-]*(?:theme|scheme|mode)[\w-]*=/.test(chain)) darkSelectors += 1;
    if (/prefers-color-scheme\s*:\s*dark/.test(chain)) prefersDark += 1;
    const declarations = declarationsOf(rule.body);
    const own = rule.selectors[rule.selectors.length - 1] ?? '';
    const single = /^\.((?:\\.|[\w-])+)(?::{1,2}[\w-]+(?:\([^)]*\))?)?$/.exec(own);
    if (single) {
      // A single-class rule: a utility, keyed by its unescaped class name.
      const name = single[1].replace(/\\(.)/g, '$1');
      if (!utilityRules.has(name)) utilityRules.set(name, declarations);
    }
    for (const { property, value } of declarations) {
      if (property.startsWith('--')) {
        // Tailwind's own internals (`--tw-ring-color`, `--tw-shadow`, the prose
        // palette) are the framework's, not the site's.
        if (property.startsWith('--tw-')) continue;
        if (!looksLikeColorProperty(property, value)) continue;
        if (!properties.has(property)) properties.set(property, []);
        properties.get(property).push({ value, under: chain || ':root' });
        continue;
      }
      if (property === 'font-family') count(fontFamilies, value.replace(/\s+/g, ' '));
      if (property === 'border-radius') count(radii, value);
      if (property === 'color-scheme') count(colorSchemes, `${value} @ ${chain || ':root'}`);
      if (
        rule.selectors.some((selector) => /^@font-face/.test(selector)) &&
        property === 'font-family'
      ) {
        fontFaces.add(value.replace(/["']/g, ''));
      }
      if (COLOR_PROPERTIES.has(property)) {
        for (const literal of colorLiterals(resolveVars(value, properties)))
          count(literals, literal);
      }
    }
  }

  // The classes the markup carries, by frequency, colour utilities only.
  const utilities = new Map();
  const fontUtilities = new Map();
  const radiusUtilities = new Map();
  for (const match of html.matchAll(/\bclass(?:Name)?="([^"]*)"/g)) {
    for (const cls of match[1].split(/\s+/).filter(Boolean)) {
      const bare = cls.replace(/^(?:[a-z-]+:)*/, '');
      if (isColorUtility(cls)) count(utilities, bare);
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
    .filter(
      (link) =>
        link.href &&
        /fonts\.googleapis\.com|fonts\.bunny\.net|use\.typekit\.net|fonts\.cdnfonts\.com/.test(
          link.href,
        ),
    )
    .map((link) => link.href);
  const googleFamilies = webfontLinks.flatMap((href) =>
    [...href.matchAll(/family=([^&:]+)/g)].map((match) =>
      decodeURIComponent(match[1]).replace(/\+/g, ' '),
    ),
  );
  const fontPreloads = links
    .filter((link) => /\bpreload\b/i.test(link.rel ?? '') && link.as === 'font' && link.href)
    .map((link) => resolveUrl(link.href, base))
    .filter(Boolean);

  // Logo candidates: an image whose alt, source or class says so, or whose alt
  // is the site's name; the icons; the social image. A Next.js image URL is
  // decoded to the original file too, since that is the one a page can load.
  const siteName =
    metaContent(metas, 'og:site_name') ?? metaContent(metas, 'application-name') ?? null;
  const logos = [];
  const seen = new Set();
  const addLogo = (candidate) => {
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
    const url = resolveUrl(src, base);
    const candidate = {
      url,
      alt,
      width: img.width ?? null,
      height: img.height ?? null,
      class: img.class ?? null,
    };
    const nextImage = /\/_next\/image\?(?:.*&)?url=([^&]+)/.exec(src);
    if (nextImage) candidate.original = resolveUrl(decodeURIComponent(nextImage[1]), base);
    addLogo(candidate);
  }
  for (const link of links) {
    if (!/\b(?:icon|apple-touch-icon|mask-icon)\b/i.test(link.rel ?? '') || !link.href) continue;
    addLogo({
      url: resolveUrl(link.href, base),
      rel: link.rel,
      sizes: link.sizes ?? null,
      type: link.type ?? null,
    });
  }
  const ogImage = metaContent(metas, 'og:image');
  if (ogImage) addLogo({ url: resolveUrl(ogImage, base), rel: 'og:image' });
  const headerSvgs = [...html.matchAll(/<(?:header|nav)\b[\s\S]*?<\/(?:header|nav)>/gi)]
    .flatMap((match) => [...match[0].matchAll(/<svg\b([^>]*)>/gi)].map((svg) => parseAttrs(svg[1])))
    .map((attrs) => ({
      ariaLabel: attrs['aria-label'] ?? null,
      class: attrs.class ?? null,
      viewBox: attrs.viewbox ?? null,
    }));

  const themeColors = metas
    .filter((meta) => meta.name === 'theme-color')
    .map((meta) => ({ content: meta.content ?? null, media: meta.media ?? null }));

  return {
    url: inputUrl,
    finalUrl: base,
    fetchedAt: new Date().toISOString().slice(0, 10),
    site: {
      name: siteName,
      title: textOf(html, 'title'),
      description: metaContent(metas, 'description') ?? metaContent(metas, 'og:description'),
      lang: htmlAttrs.lang ?? null,
    },
    scheme: {
      htmlClass: htmlAttrs.class ?? null,
      htmlDataAttributes: Object.fromEntries(
        Object.entries(htmlAttrs).filter(([key]) => key.startsWith('data-')),
      ),
      bodyClass: bodyAttrs.class ?? null,
      themeColorMetas: themeColors,
      colorSchemeDeclarations: rank(colorSchemes, 8).map((entry) => entry.value),
      rulesUnderADarkSelector: darkSelectors,
      rulesUnderPrefersDark: prefersDark,
    },
    stylesheets: stylesheets.map(({ url, bytes, error }) => ({
      url,
      bytes,
      ...(error ? { error } : {}),
    })),
    inlineStyleBlocks: inline.length,
    colors: {
      customProperties: [...properties.entries()]
        .slice(0, KEEP.properties)
        .map(([name, values]) => ({ name, values })),
      literalsByFrequency: rank(literals, KEEP.literals),
      utilitiesByFrequency: rank(utilities, KEEP.utilities).map((entry) => ({
        ...entry,
        resolves: resolveUtility(entry.value, utilityRules, properties),
      })),
    },
    typography: {
      fontFamiliesByFrequency: rank(fontFamilies, KEEP.fontFamilies),
      fontFaces: [...fontFaces],
      webfontLinks,
      googleFamilies: [...new Set(googleFamilies)],
      fontPreloads,
      utilitiesByFrequency: rank(fontUtilities, KEEP.fontUtilities),
    },
    shape: {
      radiiByFrequency: rank(radii, KEEP.radii),
      utilitiesByFrequency: rank(radiusUtilities, KEEP.radiusUtilities),
      radiusProperties: [...properties.entries()]
        .filter(([name]) => /radius/i.test(name))
        .map(([name, values]) => ({ name, values })),
    },
    logos: { candidates: logos.slice(0, KEEP.logos), headerSvgs: headerSvgs.slice(0, 6) },
  };
}

// ─── The command ─────────────────────────────────────────────────────────────

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const args = process.argv.slice(2);
  const url = args.find((arg) => !arg.startsWith('--'));
  const outIndex = args.indexOf('--out');
  const out = outIndex === -1 ? null : args[outIndex + 1];
  if (!url) {
    process.stderr.write('usage: node scripts/extract-site-facts.mjs <url> [--out <file>]\n');
    process.exit(2);
  }
  extractSiteFacts(url)
    .then((facts) => {
      const text = `${JSON.stringify(facts, null, 2)}\n`;
      if (out) {
        mkdirSync(path.dirname(out), { recursive: true });
        writeFileSync(out, text);
        process.stdout.write(`site facts for ${url} -> ${out} (${text.length} bytes)\n`);
      } else {
        process.stdout.write(text);
      }
    })
    .catch((error) => {
      process.stderr.write(`extract-site-facts: ${error?.stack ?? error}\n`);
      process.exit(1);
    });
}
