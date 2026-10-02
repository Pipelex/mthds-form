import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  DEFAULT_FIELD_STRINGS,
  FieldPresentationProvider,
  FieldStringsProvider,
  ResultEnvProvider,
  StuffViewer,
  type ResolveUrls,
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
 * **Download PDF**, which makes the PDF in the browser from a script-free copy
 * laid out with the page's print rules, and saves it under the panel's
 * `downloadBaseName`. The page carries a script, to show that no frame runs it.
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
  <h1>DEVIS N° Q-2026-0042 JEANNE MARTIN</h1>
  <div class="meta">Établi le 1 octobre 2026 · valable 30 jours</div>
  <table>
    <tr><th>Prestation</th><th>Quantité</th><th>Montant</th></tr>
    <tr><td>Étude et conception</td><td>1</td><td>480,00 €</td></tr>
    <tr><td>Fourniture du matériel</td><td>1</td><td>220,00 €</td></tr>
    <tr><td>Installation et mise en service</td><td>1</td><td>150,00 €</td></tr>
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
        downloadBaseName="Devis Q-2026-0042 Jeanne Martin"
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
            downloadBaseName="Devis Q-2026-0042 Jeanne Martin"
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

/**
 * A two-page quote, written the way a method's quote template writes one: the
 * house face linked root-relative (`/fonts/…`, a redistributable face
 * under a house name of its own, `HouseSans`), a page-frame table
 * whose empty `tfoot` reserves the footer's room on every page, a footer laid
 * out `position: fixed` in print so every page repeats it, a table of lines
 * long enough to run past one A4 page, with a header the next page repeats,
 * and rules for print only: a red band that only paper shows, a blue band only
 * the screen shows. No `@page` rule, so it prints on A4 with 1 cm margins.
 */
const LINE_ROWS = Array.from(
  { length: 34 },
  (_, i) =>
    `<tr><td>Prestation ${i + 1} — préparation, réalisation et contrôle</td><td class="num">${(40 + i).toFixed(2).replace('.', ',')} €</td></tr>`,
).join('');

const LONG_QUOTE_PAGE = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Devis Q-2026-0042</title>
<style>
  @font-face { font-family: HouseSans; font-weight: 400; src: url('/fonts/nunito-sans-regular.woff2') format('woff2'); }
  @font-face { font-family: HouseSans; font-weight: 700; src: url('/fonts/nunito-sans-bold.woff2') format('woff2'); }
  *{box-sizing:border-box}
  body{margin:0;background:#f2f2f2;color:#1a1a1a;font:14px/1.55 HouseSans,Arial,sans-serif;}
  .sheet{max-width:820px;margin:24px auto;background:#fff;padding:44px 52px 32px;box-shadow:0 1px 6px rgba(0,0,0,.12);}
  h1{font-size:20px;margin:0 0 6px}
  h2{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;border-bottom:1px solid #111;padding-bottom:5px;margin:26px 0 12px;break-after:avoid}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#1f2a44;color:#fff;text-align:left;padding:6px 8px}
  td{padding:8px 4px;border-bottom:1px solid #dcdcdc;vertical-align:top}
  td.num{text-align:right;white-space:nowrap}
  tr{break-inside:avoid}
  .payment{margin-top:26px;font-size:12px;break-inside:avoid}
  .band{height:40px;margin:12px 0}
  .print-only{display:none;background:rgb(230,0,0)}
  .screen-only{background:rgb(0,0,230)}
  table.page-frame{width:100%;border-collapse:collapse}
  table.page-frame > tbody > tr, table.page-frame > tfoot > tr{break-inside:auto}
  table.page-frame > tbody > tr > td, table.page-frame > tfoot > tr > td{padding:0;border:0}
  .footer-space{display:none;height:64px}
  footer.legal{margin-top:24px;border-top:3px solid rgb(0,150,0);padding-top:8px;text-align:center;font-size:10px}
  @media print{
    body{background:#fff}
    .sheet{box-shadow:none;margin:0;max-width:none;padding:24px 28px 0}
    .print-only{display:block}
    .screen-only{display:none}
    .footer-space{display:block}
    footer.legal{position:fixed;left:28px;right:28px;bottom:0;margin:0;padding:8px 0 6px;background:#fff}
  }
</style>
</head>
<body>
<div class="sheet">
<table class="page-frame">
<tfoot><tr><td><div class="footer-space"></div></td></tr></tfoot>
<tbody><tr><td>
  <div class="band print-only"></div>
  <div class="band screen-only"></div>
  <h1>DEVIS N° Q-2026-0042 JEANNE MARTIN</h1>
  <div>Établi le 1 octobre 2026 · valable 30 jours</div>
  <h2>Interventions</h2>
  <table class="lines">
    <thead><tr><th>Prestation</th><th class="num">Prix TTC</th></tr></thead>
    <tbody>${LINE_ROWS}</tbody>
  </table>
  <div class="payment">
    <div>Règlement par virement sur le compte suivant.</div>
    <div><b>IBAN</b> : FR76 0000 0000 0000 0000 0000 000</div>
  </div>
</td></tr></tbody>
</table>
<footer class="legal">Boutique Exemple · Exempleville — SIRET 000 000 000 00000</footer>
</div>
<script>window.parent.__quotePageScriptRan = true;</script>
</body>
</html>`;

function LongQuote({ maxWidth }: { maxWidth: number }) {
  const field = React.useMemo(
    () => resultFieldFor(CONTRACTS, OUTPUT_FORM, 'results', 'quote_page_result'),
    [],
  );
  return (
    <div data-html-page-demo style={{ maxWidth }}>
      <StuffViewer
        field={field}
        value={{ inner_html: LONG_QUOTE_PAGE, css_class: null }}
        name="devis_client"
        downloadBaseName="Devis Q-2026-0042 Jeanne Martin"
      />
    </div>
  );
}

/** What the PDF copy looked like once its print rules were promoted. */
interface CopySnapshot {
  sandbox: string | null;
  printOnly: string;
  screenOnly: string;
  footerPosition: string;
  houseFace: string[];
}

/** The PDF's pages, read back out of its bytes. */
interface ReadPdf {
  pageCount: number;
  mediaBoxes: string[];
  jpegs: Uint8Array[];
}

/**
 * Read a PDF the way a test can without a PDF library: its page objects, their
 * media boxes, and each page's JPEG, which `jspdf` writes as a `DCTDecode`
 * stream of the JPEG's own bytes.
 */
function readPdf(bytes: Uint8Array): ReadPdf {
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  const pageCount = (text.match(/\/Type\s*\/Page(?![a-zA-Z])/g) ?? []).length;
  const mediaBoxes = Array.from(text.matchAll(/\/MediaBox\s*\[([^\]]*)\]/g), (m) =>
    m[1]!.trim().replace(/\s+/g, ' '),
  );
  const jpegs: Uint8Array[] = [];
  const dict = /<<([^>]*\/DCTDecode[^>]*)>>\s*stream\r?\n/g;
  let match;
  while ((match = dict.exec(text)) !== null) {
    const length = Number(/\/Length\s+(\d+)/.exec(match[1]!)?.[1]);
    const start = match.index + match[0].length;
    jpegs.push(bytes.slice(start, start + length));
  }
  return { pageCount, mediaBoxes, jpegs };
}

/** How many pixels of a region of a page match a colour test. */
async function countPixels(
  jpeg: Uint8Array,
  region: { top: number; bottom: number },
  test: (r: number, g: number, b: number) => boolean,
): Promise<number> {
  const bitmap = await createImageBitmap(new Blob([jpeg as BlobPart], { type: 'image/jpeg' }));
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d')!;
  context.drawImage(bitmap, 0, 0);
  const top = Math.round(region.top * bitmap.height);
  const height = Math.max(1, Math.round((region.bottom - region.top) * bitmap.height));
  const { data } = context.getImageData(0, top, bitmap.width, height);
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (test(data[i]!, data[i + 1]!, data[i + 2]!)) count++;
  }
  return count;
}

const isRed = (r: number, g: number, b: number) => r > 190 && g < 70 && b < 70;
const isBlue = (r: number, g: number, b: number) => b > 190 && r < 70 && g < 70;
const isGreen = (r: number, g: number, b: number) => g > 110 && r < 70 && b < 70;
const isNavy = (r: number, g: number, b: number) => r < 50 && g < 60 && b > 50 && b < 90;

/**
 * **Download PDF.** One click and the browser saves `Devis Q-2026-0042 Jeanne
 * Martin.pdf`, made here in headless Chromium with no server and no dialog.
 * The play catches the download at the link the default delivery clicks,
 * watches the PDF copy from outside while it is laid out (sandboxed with no
 * scripts, its print rules promoted: the print-only band shown, the
 * screen-only band hidden, the footer fixed, the linked face loaded), then
 * reads the PDF back: two A4 pages, a sane size, and in the raster itself the
 * print-only band on page one and never the screen-only one, the table's
 * header repeated at the top of page two, and the fixed footer at the foot of
 * both pages.
 */
export const DownloadPdf: Story = {
  name: 'Download PDF',
  render: (args) => <LongQuote {...args} />,
  play: async ({ canvasElement }) => {
    const demo = canvasElement.querySelector<HTMLElement>('[data-html-page-demo]');
    if (!demo) throw new Error('No page demo rendered');
    const record = window as unknown as { __quotePageScriptRan?: boolean };
    record.__quotePageScriptRan = false;

    // The download as the browser would receive it: the clicked link's name,
    // and its bytes, read before the delivery revokes the object URL.
    let download: { name: string; bytes: Promise<ArrayBuffer> } | undefined;
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      if (!this.download.endsWith('.pdf')) return click.call(this);
      download = {
        name: this.download,
        bytes: fetch(this.href).then((response) => response.arrayBuffer()),
      };
    };

    let snapshot: CopySnapshot | undefined;
    const poll = setInterval(() => {
      const frame = document.querySelector<HTMLIFrameElement>('iframe[data-mthds-pdf-copy]');
      const doc = frame?.contentDocument;
      const printOnly = doc?.querySelector('.print-only');
      if (!frame || !doc || !printOnly || snapshot) return;
      const win = doc.defaultView!;
      if (win.getComputedStyle(printOnly).display !== 'block') return;
      // Rewriting the media queries rebuilds the copy's faces, which the copy
      // then loads again before it measures anything: read them once it has.
      const faces = Array.from(doc.fonts).filter(
        (face) => face.family.replace(/['"]/g, '') === 'HouseSans',
      );
      if (faces.some((face) => face.status !== 'loaded')) return;
      snapshot = {
        sandbox: frame.getAttribute('sandbox'),
        printOnly: win.getComputedStyle(printOnly).display,
        screenOnly: win.getComputedStyle(doc.querySelector('.screen-only')!).display,
        footerPosition: win.getComputedStyle(doc.querySelector('footer.legal')!).position,
        houseFace: faces.map((face) => `${face.weight} ${face.status}`),
      };
    }, 10);

    try {
      await userEvent.click(
        within(demo).getByRole('button', { name: DEFAULT_FIELD_STRINGS.downloadPdf }),
      );
      await waitFor(() => expect(download).toBeDefined(), { timeout: 30_000 });
      await expect(download!.name).toBe('Devis Q-2026-0042 Jeanne Martin.pdf');

      await expect(snapshot).toEqual({
        sandbox: 'allow-same-origin',
        printOnly: 'block',
        screenOnly: 'none',
        footerPosition: 'fixed',
        houseFace: ['400 loaded', '700 loaded'],
      });
      await expect(record.__quotePageScriptRan).toBe(false);
      // The copy is gone once the PDF is made.
      await expect(document.querySelector('iframe[data-mthds-pdf-copy]')).toBeNull();

      const bytes = new Uint8Array(await download!.bytes);
      const pdf = readPdf(bytes);
      // eslint-disable-next-line no-console
      console.info(`PDF: ${pdf.pageCount} pages, ${bytes.length} bytes`);
      await expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
      await expect(pdf.pageCount).toBe(2);
      await expect(pdf.jpegs).toHaveLength(2);
      for (const box of pdf.mediaBoxes) await expect(box).toMatch(/^0 0 595\.\d+ 841\.\d+$/);
      await expect(bytes.length).toBeLessThan(2 * 2_000_000);

      const [first, second] = pdf.jpegs as [Uint8Array, Uint8Array];
      const whole = { top: 0, bottom: 1 };
      // 1 cm of a 29.7 cm sheet is the top margin; the copy's padding follows.
      await expect(await countPixels(first, { top: 0.02, bottom: 0.12 }, isRed)).toBeGreaterThan(
        10_000,
      );
      await expect(await countPixels(first, whole, isBlue)).toBeLessThan(50);
      await expect(await countPixels(second, whole, isRed)).toBeLessThan(50);
      // Page two opens on the repeated header, a navy band under the margin.
      await expect(await countPixels(second, { top: 0.03, bottom: 0.07 }, isNavy)).toBeGreaterThan(
        10_000,
      );
      // Both pages carry the fixed footer's green rule, near the foot.
      for (const page of [first, second]) {
        await expect(await countPixels(page, { top: 0.9, bottom: 0.97 }, isGreen)).toBeGreaterThan(
          1_000,
        );
      }
    } finally {
      clearInterval(poll);
      HTMLAnchorElement.prototype.click = click;
    }
  },
};

/**
 * **A refined page in a method app.** A concept refining `native.Html`, read
 * through `refines`, in `app` presentation and French: one row holding
 * "Télécharger le PDF" and the HTML download, with no title (the page carries
 * its own), then the page, edge to edge.
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
    await expect(panel.getAllByRole('button', { name: 'Télécharger le PDF' })).toHaveLength(1);
    await expect(panel.getAllByRole('button', { name: 'Télécharger le HTML' })).toHaveLength(1);
    await expect(panel.queryByRole('group', { name: 'Affichage du résultat' })).toBeNull();
    await expect(panel.queryByText('Devis client')).toBeNull();

    // One row: both controls share a line.
    const html = panel.getByRole('button', { name: 'Télécharger le HTML' }).getBoundingClientRect();
    const pdf = panel.getByRole('button', { name: 'Télécharger le PDF' }).getBoundingClientRect();
    await expect(Math.abs(html.top + html.height / 2 - (pdf.top + pdf.height / 2))).toBeLessThan(8);

    // Then the page, edge to edge with the panel, with no box drawn around it.
    const frame = pageFrame(canvasElement);
    await waitFor(() => expect(frame.contentDocument?.querySelector('h1')).toBeTruthy());
    const box = demo.querySelector<HTMLElement>('[data-html-page]')!;
    await expect(getComputedStyle(box).borderTopWidth).toBe('0px');
    await expect(box.getBoundingClientRect().width).toBe(demo.getBoundingClientRect().width);
  },
};

/**
 * A page that embeds its pictures as stored references, as a method's page
 * template does: one the host can resolve and one it cannot.
 */
const STORED_PICTURE = 'pipelex-storage://runs/demo/figure_1.jpg';
const LOST_PICTURE = 'pipelex-storage://runs/demo/gone.jpg';
const STORED_PICTURES_PAGE = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><title>Devis</title>
<style>body{margin:0;padding:32px 40px;font:13px/1.5 system-ui,sans-serif}img{display:block;margin:12px 0}</style>
</head>
<body>
<h1>DEVIS N° Q-2026-0042</h1>
<img data-picture="stored" alt="Photo du produit" src="${STORED_PICTURE}" width="160">
<img data-picture="lost" alt="Photo perdue" src="${LOST_PICTURE}" width="160">
</body>
</html>`;

/**
 * A host's bulk resolver: a round trip that answers every reference it knows
 * at once, here onto a file this Storybook serves, and leaves out the one it
 * does not.
 */
const resolveStoredPictures: ResolveUrls = (uris) =>
  new Promise((resolve) => {
    setTimeout(
      () =>
        resolve(
          new Map(
            uris.filter((uri) => uri === STORED_PICTURE).map((uri) => [uri, '/figure_1.jpg']),
          ),
        ),
      150,
    );
  });

function StoredPictures({ maxWidth }: { maxWidth: number }) {
  const field = React.useMemo(
    () => resultFieldFor(CONTRACTS, OUTPUT_FORM, 'results', 'html_result'),
    [],
  );
  return (
    <div data-html-page-demo style={{ maxWidth }}>
      <ResultEnvProvider resolveUrls={resolveStoredPictures}>
        <StuffViewer
          field={field}
          value={{ inner_html: STORED_PICTURES_PAGE, css_class: null }}
          name="devis"
        />
      </ResultEnvProvider>
    </div>
  );
}

/**
 * **Stored pictures.** The page names its pictures as `pipelex-storage://`
 * references, which the frame cannot load. The panel shows a short loading
 * state while the host's `resolveUrls` answers, then frames the page with the
 * answered picture loaded from the URL the host gave, and the one the host
 * could not resolve left broken rather than the page withheld.
 */
export const StoredPicturesPage: Story = {
  name: 'Stored pictures',
  render: (args) => <StoredPictures {...args} />,
  play: async ({ canvasElement }) => {
    const demo = canvasElement.querySelector<HTMLElement>('[data-html-page-demo]');
    if (!demo) throw new Error('No page demo rendered');
    await expect(within(demo).getByText(DEFAULT_FIELD_STRINGS.pageLoading)).toBeVisible();
    await waitFor(() =>
      expect(pageFrame(canvasElement).contentDocument?.querySelector('h1')).toBeTruthy(),
    );
    const doc = pageFrame(canvasElement).contentDocument!;
    const stored = doc.querySelector<HTMLImageElement>('img[data-picture="stored"]')!;
    const lost = doc.querySelector<HTMLImageElement>('img[data-picture="lost"]')!;
    await expect(stored.getAttribute('src')).toBe('/figure_1.jpg');
    await waitFor(() => expect(stored.complete && stored.naturalWidth > 0).toBe(true), {
      timeout: 5000,
    });
    await expect(lost.getAttribute('src')).toBe(LOST_PICTURE);
    await expect(lost.naturalWidth).toBe(0);
  },
};

/**
 * A method app's layout: the result panel is a flex column of fixed height
 * whose body scrolls (`flex min-h-0 flex-1 flex-col overflow-y-auto`), and the
 * viewer is put in that scrolling body with nothing else said about height.
 */
function InScrollingPanel({ maxWidth }: { maxWidth: number }) {
  const field = React.useMemo(
    () => resultFieldFor(CONTRACTS, OUTPUT_FORM, 'results', 'quote_page_result'),
    [],
  );
  return (
    <div
      data-html-page-demo
      style={{ maxWidth, height: 560, display: 'flex', flexDirection: 'column', padding: 12 }}
    >
      <div data-scroll-panel className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        <FieldStringsProvider locale="fr">
          <FieldPresentationProvider presentation="app">
            <StuffViewer
              field={field}
              value={{ inner_html: DESK_QUOTE_PAGE, css_class: null }}
              name="devis_client"
              downloadBaseName="Devis Q-2026-0042 Jeanne Martin"
            />
          </FieldPresentationProvider>
        </FieldStringsProvider>
      </div>
    </div>
  );
}

/**
 * The browser's own pointer, when the stories run as tests: `vitest/browser`
 * drives Playwright's mouse, so a wheel goes through the browser's input
 * pipeline (hit testing, scroll latching) as a reader's would. Absent in the
 * Storybook UI, where the play function stops short of the gesture.
 */
async function browserPointer() {
  try {
    return (await import('vitest/browser')).userEvent;
  } catch {
    return undefined;
  }
}

/**
 * **In a scrolling panel.** A method app puts the viewer in the scrolling body
 * of a fixed-height panel. The page's frame takes the height the control row
 * leaves and scrolls inside itself, so the page is the one scroll container
 * under the pointer: ONE wheel gesture over it scrolls it. The control row
 * stays where it is. A page as tall as itself inside the panel made the first
 * gesture land on the frame's document, which had nowhere to scroll.
 */
export const InAScrollingPanel: Story = {
  name: 'In a scrolling panel',
  render: (args) => <InScrollingPanel {...args} />,
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>('[data-scroll-panel]');
    if (!panel) throw new Error('No scrolling panel rendered');
    const frame = pageFrame(canvasElement);
    await waitFor(() => expect(frame.contentDocument?.querySelector('h1')).toBeTruthy());
    const doc = frame.contentDocument!;

    // The frame fills what the panel leaves, and the page scrolls inside it:
    // the panel itself has nothing left to scroll.
    await waitFor(() =>
      expect(doc.documentElement.scrollHeight).toBeGreaterThan(doc.documentElement.clientHeight),
    );
    const panelBox = panel.getBoundingClientRect();
    await expect(frame.getBoundingClientRect().bottom).toBeLessThanOrEqual(panelBox.bottom + 1);
    await expect(panel.scrollHeight - panel.clientHeight).toBeLessThanOrEqual(1);

    // One wheel over the page scrolls it, and the control row stays put.
    const pointer = await browserPointer();
    if (!pointer) return;
    const title = within(panel).getByRole('button', { name: 'Télécharger le PDF' });
    const titleTop = title.getBoundingClientRect().top;
    await pointer.wheel(frame, { delta: { y: 400 } });
    await waitFor(() => expect(doc.defaultView!.scrollY + panel.scrollTop).toBeGreaterThan(0));
    await expect(title.getBoundingClientRect().top).toBe(titleTop);

    // The page is still a page: its text can be selected.
    const selection = doc.getSelection()!;
    selection.selectAllChildren(doc.querySelector('h1')!);
    await expect(selection.toString()).toContain('DEVIS');
  },
};

/**
 * A host that gives the viewer no bounded height: the page is as tall as it
 * is, and whatever scrolls around it is the host's.
 */
function InUnboundedColumn({ maxWidth }: { maxWidth: number }) {
  const field = React.useMemo(
    () => resultFieldFor(CONTRACTS, OUTPUT_FORM, 'results', 'quote_page_result'),
    [],
  );
  return (
    <div data-html-page-demo style={{ maxWidth }}>
      <div className="flex flex-col gap-2">
        <StuffViewer
          field={field}
          value={{ inner_html: DESK_QUOTE_PAGE, css_class: null }}
          name="devis_client"
        />
      </div>
    </div>
  );
}

/**
 * **In a column with no height of its own.** The same flex column, unbounded:
 * nothing asks the page to shrink, so the frame is the page's whole height and
 * does not scroll.
 */
export const InAnUnboundedColumn: Story = {
  name: 'In an unbounded column',
  render: (args) => <InUnboundedColumn {...args} />,
  play: async ({ canvasElement }) => {
    const frame = pageFrame(canvasElement);
    await waitFor(() => expect(frame.contentDocument?.querySelector('h1')).toBeTruthy());
    const doc = frame.contentDocument!.documentElement;
    await waitFor(() => expect(frame.getBoundingClientRect().height).toBeGreaterThan(1000));
    await expect(doc.scrollHeight).toBeLessThanOrEqual(doc.clientHeight);
  },
};
