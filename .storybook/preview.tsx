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
     * Three sections, in reading order, mirroring what the package actually is:
     * the inputs a method declares, the results it resolves to, and the
     * scaffolding underneath. Alphabetical order would open the sidebar on
     * whatever happened to sort first.
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
     * `src/styles/theme.css` is the stock shadcn/ui neutral set, and its
     * `--muted-foreground` measures 4.39:1 against `--muted` - below AA, on a
     * pairing the controls use for description text and pill labels. That is a
     * real finding, but it is a finding about a palette this package ships as a
     * starting point for hosts that have none, so fixing it is a deliberate
     * change to every such host's colours and not a side effect of adding
     * stories. Tracked in `wip/default-palette-contrast.md`; the rule goes back
     * on with the fix. Everything axe checks that is NOT a palette question -
     * labels, roles, accessible names, aria wiring - still fails the build.
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
  // `play` is declared so a URL may set it: Storybook applies a global from
  // the URL only when the preview declares it. The screenshot pass of the
  // generative study sets `play:off` to shoot a page as a person first sees
  // it; the plays that honour it are wrapped in `skippable` (see
  // `src/__stories__/generative/source-stories.tsx`).
  initialGlobals: { themeView: 'pair', play: 'on' },
  decorators: [ThemePair],
};

export default preview;
