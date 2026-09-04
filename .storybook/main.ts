import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Storybook is where the controls are LOOKED at. The unit suites already assert
 * the DOM facts (`src/react/__tests__/`); what nothing else in this repo can
 * answer is whether a control renders correctly, in both themes, across every
 * input shape the standard can produce.
 *
 * Stories live in `src/__stories__/`, deliberately OUTSIDE both entry trees.
 * `tsup.config.ts` globs `src/core/*.ts` and `src/react/index.ts`, and
 * `scripts/assert-bundle.mjs` walks what those entries reach - so a story
 * helper placed inside either tree would enter a shipped chunk. Keeping story
 * code in its own directory is what keeps the bundle invariants meaningful.
 */
const config: StorybookConfig = {
  // `.mdx` is deliberately absent until a docs page exists: Storybook warns on
  // every run for a glob that matches nothing. Add it back with the first one.
  stories: ['../src/__stories__/**/*.stories.@(ts|tsx)'],
  // The corpus's own input files, served so a story can hand the result view a
  // URL a browser can actually fetch. Nothing a RUN produces is one - a
  // `pipelex-storage://` reference resolves only through the host's resolver -
  // so the preview seam has no other way to be looked at. See
  // `outputs/preview.stories.tsx`.
  staticDirs: ['../data/inputs'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-vitest'],
  framework: '@storybook/react-vite',
  viteFinal: async (viteConfig, { configType }) => {
    /**
     * The hosted API, reachable from a served Storybook and from nowhere else.
     *
     * The generative study's method pages can RUN the method they lay out,
     * through the hosted API over `@pipelex/sdk` - but the API sends no CORS
     * headers, so the browser cannot call it, and a key must never reach a
     * client bundle. Both are answered by the dev server: it proxies `/v1` to
     * the API and injects the `Authorization` header itself, so the page calls
     * its own origin with a placeholder key and the real one lives only in this
     * process. The key is read once and DELETED from the environment before
     * Storybook copies `STORYBOOK_*` variables into the client's
     * `import.meta.env` (which it does when the Vite server is created, after
     * this hook returns); what the client learns is the one flag below.
     *
     *   STORYBOOK_PIPELEX_API_KEY=... STORYBOOK_PIPELEX_BASE_URL=... make storybook
     *
     * A static build has no dev server and therefore no proxy, so the flag is
     * only ever set for the served one: a built Storybook renders every method
     * page and runs nothing, whatever the environment said. Without a key the
     * served one does the same, and the pages say so.
     */
    const apiKey = process.env.STORYBOOK_PIPELEX_API_KEY;
    delete process.env.STORYBOOK_PIPELEX_API_KEY;
    const apiBaseUrl = (
      process.env.STORYBOOK_PIPELEX_BASE_URL ?? 'https://api.pipelex.com'
    ).replace(/\/+$/, '');
    if (apiKey && configType === 'DEVELOPMENT') {
      process.env.STORYBOOK_PIPELEX_RUN = '1';
      viteConfig.server = {
        ...(viteConfig.server ?? {}),
        proxy: {
          ...(viteConfig.server?.proxy ?? {}),
          '/v1': {
            target: apiBaseUrl,
            changeOrigin: true,
            headers: { Authorization: `Bearer ${apiKey}` },
          },
        },
      };
    } else {
      delete process.env.STORYBOOK_PIPELEX_RUN;
    }

    /**
     * Tailwind runs from the SOURCE entry here, not from the prebuilt
     * `dist/styles.css`.
     *
     * A consumer's Storybook loads the prebuilt sheet because it has no
     * Tailwind build of its own. This repo has one, and pointing its own
     * Storybook at the prebuilt artifact would defeat the purpose: a control
     * styled with a utility that is not in the LAST BUILT `styles.css` would
     * render unstyled in the very Storybook meant to catch that. The
     * `@tailwindcss/vite` plugin below compiles `.storybook/tailwind.css` -
     * which imports `src/styles/tailwind-entry.css` and widens its scan to the
     * stories - from the current source on every reload.
     */
    /**
     * Pre-bundle the control set's runtime dependencies up front.
     *
     * Vite discovers dependencies lazily, and the first story that renders a
     * real control pulls in the whole radix/lucide/dropzone set at once. That
     * triggers a mid-run re-optimization and a page reload, which the story
     * tests observe as `Failed to fetch dynamically imported module: .../sb-vitest/deps/...`
     * against a Storybook-internal chunk - a failure that names nothing to do
     * with the change that caused it. Naming them here means they are optimized
     * before any story loads.
     */
    viteConfig.optimizeDeps = {
      ...(viteConfig.optimizeDeps ?? {}),
      include: [
        ...(viteConfig.optimizeDeps?.include ?? []),
        '@radix-ui/react-select',
        '@radix-ui/react-switch',
        '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group',
        'class-variance-authority',
        'clsx',
        'lucide-react',
        'react-dropzone',
        'tailwind-merge',
        // The generative layer's runtime (dev-only, story tree only): the
        // first generative story pulls all of it at once otherwise.
        '@json-render/core',
        '@json-render/react',
        '@json-render/shadcn',
        'radix-ui',
        'zod',
      ],
    };

    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },
};

export default config;
