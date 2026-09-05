/**
 * Current Prayer Card — Self-Contained Component with Shared State
 *
 * OWNERSHIP: This file owns ALL prayer timing data for the entire app.
 * - Fetches from Aladhan API once (shared across every mounted instance)
 * - Manages the 60-second countdown timer
 * - Handles midnight auto-refresh
 * - Exposes data via usePrayerData() for parent screens that need dates etc.
 *
 * No other file should fetch, compute, or tick prayer timings.
 *
 * Usage:
 *   <CurrentPrayerCard />                        // read-only display
 *   <CurrentPrayerCard onPress={() => ...} />     // tappable card
 *
 * Access data in parent:
 *   const { hijriDate, gregorianDate } = usePrayerDates();
 *   const { prayers, nextPrayerId, ... } = usePrayerData();
 */

import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { PrayerTime } from "../../types/prayer";
import {
  prayerService,
  computePrayerStates,
  getCityLocalNow,
  PrayerApiResult,
} from "../../services/prayerService";
import { settingsService, PrayerSettings } from "../../services/settingsService";

// ─── Types ────────────────────────────────────────────────────────────

interface PrayerStoreState {
  prayers: PrayerTime[];
  apiResult: PrayerApiResult | null;
  nextPrayerId: string;
  prevPrayerId: string;
  countdown: string;
  progressPercent: number;
  currentTime: string;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// ─── Module-Level Singleton Store ─────────────────────────────────────
// All instances of usePrayerData() / CurrentPrayerCard share this state.
// There is only one fetch, one interval, one midnight timer — ever.

let state: PrayerStoreState = {
  prayers: [],
  apiResult: null,
  nextPrayerId: "",
  prevPrayerId: "",
  countdown: "--h --m",
  progressPercent: 0,
  currentTime: "",
  loading: false,
  error: null,
  initialized: false,
};

const listeners = new Set<() => void>();
let tickInterval: ReturnType<typeof setInterval> | null = null;
let midnightTimeout: ReturnType<typeof setTimeout> | null = null;
let isFetching = false;
let lastSettingsJson: string | null = null;
let initStarted = false;

function emitChange() {
  for (const l of listeners) l();
}

function setState(partial: Partial<PrayerStoreState>) {
  state = { ...state, ...partial };
  emitChange();
}

function formatCityTime(timezone?: string | null): string {
  if (timezone) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date());
  }
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Timer Logic ──────────────────────────────────────────────────────

function tick() {
  if (state.prayers.length === 0) return;
  const tz = state.apiResult?.timezone;
  const s = computePrayerStates(state.prayers, tz);
  setState({
    nextPrayerId: s.nextPrayerId,
    prevPrayerId: s.prevPrayerId,
    countdown: s.countdown,
    progressPercent: s.progressPercent,
    currentTime: formatCityTime(tz),
  });
}

function scheduleMidnightRefresh() {
  if (midnightTimeout) clearTimeout(midnightTimeout);
  const tz = state.apiResult?.timezone;
  if (state.prayers.length === 0 || !tz) return;
  const cityNow = getCityLocalNow(tz);
  const minsToMidnight = 24 * 60 - (cityNow.hours * 60 + cityNow.minutes);
  midnightTimeout = setTimeout(
    () => fetchWithCurrentSettings(),
    minsToMidnight * 60_000 + 5 * 60_000,
  );
}

function startTicking() {
  if (tickInterval) return;
  tick();
  tickInterval = setInterval(tick, 60_000);
}

// ─── Fetch Logic ──────────────────────────────────────────────────────

async function fetchWithSettings(settings: PrayerSettings | null) {
  if (isFetching) return;
  isFetching = true;
  setState({ loading: true, error: null });

  try {
    const city = settings?.city || "Wah";
    const country = settings?.country || "Pakistan";
    const method = settings?.method || 1;

    const data = await prayerService.getTimingsByCity(city, country, method);

    const prayers: PrayerTime[] = data.times.map((p) => ({
      ...p,
      notificationOn: settings?.notificationsEnabled ?? true,
    }));

    const s = computePrayerStates(prayers, data.timezone);

    setState({
      prayers,
      apiResult: data,
      nextPrayerId: s.nextPrayerId,
      prevPrayerId: s.prevPrayerId,
      countdown: s.countdown,
      progressPercent: s.progressPercent,
      currentTime: formatCityTime(data.timezone),
      loading: false,
      error: null,
      initialized: true,
    });

    lastSettingsJson = JSON.stringify(settings);
    startTicking();
    scheduleMidnightRefresh();
  } catch (err: any) {
    setState({
      loading: false,
      error: err.message || "Failed to load prayer times",
    });
  } finally {
    isFetching = false;
  }
}

async function fetchWithCurrentSettings() {
  const settings = await settingsService.loadPrayerSettings();
  await fetchWithSettings(settings);
}

// ─── Public Hook ──────────────────────────────────────────────────────

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): PrayerStoreState {
  return state;
}

/**
 * Access the shared prayer data store.
 *
 * - Auto-initializes on first mount (guarded so only one fetch ever fires)
 * - Returns stable refreshOnFocus / retry / toggleNotification callbacks
 * - Safe to call from any number of screens simultaneously
 */
export function usePrayerData() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);

  // Auto-init on first mount across the entire app
  useEffect(() => {
    if (!initStarted) {
      initStarted = true;
      fetchWithCurrentSettings();
    }
  }, []);

  // Re-start ticker if data exists but interval was dropped
  useEffect(() => {
    if (snapshot.prayers.length > 0 && !tickInterval) {
      startTicking();
    }
  }, [snapshot.prayers.length]);

  /** Call in useFocusEffect — only re-fetches if saved settings changed */
  const refreshOnFocus = useCallback(async () => {
    if (isFetching) return;
    const settings = await settingsService.loadPrayerSettings();
    const currentJson = JSON.stringify(settings);
    if (lastSettingsJson === null || lastSettingsJson !== currentJson) {
      await fetchWithSettings(settings);
    }
  }, []);

  /** Force re-fetch (for retry / refresh button) */
  const retry = useCallback(async () => {
    await fetchWithCurrentSettings();
  }, []);

  /** Toggle notification bell on a prayer in the timeline */
  const toggleNotification = useCallback((id: string) => {
    setState({
      prayers: state.prayers.map((p) =>
        p.id === id ? { ...p, notificationOn: !p.notificationOn } : p,
      ),
    });
  }, []);

  return {
    ...snapshot,
    refreshOnFocus,
    retry,
    toggleNotification,
  };
}

/**
 * Lightweight hook for screens that only need dates / location
 * (e.g. the Home header). Subscribes to the same store.
 */
export function usePrayerDates() {
  const { apiResult, loading, initialized } = usePrayerData();
  return {
    hijriDate: apiResult?.hijriDate ?? null,
    gregorianDate: apiResult?.gregorianDate ?? null,
    locationName: apiResult?.locationName ?? null,
    timezone: apiResult?.timezone ?? null,
    loading: loading && !initialized,
  };
}

// ─── Component ────────────────────────────────────────────────────────

interface CurrentPrayerCardProps {
  /** If provided, the entire card becomes tappable */
  onPress?: () => void;
}

export function CurrentPrayerCard({ onPress }: CurrentPrayerCardProps) {
  const {
    prayers,
    nextPrayerId,
    prevPrayerId,
    countdown,
    progressPercent,
    currentTime,
    loading,
    error,
    initialized,
    apiResult,
    retry,
  } = usePrayerData();

  const nextPrayer = prayers.find((p) => p.id === nextPrayerId);
  const prevPrayer = prayers.find((p) => p.id === prevPrayerId);

  // ── Refresh spin animation ──
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef<Animated.CompositeAnimation | null>(null);

  const isRefreshing = loading && initialized;

  function truncateLocation(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

  useEffect(() => {
    if (isRefreshing) {
      spinValue.setValue(0);
      spinAnim.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      );
      spinAnim.current.start();
    } else {
      if (spinAnim.current) {
        spinAnim.current.stop();
        spinAnim.current = null;
      }
      spinValue.setValue(0);
    }
    return () => {
      if (spinAnim.current) {
        spinAnim.current.stop();
        spinAnim.current = null;
      }
    };
  }, [isRefreshing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // ── First-load skeleton ──
  if (loading && !initialized) {
    return (
      <View style={styles.card}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
          <Text style={styles.mutedText}>Loading prayer times…</Text>
        </View>
      </View>
    );
  }

  // ── First-load error ──
  if (error && !initialized) {
    return (
      <View style={styles.card}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── No data yet ──
  if (!nextPrayer || !prevPrayer) return null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && onPress && styles.cardPressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Faint mosque silhouette */}
      <View style={styles.artPosition}>
        <Svg
          width={190}
          height={150}
          viewBox="0 0 190 150"
          fill="none"
          stroke="#fff"
          strokeWidth={1.5}
        >
          <Path d="M45 150 v-42 c0-26 22-38 50-54 28 16 50 28 50 54 v42" />
          <Path d="M95 54 v-14" />
          <Circle cx={95} cy={37} r={3} />
          <Path d="M20 150 v-52" />
          <Path d="M14 98 l6-10 6 10" />
          <Path d="M170 150 v-52" />
          <Path d="M164 98 l6-10 6 10" />
          <Path d="M10 150 h170" />
        </Svg>
      </View>

      {/* Row 1: Label + Location + Refresh */}
      <View style={styles.row1}>
        <Text style={styles.label}>Current Prayer</Text>
        <View style={styles.row1Right}>
          <View style={styles.location}>
            <Svg width={12} height={12} viewBox="0 0 20 20" fill="none">
              <Path
                d="M10 2.5c-3.3 0-5.5 2.4-5.5 5.5 0 4 5.5 9.5 5.5 9.5s5.5-5.5 5.5-9.5c0-3.1-2.2-5.5-5.5-5.5Z"
                stroke="#fff"
                strokeWidth={1.8}
              />
              <Circle cx={10} cy={8} r={2} fill="#fff" />
            </Svg>
            <Text style={styles.locationText}>
              {truncateLocation(apiResult?.locationName || "Loading…", 20)}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.refreshButton,
              pressed && styles.refreshButtonPressed,
              isRefreshing && styles.refreshButtonActive,
            ]}
            onPress={retry}
            disabled={isRefreshing}
            hitSlop={6}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Svg
                width={15}
                height={15}
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <Path d="M21.5 2v6h-6" />
                <Path d="M2.5 22v-6h6" />
                <Path d="M2.5 12.5a10 10 0 0 1 18.2-5.7L21.5 8" />
                <Path d="M21.5 11.5a10 10 0 0 1-18.2 5.7L2.5 16" />
              </Svg>
            </Animated.View>
          </Pressable>
        </View>
      </View>

      {/* Row 2: Prayer name + live time / Remaining */}
      <View style={styles.row2}>
        <View style={styles.leftBlock}>
          <Text style={styles.prayerName}>{prevPrayer.name}</Text>
          <Text style={styles.liveTime}>{currentTime}</Text>
        </View>
        <View style={styles.rightBlock}>
          <Text style={styles.remainingTime}>{countdown}</Text>
          <Text style={styles.remainingLabel}>until {nextPrayer.name}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${progressPercent}%` }]}>
          <View style={styles.trackDot} />
        </View>
      </View>

      {/* Time labels */}
      <View style={styles.trackLabels}>
        <Text style={styles.trackLabelText}>
          {prevPrayer.name} · {prevPrayer.time}
        </Text>
        <Text style={styles.trackLabelText}>
          {nextPrayer.name} · {nextPrayer.time}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0F6B50",
    borderRadius: 20,
    padding: 18,
    paddingBottom: 16,
    shadowColor: "rgba(15, 107, 80, 0.25)",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 14,
    overflow: "hidden",
    minHeight: 180,
  },
  cardPressed: { opacity: 0.95, transform: [{ scale: 0.99 }] },
  artPosition: {
    position: "absolute",
    right: -16,
    bottom: -14,
    opacity: 0.1,
  },

  // Row 1
  row1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row1Right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.14,
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.62)",
    fontWeight: "600",
  },
  location: { flexDirection: "row", gap: 5, alignItems: "center" },
  locationText: { fontSize: 12, color: "rgba(255, 255, 255, 0.78)" },

  // Refresh button
  refreshButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transform: [{ scale: 0.9 }],
  },
  refreshButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },

  // Row 2
  row2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 14,
  },
  leftBlock: { flex: 1, marginRight: 12 },
  prayerName: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 26,
    lineHeight: 30,
    color: "#FFFFFF",
  },
  liveTime: {
    marginTop: 6,
    fontSize: 13.5,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.75)",
  },
  rightBlock: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingBottom: 2,
  },
  remainingTime: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 20,
    lineHeight: 24,
    color: "#FFFFFF",
    textAlign: "right",
  },
  remainingLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.55)",
    textAlign: "right",
    letterSpacing: 0.02,
  },

  // Progress bar
  track: {
    marginTop: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  trackFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: "#D4AF37",
  },
  trackDot: {
    position: "absolute",
    right: -5,
    top: "50%",
    marginTop: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  trackLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  trackLabelText: {
    fontSize: 10.5,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.55)",
  },

  // Loading / Error states inside the card
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    minHeight: 140,
  },
  mutedText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
  },
  retryText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
});