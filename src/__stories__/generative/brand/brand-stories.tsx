import type { StoryObj } from '@storybook/react-vite';
import { fixtureLabel } from '../spec-fixture';
import type { BrandFixture } from './brand-fixture';

/**
 * The stories of one brand, one per producer, titled from the brand's
 * provenance and from nothing else - the spec stories' arrangement, for a
 * brand. A brand's story file names the producer ids it shows; a producer the
 * build has not produced renders a notice rather than throwing, so the rest
 * of the brand's stories stay reachable while a run is still going.
 */
export function brandStories<Story extends StoryObj<{ producerId: string }>>(
  brands: readonly BrandFixture[],
  brand: string,
  play: Story['play'],
) {
  return {
    of(producerId: string): Story {
      const fixture = brands.find(
        (candidate) => candidate.brand === brand && candidate.producerId === producerId,
      );
      return {
        name: fixture ? fixtureLabel(fixture) : `${producerId} (not built)`,
        args: { producerId },
        play: fixture ? play : undefined,
      } as Story;
    },
  };
}

brandStories.Missing = function Missing({ brand, id }: { brand: string; id: string }) {
  return (
    <p
      role="status"
      className="rounded-md border border-dashed border-border px-3 py-2 text-[13px] text-muted-foreground"
    >
      No brand build <span className="font-mono">{id}</span> for{' '}
      <span className="font-mono">{brand}</span> yet -{' '}
      <span className="font-mono">make brands</span> writes it from{' '}
      <span className="font-mono">data/brands/</span>.
    </p>
  );
};
