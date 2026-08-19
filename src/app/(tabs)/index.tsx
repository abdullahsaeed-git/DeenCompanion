/**
 * Home Screen (Tab)
 *
 * Real prayer data in the hero card.
 * Composes all home dashboard sections in a scrollable view.
 *
 * REFRESH LOGIC (consistent with Prayer tab):
 * - Fetch from Aladhan API once on mount
 * - Recompute countdown every 60s using cached prayer data (no API call)
 * - Auto-refresh at 00:05 city-local time to get new day's prayer times
 * - Reloads settings on focus (after visiting Prayer Settings)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { colors, alpha } from "../../constants/theme";
import { PrayerTime } from "../../types/prayer";
import {
  prayerService,
  computePrayerStates,
  getCityLocalNow,
} from "../../services/prayerService";
import {
  settingsService,
  PrayerSettings,
} from "../../services/settingsService";
import { CurrentPrayerCard } from "@/components/prayer/CurrentPrayerCard";
import { QuickActions } from "../../components/home/QuickActions";
import { ContinueReading } from "../../components/home/ContinueReading";
import { VerseOfTheDay } from "../../components/home/VerseOfTheDay";
import {
  homeService,
  VerseOfTheDayData,
  HadithOfTheDayData,
  ReadingProgressData,
} from "../../services/homeService";
import { HadithOfTheDay } from "../../components/home/HadithOfTheDay";

interface FormattedPrayerData {
  nextPrayerName: string;
  nextPrayerTime: string;
  prevPrayerName: string;
  prevPrayerTime: string;
  countdown: string;
  progressPercent: number;
  locationName: string;
  hijriDate: string;
  gregorianDate: string;
}

/** Format current time in a given timezone, fallback to device time */
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<PrayerSettings | null>(null);

  // Prayer data
  const [prayers, setPrayers] = useState<PrayerTime[]>([]);
  const [prayerData, setPrayerData] = useState<FormattedPrayerData | null>(
    null,
  );
  const [loadingPrayers, setLoadingPrayers] = useState(true);
  const [timezone, setTimezone] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const prayerDataRef = useRef<FormattedPrayerData | null>(null);
  prayerDataRef.current = prayerData;

  // Home content data
  const [votd, setVotd] = useState<VerseOfTheDayData | null>(null);
  const [hotd, setHotd] = useState<HadithOfTheDayData | null>(null);
  const [readingProgress, setReadingProgress] =
    useState<ReadingProgressData | null>(null);
  const [loadingHome, setLoadingHome] = useState(true);
  const [refreshingVotd, setRefreshingVotd] = useState(false);
  const [refreshingHotd, setRefreshingHotd] = useState(false);

  // Load settings on mount
  useEffect(() => {
    settingsService.loadPrayerSettings().then(setSettings);
  }, []);

  // Reload settings when screen regains focus (after visiting Prayer Settings)
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
      return () => {
        cancelled = true;
      };
    }, []),
  );

  // Fetch prayer times
  const loadPrayers = useCallback(async () => {
    setLoadingPrayers(true);
    try {
      const city = settings?.city || "Wah";
      const country = settings?.country || "Pakistan";
      const method = settings?.method || 1;

      const data = await prayerService.getTimingsByCity(city, country, method);
      setPrayers(data.times);
      setTimezone(data.timezone);

      const states = computePrayerStates(data.times, data.timezone);
      const next = data.times.find((p) => p.id === states.nextPrayerId);
      const prev = data.times.find((p) => p.id === states.prevPrayerId);

      if (next && prev) {
        const newData = {
          nextPrayerName: next.name,
          nextPrayerTime: next.time,
          prevPrayerName: prev.name,
          prevPrayerTime: prev.time,
          countdown: states.countdown,
          progressPercent: states.progressPercent,
          locationName: data.locationName,
          hijriDate: data.hijriDate,
          gregorianDate: data.gregorianDate,
        };
        setPrayerData(newData);
        prayerDataRef.current = newData;
        setCurrentTime(formatCityTime(data.timezone));
      }
    } catch {
      // silently fail
    } finally {
      setLoadingPrayers(false);
    }
  }, [settings]);

  useEffect(() => {
    if (!settings) return;
    loadPrayers();
  }, [settings, loadPrayers]);

  // Recompute countdown every 60s
  useEffect(() => {
    if (prayers.length === 0) return;
    const tick = () => {
      const states = computePrayerStates(prayers, timezone);
      const next = prayers.find((p) => p.id === states.nextPrayerId);
      const prev = prayers.find((p) => p.id === states.prevPrayerId);
      const current = prayerDataRef.current;
      if (next && prev && current) {
        setPrayerData({
          ...current,
          nextPrayerName: next.name,
          nextPrayerTime: next.time,
          prevPrayerName: prev.name,
          prevPrayerTime: prev.time,
          countdown: states.countdown,
          progressPercent: states.progressPercent,
        });
      }
      setCurrentTime(formatCityTime(timezone));
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [prayers, timezone]);

  // Auto-refresh at 00:05 in city timezone
  useEffect(() => {
    if (prayers.length === 0 || !timezone) return;

    const cityNow = getCityLocalNow(timezone);
    const minutesUntilMidnight =
      24 * 60 - (cityNow.hours * 60 + cityNow.minutes);
    const msUntilCityMidnight =
      minutesUntilMidnight * 60 * 1000 + 5 * 60 * 1000;

    const timer = setTimeout(() => loadPrayers(), msUntilCityMidnight);
    return () => clearTimeout(timer);
  }, [prayers, timezone, loadPrayers]);

  // Load home content (VOTD, HOTD)
  useEffect(() => {
    let cancelled = false;
    setLoadingHome(true);

    Promise.all([
      homeService.getVerseOfTheDay(),
      homeService.getHadithOfTheDay(),
    ]).then(([v, h]) => {
      if (cancelled) return;
      setVotd(v);
      setHotd(h);
      setLoadingHome(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh Continue Reading whenever Home tab is focused
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      homeService.getContinueReading().then((r) => {
        if (!cancelled) setReadingProgress(r);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  // Default reading progress if none saved
  const continueReading = readingProgress || {
    surahNumber: 1,
    surahName: "Surah Al-Fatiha",
    ayahNumber: 1,
    progressPercent: 0,
  };

  async function handleRefreshVotd() {
    setRefreshingVotd(true);
    const verse = await homeService.getRandomVerse();
    if (verse) setVotd(verse);
    setRefreshingVotd(false);
  }

  async function handleRefreshHotd() {
    setRefreshingHotd(true);
    const hadith = await homeService.getRandomHadith();
    if (hadith) setHotd(hadith);
    setRefreshingHotd(false);
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.greeting}>
            <Text style={styles.greetingSalam}>Assalamu Alaikum</Text>
            <Text style={styles.greetingName}>Abdullah</Text>
          </View>
          <View style={styles.dates}>
            <Text style={styles.hijriDate}>
              {prayerData?.hijriDate || "Loading…"}
            </Text>
            <Text style={styles.gregDate}>
              {prayerData?.gregorianDate || "Loading…"}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={({ pressed }) => [
              styles.bell,
              pressed && styles.bellPressed,
            ]}
            onPress={() => router.push("/notifications")}
          >
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path
                d="M10 2.6c-3.3 0-5.1 2.5-5.1 5.8v3.1l-1.5 2.4h13.2l-1.5-2.4V8.4c0-3.3-1.8-5.8-5.1-5.8Z"
                stroke={colors.secondary}
                strokeWidth={1.7}
                strokeLinejoin="round"
              />
              <Path
                d="M8.3 16.4a1.8 1.8 0 0 0 3.4 0"
                stroke={colors.secondary}
                strokeWidth={1.7}
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.bellDot} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.avatar,
              pressed && styles.avatarPressed,
            ]}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.avatarText}>A</Text>
          </Pressable>
        </View>
      </View>

      <>
        {/* Prayer Hero Card */}
        {loadingPrayers && (
          <View style={styles.heroLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.heroLoadingText}>Loading prayer times…</Text>
          </View>
        )}
        <Pressable onPress={() => router.push("/(tabs)/prayer")}>
          {!loadingPrayers && prayerData && (
            <CurrentPrayerCard
              currentPrayerName={prayerData.prevPrayerName}
              currentPrayerTime={prayerData.prevPrayerTime}
              currentTime={currentTime}
              nextPrayerName={prayerData.nextPrayerName}
              nextPrayerTime={prayerData.nextPrayerTime}
              remaining={prayerData.countdown}
              progressPercent={prayerData.progressPercent}
              locationName={prayerData.locationName}
            />
          )}
        </Pressable>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <View style={styles.quickActionsHeader}>
            <Text style={styles.quickActionsLabel}>Quick Actions</Text>
            <Pressable
              style={({ pressed }) => [
                styles.moreButton,
                pressed && styles.moreButtonPressed,
              ]}
              onPress={() => router.push("/features")}
            >
              <Text style={styles.moreText}>More</Text>
              <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M7.5 4.5 13 10l-5.5 5.5"
                  stroke={colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
          </View>
          <QuickActions />
        </View>

        {/* Continue Reading */}
        <ContinueReading
          surahNumber={continueReading.surahNumber}
          surahName={continueReading.surahName}
          ayahNumber={continueReading.ayahNumber}
          progressPercent={continueReading.progressPercent}
        />

        {/* Verse of the Day */}
        {votd && (
          <VerseOfTheDay
            arabic={votd.arabic}
            translation={votd.translation}
            reference={votd.reference}
            surahNumber={votd.surahNumber}
            ayahNumber={votd.ayahNumber}
            onRefresh={handleRefreshVotd}
            refreshing={refreshingVotd}
          />
        )}

        {/* Hadith of the Day */}
        {hotd && (
          <HadithOfTheDay
            narrator={hotd.narrator}
            translation={hotd.translation}
            reference={hotd.reference}
            grade={hotd.grade}
            collectionId={hotd.collectionId}
            hadithNumber={hotd.hadithNumber}
            onRefresh={handleRefreshHotd}
            refreshing={refreshingHotd}
          />
        )}
      </>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { backgroundColor: colors.background },
  content: { paddingHorizontal: 20, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, marginRight: 12 },
  greeting: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 19,
    color: colors.secondary,
    maxWidth: 220,
    lineHeight: 19 * 1.3,
    display: "flex",
    flexDirection: "column",
  },
  greetingSalam: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: "Poppins",
    fontWeight: "600",
  },
  greetingName: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 19,
    color: colors.secondary,
  },
  dates: {
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    columnGap: 15,
    alignItems: "center",
  },
  hijriDate: {
    fontFamily: "Poppins",
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: "600",
  },
  dateSeparator: { fontSize: 12.5, color: alpha(colors.primary, 0.9) },
  gregDate: { fontSize: 12.5, color: colors.textSecondary },
  headerRight: { flexDirection: "row", gap: 8, alignItems: "center" },
  bell: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  bellPressed: { transform: [{ scale: 0.94 }] },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: alpha(colors.primary, 0.1),
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.2),
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: alpha(colors.primary, 0.16),
  },
  avatarText: { color: colors.primary, fontWeight: "600", fontSize: 15 },
  heroLoading: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroLoadingText: { fontSize: 13, color: colors.textSecondary },
  quickActionsSection: { gap: 10 },
  quickActionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  quickActionsLabel: {
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.textMuted,
    fontWeight: "600",
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  moreButtonPressed: {
    opacity: 0.7,
  },
  moreText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.primary,
  },
});