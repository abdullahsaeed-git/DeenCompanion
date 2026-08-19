/**
 * Features Screen
 *
 * A hub showing all available tools and features in Deen Companion.
 * Opens as a stack screen from the Home "More" button.
 *
 * Grid: 2 columns per row.
 */

import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';

// ============================================
// ICONS
// ============================================

function MosqueIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 20v-6c0-3 2.6-4.6 6-7 3.4 2.4 6 4 6 7v6" />
      <Path d="M12 7V4.5" />
      <Path d="M4 20h16" />
      <Path d="M10 20v-3c0-1 .9-1.6 2-2.4 1.1.8 2 1.4 2 2.4v3" />
    </Svg>
  );
}

function CalendarIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={4} y={5.5} width={16} height={14.5} rx={2.5} />
      <Path d="M4 10h16" />
      <Path d="M8.5 3.5v3.5" />
      <Path d="M15.5 3.5v3.5" />
      <Path d="M8.5 14h2" />
      <Path d="M13.5 14h2" />
    </Svg>
  );
}

function QiblaIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
      <Circle cx={12} cy={12} r={8} />
      <Path d="M15.2 8.8l-1.9 4.5-4.5 1.9 1.9-4.5Z" />
    </Svg>
  );
}

function TasbihIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={4.5} r={1.6} fill={colors.primary} />
      <Circle cx={17} cy={6.5} r={1.6} fill={colors.primary} />
      <Circle cx={19} cy={11.5} r={1.6} fill={colors.primary} />
      <Circle cx={7} cy={6.5} r={1.6} fill={colors.primary} />
      <Circle cx={5} cy={11.5} r={1.6} fill={colors.primary} />
      <Circle cx={8} cy={15.5} r={1.6} fill={colors.primary} />
      <Circle cx={16} cy={15.5} r={1.6} fill={colors.primary} />
      <Circle cx={12} cy={18.5} r={2} fill={colors.accent} />
      <Path d="M12 20.5v2" stroke={colors.accent} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function HijriIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <Path d="M16.5 5.2a8 8 0 1 0 4.8 13.1A9 9 0 0 1 16.5 5.2Z" />
      <Path d="M15 9l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1Z" />
    </Svg>
  );
}

function DuaIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M12 19s-7-4.6-7-9.5C5 6.6 7 5 9.2 5c1.3 0 2.3.6 2.8 1.6C12.5 5.6 13.5 5 14.8 5 17 5 19 6.6 19 9.5c0 4.9-7 9.5-7 9.5Z" />
    </Svg>
  );
}

function ZakatIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round">
      <Circle cx={9} cy={9} r={5} />
      <Circle cx={15} cy={15} r={5} />
      <Path d="M7.5 9h3" />
      <Path d="M13.5 15h3" />
    </Svg>
  );
}

function VideoIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
      <Rect x={3.5} y={6} width={17} height={12} rx={3} />
      <Path d="M10.5 9.5v5l4.5-2.5Z" fill={colors.primary} stroke="none" />
    </Svg>
  );
}

function NamesIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M12 3.5l2.2 4.9 5.3.6-3.9 3.6 1 5.2-4.6-2.6-4.6 2.6 1-5.2-3.9-3.6 5.3-.6Z" />
    </Svg>
  );
}

// ============================================
// DATA
// ============================================

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ size?: number }>;
  route?: string;
}

const FEATURES: FeatureItem[] = [
  { id: 'prayer-times', title: 'Prayer Times', subtitle: 'Daily salah', icon: MosqueIcon, route: '/(tabs)/prayer' },
  { id: 'prayer-calendar', title: 'Prayer Calendar', subtitle: 'Monthly view', icon: CalendarIcon, route: '/prayer-calendar' },
  { id: 'qibla', title: 'Qibla Finder', subtitle: 'Face Makkah', icon: QiblaIcon, route: 'qibla-compass' },
  { id: 'tasbih', title: 'Tasbih', subtitle: 'Dhikr counter', icon: TasbihIcon, route: '/tasbih' },
 { id: 'hijri', title: 'Islamic Calendar', subtitle: 'Hijri dates', icon: HijriIcon, route: '/islamic-calendar' },
  { id: 'duas', title: 'Duas', subtitle: 'Supplications', icon: DuaIcon, route: '/dua-collection' },
 { id: 'zakat', title: 'Zakat Calculator', subtitle: '2.5% due', icon: ZakatIcon, route: '/zakat-calculator' },
//   { id: 'videos', title: 'Videos', subtitle: 'Lessons', icon: VideoIcon },
  { id: 'names', title: '99 Names', subtitle: 'Asma ul-Husna', icon: NamesIcon, route: '/names-of-allah'  },
];

// ============================================
// MAIN SCREEN
// ============================================

export default function FeaturesScreen() {
  const insets = useSafeAreaInsets();

  function handlePress(feature: FeatureItem) {
    if (feature.route) {
      router.push(feature.route);
    }
  }

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
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path d="M12.5 4.5 7 10l5.5 5.5" stroke={colors.secondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Features</Text>
            <Text style={styles.subtitle}>Everything Deen Companion offers</Text>
          </View>
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>All Features</Text>

        {/* Grid — 2 columns */}
        <View style={styles.grid}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Pressable
                key={feature.id}
                style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
                onPress={() => handlePress(feature)}
              >
                <View style={styles.iconContainer}>
                  <Icon />
                </View>
                <Text style={styles.tileTitle} numberOfLines={1}>
                  {feature.title}
                </Text>
                <Text style={styles.tileSubtitle} numberOfLines={1}>
                  {feature.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Hint */}
        <Text style={styles.hint}>More tools on the way, in shaa Allah</Text>
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
    paddingHorizontal: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 26,
    letterSpacing: -0.01,
    color: colors.secondary,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionLabel: {
    marginTop: 4,
    marginHorizontal: 2,
    marginBottom: -6,
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
    height: 118,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  tilePressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: colors.pressedBg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.secondary,
    lineHeight: 12.5 * 1.2,
  },
  tileSubtitle: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  hint: {
    marginTop: 'auto',
    textAlign: 'center',
    fontSize: 11.5,
    color: colors.textDisabled,
    paddingVertical: 8,
  },
});