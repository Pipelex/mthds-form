import type { Preview } from '@storybook/react-vite';
import { ThemePair } from './theme-pair';

/**
 * The two stylesheets, in the order a Tailwind host loads them: token VALUES
 * first, then the utilities that reference them. Both are read from SOURCE -
 * see the note in `main.ts` for why this Storybook must not load the prebuilt
 * `dist/styles.css`.
 */
import '../src/styles/theme.css';
import '../src/styles/tailwind-entry.css';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    /**
     * `error`, not `todo`. A consumer's Storybook can afford to defer a11y
     * findings; this repo OWNS the controls, so a missing accessible name is
     * its bug. The react suite already asserts accessible names on the
     * controls it covers - failing here keeps a story from quietly regressing
     * what those tests pin.
     */
    a11y: { test: 'error' },
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
