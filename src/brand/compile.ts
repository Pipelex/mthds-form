import { BRAND_CONTRACT, COLOR_TOKEN_NAMES, type ColorTokenName } from './contract';
import {
  aliasTarget,
  asWritten,
  type BrandTokens,
  colorHex,
  type ColorValue,
  isControlCharacter,
  modeValue,
  type SrgbColor,
} from './tokens';

/**
 * A validated `tokens.json` in, the brand's stylesheet out.
 *
 * What comes out is exactly the contract, scoped: a `.<scope>` block setting
 * every custom property the contract names, and a `.dark .<scope>` block
 * restating every colour with its dark value. The `.dark` ancestor is the
 * package's own dark-mode convention (`theme.css`, the `dark` variant), so a
 * branded page inside a dark pane picks its dark values up with nothing else
 * to wire.
 *
 * The scope block also sets `font-family: var(--font-sans)`. Tailwind's
 * preflight resolves the page's typeface once, at `<html>`, so a scope that
 * only set `--font-sans` lower in the tree would change no text; declaring the
 * family where the scope is makes the brand's typeface reach everything under
 * it - the produced page and the plain form alike - while a page with no brand
 * keeps the host's own typeface untouched.
 *
 * The contract is closed - a fixed set of tokens, colours in sRGB only, one
 * length, two font stacks - so compiling a file the validator accepted is this
 * function and no dependency. It takes the file as `validateBrandTokens`
 * returned it; anything else is the caller's mistake, and `assembleBrand` is
 * the route that cannot make it. The output stays comparable with what a
 * standard DTCG tool writes for the same file: `__tests__/terrazzo.test.ts`
 * compiles every committed brand through Terrazzo and compares the
 * declarations.
 */
export function compileBrand(tokens: BrandTokens, scope: string): string {
  if (!/^[a-z][a-z0-9-]*$/.test(scope)) {
    throw new Error(`compileBrand: "${scope}" is not a scope class (see brandScope).`);
  }
  const light: string[] = [];
  const dark: string[] = [];
  for (const name of COLOR_TOKEN_NAMES) {
    const token = tokens.color[name];
    light.push(...declaration(token.$description, `--${name}`, colorCss(name, token.$value)));
    dark.push(
      ...declaration(token.$description, `--${name}`, colorCss(name, modeValue(token, 'dark'))),
    );
  }
  const radius = tokens.radius.base;
  light.push(
    ...declaration(radius.$description, '--radius', `${radius.$value.value}${radius.$value.unit}`),
  );
  for (const key of ['sans', 'mono'] as const) {
    const font = tokens.font[key];
    light.push(...declaration(font.$description, `--font-${key}`, fontStack(font.$value)));
  }
  light.push(
    '  /* The typeface reaches the text here, where the scope is; see compileBrand. */',
    '  font-family: var(--font-sans);',
  );
  return [`.${scope} {`, ...light, '}', '', `.dark .${scope} {`, ...dark, '}', ''].join('\n');
}

/** Every custom property a compiled brand sets on its scope, in contract order. */
export const BRAND_VARIABLES: readonly string[] = BRAND_CONTRACT.map((token) => token.variable);

function declaration(description: string, property: string, value: string): string[] {
  return [`  /* ${commentText(description)} */`, `  ${property}: ${value};`];
}

/**
 * A description as comment text: one line, and nothing that could close the
 * comment, nor the `<style>` element of a host that inlines the stylesheet.
 */
function commentText(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/\*\//g, '* /').replace(/<\//g, '< /').trim();
}

function colorCss(name: ColorTokenName, value: ColorValue): string {
  const target = aliasTarget(value);
  if (target !== null) {
    // The validator has already refused an alias outside the contract; a
    // stray one here would write a reference to a property nothing sets.
    if (!(COLOR_TOKEN_NAMES as readonly string[]).includes(target)) {
      throw new Error(`compileBrand: color.${name} aliases {color.${target}}.`);
    }
    return `var(--${target})`;
  }
  return srgbCss(value as SrgbColor);
}

/**
 * An opaque colour as its hex, a translucent one as `rgb()` with its alpha,
 * both as `asWritten` rounds them, which is the colour the validator measured.
 */
function srgbCss(color: SrgbColor): string {
  const { alpha } = asWritten(color);
  if (alpha >= 1) return colorHex(color);
  const [r, g, b] = color.components.map((channel) => Math.round(channel * 255));
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

/**
 * The family names CSS reads as keywords rather than as a face's name, which
 * must therefore stay unquoted: quoting `sans-serif` names a font called
 * "sans-serif" and loses the generic fallback.
 */
const KEYWORD_FAMILIES = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'emoji',
  'math',
  'fangsong',
  '-apple-system',
  'blinkmacsystemfont',
]);

function fontStack(families: readonly string[]): string {
  return families
    .map((family) => (KEYWORD_FAMILIES.has(family.toLowerCase()) ? family : cssString(family)))
    .join(', ');
}

/**
 * A produced name as a CSS string that cannot end early. The quote and the
 * backslash are escaped; a control character (a form feed ends a string) and
 * `<` (which could close the `<style>` element of a host that inlines the
 * stylesheet) are written as their code points.
 */
function cssString(text: string): string {
  const escaped = [...text.replace(/[\\']/g, '\\$&')]
    .map((char) =>
      char === '<' || char === '>' || isControlCharacter(char)
        ? `\\${char.codePointAt(0)!.toString(16)} `
        : char,
    )
    .join('');
  return `'${escaped}'`;
}
