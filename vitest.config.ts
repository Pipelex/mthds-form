import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import type { Frame, Page } from 'playwright';
import type { BrowserCommand, BrowserCommandContext } from 'vitest/node';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Browser commands for the stories that click a link inside an HTML result's
 * frame (`src/__stories__/outputs/html-navigation.stories.tsx`).
 *
 * A story's `play` function runs inside the page under test, so it cannot see
 * a tab the page opens: a new tab is a fact about the browser, not about the
 * page. A command runs in Node, beside Playwright, so it can. The story
 * projects below register these, and a story reaches them through
 * `import('vitest/browser')`, which exists only when the stories
 * run as tests; in the Storybook UI the story asserts the rewritten markup
 * instead and leaves the tab to the test run.
 *
 * The click is Playwright's own, through the frame the story's page sits in
 * and then the result's frame, because a reader's click is the only thing that
 * may open a tab: a synthetic `click()` dispatched by the parent is a script's
 * gesture, which a browser's pop-up rules may treat differently.
 */

/** A tab the click opened, read before it is closed. */
interface OpenedPage {
  url: string;
  /**
   * Whether the new tab's `window.opener` is anything but `null`, asked of the
   * tab itself; `null` when the tab could not be asked. Playwright's own
   * `page.opener()` is not the question: it names the page that opened a tab
   * even under `noopener`, which severs only the tab's handle.
   */
  hasOpener: boolean | null;
}

/**
 * How long a click waits for a tab to open before it decides none will, when
 * the story expects none. A story that expects one passes a longer wait: the
 * whole suite runs its files in parallel, and a tab can take seconds to open
 * under that load.
 */
const NO_TAB_WAIT_MS = 1500;

/** After the first tab, how long a click waits for a second one. */
const SETTLE_MS = 300;

/** How long a new tab is given to commit to the URL it was opened on. */
const TAB_URL_MS = 5000;

/**
 * Whether the tab's `window.opener` is set, asked again for a moment while its
 * document is being replaced (a context destroyed mid-question throws); `null`
 * when it never answers.
 */
async function askOpener(page: Page): Promise<boolean | null> {
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline) {
    try {
      return await page.evaluate(() => window.opener !== null);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  return null;
}

/** How long a click looks for the story's frame before it gives up. */
const FIND_FRAME_MS = 10_000;

/**
 * The frame of the page under test that holds `selector`. It is looked for in
 * every frame of the session's page rather than through the tester frame's
 * locator (`context.iframe`), because while the suite runs several story files
 * at once that locator can name another file's frame, and a click through it
 * then waits until that file is done.
 */
async function frameHolding(context: BrowserCommandContext, selector: string): Promise<Frame> {
  const deadline = Date.now() + FIND_FRAME_MS;
  while (Date.now() < deadline) {
    for (const candidate of context.page.frames()) {
      const count = await candidate
        .locator(selector)
        .count()
        .catch(() => 0);
      if (count > 0) return candidate;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`No frame of the page under test holds ${selector}`);
}

/**
 * Click the first element matching `target` inside the first result frame
 * matching `frame`, then report every tab the click opened and close them.
 * `frame` should be unique to the story's run, since it is looked for across
 * the whole page.
 */
const clickInResultFrame: BrowserCommand<
  [frame: string, target: string, options?: { waitMs?: number }],
  OpenedPage[]
> = async (context, frame, target, { waitMs = NO_TAB_WAIT_MS } = {}) => {
  const holder = await frameHolding(context, frame);
  const before = new Set(context.context.pages());
  const opened = context.context
    .waitForEvent('page', { timeout: waitMs })
    .then(() => true)
    .catch(() => false);
  await holder.locator(frame).first().contentFrame().locator(target).first().click();
  if (await opened) await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
  const pages = context.context.pages().filter((page) => !before.has(page));
  return Promise.all(
    pages.map(async (page) => {
      // Only as far as the tab's own document is committed: waiting for it to
      // load would wait on whatever the test server answers there, and the
      // question is the tab's, not its document's.
      await page
        .waitForURL((url) => url.href !== 'about:blank', {
          waitUntil: 'commit',
          timeout: TAB_URL_MS,
        })
        .catch(() => undefined);
      const hasOpener = await askOpener(page);
      const url = page.url();
      await page.close().catch(() => undefined);
      return { url, hasOpener };
    }),
  );
};

const frameCommands = { clickInResultFrame };

/** How long a story run as a test may take; see the `storybook` project. */
const STORY_TIMEOUT_MS = 30_000;

declare module 'vitest/browser' {
  interface BrowserCommands {
    clickInResultFrame: (
      frame: string,
      target: string,
      options?: { waitMs?: number },
    ) => Promise<OpenedPage[]>;
  }
}

/**
 * One project per question, each in the environment that question needs.
 *
 * The core is headless by contract - it must import and run with no DOM
 * anywhere - so its suite runs in `node`, and a stray `document` reference in
 * kernel code fails there rather than passing quietly under a global jsdom.
 * The controls are the opposite: their filed bugs are DOM facts (an input with
 * no accessible name, a button still live during an upload), and nothing short
 * of rendering them can assert those.
 *
 * The generative tree is both at once. Its gates and its prompt are headless -
 * a hash over a string, a verdict over a spec - and run in `node`, so a DOM
 * reference in a gate fails as it would in the kernel; its controls are DOM
 * facts again (two labels pointing at one input, a brand component with no
 * brand in scope) and run in jsdom. So it has a project of each, told apart by
 * extension: a `.test.ts` there is headless, a `.test.tsx` renders.
 *
 * The stories run as tests in a real browser through Playwright. jsdom answers
 * "does this control expose the right accessible name"; only a browser answers
 * "does it lay out, in both themes, at this input shape". The two are
 * complementary and neither replaces the other, which is why the stories are
 * their own project rather than a widened `include` on a jsdom one. And the
 * story CORPUS is a question about the repository's files rather than about
 * any code, so it is a project of its own as well.
 *
 * The DOM and browser stacks are devDependencies only and ship in nothing - see
 * docs/dependency-budget.md, which governs what a consumer ships.
 *
 * This is the package's ONLY vitest config. It replaced a `vitest.config.mts`
 * that carried the coverage settings; leaving that file in place alongside this
 * one did not merge them - vitest resolves `.ts` first and the other became
 * dead config, so `test:coverage` quietly started measuring its own fixtures.
 */
export default defineConfig({
  test: {
    // Coverage is declared on the ROOT config, not per project: `projects`
    // shifts what runs but not what is measured, and the two suites answer one
    // question about one package. The subject is the kernel - the controls are
    // measured by rendering them, not by a percentage - so the report stays
    // pointed at `src/core/`, minus the barrel (a re-export has no branches to
    // cover) and the fixtures.
    coverage: {
      provider: 'v8',
      include: ['src/core/**/*.ts'],
      exclude: ['src/core/__tests__/**', 'src/core/index.ts'],
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
    },
    projects: [
      {
        test: {
          name: 'core',
          environment: 'node',
          include: ['src/core/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'react',
          environment: 'jsdom',
          include: ['src/react/**/*.test.{ts,tsx}'],
          setupFiles: ['./vitest.setup.react.ts'],
        },
      },
      {
        // The generative layer's headless half: the gates, the prompt and the
        // package data the designer method ships as. It reaches no DOM.
        test: {
          name: 'generative',
          environment: 'node',
          include: ['src/generative/**/*.test.ts'],
        },
      },
      {
        // The generative layer's controls, which render: a duplicate id or a
        // label pointing at the wrong input is a DOM fact, as in `react`.
        test: {
          name: 'generative-dom',
          environment: 'jsdom',
          include: ['src/generative/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.react.ts'],
        },
      },
      {
        // The brand entry is isomorphic and network-free: its contract, its
        // validator and its compiler run in `node`, so a DOM reference fails
        // here as it would in a build script.
        test: {
          name: 'brand',
          environment: 'node',
          include: ['src/brand/**/*.test.ts'],
        },
      },
      {
        // Not a test of the package at all: a test that the generated fixture
        // tree still matches the corpus it was generated from. Node, because it
        // reads directories. See src/__stories__/__tests__/corpus.test.ts.
        test: {
          name: 'corpus',
          environment: 'node',
          include: ['src/__stories__/**/*.test.ts'],
        },
      },
      {
        // The stories, run as tests: every story renders, and a story carrying
        // a `play` function has it executed. `storybookTest` reads
        // `.storybook/` for the story glob and the preview annotations, so the
        // decorator and stylesheets that make a story look right in the
        // Storybook UI are exactly the ones under test here.
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          // Twice Vitest's browser default. A story that drives the browser
          // through Playwright (a wheel, a click that opens a tab) waits on
          // the page under test answering it, which on a machine running
          // other suites at once has taken several seconds a step.
          testTimeout: STORY_TIMEOUT_MS,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
            // Pinned to IPv4 loopback, so `localhost` is a second origin that
            // reaches the same server: `Outputs/PDF pages` serves pdf.js's
            // worker across the two. Left to resolve `localhost`, the server
            // may bind `::1` alone, and `127.0.0.1` would then reach nothing.
            api: { host: '127.0.0.1' },
            commands: frameCommands,
          },
        },
      },
      // The navigation stories again, in the other engines. Where a framed
      // page's link goes is an engine's decision, measured to differ between
      // them (a parent's click listener never fires inside a script-less
      // frame in WebKit), so those stories are the one place the suite asks
      // the same question of every engine. Only that file, and only when
      // asked: `make test-navigation-browsers` sets the variable and names the
      // file, so `make test` stays on Chromium and a machine where one engine
      // will not start still runs the rest. See docs/storybook.md.
      ...(process.env.MTHDS_FORM_NAVIGATION_BROWSERS
        ? [
            {
              plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
              test: {
                name: 'storybook-navigation',
                testTimeout: STORY_TIMEOUT_MS,
                browser: {
                  enabled: true,
                  headless: true,
                  provider: playwright({}),
                  instances: navigationBrowsers(process.env.MTHDS_FORM_NAVIGATION_BROWSERS),
                  api: { host: '127.0.0.1' },
                  commands: frameCommands,
                },
              },
            },
          ]
        : []),
    ],
  },
});

/** The engines a comma-separated list names, of the two the navigation project measures. */
function navigationBrowsers(list: string): { browser: 'firefox' | 'webkit' }[] {
  const named = list.split(',').map((name) => name.trim());
  const unknown = named.filter((name) => name !== 'firefox' && name !== 'webkit');
  if (unknown.length > 0) {
    throw new Error(
      `MTHDS_FORM_NAVIGATION_BROWSERS names no engine it measures: ${unknown.join(', ')}`,
    );
  }
  return named.map((browser) => ({ browser: browser as 'firefox' | 'webkit' }));
}
