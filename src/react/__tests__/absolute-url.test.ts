/**
 * A URL leaving the document, for the clipboard or a host's delivery: a path
 * the gate admits is resolved as the document resolves it, and nothing else is
 * touched.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { absoluteUrl } from '../absolute-url';

describe('absoluteUrl', () => {
  afterEach(() => {
    document.head.querySelector('base')?.remove();
  });

  it("resolves a root-relative path against the document's base, as an <img> would", () => {
    const base = document.createElement('base');
    base.href = 'https://host.example/app/view';
    document.head.append(base);
    expect(absoluteUrl('/api/assets/x')).toBe('https://host.example/api/assets/x');
  });

  it('leaves a URL that already names its origin as it is', () => {
    expect(absoluteUrl('https://cdn.example/a.png')).toBe('https://cdn.example/a.png');
    expect(absoluteUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
  });

  it('never resolves a spelling the gate reads as another origin', () => {
    // `/\\evil.example/x` parses as `https://evil.example/x`, so resolving it
    // would copy a link off the page while looking like a path on it.
    expect(absoluteUrl('/\\evil.example/x')).toBe('/\\evil.example/x');
    expect(absoluteUrl('//evil.example/x')).toBe('//evil.example/x');
  });

  it('leaves a stored reference, which no document resolves, as it is', () => {
    expect(absoluteUrl('pipelex-storage://bucket/q3.pdf')).toBe('pipelex-storage://bucket/q3.pdf');
  });
});
