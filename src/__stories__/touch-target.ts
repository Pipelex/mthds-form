import { expect, waitFor } from 'storybook/test';

/**
 * What the phone stories need to hold a control to the 44 by 44 pixels a
 * finger is given: a story pinned to a phone's or a desktop's width, and a
 * measure of the area a tap on a control actually lands in.
 *
 * The controls grow below Tailwind's `sm` breakpoint, a VIEWPORT width, because
 * a hit area is about the finger and the screen rather than about the box a
 * control sits in. So these stories pin the viewport, where the result stories
 * about layout pin a panel's width instead.
 */

/** The smallest hit area, in CSS pixels, on each side. */
export const TOUCH_TARGET = 44;

/** The two widths these stories pin: a 375px phone, below `sm`, and a desktop. */
export const VIEWPORTS = {
  phone: { name: 'Phone, 375', styles: { width: '375px', height: '812px' }, type: 'mobile' },
  desktop: { name: 'Desktop, 1280', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
} as const;

export type Viewport = keyof typeof VIEWPORTS;

/**
 * A story's `parameters` and `globals` pinning one of `VIEWPORTS`. On a phone
 * the two theme panes stack, each keeping the phone's width, and each keeps the
 * 24px gutters a host's page leaves, so the story's content is 327px wide.
 */
export function pinnedTo(viewport: Viewport) {
  return {
    parameters: {
      viewport: { options: VIEWPORTS },
      ...(viewport === 'phone' ? { themePairStacked: true, themePairPadding: 24 } : {}),
    },
    globals: { viewport: { value: viewport, isRotated: false } },
  };
}

/** Wait until the page has the pinned width, which the runner applies as the story loads. */
export async function atWidth(viewport: Viewport): Promise<void> {
  const width = Number.parseInt(VIEWPORTS[viewport].styles.width, 10);
  await waitFor(() => expect(window.innerWidth).toBe(width));
}

/**
 * The area a finger gets of `control`, in viewport coordinates: its border
 * box, joined with the invisible `::after` it carries when it carries one (an
 * absolutely positioned pseudo-element, placed against its padding box).
 */
export function hitArea(control: Element): DOMRect {
  const box = control.getBoundingClientRect();
  const after = getComputedStyle(control, '::after');
  if (after.content === 'none' || after.display === 'none' || after.position !== 'absolute') {
    return box;
  }
  const own = getComputedStyle(control);
  const left = box.left + Number.parseFloat(own.borderLeftWidth) + Number.parseFloat(after.left);
  const top = box.top + Number.parseFloat(own.borderTopWidth) + Number.parseFloat(after.top);
  const right = Math.max(box.right, left + Number.parseFloat(after.width));
  const bottom = Math.max(box.bottom, top + Number.parseFloat(after.height));
  const x = Math.min(box.left, left);
  const y = Math.min(box.top, top);
  return new DOMRect(x, y, right - x, bottom - y);
}

/** Whether a tap at `x`, `y` lands on `control`, with nothing covering it. */
export function tapLandsOn(control: Element, x: number, y: number): boolean {
  const hit = document.elementFromPoint(x, y);
  return hit !== null && (hit === control || control.contains(hit));
}

/** What a failure calls `control`: its label, or failing that its text or its tag. */
function nameOf(control: Element): string {
  const labels = control instanceof HTMLButtonElement ? control.labels : null;
  const candidates = [
    control.getAttribute('aria-label'),
    labels?.[0]?.textContent,
    control.textContent,
  ];
  return candidates.find((text) => text?.trim())?.trim() ?? control.tagName;
}

/**
 * Hold `control` to a 44 by 44 hit area, and show the area is really its own: a
 * tap just inside the middle of each of the area's edges lands on the control,
 * so nothing covers it and nothing clips it.
 */
export async function expectTouchTarget(control: Element): Promise<DOMRect> {
  control.scrollIntoView({ block: 'center', inline: 'nearest' });
  const area = hitArea(control);
  const name = nameOf(control);
  await expect(area.width, `${name}: hit area width`).toBeGreaterThanOrEqual(TOUCH_TARGET);
  await expect(area.height, `${name}: hit area height`).toBeGreaterThanOrEqual(TOUCH_TARGET);
  const middleX = area.left + area.width / 2;
  const middleY = area.top + area.height / 2;
  for (const [x, y] of [
    [area.left + 1, middleY],
    [area.right - 1, middleY],
    [middleX, area.top + 1],
    [middleX, area.bottom - 1],
  ] as const) {
    await expect(tapLandsOn(control, x, y), `a tap at ${x},${y} reaches ${name}`).toBe(true);
  }
  return area;
}

/**
 * Show that `control`'s hit area stops short of `neighbour`: the two do not
 * overlap, and a tap on the neighbour's edge nearest the control lands on the
 * neighbour, not on the control.
 */
export async function expectClearOf(control: Element, neighbour: Element): Promise<void> {
  control.scrollIntoView({ block: 'center', inline: 'nearest' });
  const area = hitArea(control);
  const other = neighbour.getBoundingClientRect();
  const overlaps =
    area.left < other.right &&
    other.left < area.right &&
    area.top < other.bottom &&
    other.top < area.bottom;
  await expect(overlaps, 'the hit area overlaps its neighbour').toBe(false);
  // The neighbour's point nearest the area's centre, a few pixels inside its
  // box: a rounded corner does not take the taps its bounding box covers.
  const inset = Math.min(8, other.width / 2, other.height / 2);
  const cx = area.left + area.width / 2;
  const cy = area.top + area.height / 2;
  const x = Math.min(Math.max(cx, other.left + inset), other.right - inset);
  const y = Math.min(Math.max(cy, other.top + inset), other.bottom - inset);
  await expect(tapLandsOn(neighbour, x, y), 'a tap on the neighbour reaches it').toBe(true);
  await expect(tapLandsOn(control, x, y), 'a tap on the neighbour reaches the control').toBe(false);
}
