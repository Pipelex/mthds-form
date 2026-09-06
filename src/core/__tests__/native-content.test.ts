import { describe, expect, it } from 'vitest';
import { isViewableUrl, viewableUrl } from '../native-content';

describe('isViewableUrl and same-origin paths', () => {
  it('accepts a root-relative path, which is what a host resolver returns', () => {
    // The bug this pins: a resolver hands back `/api/assets/…` on the host's own
    // origin, this predicate rejected it for having no scheme, and the arms fell
    // back to the payload's already-expired presigned URL.
    expect(isViewableUrl('/api/assets/org/run/x.png')).toBe(true);
  });

  it('rejects a protocol-relative URL, which only looks like a path', () => {
    expect(isViewableUrl('//evil.example.com/x.png')).toBe(false);
  });

  it('rejects the backslash spellings the parser reads as protocol-relative', () => {
    // One rule — "resolving it stays on the sentinel origin" — where a regex
    // needed one arm per spelling, and missed these two.
    expect(isViewableUrl('\\\\evil.example.com\\x.png')).toBe(false);
    expect(isViewableUrl('/\\evil.example.com/x.png')).toBe(false);
  });

  it('still rejects a storage reference and a file path', () => {
    expect(isViewableUrl('pipelex-storage://org/x.png')).toBe(false);
    expect(isViewableUrl('file:///tmp/x.png')).toBe(false);
  });

  it('rejects a scheme that executes', () => {
    expect(isViewableUrl('javascript:alert(1)')).toBe(false);
    expect(isViewableUrl('JavaScript:alert(1)')).toBe(false);
  });

  it('rejects a scheme hidden inside the whitespace the parser removes', () => {
    // The classic bypass of a prefix match: the browser strips the tab and runs
    // `javascript:`, and a `/^javascript:/` test never saw one. Stripping first
    // and branching on the parsed protocol closes it structurally rather than by
    // adding a pattern per trick.
    expect(isViewableUrl('java\tscript:alert(1)')).toBe(false);
    expect(isViewableUrl('jav\nascript:alert(1)')).toBe(false);
    expect(isViewableUrl('  javascript:alert(1)')).toBe(false);
  });

  it('rejects nothing at all', () => {
    expect(isViewableUrl(undefined)).toBe(false);
    expect(isViewableUrl('')).toBe(false);
    expect(isViewableUrl('   ')).toBe(false);
  });

  it('accepts a blob URL, which is bound to the origin that minted it', () => {
    expect(isViewableUrl('blob:https://app.example.com/8f0e-…')).toBe(true);
  });

  it('matches a scheme case-insensitively, as the parser does', () => {
    expect(isViewableUrl('HTTPS://cdn.example.com/x.png')).toBe(true);
  });

  it('rejects a bare relative reference with no leading slash', () => {
    expect(isViewableUrl('assets/x.png')).toBe(false);
  });
});

describe('the data: allow-list', () => {
  it('accepts the raster types the preview arms paint', () => {
    for (const type of ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif']) {
      expect(isViewableUrl(`data:${type};base64,AAAA`)).toBe(true);
    }
  });

  it('accepts an inline PDF, which the input control previews through <object>', () => {
    expect(isViewableUrl('data:application/pdf;base64,JVBERi0=')).toBe(true);
  });

  it('refuses markup, which is a document at the embedding page own origin', () => {
    // The hole the whole gate was rewritten for: this passed a prefix match on
    // `data:` and was then handed to an unsandboxed frame.
    expect(isViewableUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isViewableUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
  });

  it('refuses an SVG, which paints as a picture and executes as a document', () => {
    expect(isViewableUrl('data:image/svg+xml,<svg onload="alert(1)"/>')).toBe(false);
  });

  it('refuses a type it does not know, and one that declares none', () => {
    expect(isViewableUrl('data:application/octet-stream;base64,AAAA')).toBe(false);
    expect(isViewableUrl('data:,hello')).toBe(false);
  });

  it('reads the declared type case-insensitively and around spacing', () => {
    expect(isViewableUrl('data:IMAGE/PNG;base64,AAAA')).toBe(true);
    // Browsers tolerate whitespace around a data URL's media type, so the gate
    // has to read it the way they do - in BOTH directions.
    expect(isViewableUrl('data: image/png;base64,AAAA')).toBe(true);
    expect(isViewableUrl('data:text/html ;base64,PHNjcmlwdD4=')).toBe(false);
    expect(isViewableUrl('data:TEXT/HTML,x')).toBe(false);
  });

  it('keeps a media type that carries a parameter', () => {
    expect(isViewableUrl('data:image/png;x=1;base64,AAAA')).toBe(true);
  });
});

describe('viewableUrl hands back the string it judged', () => {
  it('normalises the whitespace the URL parser strips', () => {
    // The disagreement this closes: `/^https?:/i` said no to this string while
    // `new URL()` said `https:`, so a host that validated by parsing and a
    // kernel that prefix-matched acted on different URLs.
    expect(viewableUrl(' https://cdn.example.com/x.png')).toBe('https://cdn.example.com/x.png');
    expect(viewableUrl('https://cdn.example.com/\tx.png')).toBe('https://cdn.example.com/x.png');
    expect(viewableUrl('https://cdn.example.com/x.png\n')).toBe('https://cdn.example.com/x.png');
  });

  it('returns a path relative, because absolute against the sentinel points nowhere', () => {
    expect(viewableUrl('  /api/assets/x.png ')).toBe('/api/assets/x.png');
  });

  it('preserves a presigned query verbatim', () => {
    const presigned =
      'https://bucket.s3.amazonaws.com/org/x.png?X-Amz-Signature=abc123&X-Amz-Expires=3600';
    expect(viewableUrl(presigned)).toBe(presigned);
  });

  it('answers undefined for everything the gate refuses', () => {
    expect(viewableUrl('javascript:alert(1)')).toBeUndefined();
    expect(viewableUrl(undefined)).toBeUndefined();
  });
});
