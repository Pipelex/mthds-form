/**
 * The calendar facts a language pack words a stored file's date from, in the
 * reader's own time zone: how many days before today it was, and whether it
 * was this year. The wording is each pack's; the arithmetic is shared, so no
 * two packs disagree about which day was yesterday.
 */

/**
 * `date`'s local calendar date as a day number: its local year, month and day
 * placed on the UTC calendar, where every day is exactly as long as the next.
 */
function dayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

/**
 * How many calendar days before `now`'s day `date` falls: 0 for today, 1 for
 * yesterday, negative for a day after today. Counted on the local calendar
 * dates rather than on the time between their midnights, so no change of
 * offset in between shifts it: not a daylight-saving hour, and not a whole
 * day skipped, as Samoa's move across the date line skipped one.
 */
export function calendarDaysBefore(date: Date, now: Date = new Date()): number {
  return dayNumber(now) - dayNumber(date);
}

/** Whether `date` falls in `now`'s calendar year. */
export function inCurrentYear(date: Date, now: Date = new Date()): boolean {
  return date.getFullYear() === now.getFullYear();
}
