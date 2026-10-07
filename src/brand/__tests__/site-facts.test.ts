import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readRecording, recordingDirs, writeRecording } from '../../../scripts/site-recording';
import { type FetchedPage, siteFacts, stylesheetUrls } from '../site-facts';
import { REPO } from './corpus';

/**
 * The site reader, offline.
 *
 * The recordings under `data/sites/` are pages and stylesheets as they were
 * served, kept so the facts reproduce: the reader is run over each and its
 * answer must be the `site-facts.json` committed beside it. A change to the
 * reader therefore shows as a diff in the record (`make site-facts`), which is
 * what review reads. The cases after it pin the readings that decide a brand.
 */

describe('the recorded sites', () => {
  const dirs = recordingDirs(REPO);

  it('has a recording to read', () => {
    expect(dirs.length).toBeGreaterThan(0);
  });

  it.each(dirs.map((dir) => [path.relative(REPO, dir), dir]))(
    '%s reads to its committed facts',
    (_label, dir) => {
      const committed = JSON.parse(readFileSync(path.join(dir, 'site-facts.json'), 'utf8'));
      expect(siteFacts(readRecording(dir))).toEqual(committed);
    },
  );
});

function page(html: string, stylesheets: FetchedPage['stylesheets'] = []): FetchedPage {
  return {
    url: 'https://acme.example/',
    finalUrl: 'https://acme.example/home/',
    fetchedAt: '2026-10-06',
    html,
    stylesheets,
  };
}

describe('reading a page', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('never fetches', () => {
    const fetch = vi.fn(() => {
      throw new Error('the reader fetched');
    });
    vi.stubGlobal('fetch', fetch);
    siteFacts(page('<link rel="stylesheet" href="/a.css"><img src="/logo.svg" alt="Acme">'));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('names the stylesheets a page links, resolved against where it was served from, in order', () => {
    const html =
      '<link rel="preload" href="/font.woff2" as="font"><link rel="stylesheet" href="b.css"><link href="https://cdn.example/a.css" rel="stylesheet">';
    expect(stylesheetUrls(html, 'https://acme.example/home/')).toEqual([
      'https://acme.example/home/b.css',
      'https://cdn.example/a.css',
    ]);
  });

  it("reports the value that wins as served: the site's override after a framework's default", () => {
    const facts = siteFacts(
      page('<html class="light"><body>', [
        { url: 'https://acme.example/framework.css', css: ':root { --primary: #2563eb; }' },
        {
          url: 'https://acme.example/site.css',
          css: ':root { --primary: #00bb95; } .dark { --primary: #5eead4; } @media (prefers-color-scheme: dark) { :root { --primary: #000; } }',
        },
      ]),
    );
    const primary = facts.colors.customProperties.find((property) => property.name === '--primary');
    expect(primary?.asServed).toBe('#00bb95');
    expect(primary?.values.map((value) => value.under)).toEqual([
      ':root',
      ':root',
      '.dark',
      '@media (prefers-color-scheme: dark) :root',
    ]);
  });

  it('reads a scheme selector against the attributes the page was served with', () => {
    const facts = siteFacts(
      page('<html data-theme="dark"><body>', [
        {
          url: 'https://acme.example/s.css',
          css: '[data-theme="light"] { --bg: #fff; } [data-theme="dark"] { --bg: #0a0a0b; }',
        },
      ]),
    );
    expect(facts.colors.customProperties[0]?.asServed).toBe('#0a0a0b');
    expect(facts.scheme.htmlDataAttributes).toEqual({ 'data-theme': 'dark' });
  });

  it('ranks the colour utilities the markup uses, with the colour each resolves to', () => {
    const facts = siteFacts(
      page(
        '<a class="text-accent-teal">a</a><b class="text-accent-teal hover:bg-white/10 text-sm">b</b>',
        [
          {
            url: 'https://acme.example/s.css',
            css: ':root { --accent-teal: #00bb95; } .text-accent-teal { color: var(--accent-teal); }',
          },
        ],
      ),
    );
    expect(facts.colors.utilitiesByFrequency).toEqual([
      { value: 'text-accent-teal', count: 2, resolves: '#00bb95' },
      { value: 'bg-white/10', count: 1, resolves: null },
    ]);
  });

  it('finds the logo, and the original file behind a Next.js image', () => {
    const facts = siteFacts(
      page(
        '<meta property="og:site_name" content="Acme"><img alt="Acme" src="/_next/image?url=%2Fbrand%2Facme.png&amp;w=256"><link rel="icon" href="/favicon.ico">',
      ),
    );
    expect(facts.logos.candidates.map((candidate) => candidate.url)).toEqual([
      'https://acme.example/_next/image?url=%2Fbrand%2Facme.png&w=256',
      'https://acme.example/favicon.ico',
    ]);
    expect(facts.logos.candidates[0]?.original).toBe('https://acme.example/brand/acme.png');
  });

  it('records a stylesheet the host could not fetch, and reads the rest', () => {
    const css = ':root { --primary: #00bb95; }';
    const facts = siteFacts(
      page('<html>', [
        { url: 'https://acme.example/gone.css', error: 'HTTP 404' },
        { url: 'https://acme.example/s.css', css },
      ]),
    );
    expect(facts.stylesheets).toEqual([
      { url: 'https://acme.example/gone.css', error: 'HTTP 404' },
      { url: 'https://acme.example/s.css', bytes: css.length },
    ]);
    expect(facts.colors.customProperties).toHaveLength(1);
  });

  it('measures a stylesheet in the bytes it was served as, not in characters', () => {
    const css = '.a::before { content: "→"; }';
    const facts = siteFacts(page('<html>', [{ url: 'https://acme.example/s.css', css }]));
    expect(facts.stylesheets[0]?.bytes).toBe(css.length + 2);
  });

  it('decodes an entity once, and reads a class in single quotes', () => {
    const facts = siteFacts(
      page(
        `<meta name="description" content="Tom &amp;amp; Jerry"><a class='text-accent-teal'>a</a>`,
      ),
    );
    expect(facts.site.description).toBe('Tom &amp; Jerry');
    expect(facts.colors.utilitiesByFrequency.map((entry) => entry.value)).toEqual([
      'text-accent-teal',
    ]);
  });

  it('breaks a tie in a ranking by code unit, the same on every machine', () => {
    // `localeCompare` put these in another order under another collation.
    const facts = siteFacts(page('<a class="text-b text-ä text-B text-a">a</a>'));
    expect(facts.colors.utilitiesByFrequency.map((entry) => entry.value)).toEqual([
      'text-B',
      'text-a',
      'text-b',
      'text-ä',
    ]);
  });

  it('counts no type size as a colour utility, whatever its name', () => {
    const facts = siteFacts(
      page(
        '<p class="text-[30px] text-[11px] text-[1.5rem] text-2xs text-sm/6 text-xs-tight bg-gradient-to-r text-[#00bb95] text-brand">',
        [
          {
            url: 'https://acme.example/s.css',
            // A size the theme named itself is known by its own rule.
            css: '.text-xs-tight { font-size: .75rem; line-height: 1rem; } .text-brand { color: #00bb95; }',
          },
        ],
      ),
    );
    expect(facts.colors.utilitiesByFrequency).toEqual([
      { value: 'text-[#00bb95]', count: 1, resolves: '#00bb95' },
      { value: 'text-brand', count: 1, resolves: '#00bb95' },
    ]);
  });
});

describe('weighing the cascade as a browser does', () => {
  const sheet = (css: string, html = '<html>') =>
    siteFacts(page(html, [{ url: 'https://acme.example/s.css', css }]));
  const property = (facts: ReturnType<typeof siteFacts>, name: string) =>
    facts.colors.customProperties.find((entry) => entry.name === name);
  const resolved = (css: string, utility: string) =>
    sheet(css, `<a class="${utility}">a</a>`).colors.utilitiesByFrequency.find(
      (entry) => entry.value === utility,
    )?.resolves;

  it('lets the last plain rule for a class paint, never a variant or a conditional one', () => {
    expect(
      resolved(
        '.text-brand { color: #111111; } .text-brand { color: #00bb95; } .text-brand:hover { color: #222222; } @media (min-width: 1px) { .text-brand { color: #333333; } } .dark .text-brand { color: #444444; }',
        'text-brand',
      ),
    ).toBe('#00bb95');
    // A utility in a cascade layer is still the utility, as Tailwind v4 writes them.
    expect(
      resolved('@layer utilities { .bg-brand { background-color: #00bb95; } }', 'bg-brand'),
    ).toBe('#00bb95');
  });

  it("takes a reference's fallback when its property has no value as served", () => {
    const css = '.dark { --primary: #000000; } .text-primary { color: var(--primary, #ffffff); }';
    expect(resolved(css, 'text-primary')).toBe('#ffffff');
    expect(sheet(css).colors.literalsByFrequency).toEqual([{ value: '#ffffff', count: 1 }]);
    // With no fallback either, the reference is left as written.
    expect(resolved('.text-x { color: var(--nowhere); }', 'text-x')).toBe('var(--nowhere)');
  });

  it('reads a nested fallback whole, leaving no parenthesis behind', () => {
    expect(
      resolved(':root { --a: #000000; } .text-x { color: var(--a, var(--b, #ffffff)); }', 'text-x'),
    ).toBe('#000000');
    expect(resolved('.text-x { color: var(--a, var(--b, #ffffff)); }', 'text-x')).toBe('#ffffff');
  });

  it('knows every property before it reads the colours that use one', () => {
    const facts = sheet('.a { color: var(--brand); } :root { --brand: #00bb95; }');
    expect(facts.colors.literalsByFrequency).toEqual([{ value: '#00bb95', count: 1 }]);
  });

  it('lets an unlayered declaration beat a layered one, and orders the layers as declared', () => {
    expect(
      property(
        sheet(':root { --primary: #111111; } @layer base { :root { --primary: #222222; } }'),
        '--primary',
      )?.asServed,
    ).toBe('#111111');
    // `base` is the later layer by the statement, though its block comes first.
    expect(
      property(
        sheet(
          '@layer theme, base; @layer base { :root { --primary: #222222; } } @layer theme { :root { --primary: #333333; } }',
        ),
        '--primary',
      )?.asServed,
    ).toBe('#222222');
    // A layer's own declarations beat those of the layers inside it.
    expect(
      property(
        sheet(
          '@layer site { :root { --primary: #aaaaaa; } @layer inner { :root { --primary: #bbbbbb; } } }',
        ),
        '--primary',
      )?.asServed,
    ).toBe('#aaaaaa');
  });

  it('lets an important declaration win, reversing the layer order, and serves it without the flag', () => {
    const facts = sheet(':root { --primary: #111111 !important; } :root { --primary: #222222; }');
    expect(property(facts, '--primary')?.asServed).toBe('#111111');
    expect(property(facts, '--primary')?.values[0]?.value).toBe('#111111 !important');
    expect(
      property(
        sheet(
          '@layer base { :root { --primary: #333333 !important; } } :root { --primary: #444444 !important; }',
        ),
        '--primary',
      )?.asServed,
    ).toBe('#333333');
  });

  it('keeps the most referenced properties when a site declares more than the record holds', () => {
    const declared = Array.from({ length: 85 }, (_, i) => `--c-${i}: #000000;`).join(' ');
    const used = [79, 80, 81, 82, 83, 84].map((i) => `.u-${i} { color: var(--c-${i}); }`);
    const facts = sheet(`:root { ${declared} } ${used.join(' ')}`);
    const names = facts.colors.customProperties.map((entry) => entry.name);
    // The unreferenced ones that come last are cut, and the rest stay in source order.
    expect(names).toEqual(
      [...Array.from({ length: 74 }, (_, i) => i), 79, 80, 81, 82, 83, 84].map((i) => `--c-${i}`),
    );
    expect(property(facts, '--c-84')?.references).toBe(1);
  });

  it('lets the more specific root selector win, whatever comes later', () => {
    const served = (css: string, html: string) => property(sheet(css, html), '--p')?.asServed;
    expect(
      served('html.dark { --p: #000000; } :root { --p: #ffffff; }', '<html class="dark">'),
    ).toBe('#000000');
    expect(
      served(
        'html[data-theme=dark] { --p: #000000; } :root { --p: #ffffff; }',
        '<html data-theme="dark">',
      ),
    ).toBe('#000000');
    expect(served(':root:not(.light) { --p: #000000; } :root { --p: #ffffff; }', '<html>')).toBe(
      '#000000',
    );
    // Equal specificity falls back to source order.
    expect(served(':root { --p: #000000; } :root { --p: #ffffff; }', '<html>')).toBe('#ffffff');
  });

  it("serves the body's value over the root's, and every element's over both, as the content inherits", () => {
    const served = (css: string) => property(sheet(css, '<html><body>'), '--p')?.asServed;
    // The body's own declaration is what its content inherits, even against an important root one.
    expect(served('body { --p: #000000; } :root { --p: #ffffff !important; }')).toBe('#000000');
    expect(served('* { --p: #111111; } body { --p: #222222; } :root { --p: #333333; }')).toBe(
      '#111111',
    );
  });
});

describe('matching a root selector', () => {
  const served = (css: string, html: string) =>
    siteFacts(
      page(html, [{ url: 'https://acme.example/s.css', css }]),
    ).colors.customProperties.find((entry) => entry.name === '--p')?.asServed ?? null;

  it('reads an attribute selector whose operator or value holds a space or a tilde', () => {
    expect(served(':root[class~=dark] { --p: #ffffff; }', '<html class="dark">')).toBe('#ffffff');
    expect(
      served('[data-theme="dark mode"] { --p: #ffffff; }', '<html data-theme="dark mode">'),
    ).toBe('#ffffff');
    // A combinator still reaches past the root, and still does not apply there.
    for (const selector of ['html .dark', 'html>body', ':root~x', ':root+x', ':root :not(.x)']) {
      expect(served(`${selector} { --p: #ffffff; }`, '<html class="dark">'), selector).toBeNull();
    }
  });

  it('cuts a selector list only at its top-level commas', () => {
    expect(served(':root:not(.light, .contrast) { --p: #ffffff; }', '<html>')).toBe('#ffffff');
    expect(
      served(':root:not(.light, .contrast) { --p: #ffffff; }', '<html class="contrast">'),
    ).toBeNull();
    expect(served(':root[data-x="a,b"] { --p: #ffffff; }', '<html data-x="a,b">')).toBe('#ffffff');
  });

  it('finds no attribute the markup did not set, prototype names included', () => {
    for (const selector of [':root[constructor]', ':root[constructor^=x]', '[__proto__*=x]']) {
      expect(served(`${selector} { --p: #ffffff; }`, '<html>'), selector).toBeNull();
    }
  });

  it('matches a boolean attribute, which the markup sets with no value', () => {
    expect(served('[data-dark] { --p: #ffffff; }', '<html data-dark>')).toBe('#ffffff');
  });
});

describe("reading a sheet under its link's media", () => {
  const facts = (html: string, sheets: Record<string, string>) =>
    siteFacts(
      page(
        html,
        Object.entries(sheets).map(([name, css]) => ({ url: `https://acme.example/${name}`, css })),
      ),
    );
  const served = (result: ReturnType<typeof siteFacts>) =>
    result.colors.customProperties.find((entry) => entry.name === '--background')?.asServed;
  const main = { 'main.css': ':root { --background: #ffffff; }' };

  it('reads a print sheet and a dark one as not applying, and records them under their media', () => {
    const result = facts(
      '<link rel="stylesheet" href="/main.css"><link rel="stylesheet" media="print" href="/print.css"><link rel="stylesheet" media="(prefers-color-scheme: dark)" href="/dark.css">',
      {
        ...main,
        'print.css': ':root { --background: #000000; }',
        'dark.css': ':root { --background: #111111; }',
      },
    );
    expect(served(result)).toBe('#ffffff');
    expect(result.colors.customProperties[0]?.values.map((value) => value.under)).toEqual([
      ':root',
      '@media print :root',
      '@media (prefers-color-scheme: dark) :root',
    ]);
    expect(result.scheme.rulesUnderPrefersDark).toBe(1);
  });

  it('reads a <style> under its media too', () => {
    const result = facts(
      '<link rel="stylesheet" href="/main.css"><style media="print">:root { --background: #000000; }</style>',
      main,
    );
    expect(served(result)).toBe('#ffffff');
  });

  it('leaves a disabled sheet and an alternate one out of the cascade', () => {
    const result = facts(
      '<link rel="stylesheet" href="/main.css"><link rel="stylesheet" disabled href="/off.css"><link rel="alternate stylesheet" title="Dark" href="/alt.css">',
      {
        ...main,
        'off.css': ':root { --background: #000000; }',
        'alt.css': ':root { --background: #111111; }',
      },
    );
    expect(served(result)).toBe('#ffffff');
    expect(result.stylesheets.map((sheet) => sheet.url)).toHaveLength(3);
  });

  it('reads a sheet that switches itself on once loaded as applying everywhere', () => {
    const result = facts(
      `<link rel="stylesheet" href="/main.css"><link rel="stylesheet" media="print" onload="this.media='all'" href="/late.css">`,
      { ...main, 'late.css': ':root { --background: #000000; }' },
    );
    expect(served(result)).toBe('#000000');
  });
});

/**
 * A stylesheet is a stranger's: truncated by the host's cap, nested, opening on
 * a statement. Each case is a shape a real site serves, and each once lost or
 * invented a fact, or never returned.
 */
describe('reading a stylesheet the way a browser does', () => {
  const sheet = (css: string, html = '<html>') =>
    siteFacts(page(html, [{ url: 'https://acme.example/s.css', css }]));
  const property = (facts: ReturnType<typeof siteFacts>, name: string) =>
    facts.colors.customProperties.find((entry) => entry.name === name);

  it('closes a block the input ends inside, as a truncated sheet does', () => {
    const facts = sheet(':root { --primary: #00bb95; } .a { color: #ff0000');
    expect(property(facts, '--primary')?.asServed).toBe('#00bb95');
    expect(facts.colors.literalsByFrequency).toEqual([{ value: '#ff0000', count: 1 }]);
  });

  it('reads a brace inside a string as text', () => {
    const facts = sheet('.a::before { content: "{"; } :root { --primary: #00bb95; }\n');
    expect(property(facts, '--primary')?.asServed).toBe('#00bb95');
  });

  it('keeps the declarations a block makes before a nested rule, in source order', () => {
    const facts = sheet(
      ':root { --primary: #00bb95; @media (prefers-color-scheme: dark) { --primary: #5eead4; } --muted: #f4f4f5; }',
    );
    expect(property(facts, '--primary')?.values).toEqual([
      { value: '#00bb95', under: ':root' },
      { value: '#5eead4', under: ':root @media (prefers-color-scheme: dark)' },
    ]);
    expect(property(facts, '--primary')?.asServed).toBe('#00bb95');
    expect(property(facts, '--muted')?.asServed).toBe('#f4f4f5');
  });

  it('ends a statement at its semicolon, so it never joins the next selector', () => {
    const facts = sheet(
      '@charset "UTF-8"; @import url("x.css"); :root { --primary: #00bb95; } @layer base, site; .dark { --primary: #5eead4; }',
    );
    expect(property(facts, '--primary')?.values.map((value) => value.under)).toEqual([
      ':root',
      '.dark',
    ]);
    // A glued `@layer` once read `.dark` as applying to a page with no `.dark`.
    expect(property(facts, '--primary')?.asServed).toBe('#00bb95');
  });

  it('reads the page in document order, an inline block before the sheet it precedes', () => {
    const facts = siteFacts(
      page(
        '<style>:root { --primary: #ffffff; }</style><link rel="stylesheet" href="/s.css"><style>.x { color: red; }</style>',
        [{ url: 'https://acme.example/s.css', css: ':root { --primary: #000000; }' }],
      ),
    );
    expect(property(facts, '--primary')?.asServed).toBe('#000000');
    expect(facts.inlineStyleBlocks).toBe(2);
  });

  it('keeps a radius property as a length, never as a colour', () => {
    const facts = sheet(':root { --radius: 0.625rem; --border-radius: 12px; --primary: #00bb95; }');
    expect(facts.shape.radiusProperties.map((entry) => [entry.name, entry.asServed])).toEqual([
      ['--radius', '0.625rem'],
      ['--border-radius', '12px'],
    ]);
    expect(facts.colors.customProperties.map((entry) => entry.name)).toEqual(['--primary']);
  });

  it('reads each stylesheet on its own, so one cut short leaves the next untouched', () => {
    const facts = siteFacts(
      page('<html>', [
        { url: 'https://acme.example/print.css', css: '@media print { .a { color: red' },
        { url: 'https://acme.example/s.css', css: ':root { --primary: #00bb95; }' },
      ]),
    );
    expect(property(facts, '--primary')?.asServed).toBe('#00bb95');
  });

  it('reads the markup as a browser does: no link a comment or a script holds, an unclosed style to the end', () => {
    const html =
      '<!-- <link rel="stylesheet" href="/old.css"> --><script>document.write(\'<link rel="stylesheet" href="/js.css">\')</script><link rel="stylesheet" href="/s.css"><style>:root { --primary: #00bb95; }';
    expect(stylesheetUrls(html, 'https://acme.example/')).toEqual(['https://acme.example/s.css']);
    const facts = siteFacts(
      page(html, [{ url: 'https://acme.example/s.css', css: ':root { --primary: #000000; }' }]),
    );
    expect(property(facts, '--primary')?.asServed).toBe('#00bb95');
    expect(facts.inlineStyleBlocks).toBe(1);
  });

  it('reads a semicolon inside parentheses as part of the value', () => {
    const facts = sheet('.a { background: url(data:image/png;base64,AAAA) #00bb95; }');
    expect(facts.colors.literalsByFrequency).toEqual([{ value: '#00bb95', count: 1 }]);
  });

  it('skips blocks nested past its depth, and reads on after them', () => {
    const facts = sheet(
      `${'.a {'.repeat(40)} --deep: #000000; ${'}'.repeat(40)} :root { --primary: #00bb95; }`,
    );
    expect(property(facts, '--deep')).toBeUndefined();
    expect(property(facts, '--primary')?.asServed).toBe('#00bb95');
  });

  it('cuts a selector chain it records at a readable length, and reads on under it', () => {
    const facts = sheet(`@media (${'x'.repeat(1000)}) { :root { --primary: #00bb95; } }`);
    const under = property(facts, '--primary')?.values[0]?.under ?? '';
    expect(under.length).toBeLessThan(400);
    expect(under.endsWith('…')).toBe(true);
    expect(property(facts, '--primary')?.asServed).toBe('#00bb95');
  });

  it('drops a malformed escape in the markup and reads the rest', () => {
    const facts = siteFacts(
      page(
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=%E0%A4%A&family=Inter"><img alt="logo" src="/_next/image?url=%E0%A4%A&amp;w=1">',
      ),
    );
    expect(facts.typography.googleFamilies).toEqual(['Inter']);
    expect(facts.logos.candidates[0]?.url).toBe(
      'https://acme.example/_next/image?url=%E0%A4%A&w=1',
    );
    expect(facts.logos.candidates[0]?.original).toBeUndefined();
  });
});

/**
 * A hostile page must not cost more than its length. Most of these inputs once
 * took seconds, or ran out of memory, at a few hundred kilobytes - well under
 * the fetch guard's cap - because a scan restarted at every position, a
 * selector chain was copied for every rule beneath it, or a `var()` was
 * substituted without bound. The others hold the readings added since
 * (cascade layers, `var()` chains) to the same rule. The bound is far above
 * what a linear reading takes, so it fails on the shape, not on a slow machine.
 */
describe('reading a hostile page in time proportional to its length', () => {
  const SIZE = 400_000;
  const fill = (unit: string) => unit.repeat(Math.ceil(SIZE / unit.length));
  const chain = Array.from({ length: SIZE / 30 }, (_, i) => `--color-${i}:var(--color-${i + 1});`);
  const many = (each: (i: number) => string, size: number) =>
    Array.from({ length: Math.ceil(size / each(0).length) }, (_, i) => each(i));
  const cases: [string, { html?: string; css?: string }][] = [
    [
      'a root carrying many classes, against as many class selectors',
      {
        html: `<html class="${many((i) => `c${i} `, SIZE / 2).join('')}">`,
        css: many((i) => `.z${i}{--a:#000}`, SIZE / 2).join(''),
      },
    ],
    [
      'a long root attribute matched word by word by many selectors',
      {
        html: `<html data-x="${fill('a ')}">`,
        css: many((i) => `[data-x~=b${i}]{--a:#000}`, SIZE).join(''),
      },
    ],
    [
      'a long root attribute searched by many substring selectors',
      { html: `<html data-x="${fill('a')}">`, css: fill('[data-x*=ab]{--a:#000}') },
    ],
    [
      'a selector list of many alternatives',
      {
        html: `<html class="${many((i) => `c${i} `, SIZE / 2).join('')}">`,
        css: `${many((i) => `:root.z${i},`, SIZE / 2).join('')}:root{--a:#000}`,
      },
    ],
    ['a :not( list never closed', { css: `:root:not(${fill('.a,')} { --a: #000; }` }],
    ['unclosed <header> tags', { html: fill('<header>') }],
    ['unclosed <style> elements', { html: fill('<style>') }],
    ['unclosed <title> elements', { html: fill('<title>') }],
    ['<meta tags with no >', { html: fill('<meta ') }],
    ['<link tags with no >', { html: fill('<link ') }],
    ['comments never closed in the markup', { html: fill('<!--<header>') }],
    ['an attribute name with no =', { html: `<meta ${fill('a')}>` }],
    [
      'a Next.js image path repeated in a logo',
      { html: `<img alt="logo" src="${fill('/_next/image?')}">` },
    ],
    ['comments never closed in a sheet', { css: fill('/* a') }],
    ['colour functions never closed', { css: `.a { color: ${fill('rgb(')} }` }],
    ['blocks nested without end', { css: fill('a{x:y;') }],
    [
      'a long prelude above many rules',
      { css: `@media (${'x'.repeat(SIZE / 2)}) { ${fill('a{--a:#000}').slice(0, SIZE / 2)} }` },
    ],
    ['a selector whose brackets never close', { css: `:root${fill('[')} { --a: #000; }` }],
    ['a selector whose :not( never closes', { css: `:root${fill(':not(')} { --a: #000; }` }],
    ['a data attribute selector with no =', { css: `[data-${fill('theme')} { --a: #000; }` }],
    ['var() fallbacks never closed', { css: `.a { color: ${fill('var(--x,')} }` }],
    [
      'var() references multiplying a value',
      {
        css: `:root { --color-b: ${'#000 '.repeat(SIZE / 10)}; --color-a: ${'var(--color-b) '.repeat(SIZE / 30)}; } ${'.x{color:var(--color-a)}'.repeat(SIZE / 100)}`,
      },
    ],
    [
      'a var() chain deeper than the stack',
      { css: `:root { ${chain.join('')} } .x { color: var(--color-0); }` },
    ],
    [
      'layer names nested without end',
      {
        css: `@layer ${'a.'.repeat(SIZE / 4)}a { ${'@layer b{:root{--color-a:#000}}'.repeat(SIZE / 60)} }`,
      },
    ],
    [
      'a value of whitespace and digits',
      { css: `:root { --color-a: 1${' '.repeat(SIZE)}x; --color-b: 1.${'1'.repeat(SIZE)}x; }` },
    ],
  ];

  it.each(cases)('reads %s', (_label, { html = '<html>', css }) => {
    const started = performance.now();
    siteFacts(page(html, css === undefined ? [] : [{ url: 'https://acme.example/s.css', css }]));
    expect(performance.now() - started).toBeLessThan(2000);
  });
});

describe('recording a site', () => {
  it('leaves no stylesheet of an earlier recording of the same day behind', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'site-recording-'));
    const sheet = (name: string) => ({
      url: `https://acme.example/${name}.css`,
      css: `.${name}{}`,
    });
    try {
      writeRecording(dir, page('<html>', [sheet('a'), sheet('b'), sheet('c')]));
      writeRecording(dir, page('<html>', [sheet('a')]));
      expect(readdirSync(path.join(dir, 'stylesheets'))).toEqual(['01.css']);
      expect(readRecording(dir).stylesheets).toEqual([sheet('a')]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
