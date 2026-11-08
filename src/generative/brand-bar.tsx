'use client';

import { linkTextClass, selectedBorderClass, selectedFillClass } from '../react/role-tokens';
import { cn } from '../react/utils';
import { useBrand } from './brand-context';

/**
 * The brand's bar: the logo pair and the app's name, the site's links and a
 * tag, in a banner across the top of the page. It is what the catalog's
 * `AppBar` draws, and a host draws it as its own chrome - over a plain form,
 * or above a designed page whose layout has none - inside a `BrandProvider`,
 * or under a `GenerativePage` given a `brand`. It reads the manifest from
 * there, and throws naming the cure when there is none.
 */

/** The page's width and gutters, shared with the product page's chrome. */
export const CONTAINER = 'mx-auto w-full max-w-6xl px-6 sm:px-8';

export interface BrandBarProps {
  /** The app's name, beside the logo. */
  app: string;
  /** The site's links, drawn as words from the small breakpoint up. */
  links?: readonly string[] | null;
  /** A short code at the end of the bar, such as the pipe's. */
  tag?: string | null;
}

export function BrandBar({ app, links, tag }: BrandBarProps) {
  const brand = useBrand();
  return (
    <header className="border-b border-border">
      <div className={cn(CONTAINER, 'flex h-16 items-center gap-5')}>
        {/* `no-referrer` on both, as on every image this package paints: the
            scheme is already checked where the manifest is parsed, and a brand
            asset has no more business learning where it was drawn than a
            payload's picture does.

            This pair is the one place a `dark:` variant and the token fallbacks
            disagree. A fallback is frozen per utility and cannot vary by scope,
            so a host that defines no tokens renders LIGHT inside `.dark` - but
            the variant still flips, so that host gets the dark-ground asset on
            a light surface. Documented in `docs/theming.md` rather than worked
            around: the swap is right for every host that defines tokens, which
            is every host that sets `.dark` deliberately. */}
        <img
          src={brand.logo.onLight}
          alt={brand.name}
          referrerPolicy="no-referrer"
          className="h-7 w-auto dark:hidden"
        />
        <img
          src={brand.logo.onDark}
          alt={brand.name}
          referrerPolicy="no-referrer"
          className="hidden h-7 w-auto dark:block"
        />
        <span aria-hidden="true" className="h-5 w-px bg-border" />
        <span className="text-sm font-medium text-foreground/80">{app}</span>
        {/* `min-w-0` down to the pill: a pipe's code is one long word, and
            at phone width an unshrinkable pill pushed the row past the viewport. */}
        <div className="ml-auto flex min-w-0 items-center gap-6">
          {links && links.length > 0 ? (
            <nav aria-label="Site" className="hidden items-center gap-6 sm:flex">
              {links.map((link) => (
                <a
                  key={link}
                  href="#"
                  onClick={(event) => event.preventDefault()}
                  className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-hidden"
                >
                  {link}
                </a>
              ))}
            </nav>
          ) : null}
          {tag ? (
            <span
              className={cn(
                'min-w-0 truncate rounded-lg border px-2.5 py-1 font-mono text-[11px]',
                selectedBorderClass,
                selectedFillClass,
                linkTextClass,
              )}
            >
              {tag}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
