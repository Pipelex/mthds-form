import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

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
