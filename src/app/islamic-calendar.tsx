/**
 * Islamic Calendar Screen
 *
 * Displays a Hijri month calendar with Gregorian dates.
 * Uses Aladhan API: /v1/hijriCalendar/:year/:month
 *
 * Route: /islamic-calendar
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';

// ============================================
// DATA
// ============================================

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-awwal",
  "Rabi' al-thani",
  'Jumada al-awwal',
  'Jumada al-thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

const HIJRI_MONTH_SHORT = [
  'Muh', 'Saf', 'Rabi I', 'Rabi II', 'Jum I', 'Jum II',
  'Raj', 'Sha', 'Ram', 'Shaw', 'Dhu Q', 'Dhu H',
];

const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const WEEKDAY_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const GREG_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface IslamicEvent {
  day: number;
  month: number; // 1-12
  name: string;
}

const ISLAMIC_EVENTS: IslamicEvent[] = [
  { day: 1, month: 1, name: 'Islamic New Year' },
  { day: 10, month: 1, name: 'Day of Ashura' },
  { day: 12, month: 3, name: 'Mawlid an-Nabawi ﷺ' },
  { day: 27, month: 7, name: "Isra & Mi'raj" },
  { day: 1, month: 9, name: 'Ramadan begins' },
  { day: 27, month: 9, name: 'Laylat al-Qadr' },
  { day: 1, month: 10, name: 'Eid al-Fitr' },
  { day: 9, month: 12, name: 'Day of Arafah' },
  { day: 10, month: 12, name: 'Eid al-Adha' },
];

interface CalendarDay {
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;
  gregorianDay: number;
  gregorianMonth: number;
  gregorianYear: number;
  weekday: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  hasEvent: boolean;
}

// ============================================
// ICONS
// ============================================

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke={colors.secondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PrevIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke={colors.secondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function NextIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke={colors.secondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"
        fill={colors.accent}
      />
      <Path
        d="M12 8.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z"
        fill={colors.background}
      />
    </Svg>
  );
}

// ============================================
// API
// ============================================

async function fetchHijriMonth(year: number, month: number): Promise<any[]> {
  // Using Makkah coords + Umm al-Qura method as the Hijri reference
  const url = `https://api.aladhan.com/v1/hijriCalendar/${year}/${month}?latitude=21.4225&longitude=39.8262&method=4`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.status || 'Failed to load calendar');
  return json.data;
}

// ============================================
// HELPERS
// ============================================

function getWeekdayIndex(name: string): number {
  const idx = WEEKDAY_FULL.indexOf(name);
  if (idx >= 0) return idx;
  // Fallback for abbreviated names
  return WEEKDAY_FULL.findIndex((d) => d.toLowerCase().startsWith(name.toLowerCase()));
}

function parseApiDay(apiDay: any, isCurrentMonth: boolean, todayStr: string): CalendarDay {
  const g = apiDay.date.gregorian;
  const h = apiDay.date.hijri;
  const dateStr = `${g.year}-${String(g.month.number).padStart(2, '0')}-${String(g.day).padStart(2, '0')}`;

  const hasEvent = ISLAMIC_EVENTS.some(
    (e) => e.day === parseInt(h.day, 10) && e.month === parseInt(h.month.number, 10)
  );

  return {
    hijriDay: parseInt(h.day, 10),
    hijriMonth: parseInt(h.month.number, 10),
    hijriYear: parseInt(h.year, 10),
    gregorianDay: parseInt(g.day, 10),
    gregorianMonth: parseInt(g.month.number, 10),
    gregorianYear: parseInt(g.year, 10),
    weekday: g.weekday.en,
    isToday: dateStr === todayStr,
    isCurrentMonth,
    hasEvent,
  };
}

function buildCalendarGrid(prev: any[], curr: any[], next: any[]): CalendarDay[] {
  const firstWeekday = getWeekdayIndex(curr[0].date.gregorian.weekday.en);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const grid: CalendarDay[] = [];

  // Previous month padding
  const prevPadding = prev.slice(-firstWeekday);
  for (const d of prevPadding) {
    grid.push(parseApiDay(d, false, todayStr));
  }

  // Current month
  for (const d of curr) {
    grid.push(parseApiDay(d, true, todayStr));
  }

  // Next month padding
  const remaining = 42 - grid.length;
  const nextPadding = next.slice(0, remaining);
  for (const d of nextPadding) {
    grid.push(parseApiDay(d, false, todayStr));
  }

  return grid;
}

function formatGregorianShort(apiDay: any): string {
  const g = apiDay.date.gregorian;
  return `${parseInt(g.day, 10)} ${GREG_MONTHS[parseInt(g.month.number, 10) - 1]}`;
}

function getUpcomingEvents(currentMonth: number, _currentYear: number) {
  const events: (IslamicEvent & { shortMonth: string })[] = [];
  for (let i = 0; i < 12; i++) {
    const month = ((currentMonth - 1 + i) % 12) + 1;
    const monthEvents = ISLAMIC_EVENTS.filter((e) => e.month === month);
    for (const ev of monthEvents) {
      events.push({ ...ev, shortMonth: HIJRI_MONTH_SHORT[month - 1] });
    }
  }
  return events.slice(0, 5);
}

// ============================================
// MAIN SCREEN
// ============================================

export default function IslamicCalendarScreen() {
  const insets = useSafeAreaInsets();

  const [hijriYear, setHijriYear] = useState(1448);
  const [hijriMonth, setHijriMonth] = useState(2);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [monthName, setMonthName] = useState('');
  const [gregorianRange, setGregorianRange] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialReady, setInitialReady] = useState(false);

  // Fetch current Hijri date on mount
  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    fetch(`https://api.aladhan.com/v1/gToH/${dd}-${mm}-${yyyy}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.code === 200) {
          const h = json.data.hijri;
          setHijriYear(parseInt(h.year, 10));
          setHijriMonth(parseInt(h.month.number, 10));
        }
      })
      .catch(() => {
        // keep defaults
      })
      .finally(() => setInitialReady(true));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const prevMonth = hijriMonth === 1 ? 12 : hijriMonth - 1;
      const prevYear = hijriMonth === 1 ? hijriYear - 1 : hijriYear;
      const nextMonth = hijriMonth === 12 ? 1 : hijriMonth + 1;
      const nextYear = hijriMonth === 12 ? hijriYear + 1 : hijriYear;

      const [prevRes, currRes, nextRes] = await Promise.all([
        fetchHijriMonth(prevYear, prevMonth),
        fetchHijriMonth(hijriYear, hijriMonth),
        fetchHijriMonth(nextYear, nextMonth),
      ]);

      const grid = buildCalendarGrid(prevRes, currRes, nextRes);
      setDays(grid);

      const first = currRes[0];
      const last = currRes[currRes.length - 1];
      setMonthName(`${HIJRI_MONTHS[hijriMonth - 1]} ${hijriYear} AH`);
      setGregorianRange(`${formatGregorianShort(first)} – ${formatGregorianShort(last)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [hijriYear, hijriMonth]);

  useEffect(() => {
    if (!initialReady) return;
    load();
  }, [initialReady, load]);

  function goToPrevMonth() {
    if (hijriMonth === 1) {
      setHijriMonth(12);
      setHijriYear((y) => y - 1);
    } else {
      setHijriMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (hijriMonth === 12) {
      setHijriMonth(1);
      setHijriYear((y) => y + 1);
    } else {
      setHijriMonth((m) => m + 1);
    }
  }

  const upcomingEvents = getUpcomingEvents(hijriMonth, hijriYear);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <BackIcon />
          </Pressable>
          <Text style={styles.title}>Islamic Calendar</Text>
          <View style={styles.spacer} />
        </View>

        {/* Month selector */}
        <View style={styles.monthSelector}>
          <Pressable style={styles.iconButton} onPress={goToPrevMonth}>
            <PrevIcon />
          </Pressable>
          <View style={styles.monthNameBlock}>
            <Text style={styles.monthName}>{monthName || 'Loading…'}</Text>
            <Text style={styles.monthRange}>{gregorianRange}</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={goToNextMonth}>
            <NextIcon />
          </Pressable>
        </View>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading calendar…</Text>
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && (
          <>
            {/* Weekday row */}
            <View style={styles.weekRow}>
              {WEEKDAYS.map((d) => (
                <Text key={d} style={styles.weekDay}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.grid}>
              {days.map((day, index) => (
                <View
                  key={index}
                  style={[
                    styles.cell,
                    !day.isCurrentMonth && styles.cellDim,
                    day.isToday && styles.cellToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.hijriDay,
                      !day.isCurrentMonth && styles.hijriDayDim,
                      day.isToday && styles.hijriDayToday,
                    ]}
                  >
                    {day.hijriDay}
                  </Text>
                  <Text
                    style={[
                      styles.gregDay,
                      !day.isCurrentMonth && styles.gregDayDim,
                      day.isToday && styles.gregDayToday,
                    ]}
                  >
                    {day.gregorianDay}
                  </Text>
                  {day.hasEvent && <View style={styles.eventDot} />}
                </View>
              ))}
            </View>
                            
            

            {/* Upcoming events */}
            <Text style={styles.sectionLabel}>Upcoming</Text>
            <View style={styles.eventsList}>
              {upcomingEvents.map((ev, index) => (
                <View key={`${ev.month}-${ev.day}-${index}`} style={styles.eventRow}>
                  <View style={styles.eventChip}>
                    <Text style={styles.eventChipDay}>{ev.day}</Text>
                    <Text style={styles.eventChipMonth}>{ev.shortMonth}</Text>
                  </View>
                  <View style={styles.eventTextBlock}>
                    <Text style={styles.eventName}>{ev.name}</Text>
                    <Text style={styles.eventDate}>
                      {ev.day} {HIJRI_MONTHS[ev.month - 1]}
                    </Text>
                  </View>
                  <StarIcon size={16} />
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 10 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 24,
    color: colors.secondary,
  },
  spacer: { width: 44 },

  // Month selector
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  monthNameBlock: {
    alignItems: 'center',
    minWidth: 180,
  },
  monthName: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: colors.secondary,
    textAlign: 'center',
  },
  monthRange: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },

  // Loading / Error
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  loadingText: { marginTop: 8, fontSize: 14, color: colors.textSecondary },
  errorText: { fontSize: 14, color: colors.error, textAlign: 'center', paddingHorizontal: 24 },
  retryButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: alpha(colors.primary, 0.09),
    borderRadius: 10,
  },
  retryText: { color: colors.primary, fontWeight: '600', fontSize: 14 },

  // Weekday row
  weekRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9.5,
    letterSpacing: 0.1,
    color: colors.textMuted,
    fontWeight: '600',
    paddingVertical: 6,
  },

  // Grid
  grid: {
    marginTop: 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    shadowColor: alpha(colors.secondary, 0.05),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  cell: {
    width: `${100 / 7}%`,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  cellDim: {
    opacity: 0.45,
  },
  cellToday: {
    backgroundColor: colors.primary,
    shadowColor: alpha(colors.primary, 0.3),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 4,
  },
  hijriDay: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  hijriDayDim: {
    color: colors.textDisabled,
  },
  hijriDayToday: {
    color: colors.surface,
  },
  gregDay: {
    fontSize: 9.5,
    color: colors.textMuted,
    fontWeight: '500',
  },
  gregDayDim: {
    color: colors.textDisabled,
  },
  gregDayToday: {
    color: alpha(colors.surface, 0.7),
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 1,
  },

  // Upcoming events
  sectionLabel: {
    marginTop: 16,
    marginHorizontal: 2,
    marginBottom: 8,
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },
  eventsList: {
    gap: 10,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  eventChip: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eventChipDay: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  eventChipMonth: {
    fontSize: 8.5,
    letterSpacing: 0.06,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventTextBlock: {
    flex: 1,
    marginRight: 4,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  eventDate: {
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '400',
    marginTop: 2,
  },
});