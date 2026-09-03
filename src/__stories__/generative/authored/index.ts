import type { SpecFixture } from '../spec-fixture';
import { AUTHORED_COMPANY } from './results.deep_result';
import { AUTHORED_INVOICE } from './results.nested_result';
import { AUTHORED_INVOICE_INPUTS } from './structured.invoice_with_source';

/**
 * Every authored spec, keyed by pipe ref - the ceiling of each hero's
 * comparison. Each module names its author, its date, the brief it was written
 * from and the catalog prompt hash it was written against; the corpus test
 * validates each one exactly as it validates a captured spec and compares the
 * hash with the current prompt.
 */
export const AUTHORED: Record<string, SpecFixture> = {
  [AUTHORED_INVOICE.pipeRef]: AUTHORED_INVOICE,
  [AUTHORED_COMPANY.pipeRef]: AUTHORED_COMPANY,
  [AUTHORED_INVOICE_INPUTS.pipeRef]: AUTHORED_INVOICE_INPUTS,
};
