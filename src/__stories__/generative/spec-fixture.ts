import type { Spec } from '@json-render/core';

/**
 * A spec with its provenance - the shape every fixture takes, whoever produced
 * it, so a story renders any of them without knowing which it holds.
 *
 * A spec is a payload's twin: the one artifact no projection can produce. So
 * it follows the payload's rules - produced by a pass, committed with its
 * provenance - plus what a spec needs and a payload does not: WHO produced it,
 * on WHICH model, under WHAT prompt (its hash), and, when the run was given
 * one, the creative seed and the critic loop. The stories and the comparison
 * viewer are titled from this record and from nothing else, so a page is
 * never labelled with a role ("authored", "generated") but with what actually
 * made it.
 */

/** How a spec came to be. */
export type Producer =
  /** The designer method, `data/generative/ui-designer.mthds`, through the real CLI. */
  | 'pipelex-method'
  /** A Claude Code subagent in a fresh context, given the prompt and the brief and nothing else. */
  | 'claude-code-subagent'
  /** The Claude Code session working in this repo, writing the spec by hand in TypeScript. */
  | 'claude-code-session';

export interface CriticLoop {
  /** The model that judged the screenshots. */
  model: string;
  /** How many critique-and-revise rounds ran. */
  rounds: number;
}

/**
 * Which catalog a spec was written against. Absent, the layer's own; `brand`,
 * the product-page catalog of the brand study, whose prompt has its own hash.
 */
export type SpecCatalog = 'brand';

export interface SpecFixture {
  /** `results.nested_result`. */
  pipeRef: string;
  producer: Producer;
  /** The catalog the spec was written against, when it is not the layer's own. */
  catalog?: SpecCatalog;
  /** The model id: the one the method ran with, or the Claude Code model behind the agent. */
  model: string;
  /** The creative seed handed over with the brief, verbatim, when one was. */
  seed?: string;
  /** The critic loop the producer ran, when one did. */
  critic?: CriticLoop;
  /** The first twelve hex digits of the SHA-256 of the catalog prompt at the time. */
  promptHash: string;
  /** The day it was produced, `YYYY-MM-DD`. */
  date: string;
  /** The brief it was produced from, repo-relative. */
  brief: string;
  /** The JSONL patch lines, exactly as emitted, or as `specToJsonl` renders a hand-written spec. */
  jsonl: string;
  /** The compiled spec. */
  spec: Spec;
}

/**
 * The id a story and a screenshot are keyed by: producer, model, the two
 * procedures that change what a run is, and the catalog when it is not the
 * layer's own. `pipelex-method--gpt-5.5--seeded`, `pipelex-method--claude-4.8-opus--brand`.
 */
export function fixtureId(
  fixture: Pick<SpecFixture, 'producer' | 'model' | 'seed' | 'critic' | 'catalog'>,
) {
  return [
    fixture.producer,
    fixture.model,
    fixture.seed ? 'seeded' : null,
    fixture.critic ? 'critic' : null,
    fixture.catalog ?? null,
  ]
    .filter((part): part is string => part !== null)
    .join('--');
}

const PRODUCER_LABEL: Record<Producer, string> = {
  'pipelex-method': 'Pipelex method',
  'claude-code-subagent': 'Claude Code subagent',
  'claude-code-session': 'Claude Code session, by hand',
};

/**
 * The honest title: what made the page - or the brand - and, when it is not
 * the layer's own, the catalog it was written against. `Pipelex method ·
 * gpt-5.5 · with a seed`, `Pipelex method · claude-4.8-opus · brand catalog`.
 */
export function fixtureLabel(
  fixture: Pick<SpecFixture, 'producer' | 'model' | 'seed' | 'critic' | 'catalog'>,
): string {
  const parts = [PRODUCER_LABEL[fixture.producer], fixture.model];
  if (fixture.seed) parts.push('with a seed');
  if (fixture.catalog) parts.push(`${fixture.catalog} catalog`);
  if (fixture.critic) {
    parts.push(
      `${fixture.critic.model} critic × ${fixture.critic.rounds} round${fixture.critic.rounds === 1 ? '' : 's'}`,
    );
  }
  return parts.join(' · ');
}

/** The fixture a story asks for, or a loud failure: a story must never render a page it did not name. */
export function findFixture(fixtures: readonly SpecFixture[], pipeRef: string, id: string) {
  const found = fixtures.find(
    (fixture) => fixture.pipeRef === pipeRef && fixtureId(fixture) === id,
  );
  if (!found) {
    const known = fixtures
      .filter((fixture) => fixture.pipeRef === pipeRef)
      .map(fixtureId)
      .join(', ');
    throw new Error(`No spec fixture ${id} for ${pipeRef}. Known: ${known || 'none'}.`);
  }
  return found;
}
