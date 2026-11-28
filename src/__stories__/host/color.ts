/**
 * The colour arithmetic and the colour token names the stories' sample host
 * derives with: an sRGB colour, its hex, WCAG contrast and the two bars a
 * derivation holds a colour to. Story code, shipped in nothing (see
 * `./index.ts`).
 */

/** An sRGB colour, each channel and the alpha from 0 to 1, as a DTCG colour object writes it. */
export interface SrgbColor {
  colorSpace: 'srgb';
  components: [number, number, number];
  alpha: number;
  hex?: string;
}

/** The colour tokens of the theme table (docs/theming.md), as a style names a role by them. */
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

/** The minimum contrast ratio text must reach: WCAG 2 AA for normal text. */
export const MIN_CONTRAST = 4.5;

/** The contrast a control's outline or mark needs against what surrounds it (WCAG 1.4.11). */
export const MIN_CONTROL_CONTRAST = 3;

/** `#rrggbb` for a colour, its alpha dropped: each channel rounded to its byte. */
export function colorHex(color: SrgbColor): string {
  return `#${color.components
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** An sRGB channel, from 0 to 1, as linear light: where WCAG's luminance and the Oklab mix start. */
export function linearChannel(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(color: SrgbColor): number {
  const [r, g, b] = color.components.map(linearChannel) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two colours, taken as opaque. */
export function contrastRatio(a: SrgbColor, b: SrgbColor): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}
