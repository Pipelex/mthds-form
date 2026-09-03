import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { createSpecStreamCompiler, type Spec } from '@json-render/core';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/results';
import { PAYLOADS } from '../_generated/results.payloads';
import { SPECS } from '../_generated/results.specs';
import { HEROES } from './heroes';
import { ResultHeroPage, loadResultHero } from './hero-page';
import { jsonlLines } from './stream';

/**
 * The generated invoice spec, replayed line by line through json-render's
 * stream compiler behind a Replay button, so the progressive fill a host would
 * see from a live generation is visible: the page grows an element at a time,
 * root first, parents before children, over state the host loaded before the
 * first line arrived.
 *
 * The lines are the very JSONL the designer method emitted, as captured; the
 * pacing is the story's. Nothing here is inference.
 */

const PIPE_REF = 'results.nested_result';
const hero = HEROES.find((candidate) => `${candidate.domain}.${candidate.pipeCode}` === PIPE_REF)!;
const data = loadResultHero(hero, CONTRACTS, OUTPUT_FORM, PAYLOADS);
const LINES = jsonlLines(SPECS[PIPE_REF]!.jsonl);

const EMPTY: Spec = { root: '', elements: {} };

function compiler() {
  return createSpecStreamCompiler<Record<string, unknown>>({ root: '', elements: {} });
}

/** A spec is renderable once its root names an element that has arrived. */
function isRenderable(spec: Spec): boolean {
  return spec.root !== '' && spec.root in spec.elements;
}

function StreamedInvoice({ lineMs }: { lineMs: number }) {
  const [spec, setSpec] = React.useState<Spec>(EMPTY);
  const [done, setDone] = React.useState(0);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = React.useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const replay = React.useCallback(() => {
    stop();
    const stream = compiler();
    setSpec(EMPTY);
    setDone(0);
    let index = 0;
    const step = () => {
      if (index >= LINES.length) {
        timer.current = null;
        return;
      }
      const { result } = stream.push(`${LINES[index]}\n`);
      index += 1;
      setSpec(result as unknown as Spec);
      setDone(index);
      timer.current = setTimeout(step, lineMs);
    };
    step();
  }, [lineMs, stop]);

  React.useEffect(() => stop, [stop]);

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={replay}
          className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-[13px] font-medium text-foreground hover:bg-accent"
        >
          Replay
        </button>
        <span
          data-testid="stream-progress"
          style={{
            font: '12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          {done}/{LINES.length} lines
        </span>
      </div>
      {isRenderable(spec) ? <ResultHeroPage data={data} spec={spec} /> : null}
    </div>
  );
}

const meta = {
  title: 'Generative/Streamed',
  component: StreamedInvoice,
  args: { lineMs: 120 },
} satisfies Meta<typeof StreamedInvoice>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

/** Press Replay in the first pane and wait for the last line to land there. */
const replaysToTheEnd: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const buttons = canvas.getAllByRole('button', { name: 'Replay' });
  await expect(buttons).toHaveLength(BOTH_THEMES);
  await userEvent.click(buttons[0]!);
  await waitFor(
    () =>
      expect(canvas.getAllByTestId('stream-progress')[0]).toHaveTextContent(
        `${LINES.length}/${LINES.length} lines`,
      ),
    { timeout: LINES.length * 120 + 2000 },
  );
  const payload = data.payload as { reference: string };
  await expect(canvas.getAllByText(new RegExp(payload.reference)).length).toBeGreaterThanOrEqual(1);
};

export const Replay: Story = { play: replaysToTheEnd };
