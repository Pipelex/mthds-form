/**
 * Read a property a record OWNS, never one it merely inherits.
 *
 * Every name this package indexes a record by - an input variable name, a
 * structure's property name, a pipe code, a concept's content key - is chosen
 * by the METHOD AUTHOR, and the records they index are plain objects the host
 * built (`{}` from a form's state, `JSON.parse` of a request body, a map keyed
 * by pipe ref). A plain object inherits `Object.prototype`, so a name that
 * collides with a prototype member - `constructor`, `toString`, `valueOf`,
 * `hasOwnProperty`, … - does NOT read as `undefined`: it reads as the inherited
 * function, which is truthy.
 *
 * That is a verdict bug wherever a bare read decides one. An input named
 * `constructor` with nothing entered used to resolve to `Object`, which
 * `isFilled` had no branch for and therefore called filled - a live Run button
 * over an empty required input. `getPipeIOContract` returned the same function
 * for a prototype-named pipe code, which sailed past the `if (!contract)` guard
 * hosts are shown writing.
 *
 * What it does NOT close, stated so nobody reads a fixed read as a fixed class:
 * the WRITE twin. `out[name] = value` on a plain object invokes the inherited
 * `__proto__` setter for that one name, so an input actually called `__proto__`
 * is dropped from a payload rather than added to it. That is fail-loud (the
 * runtime rejects a run whose input is missing) where the read bug was
 * fail-open, and `__proto__` is not a name an author writes, so the writes are
 * left plain and legible.
 *
 * Spelled with `Object.prototype.hasOwnProperty.call` rather than `Object.hasOwn`
 * deliberately. `hasOwn` is an ES2022 runtime API and `tsconfig.json` compiles
 * to **ES2020**, so a browser inside the declared target has no such function
 * and every read here would throw before a form could render a single field -
 * a whole-package failure in service of a shorter spelling. TypeScript cannot
 * catch that: `lib` is what types a runtime API, `target` is what states the
 * baseline, and the two are allowed to disagree.
 *
 * Deliberately module-private: this is a spelling of `record[key]`, not a
 * concept a consumer needs. Reachability is low - only a method author picks
 * these names - but the cost of being wrong is a form that says a field is
 * filled when it is empty, so the package spells the read one way everywhere
 * rather than guarding the sites someone happened to notice.
 */
export function ownProp<T>(
  record: Record<string, T> | null | undefined,
  key: string,
): T | undefined {
  if (record == null) return undefined;
  return Object.prototype.hasOwnProperty.call(record, key) ? record[key] : undefined;
}

/** `key in record` with the prototype chain left out. */
export function hasOwnProp(record: object | null | undefined, key: string): boolean {
  return record != null && Object.prototype.hasOwnProperty.call(record, key);
}
