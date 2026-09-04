import type { Spec } from '@json-render/core';
import { describe, expect, it } from 'vitest';
import type { InputForm, OutputForm, PipeIOContracts } from '../../core';
import {
  buildResultField,
  buildRunFields,
  getPipeIOContract,
  getPipeInputForm,
  getPipeOutputForm,
} from '../../core';
import { renderInputBrief, renderResultBrief } from '../../generative/brief';
import { catalog } from '../../generative/catalog';
import { baseCatalog } from '../../generative/components';
import { fixtureId } from '../../generative/fixture';
import { layoutProblems } from '../../generative/layout-fits';
import {
  absoluteHatchPath,
  inputFieldAtPath,
  repeatBasePathOf,
  resultFieldAtPath,
} from '../../generative/paths';
import { PROMPT_HASH } from '../../generative/prompt-hash';
import { payloadToState, seedInputs } from '../../generative/state';
import { specFromJsonl } from '../../generative/stream';
import { formatProblems, validateAgainstCatalog } from '../../generative/validate';
import * as designSlides from '../_generated/design_slides';
import { SPECS as SLIDES_SPECS } from '../_generated/design_slides.brand.specs';
import * as extractInvoice from '../_generated/extract_invoice';
import { SPECS as INVOICE_SPECS } from '../_generated/extract_invoice.brand.specs';
import * as files from '../_generated/files';
import * as lists from '../_generated/lists';
import * as results from '../_generated/results';
import { PAYLOADS } from '../_generated/results.payloads';
import * as scalars from '../_generated/scalars';
import * as states from '../_generated/states';
import * as structured from '../_generated/structured';
import * as summarizePeople from '../_generated/summarize_people';
import { SPECS as PEOPLE_SPECS } from '../_generated/summarize_people.brand.specs';
import * as trips from '../_generated/trips';
import { SPECS as TRIP_SPECS } from '../_generated/trips.brand.specs';
import { HEROES, pipeRefOf } from '../heroes';

/**
 * The layer against the corpus: the briefs a model is handed, the state a run
 * loads, the paths a hatch resolves to, and every layout we have captured.
 *
 * This suite is the acceptance proof of the port. The unit suites beside the
 * entry (`src/generative/__tests__/`) state the rules on the smallest shape
 * that trips each one; this one states them on real methods and on layouts a
 * model actually wrote, which is the only thing that can catch a rule that is
 * right in the small and wrong on a page.
 *
 * It never touches React - the stories are where a layout is rendered.
 */

interface CaseModule {
  PIPE_REFS: readonly string[];
  CONTRACTS: PipeIOContracts;
  INPUT_FORM: InputForm;
  OUTPUT_FORM: OutputForm;
}

const CASES: Record<string, CaseModule> = {
  files,
  lists,
  results,
  scalars,
  states,
  structured,
  trips,
  extract_invoice: extractInvoice,
  design_slides: designSlides,
  summarize_people: summarizePeople,
};

/** The input descriptor of a hero's pipe, as a host derives it. */
function inputsOf(pipeRef: string) {
  const hero = HEROES.find((candidate) => pipeRefOf(candidate) === pipeRef)!;
  const mod = CASES[hero.caseName]!;
  const contract = getPipeIOContract(mod.CONTRACTS, hero.domain, hero.pipeCode)!;
  return buildRunFields(
    getPipeInputForm(mod.INPUT_FORM, hero.domain, hero.pipeCode)!,
    contract.inputs,
  );
}

describe('the result loader', () => {
  const contract = getPipeIOContract(results.CONTRACTS, 'results', 'nested_result')!;
  const field = buildResultField(
    getPipeOutputForm(results.OUTPUT_FORM, 'results', 'nested_result')!,
    contract.output.json_schema,
  );
  const state = payloadToState(field, PAYLOADS['results.nested_result']) as Record<string, unknown>;

  it('turns the typed date envelope into the ISO string', () => {
    expect(state.issued_on).toBe('2026-03-14');
  });

  it('keeps the list an array of loaded items and the scalars as they came', () => {
    expect(Array.isArray(state.lines)).toBe(true);
    expect((state.lines as unknown[]).length).toBeGreaterThan(0);
    expect(state.reference).toBe(
      (PAYLOADS['results.nested_result'] as { reference: string }).reference,
    );
  });

  it('unwraps the plural envelope', () => {
    const plural = getPipeIOContract(results.CONTRACTS, 'results', 'plural_result')!;
    const pluralField = buildResultField(
      getPipeOutputForm(results.OUTPUT_FORM, 'results', 'plural_result')!,
      plural.output.json_schema,
    );
    expect(Array.isArray(payloadToState(pluralField, PAYLOADS['results.plural_result']))).toBe(
      true,
    );
  });

  it('seeds only authored defaults', () => {
    const contractWithDefault = getPipeIOContract(
      structured.CONTRACTS,
      'structured',
      'flat_object',
    )!;
    const fields = buildRunFields(
      getPipeInputForm(structured.INPUT_FORM, 'structured', 'flat_object')!,
      contractWithDefault.inputs,
    );
    expect(seedInputs(fields)).toEqual({});
    expect(
      seedInputs([
        { kind: 'text', name: 'a', required: false, defaultValue: 'x' },
        { kind: 'text', name: 'b', required: true },
      ]),
    ).toEqual({ a: 'x' });
  });
});

describe('the briefs', () => {
  it('name every hero pipe in the corpus', () => {
    for (const hero of HEROES) {
      const mod = CASES[hero.caseName]!;
      expect(mod.PIPE_REFS, pipeRefOf(hero)).toContain(pipeRefOf(hero));
    }
  });

  it('mark the file, the date and the list as delegated on the input hero', () => {
    const contract = getPipeIOContract(structured.CONTRACTS, 'structured', 'invoice_with_source')!;
    const fields = buildRunFields(
      getPipeInputForm(structured.INPUT_FORM, 'structured', 'invoice_with_source')!,
      contract.inputs,
    );
    const brief = renderInputBrief({ pipeRef: 'structured.invoice_with_source' }, fields);
    expect(brief).toContain('`/inputs/source` — document (a file)');
    expect(brief).toContain('`/inputs/invoice/issued_on` — date');
    expect(brief).toMatch(/`\/inputs\/invoice\/lines` — list[^\n]*\[delegate: MthdsField\]/);
    expect(brief).toContain('`/inputs/invoice/reference` — text, required');
    expect(brief).not.toContain('json_schema');
  });

  it('carry one loaded run beside the result paths', () => {
    const contract = getPipeIOContract(results.CONTRACTS, 'results', 'nested_result')!;
    const field = buildResultField(
      getPipeOutputForm(results.OUTPUT_FORM, 'results', 'nested_result')!,
      contract.output.json_schema,
    );
    const brief = renderResultBrief(
      { pipeRef: 'results.nested_result' },
      field,
      payloadToState(field, PAYLOADS['results.nested_result']),
    );
    expect(brief).toContain('`/result/lines` — list of structure results.LineItem');
    expect(brief).toContain('`unit_price` — number');
    expect(brief).toContain('"issued_on": "2026-03-14"');
    expect(brief).not.toContain('__class__');
  });
});

describe('a hatch path inside a repeat', () => {
  const spec: Spec = {
    root: 'page',
    elements: {
      page: { type: 'Stack', props: {}, children: ['division'] },
      division: {
        type: 'Card',
        props: {},
        repeat: { statePath: '/result/divisions', key: 'name' },
        children: ['teams', 'team'],
      },
      teams: { type: 'MthdsResult', props: { path: 'teams' }, children: [] },
      team: {
        type: 'Collapsible',
        props: { title: 'x' },
        repeat: { statePath: { $item: 'teams' }, key: 'name' },
        children: ['members', 'founded'],
      },
      members: { type: 'MthdsResult', props: { path: 'members' }, children: [] },
      founded: { type: 'MthdsResult', props: { path: '/result/founded_on' }, children: [] },
    },
  };

  it('resolves against the chain of repeats above it, first item at each level', () => {
    expect(repeatBasePathOf(spec, 'page')).toBeUndefined();
    expect(repeatBasePathOf(spec, 'teams')).toBe('/result/divisions/0');
    expect(repeatBasePathOf(spec, 'members')).toBe('/result/divisions/0/teams/0');
    expect(absoluteHatchPath(spec, 'teams', 'teams')).toBe('/result/divisions/0/teams');
    expect(absoluteHatchPath(spec, 'members', 'members')).toBe(
      '/result/divisions/0/teams/0/members',
    );
  });

  it('leaves an absolute path alone, and a relative one outside a repeat unresolved', () => {
    expect(absoluteHatchPath(spec, 'founded', '/result/founded_on')).toBe('/result/founded_on');
    expect(absoluteHatchPath(spec, 'page', 'name')).toBeUndefined();
  });

  it('names the descriptor node through the list indexes', () => {
    const hero = HEROES.find((candidate) => pipeRefOf(candidate) === 'results.deep_result')!;
    const contract = getPipeIOContract(results.CONTRACTS, hero.domain, hero.pipeCode)!;
    const field = buildResultField(
      getPipeOutputForm(results.OUTPUT_FORM, hero.domain, hero.pipeCode)!,
      contract.output.json_schema,
    );
    expect(resultFieldAtPath(field, '/result/divisions/0/teams')?.kind).toBe('list');
    expect(resultFieldAtPath(field, '/result/divisions/0/teams/0/members')?.kind).toBe('list');
  });

  it('is what the validator demands of a hatch: a literal string, never an expression', () => {
    const verdict = validateAgainstCatalog({
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {},
          repeat: { statePath: '/result/divisions', key: 'name' },
          children: ['teams'],
        },
        teams: { type: 'MthdsResult', props: { path: { $item: 'teams' } }, children: [] },
      },
    });
    expect(verdict.ok).toBe(false);
    expect(formatProblems(verdict.problems)).toMatch(/MthdsResult\.path must be a literal string/);
  });
});

describe('the captured layouts', () => {
  const fixtures = [...TRIP_SPECS, ...INVOICE_SPECS, ...SLIDES_SPECS, ...PEOPLE_SPECS];
  /** The run that answered the question the study was run to answer. */
  const PINNED = 'pipelex-method--claude-4.8-opus';

  it('include the run that answered the question', () => {
    expect(fixtures.map(fixtureId)).toContain(PINNED);
  });

  it("have, for every authored method's hero, the designer method's layout on the pinned model", () => {
    for (const hero of HEROES.filter((candidate) => candidate.source === 'methods')) {
      const ids = fixtures.filter((fixture) => fixture.pipeRef === pipeRefOf(hero)).map(fixtureId);
      expect(ids, pipeRefOf(hero)).toContain(PINNED);
    }
  });

  for (const fixture of fixtures) {
    describe(`${fixture.pipeRef} (${fixtureId(fixture)})`, () => {
      const inputs = inputsOf(fixture.pipeRef);

      it('was produced against the prompt the package ships', () => {
        expect(fixture.promptHash).toBe(PROMPT_HASH);
      });

      it('compiles from its own JSONL to its spec', () => {
        expect(specFromJsonl(fixture.jsonl)).toEqual(fixture.spec);
      });

      it('validates against the catalog, and needs the components the product page adds', () => {
        const verdict = validateAgainstCatalog(fixture.spec, catalog);
        expect(verdict.ok, formatProblems(verdict.problems)).toBe(true);
        expect(validateAgainstCatalog(fixture.spec, baseCatalog).ok).toBe(false);
      });

      it('fits the descriptor it was written for, in both directions', () => {
        expect(layoutProblems({ inputs }, fixture.spec)).toEqual([]);
      });

      it('never quotes its seed on the page', () => {
        if (!fixture.seed) return;
        expect(fixture.jsonl).not.toContain(fixture.seed);
      });

      it('carries the grammar of a product page: bar first, hero once, footer last, one Cta and no Button', () => {
        const root = fixture.spec.elements[fixture.spec.root]!;
        const types = (root.children ?? []).map((key) => fixture.spec.elements[key]!.type);
        expect(types[0]).toBe('AppBar');
        expect(types[types.length - 1]).toBe('Footer');
        const count = (type: string) =>
          Object.values(fixture.spec.elements).filter((element) => element.type === type).length;
        for (const once of ['AppBar', 'Hero', 'Workspace', 'Rail', 'Footer']) {
          expect(count(once), once).toBe(1);
        }
        expect(count('Button')).toBe(0);
        const ctas = Object.entries(fixture.spec.elements).filter(
          ([, element]) => element.type === 'Cta',
        );
        expect(ctas).toHaveLength(1);
        const [ctaKey, cta] = ctas[0]!;
        const press = cta.on?.press;
        const actions = (Array.isArray(press) ? press : [press]).map((binding) => binding?.action);
        expect(actions).toEqual(['validateForm', 'run']);
        const rail = Object.values(fixture.spec.elements).find(
          (element) => element.type === 'Rail',
        )!;
        expect(rail.children?.[rail.children.length - 1]).toBe(ctaKey);
        expect(
          Object.values(fixture.spec.elements).filter(
            (element) => element.type === 'Heading' && element.props.level === 'h1',
          ),
        ).toHaveLength(0);
      });

      it('binds a SummaryRow only to paths the descriptor has', () => {
        for (const [key, element] of Object.entries(fixture.spec.elements)) {
          if (element.type !== 'SummaryRow') continue;
          for (const prop of ['value', 'detail'] as const) {
            const bound = (element.props as Record<string, { $state?: unknown }>)[prop]?.$state;
            if (bound === undefined) continue;
            expect(
              typeof bound === 'string' && inputFieldAtPath(inputs, bound),
              `${key}.${prop}`,
            ).toBeTruthy();
          }
        }
      });

      /**
       * The rules ask for a `NumberInput` on a number path, so the value
       * arrives as a NUMBER rather than the text an `Input` writes. The trip
       * planner's budget is the path that proved it.
       */
      it('binds every number path through a NumberInput', () => {
        const bound = Object.values(fixture.spec.elements).flatMap((element) => {
          const path = (element.props as { value?: { $bindState?: unknown } }).value?.$bindState;
          return typeof path === 'string' ? [{ element, path }] : [];
        });
        const numbers = bound.filter(
          ({ path }) => inputFieldAtPath(inputs, path)?.kind === 'number',
        );
        for (const { element, path } of numbers) expect(element.type, path).toBe('NumberInput');
        if (fixture.pipeRef === 'trips.plan_trip') {
          expect(numbers.map(({ path }) => path)).toContain('/inputs/request/budget');
        }
      });

      it("lists exactly the brief's choices wherever it offers a choice", () => {
        for (const [key, element] of Object.entries(fixture.spec.elements)) {
          if (!['Segmented', 'Radio', 'Select'].includes(element.type)) continue;
          const props = element.props as { options?: unknown; value?: { $bindState?: string } };
          const path = props.value?.$bindState;
          if (!path) continue;
          const field = inputFieldAtPath(inputs, path);
          expect(field?.kind, `${key} binds ${path}`).toBe('enum');
          if (field?.kind === 'enum') expect(props.options, key).toEqual(field.options);
        }
      });
    });
  }
});
