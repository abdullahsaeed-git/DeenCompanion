/**
 * Prayer Data Types
 */

/** A single prayer time entry */
export interface PrayerTime {
  id: string;
  name: string;
  time: string;
  rawTime: string;
  isSunrise?: boolean;
  notificationOn: boolean;
}

/** Which state a prayer row is in */
export type PrayerRowState = 'past' | 'next' | 'upcoming';

/** A single day from the Aladhan calendar API */
export interface CalendarDay {
  timings: Record<string, string>;
  date: {
    readable: string;
    gregorian: {
      date: string;
      day: string;
      weekday: { en: string };
      month: { number: number; en: string };
      year: string;
    };
    hijri: {
      date: string;
      day: string;
      month: { number: number; en: string; ar: string };
      year: string;
    };
  };
}