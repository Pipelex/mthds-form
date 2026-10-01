import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { StuffViewer } from '../../react';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/results';
import { resultFieldFor } from '../result-view';

/**
 * A `native.Html` result that is a whole page — a quote, an invoice — shown as
 * the main view of a panel, the way a host renders a method whose answer is a
 * document.
 *
 * The descriptor is the corpus's own, `results.html_result`. **The payload is
 * hand-built, and has to be**: the page links its typeface root-relative to the
 * host, as a host's own quote template does, and only a file this Storybook
 * serves can stand for that. The face is the one Storybook ships for its own
 * UI, served by the dev server.
 *
 * What it shows: the page continued as one document rather than nested in
 * ours, on white whatever the theme, edge to edge, as tall as it is, and in
 * the face it links, which the frame's `font-src` now lets it load.
 */

const FACE_PATH = new URL(
  '../../../node_modules/storybook/assets/browser/nunito-sans-regular.woff2',
  import.meta.url,
).pathname;

/** A one-page quote, written the way a method's page template writes one. */
const QUOTE_PAGE = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Devis</title>
<style>
  @font-face { font-family: 'QuoteFace'; font-weight: 400; src: url('${FACE_PATH}') format('woff2'); }
  body { font-family: 'QuoteFace', serif; margin: 0; padding: 32px 40px; font-size: 13px; }
  .sheet { min-height: 1000px; }
  h1 { font-size: 20px; letter-spacing: 0.02em; margin: 0 0 4px; }
  .meta { color: #555; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1f2a44; color: #fff; text-align: left; padding: 6px 8px; }
  td { border-bottom: 1px solid #ddd; padding: 6px 8px; }
  .total td { font-weight: 700; border-bottom: 0; }
  @media print { body { padding: 0; } .screen-only { display: none; } }
  @page { size: A4; margin: 12mm; }
</style>
</head>
<body>
<div class="sheet">
  <h1>DEVIS N° 250883-1 HAMI THOMAS</h1>
  <div class="meta">Établi le 1 octobre 2026 · valable 30 jours</div>
  <table>
    <tr><th>Prestation</th><th>Quantité</th><th>Montant</th></tr>
    <tr><td>Révision complète du mouvement</td><td>1</td><td>480,00 €</td></tr>
    <tr><td>Remplacement du verre saphir</td><td>1</td><td>220,00 €</td></tr>
    <tr><td>Polissage du boîtier et du bracelet</td><td>1</td><td>150,00 €</td></tr>
    <tr class="total"><td>Total TTC</td><td></td><td>850,00 €</td></tr>
  </table>
  <p class="screen-only">Cette ligne n'apparaît qu'à l'écran.</p>
</div>
</body>
</html>`;

function HtmlPage({ maxWidth }: { maxWidth: number }) {
  const field = React.useMemo(
    () => resultFieldFor(CONTRACTS, OUTPUT_FORM, 'results', 'html_result'),
    [],
  );
  return (
    <div data-html-page-demo style={{ maxWidth }}>
      <StuffViewer
        field={field}
        value={{ inner_html: QUOTE_PAGE, css_class: null }}
        name="devis"
        downloadBaseName="Devis 250883-1 HAMI THOMAS"
      />
    </div>
  );
}

const meta = {
  title: 'Outputs/Html page',
  component: HtmlPage,
  args: { maxWidth: 820 },
} satisfies Meta<typeof HtmlPage>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The first theme pane's page frame: the pair renders every story twice. */
function pageFrame(canvasElement: HTMLElement): HTMLIFrameElement {
  const frame = canvasElement.querySelector<HTMLIFrameElement>(
    '[data-html-page-demo] [data-html-page] iframe',
  );
  if (!frame) throw new Error('No page frame rendered');
  return frame;
}

/**
 * **A whole page, as the panel's main view.** The page is one document, laid
 * out in its own face, and the frame is as tall as the page rather than a
 * scrolling box.
 */
export const WholePage: Story = {
  name: 'A whole document',
  play: async ({ canvasElement }) => {
    const frame = pageFrame(canvasElement);
    await waitFor(() => expect(frame.contentDocument?.querySelector('h1')).toBeTruthy());
    const doc = frame.contentDocument!;

    // One document: the page's head content is in the head, after the policy.
    await expect(doc.querySelectorAll('head style')).toHaveLength(2);
    await expect(doc.body.querySelector('style, meta, title')).toBeNull();
    await expect(doc.documentElement.lang).toBe('fr');

    // Its linked face loads: `font-src` follows `img-src`, which admits the
    // host's own origin.
    await waitFor(
      () => {
        const faces = Array.from(doc.fonts).filter((face) => face.family.includes('QuoteFace'));
        expect(faces.map((face) => face.status)).toEqual(['loaded']);
      },
      { timeout: 5000 },
    );
    await expect(doc.fonts.check("13px 'QuoteFace'")).toBe(true);

    // As tall as the page: the sheet alone is 1000px, beyond any preview box.
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBeGreaterThan(1000));
    await expect(frame.style.maxHeight).toBe('');
  },
};
