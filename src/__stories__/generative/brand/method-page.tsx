import { BRANDS } from '../../_generated/brands/brands';
import type { RunField } from '../../../core';
import { type Hero, HEROES, pipeRefOf } from '../heroes';
import { fixtureId, type SpecFixture } from '../spec-fixture';
import { BrandPage } from './brand-page';
import { type BrandStoryArgs, brandStories } from './brand-stories';

/**
 * An authored method as a product page - what the three method story files
 * share, so each states only what is its own: the case module, the brand
 * specs captured for its hero, and a title.
 *
 * The same page as the trip planner's, painted from the same brand build;
 * only the method differs, which is the point of the step. There is no
 * hand-written layout for a method - nobody tuned one - so the layouts are
 * the captured specs alone, and a layout no pass has captured renders the
 * notice the brand stories render.
 */

/** The hero of an authored method, by its pipe ref. */
export function methodHero(pipeRef: string): Hero {
  const hero = HEROES.find(
    (candidate) => candidate.source === 'methods' && pipeRefOf(candidate) === pipeRef,
  );
  if (!hero) throw new Error(`${pipeRef} is not an authored method's hero (heroes.ts).`);
  return hero;
}

/** The captured layouts of a hero, from its case's specs module. */
export function methodLayouts(hero: Hero, specs: readonly SpecFixture[]): readonly SpecFixture[] {
  return specs.filter((fixture) => fixture.pipeRef === pipeRefOf(hero));
}

export interface MethodPageOptions {
  brand: string;
  hero: Hero;
  fields: RunField[];
  layouts: readonly SpecFixture[];
}

/** The story component of one authored method: a brand page over one of its captured layouts. */
export function makeMethodPage({ brand: brandName, hero, fields, layouts }: MethodPageOptions) {
  function MethodPage({ producerId, layout }: BrandStoryArgs) {
    const brand = BRANDS.find(
      (candidate) => candidate.brand === brandName && candidate.producerId === producerId,
    );
    if (!brand) return <brandStories.Missing brand={brandName} id={producerId} />;
    const fixture = layouts.find((candidate) => fixtureId(candidate) === layout);
    if (!fixture) return <brandStories.Missing brand={brandName} id={producerId} layout={layout} />;
    return (
      <BrandPage
        brand={brand}
        fields={fields}
        spec={fixture.spec}
        idPrefix={`${hero.caseName}-${producerId}-${layout}`}
        // A layout from the layer's own catalog brings no chrome and no container.
        contained={fixture.catalog !== 'brand'}
      />
    );
  }
  MethodPage.displayName = `MethodPage(${pipeRefOf(hero)})`;
  return MethodPage;
}
