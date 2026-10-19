import { describe, expect, it } from 'vitest';
import config from '../../../.storybook/main';

/**
 * Storybook's telemetry stays off.
 *
 * `make test` runs the stories through `@storybook/addon-vitest`, which sends a
 * `test-run` event to Storybook's telemetry service on every vitest run unless
 * `core.disableTelemetry` is set, and `make storybook` and `make build-storybook`
 * report their own events under the same flag. No test or CI run of this
 * repository sends telemetry, and Storybook ignores `DO_NOT_TRACK`, so dropping
 * the flag would go unnoticed: every run would still pass, and report.
 *
 * `toMatchObject` also refuses a `core` written as a preset function, which is
 * the point: the CLI reads `core.disableTelemetry` straight off the main config
 * without applying presets, so only a plain object switches it off there too.
 */
describe('the Storybook main config', () => {
  it('disables Storybook telemetry', () => {
    expect(config.core).toMatchObject({ disableTelemetry: true });
  });
});
