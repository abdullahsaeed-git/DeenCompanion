/**
 * Prayer Time Service
 *
 * Uses Aladhan API (https://aladhan.com/prayer-times-api)
 * School is hardcoded to 0 (Shafi'i) as per product decision.
 * All time computations use city-local time via the API-provided timezone.
 */

import { PrayerTime, CalendarDay } from '../types/prayer';

const BASE_URL = 'https://api.aladhan.com/v1';

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_IDS: Record<string, string> = {
  Fajr: 'fajr',
  Sunrise: 'sunrise',
  Dhuhr: 'dhuhr',
  Asr: 'asr',
  Maghrib: 'maghrib',
  Isha: 'isha',
};

interface AladhanTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface AladhanDate {
  readable: string;
  gregorian: { date: string; day: string; month: { en: string; number: number }; year: string };
  hijri: { date: string; day: string; month: { en: string; ar: string; number: number }; year: string };
}

interface AladhanMeta {
  timezone: string;
  method: { id: number; name: string };
  latitude: number;
  longitude: number;
}

interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: AladhanTimings;
    date: AladhanDate;
    meta: AladhanMeta;
  };
}

export interface PrayerApiResult {
  times: PrayerTime[];
  locationName: string;
  gregorianDate: string;
  hijriDate: string;
  timezone: string;
  methodName: string;
  latitude: number;
  longitude: number;
}

/** Parse "HH:MM" to minutes since midnight */
export function parseMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/** Format "HH:MM" to 12-hour with AM/PM */
export function format12h(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/** Format "HH:MM" to compact 12-hour (e.g. "4:05a") */
export function formatShortAmPm(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'p' : 'a';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')}${ampm}`;
}

/** Strip timezone suffix from API time strings like "04:20 (PKT)" */
export function stripTimezone(timeStr: string): string {
  return timeStr.split(' ')[0];
}

/** Format milliseconds to "Xh Ym" or "Zm" */
function formatCountdown(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m}m`;
}

// ============================================
// TIMEZONE-AWARE HELPERS
// ============================================

/**
 * Get the current hours, minutes, day, month, year in a given timezone.
 * Uses Intl API — no external dependencies.
 * Handles Intl returning 24 for midnight in some locales.
 */
export function getCityLocalNow(timezone: string) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);

  const get = (type: string): number => {
    const part = parts.find(p => p.type === type);
    return part ? parseInt(part.value) : 0;
  };

  const hours = get('hour') === 24 ? 0 : get('hour');

  return {
    hours,
    minutes: get('minute'),
    day: get('day'),
    month: get('month'),
    year: get('year'),
  };
}

/** Get "YYYY-MM-DD" string in a given timezone */
export function getTodayStringInTimezone(timezone: string): string {
  const { year, month, day } = getCityLocalNow(timezone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ============================================
// PRAYER TIME BUILDING
// ============================================

/** Build PrayerTime array from Aladhan timings */
function buildPrayerTimes(timings: AladhanTimings): PrayerTime[] {
  return PRAYER_ORDER.map((key) => ({
    id: PRAYER_IDS[key],
    name: key,
    time: format12h(stripTimezone(timings[key as keyof AladhanTimings])),
    rawTime: stripTimezone(timings[key as keyof AladhanTimings]),
    isSunrise: key === 'Sunrise',
    notificationOn: true,
  }));
}

// ============================================
// PRAYER STATE COMPUTATION
// ============================================

/**
 * Compute next prayer, previous prayer, countdown, and progress.
 * When a timezone is provided, uses city-local time for all comparisons.
 * Falls back to device-local time if no timezone is given.
 */
export function computePrayerStates(prayers: PrayerTime[], timezone?: string | null) {
  let currentMinutes: number;
  let secondsIntoMinute: number;

  if (timezone) {
    const cityNow = getCityLocalNow(timezone);
    currentMinutes = cityNow.hours * 60 + cityNow.minutes;
  } else {
    const now = new Date();
    currentMinutes = now.getHours() * 60 + now.getMinutes();
  }

  // Sub-minute precision for countdown (from device clock)
  const now = new Date();
  secondsIntoMinute = now.getSeconds() * 1000 + now.getMilliseconds();

  const allEntries = prayers.map((p) => ({ ...p, minutes: parseMinutes(p.rawTime) }));
  const prayerOnly = allEntries.filter((p) => !p.isSunrise);

  let nextIndex = prayerOnly.findIndex((p) => p.minutes > currentMinutes);
  let nextPrayer = nextIndex >= 0 ? prayerOnly[nextIndex] : prayerOnly[0];
  let prevPrayer =
    nextIndex > 0
      ? prayerOnly[nextIndex - 1]
      : prayerOnly[prayerOnly.length - 1];

  // Countdown: minutes from now to next prayer
  let diffMinutes: number;
  if (nextIndex >= 0) {
    diffMinutes = nextPrayer.minutes - currentMinutes;
  } else {
    // All prayers passed — next is tomorrow's first prayer
    diffMinutes = (1440 - currentMinutes) + nextPrayer.minutes;
  }
  const countdownMs = Math.max(0, diffMinutes * 60 * 1000 - secondsIntoMinute);
  const countdown = formatCountdown(countdownMs);

  // Progress: fraction of time elapsed between prev prayer and next prayer
  let totalSpanMinutes: number;
  let elapsedMinutes: number;

  if (nextIndex > 0) {
    // Normal flow: prev ... current ... next (all same day)
    totalSpanMinutes = nextPrayer.minutes - prevPrayer.minutes;
    elapsedMinutes = currentMinutes - prevPrayer.minutes;
  } else if (nextIndex === 0) {
    // Wrapped midnight: prev was yesterday, current and next are today
    totalSpanMinutes = (1440 - prevPrayer.minutes) + nextPrayer.minutes;
    elapsedMinutes = (1440 - prevPrayer.minutes) + currentMinutes;
  } else {
    // nextIndex === -1: all passed, current is after prev (same day), next is tomorrow
    totalSpanMinutes = (1440 - prevPrayer.minutes) + nextPrayer.minutes;
    elapsedMinutes = currentMinutes - prevPrayer.minutes;
  }

  const progressPercent = Math.min(100, Math.max(0, (elapsedMinutes / totalSpanMinutes) * 100));

  return {
    nextPrayerId: nextPrayer.id,
    prevPrayerId: prevPrayer.id,
    countdown,
    progressPercent,
  };
}

// ============================================
// API METHODS
// ============================================

export const prayerService = {
  /** Fetch timings by city name. School hardcoded to 0 (Shafi'i). */
  getTimingsByCity: async (
    city: string,
    country: string,
    method: number = 1
  ): Promise<PrayerApiResult> => {
    const url = `${BASE_URL}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}&school=0`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: AladhanResponse = await res.json();
    if (json.code !== 200) throw new Error(json.status);

    const { timings, date, meta } = json.data;
    const hijriMonth = date.hijri.month.en;
    const hijriDate = `${date.hijri.day} ${hijriMonth} ${date.hijri.year} AH`;

    // Use the API's gregorian date, not the device clock
    const g = date.gregorian;
    const gregorianDate = new Date(
      parseInt(g.year), g.month.number - 1, parseInt(g.day)
    ).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      times: buildPrayerTimes(timings),
      locationName: `${city}, ${country}`,
      gregorianDate,
      hijriDate,
      timezone: meta.timezone,
      methodName: meta.method.name,
      latitude: meta.latitude,
      longitude: meta.longitude,
    };
  },

  /** Fetch timings by GPS coordinates. School hardcoded to 0 (Shafi'i). */
  getTimings: async (
    latitude: number,
    longitude: number,
    method: number = 1
  ): Promise<PrayerApiResult> => {
    const dateStr = new Date().toISOString().split('T')[0];
    const url = `${BASE_URL}/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}&school=0`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: AladhanResponse = await res.json();
    if (json.code !== 200) throw new Error(json.status);

    const { timings, date, meta } = json.data;
    const hijriMonth = date.hijri.month.en;
    const hijriDate = `${date.hijri.day} ${hijriMonth} ${date.hijri.year} AH`;

    // Use the API's gregorian date, not the device clock
    const g = date.gregorian;
    const gregorianDate = new Date(
      parseInt(g.year), g.month.number - 1, parseInt(g.day)
    ).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      times: buildPrayerTimes(timings),
      locationName: `${meta.latitude.toFixed(2)}, ${meta.longitude.toFixed(2)}`,
      gregorianDate,
      hijriDate,
      timezone: meta.timezone,
      methodName: meta.method.name,
      latitude: meta.latitude,
      longitude: meta.longitude,
    };
  },

  /** Fetch full month calendar by city. School hardcoded to 0 (Shafi'i). */
  getCalendarByCity: async (
    city: string,
    country: string,
    method: number = 1,
    month: number,
    year: number
  ): Promise<{ days: CalendarDay[]; timezone: string | null }> => {
    const url = `${BASE_URL}/calendarByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}&month=${month}&year=${year}&school=0`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.code !== 200) throw new Error(json.status);

    // Extract timezone from first day's meta before typing
    const timezone = json.data?.[0]?.meta?.timezone ?? null;
    return { days: json.data as CalendarDay[], timezone };
  },

 
};
