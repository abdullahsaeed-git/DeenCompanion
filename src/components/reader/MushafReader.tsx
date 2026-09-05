/**
 * MushafReader — Surah and Juz context, FlatList by page
 *
 * Pages are tappable — tapping opens a page action sheet.
 * Supports scrollToPage prop to jump to a specific page on mount.
 * Uses estimated getItemLayout for scrollToIndex to work with variable-height cards.
 */

import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRef, useEffect, useCallback } from 'react';
import { colors } from '../../constants/theme';
import { SurahDetail, Ayah } from '../../types/quran';
import { PageActionInfo } from '../../types/bookmark';
import {
  NavigationFooter,
  groupAyahsIntoPages,
  cleanText,
  SurahChangeHeader,
  PageGroup,
} from './ReaderShared';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MushafReaderProps {
  isJuzContext: boolean;
  juzAyahs: Ayah[];
  surah: SurahDetail | null;
  targetSurah: number;
  targetJuz: number;
  goToPrevSurah: () => void;
  goToNextSurah: () => void;
  goToPrevJuz: () => void;
  goToNextJuz: () => void;
  arabicFontSize: number;
  scrollToPage?: number | null;
  onPagePress?: (info: PageActionInfo) => void;
}

/**
 * Estimate page card height based on font size.
 * A typical Quran page has ~15 lines of Arabic text.
 * Card overhead: padding (28) + header (33) + folio (30) + marginBottom (16) = 107
 * Text: ~15 lines × (fontSize × 2 lineHeight)
 */
function estimatePageHeight(fontSize: number): number {
  return 107 + fontSize * 30;
}

function MushafPageCard({
  page,
  arabicFontSize,
  onPress,
}: {
  page: PageGroup;
  arabicFontSize: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.pageCard]}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderText}>
            Juz {page.ayahs[0]?.juz || 1}
          </Text>
          <Text style={styles.pageHeaderText}>Page {page.pageNumber}</Text>
        </View>

        {page.isNewSurah && page.surahName && (
          <SurahChangeHeader name={page.surahName} />
        )}

        {page.ayahs[0]?.showBismillah  && (
          <Text
            style={[
              styles.bismillah,
              { fontSize: arabicFontSize, lineHeight: arabicFontSize * 1.7 },
            ]}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
        )}

        <Text
          style={[
            styles.mushafText,
            { fontSize: arabicFontSize, lineHeight: arabicFontSize * 2 },
          ]}
        >
          {page.ayahs.map((ayah) => (
            <Text key={ayah.number}>
              {cleanText(ayah.text, ayah.numberInSurah)}
              <Text
                style={[
                  styles.ayahMarker,
                  {
                    fontSize: arabicFontSize * 0.64,
                    lineHeight: arabicFontSize * 1.9,
                  },
                ]}
              >
                {' '}
                ۝{ayah.numberInSurah}{' '}
              </Text>
            </Text>
          ))}
        </Text>

        <View style={styles.folioRow}>
          <Text style={styles.folioText}>— {page.pageNumber} —</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function MushafReader({
  isJuzContext,
  juzAyahs,
  surah,
  targetSurah,
  targetJuz,
  goToPrevSurah,
  goToNextSurah,
  goToPrevJuz,
  goToNextJuz,
  arabicFontSize,
  scrollToPage,
  onPagePress,
}: MushafReaderProps) {
  const ayahs = isJuzContext ? juzAyahs : surah?.ayahs || [];
  const pages = groupAyahsIntoPages(ayahs);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const hasScrolledToPage = useRef(false);

  const estimatedHeight = estimatePageHeight(arabicFontSize);

  // getItemLayout — required for scrollToIndex to work
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: estimatedHeight,
      offset: estimatedHeight * index + 70,
      index,
    }),
    [estimatedHeight],
  );

  // Handle failed scroll — no-op safety valve to prevent crash
  const onScrollToIndexFailed = useCallback(() => {
    // Scroll position will be approximate.
    // The estimated height may not match actual rendered height.
    // This can be improved later with actual measurement.
  }, []);

  // Scroll to a specific page when scrollToPage changes
  useEffect(() => {
    if (scrollToPage == null || pages.length === 0 || hasScrolledToPage.current) return;
    const index = pages.findIndex((p) => p.pageNumber === scrollToPage);
    if (index < 0) return;
    hasScrolledToPage.current = true;
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index,
        animated: false,
        viewPosition: 0,
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [scrollToPage, pages]);

  const handlePagePress = (page: PageGroup) => {
    if (!onPagePress) return;
    const firstAyah = page.ayahs[0];
    onPagePress({
      pageNumber: page.pageNumber,
      juzNumber: firstAyah?.juz || targetJuz,
      surahName: page.surahName || firstAyah?.surahName,
      type: isJuzContext ? 'juz' : 'page',
    });
  };

  return (
    <FlatList
      ref={flatListRef}
      data={pages}
      keyExtractor={(item) => String(item.pageNumber)}
      renderItem={({ item }) => (
        <MushafPageCard
          page={item}
          arabicFontSize={arabicFontSize}
          onPress={() => handlePagePress(item)}
        />
      )}
      getItemLayout={getItemLayout}
      onScrollToIndexFailed={onScrollToIndexFailed}
      ListFooterComponent={() =>
        isJuzContext ? (
          <NavigationFooter
            prevLabel="Previous Juz"
            nextLabel="Next Juz"
            onPrev={goToPrevJuz}
            onNext={goToNextJuz}
            prevDisabled={targetJuz <= 1}
            nextDisabled={targetJuz >= 30}
          />
        ) : (
          <NavigationFooter
            prevLabel="Previous Surah"
            nextLabel="Next Surah"
            onPrev={goToPrevSurah}
            onNext={goToNextSurah}
            prevDisabled={targetSurah <= 1}
            nextDisabled={targetSurah >= 114}
          />
        )
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.listContent
      ]}
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
      windowSize={5}
      initialNumToRender={2}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 32,
  },
  pageCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: 'rgba(16, 42, 67, 0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: 12,
  },
  pageHeaderText: {
    fontSize: 10.5,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },
  bismillah: {
    fontFamily: 'Amiri',
    fontSize: 22,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  mushafText: {
    fontFamily: 'Amiri',
    fontSize: 22,
    lineHeight: 42,
    color: colors.secondary,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  ayahMarker: {
    fontFamily: 'Amiri',
    fontSize: 14,
    color: colors.primary,
    lineHeight: 42,
  },
  folioRow: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    alignItems: 'center',
  },
  folioText: {
    fontSize: 11.5,
    color: colors.textDisabled,
    letterSpacing: 0.1,
  },
});