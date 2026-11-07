import * as React from 'react';
import { googleFontsHref, styleTokens, type AppStyleId, type TypefaceId } from './styles';
import { HOST_PAGE, TEAMS, teamTokens, type TeamKey } from './teams';
import './frame.css';
import './styles.css';

/**
 * The faces, loaded once from Google Fonts. Story-only: a host self-hosts the
 * closed list instead, so its pages make no request to a font service.
 */
function useStyleFonts(): void {
  React.useEffect(() => {
    if (document.querySelector('link[data-app-style-fonts]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = googleFontsHref();
    link.dataset.appStyleFonts = '';
    document.head.appendChild(link);
  }, []);
}

function declarations(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([name, value]) => `${name}: ${value};`)
    .join(' ');
}

export interface AppScopeProps {
  /** The style; `none` renders the host's page with no style class at all. */
  style: AppStyleId | 'none';
  /** The team whose colours the page wears, or none. */
  team: TeamKey | null;
  /** The team's typeface, or none (the style's own face). */
  typeface?: TypefaceId | null;
  children: React.ReactNode;
}

/**
 * A host's page wearing a style and a team's colours: the host's palette
 * (`app-host`), the style's class, and the tokens of both, in each theme, as
 * a host sets them at the root of the page it brands. The `.dark` class is an
 * ancestor's (the `ThemePair` pane's), so each theme's tokens are one rule of
 * a stylesheet scoped to this page rather than an inline style.
 */
export function AppScope({ style, team, typeface = null, children }: AppScopeProps) {
  useStyleFonts();
  const scope = `app-scope-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const css = React.useMemo(() => {
    const theme = (mode: 'light' | 'dark') => ({
      ...(style === 'none' ? {} : styleTokens(style, typeface, mode)),
      ...(team ? teamTokens(TEAMS[team], HOST_PAGE[mode]) : {}),
    });
    const light = declarations(theme('light'));
    const dark = declarations(theme('dark'));
    // Doubled, to outrank the host palette's `.dark .app-host` in either theme.
    return `.${scope}.${scope} { ${light} }\n.dark .${scope}.${scope} { ${dark} }`;
  }, [scope, style, team, typeface]);
  const classes = ['app-host', scope];
  if (style !== 'none') classes.push('app-style', `app-style-${style}`);
  return (
    <div className={classes.join(' ')} data-typeface={typeface ?? undefined}>
      <style>{css}</style>
      {children}
    </div>
  );
}
