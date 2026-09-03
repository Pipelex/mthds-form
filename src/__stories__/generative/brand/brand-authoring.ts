import type { PropExpression, UIElement } from '@json-render/core';
import type { z } from 'zod';
import type { ElementExtras, ItemExpression } from '../authoring';
import { brandCatalog } from './brand-catalog';

/**
 * `element()` for the brand catalog: the layer's helper, typed against this
 * catalog's components instead - the same per-component typing, so a misnamed
 * or mistyped prop fails `tsc` before the story renders.
 */

type BrandComponents = typeof brandCatalog.data.components;

export type BrandComponentKey = keyof BrandComponents & string;

type PropsOf<K extends BrandComponentKey> = z.input<BrandComponents[K]['props']>;

type OptionalKeys<T> = {
  [P in keyof T]: undefined extends T[P] ? P : null extends T[P] ? P : never;
}[keyof T];

type DynamicProps<K extends BrandComponentKey> = {
  [P in Exclude<keyof PropsOf<K>, OptionalKeys<PropsOf<K>>>]:
    PropsOf<K>[P] | PropExpression<PropsOf<K>[P]> | ItemExpression;
} & {
  [P in OptionalKeys<PropsOf<K>>]?: PropsOf<K>[P] | PropExpression<PropsOf<K>[P]> | ItemExpression;
};

export function brandElement<K extends BrandComponentKey>(
  type: K,
  props: DynamicProps<K>,
  extras: ElementExtras = {},
): UIElement {
  return { type, props: props as Record<string, unknown>, children: [], ...extras };
}
