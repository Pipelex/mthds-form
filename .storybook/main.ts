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
  viteFinal: async (viteConfig) => {
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
