/// <reference types="vite/client" />
/**
 * SPIKE ONLY (L-261107-a6a35f, never merged): every layout the designer
 * method produced in the spike, rendered in design D7's frame over the same
 * real run the brief was built from. A capture is named by what produced it:
 * the method, the moment, the model, the seed's index and the round.
 *
 * The URL picks one: `&args=capture:trip--compose--claude-5_5-opus--s1--r1`
 * (a capture id with its dots written as underscores), plus `theme`,
 * `style` and `team` to paint it differently.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Spec } from '@json-render/core';
import { Frame } from './frame';
import type { MethodKey, StyleId, TeamKey } from './methods';

interface Capture {
  id: string;
  method: MethodKey;
  moment: 'compose' | 'result';
  spec: Spec;
}

const modules = import.meta.glob<Capture>('./captures/*.json', { eager: true, import: 'default' });
const CAPTURES: Record<string, Capture> = Object.fromEntries(
  Object.values(modules).map((capture) => [capture.id.replace(/\./g, '_'), capture]),
);

interface CaptureViewProps {
  capture: string;
  theme: 'light' | 'dark';
  style?: StyleId;
  team?: TeamKey | 'none';
}

function CaptureView({ capture, theme, style, team }: CaptureViewProps) {
  const found = CAPTURES[capture];
  if (!found)
    return (
      <p style={{ padding: 24 }}>
        No capture {capture}. Known: {Object.keys(CAPTURES).join(', ')}
      </p>
    );
  return (
    <Frame
      method={found.method}
      moment={found.moment}
      theme={theme}
      style={style}
      team={team === 'none' ? null : team}
      spec={found.spec}
    />
  );
}

const meta = {
  title: 'Spike/Captures',
  component: CaptureView,
  parameters: { themePairPadding: 0, layout: 'fullscreen', a11y: { test: 'off' } },
  globals: { themeView: 'light' },
  argTypes: {
    capture: { control: 'select', options: Object.keys(CAPTURES).sort() },
    theme: { control: 'inline-radio', options: ['light', 'dark'] },
    style: { control: 'select', options: ['quiet', 'soft', 'editorial', 'bold'] },
    team: { control: 'select', options: ['none', 'northfield', 'wayfarer', 'kiln'] },
  },
} satisfies Meta<typeof CaptureView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capture: Story = {
  args: { capture: Object.keys(CAPTURES)[0] ?? '', theme: 'light' },
};
