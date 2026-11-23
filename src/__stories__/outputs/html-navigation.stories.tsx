import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { DEFAULT_FIELD_STRINGS, StuffViewer } from '../../react';
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
 * The browser commands, when the stories run as tests (`frameCommands` in `vitest.config.ts`).
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

/** How long a click that should open a tab waits for it, under the whole suite's load. */
const TAB_WAIT_MS = 10_000;

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
    const opened = await commands.clickInResultFrame(frameSelector(), '#link', {
      waitMs: TAB_WAIT_MS,
    });
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
    const opened = await commands.clickInResultFrame(frameSelector(), '#link', {
      waitMs: TAB_WAIT_MS,
    });
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

/**
 * Move the frame the way a link the rewrite missed would: give the page's
 * link back the `target="_self"` the rewrite replaced, through the parent's
 * own access to the frame's document, and click it.
 */
function escapeFrom(frame: HTMLIFrameElement): void {
  const link = frame.contentDocument!.querySelector<HTMLAnchorElement>('#link')!;
  link.target = '_self';
  link.click();
}

// TEMPORARY DIAGNOSTICS (Firefox load guard) - removed before the branch lands.
function DIAG_read(frame: HTMLIFrameElement): string {
  try {
    return `href=${frame.contentWindow?.location.href}`;
  } catch (error) {
    return `threw ${(error as Error).name}: ${(error as Error).message}`;
  }
}

function DIAG_watch(frame: HTMLIFrameElement): string[] {
  const events: string[] = [];
  const start = performance.now();
  frame.addEventListener('load', () => {
    events.push(`load@${Math.round(performance.now() - start)}ms ${DIAG_read(frame)}`);
  });
  return events;
}

async function DIAG_rawFrame(
  canvasElement: HTMLElement,
  name: string,
  srcdoc: string,
  sandbox: string | null,
): Promise<HTMLIFrameElement> {
  const frame = document.createElement('iframe');
  frame.setAttribute('data-diag', name);
  if (sandbox !== null) frame.setAttribute('sandbox', sandbox);
  const loaded = new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }));
  frame.srcdoc = srcdoc;
  canvasElement.appendChild(frame);
  await loaded;
  return frame;
}

async function DIAG_escape(canvasElement: HTMLElement, first: HTMLIFrameElement): Promise<void> {
  const firefox = navigator.userAgent.includes('Firefox');
  const report: Record<string, unknown> = { ua: navigator.userAgent };
  const srcdoc = first.getAttribute('srcdoc') ?? '';
  const sandbox = first.getAttribute('sandbox');
  report.sandbox = sandbox;
  report.firstBefore = DIAG_read(first);
  try {
    const response = await fetch('/remote-page');
    report.remotePage = {
      status: response.status,
      type: response.headers.get('content-type'),
      xfo: response.headers.get('x-frame-options'),
      csp: response.headers.get('content-security-policy'),
      coep: response.headers.get('cross-origin-embedder-policy'),
      coop: response.headers.get('cross-origin-opener-policy'),
      corp: response.headers.get('cross-origin-resource-policy'),
    };
  } catch (error) {
    report.remotePage = `fetch threw ${String(error)}`;
  }

  const experiments: Record<string, () => Promise<unknown>> = {
    // The product path itself, Firefox only (elsewhere the story does it next).
    ...(firefox
      ? {
          A_component: async () => {
            const events = DIAG_watch(first);
            const link = first.contentDocument!.querySelector<HTMLAnchorElement>('#link')!;
            link.target = '_self';
            link.click();
            await wait(4000);
            const now = canvasElement.querySelector<HTMLIFrameElement>(frameSelector());
            return {
              events,
              connected: first.isConnected,
              sameElement: now === first,
              after: DIAG_read(first),
              docUrl: (() => {
                try {
                  return first.contentDocument?.URL ?? 'null contentDocument';
                } catch (error) {
                  return `threw ${String(error)}`;
                }
              })(),
              notice: canvasElement.querySelector('[data-html-left-frame]') !== null,
            };
          },
        }
      : {}),
    B_rawClick: async () => {
      const frame = await DIAG_rawFrame(canvasElement, 'b', srcdoc, sandbox);
      const events = DIAG_watch(frame);
      const link = frame.contentDocument!.querySelector<HTMLAnchorElement>('#link')!;
      link.target = '_self';
      link.click();
      await wait(4000);
      return { events, after: DIAG_read(frame) };
    },
    C_rawDispatch: async () => {
      const frame = await DIAG_rawFrame(canvasElement, 'c', srcdoc, sandbox);
      const events = DIAG_watch(frame);
      const link = frame.contentDocument!.querySelector<HTMLAnchorElement>('#link')!;
      link.target = '_self';
      const dispatched = link.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, view: frame.contentWindow }),
      );
      await wait(4000);
      return { dispatched, events, after: DIAG_read(frame) };
    },
    D_trustedClick: async () => {
      const frame = await DIAG_rawFrame(canvasElement, 'd', srcdoc, sandbox);
      const events = DIAG_watch(frame);
      frame.contentDocument!.querySelector<HTMLAnchorElement>('#link')!.target = '_self';
      const commands = await browserCommands();
      if (!commands) return 'no commands';
      let opened: unknown;
      try {
        opened = await commands.clickInResultFrame('iframe[data-diag="d"]', '#link');
      } catch (error) {
        opened = `click threw ${String(error)}`;
      }
      await wait(2500);
      return { opened, events, after: DIAG_read(frame) };
    },
    E_parentAssign: async () => {
      const frame = await DIAG_rawFrame(canvasElement, 'e', srcdoc, sandbox);
      const events = DIAG_watch(frame);
      let assigned = 'ok';
      try {
        frame.contentWindow!.location.href = remoteUrl('/remote-page');
      } catch (error) {
        assigned = `threw ${String(error)}`;
      }
      await wait(4000);
      return { assigned, events, after: DIAG_read(frame) };
    },
    F_sameOriginOnlyClick: async () => {
      const frame = await DIAG_rawFrame(canvasElement, 'f', srcdoc, 'allow-same-origin');
      const events = DIAG_watch(frame);
      const link = frame.contentDocument!.querySelector<HTMLAnchorElement>('#link')!;
      link.target = '_self';
      link.click();
      await wait(4000);
      return { events, after: DIAG_read(frame) };
    },
    G_rawClickRelative: async () => {
      const frame = await DIAG_rawFrame(canvasElement, 'g', srcdoc, sandbox);
      const events = DIAG_watch(frame);
      const link = frame.contentDocument!.querySelector<HTMLAnchorElement>('#link')!;
      link.href = new URL('/account/settings', document.baseURI).href;
      link.target = '_self';
      link.click();
      await wait(4000);
      return { events, after: DIAG_read(frame) };
    },
  };
  const results = await Promise.all(
    Object.entries(experiments).map(async ([name, run]) => {
      try {
        return [name, await run()] as const;
      } catch (error) {
        return [name, `threw ${String(error)}`] as const;
      }
    }),
  );
  report.results = Object.fromEntries(results);
  for (const frame of canvasElement.querySelectorAll('iframe[data-diag]')) frame.remove();
  const text = JSON.stringify(report, null, 1);
  if (firefox) throw new Error(`[DIAG load guard] ${text}`);
}

/**
 * **The load guard.** Should anything move the frame off its document anyway,
 * the frame is put back on it once; the second time, the page is replaced by
 * a notice saying it tried to leave its frame, rather than put back again.
 */
export const LoadGuard: Story = {
  name: 'A frame that leaves anyway',
  args: {
    markup: `<p>See <a id="link" href="${remoteUrl('/remote-page')}">the source</a>.</p>`,
  },
  play: async ({ canvasElement }) => {
    const first = await loadedFrame(canvasElement, '#link');
    await DIAG_escape(canvasElement, first);
    escapeFrom(first);

    // Put back: a fresh frame, on its own document again.
    await waitFor(
      () => {
        const frame = canvasElement.querySelector<HTMLIFrameElement>(frameSelector());
        expect(frame).not.toBe(first);
        expect(frameLocation(frame!)).toBe('about:srcdoc');
        expect(frame!.contentDocument!.querySelector('#link')).not.toBeNull();
      },
      { timeout: 5000 },
    );

    escapeFrom(canvasElement.querySelector<HTMLIFrameElement>(frameSelector())!);
    await waitFor(
      () => {
        const demo = canvasElement.querySelector('[data-navigation-demo="page"]')!;
        expect(demo.querySelector('iframe')).toBeNull();
        expect(demo.querySelector('[data-html-left-frame]')?.textContent).toBe(
          DEFAULT_FIELD_STRINGS.pageLeftFrame,
        );
      },
      { timeout: 5000 },
    );
  },
};
