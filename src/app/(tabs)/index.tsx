/**
 * Home Screen (Tab)
 *
 * Composes the home dashboard. All prayer data is owned by
 * CurrentPrayerCard — this file just reads dates for the header.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, alpha } from "../../constants/theme";
import {
  CurrentPrayerCard,
  usePrayerDates,
} from "@/components/prayer/CurrentPrayerCard";
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
import {
  ChevronRightIcon,
  NotificationsIcon,
  SearchIcon,
  SettingsIcon,
} from "@/components/Icons";
import { currentLang, getLanguage } from "@/services/languageService";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  // Only need dates for the header — no prayer fetching here
  const { hijriDate, gregorianDate } = usePrayerDates();

  // Home content data
  const [votd, setVotd] = useState<VerseOfTheDayData | null>(null);
  const [hotd, setHotd] = useState<HadithOfTheDayData | null>(null);
  const [readingProgress, setReadingProgress] =
    useState<ReadingProgressData | null>(null);
  const [loadingHome, setLoadingHome] = useState(true);
  const [refreshingVotd, setRefreshingVotd] = useState(false);
  const [refreshingHotd, setRefreshingHotd] = useState(false);
  const [currentLangState, setCurrentLangState] = useState(getLanguage());

  // Load home content (VOTD, HOTD)
  // useEffect(() => {
  //   let cancelled = false;
  //   setLoadingHome(true);

  //   Promise.all([
  //     homeService.getVerseOfTheDay(),
  //     homeService.getHadithOfTheDay(),
  //   ]).then(([v, h]) => {
  //     if (cancelled) return;
  //     setVotd(v);
  //     setHotd(h);
  //     setLoadingHome(false);
  //   });

  //   return () => {
  //     cancelled = true;
  //   };
  // }, []);

  const isFirstLoad = useRef(true);
  // setCurrentLangState(getLanguage()); // ← add this line to update state when language changes

  const loadDailyContent = useCallback(() => {
    console.log("[HOME] loadDailyContent called, lang:", getLanguage()); // ← add this
    let cancelled = false;
    if (isFirstLoad.current) setLoadingHome(true);

    Promise.all([
      homeService.getVerseOfTheDay(),
      homeService.getHadithOfTheDay(),
    ]).then(([v, h]) => {
      if (cancelled) return;
      setVotd(v);
      setHotd(h);
      setLoadingHome(false);
      isFirstLoad.current = false;
    });

    return () => {
      cancelled = true;
    };
  }, []);
  let lang = getLanguage();

  // Runs on mount (back navigation → screen remounts)

  useEffect(() => loadDailyContent(), [currentLangState]);

  // Runs on tab focus (tab switch → screen refocuses)
  useFocusEffect(loadDailyContent);

  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = getLanguage();
      if (newLang !== currentLangState) {
        console.log(
          "[HOME] Language changed from",
          currentLangState,
          "to",
          newLang,
        );
        setCurrentLangState(newLang);
        handleRefreshVotd();
        handleRefreshHotd();
      }
    };
    handleLanguageChange(); // Call it once on mount to check for initial language
  }, [getLanguage, currentLangState]);

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

  useEffect(() => {
    // Preload VOTD and HOTD on mount
    handleRefreshVotd();
    handleRefreshHotd();
  }, [currentLang]);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.content,
        { paddingTop: 16, paddingBottom: insets.bottom + 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* <View style={styles.greeting}>
            <Text style={styles.greetingSalam}>Assalamu Alaikum</Text>
            <Text style={styles.greetingName}>Abdullah</Text>
          </View> */}

          <View style={styles.dates}>
            <Text style={styles.gregDate}>{gregorianDate || "Loading…"}</Text>
            <Text style={styles.hijriDate}>{hijriDate || "Loading…"}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            style={({ pressed }) => [
              styles.bell,
              pressed && styles.bellPressed,
            ]}
            onPress={() => router.push("/search")}
          >
            <SearchIcon size={20} color={colors.secondary} />
            {/* <View style={styles.bellDot} /> */}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.settingsButtonPressed,
            ]}
            onPress={() => router.push("/settings")}
          >
            {/* <Text style={styles.avatarText}>A</Text> */}
            <SettingsIcon size={20} color={colors.secondary} />
          </Pressable>
        </View>
      </View>

      

      {/* Prayer Hero Card — fully self-contained, tappable */}
      <CurrentPrayerCard onPress={() => router.push("/(tabs)/prayer")} />

      {/* Quick Actions
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
            <ChevronRightIcon size={14} color={colors.primary} />
          </Pressable>
        </View>
        </View> */}
        <QuickActions />

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
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  gregDate: { fontSize: 13, color: colors.textSecondary, fontFamily: "Poppins" },
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

  settingsButton: {
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
  settingsButtonPressed: {
    transform: [{ scale: 0.94 }],
    // backgroundColor: alpha(colors.primary, 0.16),
  },

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
