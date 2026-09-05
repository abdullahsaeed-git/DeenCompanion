/**
 * PageReader
 *
 * Renders a single Mushaf page fetched from /page/{n} endpoint.
 * Wrapped in a card view matching MushafReader styling.
 * The page card is tappable — opens page action sheet.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';
import { Ayah } from '../../types/quran';
import { PageActionInfo } from '../../types/bookmark';
import {
  SurahChangeHeader,
  NavigationFooter,
  cleanText,
} from './ReaderShared';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PageReaderProps {
  ayahs: Ayah[];
  targetPage: number;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  arabicFontSize: number;
  onPagePress?: (info: PageActionInfo) => void;
}

/** Inline ayah end marker — simple text style */
function AyahEndMarker({
  number,
  arabicFontSize,
}: {
  number: number;
  arabicFontSize: number;
}) {
  return (
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
      ۝{number}{' '}
    </Text>
  );
}

/** A continuous text block of ayahs from one surah */
function AyahTextBlock({
  ayahs,
  arabicFontSize,
}: {
  ayahs: Ayah[];
  arabicFontSize: number;
}) {
  return (
    <Text
      style={[
        styles.mushafText,
        { fontSize: arabicFontSize, lineHeight: arabicFontSize * 2.8 },
      ]}
    >
      {ayahs.map((ayah) => (
        <Text key={ayah.number}>
          {cleanText(ayah.text, ayah.numberInSurah)}
          <AyahEndMarker number={ayah.numberInSurah} arabicFontSize={arabicFontSize} />
        </Text>
      ))}
    </Text>
  );
}

type Segment =
  | { type: 'text'; ayahs: Ayah[] }
  | { type: 'header'; name: string }
  | { type: 'bismillah' };

export function PageReader({
  ayahs,
  targetPage,
  goToPrevPage,
  goToNextPage,
  arabicFontSize,
  onPagePress,
}: PageReaderProps) {
  if (ayahs.length === 0) return null;

  // Build segments: each surah's ayahs are a continuous text block.
  const segments: Segment[] = [];
  let currentAyahs: Ayah[] = [];
  let lastSurah = -1;

  for (const ayah of ayahs) {
    const isNewSurah =
      ayah.surahNumber !== lastSurah && ayah.surahNumber !== undefined;

    if (isNewSurah) {
      if (currentAyahs.length > 0) {
        segments.push({ type: 'text', ayahs: currentAyahs });
        currentAyahs = [];
      }

      if (ayah.surahName && ayah.numberInSurah == 1) {
        segments.push({ type: 'header', name: ayah.surahName });
      }

      if (
        ayah.numberInSurah === 1 &&
        ayah.surahNumber !== 9 &&
        ayah.surahNumber !== 1
      ) {
        segments.push({ type: 'bismillah' });
      }

      lastSurah = ayah.surahNumber!;
    }

    currentAyahs.push(ayah);
  }

  if (currentAyahs.length > 0) {
    segments.push({ type: 'text', ayahs: currentAyahs });
  }

  const insets = useSafeAreaInsets();
  const firstAyah = ayahs[0];

  const handleCardPress = () => {
    if (!onPagePress) return;
    onPagePress({
      pageNumber: targetPage,
      juzNumber: firstAyah?.juz || 1,
      surahName: firstAyah?.surahName,
      type: 'page',
    });
  };

  return (
    <View>
      {/* Page Card — tappable */}
      <Pressable onPress={handleCardPress}>
        <View style={[styles.pageCard, { marginTop: 60 }]}>
          {/* Page header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageHeaderText}>
              Juz {firstAyah?.juz || 1}
            </Text>
            <Text style={styles.pageHeaderText}>Page {targetPage}</Text>
          </View>

          {/* Segments */}
          {segments.map((segment, index) => {
            if (segment.type === 'header') {
              return (
                <View key={`h-${index}`} style={styles.headerSpacing}>
                  <SurahChangeHeader name={segment.name} />
                </View>
              );
            }
            if (segment.type === 'bismillah') {
              return (
                <Text
                  key={`b-${index}`}
                  style={[
                    styles.bismillah,
                    {
                      fontSize: arabicFontSize,
                      lineHeight: arabicFontSize * 1.7,
                    },
                  ]}
                >
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </Text>
              );
            }
            return (
              <AyahTextBlock
                key={`t-${index}`}
                ayahs={segment.ayahs}
                arabicFontSize={arabicFontSize}
              />
            );
          })}

          {/* Page folio */}
          <View style={styles.folioRow}>
            <Text style={styles.folioText}>— {targetPage} —</Text>
          </View>
        </View>
      </Pressable>

      {/* Navigation */}
      <NavigationFooter
        prevLabel="Previous Page"
        nextLabel="Next Page"
        onPrev={goToPrevPage}
        onNext={goToNextPage}
        prevDisabled={targetPage <= 1}
        nextDisabled={targetPage >= 604}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  headerSpacing: {
    marginTop: 8,
    marginBottom: 12,
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
    lineHeight: 62,
    color: colors.secondary,
    writingDirection: 'rtl',
    textAlign: 'right',
    paddingVertical: 20,
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