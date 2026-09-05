import * as React from 'react';
import { createStateStore } from '@json-render/core';
import type { InputForm, PipeIOContracts, RunField } from '../../core';
import { buildRunFields, computeReadiness, getPipeIOContract, getPipeInputForm } from '../../core';
import {
  GenerativePage,
  layoutProblems,
  seedInputs,
  useStoreSnapshot,
  validateAgainstCatalog,
  catalog,
  fixtureId,
  fixtureLabel,
  formatProblems,
  type SpecFixture,
} from '../../generative';
import { BRANDS, type BrandFixture } from './brands';

/**
 * The one harness every generative story renders through: a captured layout,
 * painted in one brand, over the descriptor it was written for.
 *
 * It does what a host does and nothing more. It derives the descriptor from
 * the committed wire artifacts through the exported lookups, seeds a store
 * with the defaults the method authored, and hands both to `GenerativePage`.
 * Generation is nowhere in it - a layout is a data file, and this renders one.
 *
 * The brand's scope class sits on the root, which is the only place a brand
 * enters: its stylesheet sets the theme contract's custom properties on that
 * class, and everything below reads the tokens it always reads. `font-sans`
 * on the root is what makes Tailwind emit `--font-sans`, without which a
 * scoped typeface token has nothing to override.
 *
 * Under the page, folded away, the chrome a person never sees: the `/inputs`
 * tree exactly as a run would receive it, and the readiness the kernel
 * computes from it. That is the story's real claim - not that the page looks
 * right, but that what a person types through someone else's layout arrives
 * where the gate reads it.
 */

export interface LayoutPageProps {
  brand: BrandFixture;
  fields: RunField[];
  fixture: SpecFixture;
  /** Distinguishes the DOM ids of two pages on one document - the theme pair renders two. */
  idPrefix: string;
}

const RECEIPT =
  'mt-10 border-t border-border px-6 py-4 font-mono text-[11px] text-muted-foreground sm:px-8';

export function LayoutPage({ brand, fields, fixture, idPrefix }: LayoutPageProps) {
  const store = React.useMemo(() => createStateStore({ inputs: seedInputs(fields) }), [fields]);
  const state = useStoreSnapshot(store);
  const inputs = (state.inputs ?? {}) as Record<string, unknown>;
  const readiness = computeReadiness(fields, inputs);

  return (
    <div className={brand.scope ? `${brand.scope} font-sans` : 'font-sans'}>
      <GenerativePage
        spec={fixture.spec}
        store={store}
        scope={{ inputs: fields, idPrefix }}
        brand={brand.manifest}
      />
      <details className={RECEIPT}>
        <summary className="cursor-pointer">
          {readiness.ready}/{readiness.total} ready
          {readiness.missing.length > 0 ? ` · waiting on ${readiness.missing.join(', ')}` : ''}
        </summary>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(inputs, null, 2)}
        </pre>
      </details>
    </div>
  );
}

/**
 * The descriptor of one hero, from the committed wire artifacts, through the
 * exported lookups - so a story exercises resolution as well as rendering and
 * a fixture whose pipe_ref stops resolving fails loudly.
 */
export function heroFields(
  contracts: PipeIOContracts,
  inputForm: InputForm,
  domain: string,
  pipeCode: string,
): RunField[] {
  const contract = getPipeIOContract(contracts, domain, pipeCode);
  const descriptor = getPipeInputForm(inputForm, domain, pipeCode);
  if (!contract || !descriptor) {
    throw new Error(`${domain}.${pipeCode}: no contract or input form in the generated fixtures.`);
  }
  return buildRunFields(descriptor, contract.inputs);
}

/**
 * A layout a story is about to render, checked the way a host checks one.
 *
 * A story that rendered an invalid or ill-fitting layout would be showing a
 * page a host would never show, since a host falls back to the plain form on
 * either answer. Failing here instead keeps the Storybook honest about what
 * the entry actually renders.
 */
export function assertRenderable(fixture: SpecFixture, fields: RunField[]): SpecFixture {
  const verdict = validateAgainstCatalog(fixture.spec, catalog);
  if (!verdict.ok) {
    throw new Error(`${fixture.pipeRef}: ${formatProblems(verdict.problems)}`);
  }
  const problems = layoutProblems({ inputs: fields }, fixture.spec);
  if (problems.length > 0) {
    throw new Error(`${fixture.pipeRef}: ${problems.join('; ')}`);
  }
  return fixture;
}

/**
 * The parameters every generative story file states.
 *
 * `themePairPadding: 0` because a product page's bar and footer reach the
 * edges, and a gutter would render the page as a card.
 *
 * The a11y exclusions are about the DECORATOR, not the page: a product page
 * has one banner, one complementary rail and one contentinfo, as it should,
 * and the pair view renders it twice on one document - so axe sees two of
 * each with the same name. A host renders one. Every other rule still fails
 * the build, and the preview's `color-contrast` exclusion is restated because
 * a parameter array replaces rather than merges.
 */
export const GENERATIVE_STORY_PARAMETERS = {
  themePairPadding: 0,
  a11y: {
    config: {
      rules: [
        { id: 'color-contrast', enabled: false },
        { id: 'landmark-unique', enabled: false },
        { id: 'landmark-no-duplicate-banner', enabled: false },
        { id: 'landmark-no-duplicate-contentinfo', enabled: false },
      ],
    },
  },
};

export interface LayoutStoryArgs {
  /** `fixtureId` of a captured layout. */
  layout: string;
  /** A brand's key. */
  brand: string;
}

/**
 * The story component of one case: whichever captured layout and brand the
 * story's args name.
 *
 * A layout or a brand the args name and the corpus does not have throws,
 * loudly, at render. That is deliberate: the alternative is a story that
 * quietly shows the wrong page, and every id here comes from a committed
 * module rather than from a string somebody typed.
 */
export function makeLayoutPage(fields: RunField[], fixtures: readonly SpecFixture[]) {
  function Page({ layout, brand }: LayoutStoryArgs) {
    const fixture = fixtures.find((candidate) => fixtureId(candidate) === layout);
    if (!fixture) {
      const known = fixtures.map(fixtureId).join(', ');
      throw new Error(`No captured layout ${layout}. Known: ${known || 'none'}.`);
    }
    const found = BRANDS.find((candidate) => candidate.key === brand);
    if (!found)
      throw new Error(`No brand ${brand}. Known: ${BRANDS.map((b) => b.key).join(', ')}.`);
    return (
      <LayoutPage
        brand={found}
        fields={fields}
        fixture={assertRenderable(fixture, fields)}
        idPrefix={`${layout}-${brand}`}
      />
    );
  }
  return Page;
}

/**
 * One story, titled by what made each half of the page - what produced the
 * layout, and what produced the tokens - never by a role. See `fixtureLabel`.
 */
export function layoutStory(fixture: SpecFixture, brand: BrandFixture) {
  const name =
    brand.key === 'stock'
      ? fixtureLabel(fixture)
      : `${brand.manifest.name} tokens · layout ${fixtureLabel(fixture)}`;
  return { name, args: { layout: fixtureId(fixture), brand: brand.key } };
}
