/**
 * About Screen
 *
 * App information, features, status, credits, and legal links.
 * Route: /about
 */

import { View, Text, Pressable, ScrollView, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle, G, Defs, Rect, Mask } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';
import React from 'react';
import { BackIcon, CheckIcon, ChevronRightIcon, InfoIcon, LogoIllustration } from '@/components/Icons';

// ============================================
// COMPONENTS
// ============================================

function AboutCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function LinkRow({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
      <ChevronRightIcon size= {14} />
    </Pressable>
  );
}

function FeatureItem({ label }: { label: string }) {
  return (
    <View style={styles.featureItem}>
      <CheckIcon size = {14} color={colors.primary}/>
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

function CreditRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.creditsRow}>
      <Text style={styles.creditsLabel}>{label}</Text>
      <Text style={styles.creditsValue}>{value}</Text>
    </View>
  );
}

// ============================================
// LOGO ILLUSTRATION
// ============================================



// ============================================
// DATA
// ============================================

const COMPLETED_FEATURES = [
  'Quran browsing & reading',
  'Ayah & Mushaf modes',
  'Translations & Tafsir UI',
  'Quran bookmarks & restoration',
  'Hadith collection navigation',
  'Hadith reader & bookmarks',
  'Library with categories',
  'Prayer times & calendar',
  'Islamic (Hijri) calendar',
  'Duas collection',
  'Tasbih counter',
  '99 Names of Allah',
  'Zakat calculator',
  'Reading settings',
  'Bookmarks across modules',
];

const COMING_SOON = [
  'Quran & Hadith search',
  'Tafsir data integration',
  'In-app book reader',
];

// ============================================
// MAIN SCREEN
// ============================================

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop:  8, paddingBottom: insets.bottom + 34 }]}
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

        {/* Identity */}
        <View style={styles.identitySection}>
          <LogoIllustration />
          <Text style={styles.appName}>Deen Companion</Text>
          <Text style={styles.tagline}>Explore Islam from its sources</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>
            A modern Islamic knowledge app that brings together Quran, Hadith, Islamic books, prayers, and essential resources — designed to make Deen easier to access, read, and understand.
          </Text>
        </View>

        {/* What's Inside */}
        <Text style={styles.sectionHeader}>What's Inside</Text>
        <AboutCard>
          {COMPLETED_FEATURES.map((f) => (
            <React.Fragment key={f}>
              <FeatureItem label={f} />
              <View style={styles.divider} />
            </React.Fragment>
          ))}
          {COMING_SOON.map((f) => (
            <React.Fragment key={f}>
              <View style={styles.featureItem}>
                
                <InfoIcon size={14} color={colors.textMuted}/>
                <Text style={[styles.featureText, styles.featureTextMuted]}>{f}</Text>
              </View>
              <View style={styles.divider} />
            </React.Fragment>
          ))}
        </AboutCard>

        {/* Data Sources */}
        <Text style={styles.sectionHeader}>Data Sources</Text>
        <AboutCard>
          <CreditRow label="Quran" value="alQuran Cloud API" />
          <View style={styles.divider} />
          <CreditRow label="Hadith Data" value="Fawaz Ahmed Hadith API" />
          <View style={styles.divider} />
          <CreditRow label="Prayer Times" value="Aladhan API" />
        </AboutCard>

        {/* Connect */}
        {/* <Text style={styles.sectionHeader}>Connect</Text>
        <AboutCard>
          <LinkRow icon={<GlobeIcon />} label="Website" onPress={() => Linking.openURL('https://deencompanion.app')} />
          <View style={styles.divider} />
          <LinkRow icon={<MailIcon />} label="Contact Us" onPress={() => Linking.openURL('mailto:support@deencompanion.app')} />
          <View style={styles.divider} />
          <LinkRow icon={<HeartIcon />} label="Support the Project" onPress={() => {}} />
        </AboutCard> */}

      

        {/* Footer */}
        <Text style={styles.footer}>Made with sincerity for the Ummah</Text>
        <Text style={styles.footerSub}>جَزَاكُمُ اللَّهُ خَيْرًا</Text>
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 0 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 4 },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 20, letterSpacing: -0.01, color: colors.secondary },
  headerSpacer: { width: 44 },

  // Identity
  identitySection: { marginTop: 20, alignItems: 'center', gap: 6 },
  appName: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 22, color: colors.secondary, letterSpacing: -0.01 },
  tagline: { fontSize: 14, color: colors.primary, fontWeight: '500', fontStyle: 'italic' },
  version: { fontSize: 13, color: colors.textMuted, fontWeight: '500', marginTop: 2 },

  // Description
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
  description: { fontSize: 14, lineHeight: 14 * 1.65, color: colors.textSecondary, textAlign: 'center' },

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

  // Feature item
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  featureText: { fontSize: 13.5, fontWeight: '500', color: colors.secondary, flex: 1 },
  featureTextMuted: { color: colors.textMuted },

  // Credits
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  creditsLabel: { fontSize: 14.5, fontWeight: '500', color: colors.secondary },
  creditsValue: { fontSize: 13.5, color: colors.textSecondary },

  // Row
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  rowPressed: { backgroundColor: alpha(colors.primary, 0.04) },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: { flex: 1, fontSize: 14.5, fontWeight: '500', color: colors.secondary },

  // Divider
  divider: { height: 1, backgroundColor: '#F4F0E7', marginLeft: 62 },

  // Footer
  footer: { marginTop: 28, textAlign: 'center', fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  footerSub: { marginTop: 6, textAlign: 'center', fontFamily: 'Amiri', fontSize: 16, color: colors.primary, paddingBottom: 4 },
});