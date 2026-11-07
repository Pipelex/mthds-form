/**
 * SPIKE ONLY (L-261107-a6a35f, never merged): Phase G's baseline - what the
 * pipeline gives today, with no change, in design D7's frame.
 *
 * - `Plain*`: the kernel's plain form and its result view, in the `app`
 *   presentation, filled with one real run's inputs and payload.
 * - `Today*`: the layout the designer method captured for the same inputs
 *   (`src/__stories__/_generated/*.specs.ts`, claude-4.8-opus), rendered as it
 *   is inside the frame's composer column. No result layout exists to show.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Spec } from '@json-render/core';
import { findFixture } from '../../generative';
import { SPECS as INVOICE_SPECS } from '../_generated/extract_invoice.specs';
import { SPECS as SLIDES_SPECS } from '../_generated/design_slides.specs';
import { SPECS as TRIP_SPECS } from '../_generated/trips.specs';
import { Frame } from './frame';

const meta = {
  title: 'Spike/Baseline',
  component: Frame,
  parameters: { themePairPadding: 0, layout: 'fullscreen', a11y: { test: 'off' } },
  globals: { themeView: 'light' },
} satisfies Meta<typeof Frame>;

export default meta;
type Story = StoryObj<typeof meta>;

const today = (specs: Parameters<typeof findFixture>[0], ref: string): Spec =>
  findFixture(specs, ref, 'pipelex-method--claude-4.8-opus').spec as Spec;

export const PlainInvoiceCompose: Story = {
  args: { method: 'invoice', moment: 'compose', theme: 'light' },
};
export const PlainTripCompose: Story = {
  args: { method: 'trip', moment: 'compose', theme: 'light' },
};
export const PlainSlidesCompose: Story = {
  args: { method: 'slides', moment: 'compose', theme: 'light' },
};
export const PlainInvoiceResult: Story = {
  args: { method: 'invoice', moment: 'result', theme: 'light' },
};
export const PlainTripResult: Story = {
  args: { method: 'trip', moment: 'result', theme: 'light' },
};
export const PlainSlidesResult: Story = {
  args: { method: 'slides', moment: 'result', theme: 'light' },
};

export const TodayInvoiceCompose: Story = {
  args: {
    method: 'invoice',
    moment: 'compose',
    theme: 'light',
    spec: today(INVOICE_SPECS, 'invoice_extraction.process_invoice'),
  },
};
export const TodayTripCompose: Story = {
  args: {
    method: 'trip',
    moment: 'compose',
    theme: 'light',
    spec: today(TRIP_SPECS, 'trips.plan_trip'),
  },
};
export const TodaySlidesCompose: Story = {
  args: {
    method: 'slides',
    moment: 'compose',
    theme: 'light',
    spec: today(SLIDES_SPECS, 'slide_designer.generate_design_proposals_from_rough_brief'),
  },
};
