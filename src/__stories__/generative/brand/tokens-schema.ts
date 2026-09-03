import { z } from 'zod';
import {
  COLOR_TOKEN_NAMES,
  type ColorTokenName,
  CONTRAST_PAIRS,
  isColorTokenName,
  MIN_CONTRAST,
} from './contract';

/**
 * Our own validation of a brand's `tokens.json`, run BEFORE Terrazzo sees it.
 *
 * Terrazzo validates a token file against the DTCG format, which is looser
 * than the contract in every direction that matters here: it accepts any
 * token, any colour space, a string colour (and turns an unparseable one into
 * black without a word), a hex with no components (which passes its parser
 * and crashes its build), and it checks contrast on the light value only.
 * Each of those is a way for a model's file to be wrong and the page to be
 * painted anyway. So this checks the contract's own rules first - exactly its
 * tokens, object colours in sRGB, aliases only to contract tokens and never in
 * a cycle, a description on every token, `dark` the only mode and stated on
 * every colour object (an alias may stand for both modes), the two contrast
 * pairs in both modes - and hands Terrazzo a file it can only accept.
 */

const component = z.number().min(0).max(1);

export const srgbColorSchema = z.strictObject({
  colorSpace: z.literal('srgb'),
  components: z.tuple([component, component, component]),
  alpha: z.number().min(0).max(1),
  hex: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i, 'a hex colour is #rrggbb')
    .optional(),
});

export type SrgbColor = z.infer<typeof srgbColorSchema>;

const colorAliasSchema = z
  .string()
  .regex(/^\{color\.[a-z][a-z-]*\}$/, 'an alias is "{color.<name>}"');

const colorValueSchema = z.union([srgbColorSchema, colorAliasSchema]);

export type ColorValue = z.infer<typeof colorValueSchema>;

const description = z.string().min(1, 'every token carries a $description');

const colorTokenSchema = z
  .strictObject({
    $value: colorValueSchema,
    $description: description,
    $extensions: z
      .strictObject({
        mode: z.strictObject({ dark: colorValueSchema }),
      })
      .optional(),
  })
  .refine((token) => token.$extensions !== undefined || typeof token.$value === 'string', {
    message: 'a colour carries $extensions.mode.dark; only an alias may stand for both modes',
    path: ['$extensions'],
  });

export type ColorToken = z.infer<typeof colorTokenSchema>;

const dimensionTokenSchema = z.strictObject({
  $value: z.strictObject({ value: z.number().min(0), unit: z.enum(['rem', 'px']) }),
  $description: description,
});

export type DimensionToken = z.infer<typeof dimensionTokenSchema>;

const fontFamilyTokenSchema = z.strictObject({
  $value: z.array(z.string().min(1)).min(1),
  $description: description,
});

export type FontFamilyToken = z.infer<typeof fontFamilyTokenSchema>;

/** The token file, typed: the contract's groups and tokens, nothing else. */
export interface BrandTokens {
  color: { $type: 'color' } & Record<ColorTokenName, ColorToken>;
  radius: { $type: 'dimension'; base: DimensionToken };
  font: { $type: 'fontFamily'; sans: FontFamilyToken; mono: FontFamilyToken };
}

const brandTokensSchema = z.strictObject({
  color: z.strictObject({
    $type: z.literal('color'),
    ...Object.fromEntries(COLOR_TOKEN_NAMES.map((name) => [name, colorTokenSchema])),
  }),
  radius: z.strictObject({ $type: z.literal('dimension'), base: dimensionTokenSchema }),
  font: z.strictObject({
    $type: z.literal('fontFamily'),
    sans: fontFamilyTokenSchema,
    mono: fontFamilyTokenSchema,
  }),
});

export type TokensValidation =
  { ok: true; tokens: BrandTokens } | { ok: false; problems: string[] };

/** The name an alias points at, or null for a colour object. */
export function aliasTarget(value: ColorValue): string | null {
  return typeof value === 'string' ? value.slice('{color.'.length, -1) : null;
}

/** A token's dark value: what it states, or - for an alias that states none - the same alias. */
export function darkValue(token: ColorToken): ColorValue {
  return token.$extensions?.mode.dark ?? token.$value;
}

/**
 * The tokens with every colour token's dark mode stated - an alias that stood
 * for both modes filled with itself. What Terrazzo is handed, so that the
 * stylesheet sets every variable of the contract in both of its blocks.
 */
export function withDarkModes(tokens: BrandTokens): BrandTokens {
  const color = { ...tokens.color };
  for (const name of COLOR_TOKEN_NAMES) {
    const token = tokens.color[name];
    if (!token.$extensions) {
      color[name] = { ...token, $extensions: { mode: { dark: token.$value } } };
    }
  }
  return { ...tokens, color };
}

/** `#rrggbb` for a colour, its alpha dropped. */
export function colorHex(color: SrgbColor): string {
  return `#${color.components
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** Whether a colour is the hex, to the rounding a hex can carry. */
export function colorIsHex(color: SrgbColor, hex: string): boolean {
  const fromHex = hexChannels(hex);
  return color.components.every(
    (channel, index) => Math.abs(channel - fromHex[index]!) <= 1.5 / 255,
  );
}

function hexChannels(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function checkHexAgreement(id: string, mode: string, value: ColorValue, problems: string[]) {
  if (typeof value === 'string' || !value.hex) return;
  const fromHex = hexChannels(value.hex);
  const off = value.components.some(
    (channel, index) => Math.abs(channel - fromHex[index]!) > 1.5 / 255,
  );
  if (off) {
    problems.push(
      `color.${id} (${mode}): hex ${value.hex} does not agree with components [${value.components.join(', ')}]`,
    );
  }
}

function checkAliases(
  tokens: BrandTokens,
  mode: 'light' | 'dark',
  read: (token: ColorToken) => ColorValue,
  problems: string[],
) {
  for (const name of COLOR_TOKEN_NAMES) {
    const seen = new Set<string>([name]);
    let current: ColorTokenName = name;
    for (;;) {
      const target = aliasTarget(read(tokens.color[current]));
      if (target === null) break;
      if (!isColorTokenName(target)) {
        problems.push(
          `color.${name} (${mode}): aliases {color.${target}}, which the contract has no token for`,
        );
        break;
      }
      if (seen.has(target)) {
        problems.push(`color.${name} (${mode}): alias cycle through {color.${target}}`);
        break;
      }
      seen.add(target);
      current = target;
    }
  }
}

/** The colour a token resolves to in a mode, through its aliases; null when a chain is broken. */
export function resolveColor(
  tokens: BrandTokens,
  name: ColorTokenName,
  mode: 'light' | 'dark',
): SrgbColor | null {
  const seen = new Set<string>();
  let current: ColorTokenName = name;
  for (;;) {
    if (seen.has(current)) return null;
    seen.add(current);
    const token = tokens.color[current];
    const value = mode === 'light' ? token.$value : darkValue(token);
    const target = aliasTarget(value);
    if (target === null) return value as SrgbColor;
    if (!isColorTokenName(target)) return null;
    current = target;
  }
}

function luminance(color: SrgbColor): number {
  const [r, g, b] = color.components.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two colours, taken as opaque. */
export function contrastRatio(a: SrgbColor, b: SrgbColor): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

function checkContrast(tokens: BrandTokens, mode: 'light' | 'dark', problems: string[]) {
  for (const pair of CONTRAST_PAIRS) {
    const foreground = resolveColor(tokens, pair.foreground, mode);
    const background = resolveColor(tokens, pair.background, mode);
    if (!foreground || !background) continue;
    const ratio = contrastRatio(foreground, background);
    if (ratio < MIN_CONTRAST) {
      problems.push(
        `color.${pair.foreground} on color.${pair.background} (${mode}): contrast ${ratio.toFixed(2)}, expected ${MIN_CONTRAST} (WCAG AA)`,
      );
    }
  }
}

/** Every problem with the file at once, so a producer's repair round sees the whole list. */
export function validateBrandTokens(doc: unknown): TokensValidation {
  const parsed = brandTokensSchema.safeParse(doc);
  if (!parsed.success) {
    return {
      ok: false,
      problems: parsed.error.issues.map((issue) => {
        const where = issue.path.map(String).join('.') || '(root)';
        return `${where}: ${issue.message}`;
      }),
    };
  }
  const tokens = parsed.data as unknown as BrandTokens;
  const problems: string[] = [];
  for (const name of COLOR_TOKEN_NAMES) {
    const token = tokens.color[name];
    checkHexAgreement(name, 'light', token.$value, problems);
    checkHexAgreement(name, 'dark', darkValue(token), problems);
  }
  checkAliases(tokens, 'light', (token) => token.$value, problems);
  checkAliases(tokens, 'dark', darkValue, problems);
  if (problems.length === 0) {
    checkContrast(tokens, 'light', problems);
    checkContrast(tokens, 'dark', problems);
  }
  return problems.length === 0 ? { ok: true, tokens } : { ok: false, problems };
}
