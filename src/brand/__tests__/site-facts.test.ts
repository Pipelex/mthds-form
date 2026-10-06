import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readRecording, recordingDirs } from '../../../scripts/site-recording';
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
