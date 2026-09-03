import type { SpecFixture } from '../spec-fixture';
import { AUTHORED_COMPANY } from './results.deep_result';
import { AUTHORED_INVOICE } from './results.nested_result';
import { AUTHORED_INVOICE_INPUTS } from './structured.invoice_with_source';
import { AUTHORED_TRIP_INPUTS } from './trips.plan_trip';

/**
 * Every spec the Claude Code session wrote by hand, in this repo, with the
 * whole codebase in context - which is what distinguishes it from a subagent
 * handed the prompt and the brief alone. Each module names its model, its
 * date, the brief it was written from and the catalog prompt hash it was
 * written against; the corpus test validates each one exactly as it validates
 * a captured spec and compares the hash with the current prompt.
 */
export const AUTHORED: readonly SpecFixture[] = [
  AUTHORED_INVOICE,
  AUTHORED_COMPANY,
  AUTHORED_INVOICE_INPUTS,
  AUTHORED_TRIP_INPUTS,
];
