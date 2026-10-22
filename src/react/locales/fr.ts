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
import { calendarDaysBefore, inCurrentYear } from './calendar';

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

// Lists and dates come from `Intl` too: "PDF, JPG et PNG", "17 oct.", a time on the 24-hour clock.
const AND = new Intl.ListFormat('fr', { type: 'conjunction' });
const OR = new Intl.ListFormat('fr', { type: 'disjunction' });
const TIME = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const DAY = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const DAY_YEAR = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** « Aujourd’hui, 10:42 », « Hier », « 17 oct. », or « 17 oct. 2025 » for another year. */
function formatFileDate(date: Date): string {
  const days = calendarDaysBefore(date);
  if (days === 0) return `Aujourd’hui, ${TIME.format(date)}`;
  if (days === 1) return 'Hier';
  return inCurrentYear(date) ? DAY.format(date) : DAY_YEAR.format(date);
}

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
  downloadPdf: 'Télécharger le PDF',
  downloadPdfBusy: 'Préparation du PDF…',
  downloadPdfFailed: 'Le PDF n’a pas pu être créé',
  pageLoading: 'Chargement de la page…',
  downloadHtml: 'Télécharger le HTML',
  fileNameTitle: 'Nom du fichier',
  fileNameCancel: 'Annuler',
  fileNameConfirm: 'Télécharger',
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
  chooseFromSource: 'Choisir parmi les fichiers de l’équipe',
  chooseFromSourceAria: (label) =>
    label
      ? `Choisir parmi les fichiers de l’équipe pour ${label}`
      : 'Choisir parmi les fichiers de l’équipe',
  filePickerTitle: 'Les fichiers de l’équipe',
  filePickerTakes: (formats) =>
    `Fichiers ${AND.format(formats)} uniquement, ceux que cette entrée accepte`,
  filePickerSearch: 'Rechercher des fichiers',
  filePickerSearchPlaceholder: 'Rechercher par nom',
  filePickerScope: 'Quels fichiers',
  filePickerMine: 'Les miens',
  filePickerEveryone: 'Toute l’équipe',
  filePickerUse: (count, name) => {
    if (count === 0) return 'Choisissez un fichier';
    if (count === 1 && name) return `Utiliser ${name}`;
    return `Utiliser ${count} ${plural(count, 'fichier', 'fichiers')}`;
  },
  filePickerLoading: 'Chargement de vos fichiers…',
  filePickerFailed: 'Impossible de charger vos fichiers.',
  filePickerNoMatch: 'Aucun fichier ne correspond.',
  filePickerClearSearch: 'Effacer la recherche',
  filePickerNoneTeam: (formats) => `L’équipe n’a encore aucun fichier ${OR.format(formats)}.`,
  filePickerNoneMine: (formats) =>
    `Vous n’avez encore ni ajouté ni créé de fichier ${OR.format(formats)}.`,
  filePickerShowEveryone: 'Voir ceux de l’équipe',
  filePickerUpload: 'Envoyer un fichier',
  filePickerShown: (count) => `${count} ${plural(count, 'fichier', 'fichiers')}`,
  testFile: 'Fichier de test',
  fileSize: formatBytes,
  fileDate: formatFileDate,
  fillWithExample: 'Remplir avec un exemple',
  examplesTitle: 'Exemples',
  examplesHint: 'En choisir un remplit le formulaire. Rien ne s’exécute avant que vous le lanciez.',
  examplesLoading: 'Chargement des exemples…',
  examplesFailed: 'Impossible de charger les exemples.',
  examplesNone:
    'Aucun exemple pour le moment. Lancez-le, puis enregistrez l’exécution comme exemple.',
  examplesShown: (count) => `${count} ${plural(count, 'exemple', 'exemples')}`,
  replaceEnteredTitle: 'Remplacer ce que vous avez saisi\u00a0?',
  replaceEnteredDescription: (name) =>
    `Remplir le formulaire avec «\u00a0${name}\u00a0» remplace toutes ses valeurs.`,
  replaceEnteredConfirm: 'Remplacer',
  exampleActions: (name) => `Actions pour ${name}`,
  renameExample: 'Renommer',
  deleteExample: 'Supprimer',
  renameExampleTitle: 'Renommer l’exemple',
  exampleName: 'Nom',
  renaming: 'Renommage…',
  renameFailed: 'Impossible de renommer l’exemple.',
  deleteExampleTitle: (name) => `Supprimer «\u00a0${name}\u00a0»\u00a0?`,
  deleteExampleDescription: 'Cette action est irréversible.',
  deleting: 'Suppression…',
  deleteFailed: 'Impossible de supprimer l’exemple.',
  close: 'Fermer',
  cancel: 'Annuler',
  save: 'Enregistrer',
  tryAgain: 'Réessayer',
  showMore: 'Afficher plus',
  loadingMore: 'Chargement de la suite…',
  loadMoreFailed: 'Impossible de charger la suite.',
};
