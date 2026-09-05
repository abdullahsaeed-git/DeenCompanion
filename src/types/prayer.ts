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
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  date: {
    readable: string;
    gregorian: {
      date: string;
      day: string;
      weekday: { en: string };
      month: { en: string; number: number };
      year: string;
    };
    hijri: {
      date: string;
      day: string;
      month: { en: string; ar: string; number: number };
      year: string;
    };
  };
  // Add this meta block:
  meta: {
    timezone: string;
    method: {
      id: number;
      name: string;
    };
    latitude: number;
    longitude: number;
  };
}