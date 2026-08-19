/**
 * Hadith Reader Screen
 *
 * Displays the full detail of a single hadith.
 * Route: /hadith-reader?collectionId={id}&hadithNumber={n}
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
// import * as Clipboard from 'expo-clipboard';
import Svg, { Path } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';
import { Hadith } from '../types/hadith';
import { hadithService } from '../services/hadithService';
import { bookmarkService } from '../services/bookmarkService';
import { GradeBadge } from '../components/hadith/GradeBadge';
import { HadithNumberBadge } from '../components/hadith/HadithNumberBadge';
import { HadithSettingsSheet } from '../components/hadith/HadithSettingsSheet';

// ============================================
// ICONS
// ============================================

function SettingsIcon({ size = 19 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </Svg>
  );
}

function GoldOrnament() {
  return (
    <View style={styles.ornament}>
      <View style={styles.ornamentLine} />
      <View style={styles.ornamentDiamond} />
      <View style={styles.ornamentLine} />
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function HadithReaderScreen() {
  const insets = useSafeAreaInsets();
  const { collectionId, hadithNumber } = useLocalSearchParams();
  const appCollectionId = (collectionId as string) || 'bukhari';
  const hadithNum = parseInt((hadithNumber as string) || '1', 10);

  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [lastHadithNumber, setLastHadithNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [arabicFontSize, setArabicFontSize] = useState(20);
  const [translationFontSize, setTranslationFontSize] = useState(14);

  const isAtStart = hadithNum <= 1;
  const isAtEnd = lastHadithNumber !== null && hadithNum >= lastHadithNumber;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      hadithService.getHadith(appCollectionId, hadithNum),
      hadithService.getCollection(appCollectionId),
    ])
      .then(async ([hadithData, collectionData]) => {
        if (cancelled) return;
        setHadith(hadithData);
        if (collectionData) {
          setLastHadithNumber(collectionData.hadithCount);
        }
        const bookmarked = await bookmarkService.isHadithBookmarked(hadithData.id);
        if (!cancelled) {
          setIsBookmarked(bookmarked);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load hadith');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [appCollectionId, hadithNum]);

  function handleRetry() {
    setLoading(true);
    setError(null);
    Promise.all([
      hadithService.getHadith(appCollectionId, hadithNum),
      hadithService.getCollection(appCollectionId),
    ])
      .then(async ([hadithData, collectionData]) => {
        setHadith(hadithData);
        if (collectionData) {
          setLastHadithNumber(collectionData.hadithCount);
        }
        const bookmarked = await bookmarkService.isHadithBookmarked(hadithData.id);
        setIsBookmarked(bookmarked);
      })
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }

  // async function handleCopy() {
  //   if (!hadith) return;
  //   const textToCopy = hadith.translation || hadith.arabicText || '';
  //   if (!textToCopy) return;
  //   await Clipboard.setStringAsync(textToCopy);
  //   setCopied(true);
  //   setTimeout(() => setCopied(false), 1500);
  // }
async function handleCopy() {
  if (!hadith) return;
  const textToCopy = hadith.translation || hadith.arabicText || '';
  if (!textToCopy) return;
  try {
    const Clipboard = require('expo-clipboard');
    await Clipboard.setStringAsync(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  } catch {
    // Clipboard not available in Expo Go
  }
}
  async function handleBookmark() {
    if (!hadith) return;
    const newState = await bookmarkService.toggleHadith(hadith);
    setIsBookmarked(newState);
  }

  function handlePrev() {
    if (isAtStart) return;
    router.replace({
      pathname: '/hadith-reader',
      params: { collectionId: appCollectionId, hadithNumber: String(hadithNum - 1) },
    });
  }

  function handleNext() {
    if (isAtEnd) return;
    router.replace({
      pathname: '/hadith-reader',
      params: { collectionId: appCollectionId, hadithNumber: String(hadithNum + 1) },
    });
  }

  // ---------- Loading state ----------
  if (loading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading hadith…</Text>
      </View>
    );
  }

  // ---------- Error state ----------
  if (error) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // ---------- Not found state ----------
  if (!hadith) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.errorText}>Hadith not found</Text>
      </View>
    );
  }

  // ---------- Main render ----------
  return (
    <View style={styles.screen}>
      {/* Sticky header */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.headerBtn} onPress={() => router.back()}>
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
              d="M12.5 4.5 7 10l5.5 5.5"
              stroke={colors.secondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {hadith.bookName || 'Hadith'}
          </Text>
          <Text style={styles.headerSubtitle}>{hadith.reference}</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable style={styles.headerBtn} onPress={() => setSettingsVisible(true)}>
            <SettingsIcon />
          </Pressable>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 70,
          paddingBottom: insets.bottom + 96,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaRow}>
          <HadithNumberBadge number={hadith.numberInBook} prefix="Hadith " size="md" />
          <GradeBadge grade={hadith.displayGrade} />
        </View>

        {hadith.narrator ? (
          <View style={styles.narratorRow}>
            <Text style={styles.narratorText}>Narrated by {hadith.narrator}</Text>
          </View>
        ) : null}

        <View style={styles.badgeRow}>
          {hadith.bookName ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{hadith.bookName}</Text>
            </View>
          ) : null}
        </View>

        {hadith.arabicText ? (
          <Text style={[styles.arabicText, { fontSize: arabicFontSize, lineHeight: arabicFontSize * 2.05 }]}>
            {hadith.arabicText}
          </Text>
        ) : (
          <Text style={styles.noArabicText}>Arabic text not available for this hadith.</Text>
        )}

        <GoldOrnament />

        <Text style={styles.translationLabel}>Translation</Text>
        {hadith.translation ? (
          <Text style={[styles.translation, { fontSize: translationFontSize, lineHeight: translationFontSize * 1.7 }]}>
            &ldquo;{hadith.translation}&rdquo;
          </Text>
        ) : (
          <Text style={styles.noTranslation}>Translation not available.</Text>
        )}

        <Text style={styles.reference}>{hadith.reference}</Text>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={[styles.navBtn, isAtStart && styles.navBtnDisabled]}
          onPress={handlePrev}
          disabled={isAtStart}
        >
          <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
            <Path
              d="M12.5 4.5 7 10l5.5 5.5"
              stroke={isAtStart ? colors.iconGray : colors.secondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={[styles.navBtnText, isAtStart && styles.navBtnTextDisabled]}>
            Previous
          </Text>
        </Pressable>

        <View style={styles.navCenter}>
          <Text style={styles.navCenterText}>#{hadith.hadithNumber}</Text>
        </View>

        <Pressable
          style={[styles.navBtn, isAtEnd && styles.navBtnDisabled]}
          onPress={handleNext}
          disabled={isAtEnd}
        >
          <Text style={[styles.navBtnText, isAtEnd && styles.navBtnTextDisabled]}>
            Next
          </Text>
          <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
            <Path
              d="M7.5 4.5 13 10l-5.5 5.5"
              stroke={isAtEnd ? colors.iconGray : colors.secondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </View>

      {/* Settings sheet */}
      <HadithSettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        arabicFontSize={arabicFontSize}
        setArabicFontSize={setArabicFontSize}
        translationFontSize={translationFontSize}
        setTranslationFontSize={setTranslationFontSize}
        isBookmarked={isBookmarked}
        onCopy={handleCopy}
        copied={copied}
        onToggleBookmark={handleBookmark}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  loadingText: { marginTop: 8, fontSize: 14, color: colors.textSecondary },
  errorText: { fontSize: 14, color: colors.error, textAlign: 'center', paddingHorizontal: 24 },
  retryButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: alpha(colors.primary, 0.09),
    borderRadius: 10,
  },
  retryText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingBottom: 4,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  headerBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerTitleBlock: { flex: 1, alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 16, color: colors.secondary },
  headerSubtitle: { fontSize: 11.5, color: colors.textSecondary, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scrollView: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  narratorRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: alpha(colors.primary, 0.05),
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.16),
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  narratorText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  badgeRow: { marginTop: 12, flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: {
    backgroundColor: alpha(colors.primary, 0.08),
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.15),
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  arabicText: {
    marginTop: 18,
    fontFamily: 'Amiri',
    color: colors.secondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  noArabicText: { marginTop: 18, fontSize: 14, color: colors.textMuted, fontStyle: 'italic', textAlign: 'center' },
  ornament: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 16 },
  ornamentLine: { flex: 1, height: 1, backgroundColor: colors.divider },
  ornamentDiamond: { width: 4, height: 4, backgroundColor: colors.accent, transform: [{ rotate: '45deg' }], borderRadius: 1 },
  translationLabel: {
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },
  translation: { marginTop: 6, color: colors.textSecondary },
  noTranslation: { marginTop: 6, fontSize: 14, color: colors.textMuted, fontStyle: 'italic' },
  reference: { marginTop: 10, fontSize: 11.5, color: colors.textMuted },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: alpha(colors.secondary, 0.06),
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
    zIndex: 10,
  },
  navBtn: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, backgroundColor: 'transparent', borderWidth: 0 },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontWeight: '600', fontSize: 13, color: colors.secondary },
  navBtnTextDisabled: { color: colors.iconGray },
  navCenter: { flex: 1, alignItems: 'center' },
  navCenterText: {
    backgroundColor: alpha(colors.primary, 0.08),
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 11,
  },
});