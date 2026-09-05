/**
 * AyahReader — Ayah-by-Ayah mode
 * Supports both Surah context and Juz context.
 * Supports scrollToAyah to jump to a specific ayah on mount (e.g. from bookmarks).
*/

import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { ViewToken } from 'react-native';
import { useRef, useCallback, useEffect, useMemo } from 'react';
import { colors } from '../../constants/theme';
import { SurahDetail, Ayah } from '../../types/quran';
import {
  GoldOrnament,
  NavigationFooter,
  AyahItem,
} from './ReaderShared';

interface AyahReaderProps {
  isJuzContext: boolean;
  surah: SurahDetail | null;
  juzAyahs: Ayah[];
  selectedAyah: number;
  setSelectedAyah: (n: number) => void;
  showTranslation: boolean;
  showTafsir: boolean;
  showArabic: boolean;
  targetSurah: number;
  goToPrevSurah: () => void;
  goToNextSurah: () => void;
  goToPrevJuz: () => void;
  goToNextJuz: () => void;
  onVisibleAyahChanged?: (ayah: Ayah) => void;
  topInset: number;
  bottomInset: number;
  arabicFontSize: number;
  translationFontSize: number;
  showToolbar: boolean;
  onAyahPress?: (ayah: Ayah) => void;
  scrollToAyah?: number | null;
  language?: string | null;
}

export function AyahReader({
  isJuzContext,
  surah,
  juzAyahs,
  selectedAyah,
  setSelectedAyah,
  showTranslation,
  showTafsir,
  showArabic,
  targetSurah,
  goToPrevSurah,
  goToNextSurah,
  goToPrevJuz,
  goToNextJuz,
  onVisibleAyahChanged,
  topInset,
  bottomInset,
  arabicFontSize,
  translationFontSize,
  showToolbar,
  onAyahPress,
  scrollToAyah,
  language
}: AyahReaderProps) {
  const ayahs = isJuzContext ? juzAyahs : surah?.ayahs || [];
  const firstSurahNumber = isJuzContext ? juzAyahs[0]?.surahNumber : targetSurah;

  // ── Find target index ──────────────────────────────────
  const scrollTargetIndex = useMemo(() => {
    if (scrollToAyah == null || ayahs.length === 0) return null;
    let idx = ayahs.findIndex((a) => a.number === scrollToAyah);
    if (idx === -1) {
      idx = ayahs.findIndex((a) => a.numberInSurah === scrollToAyah);
    }
    return idx >= 0 ? idx : null;
  }, [scrollToAyah, ayahs]);

  // ── Scroll-to-ayah ────────────────────────────────────
  const flatListRef = useRef<FlatList>(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    // ── DEBUG: remove these 4 logs after fixing ──
    console.log('[SCROLL] scrollToAyah:', scrollToAyah, '| type:', typeof scrollToAyah);
    console.log('[SCROLL] ayahs.length:', ayahs.length);
    console.log('[SCROLL] scrollTargetIndex:', scrollTargetIndex);
    console.log('[SCROLL] hasScrolled:', hasScrolled.current);
    // ── END DEBUG ──

    if (scrollToAyah == null) return;
    if (ayahs.length === 0) return;
    if (hasScrolled.current) return;
    if (scrollTargetIndex == null) return;

    hasScrolled.current = true;
    const index = scrollTargetIndex;
    const targetGlobalNumber = ayahs[index].number;

    // ── Web: DOM scrollIntoView ──
    if (Platform.OS === 'web') {
      const timer = setTimeout(() => {
        const id = `ayah-${targetGlobalNumber}`;
        const el = document.getElementById(id);
        console.log('[SCROLL] web looking for:', id, '| found:', !!el);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    // ── Native: two-phase FlatList scroll ──
    const avgHeight = showTranslation ? (showTafsir ? 280 : 180) : 80;
    const roughOffset = Math.max(0, index * avgHeight - 200);

    console.log('[SCROLL] native phase 1 — offset:', roughOffset);
    flatListRef.current?.scrollToOffset({
      offset: roughOffset,
      animated: false,
    });

    setSelectedAyah(ayahs[index].numberInSurah);
    const timer = setTimeout(() => {
      try {
        console.log('[SCROLL] native phase 2 — scrollToIndex:', index);
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      } catch {
        console.log('[SCROLL] native phase 2 failed — offset fallback');
        flatListRef.current?.scrollToOffset({
          offset: index * avgHeight,
          animated: true,
        });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [scrollToAyah, ayahs.length, scrollTargetIndex, showTranslation, showTafsir]);
  // ── End scroll-to-ayah ────────────────────────────────

  const renderItem = useCallback(
    ({ item, index }: { item: Ayah; index: number }) => {
      const prev = index > 0 ? ayahs[index - 1] : null;
      const showSurahHeader =
        isJuzContext && prev && item.surahNumber !== prev.surahNumber;
      return (
        <View
          nativeID={`ayah-${item.number}`}
          style={{
            // scrollMarginTop: topInset + (showToolbar ? 140 : 70) + 20,
          }}
          
        >
          <AyahItem
            ayah={item}
            isSelected={
              selectedAyah === item.numberInSurah &&
              (!isJuzContext || item.surahNumber === firstSurahNumber)
            }
            onPress={() => {
              setSelectedAyah(item.numberInSurah);
              onAyahPress?.(item);
            }}
            showSurahHeader={
              showSurahHeader || (isJuzContext && index === 0)
            }
            showTranslation={showTranslation}
            showTafsir={showTafsir}
            showArabic={showArabic}
            arabicFontSize={arabicFontSize}
            translationFontSize={translationFontSize}
            language={language}
          />
        </View>
      );
    },
    [
      ayahs, isJuzContext, firstSurahNumber, selectedAyah, setSelectedAyah,
      showTranslation, showTafsir, showArabic, arabicFontSize,
      translationFontSize, onAyahPress, topInset, showToolbar,
    ],
  );

 // Replace the old viewabilityConfig + onViewableItemsChanged with:

const viewabilityConfig = useRef({
  itemVisiblePercentThreshold: 50,   // must be at least 20% visible to count
  minimumViewTime: 200,
});


const onViewableItemsChanged = useRef(
  ({ viewableItems }: { viewableItems: ViewToken<Ayah>[] }) => {
    if (!viewableItems.length || !onVisibleAyahChanged) return;
    onVisibleAyahChanged(viewableItems[0].item);
  },
);







  const ListHeader = useCallback(() => {
    if (isJuzContext || !surah) return null;
    return (
      <View style={styles.surahHeader}>
        <Text style={styles.surahArabic}>{surah.arabicName}</Text>
        <Text style={styles.surahEnglish}>{surah.englishName}</Text>
        <Text style={styles.surahMeta}>
          {surah.revelationType} · {surah.ayahCount} Ayahs
        </Text>
        {targetSurah !== 9 && targetSurah !== 1 && (
          <Text style={styles.bismillah}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
        )}
        <GoldOrnament />
      </View>
    );
  }, [isJuzContext, surah, targetSurah]);

  const ListFooter = useCallback(() => {
    if (isJuzContext) {
      return (
        <NavigationFooter
          prevLabel="Previous Juz"
          nextLabel="Next Juz"
          onPrev={goToPrevJuz}
          onNext={goToNextJuz}
          prevDisabled={juzAyahs.length > 0 && juzAyahs[0]?.juz <= 1}
          nextDisabled={juzAyahs.length > 0 && juzAyahs[0]?.juz >= 30}
        />
      );
    }
    return (
      <NavigationFooter
        prevLabel="Previous Surah"
        nextLabel="Next Surah"
        onPrev={goToPrevSurah}
        onNext={goToNextSurah}
        prevDisabled={targetSurah <= 1}
        nextDisabled={targetSurah >= 114}
      />
    );
  }, [
    isJuzContext, juzAyahs, targetSurah,
    goToPrevJuz, goToNextJuz, goToPrevSurah, goToNextSurah,
  ]);

  // When scrollToAyah is set, render enough items to include the target.
  // This ensures scrollToIndex / getElementById can find it.
  const initialRenderCount =
    scrollTargetIndex != null
      ? Math.min(scrollTargetIndex + 10, ayahs.length)
      : 5;

  return (
    <FlatList
      ref={flatListRef}
      data={ayahs}
      keyExtractor={(item) => String(item.number)}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig.current}
      extraData={[selectedAyah, arabicFontSize, translationFontSize]}
      removeClippedSubviews={true}
      maxToRenderPerBatch={scrollTargetIndex != null ? 20 : 5}
      windowSize={scrollTargetIndex != null ? 21 : 5}
      initialNumToRender={initialRenderCount}
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: topInset + (showToolbar ? 140 : 70),
        paddingBottom: bottomInset + 32,
      }}
    />
  );
}

const styles = StyleSheet.create({
  surahHeader: {
    textAlign: 'center',
    marginBottom: 8,
  },
  surahArabic: {
    fontFamily: 'Amiri',
    fontSize: 22,
    color: colors.secondary,
    textAlign: 'center',
  },
  surahEnglish: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 15,
    color: colors.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  surahMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  bismillah: {
    fontFamily: 'Amiri',
    fontSize: 24,
    color: colors.primary,
    marginTop: 16,
    textAlign: 'center',
  },
});