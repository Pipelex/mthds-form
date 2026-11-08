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
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.$state === 'string' ||
    typeof record.$item === 'string' ||
    record.$index === true ||
    typeof record.$bindState === 'string' ||
    typeof record.$bindItem === 'string' ||
    ('$cond' in record && '$then' in record && '$else' in record) ||
    typeof record.$computed === 'string' ||
    typeof record.$template === 'string'
  );
}
