import { z } from 'zod';
import {
  COLOR_TOKEN_NAMES,
  type ColorTokenName,
  CONTRAST_PAIRS,
  isColorTokenName,
  MIN_CONTRAST,
} from './contract';

/**
 * A brand's `tokens.json`, validated against the contract.
 *
 * The file is standard DTCG (the Design Tokens Community Group format, 2025.10),
 * and DTCG is looser than the contract in every direction that matters here: it
 * accepts any token, any colour space, a string colour, and a mode of any name.
 * Each of those is a way for a producer's file to be wrong and a page to be
 * painted anyway. So this holds the contract's own rules - exactly its tokens,
 * object colours in sRGB whose hex agrees with their components, aliases only
 * to contract tokens and never in a cycle, a description on every token, `dark`
 * the only mode and stated on every colour object (an alias may stand for both
 * modes), the contrast pairs in both modes - and a file it accepts is one the
 * compiler can only render. Every problem is named by its path, all at once,
 * so a producer's repair round is handed the whole list.
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

/**
 * A C0 control or DEL. Written as a test on the code point rather than a
 * character class, since that range is what a regex may not spell
 * (`no-control-regex`).
 */
export function isControlCharacter(char: string): boolean {
  const code = char.codePointAt(0)!;
  return code < 0x20 || code === 0x7f;
}

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
  $value: z
    .array(
      z
        .string()
        .min(1)
        // A face's name never holds one, and a form feed ends a CSS string.
        .refine((name) => ![...name].some(isControlCharacter), {
          message: 'a family name holds no control characters',
        }),
    )
    .min(1),
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

export type ColorMode = 'light' | 'dark';

/** The name an alias points at, or null for a colour object. */
export function aliasTarget(value: ColorValue): string | null {
  return typeof value === 'string' ? value.slice('{color.'.length, -1) : null;
}

/** A token's dark value: what it states, or - for an alias that states none - the same alias. */
export function darkValue(token: ColorToken): ColorValue {
  return token.$extensions?.mode.dark ?? token.$value;
}

/** A token's value in a mode. */
export function modeValue(token: ColorToken, mode: ColorMode): ColorValue {
  return mode === 'light' ? token.$value : darkValue(token);
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

/** How far a component may sit from a hex channel and still be that channel: the rounding a hex carries. */
const HEX_TOLERANCE = 1.5 / 255;

/** Whether a colour is the hex, to the rounding a hex can carry. */
export function colorIsHex(color: SrgbColor, hex: string): boolean {
  const fromHex = hexChannels(hex);
  return color.components.every(
    (channel, index) => Math.abs(channel - fromHex[index]!) <= HEX_TOLERANCE,
  );
}

function hexChannels(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function checkHexAgreement(name: string, mode: ColorMode, value: ColorValue, problems: string[]) {
  if (typeof value === 'string' || !value.hex) return;
  if (!colorIsHex(value, value.hex)) {
    problems.push(
      `color.${name} (${mode}): hex ${value.hex} does not agree with components [${value.components.join(', ')}]`,
    );
  }
}

function checkAliases(tokens: BrandTokens, mode: ColorMode, problems: string[]) {
  for (const name of COLOR_TOKEN_NAMES) {
    const seen = new Set<string>([name]);
    let current: ColorTokenName = name;
    for (;;) {
      const target = aliasTarget(modeValue(tokens.color[current], mode));
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
  mode: ColorMode,
): SrgbColor | null {
  const seen = new Set<string>();
  let current: ColorTokenName = name;
  for (;;) {
    if (seen.has(current)) return null;
    seen.add(current);
    const value = modeValue(tokens.color[current], mode);
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

/** A colour as it renders over an opaque one: the two blended by its alpha, as a browser does. */
export function composite(color: SrgbColor, over: SrgbColor): SrgbColor {
  const components = color.components.map(
    (channel, index) => channel * color.alpha + over.components[index]! * (1 - color.alpha),
  ) as [number, number, number];
  return { colorSpace: 'srgb', components, alpha: 1 };
}

/**
 * Each contrast pair as it renders. The canvas must be opaque, since a
 * translucent one shows whatever the host paints beneath it and its contrast is
 * nobody's to promise; the ink is blended over it, so a translucent ink is
 * measured at the strength it actually has, and a transparent one fails.
 */
function checkContrast(tokens: BrandTokens, mode: ColorMode, problems: string[]) {
  for (const pair of CONTRAST_PAIRS) {
    const foreground = resolveColor(tokens, pair.foreground, mode);
    const background = resolveColor(tokens, pair.background, mode);
    if (!foreground || !background) continue;
    if (background.alpha < 1) {
      problems.push(
        `color.${pair.background} (${mode}): alpha ${background.alpha}, but text is measured against it, so it must be opaque (alpha 1)`,
      );
      continue;
    }
    const ratio = contrastRatio(composite(foreground, background), background);
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
  checkAliases(tokens, 'light', problems);
  checkAliases(tokens, 'dark', problems);
  // Contrast is read through the aliases, so it is only meaningful once every
  // chain resolves.
  if (problems.length === 0) {
    checkContrast(tokens, 'light', problems);
    checkContrast(tokens, 'dark', problems);
  }
  return problems.length === 0 ? { ok: true, tokens } : { ok: false, problems };
}
