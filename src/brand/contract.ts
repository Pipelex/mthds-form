/**
 * The brand contract, as data: which token of a brand's `tokens.json` sets
 * which custom property, and what that property paints.
 *
 * It is the theme contract seen from the other side. `src/styles/theme.css`
 * states it as a working default and `docs/theming.md` in prose; this is the
 * same list as a table a build can read, and a brand is exactly these tokens
 * and no others - the validator refuses a file that adds one, because a token
 * nothing consumes is a value with no way to be looked at.
 *
 * The colour and radius rows are not a second list kept beside `theme.css`:
 * they are held to it, by `__tests__/contract.test.ts` over the source and by
 * `scripts/assert-bundle.mjs` over the build. The two typography rows are the
 * exception, and on purpose. `--font-sans` and `--font-mono` are the names of
 * Tailwind's own theme variables, which the prebuilt sheet already declares,
 * so `theme.css` does not define them: it is unlayered, and a value there
 * would override the typeface of every host that loads it. The stock
 * typeface is therefore the host's own, and only a brand's scope sets these
 * two. See docs/brand.md.
 */

export type ContractTokenType = 'color' | 'dimension' | 'fontFamily';

export interface ContractToken {
  /** The DTCG token id, `color.background`. */
  id: string;
  /** The custom property it sets, `--background`. */
  variable: string;
  type: ContractTokenType;
  /** What the property paints, in the words a producer is told. */
  paints: string;
}

/** The colour tokens, in the order `theme.css` states them. */
export const COLOR_TOKEN_NAMES = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
] as const;

export type ColorTokenName = (typeof COLOR_TOKEN_NAMES)[number];

export function isColorTokenName(name: string): name is ColorTokenName {
  return (COLOR_TOKEN_NAMES as readonly string[]).includes(name);
}

const COLOR_PAINTS: Record<ColorTokenName, string> = {
  background: 'The page canvas.',
  foreground: 'Text on the canvas.',
  card: "A raised surface on the canvas: the rail's panel, a list's rows. May be translucent.",
  'card-foreground': 'Text on a card.',
  popover: "A floating surface: a select's menu, a tooltip. Opaque.",
  'popover-foreground': 'Text on a popover.',
  primary: 'The accent: the run button, a selected pill, a section number, a highlight.',
  'primary-foreground': 'Text on the accent.',
  secondary: 'A quiet filled surface: a secondary button, an unselected segment.',
  'secondary-foreground': 'Text on a secondary surface.',
  muted: "A subdued fill: a table's header band, an inactive tab strip.",
  'muted-foreground':
    "Secondary text: descriptions, hints, a summary row's label. Most of the text on the page that is not a heading or a value.",
  accent: 'A hover fill: a menu item under the pointer.',
  'accent-foreground': 'Text on an accent fill.',
  destructive: 'The error colour: an invalid mark, a remove button.',
  'destructive-foreground': 'Text on the destructive colour.',
  border: 'The hairline: every border and divider.',
  input:
    "The control surface, a field's own fill - a step off the canvas, so fields read as one family.",
  ring: 'The focus ring.',
};

export const BRAND_CONTRACT: readonly ContractToken[] = [
  ...COLOR_TOKEN_NAMES.map((name): ContractToken => ({
    id: `color.${name}`,
    variable: `--${name}`,
    type: 'color',
    paints: COLOR_PAINTS[name],
  })),
  {
    id: 'radius.base',
    variable: '--radius',
    type: 'dimension',
    paints: 'The corner radius of a control; cards take one and a half of it.',
  },
  {
    id: 'font.sans',
    variable: '--font-sans',
    type: 'fontFamily',
    paints: 'The typeface of everything on the page.',
  },
  {
    id: 'font.mono',
    variable: '--font-mono',
    type: 'fontFamily',
    paints: 'Tags, numbers, the receipt.',
  },
];

/** The pairs that must clear WCAG AA in both modes, computed on the opaque colours. */
export const CONTRAST_PAIRS: readonly {
  foreground: ColorTokenName;
  background: ColorTokenName;
}[] = [
  { foreground: 'foreground', background: 'background' },
  { foreground: 'muted-foreground', background: 'background' },
];

/** The minimum contrast ratio those pairs must reach: WCAG 2 AA for normal text. */
export const MIN_CONTRAST = 4.5;

const byId = new Map(BRAND_CONTRACT.map((token) => [token.id, token]));

/** The custom property a token sets, or a loud failure for a token the contract does not name. */
export function contractVariable(id: string): string {
  const token = byId.get(id);
  if (!token) throw new Error(`The brand contract has no token ${id}.`);
  return token.variable;
}
