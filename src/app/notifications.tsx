/**
 * Notifications Screen
 *
 * Coming soon placeholder for notification features.
 * Route: /notifications
 */

import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';

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

// ============================================
// ILLUSTRATION
// ============================================

function NotificationIllustration() {
  return (
    <Svg width={200} height={170} viewBox="0 0 200 170" fill="none">
      {/* Background circle */}
      <Circle cx={100} cy={85} r={70} fill={alpha(colors.primary, 0.05)} />
      <Circle
        cx={100}
        cy={85}
        r={70}
        stroke={alpha(colors.primary, 0.1)}
        strokeWidth={1.5}
      />

      {/* Geometric pattern */}
      <G stroke={alpha(colors.primary, 0.16)} strokeWidth={1.5}>
        <Rect x={66} y={51} width={68} height={68} rx={9} />
        <Rect
          x={66}
          y={51}
          width={68}
          height={68}
          rx={9}
          transform="rotate(45 100 85)"
        />
      </G>

      {/* Bell */}
      <Path
        d="M100 48c-13 0-20 9.8-20 22.6v12l-6 9.4h52l-6-9.4v-12C120 57.8 113 48 100 48Z"
        fill="#FFFFFF"
        stroke={colors.primary}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d="M93.5 94a6.5 6.5 0 0 0 13 0"
        stroke={colors.primary}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Gold accent circle */}
      <Circle cx={118} cy={52} r={6} fill={colors.accent} />

      {/* Sparkles */}
      <Path
        d="M152 40l2.2 5.8 5.8 2.2-5.8 2.2-2.2 5.8-2.2-5.8-5.8-2.2 5.8-2.2Z"
        fill={alpha(colors.accent, 0.9)}
      />
      <Path
        d="M46 46l1.6 4.2 4.2 1.6-4.2 1.6-1.6 4.2-1.6-4.2-4.2-1.6 4.2-1.6Z"
        fill={alpha(colors.accent, 0.6)}
      />
    </Svg>
  );
}

// ============================================
// FEATURE CHIPS
// ============================================

const COMING_FEATURES = [
  'Prayer reminders',
  'Adhan alerts',
  'Verse of the Day',
  'Dhikr streaks',
];

function FeatureChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [notified, setNotified] = useState(true); // Start as "done" per mockup

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
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <BackIcon />
          </Pressable>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Center content */}
        <View style={styles.centerContent}>
          <NotificationIllustration />

          <Text style={styles.heading}>Coming Soon</Text>

          <Text style={styles.subtitle}>
            Timely prayer reminders, adhan alerts and gentle nudges are on their
            way — in shaa Allah, in a future update.
          </Text>

          {/* Feature chips */}
          <View style={styles.chipsRow}>
            {COMING_FEATURES.map((feature) => (
              <FeatureChip key={feature} label={feature} />
            ))}
          </View>

          {/* CTA button */}
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              styles.ctaButtonDone,
            styles.ctaButtonPressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.ctaText, notified && styles.ctaTextDone]}>
              {/* {notified ? '✓ We\'ll let you know' : 'Notify Me'} */}
              Go Back
            </Text>
          </Pressable>

          {/* Explore link */}
          {/* <Pressable
            style={({ pressed }) => [
              styles.exploreButton,
              pressed && styles.exploreButtonPressed,
            ]}
            onPress={() => router.push('/features')}
          >
            <Text style={styles.exploreText}>Explore Features</Text>
          </Pressable> */}

          {/* Version hint */}
          <Text style={styles.versionHint}>Arriving in v1.1</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: colors.secondary,
  },
  headerSpacer: {
    width: 44,
  },

  // Center content
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  heading: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 24,
    letterSpacing: -0.01,
    color: colors.secondary,
    marginTop: 18,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 14 * 1.6,
    color: '#52616F',
    textAlign: 'center',
    maxWidth: 280,
  },

  // Chips
  chipsRow: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    height: 32,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: alpha(colors.primary, 0.07),
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  // CTA button
  ctaButton: {
    marginTop: 26,
    width: '100%',
    maxWidth: 300,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: alpha(colors.primary, 0.28),
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  ctaButtonDone: {
    backgroundColor: alpha(colors.primary, 0.12),
    shadowColor: 'transparent',
    shadowRadius: 0,
    elevation: 0,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 15,
    color: '#FFFFFF',
  },
  ctaTextDone: {
    color: colors.primary,
  },

  // Explore link
  exploreButton: {
    marginTop: 14,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreButtonPressed: {
    opacity: 0.7,
  },
  exploreText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.primary,
  },

  // Version hint
  versionHint: {
    marginTop: 'auto',
    marginBottom: 8,
    fontSize: 11,
    color: colors.textDisabled,
  },
});