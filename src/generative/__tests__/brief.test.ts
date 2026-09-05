import { describe, expect, it } from 'vitest';
import type { RunField } from '../../core';
import { isDelegatedInput } from '../brief';

/**
 * Which inputs the brief hands back to the kernel. The corpus proves the
 * predicate on real methods; this states the one rule no captured method
 * exercises. A descriptor is written by hand here for the reason
 * `layout-fits.test.ts` gives: what is under test is a predicate over a shape.
 */
describe('an input the catalog cannot enter', () => {
  const choice = (options: string[]): RunField => ({
    kind: 'enum',
    name: 'pace',
    required: true,
    options,
  });

  /**
   * The standard puts no floor on a choice, so an enum can carry `""`. The
   * catalog's own choices may not - the validator refuses an empty option,
   * because no renderer can offer one - so a model told to copy the choices
   * exactly would write a layout the validator then refuses. The brief marks
   * the input delegated instead, and the kernel's own control renders it.
   */
  it('includes a choice with an empty option, which no catalog input may list', () => {
    expect(isDelegatedInput(choice(['', 'slow']))).toBe(true);
    expect(isDelegatedInput(choice(['fast', 'slow']))).toBe(false);
  });
});
