/**
 * Seeding a form from the method's authored defaults.
 *
 * Pure module: no React, no DOM - a server building a payload and a control
 * opening an optional structure read the same answer from here.
 */

import type { ObjectRunField, RunField } from './descriptor';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The `/inputs` seed: the authored defaults, and nothing else.
 *
 * A defaulted field carries `defaultValue` (never the `null` a schema
 * projection attaches to an optional field); a structure's defaults sit inside
 * it. What is NOT seeded is an empty string or a zero for an unfilled field -
 * the kernel's readiness treats an absent value as absent, and a seeded
 * placeholder would count as filled.
 *
 * **An optional structure is not descended into.** Its presence is a choice the
 * person makes with the structure's own disclosure (see `hasPresenceToggle`),
 * so a seed that put its children's defaults inside it would make that choice
 * for them: the structure would arrive open and be sent, merely because its
 * concept declares defaults. It is seeded only when the structure itself
 * carries an authored default; otherwise it stays absent, and turning it on
 * seeds it then, through `seedObjectValue`. A host that wants it open from the
 * start puts `seedObjectValue(field)` at its path.
 */
export function seedInputs(fields: readonly RunField[]): Record<string, unknown> {
  const seed: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      seed[field.name] = field.defaultValue;
    } else if (field.kind === 'object' && field.required) {
      const nested = seedInputs(field.fields);
      if (Object.keys(nested).length > 0) seed[field.name] = nested;
    }
  }
  return seed;
}

/**
 * The value a structured field holds the moment it is opened: the
 * structure's own authored default when it carries an object one, otherwise
 * an object seeded from its children's defaults by `seedInputs` - which is `{}`
 * when none of them declares one. Always a plain object, so the disclosure that
 * reads the value back (`presenceOpen`) reads open.
 *
 * Optional structures beneath it stay absent, by `seedInputs`' own rule: each
 * has its own disclosure.
 */
export function seedObjectValue(field: ObjectRunField): Record<string, unknown> {
  if (isRecord(field.defaultValue)) return { ...field.defaultValue };
  return seedInputs(field.fields);
}
