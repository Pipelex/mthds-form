/**
 * The stories' sample host: how a host turns a team's colours, app style and
 * typeface into the values of the tokens the controls read.
 *
 * The kernel ships none of this. It keeps only its theming surface, the named
 * tokens its controls read, each with a default (docs/theming.md); producing
 * and describing a brand is a host's job. The stories still need a host that
 * sets those tokens to real values, so they can show whether a control reads
 * under a team's accent, on a style's panel, in both themes: this is that
 * host's derivation, copied as the kernel's former `./brand` entry had it
 * when the entry moved out of this package. It is story code, outside every
 * entry tree and shipped in nothing, and it is not kept in step with any
 * host's own derivation: what the stories measure is the controls, under
 * values a host could set, never the derivation itself.
 */

export {
  COLOR_TOKEN_NAMES,
  MIN_CONTRAST,
  MIN_CONTROL_CONTRAST,
  colorHex,
  contrastRatio,
  isColorTokenName,
  type ColorTokenName,
  type SrgbColor,
} from './color';
export {
  deriveBrandRoles,
  isAccentAdjusted,
  isActionFaint,
  readableTextOn,
  resolveDarkSeeds,
  type BrandRoles,
  type BrandSeeds,
  type TextOnFill,
} from './seed-roles';
export {
  APP_STYLES,
  APP_STYLE_IDS,
  TYPEFACES,
  deriveStyleRoles,
  isAppStyle,
  isTypeface,
  resolveRoleColor,
  type ActionShadow,
  type AppStyle,
  type AppStyleId,
  type BodyTypefaceId,
  type PanelRoles,
  type RoleColor,
  type StyleRoles,
  type Typeface,
  type TypefaceId,
} from './styles';
