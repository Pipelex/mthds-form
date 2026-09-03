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

/** Inside a `repeat`, a prop reads the current item's field. */
export interface ItemExpression {
  $item: string;
}

/**
 * The same props, each admitting a `$state` / `$bindState` / `$cond` /
 * `$template` expression or, inside a repeat, an `$item` read, with the
 * nullable ones optional - a spec omits a prop it does not set, it never
 * writes `null`.
 */
export type DynamicProps<K extends ComponentName> = {
  [P in Exclude<keyof PropsOf<K>, OptionalKeys<PropsOf<K>>>]:
    PropsOf<K>[P] | PropExpression<PropsOf<K>[P]> | ItemExpression;
} & {
  [P in OptionalKeys<PropsOf<K>>]?: PropsOf<K>[P] | PropExpression<PropsOf<K>[P]> | ItemExpression;
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
  /** The model behind the session that wrote it, as an id: `claude-fable-5-1`. */
  model: string;
  date: string;
  promptHash: string;
  brief: string;
  spec: Spec;
}

/**
 * A hand-written spec as a fixture: the same shape a captured one has, with
 * the producer recorded as the Claude Code session that wrote it in the repo -
 * a session with the whole codebase in context, which is what distinguishes
 * it from a subagent given the prompt and the brief alone.
 */
export function defineAuthoredSpec(input: AuthoredSpecInput): SpecFixture {
  return {
    pipeRef: input.pipeRef,
    producer: 'claude-code-session',
    model: input.model,
    promptHash: input.promptHash,
    date: input.date,
    brief: input.brief,
    jsonl: specToJsonl(input.spec),
    spec: input.spec,
  };
}
