'use client';

import * as React from 'react';
import type { ValidationConfig } from '@json-render/core';
import {
  useFieldValidation,
  useOptionalValidation,
  type ValidationContextValue,
} from '@json-render/react';

/**
 * The checks of a page's fields, as json-render's validation is told of them.
 *
 * json-render keeps one set of checks per path, registered by each field's
 * own effect and never unregistered, and `validateForm` and `validateAll` run
 * every set it holds. So a field hidden by its `visible` condition, or one a
 * streamed or swapped layout dropped, kept its last checks and refused the
 * run while nobody could see or correct it; and two controls bound to the
 * same path with different checks each registered its own over the other's
 * at every render, an update loop React stopped with "Maximum update depth
 * exceeded", while whichever result was written last hid the other's
 * failure. The page keeps its own record instead: every checked field that
 * is mounted now, by path, and json-render is told, for each path, the checks
 * of all the fields mounted at it, and no checks once the last one leaves. A
 * field validates against the same combined checks, so what it shows and
 * what `validateForm` and the run decide agree.
 */
export class CheckedFields {
  // One entry per mounted field, so two fields handed one config object are
  // two entries, and one leaving does not take the other's checks with it.
  private readonly byPath = new Map<string, Set<{ config: ValidationConfig }>>();
  private validation: ValidationContextValue | null = null;

  /** Hands the record json-render's validation, and tells it what is already mounted. */
  attach(validation: ValidationContextValue | null): void {
    if (validation === this.validation) return;
    const first = this.validation === null;
    this.validation = validation;
    if (first) for (const path of this.byPath.keys()) this.publish(path);
  }

  /** Enters one mounted field's checks; what it returns leaves them again. */
  enter(path: string, config: ValidationConfig): () => void {
    const configs = this.byPath.get(path) ?? new Set<{ config: ValidationConfig }>();
    this.byPath.set(path, configs);
    const entry = { config };
    configs.add(entry);
    this.publish(path);
    return () => {
      configs.delete(entry);
      if (configs.size === 0) this.byPath.delete(path);
      this.publish(path);
    };
  }

  /** The checks of every field mounted at `path`, combined, or none when no field is. */
  configFor(path: string): ValidationConfig | undefined {
    const configs = this.byPath.get(path);
    if (!configs || configs.size === 0) return undefined;
    const [first] = configs;
    return {
      checks: [...configs].flatMap(({ config }) => config.checks ?? []),
      ...(first?.config.validateOn ? { validateOn: first.config.validateOn } : {}),
    };
  }

  /**
   * Runs the checks of every path a mounted field carries, as the record
   * holds them now, and answers whether they all pass; every path is checked,
   * so each failing field shows its message. json-render's own `validateAll`
   * reads what it was told as of its provider's last render, which a press
   * can beat by one task when a field has just mounted.
   */
  check(validation: ValidationContextValue): boolean {
    let pass = true;
    for (const path of this.byPath.keys()) {
      const combined = this.configFor(path);
      if (combined && !validation.validate(path, combined).valid) pass = false;
    }
    return pass;
  }

  private publish(path: string): void {
    this.validation?.registerField(path, this.configFor(path) ?? { checks: [] });
  }
}

/** The page's record of its mounted checked fields; absent outside a page. */
export const CheckedFieldsContext = React.createContext<CheckedFields | null>(null);

/**
 * json-render's `useFieldValidation`, for a control that carries checks. On a
 * page, the field's checks enter the page's record while it is mounted, and
 * the field validates against every check its path carries, so a control
 * hidden or dropped no longer holds the run and two controls on one path
 * agree. A host's own control that carries checks calls this rather than
 * `useFieldValidation` to be held to the same rules; outside a page it is
 * `useFieldValidation`.
 */
export function useCheckedField(
  path: string,
  config: ValidationConfig | undefined,
): ReturnType<typeof useFieldValidation> {
  const fields = React.useContext(CheckedFieldsContext);
  // On a page the record registers the path's combined checks; a field
  // registering its own as well would undo them.
  const field = useFieldValidation(path, fields ? undefined : config);
  const validation = useOptionalValidation();
  // Keyed on what the checks say, not on the object a renderer builds anew at
  // every render, so a keystroke does not leave and enter the record.
  const signature = config ? JSON.stringify(config) : '';
  const latest = React.useRef(config);
  React.useInsertionEffect(() => {
    latest.current = config;
  });
  React.useEffect(() => {
    const entered = latest.current;
    if (!fields || !path || !entered) return undefined;
    return fields.enter(path, entered);
  }, [fields, path, signature]);
  const fallback = field.validate;
  const validate = React.useCallback(() => {
    const combined = fields?.configFor(path);
    return validation && combined ? validation.validate(path, combined) : fallback();
  }, [fields, path, validation, fallback]);
  return { ...field, validate };
}
