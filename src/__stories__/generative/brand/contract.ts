import { z } from 'zod';
import { brandManifestSchema } from './manifest';

/**
 * The theme contract, as data.
 *
 * `src/styles/theme.css` states the contract as a working default and
 * `docs/theming.md` states it in prose; this is the same list as a table a
 * build can read: which token of a brand's `tokens.json` sets which custom
 * property, and what that property paints. A brand is exactly these tokens
 * and no others - the validator refuses a file that adds one, because a token
 * nothing consumes is a value with no way to be looked at - and the node test
 * asserts the table and `theme.css` name the same variables, so the contract
 * cannot drift from the default that implements it.
 *
 * The brief a producer is given (`renderBrandContract`) is rendered from this
 * table, and its hash is stamped on every brand's provenance: a change to the
 * contract invalidates every brand written against the old one, loudly.
 */

export type ContractTokenType = 'color' | 'dimension' | 'fontFamily';

export interface ContractToken {
  /** The DTCG token id, `color.background`. */
  id: string;
  /** The custom property it sets, `--background`. */
  variable: string;
  type: ContractTokenType;
  /** What the property paints, in the words the brief uses. */
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

/** The pairs that must clear WCAG AA in both modes. */
export const CONTRAST_PAIRS: readonly { foreground: ColorTokenName; background: ColorTokenName }[] =
  [
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

const TOKENS_SKELETON = `{
  "color": {
    "$type": "color",
    "background": {
      "$value": { "colorSpace": "srgb", "components": [1, 1, 1], "alpha": 1, "hex": "#ffffff" },
      "$description": "The site's page background: white.",
      "$extensions": {
        "mode": {
          "dark": { "colorSpace": "srgb", "components": [0.0314, 0.0235, 0.0549], "alpha": 1, "hex": "#08060e" }
        }
      }
    },
    "card": {
      "$value": "{color.background}",
      "$description": "The site has no distinct card surface in light mode; a card is the canvas.",
      "$extensions": {
        "mode": {
          "dark": { "colorSpace": "srgb", "components": [1, 1, 1], "alpha": 0.04 }
        }
      }
    }
  },
  "radius": {
    "$type": "dimension",
    "base": {
      "$value": { "value": 0.75, "unit": "rem" },
      "$description": "The site's cards and buttons are rounded-xl."
    }
  },
  "font": {
    "$type": "fontFamily",
    "sans": {
      "$value": ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      "$description": "The site's one typeface, with the system stack behind it."
    },
    "mono": {
      "$value": ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      "$description": "The site sets no monospace face; the system stack."
    }
  }
}`;

const MANIFEST_SKELETON = `{
  "name": "Acme",
  "website": "https://acme.example/",
  "logo": {
    "onLight": "https://acme.example/logo-dark-on-light.svg",
    "onDark": "https://acme.example/logo-light-on-dark.svg"
  },
  "webfont": { "provider": "google-fonts", "family": "Inter" }
}`;

/**
 * The contract as the document a producer is given: the table, the file
 * rules, the manifest's JSON Schema, and a skeleton of each file. Hashed with
 * `promptHashOf`, and that hash is the `contractHash` on a brand's provenance.
 */
export function renderBrandContract(): string {
  const rows = BRAND_CONTRACT.map(
    (token) => `| \`${token.id}\` | \`${token.variable}\` | ${token.type} | ${token.paints} |`,
  );
  const pairs = CONTRAST_PAIRS.map(
    (pair) => `\`color.${pair.foreground}\` on \`color.${pair.background}\``,
  );
  const manifestSchema = JSON.stringify(z.toJSONSchema(brandManifestSchema), null, 2);
  return [
    '# The brand contract',
    '',
    'A brand is data: two JSON files a producer writes, `tokens.json` and `brand.json`, and nothing else. A page is painted from the tokens alone - anything the tokens cannot state is not on the page - so what the site looks like has to be carried by these values or it is lost.',
    '',
    '## tokens.json',
    '',
    'A DTCG (Design Tokens Community Group) token file, 2025.10 format, carrying exactly the tokens below and no others: a token the contract does not name is refused, and a token it names but the file omits is refused. Three groups, each carrying its `$type`: `color` (`"$type": "color"`), `radius` (`"$type": "dimension"`) and `font` (`"$type": "fontFamily"`). Every token carries a `$description`: one sentence saying where on the site the value comes from, or how it was derived when the site does not state it.',
    '',
    '| Token | Sets | Type | Paints |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
    '### Colours',
    '',
    'A colour is an object, never a string: `{ "colorSpace": "srgb", "components": [r, g, b], "alpha": a }` with each component and the alpha in 0..1, and an optional `"hex": "#rrggbb"` that must agree with the components. The colour space is always `srgb`. A token that IS another token is an alias, written as the string `"{color.<name>}"` naming a colour token of this contract - `"{color.background}"` for a card that is the canvas, `"{color.primary}"` for a ring that is the accent. An alias may not form a cycle.',
    '',
    'Every colour token carries two values and no more: `$value` is the LIGHT mode and `$extensions.mode.dark` is the DARK mode. There is no `light` key. When the site has one mode only, its values go in the mode it has and the other mode is derived: invert the canvas and the ink, keep the accent, and keep the surfaces a step off the canvas in the same direction.',
    '',
    `These pairs must reach a contrast ratio of ${MIN_CONTRAST} (WCAG 2 AA for normal text) in BOTH modes, computed on the opaque colours: ${pairs.join(', ')}. No other pair is checked: text on the accent may fall short if the site's own does, and a card may be translucent.`,
    '',
    '### Radius',
    '',
    '`radius.base` is a dimension, `{ "value": <number>, "unit": "rem" | "px" }`, no modes.',
    '',
    '### Fonts',
    '',
    "`font.sans` and `font.mono` are arrays of family names, the site's own first and a generic family last (`sans-serif`, `monospace`), no modes. A family that is a web font is named here AND declared in the manifest so the page can load it; a family the manifest does not declare is expected to be installed or to fall through the stack.",
    '',
    '### Skeleton',
    '',
    '```json',
    TOKENS_SKELETON,
    '```',
    '',
    '## brand.json',
    '',
    "The manifest: the brand's name, its site, one logo for each canvas (`onLight` is the mark drawn on the light canvas, `onDark` the one drawn on the dark canvas - both absolute URLs, the site's own files), and the web font to load for `font.sans`, or `null` when there is none. It validates against this JSON Schema:",
    '',
    '```json',
    manifestSchema,
    '```',
    '',
    '```json',
    MANIFEST_SKELETON,
    '```',
    '',
  ].join('\n');
}
