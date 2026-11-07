import * as React from 'react';
import { googleFontsHref, styleTokens, type AppStyleId, type TypefaceId } from './styles';
import { TEAMS, teamTokens, type TeamKey } from './teams';
import './frame.css';
import './styles.css';

const FONTS_LINK = 'link[data-app-style-fonts]';

/**
 * The faces, loaded once from Google Fonts. Story-only: a host self-hosts the
 * closed list instead, so its pages make no request to a font service. The
 * link records whether its stylesheet is still loading, for `styleFontsReady`.
 */
function useStyleFonts(): void {
  React.useEffect(() => {
    if (document.querySelector(FONTS_LINK)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = googleFontsHref();
    link.dataset.appStyleFonts = 'loading';
    link.addEventListener('load', () => (link.dataset.appStyleFonts = 'loaded'), { once: true });
    link.addEventListener('error', () => (link.dataset.appStyleFonts = 'failed'), { once: true });
    document.head.appendChild(link);
  }, []);
}

/** How long a story waits on the font service before measuring the fallback faces. */
const FONTS_PATIENCE_MS = 10_000;

/**
 * Resolves once the faces a page uses have loaded, or failed to: first the
 * stylesheet that declares them, then the faces themselves. `document.fonts
 * .ready` alone resolves before a stylesheet an effect appended has declared
 * any face, so a measurement taken on it reads the fallback faces. A font
 * service that never answers, for the stylesheet or for a face, is waited on
 * for `FONTS_PATIENCE_MS` in all, after which the page is measured in its
 * fallback faces rather than not at all. A stylesheet still loading by then
 * is marked `stalled`, so the stories after it measure at once instead of
 * each spending its own patience, most of a test's time, on the same
 * silence; if it arrives later after all, its `load` marks it `loaded`.
 */
export async function styleFontsReady(): Promise<void> {
  let patience: ReturnType<typeof setTimeout> | undefined;
  const outOfPatience = new Promise<'out of patience'>((resolve) => {
    patience = setTimeout(() => resolve('out of patience'), FONTS_PATIENCE_MS);
  });
  try {
    const outcome = await Promise.race([fontsSettled(), outOfPatience]);
    const link = document.querySelector<HTMLLinkElement>(FONTS_LINK);
    if (outcome === 'out of patience' && link?.dataset.appStyleFonts === 'loading')
      link.dataset.appStyleFonts = 'stalled';
  } finally {
    clearTimeout(patience);
  }
}

async function fontsSettled(): Promise<void> {
  const link = document.querySelector<HTMLLinkElement>(FONTS_LINK);
  if (link?.dataset.appStyleFonts === 'loading') {
    await new Promise<void>((resolve) => {
      link.addEventListener('load', () => resolve(), { once: true });
      link.addEventListener('error', () => resolve(), { once: true });
    });
  }
  // A layout pass is what requests the faces the page now declares.
  document.body.getBoundingClientRect();
  await document.fonts.ready;
}

function declarations(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([name, value]) => `${name}: ${value};`)
    .join(' ');
}

export interface AppScopeProps {
  /**
   * The style; `none` renders the host's page with no style class at all. A
   * typeface on it sets what it sets on `quiet`, the host's own look.
   */
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
      ...(style !== 'none'
        ? styleTokens(style, typeface, mode)
        : typeface
          ? styleTokens('quiet', typeface, mode)
          : {}),
      ...(team ? teamTokens(TEAMS[team], mode) : {}),
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
