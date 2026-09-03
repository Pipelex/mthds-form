import type {
  ActionBinding,
  PropExpression,
  Spec,
  UIElement,
  VisibilityCondition,
} from '@json-render/core';
import type { z } from 'zod';
import { catalog } from './catalog';
import type { SpecFixture } from './spec-fixture';
import { specToJsonl } from './stream';

/**
 * Writing a spec by hand, typed against the catalog.
 *
 * `catalog._specType` types every element's props as the UNION of all the
 * components' props, so a `Card` given a `Text` prop would pass it, and it has
 * no `on` field at all. `element()` below is typed PER COMPONENT: the second
 * argument is that component's own zod input shape, each prop widened to admit
 * a dynamic expression, so a misnamed or mistyped prop fails `tsc` before any
 * test runs. The validator then checks the same thing at runtime, for the two
 * sources that are not written in TypeScript.
 */

type CatalogComponents = typeof catalog.data.components;

export type ComponentName = keyof CatalogComponents & string;

/** A component's props, as the catalog declares them. */
export type PropsOf<K extends ComponentName> = z.input<CatalogComponents[K]['props']>;

/** The keys a component does not require: the catalog declares them `.nullable()`. */
type OptionalKeys<T> = {
  [P in keyof T]: undefined extends T[P] ? P : null extends T[P] ? P : never;
}[keyof T];

/**
 * The same props, each admitting a `$state` / `$bindState` / `$cond` /
 * `$template` expression, with the nullable ones optional - a spec omits a prop
 * it does not set, it never writes `null`.
 */
export type DynamicProps<K extends ComponentName> = {
  [P in Exclude<keyof PropsOf<K>, OptionalKeys<PropsOf<K>>>]:
    PropsOf<K>[P] | PropExpression<PropsOf<K>[P]>;
} & {
  [P in OptionalKeys<PropsOf<K>>]?: PropsOf<K>[P] | PropExpression<PropsOf<K>[P]>;
};

export interface ElementExtras {
  children?: string[];
  slots?: Record<string, string[]>;
  visible?: VisibilityCondition;
  on?: Record<string, ActionBinding | ActionBinding[]>;
  repeat?: UIElement['repeat'];
}

/** One element, typed by its component. */
export function element<K extends ComponentName>(
  type: K,
  props: DynamicProps<K>,
  extras: ElementExtras = {},
): UIElement {
  return { type, props: props as Record<string, unknown>, children: [], ...extras };
}

export interface AuthoredSpecInput {
  pipeRef: string;
  author: string;
  date: string;
  promptHash: string;
  brief: string;
  spec: Spec;
}

/** An authored spec as a fixture: the same shape a captured one has, with `source: 'authored'`. */
export function defineAuthoredSpec(input: AuthoredSpecInput): SpecFixture {
  return {
    pipeRef: input.pipeRef,
    source: 'authored',
    author: input.author,
    promptHash: input.promptHash,
    date: input.date,
    brief: input.brief,
    jsonl: specToJsonl(input.spec),
    spec: input.spec,
  };
}
