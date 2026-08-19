/**
 * Prayer Screen (Tab)
 *
 * Real prayer times from Aladhan API.
 * - Live countdown timer (updates every 60s)
 * - Dynamic next prayer detection
 * - Real Hijri & Gregorian dates
 * - Notification toggles (local state, initialized from settings)
 * - Header gear icon navigates to Prayer Settings
 * - Bottom actions: Monthly Calendar, Qibla
 *
 * SETTINGS INTEGRATION:
 * - Loads saved prayer settings from AsyncStorage on mount
 * - Reloads settings when screen regains focus (after visiting Settings)
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
import { router, useFocusEffect } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { PrayerTime } from '../../types/prayer';
import { prayerService, computePrayerStates, PrayerApiResult } from '../../services/prayerService';
import { settingsService, PrayerSettings } from '../../services/settingsService';
import { NextPrayerCard } from '../../components/prayer/NextPrayerCard';
import { PrayerTimeline } from '../../components/prayer/PrayerTimeline';
import { CurrentPrayerCard } from '../../components/prayer/CurrentPrayerCard';

/** Gear / Settings icon */
function GearIcon({ size = 20, color = '#102A43' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Svg>
  );
}

/** Format current time in a given timezone, fallback to device time */
function formatCityTime(timezone?: string | null): string {
  if (timezone) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  }
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}


function truncateLocation(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '…';
}

export default function PrayerScreen() {
  const insets = useSafeAreaInsets();

  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [apiResult, setApiResult] = useState<PrayerApiResult | null>(null);
  const [nextPrayerId, setNextPrayerId] = useState('');
  const [prevPrayerId, setPrevPrayerId] = useState('');
  const [countdown, setCountdown] = useState('--h --m');
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<PrayerSettings | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  // Load settings on mount
  useEffect(() => {
    settingsService.loadPrayerSettings().then(setSettings);
  }, []);

  // Reload settings when screen regains focus
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      settingsService.loadPrayerSettings().then((loaded) => {
        if (cancelled) return;
        setSettings((prev) => {
          if (!prev) return loaded;
          if (JSON.stringify(prev) === JSON.stringify(loaded)) return prev;
          return loaded;
        });
      });
      return () => { cancelled = true; };
    }, [])
  );

  // Fetch prayer times
  const loadPrayers = useCallback(async () => {
    if (!settings) return;
    setLoading(true);
    setError(null);
    try {
      const data = await prayerService.getTimingsByCity(
        settings.city,
        settings.country,
        settings.method
      );
      setApiResult(data);
      const initialPrayers = data.times.map((p) => ({
        ...p,
        notificationOn: settings.notificationsEnabled,
      }));
      setPrayers(initialPrayers);

      // Compute initial state using city timezone
      const states = computePrayerStates(initialPrayers, data.timezone);
      setNextPrayerId(states.nextPrayerId);
      setPrevPrayerId(states.prevPrayerId);
      setCountdown(states.countdown);
      setProgressPercent(states.progressPercent);
      setCurrentTime(formatCityTime(data.timezone));
    } catch (err: any) {
      setError(err.message || 'Failed to load prayer times');
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    if (!settings) return;
    loadPrayers();
  }, [settings, loadPrayers]);

  // Live countdown timer + current time — updates every 60 seconds
  useEffect(() => {
    if (prayers.length === 0) return;

    const tick = () => {
      const states = computePrayerStates(prayers, apiResult?.timezone);
      setNextPrayerId(states.nextPrayerId);
      setPrevPrayerId(states.prevPrayerId);
      setCountdown(states.countdown);
      setProgressPercent(states.progressPercent);
      setCurrentTime(formatCityTime(apiResult?.timezone));
    };

    tick(); // immediate
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [prayers, apiResult?.timezone]);

  // Toggle notification bell
  function handleToggleNotification(id: string) {
    setPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, notificationOn: !p.notificationOn } : p))
    );
  }

  // Derived: find next and prev prayer objects for the card
  const nextPrayer = prayers.find((p) => p.id === nextPrayerId);
  const prevPrayer = prayers.find((p) => p.id === prevPrayerId);

  function handleOpenCalendar() {
    router.push('/prayer-calendar');
  }

  function handleOpenQibla() {
    const lat = apiResult?.latitude ?? 0;
    const long = apiResult?.longitude ?? 0;
    const locationName = apiResult?.locationName || (settings ? `${settings.city}, ${settings.country}` : 'Unknown Location');
    router.push({
      pathname: '/qibla-compass',
      params: {
        lat: String(lat),
        long: String(long),
        locationName,
      },
    });
  }

  function handleOpenSettings() {
    router.push('/prayer-settings');
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 88 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
           <View style={styles.locationRow}>
  <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 2.5c-3.3 0-5.5 2.4-5.5 5.5 0 4 5.5 9.5 5.5 9.5s5.5-5.5 5.5-9.5c0-3.1-2.2-5.5-5.5-5.5Z"
      stroke="#0F6B50"
      strokeWidth={1.8}
    />
    <Circle cx={10} cy={8} r={2} fill="#0F6B50" />
  </Svg>
  <Text style={styles.locationName}>
    {truncateLocation(
      apiResult?.locationName || (settings ? `${settings.city}, ${settings.country}` : 'Loading…'),
      14
    )}
  </Text>
  <Pressable style={({ pressed }) => [styles.changeButton, pressed && styles.changeButtonPressed]}>
    <Text style={styles.changeButtonText} onPress={handleOpenSettings}>Change</Text>
  </Pressable>
</View>

            <Pressable
              style={({ pressed }) => [styles.gearButton, pressed && styles.gearButtonPressed]}
              onPress={handleOpenSettings}
            >
              <GearIcon />
            </Pressable>
          </View>
          <Text style={styles.date}>
            {apiResult ? `${apiResult.gregorianDate} · ${apiResult.hijriDate}` : 'Loading date…'}
          </Text>
        </View>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0F6B50" />
            <Text style={styles.loadingText}>Loading prayer times…</Text>
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadPrayers}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && nextPrayer && prevPrayer && (
          <>
            <CurrentPrayerCard
              currentPrayerName={prevPrayer.name}
              currentPrayerTime={prevPrayer.time}
              currentTime={currentTime}
              nextPrayerName={nextPrayer.name}
              nextPrayerTime={nextPrayer.time}
              remaining={countdown}
              progressPercent={progressPercent}
              locationName={apiResult?.locationName || ''}
            />

            <PrayerTimeline
              prayers={prayers}
              nextPrayerId={nextPrayerId}
              prevPrayerId={prevPrayerId}
              onToggleNotification={handleToggleNotification}
            />
          </>
        )}

              {/* Bottom action: Monthly Calendar */}
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          onPress={handleOpenCalendar}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
            <Rect x={4} y={5.5} width={16} height={14.5} rx={2.5} />
            <Path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5" />
          </Svg>
          <Text style={styles.actionText}>Monthly Calendar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F6F0' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, gap: 14 },
  header: { gap: 5 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationName: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 17, color: '#102A43' },
  changeButton: {
    backgroundColor: 'rgba(15, 107, 80, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 9,
  },
  changeButtonPressed: { backgroundColor: 'rgba(15, 107, 80, 0.14)' },
  changeButtonText: { fontFamily: 'Inter-Medium', color: '#0F6B50', fontSize: 11.5 },
  gearButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(16, 42, 67, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  gearButtonPressed: { backgroundColor: '#FBF9F3', transform: [{ scale: 0.94 }] },
  date: { fontSize: 12.5, color: '#52616F' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
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
  // actionsGrid: { flexDirection: 'row', gap: 10 },
   actionButton: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: 'rgba(16, 42, 67, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  actionButtonPressed: { transform: [{ scale: 0.97 }], backgroundColor: '#FBF9F3' },
  actionText: { fontFamily: 'Inter-Medium', fontSize: 11.5, color: '#102A43' },
});