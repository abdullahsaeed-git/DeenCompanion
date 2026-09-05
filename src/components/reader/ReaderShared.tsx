/**
 * ReaderShared
 *
 * Shared UI components and helpers used across all Quran reader modes.
 */

import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, alpha } from '../../constants/theme';
import { Ayah } from '../../types/quran';
import React from 'react';

// ============================================
// TYPES
// ============================================

export interface ProcessedAyah extends Ayah {
  showBismillah: boolean;
}

export interface PageGroup {
  pageNumber: number;
  ayahs: ProcessedAyah[];
  isNewSurah: boolean;
  surahName?: string;
}

// ============================================
// UTILS
// ============================================

/** Strip trailing newline that the API appends to each ayah text */
export function cleanText(text: string, numberInSurah: number): string {
  const trimedText =  text.replace(/\n$/, '').replace(/\r\n$/, '');
  var ayatText =   trimedText;

const textToRemove = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ";

// Removes every instance of "brown "

if(numberInSurah == 1 ){
  ayatText = ayatText.replaceAll(textToRemove, "");
  if (ayatText.trim() == ''){
    ayatText = trimedText;
  }
}
return ayatText;


}

// ============================================
// LOADING / ERROR VIEWS
// ============================================

export function LoadingView() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading…</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{message}</Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
}

// ============================================
// GOLD ORNAMENT
// ============================================

export function GoldOrnament() {
  return (
    <View style={styles.ornament}>
      <View style={styles.ornamentLine} />
      <View style={styles.ornamentDiamond} />
      <View style={styles.ornamentLine} />
    </View>
  );
}

// ============================================
// SURAH CHANGE HEADER
// ============================================

export function SurahChangeHeader({ name }: { name: string }) {
  return (
    <View style={styles.surahChangeHeader}>
      <GoldOrnament />
      <Text style={styles.surahChangeLabel}>سُورَةُ {name}</Text>
      <GoldOrnament />
    </View>
  );
}

// ============================================
// NAVIGATION FOOTER
// ============================================

export function NavigationFooter({
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
}: {
  prevLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <View style={styles.navFooter}>
      <Pressable
        style={[styles.navButton, prevDisabled && styles.navButtonDisabled]}
        onPress={onPrev}
        disabled={prevDisabled}
      >
        <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
          <Path d="M12.5 15 7 10l5.5-5" stroke={prevDisabled ? colors.iconGray : colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={[styles.navButtonText, prevDisabled && styles.navButtonTextDisabled]}>
          {prevLabel}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.navButton, nextDisabled && styles.navButtonDisabled]}
        onPress={onNext}
        disabled={nextDisabled}
      >
        <Text style={[styles.navButtonText, nextDisabled && styles.navButtonTextDisabled]}>
          {nextLabel}
        </Text>
        <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
          <Path d="M7.5 5 13 10l-5.5 5" stroke={nextDisabled ? colors.iconGray : colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
    </View>
  );
}

// ============================================
// HELPERS
// ============================================

/** Process ayahs: mark Bismillah, group by page, detect new-Surah page boundaries */
export function groupAyahsIntoPages(ayahs: Ayah[]): PageGroup[] {
  let lastSurah = -1;

  const processed: ProcessedAyah[] = ayahs.map((ayah) => {
    const isNewSurah = ayah.surahNumber !== lastSurah;
    if (ayah.surahNumber) lastSurah = ayah.surahNumber;
    return {
      ...ayah,
      showBismillah: isNewSurah && ayah.surahNumber !== 9 && ayah.surahNumber !== 1,
    };
  });

  const map = new Map<number, ProcessedAyah[]>();
  for (const ayah of processed) {
    if (!map.has(ayah.page)) map.set(ayah.page, []);
    map.get(ayah.page)!.push(ayah);
  }

  const pages = Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([pageNumber, pageAyahs]) => ({ pageNumber, ayahs: pageAyahs }));

  let prevLastSurah = -1;
  return pages.map((page) => {
    const first = page.ayahs[0];
    const isNewSurah = first?.surahNumber !== prevLastSurah && first?.surahNumber !== undefined;
    const last = page.ayahs[page.ayahs.length - 1];
    if (last?.surahNumber) prevLastSurah = last.surahNumber;
    return { ...page, isNewSurah, surahName: first?.surahName };
  });
}

// ============================================
// MUSHAF PAGE CARD
// ============================================

export function MushafPageCard({
  pageNumber,
  ayahs,
  showTranslation,
  showTafsir,
  onLayout,
}: {
  pageNumber: number;
  ayahs: ProcessedAyah[];
  showTranslation: boolean;
  showTafsir: boolean;
  onLayout?: (y: number) => void;
}) {
  return (
    <View
      style={styles.mushafCard}
      onLayout={(e) => onLayout?.(e.nativeEvent.layout.y)}
    >
      <View style={styles.mushafHeader}>
        <Text style={styles.mushafHeaderText}>Juz {ayahs[0]?.juz || 1}</Text>
        <Text style={styles.mushafHeaderText}>Page {pageNumber}</Text>
      </View>

      {showTranslation ? (
        // Block layout: each ayah as a card with Arabic + translation
        <View style={styles.mushafBlockLayout}>
          {ayahs.map((ayah) => (
            <View key={ayah.number} style={styles.mushafAyahBlock}>
              {ayah.showBismillah && (
                <Text style={styles.mushafBismillahBlock}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
              )}
              <Text style={styles.mushafText}>
                {cleanText(ayah.text, ayah.numberInSurah)}
                <Text style={styles.ayahEndMarker}>
                  <Text style={styles.ayahEndText}> {ayah.numberInSurah} </Text>
                </Text>
              </Text>
              {showTranslation && ayah.translation && (
                <Text style={styles.translation}>{ayah.translation}</Text>
              )}
              {showTafsir && (
                <Text style={styles.tafsirPlaceholder}>Tafsir will be available soon.</Text>
              )}
            </View>
          ))}
        </View>
      ) : (
        // Inline layout: continuous Arabic text (default Mushaf look)
        <Text style={styles.mushafText}>
          {ayahs.map((ayah) => (
            <Text key={ayah.number}>
              {ayah.showBismillah && (
                <Text style={styles.mushafBismillahInline}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ{' '}
                </Text>
              )}
              {cleanText(ayah.text, ayah.numberInSurah)}
              <Text style={styles.ayahEndMarker}>
                <Text style={styles.ayahEndText}> {ayah.numberInSurah} </Text>
              </Text>
            </Text>
          ))}
        </Text>
      )}

      <View style={styles.mushafFolio}>
        <Text style={styles.mushafFolioText}>— {pageNumber} —</Text>
      </View>
    </View>
  );
}

// ============================================
// AYAH ITEM
// ============================================
export const AyahItem = React.memo(function AyahItem({
  ayah,
  isSelected,
  onPress,
  showSurahHeader,
  showTranslation,
  showTafsir,
  showArabic,
  arabicFontSize,
  translationFontSize,
  language,
}: {
  ayah: Ayah;
  isSelected: boolean;
  onPress: () => void;
  showSurahHeader?: boolean;
  showTranslation: boolean;
  showTafsir: boolean;
  showArabic: boolean;
  arabicFontSize: number;
  translationFontSize: number;
  language?: string | null;
}) {
  return (
    
    <Pressable onPress={onPress}>
      {showSurahHeader && ayah.surahName && (
        <SurahChangeHeader name={ayah.surahName} />
      )}
      <View style={[styles.ayahContainer, isSelected && styles.ayahContainerSelected]}>
        {showArabic && ayah.text && (
          <Text style={[styles.quranText, { fontSize: arabicFontSize , lineHeight: arabicFontSize * 2.4,  }]}>
            {cleanText(ayah.text, ayah.numberInSurah)} <Text style={[styles.ayahBadge,{ fontSize: arabicFontSize *0.5 }]}>﴿ {ayah.numberInSurah} ﴾</Text>
          </Text>
        )}

        {showTranslation && ayah.translation && (
          <Text style={[styles.translation, { fontSize: translationFontSize, lineHeight: translationFontSize * 1.7, textAlign: language === 'ur' ? 'right' : 'left' }]}>
            {ayah.translation}
          </Text>
        )}
        {showTafsir && (
          <Text style={styles.tafsirPlaceholder}>Tafsir will be available soon.</Text>
        )}
      </View>
      <GoldOrnament />
    </Pressable>
  );
});

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: alpha(colors.primary, 0.09),
    borderRadius: 10,
  },
  retryText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  ornamentLine: {
    width: 36,
    height: 1,
    backgroundColor: alpha(colors.accent, 0.45),
  },
  ornamentDiamond: {
    width: 4,
    height: 4,
    backgroundColor: colors.accent,
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
  },
  surahChangeHeader: {
    alignItems: 'center',
    marginVertical: 10,
    marginTop: 8, 
    marginBottom: 12,
    gap: 8,
  },
  surahChangeLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  ayahContainer: {
    padding: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ayahContainerSelected: {
    backgroundColor: alpha(colors.primary, 0.05),
    borderColor: alpha(colors.primary, 0.22),
  },
  quranText: {
    fontFamily: 'Amiri',
    fontSize: 22,
    lineHeight: 52,
    color: colors.secondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ayahBadge: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  translation: {
    marginTop: 10,
    fontSize: 13.5,
    lineHeight: 22.95,
    color: colors.textSecondary,
  },
  tafsirPlaceholder: {
    marginTop: 8,
    fontSize: 12.5,
    fontStyle: 'italic',
    color: colors.textMuted,
    backgroundColor: alpha(colors.primary, 0.04),
    padding: 10,
    borderRadius: 8,
  },
  mushafCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: alpha(colors.secondary, 0.06),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4,
  },
  mushafHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    marginBottom: 12,
  },
  mushafHeaderText: {
    fontSize: 10.5,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },
  mushafBismillahBlock: {
    fontFamily: 'Amiri',
    fontSize: 18,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  mushafBismillahInline: {
    fontFamily: 'Amiri',
    fontSize: 21,
    color: colors.primary,
  },
  mushafText: {
    fontFamily: 'Amiri',
    fontSize: 21,
    lineHeight: 45.15,
    color: colors.secondary,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  mushafBlockLayout: {
    gap: 16,
  },
  mushafAyahBlock: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: 12,
  },
  ayahEndMarker: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: 'Amiri',
  },
  ayahEndText: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: 'Amiri',
  },
  mushafFolio: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    alignItems: 'center',
  },
  mushafFolioText: {
    fontSize: 11.5,
    color: colors.textDisabled,
    letterSpacing: 0.1,
  },
  navFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  navButtonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  navButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: colors.primary,
  },
  navButtonTextDisabled: {
    color: colors.iconGray,
  },
});
