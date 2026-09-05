/**
 * Hadith Chapter Screen
 *
 * Displays all hadiths within a Book (section).
 * Route: /hadith-chapter?collectionId={id}&bookNumber={n}
 *
 * Features:
 * - Display mode toggle: Arabic | Both | Translation
 * - Hadith cards with truncated text (tap to open reader)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';
import { Hadith } from '../types/hadith';
import { hadithService } from '../services/hadithService';
import { HadithHeader } from '../components/hadith/HadithHeader';
import { GradeBadge } from '../components/hadith/GradeBadge';
import { HadithNumberBadge } from '../components/hadith/HadithNumberBadge';
import { settingsService } from '@/services/settingsService';
import { useFontSizes } from '@/hooks/useFontSizes';


type DisplayMode = 'arabic' | 'both' | 'translation';

// ============================================
// SEGMENT TOGGLE
// ============================================

function DisplayToggle({
  mode,
  onChange,
}: {
  mode: DisplayMode;
  onChange: (m: DisplayMode) => void;
}) {
  const segments: { key: DisplayMode; label: string }[] = [
    { key: 'arabic', label: 'Arabic' },
    { key: 'both', label: 'Both' },
    { key: 'translation', label: 'Translation' },
  ];

  return (
    <View style={styles.segContainer}>
      {segments.map((seg) => {
        const active = mode === seg.key;
        return (
          <Pressable
            key={seg.key}
            style={[styles.segButton, active && styles.segButtonActive]}
            onPress={() => onChange(seg.key)}
          >
            <Text style={[styles.segText, active && styles.segTextActive]}>
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ============================================
// HADITH CARD (memoized)
// ============================================

const HadithCard = React.memo(function HadithCard({
  hadith,
  mode,
  onPress,
}: {
  hadith: Hadith;
  mode: DisplayMode;
  onPress: () => void;
}) {

  const { arabic: arabicFontSize, translation: translationFontSize, setArabicSize, setTranslationSize } = useFontSizes();

    useFocusEffect(
       useCallback(() => {
         let cancelled = false;
         settingsService.getArabicFontSize().then((ar) => {
           if (cancelled) return;
           setArabicSize(ar);
         });
         settingsService.getTranslationFontSize().then((tr) => {
           if (cancelled) return;
           setTranslationSize(tr);
         });
         return () => { cancelled = true; };
       }, []),
     );
  const showArabic = mode === 'arabic' || mode === 'both';
  const showTranslation = mode === 'translation' || mode === 'both';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Meta row */}
      <View style={styles.cardHeader}>
        <HadithNumberBadge number={hadith.numberInBook} prefix="#" size="sm" />
        <Text style={styles.narrator} numberOfLines={1}>
          {hadith.narrator || ' '}
        </Text>
        <GradeBadge grade={hadith.displayGrade} size="sm" />
        <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
          <Path
            d="M7.5 4.5 13 10l-5.5 5.5"
            stroke={alpha(colors.secondary, 0.35)}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Arabic text */}
      {showArabic && hadith.arabicText ? (
        <Text
          style={[styles.arabicText, { fontSize: arabicFontSize, lineHeight: arabicFontSize * 2 , textAlign: "justify"}]}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {hadith.arabicText}
        </Text>
      ) : null}

      {/* Divider — only in Both mode when both texts exist */}
      {showArabic && showTranslation && hadith.arabicText && hadith.translation ? (
        <View style={styles.divider} />
      ) : null}

      {/* Translation */}
      {showTranslation && hadith.translation ? (
        <Text
          style={[styles.translationText, { fontSize: translationFontSize, lineHeight: translationFontSize * 1.65 , textAlign: "justify" }]}
          numberOfLines={4}
          ellipsizeMode="tail"
        >
          {hadith.translation}
        </Text>
      ) : null}
    </Pressable>
  );
});

// ============================================
// MAIN SCREEN
// ============================================

export default function HadithChapterScreen() {
  const insets = useSafeAreaInsets();
  const { collectionId, bookNumber } = useLocalSearchParams();
  const appCollectionId = (collectionId as string) || 'bukhari';
  const appBookNumber = parseInt((bookNumber as string) || '1', 10);

  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [bookName, setBookName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('both');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hadithService.getBookHadiths(appCollectionId, appBookNumber);
      setHadiths(data);
      if (data.length > 0) {
        setBookName(data[0].bookName || `Book ${appBookNumber}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load hadiths');
    } finally {
      setLoading(false);
    }
  }, [appCollectionId, appBookNumber]);

  useEffect(() => {
    load();
  }, [load]);

  const handleHadithPress = useCallback((hadith: Hadith) => {
    router.push({
      pathname: '/hadith-reader',
      params: {
        collectionId: appCollectionId,
        hadithNumber: String(hadith.hadithNumber),
      },
    });
  }, [appCollectionId]);

  const renderItem: ListRenderItem<Hadith> = useCallback(
    ({ item }) => (
      <HadithCard
        hadith={item}
        mode={displayMode}
        onPress={() => handleHadithPress(item)}
      />
    ),
    [displayMode, handleHadithPress]
  );

  const keyExtractor = useCallback((item: Hadith) => item.id, []);

  // ---------- Loading state ----------
  if (loading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading hadiths…</Text>
      </View>
    );
  }

  // ---------- Error state ----------
  if (error) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // ---------- List state ----------
  return (
    <View style={styles.screen}>
      <FlatList
        data={hadiths}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={true}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <View style={{ paddingBottom: 14, gap: 14 }}>
            <HadithHeader
              title={bookName || 'Loading…'}
              subtitle={hadiths.length > 0 ? `${hadiths.length} Hadiths` : ''}
              titleSize={20}
            />
            <DisplayToggle mode={displayMode} onChange={setDisplayMode} />
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hadiths found.</Text>
        }
        ListFooterComponent={
          hadiths.length > 0 ? (
            <Text style={styles.hint}>Tap any hadith to open the full reader</Text>
          ) : null
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop:  8,
          paddingBottom: insets.bottom + 34,
        }}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
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
  emptyText: { textAlign: 'center', paddingVertical: 40, fontSize: 15, color: colors.textSecondary },

  // Toggle
  segContainer: {
    height: 46,
    backgroundColor: alpha(colors.secondary, 0.06),
    borderRadius: 14,
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  segButton: {
    flex: 1,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: alpha(colors.primary, 0.25),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  segText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  segTextActive: {
    color: colors.surface,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: { transform: [{ scale: 0.98 }], backgroundColor: colors.pressedBg },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  narrator: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  arabicText: {
    marginTop: 10,
    fontFamily: 'Amiri',
    fontSize: 19,
    lineHeight: 19 * 2,
    color: colors.secondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  divider: {
    marginVertical: 10,
    height: 1,
    backgroundColor: colors.divider,
  },
  translationText: {
    fontSize: 13.5,
    lineHeight: 13.5 * 1.65,
    color: colors.textSecondary,
  },
  hint: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 11.5,
    color: colors.textDisabled,
  },
});