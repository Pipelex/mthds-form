import { describe, expect, it } from 'vitest';
import { isViewableUrl } from '../native-content';

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

  it('still rejects a storage reference and a file path', () => {
    expect(isViewableUrl('pipelex-storage://org/x.png')).toBe(false);
    expect(isViewableUrl('file:///tmp/x.png')).toBe(false);
  });
});
