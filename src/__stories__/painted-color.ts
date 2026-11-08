import { contrastRatio, type SrgbColor } from '../brand';

/**
 * Colours as the browser paints them, for a story that asks whether one reads
 * against another. A computed colour can come back in any syntax the browser
 * keeps (`rgb()`, `oklab()` from a `color-mix()`, `color(srgb …)`), so it is
 * painted on a one-pixel canvas and read back as the sRGB the screen shows,
 * rather than parsed.
 */

let context: CanvasRenderingContext2D | undefined;

/** `css`, any colour a stylesheet may compute, as the sRGB a canvas paints it, with its alpha. */
export function paintedColor(css: string): SrgbColor {
  if (!context) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    context = canvas.getContext('2d', { willReadFrequently: true })!;
  }
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = css;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  // A canvas stores a translucent pixel premultiplied and rounds it, so a
  // faint fill reads back a shade off; the alpha it reports is exact.
  return { colorSpace: 'srgb', components: [r! / 255, g! / 255, b! / 255], alpha: a! / 255 };
}

/** `color` as it shows over the opaque `under`, blended by its alpha. */
function over(color: SrgbColor, under: SrgbColor): SrgbColor {
  const components = color.components.map(
    (channel, index) => channel * color.alpha + under.components[index]! * (1 - color.alpha),
  ) as [number, number, number];
  return { colorSpace: 'srgb', components, alpha: 1 };
}

/**
 * The colour `element`'s own box shows: its background over its ancestors'
 * down to the first opaque one, blended as the browser blends them. A
 * document with no opaque background anywhere sits on white.
 */
export function backgroundOf(element: Element): SrgbColor {
  const layers: SrgbColor[] = [];
  for (let node: Element | null = element; node; node = node.parentElement) {
    const color = paintedColor(getComputedStyle(node).backgroundColor);
    if (color.alpha === 0) continue;
    layers.push(color);
    if (color.alpha === 1) break;
  }
  const white: SrgbColor = { colorSpace: 'srgb', components: [1, 1, 1], alpha: 1 };
  return layers.reduceRight((under, layer) => over(layer, under), white);
}

/** The contrast between two computed colours, the first blended over the second when translucent. */
export function paintedContrast(foreground: string, background: SrgbColor): number {
  return contrastRatio(over(paintedColor(foreground), background), background);
}
