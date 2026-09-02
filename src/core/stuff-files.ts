import { ownProp } from './own-property';
import {
  isNativeHtmlNode,
  readDocumentContent,
  readHtmlContent,
  readImageContent,
} from './native-content';
import type { RunField } from './descriptor';

/**
 * One file a stuff carries: what to fetch, and what to call it once saved.
 */
export interface StuffFile {
  /**
   * The durable reference or URL the value states, for a file held BY
   * REFERENCE. Absent for inline content, which needs no fetch.
   */
  url?: string;
  /**
   * The content itself, for a file the stuff carries INLINE — markup, today.
   * Exactly one of `url` and `text` is set.
   */
  text?: string;
  /** The extension to save inline content under, without the dot. */
  extension?: string;
  /**
   * The URL that works outside this session, when the value carries one. A host
   * whose display URL is session-scoped (an owner-checked proxy route) needs
   * this for anything that leaves the browser.
   */
  publicUrl?: string;
  /** The file's own name when it states one — otherwise the caller derives it. */
  filename?: string;
  mimeType?: string;
  /** Where it sat, dotted: `report.attachments.2.scan`. Names a saved file. */
  path: string;
  kind: 'image' | 'document' | 'markup';
}

/**
 * Every file inside a stuff, found by walking the DESCRIPTOR — never the value.
 *
 * The distinction is the whole point. A payload walk would have to decide what
 * a file is by looking at it: an object with a `url`, a string that ends in
 * `.pdf`. That is the guessing this package exists to remove, and it is wrong in
 * both directions — a method whose output legitimately has a `url` field of its
 * own is not a document, and a stored image whose reference carries no extension
 * is. The descriptor already states `kind: "image"` or `kind: "document"`, so
 * the walk reads the declaration and consults the value only for the members
 * that declaration promises.
 *
 * Ordering is the authored one, depth-first, which is the order the rendered
 * view puts them in — so a download of three images numbers them the way the
 * reader saw them.
 */
export function collectStuffFiles(field: RunField, value: unknown): StuffFile[] {
  const found: StuffFile[] = [];
  walk(field, value, [], found);
  return found;
}

function walk(field: RunField, raw: unknown, path: string[], out: StuffFile[]): void {
  const value = unwrapContent(field, raw);
  const here = path.length > 0 ? path : [field.name];

  // Markup, before the kind switch, exactly as the renderer takes it: a
  // `native.Html` node's KIND is `object` (its content model has two members),
  // so the switch below would walk into it looking for files and find none.
  //
  // It is a file even though nothing stores it as one. The stuff IS a page —
  // the reader is looking at a rendered report — and handing them a JSON
  // envelope with the page inside it as a string is the same mistake as handing
  // them a URL instead of a picture. `isNativeHtmlNode` asks the descriptor
  // whether the concept refines `native.Html`, which is the standard's own way
  // to ask; it never looks at the value to decide.
  if (isNativeHtmlNode(field)) {
    const content = readHtmlContent(value);
    if (content?.innerHtml) {
      out.push({
        text: content.innerHtml,
        extension: 'html',
        path: here.join('.'),
        kind: 'markup',
      });
    }
    return;
  }

  switch (field.kind) {
    case 'image': {
      const content = readImageContent(value);
      if (content?.url) {
        out.push({
          url: content.url,
          publicUrl: content.publicUrl,
          filename: content.filename,
          mimeType: content.mimeType,
          path: here.join('.'),
          kind: 'image',
        });
      }
      return;
    }
    case 'document': {
      const content = readDocumentContent(value);
      if (content?.url) {
        out.push({
          url: content.url,
          publicUrl: content.publicUrl,
          filename: content.filename,
          mimeType: content.mimeType,
          path: here.join('.'),
          kind: 'document',
        });
      }
      return;
    }
    case 'object': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) return;
      const record = value as Record<string, unknown>;
      for (const child of field.fields) {
        walk(child, ownProp(record, child.name), [...here, child.name], out);
      }
      return;
    }
    case 'list': {
      if (!Array.isArray(value)) return;
      // The element descriptor's own `name` is unused by the standard, so the
      // index is what identifies an entry — the same thing the rendered list
      // shows beside each row.
      value.forEach((entry, index) => walk(field.item, entry, [...here, String(index)], out));
      return;
    }
    default:
      // Every other kind is a scalar. It cannot contain a file, and a `native`
      // node with no declared members (an `unknown` kind — a composite, say)
      // states nothing a walk could follow, so there is nothing to look at.
      return;
  }
}

/**
 * The one unwrap path, matching the renderer's: a content model is opened by
 * the property the schema named, and by nothing else.
 */
function unwrapContent(field: RunField, value: unknown): unknown {
  if (!field.contentKey) return value;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return value;
  const unwrapped = ownProp(value as Record<string, unknown>, field.contentKey);
  return unwrapped === undefined ? value : unwrapped;
}
