/**
 * About Screen
 *
 * App information, credits, and legal links.
 * Route: /about
 */

import { View, Text, Pressable, ScrollView, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle, G } from 'react-native-svg';
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

function GlobeIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7}>
      <Circle cx={12} cy={12} r={8} />
      <Path d="M4 12h16M12 4c2.5 2.4 3.8 5.2 3.8 8S14.5 17.6 12 20c-2.5-2.4-3.8-5.2-3.8-8S9.5 6.4 12 4Z" />
    </Svg>
  );
}

function MailIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M4 6h16v12H4Z" />
      <Path d="M4 6l8 6 8-6" />
    </Svg>
  );
}

function HeartIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M12 19s-7-4.6-7-9.5C5 6.6 7 5 9.2 5c1.3 0 2.3.6 2.8 1.6C12.5 5.6 13.5 5 14.8 5 17 5 19 6.6 19 9.5c0 4.9-7 9.5-7 9.5Z" />
    </Svg>
  );
}

function ShieldIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M12 3l7 2.6V11c0 4.6-3 7.9-7 9.4-4-1.5-7-4.8-7-9.4V5.6Z" />
    </Svg>
  );
}

function FileTextIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <Path d="M14 3v4h4" />
      <Path d="M8 13h8M8 17h8" />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke={alpha(colors.secondary, 0.35)}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ============================================
// COMPONENTS
// ============================================

function AboutCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
      <ChevronRightIcon />
    </Pressable>
  );
}

// ============================================
// LOGO ILLUSTRATION
// ============================================

function LogoIllustration() {
  return (
    <Svg width={100} height={100} viewBox="0 0 100 100" fill="none">
      {/* Outer circle */}
      <Circle cx={50} cy={50} r={46} fill={alpha(colors.primary, 0.06)} />
      <Circle cx={50} cy={50} r={46} stroke={alpha(colors.primary, 0.15)} strokeWidth={1.5} />

      {/* Inner geometric pattern */}
      <G stroke={alpha(colors.primary, 0.2)} strokeWidth={1.2}>
        <Path d="M50 14l30 18-11 34H31L20 32Z" />
        <Path d="M50 14l-30 18 11 34h38l11-34Z" />
      </G>

      {/* Crescent */}
      <Path
        d="M50 25c-11 0-20 9-20 20s9 20 20 20c-7.7 0-14-8.9-14-20s6.3-20 14-20Z"
        fill={colors.primary}
      />

      {/* Star */}
      <Path
        d="M65 35l2 5.5 5.5 1-4.2 3.8 1.2 5.7-4.7-2.6-4.7 2.6 1.2-5.7-4.2-3.8 5.5-1Z"
        fill={colors.accent}
      />
    </Svg>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

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
          <Text style={styles.title}>About</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* App identity */}
        <View style={styles.identitySection}>
          <LogoIllustration />
          <Text style={styles.appName}>Deen Companion</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>
            Your companion for Quran, Hadith, prayers, and Islamic knowledge.
            Built with love to make Deen easier to access and understand.
          </Text>
        </View>

        {/* Connect */}
        <Text style={styles.sectionHeader}>Connect</Text>
        <AboutCard>
          <LinkRow
            icon={<GlobeIcon />}
            label="Website"
            onPress={() => Linking.openURL('https://deancompanion.app')}
          />
          <View style={styles.divider} />
          <LinkRow
            icon={<MailIcon />}
            label="Contact Us"
            onPress={() => Linking.openURL('mailto:support@deencompanion.app')}
          />
          <View style={styles.divider} />
          <LinkRow
            icon={<HeartIcon />}
            label="Support the Project"
            onPress={() => {}}
          />
        </AboutCard>

        {/* Legal */}
        <Text style={styles.sectionHeader}>Legal</Text>
        <AboutCard>
          <LinkRow
            icon={<ShieldIcon />}
            label="Privacy Policy"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <LinkRow
            icon={<FileTextIcon />}
            label="Terms of Use"
            onPress={() => {}}
          />
        </AboutCard>

        {/* Credits */}
        <Text style={styles.sectionHeader}>Credits</Text>
        <AboutCard>
          <View style={styles.creditsRow}>
            <Text style={styles.creditsLabel}>Quran Text</Text>
            <Text style={styles.creditsValue}>King Fahd Complex</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.creditsRow}>
            <Text style={styles.creditsLabel}>Translations</Text>
            <Text style={styles.creditsValue}>Various scholars</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.creditsRow}>
            <Text style={styles.creditsLabel}>Hadith Data</Text>
            <Text style={styles.creditsValue}>sunnah.com</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.creditsRow}>
            <Text style={styles.creditsLabel}>Prayer Times</Text>
            <Text style={styles.creditsValue}>Aladhan API</Text>
          </View>
        </AboutCard>

        {/* Footer */}
        <Text style={styles.footer}>
          Made with sincerity for the Ummah
        </Text>
        <Text style={styles.footerSub}>
          جَزَاكُمُ اللَّهُ خَيْرًا
        </Text>
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
    gap: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 4,
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
    fontSize: 26,
    letterSpacing: -0.01,
    color: colors.secondary,
  },
  headerSpacer: {
    width: 44,
  },

  // Identity section
  identitySection: {
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 22,
    color: colors.secondary,
    letterSpacing: -0.01,
  },
  version: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // Description card
  descriptionCard: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 14 * 1.65,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Section header
  sectionHeader: {
    marginTop: 20,
    marginHorizontal: 4,
    marginBottom: 8,
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  rowPressed: {
    backgroundColor: alpha(colors.primary, 0.04),
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '500',
    color: colors.secondary,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F4F0E7',
    marginLeft: 62, // 16px padding + 34px icon + 12px gap
  },

  // Credits row
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  creditsLabel: {
    fontSize: 14.5,
    fontWeight: '500',
    color: colors.secondary,
  },
  creditsValue: {
    fontSize: 13.5,
    color: colors.textSecondary,
  },

  // Footer
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footerSub: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: 'Amiri',
    fontSize: 16,
    color: colors.primary,
    paddingBottom: 4,
  },
});