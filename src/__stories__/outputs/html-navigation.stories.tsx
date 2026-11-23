import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { StuffViewer } from '../../react';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/results';
import { resultFieldFor } from '../result-view';

/**
 * Where a link inside a `native.Html` result goes, measured in a real browser.
 *
 * The result is framed as a `srcdoc` document, and a `srcdoc` document's base
 * URL is its embedder's, so before this was fixed a click on any link moved
 * the frame itself: a remote page loaded inside the host's page, a relative
 * link loaded the host's own page there, same-origin and with its cookies, and
 * an in-page `#` link, which every generated report's table of contents is
 * made of, replaced the result with the host page. Now every link opens in a
 * new tab with no opener and no referrer, an in-page link scrolls the frame,
 * any other scheme loses its `href`, and a meta refresh is removed. See
 * `src/react/frame-navigation.ts` and `docs/result-view.md` § Markup.
 *
 * **The payloads are hand-built, and have to be**: what is under test is the
 * markup's links, and only markup written for it carries a link to a second
 * origin this test server answers. The "remote" page is `localhost` on the
 * same server, which the story suite serves on `127.0.0.1`, so it is a second
 * origin as a remote site would be.
 *
 * The stories also run in Firefox and WebKit (`make test-navigation-browsers`),
 * because where a framed link goes is each engine's own decision.
 */

/** A page on a second origin: the same test server, named another way. */
function remoteUrl(path: string): string {
  return `http://localhost:${window.location.port}${path}`;
}

function NavigationPage({ markup, label = 'page' }: { markup: string; label?: string }) {
  const field = React.useMemo(
    () => resultFieldFor(CONTRACTS, OUTPUT_FORM, 'results', 'html_result'),
    [],
  );
  return (
    <div data-navigation-demo={label}>
      <StuffViewer field={field} value={{ inner_html: markup, css_class: null }} name={label} />
    </div>
  );
}

/** Two pages side by side, each under its own label. */
function NavigationPages({ pages }: { pages: { label: string; markup: string }[] }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {pages.map(({ label, markup }) => (
        <NavigationPage key={label} label={label} markup={markup} />
      ))}
    </div>
  );
}

const meta = {
  title: 'Outputs/Html navigation',
  component: NavigationPage,
  args: { markup: '' },
} satisfies Meta<typeof NavigationPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The selector of a labelled page's frame. ThemePair renders every story twice; the first is used. */
function frameSelector(label = 'page'): string {
  return `[data-navigation-demo="${label}"] iframe`;
}

/** The first theme pane's frame of a labelled page, once its document holds `ready`. */
async function loadedFrame(
  canvasElement: HTMLElement,
  ready: string,
  label = 'page',
): Promise<HTMLIFrameElement> {
  let frame: HTMLIFrameElement | null = null;
  await waitFor(() => {
    frame = canvasElement.querySelector<HTMLIFrameElement>(frameSelector(label));
    expect(frame?.contentDocument?.querySelector(ready)).toBeTruthy();
  });
  return frame!;
}

/**
 * Where the frame is. Reading it throws once the frame shows another origin's
 * page, which fails the assertion that reads it, as it should.
 */
function frameLocation(frame: HTMLIFrameElement): string {
  return frame.contentWindow!.location.href;
}

/** Every `load` the frame fires from now on, counted on its own element. */
function countLoads(frame: HTMLIFrameElement): { count: number } {
  const loads = { count: 0 };
  frame.addEventListener('load', () => {
    loads.count += 1;
  });
  return loads;
}

/**
 * The browser commands, when the stories run as tests (`.storybook/frame-commands.ts`).
 * Absent in the Storybook UI, where a story asserts the rewritten markup and
 * stops short of the click.
 */
async function browserCommands() {
  try {
    return (await import('vitest/browser')).commands;
  } catch {
    return undefined;
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * **A link to another site** opens in a new tab: exactly one, with no
 * `window.opener` handle back to the host, and the result stays on screen.
 */
export const ExternalLink: Story = {
  name: 'A link to another site',
  args: {
    markup: `<p>The figures come from <a id="link" href="${remoteUrl('/remote-page')}">the source</a>.</p>`,
  },
  play: async ({ canvasElement }) => {
    const frame = await loadedFrame(canvasElement, '#link');
    const link = frame.contentDocument!.querySelector<HTMLAnchorElement>('#link')!;
    await expect(link.target).toBe('_blank');
    await expect(link.rel).toBe('noopener noreferrer');
    await expect(link.href).toBe(remoteUrl('/remote-page'));

    const commands = await browserCommands();
    if (!commands) return;
    const opened = await commands.clickInResultFrame(frameSelector(), '#link');
    await expect(opened).toHaveLength(1);
    await expect(opened[0]!.url).toBe(remoteUrl('/remote-page'));
    await expect(opened[0]!.hasOpener).toBe(false);
    await expect(frameLocation(frame)).toBe('about:srcdoc');
  },
};

/**
 * **A relative link** resolves against the host's page, as a browser would,
 * and so opens the host's page in a new tab rather than inside the result,
 * where it would be same-origin and readable, with the host's cookies.
 */
export const RelativeLink: Story = {
  name: 'A relative link',
  args: { markup: `<p><a id="link" href="/account/settings">Settings</a></p>` },
  play: async ({ canvasElement }) => {
    const frame = await loadedFrame(canvasElement, '#link');
    const link = frame.contentDocument!.querySelector<HTMLAnchorElement>('#link')!;
    await expect(link.getAttribute('href')).toBe(
      new URL('/account/settings', document.baseURI).href,
    );
    await expect(link.target).toBe('_blank');

    const commands = await browserCommands();
    if (!commands) return;
    const opened = await commands.clickInResultFrame(frameSelector(), '#link');
    await expect(opened).toHaveLength(1);
    await expect(opened[0]!.hasOpener).toBe(false);
    await expect(frameLocation(frame)).toBe('about:srcdoc');
  },
};

/** A report's table of contents, its target far enough down that the frame must scroll to it. */
const TABLE_OF_CONTENTS = `<nav><a id="toc" href="#findings">Findings</a></nav>
<div style="height: 3000px">Summary</div>
<h2 id="findings">Findings</h2><p>The end of the report.</p>`;

/**
 * **An in-page link** (a table of contents) scrolls the frame to its target,
 * with no load and no new tab, under the `<base target="_blank">` the frame's
 * head carries for every other link.
 */
export const InPageLink: Story = {
  name: 'An in-page link',
  args: { markup: TABLE_OF_CONTENTS },
  play: async ({ canvasElement }) => {
    const frame = await loadedFrame(canvasElement, '#toc');
    const doc = frame.contentDocument!;
    await expect(doc.head.querySelector('base[target="_blank"]')).not.toBeNull();
    const link = doc.querySelector<HTMLAnchorElement>('#toc')!;
    await expect(link.getAttribute('href')).toBe('about:srcdoc#findings');
    await expect(link.target).toBe('_self');

    const commands = await browserCommands();
    if (!commands) return;
    const loads = countLoads(frame);
    const opened = await commands.clickInResultFrame(frameSelector(), '#toc');
    await expect(opened).toHaveLength(0);
    await expect(loads.count).toBe(0);
    await expect(frameLocation(frame)).toBe('about:srcdoc#findings');
    await waitFor(() => expect(frame.contentWindow!.scrollY).toBeGreaterThan(1000));
  },
};

/** **A link of another scheme** (`tel:`) loses its `href` and keeps its words. */
export const OtherScheme: Story = {
  name: 'A link of another scheme',
  args: { markup: `<p>Call <a id="link" href="tel:+33100000000">the front desk</a>.</p>` },
  play: async ({ canvasElement }) => {
    const frame = await loadedFrame(canvasElement, '#link');
    const link = frame.contentDocument!.querySelector('#link')!;
    await expect(link.hasAttribute('href')).toBe(false);
    await expect(link.textContent).toBe('the front desk');
  },
};

/** A meta refresh with a delay of one second, to `url`. */
function refresh(url: string): string {
  return `<meta http-equiv="refresh" content="1;url=${url}">`;
}

/** Each labelled page is still showing its own document two seconds on, a second past its refresh. */
async function stillOnPage(canvasElement: HTMLElement, labels: string[]): Promise<void> {
  const frames = await Promise.all(
    labels.map((label) => loadedFrame(canvasElement, '#mark', label)),
  );
  for (const frame of frames) {
    await expect(frame.contentDocument!.querySelector('meta[http-equiv="refresh" i]')).toBeNull();
  }
  await wait(2000);
  for (const frame of frames) {
    await expect(frameLocation(frame)).toBe('about:srcdoc');
    await expect(frame.contentDocument!.querySelector('#mark')).not.toBeNull();
  }
}

/** **A meta refresh in a fragment**, to another site and to the host's own page, is removed. */
export const RefreshInFragment: Story = {
  name: 'A meta refresh in a fragment',
  render: () => (
    <NavigationPages
      pages={[
        {
          label: 'remote',
          markup: `${refresh(remoteUrl('/remote-page'))}<p id="mark">The result.</p>`,
        },
        {
          label: 'relative',
          markup: `${refresh('/account/settings')}<p id="mark">The result.</p>`,
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => stillOnPage(canvasElement, ['remote', 'relative']),
};

/** A whole document whose head carries `head`. */
function wholeDocument(head: string): string {
  return `<!doctype html><html><head><meta charset="utf-8">${head}<title>Report</title></head><body><p id="mark">The result.</p></body></html>`;
}

/** **A meta refresh in a whole document's head**, to another site and to the host's own page, is removed. */
export const RefreshInDocument: Story = {
  name: "A meta refresh in a whole document's head",
  render: () => (
    <NavigationPages
      pages={[
        { label: 'remote', markup: wholeDocument(refresh(remoteUrl('/remote-page'))) },
        { label: 'relative', markup: wholeDocument(refresh('/account/settings')) },
      ]}
    />
  ),
  play: async ({ canvasElement }) => stillOnPage(canvasElement, ['remote', 'relative']),
};
