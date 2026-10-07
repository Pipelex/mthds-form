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
