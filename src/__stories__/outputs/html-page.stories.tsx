import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  DEFAULT_FIELD_STRINGS,
  FieldPresentationProvider,
  FieldStringsProvider,
  StuffViewer,
} from '../../react';
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
 * the face it links, which the frame's `font-src` now lets it load; and its
 * **Save as PDF**, which prints a script-free copy through the browser's own
 * dialog under the panel's `downloadBaseName`. The page carries a script, to
 * show that neither frame runs it.
 */

const FACE_PATH = new URL(
  '../../../node_modules/storybook/assets/browser/nunito-sans-regular.woff2',
  import.meta.url,
).pathname;

/**
 * A face the page uses only in print. A screen never asks for it, so nothing
 * loads it until something does: the print copy asks for every declared face
 * before it prints, or the PDF would fall back for the lines that use it.
 */
const PRINT_FACE_PATH = new URL(
  '../../../node_modules/storybook/assets/browser/nunito-sans-bold.woff2',
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
  @font-face { font-family: 'QuotePrintFace'; font-weight: 700; src: url('${PRINT_FACE_PATH}') format('woff2'); }
  @media print { body { padding: 0; } .screen-only { display: none; } .total td { font-family: 'QuotePrintFace'; } }
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
<img class="stamp" loading="lazy" alt="Cachet" src="/figure_1.jpg" width="120">
<script>window.parent.__quotePageScriptRan = true;</script>
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

/**
 * The same quote, styled for a screen the way a method's printable template
 * usually is: a grey desk around a white sheet, the desk dropped in print.
 */
const DESK_QUOTE_PAGE = QUOTE_PAGE.replace(
  'body { font-family',
  'body { background: #f2f2f2; } .sheet { max-width: 720px; margin: 24px auto; background: #fff; padding: 40px; box-shadow: 0 1px 6px rgba(0,0,0,.12); } @media print { body { background: #fff; } .sheet { margin: 0; box-shadow: none; } } body { font-family',
);

/**
 * A method's own concept refining `native.Html`, in a method app: the host
 * renders it in `app` presentation and French, passing nothing but the name
 * and the download's base name, as a quote app does.
 */
function RefinedPage({ maxWidth }: { maxWidth: number }) {
  const field = React.useMemo(
    () => resultFieldFor(CONTRACTS, OUTPUT_FORM, 'results', 'quote_page_result'),
    [],
  );
  return (
    <div data-html-page-demo style={{ maxWidth }}>
      <FieldStringsProvider locale="fr">
        <FieldPresentationProvider presentation="app">
          <StuffViewer
            field={field}
            value={{ inner_html: DESK_QUOTE_PAGE, css_class: null }}
            name="devis_client"
            downloadBaseName="Devis 250883-1 HAMI THOMAS"
          />
        </FieldPresentationProvider>
      </FieldStringsProvider>
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

/** What the print copy looked like the moment the browser started printing it. */
interface PrintSnapshot {
  sandbox: string | null;
  hostTitle: string;
  frameTitle: string;
  /** Each of the page's faces, with its load status. */
  faces: string[];
  stampLoaded: boolean;
  scriptRan: boolean;
}

/**
 * **Save as PDF.** The control prints a separate copy of the page, and this
 * play watches that copy from the outside, in headless Chromium, where
 * `print()` dispatches `beforeprint` and `afterprint` without a dialog: at
 * `beforeprint` the copy is sandboxed with modals and no scripts, the tab is
 * titled with the suggested name (which is what Chrome's dialog proposes as
 * the file name), the page's linked faces have loaded, the one it uses only
 * in print included, and its image has arrived; after `afterprint` the copy is gone and the tab has its title back.
 */
export const SaveAsPdf: Story = {
  name: 'Save as PDF',
  play: async ({ canvasElement }) => {
    const demo = canvasElement.querySelector<HTMLElement>('[data-html-page-demo]');
    if (!demo) throw new Error('No page demo rendered');
    const hostTitle = document.title;
    const record = window as unknown as { __quotePageScriptRan?: boolean };
    record.__quotePageScriptRan = false;
    let snapshot: PrintSnapshot | undefined;
    let printed = false;

    // Capture-phase, so this runs before the print's own `load` handler and
    // can listen on the copy's window before anything is printed.
    const watch = (event: Event) => {
      const frame = event.target;
      if (!(frame instanceof HTMLIFrameElement)) return;
      if (!frame.getAttribute('sandbox')?.includes('allow-modals')) return;
      const win = frame.contentWindow!;
      win.addEventListener('beforeprint', () => {
        const doc = frame.contentDocument!;
        const stamp = doc.querySelector<HTMLImageElement>('img.stamp');
        snapshot = {
          sandbox: frame.getAttribute('sandbox'),
          hostTitle: document.title,
          frameTitle: doc.title,
          faces: Array.from(doc.fonts)
            .filter((face) => face.family.includes('Quote'))
            .map((face) => `${face.family.replace(/['"]/g, '')} ${face.status}`),
          stampLoaded: !!stamp && stamp.complete && stamp.naturalWidth > 0,
          scriptRan: record.__quotePageScriptRan === true,
        };
      });
      win.addEventListener('afterprint', () => {
        printed = true;
      });
    };
    document.addEventListener('load', watch, true);
    try {
      await userEvent.click(
        within(demo).getByRole('button', { name: DEFAULT_FIELD_STRINGS.saveAsPdf }),
      );
      await waitFor(() => expect(snapshot).toBeDefined(), { timeout: 10_000 });
      await expect(snapshot).toEqual({
        sandbox: 'allow-same-origin allow-modals',
        hostTitle: 'Devis 250883-1 HAMI THOMAS',
        frameTitle: 'Devis 250883-1 HAMI THOMAS',
        faces: ['QuoteFace loaded', 'QuotePrintFace loaded'],
        stampLoaded: true,
        scriptRan: false,
      });

      await waitFor(() => expect(printed).toBe(true), { timeout: 10_000 });
      await waitFor(() => expect(document.title).toBe(hostTitle));
      await expect(document.querySelector('iframe[sandbox*="allow-modals"]')).toBeNull();
    } finally {
      document.removeEventListener('load', watch, true);
    }
  },
};

/**
 * **A refined page in a method app.** A concept refining `native.Html`, read
 * through `refines`, in `app` presentation and French: one row holding the
 * title, "Enregistrer en PDF" and one download, then the page, edge to edge.
 * No Résultat/JSON switch (a builder's tool, kept in `studio`), no second
 * control row above the page.
 */
export const RefinedPageInApp: Story = {
  name: 'A refined page in a method app',
  render: (args) => <RefinedPage {...args} />,
  play: async ({ canvasElement }) => {
    const demo = canvasElement.querySelector<HTMLElement>('[data-html-page-demo]');
    if (!demo) throw new Error('No page demo rendered');
    const panel = within(demo);
    await expect(panel.getAllByRole('button', { name: 'Enregistrer en PDF' })).toHaveLength(1);
    await expect(panel.getAllByRole('button', { name: /Télécharger/ })).toHaveLength(1);
    await expect(panel.queryByRole('group', { name: 'Affichage du résultat' })).toBeNull();
    await expect(panel.getByText('Devis client')).toBeVisible();

    // One row: the title and both controls share a line.
    const title = panel.getByText('Devis client').getBoundingClientRect();
    const pdf = panel.getByRole('button', { name: 'Enregistrer en PDF' }).getBoundingClientRect();
    await expect(Math.abs(title.top + title.height / 2 - (pdf.top + pdf.height / 2))).toBeLessThan(
      8,
    );

    // Then the page, edge to edge with the panel, with no box drawn around it.
    const frame = pageFrame(canvasElement);
    await waitFor(() => expect(frame.contentDocument?.querySelector('h1')).toBeTruthy());
    const box = demo.querySelector<HTMLElement>('[data-html-page]')!;
    await expect(getComputedStyle(box).borderTopWidth).toBe('0px');
    await expect(box.getBoundingClientRect().width).toBe(demo.getBoundingClientRect().width);
  },
};
