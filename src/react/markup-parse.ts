/**
 * A page's markup parsed into an inert tree and written back out: the one
 * parse every rewrite of a `native.Html` page shares, the stored pictures'
 * (`markup-storage.ts`) and the links' (`frame-navigation.ts`). Internal to
 * the `./react` entry.
 *
 * The markup is parsed with `DOMParser`, never searched with a pattern, because
 * an attribute value a regex finds may be inside a comment, a `<textarea>` or
 * another attribute, and an element it misses may be spelled with single
 * quotes, no quotes or an uppercase tag. A `DOMParser` document is inert: no
 * script runs and nothing is fetched while it is read. A whole document is
 * parsed as one; a fragment is parsed as a `<template>`'s content, which keeps
 * a leading `<style>` or `<meta>` where it was rather than moving it into a
 * head the fragment never had.
 */

/**
 * Whether the markup is a whole document rather than a fragment: it opens, past
 * any whitespace and comments, on a doctype, an `<html>` or a `<head>`. A
 * method that renders a printable page (a quote, an invoice) usually writes the
 * whole document, with its own head, styles and print rules.
 */
export function isWholeDocument(markup: string): boolean {
  return /^\s*(?:<!--[\s\S]*?-->\s*)*<(?:!doctype\b|html[\s>]|head[\s>])/i.test(markup);
}

/** The parsed markup, and how to write it back out. */
export interface ParsedMarkup {
  root: ParentNode;
  serialize: () => string;
}

/** The markup's inert tree, or `undefined` where there is no `DOMParser` (a server render). */
export function parseMarkup(markup: string): ParsedMarkup | undefined {
  if (typeof DOMParser === 'undefined') return undefined;
  const parser = new DOMParser();
  if (isWholeDocument(markup)) {
    const doc = parser.parseFromString(markup, 'text/html');
    return {
      root: doc,
      serialize: () => serializeDoctype(doc.doctype) + doc.documentElement.outerHTML,
    };
  }
  const doc = parser.parseFromString('<!doctype html><body></body>', 'text/html');
  const template = doc.createElement('template');
  template.innerHTML = markup;
  return { root: template.content, serialize: () => template.innerHTML };
}

/**
 * The document's doctype written back as it was declared, its public and
 * system identifiers included, because they decide the rendering mode: an
 * HTML 4.01 Transitional page rebuilt as a bare `<!DOCTYPE html>` would open
 * in standards mode rather than the quirks mode it was written for. Empty
 * where the document had no doctype. An identifier that holds a double quote
 * (it can only have been written in single quotes) is written back in single
 * quotes.
 */
function serializeDoctype(doctype: DocumentType | null): string {
  if (!doctype) return '';
  const { name, publicId, systemId } = doctype;
  const quoted = (id: string) => (id.includes('"') ? `'${id}'` : `"${id}"`);
  if (publicId)
    return `<!DOCTYPE ${name} PUBLIC ${quoted(publicId)}${systemId ? ` ${quoted(systemId)}` : ''}>`;
  if (systemId) return `<!DOCTYPE ${name} SYSTEM ${quoted(systemId)}>`;
  return `<!DOCTYPE ${name}>`;
}
