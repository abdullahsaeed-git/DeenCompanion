/**
 * Prayer Screen (Tab)
 *
 * All prayer timing data comes from the shared store via usePrayerData().
 * This screen only adds: header, timeline, and calendar button.
 * Settings changes are detected on focus — only refetches if city/method changed.
 */

import { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  CurrentPrayerCard,
  usePrayerData,
} from "../../components/prayer/CurrentPrayerCard";
import { PrayerTimeline } from "../../components/prayer/PrayerTimeline";
import { CalendarIcon, GearIcon, PinIcon } from "@/components/Icons";

function truncateLocation(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export default function PrayerScreen() {
  const insets = useSafeAreaInsets();

  const {
    prayers,
    nextPrayerId,
    prevPrayerId,
    loading,
    error,
    initialized,
    apiResult,
    refreshOnFocus,
    retry,
    toggleNotification,
  } = usePrayerData();

  // Re-check settings on focus — only refetches if city/method changed
  useFocusEffect(
    useCallback(() => {
      refreshOnFocus();
    }, [refreshOnFocus]),
  );

  function handleOpenCalendar() {
    router.push("/prayer-calendar");
  }

  function handleOpenSettings() {
    router.push("/prayer-settings");
  }

  const hasData = initialized && !error && prayers.length > 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 16, paddingBottom: insets.bottom + 88 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.locationRow}>
              <PinIcon size={16} />
              <Text style={styles.locationName}>
                {truncateLocation(apiResult?.locationName || "Loading…", 14)}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.changeButton,
                  pressed && styles.changeButtonPressed,
                ]}
                onPress={handleOpenSettings}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.gearButton,
                pressed && styles.gearButtonPressed,
              ]}
              onPress={handleOpenSettings}
            >
              <GearIcon size={20} />
            </Pressable>
          </View>
          <Text style={styles.date}>
            {apiResult
              ? `${apiResult.gregorianDate} · ${apiResult.hijriDate}`
              : "Loading date…"}
          </Text>
        </View>

        {/* Loading state (full area, only before first successful load) */}
        {loading && !hasData && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#0F6B50" />
            <Text style={styles.loadingText}>Loading prayer times…</Text>
          </View>
        )}

        {/* Error state (full area, only before first successful load) */}
        {error && !hasData && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={retry}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Prayer content */}
        {hasData && (
          <>
            <CurrentPrayerCard />

            <PrayerTimeline
              prayers={prayers}
              nextPrayerId={nextPrayerId}
              prevPrayerId={prevPrayerId}
              onToggleNotification={toggleNotification}
            />
          </>
        )}

        {/* Bottom action: Monthly Calendar */}
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={handleOpenCalendar}
        >
          <CalendarIcon />
          <Text style={styles.actionText}>Monthly Calendar</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8F6F0" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, gap: 14 },
  header: { gap: 5 },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  locationName: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 17,
    color: "#102A43",
  },
  changeButton: {
    backgroundColor: "rgba(15, 107, 80, 0.08)",
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 9,
  },
  changeButtonPressed: {
    backgroundColor: "rgba(15, 107, 80, 0.14)",
  },
  changeButtonText: {
    fontFamily: "Inter-Medium",
    color: "#0F6B50",
    fontSize: 11.5,
  },
  gearButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E4D8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(16, 42, 67, 0.04)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  gearButtonPressed: {
    backgroundColor: "#FBF9F3",
    transform: [{ scale: 0.94 }],
  },
  date: { fontSize: 12.5, color: "#52616F" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
  },
  loadingText: { marginTop: 8, fontSize: 14, color: "#52616F" },
  errorText: {
    fontSize: 14,
    color: "#E12D39",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "rgba(15, 107, 80, 0.09)",
    borderRadius: 10,
  },
  retryText: { color: "#0F6B50", fontWeight: "600", fontSize: 14 },
  actionButton: {
    height: 64,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E4D8",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "rgba(16, 42, 67, 0.04)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: "#FBF9F3",
  },
  actionText: {
    fontFamily: "Inter-Medium",
    fontSize: 11.5,
    color: "#102A43",
  },
});