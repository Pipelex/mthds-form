/**
 * The controls' strings in French: a complete `FieldStrings`, for a host that
 * serves French and has no message catalogue of its own to bridge. Mounted as
 * `<FieldStringsProvider strings={FR_FIELD_STRINGS}>`, or spread under a host's
 * own overrides (`{ ...FR_FIELD_STRINGS, addItem: 'Ajouter une ligne' }`).
 *
 * The count-bearing messages apply French plural rules, where zero and one both
 * take the singular (`0 élément`, `1 élément`, `2 éléments`), and a size is
 * written the French way: `ko` and `Mo`, a decimal comma, a space before them.
 * Both come from `Intl` (`PluralRules`, `NumberFormat`), not hand-written rules.
 * A colon takes the no-break space French typography puts before it, so it
 * never wraps onto a line of its own.
 *
 * Typed as `FieldStrings` rather than `Partial`, so a key added to the contract
 * fails the build here until it is translated.
 */
import type { FieldStrings } from '../field-strings';

// Plurals and sizes come from the platform's `Intl`, not from hand-written rules: it knows French
// (zero and one take the singular, `ko` and `Mo`, a decimal comma, a narrow no-break space before
// the unit), and it is how every other locale pack added beside this one gets its rules right.
const PLURALS = new Intl.PluralRules('fr');
const BYTES = new Intl.NumberFormat('fr-FR', { style: 'unit', unit: 'byte', unitDisplay: 'long' });
const KILOBYTES = new Intl.NumberFormat('fr-FR', {
  style: 'unit',
  unit: 'kilobyte',
  unitDisplay: 'short',
  maximumFractionDigits: 0,
});
const MEGABYTES = new Intl.NumberFormat('fr-FR', {
  style: 'unit',
  unit: 'megabyte',
  unitDisplay: 'short',
  maximumFractionDigits: 1,
});

/** The noun agreeing with `count`, by French plural rules. */
function plural(count: number, one: string, other: string): string {
  return PLURALS.select(count) === 'one' ? one : other;
}

/** `512 octets`, `36 ko`, `1,4 Mo`, on the English formatter's binary multiples. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return BYTES.format(bytes);
  if (bytes < 1024 * 1024) return KILOBYTES.format(bytes / 1024);
  return MEGABYTES.format(bytes / (1024 * 1024));
}

export const FR_FIELD_STRINGS: FieldStrings = {
  optionalBadge: 'facultatif',
  selectPlaceholder: 'Choisir…',
  typeValuePlaceholder: 'Saisissez une valeur…',
  writeHerePlaceholder: 'Écrivez ici…',
  jsonHint: 'Saisissez cette valeur en JSON brut.',
  decrease: 'Diminuer',
  increase: 'Augmenter',
  noItemsYet: 'Aucun élément pour le moment',
  addItem: 'Ajouter un élément',
  removeItemAria: (index) => `Supprimer l’élément ${index}`,
  itemsCount: (count) => `${count} ${plural(count, 'élément', 'éléments')}`,
  itemsCountOf: (count, total) => `${count} sur ${total} ${plural(total, 'élément', 'éléments')}`,
  fieldsCount: (count) => `${count} ${plural(count, 'champ', 'champs')}`,
  uploading: 'Envoi en cours…',
  dropToUpload: 'Déposez pour envoyer',
  dropOrBrowse: 'Déposez un fichier ou cliquez pour parcourir',
  pasteUrlInstead: 'coller un lien à la place',
  uploadUnavailable: 'Impossible d’envoyer un fichier ici. Collez plutôt un lien vers le fichier.',
  urlPlaceholder: 'https://…',
  fileUrlAria: (label) => (label ? `Lien vers le fichier pour ${label}` : 'Lien vers le fichier'),
  uploadedFile: 'Fichier joint',
  encodedFileSummary: (format, bytes) => `${format} · ${formatBytes(bytes)}`,
  preview: 'Aperçu',
  removeFileAria: 'Retirer le fichier',
  previewUnavailablePdf: 'Aperçu indisponible - ouvrez le fichier pour le consulter.',
  // U+002D HYPHEN-MINUS, as in the English defaults.
  resultAbsent: '-',
  resultAbsentDescription: 'Non renseigné',
  resultUndescribed: 'Aucun descripteur de sortie pour ce pipe — affichage de la valeur brute.',
  toggleRowDetails: (index) => `Afficher ou masquer le détail de la ligne ${index}`,
  rowDetailsColumn: 'Détail',
  copyUrl: 'Copier le lien',
  copyText: 'Copier le texte',
  download: 'Télécharger',
  downloading: 'Téléchargement…',
  downloadIncomplete: (names) =>
    `${
      names.length <= 1
        ? 'Un fichier n’a pas pu être enregistré'
        : `${names.length} fichiers n’ont pas pu être enregistrés`
    }\u00a0: ${names.join(', ')}`,
  downloadFile: (name) => `Télécharger ${name}`,
  downloadFileFailed: 'Le fichier n’a pas pu être enregistré',
  saveAsPdf: 'Enregistrer en PDF',
  saveAsPdfFailed: 'La fenêtre d’impression ne s’est pas ouverte',
  viewRendered: 'Résultat',
  viewJson: 'JSON',
  copyJson: 'Copier le JSON',
  resultViewGroup: 'Affichage du résultat',
  yes: 'Oui',
  no: 'Non',
  unsupportedFileType: (formats) =>
    `Ce type de fichier n’est pas pris en charge. Formats acceptés\u00a0: ${formats}.`,
  hideOptionalFields: 'Masquer les champs facultatifs',
  hideOptionalInputs: 'Masquer les entrées facultatives',
  optionalFieldsCount: (count) =>
    `${count} ${plural(count, 'champ facultatif', 'champs facultatifs')}`,
  optionalInputsCount: (count) =>
    `${count} ${plural(count, 'entrée facultative', 'entrées facultatives')}`,
  requiredField: 'Obligatoire',
  incompleteField: 'Incomplet\u00a0: remplissez ses champs obligatoires',
  uploadFailed: 'Ce fichier n’a pas pu être envoyé. Réessayez.',
};
