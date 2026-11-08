import type { z } from 'zod';

/**
 * How the generative layer reads a prop's zod schema, in one place: the
 * renderers' prop conformance (`declared-props.ts`), the fit check's list
 * props (`layout-fits.ts`) and the catalog check's closed vocabularies
 * (`validate.ts`) each look under the same wrappers for the same facts, and
 * used to do it three ways - one through `nullable`, `optional` and `default`
 * alone, the others through anything with an inner type - so a prop declared
 * `.readonly()` was a list to one and not to another.
 *
 * Reads zod v4's `_zod.def`, the definition every schema class carries: `type`
 * names the kind, and the members below are the ones the readers need.
 */
export interface ZodDefinition {
  type: string;
  /** What a wrapper - `optional`, `nullable`, `default`, `readonly`, `catch` and their kin - wraps. */
  innerType?: z.ZodType;
  /** An array's item schema. */
  element?: z.ZodType;
  /** An object's member schemas. */
  shape?: Record<string, z.ZodType>;
  /**
   * The refinements on a schema - `.min(2)`, a pattern, a `.refine` on a
   * wrapper too - absent when there are none.
   */
  checks?: readonly unknown[];
  /** A string or number format - `email`, `url`, `safeint` - which zod keeps here rather than in `checks`. */
  format?: string;
}

/** A schema's definition, or nothing for a value that is not a zod schema. */
export function definitionOf(schema: unknown): ZodDefinition | undefined {
  if (typeof schema !== 'object' || schema === null) return undefined;
  return (schema as { _zod?: { def?: ZodDefinition } })._zod?.def;
}

/**
 * Every definition from the schema's own down through each wrapper it
 * carries - `.nullable()`, `.optional()`, `.default()` and any other schema
 * that only wraps an inner one - to the one they wrap, or none when the chain
 * is broken or longer than a prop's. Bounded, since a definition is data a
 * host's catalog supplies.
 */
export function definitionChain(schema: unknown): readonly ZodDefinition[] {
  const chain: ZodDefinition[] = [];
  let def = definitionOf(schema);
  for (let depth = 0; depth < 8 && def; depth += 1) {
    chain.push(def);
    if (def.innerType === undefined) return chain;
    def = definitionOf(def.innerType);
  }
  return [];
}

/** The definition under every wrapper a prop carries: the last of its chain. */
export function unwrapped(schema: unknown): ZodDefinition | undefined {
  const chain = definitionChain(schema);
  return chain[chain.length - 1];
}
