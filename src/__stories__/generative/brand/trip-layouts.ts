import type { Spec } from '@json-render/core';
import { SPECS as BRAND_TRIP_SPECS } from '../../_generated/trips.brand.specs';
import { SPECS as TRIP_SPECS } from '../../_generated/trips.specs';
import { fixtureId, type SpecFixture } from '../spec-fixture';
import { PIPELEX_TRIP_SPEC } from './pipelex-trip.spec';

/**
 * The layouts a brand story may paint: the trip planner, by every producer
 * that has laid it out.
 *
 * `BrandPage` takes any spec, so the join of the study - a layout the designer
 * method wrote under tokens the brand method wrote - is a matter of naming
 * both. The hand-written brand spec keeps the one id no fixture computes,
 * because it is not a fixture: it is the reference the method's pages are
 * read against.
 */

export const TRIP_PIPE_REF = 'trips.plan_trip';

/** The id of the hand-written brand spec, `pipelex-trip.spec.ts`. */
export const HAND_LAYOUT = 'hand';

/** Every captured trip layout, whichever catalog it was written against. */
export const TRIP_LAYOUTS: readonly SpecFixture[] = [...TRIP_SPECS, ...BRAND_TRIP_SPECS].filter(
  (fixture) => fixture.pipeRef === TRIP_PIPE_REF,
);

/** The spec a story asked for by id, or nothing - the story renders a notice. */
export function tripLayout(id: string): Spec | undefined {
  if (id === HAND_LAYOUT) return PIPELEX_TRIP_SPEC;
  return TRIP_LAYOUTS.find((fixture) => fixtureId(fixture) === id)?.spec;
}

/** The fixture behind a layout id, when it is one. */
export function tripLayoutFixture(id: string): SpecFixture | undefined {
  return TRIP_LAYOUTS.find((fixture) => fixtureId(fixture) === id);
}
