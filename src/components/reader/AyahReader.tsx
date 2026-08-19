/**
 * AyahReader — Ayah-by-Ayah mode
 * Supports both Surah context and Juz context.
 */

import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRef, useCallback } from 'react';
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
}: AyahReaderProps) {
  const ayahs = isJuzContext ? juzAyahs : surah?.ayahs || [];
  const firstSurahNumber = isJuzContext ? juzAyahs[0]?.surahNumber : targetSurah;

  const renderItem = useCallback(
    ({ item, index }: { item: Ayah; index: number }) => {
      const prev = index > 0 ? ayahs[index - 1] : null;
      const showSurahHeader = isJuzContext && prev && item.surahNumber !== prev.surahNumber;
      return (
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
          showSurahHeader={showSurahHeader || (isJuzContext && index === 0)}
          showTranslation={showTranslation}
          showTafsir={showTafsir}
          showArabic={showArabic}
          arabicFontSize={arabicFontSize}
          translationFontSize={translationFontSize}
        />
      );
    },
    [ayahs, isJuzContext, firstSurahNumber, selectedAyah, setSelectedAyah, showTranslation, showTafsir, showArabic, arabicFontSize, translationFontSize, onAyahPress]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 10,
    minimumViewTime: 200,
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ item: Ayah }> }) => {
      if (viewableItems.length > 0 && onVisibleAyahChanged) {
        onVisibleAyahChanged(viewableItems[0].item);
      }
    }
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
          <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
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
  }, [isJuzContext, juzAyahs, targetSurah, goToPrevJuz, goToNextJuz, goToPrevSurah, goToNextSurah]);

  return (
    <FlatList
      data={ayahs}
      keyExtractor={(item) => String(item.number)}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig.current}
      extraData={[selectedAyah, arabicFontSize, translationFontSize]}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={5}
      initialNumToRender={5}
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