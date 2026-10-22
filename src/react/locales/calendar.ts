/**
 * The calendar facts a language pack words a stored file's date from, in the
 * reader's own time zone: how many days before today it was, and whether it
 * was this year. The wording is each pack's; the arithmetic is shared, so no
 * two packs disagree about which day was yesterday.
 */

/** Midnight at the start of `date`'s day, in local time. */
function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * How many calendar days before `now`'s day `date` falls: 0 for today, 1 for
 * yesterday, negative for a day after today. Counted on local calendar days,
 * rounded, so a daylight-saving change in between does not shift it.
 */
export function calendarDaysBefore(date: Date, now: Date = new Date()): number {
  return Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
}

/** Whether `date` falls in `now`'s calendar year. */
export function inCurrentYear(date: Date, now: Date = new Date()): boolean {
  return date.getFullYear() === now.getFullYear();
}
