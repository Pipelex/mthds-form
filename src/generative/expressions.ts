/**
 * Whether a value is a json-render expression - `{ "$state": ... }` and its
 * kin - rather than a literal. Both checks read a value as an expression by
 * this and by nothing else, so neither calls an object a literal that the
 * other calls an expression - a `{ "$label": ... }` a model wrote is a literal
 * to json-render, and to both.
 *
 * A key alone does not make one, and the test is json-render's own, member by
 * member: it resolves `$state`, `$item`, `$bindState`, `$bindItem`,
 * `$computed` and `$template` only when they hold a text, `$index` only when
 * it is `true`, and `$cond` only beside both `$then` and `$else`. Anything
 * else under those keys is a literal object, which it resolves member by
 * member and hands the renderer as an object. So `{ "$state": 7 }` is read
 * here as the literal it renders as, and the literal check holds it to the
 * prop's schema rather than waving it through as a binding nothing resolves.
 */
export function isExpression(value: unknown): boolean {
  return expressionForm(value) !== undefined;
}

/** The form json-render resolves an expression as, named by its key. */
export type ExpressionForm =
  '$state' | '$item' | '$index' | '$bindState' | '$bindItem' | '$cond' | '$computed' | '$template';

/**
 * The form json-render resolves `value` as, or nothing for a literal: its
 * forms tried in json-render's own order, so an object carrying two keys is
 * the first. The one place that order is written; every reader of an
 * expression asks this.
 */
export function expressionForm(value: unknown): ExpressionForm | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  if (typeof record.$state === 'string') return '$state';
  if (typeof record.$item === 'string') return '$item';
  if (record.$index === true) return '$index';
  if (typeof record.$bindState === 'string') return '$bindState';
  if (typeof record.$bindItem === 'string') return '$bindItem';
  if ('$cond' in record && '$then' in record && '$else' in record) return '$cond';
  if (typeof record.$computed === 'string') return '$computed';
  if (typeof record.$template === 'string') return '$template';
  return undefined;
}

/**
 * The two values a `$cond` resolves to - each resolved again in its turn -
 * when json-render reads `value` as one, or nothing.
 */
export function condBranches(value: unknown): readonly [unknown, unknown] | undefined {
  if (expressionForm(value) !== '$cond') return undefined;
  const record = value as Record<string, unknown>;
  return [record.$then, record.$else];
}
