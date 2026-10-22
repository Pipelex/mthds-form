/**
 * Text in the brand's colour: the one class every control and produced-layout
 * component writes accent text with.
 *
 * `--primary` is the button colour, and a branded button colour can be
 * anything a person picked - an amber, a pale yellow - which is a fine fill and
 * unreadable as text. So the button colour is only ever a fill, and text that
 * wants the brand's colour reads `--brand`: the accent as text, already made
 * readable against the page by the host (the `./brand` entry's
 * `deriveBrandRoles` returns it as `accentInk`). A host that defines no
 * `--brand` gets `--primary`, which is exactly the colour this text had before
 * `--brand` was read, so an unbranded page renders as it always did.
 *
 * It is an arbitrary value rather than a named utility on purpose. A Tailwind
 * host compiles the package's classes against its OWN theme, so a `text-brand`
 * utility would exist only in a host that happened to map `--color-brand`, and
 * would paint nothing anywhere else. The arbitrary value carries its own
 * `var()` chain, so every build that scans the package generates it. Its
 * innermost fallback is `theme.css`'s light `--primary`, as every token read
 * around the `@theme inline` mapping must spell it - `make assert-bundle`
 * holds both the chain and the value. See docs/theming.md § "Brand ink".
 */
export const brandInkClass = 'text-[color:var(--brand,var(--primary,hsl(240_5.9%_10%)))]';
