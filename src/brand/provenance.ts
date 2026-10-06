import { z } from 'zod';
import { statedFactsSchema } from './stated';

/**
 * A brand's `provenance.json`: who produced it, on which model, from which
 * contract and which facts.
 *
 * A brand follows the rules a captured layout follows: produced by a pass,
 * committed with its provenance, and titled by what made it and by nothing
 * else. The provenance is a record, so it is never rewritten to make a check
 * pass. A brand's directory is named by `brandProducerId`, the same recipe a
 * layout fixture's id uses, so the tree and the record cannot disagree about
 * who made a brand.
 */

/** How a brand came to be. */
export const BRAND_PRODUCERS = [
  /** The producer method, run on the hosted API. */
  'pipelex-method',
  /** A Claude Code subagent in a fresh context, given the contract and the facts and nothing else. */
  'claude-code-subagent',
  /** A Claude Code session reading the site and writing the files by hand. */
  'claude-code-session',
] as const;

export type BrandProducer = (typeof BRAND_PRODUCERS)[number];

export const brandProvenanceSchema = z.strictObject({
  producer: z.enum(BRAND_PRODUCERS),
  /** The model id: the one the method ran with, or the Claude Code model behind the session. */
  model: z.string().min(1),
  /** The day it was produced, `YYYY-MM-DD`. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** The contract brief it was produced from, as the producer recorded its path. */
  brief: z.string().min(1),
  /** The first twelve hex digits of the SHA-256 of the contract brief at the time. */
  contractHash: z.string().regex(/^[0-9a-f]{12}$/, 'twelve hex digits'),
  /** The creative seed handed over with the brief, verbatim, when one was. */
  seed: z.string().min(1).optional(),
  /** What the person stated beside the URL, when they did. */
  stated: statedFactsSchema.optional(),
  /** Where the site facts came from: a file, or a sentence for a brand read by hand. */
  siteFacts: z.string().min(1).optional(),
  /** How many repair rounds the producer ran before the files validated. */
  rounds: z.number().int().min(0).optional(),
});

export type BrandProvenance = z.infer<typeof brandProvenanceSchema>;

/** The id a brand's directory is named by: `producer--model[--seeded]`. */
export function brandProducerId(
  provenance: Pick<BrandProvenance, 'producer' | 'model' | 'seed'>,
): string {
  return [provenance.producer, provenance.model, provenance.seed ? 'seeded' : null]
    .filter((part): part is string => part !== null)
    .join('--');
}

/**
 * The scope class a brand's stylesheet sets its tokens on: `brand-<brand>-<producerId>`,
 * with every character outside `[a-z0-9-]` replaced, because a model id
 * carries dots and a dot ends a class selector.
 */
export function brandScope(brand: string, producerId: string): string {
  return `brand-${brand}-${producerId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}
