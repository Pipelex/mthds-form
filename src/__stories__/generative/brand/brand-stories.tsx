import type { StoryObj } from '@storybook/react-vite';
import { fixtureId, fixtureLabel, type SpecFixture } from '../spec-fixture';
import type { BrandFixture } from './brand-fixture';
import { HAND_LAYOUT } from './trip-layouts';

/**
 * The stories of one brand, titled from provenance and from nothing else -
 * the spec stories' arrangement, for a brand.
 *
 * Two shapes. `of(producerId)` is the reference: the hand-written brand spec
 * under one producer's tokens, titled by what produced the tokens. `join`
 * is the study's join: a layout a producer wrote under tokens a producer
 * wrote, titled by both - `layout Pipelex method · claude-4.8-opus · tokens
 * Pipelex method · claude-4.8-opus` - so a page is never labelled with a role
 * but with what actually made each half of it.
 *
 * A brand's story file names the ids it shows; a producer the build has not
 * produced, or a layout no pass has captured, renders a notice rather than
 * throwing, so the rest of the brand's stories stay reachable while a run is
 * still going.
 */

export interface BrandStoryArgs {
  producerId: string;
  /** A trip layout id (`fixtureId` of a captured spec), or `hand`. */
  layout: string;
}

export function brandStories<Story extends StoryObj<BrandStoryArgs>>(
  brands: readonly BrandFixture[],
  layouts: readonly SpecFixture[],
  brand: string,
  plays: { reference: Story['play']; join: Story['play'] },
) {
  const brandOf = (producerId: string) =>
    brands.find((candidate) => candidate.brand === brand && candidate.producerId === producerId);
  return {
    /** The hand-written brand spec under one producer's tokens. */
    of(producerId: string): Story {
      const fixture = brandOf(producerId);
      return {
        name: fixture ? fixtureLabel(fixture) : `${producerId} (not built)`,
        args: { producerId, layout: HAND_LAYOUT },
        play: fixture ? plays.reference : undefined,
      } as Story;
    },
    /** A captured layout under one producer's tokens - the join. */
    join(producerId: string, layoutId: string): Story {
      const fixture = brandOf(producerId);
      const layout = layouts.find((candidate) => fixtureId(candidate) === layoutId);
      const name =
        fixture && layout
          ? `layout ${fixtureLabel(layout)} · tokens ${fixtureLabel(fixture)}`
          : `${layoutId} under ${producerId} (${layout ? 'tokens not built' : 'layout not captured'})`;
      return {
        name,
        args: { producerId, layout: layoutId },
        play: fixture && layout ? plays.join : undefined,
      } as Story;
    },
  };
}

brandStories.Missing = function Missing({
  brand,
  id,
  layout,
}: {
  brand: string;
  id: string;
  layout?: string;
}) {
  return (
    <p
      role="status"
      className="rounded-md border border-dashed border-border px-3 py-2 text-[13px] text-muted-foreground"
    >
      {layout ? (
        <>
          No captured layout <span className="font-mono">{layout}</span> for{' '}
          <span className="font-mono">{brand}</span> yet - a specs pass writes it.
        </>
      ) : (
        <>
          No brand build <span className="font-mono">{id}</span> for{' '}
          <span className="font-mono">{brand}</span> yet -{' '}
          <span className="font-mono">make brands</span> writes it from{' '}
          <span className="font-mono">data/brands/</span>.
        </>
      )}
    </p>
  );
};
