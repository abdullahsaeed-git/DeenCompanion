/**
 * Zakat Calculator Screen
 *
 * Work in progress — shows a coming-soon state.
 * Route: /zakat-calculator
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';

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

function ZakatIconLarge({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.5} strokeLinecap="round">
      <Circle cx={9} cy={9} r={5} />
      <Circle cx={15} cy={15} r={5} />
      <Path d="M7.5 9h3" />
      <Path d="M13.5 15h3" />
    </Svg>
  );
}

export default function ZakatCalculatorScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 34 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <BackIcon />
          </Pressable>
          <Text style={styles.title}>Zakat Calculator</Text>
          <View style={styles.spacer} />
        </View>

        {/* Center content */}
        <View style={styles.center}>
          <View style={styles.iconWrap}>
            <ZakatIconLarge />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Soon</Text>
            </View>
          </View>

          <Text style={styles.headline}>Coming Soon</Text>
          <Text style={styles.subtitle}>
            The Zakat Calculator is currently in development.
          </Text>
          <Text style={styles.body}>
            We are working to bring you an accurate and easy-to-use Zakat calculation tool based on your assets and liabilities. Check back soon, in shaa Allah.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  backBtn: {
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
    fontSize: 18,
    color: colors.secondary,
  },
  spacer: { width: 44 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 16,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: alpha(colors.primary, 0.08),
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.15),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accent,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.04,
  },
  headline: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 24,
    color: colors.secondary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  body: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
});