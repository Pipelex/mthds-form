import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CONTRACTS as LISTS, OUTPUT_FORM as LISTS_FORM } from '../_generated/lists';
import { PAYLOADS as LIST_RUNS } from '../_generated/lists.payloads';
import { CONTRACTS as RESULTS, OUTPUT_FORM as RESULTS_FORM } from '../_generated/results';
import { PAYLOADS as RESULT_RUNS } from '../_generated/results.payloads';
import { DEFAULT_FIELD_STRINGS as S, type ResolveRendition, type ResolveUrl } from '../../react';
import { ResultView, itemsOf } from '../result-view';
import { expectTouchTarget } from '../touch-target';

/**
 * A result's pictures, and the viewer a picture opens.
 *
 * A picture is a button: a click, Enter or Space opens it in a viewer over the
 * result, which a list's pictures move through in place, by the previous and
 * next buttons, the arrow keys or a swipe, and which offers the picture's own
 * download and its original in a tab of its own. A gallery's tiles keep their
 * box while the pictures arrive, and are drawn from the host's smaller copy of
 * each picture when the host supplies one (`resolveRendition`).
 *
 * The payloads are real runs: `results.image_result`, a `PipeImgGen` returning
 * one picture, and `lists.gallery`, one returning three. Their pictures are
 * `pipelex-storage://` references no browser can fetch, so the resolver below
 * stands in for a host's, mapping each one to a picture Storybook serves, as
 * `Outputs/Composites` does; the smaller copies it answers are the same files
 * under a `?w=` query, which the static server ignores, so a story can tell
 * from the URL which of the two each sink was given.
 */

const PICTURES = itemsOf(LIST_RUNS['lists.gallery']) as { url: string }[];
const LONE = RESULT_RUNS['results.image_result'] as { url: string };

/** The pictures Storybook serves, standing in for the run's three. */
const SERVED = ['/figure_1.jpg', '/figure_2.jpg', '/figure_3.jpg'];

/** The host's resolver: each stored picture of the two runs, to a served one. */
const resolveUrl: ResolveUrl = (url) => {
  if (url === LONE.url) return SERVED[0];
  const at = PICTURES.findIndex((picture) => picture.url === url);
  return at === -1 ? undefined : SERVED[at];
};

/** The same host's smaller copies, at the width the view asks for. */
const resolveRendition: ResolveRendition = (url, { width }) => {
  const whole = resolveUrl(url);
  return whole === undefined ? undefined : `${whole}?w=${width}`;
};

const meta = {
  title: 'Outputs/Pictures',
  component: ResultView,
  args: {
    contracts: LISTS,
    outputForm: LISTS_FORM,
    domain: 'lists',
    pipeCode: 'gallery',
    value: LIST_RUNS['lists.gallery'],
    maxWidth: 640,
    presentation: 'app',
    resolveUrl,
  },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

/** The tile of the first theme pane that shows `served`, named as its picture. */
function tileOf(canvasElement: HTMLElement, served: string): HTMLElement {
  const name = S.viewImage(served.slice(1));
  return within(canvasElement).getAllByRole('button', { name })[0]!;
}

/** The viewer, once a tile has opened it. */
async function theViewer(canvasElement: HTMLElement): Promise<HTMLElement> {
  return within(canvasElement).findByRole('dialog');
}

/**
 * **A lone picture.** The result is one picture, drawn at the panel's width
 * with its file's line under it; it is a button, and a click opens it in the
 * viewer rather than in a new tab. Escape closes the viewer and gives focus
 * back to the picture.
 */
export const LonePicture: Story = {
  name: 'A lone picture',
  args: {
    contracts: RESULTS,
    outputForm: RESULTS_FORM,
    domain: 'results',
    pipeCode: 'image_result',
    value: LONE,
  },
  play: async ({ canvasElement }) => {
    const pictures = canvasElement.querySelectorAll(`img[src="${SERVED[0]}"]`);
    await expect(pictures).toHaveLength(BOTH_THEMES);
    const picture = tileOf(canvasElement, SERVED[0]!);
    await expect(picture.tagName).toBe('BUTTON');
    await expect(picture.closest('a')).toBeNull();
    await userEvent.click(picture);
    const viewer = await theViewer(canvasElement);
    await expect(viewer).toHaveAccessibleName('figure_1.jpg');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(canvasElement).queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(picture).toHaveFocus());
  },
};

/**
 * **A list of pictures, in `app`.** Square tiles of one size, the picture
 * covering each, and no file name under them: a run names its pictures by a
 * hash, which tells a reader nothing. The name, the copy control and the
 * download are in the viewer, one click away.
 */
export const ListOfPictures: Story = {
  name: 'A list of pictures',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(PICTURES).toHaveLength(SERVED.length);
    for (const served of SERVED) {
      const tiles = canvas.getAllByRole('button', { name: S.viewImage(served.slice(1)) });
      await expect(tiles).toHaveLength(BOTH_THEMES);
      // The box is square, and the picture covers it.
      const box = tiles[0]!.querySelector('img')!.parentElement!;
      const { width, height } = box.getBoundingClientRect();
      await expect(Math.abs(width - height)).toBeLessThan(1);
    }
    await expect(canvas.queryByRole('button', { name: S.copyUrl })).toBeNull();
    for (const served of SERVED) await expect(canvas.queryByText(served.slice(1))).toBeNull();
  },
};

/**
 * **A list of pictures, in `studio`.** A builder keeps each tile's file line,
 * the name it links to the file under, its copy control and its download, to
 * read against the payload.
 */
export const ListOfPicturesInStudio: Story = {
  name: 'A list of pictures in studio',
  args: { presentation: 'studio' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { name: S.copyUrl })).toHaveLength(
      SERVED.length * BOTH_THEMES,
    );
    for (const served of SERVED) {
      await expect(canvas.getAllByRole('link', { name: served.slice(1) })).toHaveLength(
        BOTH_THEMES,
      );
    }
  },
};

/**
 * **The viewer, open.** Opened from the second tile, moved on by the arrow
 * key, back by the previous button, and on by a swipe; it states where it is
 * ("3 of 3") and is left open, so the accessibility check reads it in both
 * themes.
 */
export const ViewerOpen: Story = {
  name: 'The viewer, open',
  play: async ({ canvasElement }) => {
    await userEvent.click(tileOf(canvasElement, SERVED[1]!));
    const viewer = await theViewer(canvasElement);
    const inViewer = within(viewer);
    await expect(viewer).toHaveAccessibleName('figure_2.jpg');
    await expect(inViewer.getByText(S.imagePosition(2, 3))).toBeVisible();
    await expect(viewer).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(inViewer.getByText(S.imagePosition(3, 3))).toBeVisible();
    await userEvent.click(inViewer.getByRole('button', { name: S.previousImage }));
    await expect(inViewer.getByText(S.imagePosition(2, 3))).toBeVisible();
    // A swipe to the left, as a finger draws it: on to the next picture.
    const stage = viewer.querySelector<HTMLElement>('[data-viewer-stage]')!;
    const { left, top, width, height } = stage.getBoundingClientRect();
    const at = (clientX: number) => ({
      pointerId: 7,
      pointerType: 'touch',
      isPrimary: true,
      clientX,
      clientY: top + height / 2,
      bubbles: true,
    });
    stage.dispatchEvent(new PointerEvent('pointerdown', at(left + width * 0.8)));
    stage.dispatchEvent(new PointerEvent('pointerup', at(left + width * 0.2)));
    await waitFor(() => expect(inViewer.getByText(S.imagePosition(3, 3))).toBeVisible());
    await expect(viewer).toHaveAccessibleName('figure_3.jpg');
    await expect(inViewer.getByRole('link', { name: S.openOriginal })).toHaveAttribute(
      'href',
      SERVED[2],
    );
    await expect(inViewer.getByRole('button', { name: /^Download / })).toBeVisible();
  },
};

/**
 * **A host that supplies smaller copies.** Each tile is drawn from the host's
 * copy at the width a tile asks for, and the viewer, its "open the original"
 * and the download keep the whole picture.
 */
export const HostWithRenditions: Story = {
  name: 'A host that supplies smaller copies',
  args: { resolveRendition },
  play: async ({ canvasElement }) => {
    for (const served of SERVED) {
      const pictures = canvasElement.querySelectorAll(`img[src="${served}?w=576"]`);
      await expect(pictures).toHaveLength(BOTH_THEMES);
    }
    await userEvent.click(tileOf(canvasElement, SERVED[0]!));
    const viewer = within(await theViewer(canvasElement));
    await expect(viewer.getByRole('img')).toHaveAttribute('src', SERVED[0]);
    await expect(viewer.getByRole('link', { name: S.openOriginal })).toHaveAttribute(
      'href',
      SERVED[0],
    );
  },
};

// ─── The viewer at three widths ──────────────────────────────────────────────

/** The widths the viewer is held to: a phone, a tablet and a desktop. */
const VIEWPORTS = {
  phone: { name: 'Phone, 375', styles: { width: '375px', height: '812px' }, type: 'mobile' },
  tablet: { name: 'Tablet, 768', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
  desktop: { name: 'Desktop, 1280', styles: { width: '1280px', height: '800px' }, type: 'desktop' },
} as const;

type Viewport = keyof typeof VIEWPORTS;

function at(viewport: Viewport): Pick<Story, 'parameters' | 'globals' | 'play'> {
  const width = Number.parseInt(VIEWPORTS[viewport].styles.width, 10);
  return {
    parameters: {
      viewport: { options: VIEWPORTS },
      ...(viewport === 'phone' ? { themePairStacked: true, themePairPadding: 24 } : {}),
    },
    globals: { viewport: { value: viewport, isRotated: false } },
    play: async ({ canvasElement }) => {
      await waitFor(() => expect(window.innerWidth).toBe(width));
      await userEvent.click(tileOf(canvasElement, SERVED[0]!));
      const viewer = await theViewer(canvasElement);
      const picture = within(viewer).getByRole('img');
      await waitFor(() => expect((picture as HTMLImageElement).complete).toBe(true));
      // The panel and the picture's box are inside the viewport, and the
      // picture is contained in its box, so the whole of it shows.
      for (const box of [viewer, picture]) {
        const rect = box.getBoundingClientRect();
        await expect(rect.left).toBeGreaterThanOrEqual(0);
        await expect(rect.top).toBeGreaterThanOrEqual(0);
        await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
        await expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
      }
      await expect(getComputedStyle(picture).objectFit).toBe('contain');
      const { height } = picture.getBoundingClientRect();
      await expect(height).toBeGreaterThan(window.innerHeight / 2);
      // Below `sm` every control a finger hits is 44 pixels square at least.
      if (viewport === 'phone') {
        const inViewer = within(viewer);
        for (const control of [
          inViewer.getByRole('link', { name: S.openOriginal }),
          inViewer.getByRole('button', { name: S.close }),
          inViewer.getByRole('button', { name: S.nextImage }),
        ]) {
          await expectTouchTarget(control);
        }
      }
    },
  };
}

/** **On a phone**: the whole screen, the picture fitted to what the header leaves. */
export const ViewerOnAPhone: Story = { name: 'The viewer on a phone', ...at('phone') };

/** **On a tablet**: the viewport less a margin, the picture fitted inside. */
export const ViewerOnATablet: Story = { name: 'The viewer on a tablet', ...at('tablet') };

/** **On a desktop**: a panel at most 72rem wide, the picture fitted inside. */
export const ViewerOnADesktop: Story = { name: 'The viewer on a desktop', ...at('desktop') };
