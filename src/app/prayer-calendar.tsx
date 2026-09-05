/**
 * Prayer Calendar Screen
 *
 * Monthly prayer times table using Aladhan /calendarByCity API.
 * - Month navigation (prev / next)
 * - Dynamic location & method chips from saved settings
 * - Table with Date, Fajr, Dhuhr, Asr, Maghrib, Isha
 * - Friday highlighting (green date)
 * - Today highlighting (green background + left border)
 *
 * SETTINGS INTEGRATION:
 * - Loads city, country, and method from AsyncStorage
 * - School is hardcoded to Shafi'i (0) via prayerService
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
import Svg, { Circle, Path } from 'react-native-svg';
import { CalendarDay } from '../types/prayer';
import { prayerService, formatShortAmPm, stripTimezone, getTodayStringInTimezone } from '../services/prayerService';
import { settingsService, PrayerSettings } from '../services/settingsService';
import { BackIcon, GearIcon, InfoIcon, NextIcon, PinIcon, PrevIcon } from '@/components/Icons';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_SHORT: Record<string, string> = {
  Monday: 'MON', Tuesday: 'TUE', Wednesday: 'WED', Thursday: 'THU',
  Friday: 'FRI', Saturday: 'SAT', Sunday: 'SUN',
};

/** Map method IDs to short display names */
const METHOD_NAME_MAP: Record<number, string> = {
  1: 'Karachi',
  2: 'ISNA',
  3: 'Muslim World League',
  4: 'Umm al-Qura',
  5: 'Egyptian',
  7: 'Tehran',
  8: 'Gulf',
  9: 'Kuwait',
  10: 'Qatar',
  11: 'Singapore',
  13: 'Turkey',
  15: 'Moonsighting',
  17: 'JAKIM',
  20: 'Indonesia',
  21: 'Morocco',
  22: 'Jordan',
};

// function BackIcon() {
//   return (
//     <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
//       <Path d="M12.5 4.5 7 10l5.5 5.5" stroke="#102A43" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
//     </Svg>
//   );
// }

// function PrevIcon() {
//   return (
//     <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
//       <Path d="M14.5 6 9 12l5.5 6" stroke="#102A43" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
//     </Svg>
//   );
// }

// function NextIcon() {
//   return (
//     <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
//       <Path d="M9.5 6 15 12l-5.5 6" stroke="#102A43" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
//     </Svg>
//   );
// }

// function ExportIcon() {
//   return (
//     <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#102A43" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
//       <Path d="M12 14V4M8.8 7.2 12 4l3.2 3.2" />
//       <Path d="M5 11v6.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V11" />
//     </Svg>
//   );
// }

// function PinIcon({ size = 12 }: { size?: number }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
//       <Path d="M10 2.5c-3.3 0-5.5 2.4-5.5 5.5 0 4 5.5 9.5 5.5 9.5s5.5-5.5 5.5-9.5c0-3.1-2.2-5.5-5.5-5.5Z" stroke="#0F6B50" strokeWidth={1.8} />
//       <Circle cx={10} cy={8} r={2} fill="#0F6B50" />
//     </Svg>
//   );
// }

// /** Gear / Settings icon */
// function GearIcon({ size = 20, color = '#102A43' }: { size?: number; color?: string }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
//       <Circle cx="12" cy="12" r="3" />
//       <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
//     </Svg>
//   );
// }


export default function PrayerCalendarScreen() {
  const insets = useSafeAreaInsets();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState(now.getFullYear());
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<PrayerSettings | null>(null);
  const [timezone, setTimezone] = useState<string | null>(null);

  // Load saved settings on mount
  useEffect(() => {
    let cancelled = false;
    settingsService.loadPrayerSettings().then((loaded) => {
      if (!cancelled) setSettings(loaded);
    });
    return () => { cancelled = true; };
  }, []);

  const loadCalendar = useCallback(async () => {
    if (!settings) return;
    setLoading(true);
    setError(null);
    try {
      console.log("loading calender");
      const data = await prayerService.getCalendarByCity(
        settings.city,
        settings.country,
        settings.method,
        month,
        year
      );
      setDays(data.days);
      setTimezone(data.timezone);
    } catch (err: any) {
      setError(err.message || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [month, year, settings]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  function goToPrevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  // Use city's timezone for today detection; fallback to device local
  const todayStr = timezone
    ? getTodayStringInTimezone(timezone)
    : (() => {
        const d = now;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      })();

  function isToday(day: CalendarDay): boolean {
    const [d, m, y] = day.date.gregorian.date.split('-');
    const dateStr = `${y}-${m}-${d}`;
    return dateStr === todayStr;
  }

  function isFriday(day: CalendarDay): boolean {
    return day.date.gregorian.weekday.en === 'Friday';
  }

  const prayerKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const locationLabel = settings ? `${settings.city}, ${settings.country}` : 'Loading…';
  const methodLabel = settings ? (METHOD_NAME_MAP[settings.method] || `Method ${settings.method}`) : 'Loading…';

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop:  8, paddingBottom: insets.bottom + 20 }]}>
        {/* Header */}
        <View style={styles.chead}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <BackIcon />
          </Pressable>
          <Text style={styles.title}>Prayer Calendar</Text>
          <Pressable style={styles.iconButton} onPress={() => {router.push('/prayer-settings');}}>
            <GearIcon  />
          </Pressable>
        </View>

        {/* Month selector */}
        <View style={styles.msel}>
          <Pressable style={styles.iconButton} onPress={goToPrevMonth}>
            <PrevIcon />
          </Pressable>
          <Text style={styles.monthLabel}>{MONTH_NAMES[month - 1]} {year}</Text>
          <Pressable style={styles.iconButton} onPress={goToNextMonth}>
            <NextIcon />
          </Pressable>
        </View>


        {/* Chips */}
        <View style={styles.ctrls}>
          <View style={styles.cchip}>
            <PinIcon size={12} />
            <Text style={styles.cchipText}>
              <Text style={styles.cchipMuted}>Location · </Text>
              <Text style={styles.cchipBold}>{locationLabel}</Text>
            </Text>
          </View>
          {/* <View style={styles.cchip}>
            <Text style={styles.cchipText}>
              <Text style={styles.cchipMuted}>Method · </Text>
              <Text style={styles.cchipBold}>{methodLabel}</Text>
            </Text>
          </View> */}
        </View>

        {/* Table */}
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0F6B50" />
            <Text style={styles.loadingText}>Loading calendar…</Text>
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadCalendar}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && (
          <ScrollView
            style={styles.twrap}
            contentContainerStyle={styles.twrapContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header row */}
            <View style={styles.thead}>
              <Text style={[styles.th, styles.thFirst]}>Date</Text>
              {prayerKeys.map((k) => (
                <Text key={k} style={styles.th}>{k}</Text>
              ))}
            </View>

            {/* Data rows */}
            {days.map((day, index) => {
              const dayIsToday = isToday(day);
              const dayIsFriday = isFriday(day);
              const weekday = WEEKDAY_SHORT[day.date.gregorian.weekday.en] || day.date.gregorian.weekday.en.slice(0, 3).toUpperCase();

              return (
                <View
                  key={index}
                  style={[
                    styles.trow,
                    dayIsToday && styles.trowToday,
                  ]}
                >
                  <View style={[styles.td, styles.tdFirst, dayIsToday && styles.tdFirstToday]}>
                    <Text style={[styles.tdDay, dayIsFriday && styles.tdDayFri, dayIsToday && styles.tdDayToday]}>
                      {parseInt(day.date.gregorian.day, 10)}
                    </Text>
                    <Text style={[styles.tdWeekday, dayIsToday && styles.tdWeekdayToday]}>{weekday}</Text>
                  </View>
                  {prayerKeys.map((k) => (
                    <Text key={k} style={[styles.tdTime, dayIsToday && styles.tdTimeToday]}>
                      {formatShortAmPm(stripTimezone(day.timings[k]))}
                    </Text>
                  ))}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F6F0' },
  content: { flex: 1, paddingHorizontal: 16, gap: 10 },

  // Header
  chead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  title: { flex: 1, fontFamily: 'Poppins', fontWeight: '600', fontSize: 20, color: '#102A43' },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Month selector
  msel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  monthLabel: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 16, color: '#102A43', minWidth: 160, textAlign: 'center' },

  // Chips
  ctrls: { flexDirection: 'row', gap: 8, overflow: 'hidden' },
  cchip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E4D8',
  },
  cchipText: { fontSize: 12, fontWeight: '600', color: '#33475C' },
  cchipMuted: { color: '#33475C' },
  cchipBold: { color: '#0F6B50' },

  // Table wrapper
  twrap: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: 'rgba(16, 42, 67, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  twrapContent: { paddingBottom: 12 },

  // Table header
  thead: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEAE0',
    backgroundColor: '#fff',
  },
  th: {
    flex: 1,
    fontSize: 9.5,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    color: '#7A828C',
    fontWeight: '600',
    textAlign: 'center',
  },
  thFirst: { flex: 1.2, textAlign: 'left', paddingLeft: 16 },

  // Table row
  trow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 4,
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F0E7',
  },
  trowToday: { backgroundColor: 'rgba(15, 107, 80, 0.06)' },

  // Date cell
  td: { flex: 1, textAlign: 'center' },
  tdFirst: { flex: 1.2, paddingLeft: 16 },
  tdFirstToday: {
    borderLeftWidth: 3,
    borderLeftColor: '#0F6B50',
    paddingLeft: 13,
  },
  tdDay: { fontSize: 13, fontWeight: '700', color: '#102A43' },
  tdDayFri: { color: '#0F6B50' },
  tdDayToday: { color: '#0F6B50' },
  tdWeekday: { fontSize: 8.5, letterSpacing: 0.08, color: '#98A2AE', fontWeight: '600', marginTop: 1 },
  tdWeekdayToday: { color: '#0F6B50' },

  // Time cell
  tdTime: { flex: 1, fontSize: 12, fontWeight: '500', color: '#33475C', textAlign: 'center' },
  tdTimeToday: { fontWeight: '700', color: '#0F6B50' },

  // Loading / Error
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 40 },
  loadingText: { marginTop: 8, fontSize: 14, color: '#52616F' },
  errorText: { fontSize: 14, color: '#E12D39', textAlign: 'center', paddingHorizontal: 24 },
  retryButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(15, 107, 80, 0.09)',
    borderRadius: 10,
  },
  retryText: { color: '#0F6B50', fontWeight: '600', fontSize: 14 },
});