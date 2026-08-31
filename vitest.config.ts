import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Three suites, three environments, because the package is two layers and the
 * stories are a third question about them.
 *
 * The core is headless by contract - it must import and run with no DOM
 * anywhere - so its suite runs in `node`, and a stray `document` reference in
 * kernel code fails there rather than passing quietly under a global jsdom.
 * The controls are the opposite: their filed bugs are DOM facts (an input with
 * no accessible name, a button still live during an upload), and nothing short
 * of rendering them can assert those.
 *
 * The third project runs the STORIES, in a real browser through Playwright.
 * jsdom answers "does this control expose the right accessible name"; only a
 * browser answers "does it lay out, in both themes, at this input shape". The
 * two are complementary and neither replaces the other, which is why this is a
 * third project rather than a widened `include` on the second.
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
        // The stories, run as tests: every story renders, and a story carrying
        // a `play` function has it executed. `storybookTest` reads
        // `.storybook/` for the story glob and the preview annotations, so the
        // decorator and stylesheets that make a story look right in the
        // Storybook UI are exactly the ones under test here.
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
