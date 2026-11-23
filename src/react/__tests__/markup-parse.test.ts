/**
 * A whole document written back out by `parseMarkup` keeps the doctype it was
 * declared with, public and system identifiers included, since they decide the
 * mode a saved page opens in.
 */
import { describe, expect, it } from 'vitest';
import { parseMarkup } from '../markup-parse';

const BODY = '<html><head><title>Devis</title></head><body><p>Bonjour</p></body></html>';

const roundTrip = (markup: string): string => {
  const parsed = parseMarkup(markup);
  if (!parsed) throw new Error('DOMParser is missing');
  return parsed.serialize();
};

const reparsedDoctype = (markup: string) =>
  new DOMParser().parseFromString(markup, 'text/html').doctype;

describe('a whole document keeps its doctype', () => {
  it('keeps an HTML 4.01 Transitional doctype whole, so the saved page stays in quirks mode', () => {
    const doctype =
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">';
    const out = roundTrip(`${doctype}\n${BODY}`);
    // The parser lowercases the doctype's name; the identifiers are kept as written.
    expect(out).toBe(
      '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">' +
        BODY,
    );
    const reparsed = reparsedDoctype(out);
    expect(reparsed?.publicId).toBe('-//W3C//DTD HTML 4.01 Transitional//EN');
    expect(reparsed?.systemId).toBe('http://www.w3.org/TR/html4/loose.dtd');
  });

  it('keeps a doctype that names only a system identifier', () => {
    const out = roundTrip(`<!DOCTYPE html SYSTEM "about:legacy-compat">${BODY}`);
    expect(out.startsWith('<!DOCTYPE html SYSTEM "about:legacy-compat"><html>')).toBe(true);
    const reparsed = reparsedDoctype(out);
    expect(reparsed?.publicId).toBe('');
    expect(reparsed?.systemId).toBe('about:legacy-compat');
  });

  it('writes a plain HTML5 doctype back unchanged', () => {
    const out = roundTrip(`<!DOCTYPE html>${BODY}`);
    expect(out).toBe(`<!DOCTYPE html>${BODY}`);
  });

  it('writes no doctype for a document that had none', () => {
    const out = roundTrip(BODY);
    expect(out).toBe(BODY);
  });
});
