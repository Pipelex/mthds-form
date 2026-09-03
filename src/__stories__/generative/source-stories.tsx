import type { StoryObj } from '@storybook/react-vite';
import { fixtureId, fixtureLabel, type SpecFixture } from './spec-fixture';

type PlayContext = {
  canvasElement: HTMLElement;
  globals?: Record<string, unknown>;
  args?: Record<string, unknown>;
};

/**
 * A play that stands down when the `play` global is `off`. The screenshot
 * pass sets it, so a shot shows the page as a person first sees it - the
 * first step, the first tab, nothing typed - and then walks the steps and
 * tabs itself; the test run leaves it unset and the play asserts as usual.
 */
export function skippable<Play extends (context: PlayContext) => Promise<void>>(play: Play): Play {
  return (async (context: PlayContext) => {
    if (context.globals?.play === 'off') return;
    await play(context);
  }) as Play;
}

/**
 * The stories of the captured specs, one per fixture, titled from the
 * fixture's provenance and from nothing else.
 *
 * Storybook needs static exports, so a hero's story file names the fixture
 * ids it shows and this turns each into a story: the title is what produced
 * the page (`Pipelex method · gpt-5.5 · with a seed`), and a fixture that has
 * not been captured yet renders a notice that says so rather than throwing,
 * so the rest of the hero's stories stay reachable while a capture is still
 * running. The comparison viewer reads the same titles off the built
 * Storybook's index.
 */
export function fixtureStories<Story extends StoryObj<{ source: string }>>(
  fixtures: readonly SpecFixture[],
  play: Story['play'],
) {
  return {
    of(id: string): Story {
      const fixture = fixtures.find((candidate) => fixtureId(candidate) === id);
      return {
        name: fixture ? fixtureLabel(fixture) : `${id} (not captured)`,
        args: { source: id },
        play: fixture ? play : undefined,
      } as Story;
    },
  };
}

fixtureStories.idOf = fixtureId;

fixtureStories.Missing = function Missing({ pipeRef, id }: { pipeRef: string; id: string }) {
  return (
    <p
      role="status"
      className="rounded-md border border-dashed border-border px-3 py-2 text-[13px] text-muted-foreground"
    >
      No captured spec <span className="font-mono">{id}</span> for{' '}
      <span className="font-mono">{pipeRef}</span> yet.
    </p>
  );
};
