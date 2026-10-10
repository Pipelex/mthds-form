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

/** The first twelve hex digits of a SHA-256: how the provenance names a text it was produced from. */
const hash12 = z.string().regex(/^[0-9a-f]{12}$/, 'twelve hex digits');

export const brandProvenanceSchema = z
  .strictObject({
    producer: z.enum(BRAND_PRODUCERS),
    /** The model id: the one the method ran with, or the Claude Code model behind the session. */
    model: z.string().min(1),
    /** The day it was produced, `YYYY-MM-DD`. */
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** The contract brief it was produced from, as the producer recorded its path. */
    brief: z.string().min(1),
    /** The first twelve hex digits of the SHA-256 of the contract brief at the time. */
    contractHash: hash12,
    /** The creative seed handed over with the brief, verbatim, when one was. */
    seed: z.string().min(1).optional(),
    /** What the person stated beside the URL, when they did. */
    stated: statedFactsSchema.optional(),
    /** Where the site facts came from: a file, or a sentence for a brand read by hand. */
    siteFacts: z.string().min(1).optional(),
    /**
     * The first twelve hex digits of the SHA-256 of the file `siteFacts`
     * names, its bytes as the producer read them. A path alone cannot say
     * whether the facts behind it moved since the brand was produced; whatever
     * re-reads them hashes the file again, and a mismatch makes the brand
     * stale, never invalid. The schema refuses one beside no `siteFacts`,
     * but it cannot tell a path from a sentence: a brand read by hand records
     * none by the producer's own rule, and a hash recorded beside a sentence
     * anyway is caught where it is judged, since the sentence names no file.
     */
    siteFactsHash: hash12.optional(),
    /** How many repair rounds the producer ran before the files validated. */
    rounds: z.number().int().min(0).optional(),
  })
  .refine(
    (provenance) => provenance.siteFactsHash === undefined || provenance.siteFacts !== undefined,
    {
      path: ['siteFactsHash'],
      message: 'no siteFacts names the file it hashes',
    },
  );

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
 *
 * The replacement folds: `claude-4.8-opus` and `claude-4-8-opus` share a
 * scope, and so do two ids that differ only in case. A set of brands loaded on
 * one page must therefore check its scopes are distinct, or the later
 * stylesheet silently takes the earlier brand's place.
 */
export function brandScope(brand: string, producerId: string): string {
  return `brand-${brand}-${producerId}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}
