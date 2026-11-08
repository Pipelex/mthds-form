/**
 * The keys json-render resolves as an expression wherever they sit in a prop.
 * Both checks read a value as an expression by these and by nothing else, so
 * neither calls an object a literal that the other calls an expression - a
 * `{ "$label": ... }` a model wrote is a literal to json-render, and to both.
 */
export const EXPRESSION_KEYS = [
  '$state',
  '$item',
  '$index',
  '$bindState',
  '$bindItem',
  '$cond',
  '$computed',
  '$template',
];

/** Whether a value is a json-render expression - `{ "$state": ... }` and its kin - rather than a literal. */
export function isExpression(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).some((key) => EXPRESSION_KEYS.includes(key))
  );
}
