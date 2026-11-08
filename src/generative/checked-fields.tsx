'use client';

import * as React from 'react';
import type { ValidationConfig } from '@json-render/core';
import { useFieldValidation, type ValidationContextValue } from '@json-render/react';

/**
 * The fields of a page that carry checks, as they are mounted now.
 *
 * json-render's validation keeps every field that ever registered: nothing
 * unregisters, so a field hidden by its `visible` condition, or one whose
 * element a streamed or swapped layout dropped, keeps its last checks, and
 * `validateAll` still runs them. A run gated on `validateAll` was refused by
 * a field nobody could see or correct. The page keeps its own record of the
 * checked fields that are mounted, entered and left with each field, and the
 * run runs those checks alone.
 */
export type CheckedFields = Set<CheckedField>;

/** One mounted field's checks: the path its value is bound to, and the checks it carries. */
export interface CheckedField {
  path: string;
  config: ValidationConfig;
}

/** The page's record of its mounted checked fields; absent outside a page. */
export const CheckedFieldsContext = React.createContext<CheckedFields | null>(null);

/**
 * json-render's `useFieldValidation`, with the field entered in the page's
 * record of mounted checked fields while it is mounted and carries checks.
 */
export function useCheckedField(
  path: string,
  config: ValidationConfig | undefined,
): ReturnType<typeof useFieldValidation> {
  const fields = React.useContext(CheckedFieldsContext);
  const validation = useFieldValidation(path, config);
  React.useEffect(() => {
    if (!fields || !path || !config) return undefined;
    const field: CheckedField = { path, config };
    fields.add(field);
    return () => {
      fields.delete(field);
    };
  }, [fields, path, config]);
  return validation;
}

/**
 * Runs the checks of every mounted checked field, as `validateAll` runs those
 * of every field ever registered, and answers whether they all pass. Each
 * field is checked, not only up to the first that fails, so each failing
 * field shows its message.
 */
export function checksPass(fields: CheckedFields, validation: ValidationContextValue): boolean {
  let pass = true;
  for (const field of fields) {
    if (!validation.validate(field.path, field.config).valid) pass = false;
  }
  return pass;
}
