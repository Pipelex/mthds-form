/**
 * Seeding a form from the method's authored defaults.
 *
 * Pure module: no React, no DOM - a server building a payload and a control
 * turning an optional structure on read the same answer from here.
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
 * **A structure is seeded exactly when there is something to seed** - an
 * authored default of its own, or at least one default anywhere beneath it -
 * and it is then seeded with `seedObjectValue`, the same value its presence
 * switch writes. That holds for an optional structure too, at any depth and at
 * the top level: its defaults switch it ON at seed time, and the person can
 * switch it off. One with nothing to seed stays absent, its switch OFF.
 */
export function seedInputs(fields: readonly RunField[]): Record<string, unknown> {
  const seed: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      seed[field.name] = field.defaultValue;
    } else if (field.kind === 'object') {
      const nested = seedObjectValue(field);
      if (Object.keys(nested).length > 0) seed[field.name] = nested;
    }
  }
  return seed;
}

/**
 * The value a structured field holds the moment it is switched ON: the
 * structure's own authored default when it carries an object one, otherwise
 * an object seeded from its children's defaults by `seedInputs` - which is `{}`
 * when none of them declares one. Always a plain object, so the switch that
 * reads the value back (`presenceSwitchOn`) reads ON.
 *
 * A structure beneath it follows `seedInputs`' own rule: seeded when it has
 * a default somewhere, absent when it has none.
 */
export function seedObjectValue(field: ObjectRunField): Record<string, unknown> {
  if (isRecord(field.defaultValue)) return { ...field.defaultValue };
  return seedInputs(field.fields);
}
