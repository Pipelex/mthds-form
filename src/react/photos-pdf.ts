import { pageSizeFor, type JpegImage, type Size } from './photo-reading';

/**
 * A document's photographed pages, bound into one PDF. See docs/camera.md,
 * "Making the file".
 *
 * Nothing is decoded here: each page was encoded as a JPEG when its photo was
 * read (`readPhoto`), so making the PDF only places those bytes, one page each,
 * with `jspdf`'s `addImage` in `JPEG` mode, which embeds them as they are. A
 * page is printed on a page of its own proportions with A4's long edge, so a
 * landscape photo is a landscape page.
 *
 * `jspdf` is loaded with `import()` on first use, never imported statically,
 * as `html-pdf.ts` loads it: a host whose runner takes no photo ships none of
 * it (docs/dependency-budget.md). The file control asks for it as a document
 * input takes its first photo, so it is usually loaded before the first PDF is
 * made.
 */

type JsPdfModule = typeof import('jspdf');
let jsPdf: Promise<JsPdfModule> | null = null;

/**
 * `jspdf`, imported the first time it is asked for and kept. A failed import
 * is forgotten, so the next call tries again.
 */
export function loadJsPdf(): Promise<JsPdfModule> {
  jsPdf ??= import('jspdf').catch((error: unknown) => {
    jsPdf = null;
    throw error;
  });
  return jsPdf;
}

/**
 * The pages, in order, as one PDF titled `title`. Rejects when `jspdf` cannot
 * be loaded, or when there is no page to bind.
 */
export async function pagesToPdf(
  pages: readonly JpegImage[],
  { title }: { title?: string } = {},
): Promise<Blob> {
  const [first] = pages;
  if (!first) throw new Error('A PDF needs at least one page.');
  const { jsPDF } = await loadJsPdf();
  // Read before the document exists, so a failed read leaves nothing half made.
  const bytes = await Promise.all(
    pages.map(async (page) => new Uint8Array(await page.blob.arrayBuffer())),
  );
  const firstSize = pageSizeFor(first);
  const pdf = new jsPDF({
    unit: 'pt',
    format: [firstSize.width, firstSize.height],
    orientation: orientationOf(firstSize),
    compress: true,
  });
  if (title) pdf.setProperties({ title });
  for (const [index, page] of pages.entries()) {
    const size = pageSizeFor(page);
    if (index > 0) pdf.addPage([size.width, size.height], orientationOf(size));
    const data = bytes[index];
    if (data) pdf.addImage(data, 'JPEG', 0, 0, size.width, size.height, undefined, 'NONE');
  }
  return pdf.output('blob');
}

function orientationOf({ width, height }: Size): 'landscape' | 'portrait' {
  return width > height ? 'landscape' : 'portrait';
}
