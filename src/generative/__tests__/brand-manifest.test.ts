import { describe, expect, it } from 'vitest';
import { brandManifestSchema } from '../brand-manifest';

/** A manifest the schema accepts, with one logo replaced. */
function withLogo(onDark: string) {
  return {
    name: 'MTHDS',
    website: 'https://mthds.ai',
    logo: { onLight: 'https://mthds.ai/logo-on-light.svg', onDark },
    webfont: null,
  };
}

describe('brandManifestSchema', () => {
  it('accepts an http(s) logo and a root-relative path on the host', () => {
    expect(brandManifestSchema.safeParse(withLogo('https://mthds.ai/logo.svg')).success).toBe(true);
    expect(brandManifestSchema.safeParse(withLogo('/brand/logo-on-dark.svg')).success).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'data:image/png;base64,AAAA',
    'file:///etc/passwd',
    '//elsewhere.example/logo.svg',
    '/\\elsewhere.example/logo.svg',
    'brand/logo.svg',
    '/brand/ logo.svg',
  ])('refuses the logo %s, which the app bar would hand to an <img src>', (onDark) => {
    const parsed = brandManifestSchema.safeParse(withLogo(onDark));
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.map((issue) => issue.path.join('.'))).toEqual(['logo.onDark']);
  });

  it('refuses a website that is not http(s)', () => {
    expect(
      brandManifestSchema.safeParse({ ...withLogo('/logo.svg'), website: 'javascript:alert(1)' })
        .success,
    ).toBe(false);
  });
});
