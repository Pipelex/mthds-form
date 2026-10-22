/**
 * The calendar arithmetic a language pack words a file's date from, counted on
 * the reader's calendar dates rather than on elapsed time.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { calendarDaysBefore, inCurrentYear } from '../locales/calendar';

const zone = process.env.TZ;
afterEach(() => {
  if (zone === undefined) delete process.env.TZ;
  else process.env.TZ = zone;
});

describe('calendarDaysBefore', () => {
  it('counts today, yesterday and the day before on local dates', () => {
    const now = new Date(2026, 9, 22, 9, 0);
    expect(calendarDaysBefore(new Date(2026, 9, 22, 0, 5), now)).toBe(0);
    expect(calendarDaysBefore(new Date(2026, 9, 21, 23, 59), now)).toBe(1);
    expect(calendarDaysBefore(new Date(2026, 9, 20, 12, 0), now)).toBe(2);
  });

  it('counts calendar dates across a change of more than an hour, as Apia skipped a whole day', () => {
    // Samoa moved across the date line at the end of 29 December 2011: its
    // next date was the 31st, so the 29th is two dates before the 31st there,
    // although only a day of time lies between their midnights.
    process.env.TZ = 'Pacific/Apia';
    const now = new Date(2011, 11, 31, 12, 0);
    expect(now.getDate()).toBe(31);
    expect(calendarDaysBefore(new Date(2011, 11, 29, 12, 0), now)).toBe(2);
  });
});

describe('inCurrentYear', () => {
  it('reads the year on the local calendar', () => {
    expect(inCurrentYear(new Date(2026, 0, 1), new Date(2026, 11, 31))).toBe(true);
    expect(inCurrentYear(new Date(2025, 11, 31), new Date(2026, 0, 1))).toBe(false);
  });
});
