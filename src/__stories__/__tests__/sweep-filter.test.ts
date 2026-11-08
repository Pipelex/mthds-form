import { describe, expect, it } from 'vitest';
import { APP_STYLE_IDS } from '../../brand/styles';
import { HEROES, selectVariants, variantsOf, type Variant } from '../heroes';

/**
 * What the paid fixture sweep (`make fixtures-specs`) spends on, narrowed by
 * its `FRAME=` and `STYLE=`. The sweep reads them through `selectVariants`,
 * so these hold the filter without running it: each variant left is a
 * designer run on the hosted API.
 */

const ALL: readonly Variant[] = HEROES.flatMap((hero) => variantsOf(hero));
const pages = (variants: readonly Variant[]) => variants.filter((v) => v.frame === 'page');

describe('the sweep’s variant filter', () => {
  it('keeps every variant with neither set', () => {
    expect(selectVariants(ALL, {})).toEqual(ALL);
    expect(selectVariants(ALL, { frame: '', style: '' })).toEqual(ALL);
  });

  it('drops the unstyled pages when a style is set', () => {
    const soft = selectVariants(ALL, { style: 'soft' });
    expect(soft.length).toBeGreaterThan(0);
    expect(pages(soft)).toEqual([]);
    expect(soft.every((variant) => variant.style === 'soft')).toBe(true);
    // Every moment in the style, one per hero frame other than the page.
    expect(soft).toEqual(ALL.filter((variant) => variant.style === 'soft'));
  });

  it('keeps one frame in one style', () => {
    const narrowed = selectVariants(ALL, { frame: 'composer', style: 'bold' });
    expect(narrowed.length).toBeGreaterThan(0);
    expect(narrowed.every((v) => v.frame === 'composer' && v.style === 'bold')).toBe(true);
  });

  it('keeps the pages when the frame asked for is the page, whatever the style', () => {
    expect(selectVariants(ALL, { frame: 'page' })).toEqual(pages(ALL));
    expect(selectVariants(ALL, { frame: 'page', style: 'soft' })).toEqual(pages(ALL));
  });

  it('refuses a style that is not one before anything is filtered', () => {
    expect(() => selectVariants(ALL, { style: 'sotf' })).toThrow(
      `STYLE=sotf is no app style; it is one of ${APP_STYLE_IDS.join(', ')}.`,
    );
  });

  it('refuses a frame that is not one', () => {
    expect(() => selectVariants(ALL, { frame: 'composers' })).toThrow(
      'FRAME=composers is no frame; it is one of page, composer, result.',
    );
  });
});
