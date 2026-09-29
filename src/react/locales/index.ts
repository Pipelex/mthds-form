/**
 * The language packs, by locale code, and the switch that picks one. A new language is one file in
 * this folder, typed as a whole `FieldStrings`, added to `FIELD_STRINGS_BY_LOCALE` below.
 */
import type { FieldStrings } from '../field-strings';
import { EN_FIELD_STRINGS } from './en';
import { FR_FIELD_STRINGS } from './fr';

/** Every language pack the package ships, keyed by its primary language subtag. */
export const FIELD_STRINGS_BY_LOCALE: Readonly<Record<string, FieldStrings>> = {
  en: EN_FIELD_STRINGS,
  fr: FR_FIELD_STRINGS,
};

/** The locale codes a pack exists for. */
export const SUPPORTED_LOCALES = Object.keys(FIELD_STRINGS_BY_LOCALE);

/**
 * The pack for a locale code, read as BCP 47: its primary language subtag decides, so `fr`,
 * `fr-FR`, `fr_CA` and `FR` all give French. A missing or unknown locale gives English.
 */
export function fieldStringsFor(locale?: string | null): FieldStrings {
  const language = (locale ?? '').trim().toLowerCase().split(/[-_]/)[0] ?? '';
  return FIELD_STRINGS_BY_LOCALE[language] ?? EN_FIELD_STRINGS;
}
