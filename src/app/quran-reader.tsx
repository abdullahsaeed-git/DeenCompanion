/**
 * Quran Reader Screen
 *
 * Three entry contexts:
 * - Surah (surahNumber): default Ayah, toggle → Mushaf
 * - Juz   (juzNumber):   default Mushaf, toggle → Ayah
 * - Page  (pageNumber):  Page mode only, no toggle
 *
 * Supports scrollToPage param to jump to a specific page in mushaf mode.
 * Supports scrollToAyah param to jump to a specific ayah in ayah mode.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../constants/theme';
import { Ayah, ReaderMode } from '../types/quran';
import { QuranBookmark, PositionBookmark, PageActionInfo } from '../types/bookmark';
import { useReaderData } from '../hooks/useReaderData';
import { LoadingView, ErrorView } from '../components/reader/ReaderShared';
import { ReaderHeader } from '../components/reader/ReaderHeader';
import { ReaderToolbar } from '../components/reader/ReaderToolbar';
import { AyahReader } from '../components/reader/AyahReader';
import { MushafReader } from '../components/reader/MushafReader';
import { PageReader } from '../components/reader/PageReader';
import { QuranSettingsSheet } from '../components/reader/QuranSettingsSheet';
import { AyahActionsSheet } from '../components/reader/AyahActionsSheet';
import { PageActionsSheet } from '../components/reader/PageActionsSheet';
import { homeService } from '../services/homeService';
import { bookmarkService } from '../services/bookmarkService';
import { settingsService } from '@/services/settingsService';

import { useFontSizes } from '../hooks/useFontSizes';
import { getLanguage } from '@/services/languageService';


export default function QuranReaderScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Read optional scrollToPage param (from bookmarks navigation)
  const scrollToPageParam = params.scrollToPage
    ? Number(params.scrollToPage)
    : null;

  // Read optional scrollToAyah param (from bookmarks navigation)       // NEW
  const scrollToAyahParam = params.scrollToAyah                         // NEW
    ? Number(params.scrollToAyah)                                       // NEW
    : null;                                                             // NEW

  const {
    loading,
    error,
    handleRetry,
    surah,
    juzAyahs,
    pageAyahs,
    readerMode,
    setReaderMode,
    showTranslation,
    setShowTranslation,
    showTafsir,
    setShowTafsir,
    selectedAyah,
    setSelectedAyah,
    goToPrevSurah,
    goToNextSurah,
    goToPrevJuz,
    goToNextJuz,
    goToPrevPage,
    goToNextPage,
    handleScroll,
    headerTitle,
    headerSubtitle,
    isPageMode,
    isJuzContext,
    targetSurah,
    targetJuz,
    targetPage,
    showArabic,
    setShowArabic,
  } = useReaderData();

  // ── SETTINGS STATE ────────────────────────────────────
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const { arabic: arabicFontSize, translation: translationFontSize, setArabicSize, setTranslationSize } = useFontSizes();
  // const [arabicFontSizeAyah, setArabicFontSizeAyah] = useState(22);

  // const [arabicFontSizeMushaf, setArabicFontSizeMushaf] = useState(22);
  // const [translationFontSize, setTranslationFontSize] = useState(14);

  // ── AYAH ACTIONS STATE ────────────────────────────────
  const [showAyahActions, setShowAyahActions] = useState(false);
  const [selectedAyahForAction, setSelectedAyahForAction] = useState<Ayah | null>(null);

  // ── PAGE ACTIONS STATE ────────────────────────────────
  const [showPageActions, setShowPageActions] = useState(false);
  const [selectedPageInfo, setSelectedPageInfo] = useState<PageActionInfo | null>(null);

  // ── BOOKMARK STATE ────────────────────────────────────
  const [bookmarkedAyahIds, setBookmarkedAyahIds] = useState<Set<string>>(new Set());
  const [bookmarkedPageIds, setBookmarkedPageIds] = useState<Set<string>>(new Set());
const [lang, setLang] = useState<string>('en');

  // Load saved font sizes on focus (mount + returning from font-settings page)
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

    const lan = getLanguage();
    setLang(lan);
      return () => { cancelled = true; };
    }, []),
  );

  // Load bookmark IDs when reader opens
  useEffect(() => {
    bookmarkService.getAllQuranIds().then((ids) => setBookmarkedAyahIds(ids));
    bookmarkService.getAllPositionIds().then((ids) => setBookmarkedPageIds(ids));
  }, []);

  // ── MODE TRANSITION GUARD ─────────────────────────────
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setReaderModeGuarded = useCallback((mode: ReaderMode) => {
    if (isTransitioning || mode === readerMode) return;
    setIsTransitioning(true);
    setReaderMode(mode);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, readerMode, setReaderMode]);

  // ── VISIBLE AYAH TRACKING ──────────────────────────────
  const [visibleAyahNumber, setVisibleAyahNumber] = useState(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const first = isJuzContext ? juzAyahs[0] : surah?.ayahs[0];
    setVisibleAyahNumber(first?.number || 0);
  }, [targetSurah, targetJuz, targetPage, readerMode, isJuzContext, surah, juzAyahs]);

  const handleVisibleAyahChanged = useCallback((ayah: Ayah) => {
    setVisibleAyahNumber(ayah.number);
  }, []);

  useEffect(() => {
    if (!surah || loading || isPageMode || readerMode !== 'ayah') return;
    if (visibleAyahNumber === 0) return;

    const ayahs = isJuzContext ? juzAyahs : surah.ayahs;
    const visibleAyah = ayahs.find((a) => a.number === visibleAyahNumber);

    const currentAyah = visibleAyah ? visibleAyah.numberInSurah : selectedAyah;
    const currentSurahNumber = visibleAyah ? (visibleAyah.surahNumber || surah.number) : surah.number;
    const currentSurahName = visibleAyah ? (visibleAyah.surahName || surah.englishName) : surah.englishName;

    const totalAyahs = isJuzContext ? juzAyahs.length : surah.ayahs.length;
    const percent = totalAyahs > 0 ? Math.round((currentAyah / totalAyahs) * 100) : 0;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => { 
      homeService.saveReadingProgress({
        surahNumber: currentSurahNumber,
        surahName: currentSurahName,
        ayahNumber: currentAyah,
        progressPercent: percent,
      });
    }, 800);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [surah, visibleAyahNumber, selectedAyah, isJuzContext, juzAyahs, loading, readerMode, isPageMode]);

  // ── AYAH ACTION HANDLERS ──────────────────────────────
  const handleAyahPress = useCallback((ayah: Ayah) => {
    setSelectedAyahForAction(ayah);
    setShowAyahActions(true);
  }, []);

  const isCurrentAyahBookmarked = selectedAyahForAction
    ? bookmarkedAyahIds.has(`${selectedAyahForAction.surahNumber}:${selectedAyahForAction.numberInSurah}`)
    : false;

  const handleBookmarkAyah = () => {
    if (!selectedAyahForAction) return;
    const ayah = selectedAyahForAction;
    const id = `${ayah.surahNumber}:${ayah.numberInSurah}`;

    if (bookmarkedAyahIds.has(id)) {
      bookmarkService.removeQuran(id);
      setBookmarkedAyahIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      const bookmark: QuranBookmark = {
        id,
        surahNumber: ayah.surahNumber || targetSurah,
        surahName: ayah.surahName || surah?.englishName || '',
        ayahNumber: ayah.numberInSurah,
        ayahGlobalNumber: ayah.number,
        arabicText: ayah.text?.replace(/\n$/, '').replace(/\r\n$/, '') || '',
        translation: ayah.translation || undefined,
        page: ayah.page,
        juz: ayah.juz,
        dateSaved: new Date().toISOString(),
      };
      bookmarkService.addQuran(bookmark);
      setBookmarkedAyahIds((prev) => new Set(prev).add(id));
    }
  };

  const handleCopyAyah = useCallback(() => {
    if (!selectedAyahForAction) return;
    const ayah = selectedAyahForAction;
    const surahName = ayah.surahName || surah?.englishName || '';
    const parts = [];
    parts.push(`${surahName} ${ayah.numberInSurah}`);
    if (ayah.text) {
      parts.push(ayah.text.replace(/\n$/, '').replace(/\r\n$/, ''));
    }
    if (ayah.translation) {
      parts.push(ayah.translation);
    }
    Clipboard.setStringAsync(parts.join('\n\n'));
  }, [selectedAyahForAction, surah]);

  const handleMarkLastRead = useCallback(() => {
    if (!selectedAyahForAction || !surah) return;
    const ayah = selectedAyahForAction;
    const totalAyahs = isJuzContext ? juzAyahs.length : surah.ayahs.length;
    const percent = totalAyahs > 0 ? Math.round((ayah.numberInSurah / totalAyahs) * 100) : 0;

    homeService.saveReadingProgress({
      surahNumber: ayah.surahNumber || surah.number,
      surahName: ayah.surahName || surah.englishName,
      ayahNumber: ayah.numberInSurah,
      progressPercent: percent,
    });
  }, [selectedAyahForAction, surah, isJuzContext, juzAyahs]);

  // ── PAGE ACTION HANDLERS ──────────────────────────────
  const handlePagePress = useCallback((info: PageActionInfo) => {
    setSelectedPageInfo(info);
    setShowPageActions(true);
  }, []);

  const isCurrentPageBookmarked = selectedPageInfo
    ? bookmarkedPageIds.has(
        selectedPageInfo.type === 'juz'
          ? `juz:${selectedPageInfo.juzNumber}:${selectedPageInfo.pageNumber}`
          : `page:${selectedPageInfo.pageNumber}`,
      )
    : false;

  const handleBookmarkPage = () => {
    if (!selectedPageInfo) return;
    const info = selectedPageInfo;
    const id =
      info.type === 'juz'
        ? `juz:${info.juzNumber}:${info.pageNumber}`
        : `page:${info.pageNumber}`;

    if (bookmarkedPageIds.has(id)) {
      bookmarkService.removePosition(id);
      setBookmarkedPageIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      const bookmark: PositionBookmark = {
        id,
        type: info.type,
        juzNumber: info.juzNumber,
        pageNumber: info.pageNumber,
        title:
          info.type === 'juz'
            ? `Juz ${info.juzNumber}`
            : `Page ${info.pageNumber}`,
        subtitle: info.surahName || '',
        dateSaved: new Date().toISOString(),
      };
      bookmarkService.addPosition(bookmark);
      setBookmarkedPageIds((prev) => new Set(prev).add(id));
    }
  };

  const handleCopyPage = useCallback(() => {
    if (!selectedPageInfo) return;
    const info = selectedPageInfo;
    const parts = [];
    if (info.type === 'juz') {
      parts.push(`Juz ${info.juzNumber} · Page ${info.pageNumber}`);
    } else {
      parts.push(`Page ${info.pageNumber}`);
    }
    if (info.surahName) {
      parts.push(info.surahName);
    }
    Clipboard.setStringAsync(parts.join('\n'));
  }, [selectedPageInfo]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={handleRetry} />;
  if (!isPageMode && !isJuzContext && !surah) {
    return <ErrorView message="No data available" onRetry={handleRetry} />;
  }
  if (isJuzContext && juzAyahs.length === 0) {
    return <ErrorView message="No data available" onRetry={handleRetry} />;
  }
  if (isPageMode && pageAyahs.length === 0) {
    return <ErrorView message="No data available" onRetry={handleRetry} />;
  }

  const ayahActionsSurahName = selectedAyahForAction?.surahName || surah?.englishName || '';

  return (
    <View style={styles.screen}>
      <ReaderHeader
        headerTitle={headerTitle}
        headerSubtitle={headerSubtitle}
        isPageMode={isPageMode}
        readerMode={readerMode}
        setReaderMode={setReaderModeGuarded}
        topInset={0}
        onSettingsPress={() => setShowSettingsSheet(true)}
      />

      {readerMode === 'ayah' && (
        <ReaderToolbar
          readerMode={readerMode}
          showTranslation={showTranslation}
          setShowTranslation={setShowTranslation}
          showTafsir={showTafsir}
          setShowTafsir={setShowTafsir}
          showArabic={showArabic}
          setShowArabic={setShowArabic}
          topInset={0}
          visible={showToolbar}
        />
      )}

      {readerMode === 'ayah' ? (
        <AyahReader
          isJuzContext={isJuzContext}
          surah={surah}
          juzAyahs={juzAyahs}
          selectedAyah={selectedAyah}
          setSelectedAyah={setSelectedAyah}
          showTranslation={showTranslation}
          showArabic={showArabic}
          showTafsir={showTafsir}
          targetSurah={targetSurah}
          goToPrevSurah={goToPrevSurah}
          goToNextSurah={goToNextSurah}
          goToPrevJuz={goToPrevJuz}
          goToNextJuz={goToNextJuz}
          onVisibleAyahChanged={handleVisibleAyahChanged}
          topInset={0}
          bottomInset={insets.bottom}
          arabicFontSize={arabicFontSize}
          translationFontSize={translationFontSize}
          showToolbar={showToolbar}
          onAyahPress={handleAyahPress}
          scrollToAyah={scrollToAyahParam}
          language = {lang}
        />
      ) : readerMode === 'mushaf' ? (
        <MushafReader
          isJuzContext={isJuzContext}
          juzAyahs={juzAyahs}
          surah={surah}
          targetSurah={targetSurah}
          targetJuz={targetJuz}
          goToPrevSurah={goToPrevSurah}
          goToNextSurah={goToNextSurah}
          goToPrevJuz={goToPrevJuz}
          goToNextJuz={goToNextJuz}
          arabicFontSize={arabicFontSize}
          scrollToPage={scrollToPageParam}
          onPagePress={handlePagePress}
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {  paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={200}
        >
          <PageReader
            ayahs={pageAyahs}
            targetPage={targetPage}
            goToPrevPage={goToPrevPage}
            goToNextPage={goToNextPage}
            arabicFontSize={arabicFontSize}
            onPagePress={handlePagePress}
          />
        </ScrollView>
      )}

      {/* Settings sheet */}
      <QuranSettingsSheet
        visible={showSettingsSheet}
        onClose={() => setShowSettingsSheet(false)}
        readerMode={readerMode}
        arabicFontSize={arabicFontSize}
        setArabicFontSize={setArabicSize}
        translationFontSize={translationFontSize}
        setTranslationFontSize={setTranslationSize}
        showTranslation={showTranslation}
        setShowTranslation={setShowTranslation}
        showTafsir={showTafsir}
        setShowTafsir={setShowTafsir}
        showArabic={showArabic}
        setShowArabic={setShowArabic}
        showToolbar={showToolbar}
        setShowToolbar={setShowToolbar}
        setReaderMode={setReaderModeGuarded}
        isPageMode={isPageMode}
      />

      {/* Ayah actions sheet — only in ayah mode */}
      {readerMode === 'ayah' && (
        <AyahActionsSheet
          visible={showAyahActions}
          onClose={() => setShowAyahActions(false)}
          ayah={selectedAyahForAction}
          surahName={ayahActionsSurahName}
          isBookmarked={isCurrentAyahBookmarked}
          onBookmark={handleBookmarkAyah}
          onCopy={handleCopyAyah}
          onMarkLastRead={handleMarkLastRead}
        />
      )}

      {/* Page actions sheet — in mushaf or page mode */}
      {(readerMode === 'mushaf' || isPageMode) && (
        <PageActionsSheet
          visible={showPageActions}
          onClose={() => setShowPageActions(false)}
          pageInfo={selectedPageInfo}
          isBookmarked={isCurrentPageBookmarked}
          onBookmark={handleBookmarkPage}
          onCopy={handleCopyPage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 140,
  },
});