import type { Preview } from '@storybook/react-vite';
import { ThemePair } from './theme-pair';

/**
 * The two stylesheets, in the order a Tailwind host loads them: token VALUES
 * first, then the utilities that reference them. Both are read from SOURCE -
 * see the note in `main.ts` for why this Storybook must not load the prebuilt
 * `dist/styles.css`. The Tailwind entry is this directory's own superset of
 * the package's, so the scan reaches the stories without widening what ships.
 */
import '../src/styles/theme.css';
import './tailwind.css';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    /**
     * Four sections, in reading order, mirroring what the package actually is:
     * the inputs a method declares, the results it resolves to, the produced
     * layouts over both, and the scaffolding underneath. Alphabetical order
     * would open the sidebar on whatever happened to sort first.
     */
    options: {
      storySort: {
        order: ['Inputs', 'Outputs', 'Generative', 'Toolchain'],
      },
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    /**
     * `error`, not `todo`. A consumer's Storybook can afford to defer a11y
     * findings; this repo OWNS the controls, so a missing accessible name is
     * its bug. The react suite already asserts accessible names on the
     * controls it covers - failing here keeps a story from quietly regressing
     * what those tests pin.
     *
     * `color-contrast` is the one rule turned off, and it is turned off for a
     * reason that is recorded rather than assumed: the DEFAULT palette in
     * `src/styles/theme.css` is the stock shadcn/ui neutral set, and several of
     * its pairings sit below the bar - `--muted-foreground` 4.39:1 against
     * `--muted` (description text, pill labels), `--destructive` 3.76:1 against
     * `--background` and white 3.76:1 on `--destructive` (every error message,
     * the danger badge and button), and the `--border` / `--input` edges at
     * 1.27:1 and 1.10:1, under the 3:1 that identifies a control. Every one of
     * those is a real finding, and every one is a finding about a palette this
     * package ships as a starting point for hosts that have none - so fixing it
     * is a deliberate change to every such host's colours and not a side effect
     * of adding stories. This comment names all of them on purpose: a blanket
     * switch-off whose recorded reason covers one row is how the rest went
     * unmeasured. Tracked in `wip/default-palette-contrast.md`, with the numbers
     * and the pending decision; the rule goes back on with the fix. Everything
     * axe checks that is NOT a palette question - labels, roles, accessible
     * names, aria wiring - still fails the build.
     */
    a11y: {
      test: 'error',
      config: { rules: [{ id: 'color-contrast', enabled: false }] },
    },
  },
  globalTypes: {
    themeView: {
      description: 'Show both themes side by side, or one of them full width',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'pair', title: 'Light + Dark' },
          { value: 'light', title: 'Light only' },
          { value: 'dark', title: 'Dark only' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { themeView: 'pair' },
  decorators: [ThemePair],
};

export default preview;
