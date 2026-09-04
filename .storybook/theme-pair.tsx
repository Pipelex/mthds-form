import * as React from 'react';
import type { Decorator } from '@storybook/react-vite';

/**
 * Every story renders in BOTH themes, side by side.
 *
 * The controls are themed entirely through CSS custom properties, and dark mode
 * is the `.dark` class convention (`src/styles/theme.css`, and the
 * `@custom-variant dark` in `src/styles/tailwind-entry.css`). A toolbar toggle
 * would technically cover both, but it hides half the answer behind a click -
 * and the point of this Storybook is to see the possibilities at a glance. So
 * the default view is two panes; the toolbar is there for anyone who wants one
 * of them full width.
 *
 * This decorator's own chrome uses INLINE STYLES over the theme tokens, never
 * Tailwind utilities. The package's entry scans `src/react` only, and the
 * Storybook's own entry (`.storybook/tailwind.css`) is the one that reaches
 * `src/__stories__` - so a utility used here would compile, but it would be
 * scanned by a file that ships nowhere, and the chrome stays framework-free so
 * it cannot be mistaken for a control.
 */

export type ThemeView = 'pair' | 'light' | 'dark';

/**
 * The caption colour is `--muted-foreground` at FULL opacity, not
 * `--foreground` dimmed with `opacity`, and the difference is not cosmetic:
 * `a11y: 'error'` is on, and a dimmed foreground blends against the pane
 * background to a colour that fails WCAG AA contrast at this size. The first
 * story written against this decorator failed on exactly that, reported as the
 * story's violation rather than the decorator's - so the chrome around a story
 * has to clear the same bar the story does, or it spends the gate's signal on
 * itself. Both themes' `--muted-foreground` clear 4.5:1 against their own
 * `--background` (4.83:1 light, 7.77:1 dark).
 */
const CAPTION: React.CSSProperties = {
  font: '600 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--muted-foreground)',
  padding: '10px 16px 0',
};

const PANE: React.CSSProperties = {
  flex: '1 1 0',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--background)',
  color: 'var(--foreground)',
};

const BODY: React.CSSProperties = { padding: 16, flex: '1 1 auto' };

function Pane({
  theme,
  captioned,
  children,
}: {
  theme: 'light' | 'dark';
  captioned: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={theme === 'dark' ? 'dark' : undefined} style={PANE}>
      {captioned ? <div style={CAPTION}>{theme}</div> : null}
      <div style={BODY}>{children}</div>
    </div>
  );
}

export const ThemePair: Decorator = (Story, context) => {
  const view = (context.globals.themeView as ThemeView | undefined) ?? 'pair';
  const story = <Story />;

  if (view === 'light' || view === 'dark') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Pane theme={view} captioned={false}>
          {story}
        </Pane>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'stretch' }}>
      <Pane theme="light" captioned>
        {story}
      </Pane>
      <div style={{ width: 1, background: 'var(--border)', flex: '0 0 auto' }} />
      <Pane theme="dark" captioned>
        {story}
      </Pane>
    </div>
  );
};
