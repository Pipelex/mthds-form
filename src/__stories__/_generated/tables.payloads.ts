/**
 * Real payloads from real runs of src/__stories__/_structures/tables.mthds - DO NOT EDIT.
 *
 * Regenerate with `make fixtures-runs`, which runs each pipe on the hosted API
 * through `@pipelex/sdk` and copies back the `main_stuff` the run returned. This
 * costs inference budget, which is why it is its own target.
 *
 * **A payload is the one fixture no projection can produce.** Everything else
 * in `_generated/` is derived from what a pipe DECLARES; this is derived from
 * what running it returned, and the difference is not academic. Two shapes here
 * are invisible from every descriptor and were both written wrong by hand
 * before a real run corrected them. Which shape arrives depends on whether the
 * runner could HYDRATE the content - a native concept it can, a structure the
 * bundle defines the hosted worker cannot, and renders raw instead: hydrated, a
 * `date` inside a structure arrives in the serializer's typed envelope
 * (`{date, __class__, __module__}`) and a plural result in the `{items}`
 * envelope; raw, the date is a plain ISO string and the plural a bare array.
 * Only a run shows which, and the corpus holds both.
 *
 * The one edit the generator makes is to drop a storage reference's `public_url`:
 * that is the link one deployment answered on one day - presigned, expiring,
 * naming its bucket - and it resolves nowhere else. See `redactResolvedUrls` in
 * the generator.
 */

/** Every pipe_ref that was run for this case, in sorted order. */
export const RUN_PIPE_REFS = ['tables.clauses', 'tables.clauses_fr', 'tables.links'] as const;

export const PAYLOADS: Record<string, unknown> = {
  'tables.links': [
    {
      url: 'https://en.wikipedia.org/wiki/Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu',
      status: 'up',
      checked_on: '2026-09-20',
      response_ms: 412,
    },
    {
      url: 'https://en.wikipedia.org/wiki/Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch',
      status: 'up',
      checked_on: '2026-09-20',
      response_ms: 388,
    },
    {
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap',
      status: 'redirect',
      checked_on: '2026-09-20',
      response_ms: 97,
    },
    {
      url: 'https://www.w3.org/TR/css-text-3/#overflow-wrap-property',
      status: 'up',
      checked_on: '2026-09-20',
      response_ms: 1204,
    },
    {
      url: 'https://example.org/archive/2019/observatory-retrofit-plan-final-v2.pdf',
      status: 'down',
      checked_on: '2026-09-20',
      response_ms: 30000,
    },
  ],
  'tables.clauses': [
    {
      subject: 'Confidentiality',
      obligation:
        'Both parties must keep each other’s commercial information confidential during the contract and for five years after it ends.',
      exception:
        'This duty does not apply to information that was already public or that a court orders to be disclosed.',
      remedy:
        'A party that breaches confidentiality may owe the other party damages. The non-breaching party may also end the contract immediately.',
    },
    {
      subject: 'Delivery',
      obligation: 'The provider must deliver each milestone by the date set out in the schedule.',
      exception:
        'The delivery date does not apply to the extent the client is late providing data on which the milestone depends.',
      remedy:
        'For each week of delay, the client may withhold two percent of the relevant milestone fee. The total amount withheld cannot exceed twenty percent of that fee.',
    },
    {
      subject: 'Acceptance',
      obligation:
        'The client must test each delivery within ten working days and either accept it or provide a written list of defects.',
      exception:
        'A delivery that the client has already put into production is treated as accepted.',
      remedy:
        'The provider must correct defects that the client lists on time, free of charge, within fifteen working days.',
    },
    {
      subject: 'Liability',
      obligation:
        'Each party’s liability under the contract is limited to the total fees paid in the twelve months before the claim.',
      exception:
        'The liability cap does not apply to fraud, wilful misconduct, or breaches of confidentiality.',
      remedy: 'A claim for an amount above the applicable liability cap is void.',
    },
    {
      subject: 'Termination',
      obligation: 'Either party may terminate the contract by giving three months’ written notice.',
      exception:
        'During the first six months, neither party may terminate on notice and termination is available only for a material breach.',
      remedy:
        'When the contract ends, the client must pay for work that was delivered and accepted up to the termination date.',
    },
  ],
  'tables.clauses_fr': [
    {
      subject: 'Confidentialité',
      obligation:
        'Le client et le prestataire doivent préserver réciproquement la confidentialité des informations commerciales échangées pendant le contrat et durant les cinq années suivant son terme.',
      exception:
        'Cette obligation ne s’applique pas aux informations déjà publiques ni lorsque leur communication est ordonnée par une juridiction.',
      remedy:
        'Tout manquement peut entraîner le versement de dommages-intérêts et la résiliation immédiate du contrat.',
    },
    {
      subject: 'Calendrier de livraison',
      obligation:
        'Le prestataire doit livrer chaque jalon à la date prévue par le calendrier contractuel.',
      exception:
        'Cette obligation ne s’applique pas lorsque le client tarde à fournir les données nécessaires à la réalisation du jalon.',
      remedy:
        'Pour chaque semaine de retard, le client peut retenir 2 % du prix du jalon concerné, dans la limite totale de 20 %.',
    },
    {
      subject: 'Recette des livraisons',
      obligation:
        'Le client doit procéder à la recette de chaque livraison dans les dix jours ouvrés et soit l’accepter, soit notifier par écrit les anomalies constatées. Les anomalies notifiées dans ce délai doivent être corrigées gratuitement sous quinze jours ouvrés.',
      exception: 'Une livraison déjà mise en production est réputée acceptée.',
      remedy:
        'Les anomalies notifiées dans les délais doivent être corrigées gratuitement dans les quinze jours ouvrés.',
    },
    {
      subject: 'Responsabilité',
      obligation:
        'La responsabilité de chaque partie est plafonnée au montant total des honoraires versés au cours des douze mois précédant la réclamation.',
      exception:
        'Ce plafond ne s’applique pas en cas de fraude, de faute intentionnelle ou de violation de la confidentialité.',
      remedy: 'Toute réclamation qui excède le plafond applicable est irrecevable.',
    },
    {
      subject: 'Résiliation',
      obligation:
        'Chaque partie peut résilier le contrat avec un préavis écrit de trois mois. En cas de résiliation, le client doit régler les prestations livrées et recettées jusqu’à la date d’effet.',
      exception:
        'Pendant les six premiers mois du contrat, la résiliation n’est possible qu’en cas d’inexécution grave.',
      remedy: '',
    },
  ],
};
