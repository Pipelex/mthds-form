'use client';

import * as React from 'react';
import {
  builtInValidationFunctions,
  type ValidationCheck,
  type ValidationConfig,
  type ValidationFunction,
} from '@json-render/core';
import {
  useFieldValidation,
  useOptionalValidation,
  type ValidationContextValue,
} from '@json-render/react';
import { hasOwnProp } from '../core/own-property';

/**
 * The check a conditional config's checks are carried in once they are
 * combined with other configs' checks at one path. json-render reads a config's
 * `enabled` once for the whole config, so it cannot say "these checks while
 * this holds, those always"; each check of a conditional config is therefore
 * wrapped in this one, whose arguments carry the condition, as a `$cond`
 * json-render resolves against the state when it runs the check, and the type
 * of the check it stands for. The page registers the function behind it.
 */
const CHECK_WHEN = 'checkedFieldWhen';
const WHEN_ENABLED = 'checkedFieldEnabled';
const WHEN_TYPE = 'checkedFieldType';

/**
 * The validation functions a page hands json-render: the one behind
 * `CHECK_WHEN`, which passes while its condition is off and otherwise runs
 * the built-in check it stands for, with the arguments that check was written
 * with. A type json-render does not know passes, as json-render answers one,
 * and so does one inherited from `Object.prototype`, which a bare lookup would
 * call.
 */
export const CHECKED_FIELD_FUNCTIONS: Readonly<Record<string, ValidationFunction>> = {
  [CHECK_WHEN]: (value, args) => {
    if (args?.[WHEN_ENABLED] !== true) return true;
    const type = args[WHEN_TYPE];
    if (typeof type !== 'string' || !hasOwnProp(builtInValidationFunctions, type)) return true;
    return builtInValidationFunctions[type]!(value, args);
  },
};

/** One check of a conditional config, held to its condition wherever it is combined. */
function heldTo(check: ValidationCheck, enabled: unknown): ValidationCheck {
  return {
    type: CHECK_WHEN,
    message: check.message,
    args: {
      ...check.args,
      [WHEN_ENABLED]: { $cond: enabled, $then: true, $else: false },
      [WHEN_TYPE]: check.type,
    },
  };
}

/**
 * One mounted checked field: its checks, and how a refused run takes the
 * person to it - the panels around it to open, and the element to focus.
 */
interface CheckedEntry {
  config: ValidationConfig;
  /** Opens every tab, step or section the field sits in. */
  reveal: () => void;
  /** Puts the focus on the field once what `reveal` opened is drawn. */
  focus: () => void;
  /** The element the focus goes to, when the control handed one over. */
  element: () => HTMLElement | null;
}

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
  private readonly byPath = new Map<string, Set<CheckedEntry>>();
  // Every path the record has told json-render of, which json-render keeps
  // until told otherwise: its verdict on these is the record's to give.
  private readonly told = new Set<string>();
  private validation: ValidationContextValue | null = null;

  /** Hands the record json-render's validation, and tells it what is already mounted. */
  attach(validation: ValidationContextValue | null): void {
    if (validation === this.validation) return;
    const first = this.validation === null;
    this.validation = validation;
    if (first) for (const path of this.byPath.keys()) this.publish(path);
  }

  /** Enters one mounted field; what it returns leaves it again. */
  enter(
    path: string,
    config: ValidationConfig,
    field: Partial<Omit<CheckedEntry, 'config'>> = {},
  ): () => void {
    const entries = this.byPath.get(path) ?? new Set<CheckedEntry>();
    this.byPath.set(path, entries);
    const entry: CheckedEntry = {
      config,
      reveal: field.reveal ?? (() => {}),
      focus: field.focus ?? (() => {}),
      element: field.element ?? (() => null),
    };
    entries.add(entry);
    this.publish(path);
    return () => {
      entries.delete(entry);
      if (entries.size === 0) this.byPath.delete(path);
      this.publish(path);
    };
  }

  /**
   * The checks of every field mounted at `path`, combined, or none when no
   * field is. A field's `enabled` condition holds its own checks and no
   * other field's: json-render reads `enabled` once for a whole config, and
   * compares two configs without it, so each check of a conditional config
   * carries its condition itself (`CHECK_WHEN`).
   */
  configFor(path: string): ValidationConfig | undefined {
    const entries = this.byPath.get(path);
    if (!entries || entries.size === 0) return undefined;
    const [first] = entries;
    return {
      checks: [...entries].flatMap(({ config }) => {
        const checks = config.checks ?? [];
        return config.enabled === undefined
          ? checks
          : checks.map((check) => heldTo(check, config.enabled));
      }),
      ...(first?.config.validateOn ? { validateOn: first.config.validateOn } : {}),
    };
  }

  /**
   * Runs the checks of the page and answers whether they all pass; every
   * check runs, so each failing field shows its message. When one fails, the
   * person is taken to the first failing field in the page's order: the
   * panels around it opened and the focus put on it, since a tab, a step or a
   * section that is not open keeps its fields mounted and hidden.
   *
   * Each path is judged once, by one side. A path the record has carried is
   * judged by the record's checks as it holds them now: json-render's own
   * `validateAll` reads what it was told as of its provider's last render,
   * which a press can beat by one task, so a field hidden or mounted the
   * task before would be judged by checks it no longer carries, or not yet
   * by those it does. A path the record never carried is a host's control
   * that registered its checks with json-render directly
   * (`useFieldValidation`), and json-render's verdict on it stands.
   */
  check(validation: ValidationContextValue): boolean {
    const before = validation.fieldStates;
    validation.validateAll();
    const after = validation.fieldStates;
    let pass = true;
    for (const [path, state] of Object.entries(after)) {
      if (state === before[path] || this.told.has(path)) continue;
      if (state.result?.valid === false) pass = false;
    }
    const failing: CheckedEntry[] = [];
    for (const path of this.told) {
      const combined = this.configFor(path);
      if (combined) {
        if (!validation.validate(path, combined).valid) {
          pass = false;
          failing.push(...(this.byPath.get(path) ?? []));
        }
      } else if (after[path] !== before[path]) {
        // json-render judged a field that has left by checks it no longer
        // carries; a field mounted there later must not show that verdict.
        validation.clear(path);
      }
    }
    const first = firstInPage(failing);
    if (first) {
      first.reveal();
      first.focus();
    }
    return pass;
  }

  private publish(path: string): void {
    if (!this.validation) return;
    this.told.add(path);
    this.validation.registerField(path, this.configFor(path) ?? { checks: [] });
  }
}

/** `Node.DOCUMENT_POSITION_FOLLOWING`, without reading a DOM global where none may exist. */
const FOLLOWING = 4;

/**
 * The entry whose element comes first in the document, which is the page's
 * reading order: a hidden panel stays in the document, so the fields of a
 * closed tab sit where its panel does. An entry whose control handed over no
 * element comes after every one that did, in the order the fields mounted.
 */
function firstInPage(entries: readonly CheckedEntry[]): CheckedEntry | undefined {
  let first: CheckedEntry | undefined;
  let firstElement: HTMLElement | null = null;
  for (const entry of entries) {
    const element = entry.element();
    if (!first) {
      first = entry;
      firstElement = element;
      continue;
    }
    if (!element) continue;
    if (!firstElement || element.compareDocumentPosition(firstElement) & FOLLOWING) {
      first = entry;
      firstElement = element;
    }
  }
  return first;
}

/** The page's record of its mounted checked fields; absent outside a page. */
export const CheckedFieldsContext = React.createContext<CheckedFields | null>(null);

/**
 * What opens every panel around a point of the page: the tab, the step or the
 * section a field sits in, and the ones around those. Absent where nothing
 * hides the field.
 */
const RevealContext = React.createContext<(() => void) | null>(null);

/**
 * A panel that can be hidden - a tab's, a step's, a closed section's - as a
 * refused run sees it: `open` shows this panel, and the reveal it hands its
 * contents opens the panels around it first. The reveal handed down keeps its
 * identity across renders, so no field re-renders when its panel does.
 */
export function RevealPanel({ open, children }: { open: () => void; children: React.ReactNode }) {
  const outer = React.useContext(RevealContext);
  const latest = React.useRef({ open, outer });
  React.useInsertionEffect(() => {
    latest.current = { open, outer };
  });
  const reveal = React.useCallback(() => {
    latest.current.outer?.();
    latest.current.open();
  }, []);
  return <RevealContext.Provider value={reveal}>{children}</RevealContext.Provider>;
}

/** What `useCheckedField` gives a control: json-render's field validation, and where the focus goes. */
export type CheckedField = ReturnType<typeof useFieldValidation> & {
  /**
   * A ref for the element a refused run puts the focus on: the input, the
   * select's trigger, the first radio. A control that attaches it is focused
   * when it is the first failing field of a refused run; one that does not is
   * still revealed, after every field that does.
   */
  focusRef: (element: HTMLElement | null) => void;
};

/**
 * json-render's `useFieldValidation`, for a control that carries checks. On a
 * page, the field's checks enter the page's record while it is mounted, and
 * the field validates against every check its path carries, so a control
 * hidden or dropped no longer holds the run and two controls on one path
 * agree; and when a run is refused, the first failing field is revealed and
 * focused. A host's own control that carries checks calls this rather than
 * `useFieldValidation` to be held to the same rules, and attaches `focusRef`
 * to the element that should take the focus; outside a page it is
 * `useFieldValidation`.
 */
export function useCheckedField(path: string, config: ValidationConfig | undefined): CheckedField {
  const fields = React.useContext(CheckedFieldsContext);
  // On a page the record registers the path's combined checks; a field
  // registering its own as well would undo them.
  const field = useFieldValidation(path, fields ? undefined : config);
  const validation = useOptionalValidation();
  const reveal = React.useContext(RevealContext);
  const element = React.useRef<HTMLElement | null>(null);
  const focusRef = React.useCallback((node: HTMLElement | null) => {
    element.current = node;
  }, []);
  // A refused run asks for the focus in the same update that opens the
  // panels around the field, so it is given once that update is drawn.
  const [focusAsked, askFocus] = React.useState(0);
  React.useEffect(() => {
    if (focusAsked === 0) return;
    const target = element.current;
    if (!target) return;
    target.focus({ preventScroll: true });
    // The middle of the viewport rather than its edge, where a host's sticky
    // action row may sit over it. jsdom has no `scrollIntoView`.
    target.scrollIntoView?.({ block: 'center' });
  }, [focusAsked]);
  // Keyed on what the checks say, not on the object a renderer builds anew at
  // every render, so a keystroke does not leave and enter the record.
  const signature = config ? JSON.stringify(config) : '';
  const latest = React.useRef({ config, reveal });
  React.useInsertionEffect(() => {
    latest.current = { config, reveal };
  });
  React.useEffect(() => {
    const entered = latest.current.config;
    if (!fields || !path || !entered) return undefined;
    return fields.enter(path, entered, {
      reveal: () => latest.current.reveal?.(),
      focus: () => askFocus((asked) => asked + 1),
      element: () => element.current,
    });
  }, [fields, path, signature]);
  const fallback = field.validate;
  const validate = React.useCallback(() => {
    const combined = fields?.configFor(path);
    return validation && combined ? validation.validate(path, combined) : fallback();
  }, [fields, path, validation, fallback]);
  return { ...field, validate, focusRef };
}
