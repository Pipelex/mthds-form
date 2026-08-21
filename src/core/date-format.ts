/**
 * Pure conversions between a stored date value and what a native `<input
 * type="date">` shows, plus the leniency rules our schema validation uses.
 * Kept React-free so both the runner's `DateField` and the RJSF `DateWidget`
 * share one source of truth (and it's trivially unit-tested).
 *
 * Two schema shapes reach us, and they are NOT interchangeable:
 *   - an MTHDS `type = "date"` structure field compiles to `format: date-time`,
 *     so its value round-trips as a full RFC 3339 timestamp;
 *   - `native.Date`'s own `date` field is a python `datetime.date`, i.e.
 *     `format: date` - a bare `YYYY-MM-DD`.
 *
 * ## Why these rules exist
 *
 * The runtime (pydantic) is LENIENT in both directions, and our client used to
 * be stricter than the contract it was enforcing: `ajv`'s stock `format: "date"`
 * accepts a bare `YYYY-MM-DD` and nothing else, so a hand-written
 * `"2026-07-06T00:00:00Z"` in an `inputs.json` was rejected here even though
 * pydantic accepts it happily and coerces it to `date(2026, 7, 6)`. The run
 * never even reached the runner. These predicates mirror pydantic exactly
 * (measured, not assumed):
 *
 *   format: date       "2026-07-06"                -> date(2026, 7, 6)
 *                      "2026-07-06T00:00:00Z"      -> date(2026, 7, 6)
 *                      "2026-07-06T00:00:00+02:00" -> date(2026, 7, 6)   (literal date, no UTC shift)
 *                      "2026-07-06T15:40:00Z"      -> REJECTED "should have zero time"
 *   format: date-time  "2026-07-06"                -> datetime(2026, 7, 6, 0, 0)
 *                      "2026-07-06T00:00:00Z"      -> datetime(2026, 7, 6, 0, 0, tz)
 *
 * A midnight-padded timestamp is unambiguously "just a day", so take it. A real
 * time is data - refusing it is the point (`DateContentError`: "no silent
 * midnight"), because silently dropping 15:40 corrupts the value. And an
 * ambiguous `06/07/2026` is never accepted by anyone: 6 July or June 7 depends
 * on who's reading, and guessing wrong fails silently.
 */

/** `YYYY-MM-DD`, no time. */
const FULL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * A datetime whose clock reads exactly zero - optional seconds, optional
 * all-zero fraction, optional `Z`/offset. `00:00:01` and `00:00:00.001` do NOT
 * match: they carry a real time.
 */
const ZERO_TIME_DATE_TIME_RE =
  /^(\d{4}-\d{2}-\d{2})[T ]00:00(?::00(?:\.0+)?)?(?:Z|z|[+-]\d{2}:?\d{2})?$/;

/** Any RFC 3339-ish datetime we can hand to the runtime as a date-time. */
const DATE_TIME_RE =
  /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|z|[+-]\d{2}:?\d{2})?$/;

/** Guards against `2026-02-30` - a well-formed string that isn't a real day. */
function isRealCalendarDate(value: string): boolean {
  const match = FULL_DATE_RE.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/**
 * The calendar day a value denotes, or `null` when it doesn't denote one.
 * Accepts a bare date or a midnight-padded timestamp; the day is taken
 * LITERALLY from the string (never shifted through a timezone), matching
 * pydantic - `2026-07-06T00:00:00+02:00` is 2026-07-06, not the 5th.
 */
export function asCalendarDate(value: string): string | null {
  if (isRealCalendarDate(value)) return value;
  const zeroTime = ZERO_TIME_DATE_TIME_RE.exec(value);
  if (zeroTime && isRealCalendarDate(zeroTime[1]!)) return zeroTime[1]!;
  return null;
}

/**
 * The calendar day inside a value that carries a REAL time - precisely the case
 * `asCalendarDate` refuses. `null` when the value isn't a timestamp at all, or
 * when it IS already an acceptable day (nothing to report).
 *
 * This exists to EXPLAIN, never to coerce. `2026-07-06T14:30:00+02:00` is
 * rejected for a `format: date` field, and the rejection is right (DT3, "no
 * silent midnight" - dropping 14:30 corrupts the value). But telling the user
 * "pick a valid date" while the picker shows them a perfectly good 06/07/2026
 * reads as a lie: `toDateInputValue` renders the day, the stored value carries
 * the time, and only one of those is what gets validated. Naming both the value
 * we hold and the day it would have to become is what makes the error legible.
 */
export function dayWithinDateTime(value: string): string | null {
  if (asCalendarDate(value) !== null) return null;
  const match = DATE_TIME_RE.exec(value);
  if (!match || !isRealCalendarDate(match[1]!)) return null;
  return match[1]!;
}

/**
 * What `format: "date"` accepts: a bare `YYYY-MM-DD`, and nothing else.
 *
 * DO NOT relax this to take a midnight-padded timestamp. `DateContent` in
 * pipelex carries a `mode="before"` field validator (`_reject_lax_temporal`)
 * that deliberately CLOSES pydantic's lax coercion for exactly this case:
 *
 *   "A Date's `date` field takes a calendar date alone; a string carrying a
 *    time (e.g. '2026-07-07T00:00:00') would drop it - put the time and offset
 *    in `time` instead."
 *
 * That rule (DT3, "no silent midnight") is the concept's whole point, so a
 * lenient client here does not help anyone: it just forwards the value and the
 * runner answers with a 500 instead of the field saying so up front.
 *
 * The leniency belongs in `asCalendarDate` - normalize the pasted timestamp to
 * the day it denotes, then this passes. Accept-and-fix, not accept-and-forward.
 */
export function isAcceptableDate(value: string): boolean {
  return isRealCalendarDate(value);
}

/** What `format: "date-time"` should accept - a bare day is midnight. */
export function isAcceptableDateTime(value: string): boolean {
  if (isRealCalendarDate(value)) return true;
  const match = DATE_TIME_RE.exec(value);
  if (!match || !isRealCalendarDate(match[1]!)) return false;
  const [hours, minutes, seconds] = [Number(match[2]), Number(match[3]), Number(match[4] ?? 0)];
  return hours <= 23 && minutes <= 59 && seconds <= 59;
}

/** The `YYYY-MM-DD` a native date input shows, from any stored date/date-time. */
export function toDateInputValue(value: string | undefined): string {
  if (typeof value !== 'string') return '';
  return asCalendarDate(value) ?? value.slice(0, 10);
}

/**
 * The value to store for a picked day. A `date-time` field becomes midnight-UTC
 * (`2026-07-06T00:00:00Z`); a plain `date` field keeps the bare `YYYY-MM-DD`.
 * An empty day clears the value.
 */
export function toStoredDateValue(day: string, datetime: boolean): string | undefined {
  if (!day) return undefined;
  return datetime ? `${day}T00:00:00Z` : day;
}
