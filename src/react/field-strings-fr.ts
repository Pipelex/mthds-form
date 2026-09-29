/**
 * The controls' strings in French: a complete `FieldStrings`, for a host that
 * serves French and has no message catalogue of its own to bridge. Mounted as
 * `<FieldStringsProvider strings={FR_FIELD_STRINGS}>`, or spread under a host's
 * own overrides (`{ ...FR_FIELD_STRINGS, addItem: 'Ajouter une ligne' }`).
 *
 * The count-bearing messages apply French plural rules, where zero and one both
 * take the singular (`0 élément`, `1 élément`, `2 éléments`), and a size is
 * written the French way: `Ko` and `Mo`, a decimal comma, a space before them.
 * A colon takes the no-break space French typography puts before it, so it
 * never wraps onto a line of its own.
 *
 * Typed as `FieldStrings` rather than `Partial`, so a key added to the contract
 * fails the build here until it is translated.
 */
import type { FieldStrings } from './field-strings';

/** French plural choice: zero and one take the singular. */
function plural(count: number, one: string, many: string): string {
  return count <= 1 ? one : many;
}

/** `512 octets`, `36 Ko`, `1,4 Mo` — the English formatter's binary multiples, in French. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} ${plural(bytes, 'octet', 'octets')}`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
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
};
