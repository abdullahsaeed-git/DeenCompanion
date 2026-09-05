/**
 * useReaderData Hook — Surah, Juz, and Page support
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { quranService } from '../services/quranService';
import { getJuzForPage, TOTAL_MUSHAF_PAGES } from '../constants/quran';
import { SurahDetail, Ayah, ReaderMode } from '../types/quran';
import { groupAyahsIntoPages } from '../components/reader/ReaderShared';

export interface UseReaderDataReturn {
  loading: boolean;
  error: string | null;
  handleRetry: () => void;

  surah: SurahDetail | null;
  juzAyahs: Ayah[];
  pageAyahs: Ayah[];

  readerMode: ReaderMode;
  setReaderMode: (mode: ReaderMode) => void;
  showTranslation: boolean;
  setShowTranslation: (v: boolean) => void;
  showTafsir: boolean;
  setShowTafsir: (v: boolean) => void;

  showArabic: boolean;
  setShowArabic: (v: boolean) => void;
  
  selectedAyah: number;
  setSelectedAyah: (n: number) => void;

  goToPrevSurah: () => void;
  goToNextSurah: () => void;
  goToPrevJuz: () => void;
  goToNextJuz: () => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;

  loadedJuzSet: Set<number>;
  loadingJuzNum: number | null;
  loadJuz: (juzNum: number) => void;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  pageLayoutMap: React.MutableRefObject<Map<number, number>>;
  hasScrolledToTarget: React.MutableRefObject<boolean>;

  headerTitle: string;
  headerSubtitle: string;

  isPageMode: boolean;
  isJuzContext: boolean;
  targetSurah: number;
  targetJuz: number;
  targetPage: number;

  pageModeGroups: ReturnType<typeof groupAyahsIntoPages>;
  pagesByJuz: [number, ReturnType<typeof groupAyahsIntoPages>][];
}

export function useReaderData(): UseReaderDataReturn {
  const { surahNumber, juzNumber, pageNumber, mode } = useLocalSearchParams();

  const targetSurah = parseInt((surahNumber as string) || '1', 10);
  const targetJuz = parseInt((juzNumber as string) || '1', 10);
  const targetPage = parseInt((pageNumber as string) || '1', 10);
  const initialMode = (mode as ReaderMode) || 'ayah';

  const isPageMode = initialMode === 'page';
  const isJuzContext = !!juzNumber && !isPageMode;

  // Reader mode (ayah/mushaf/page)
  const [readerMode, setReaderMode] = useState<ReaderMode>(
    isPageMode ? 'page' : initialMode
  );

  const [showTranslation, setShowTranslation] = useState(true);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showArabic, setShowArabic] = useState(true)

  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [juzAyahs, setJuzAyahs] = useState<Ayah[]>([]);
  const [pageAyahs, setPageAyahs] = useState<Ayah[]>([]);
  const [selectedAyah, setSelectedAyah] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loadedJuzSet, setLoadedJuzSet] = useState<Set<number>>(new Set());
  const [loadingJuzNum, setLoadingJuzNum] = useState<number | null>(null);
  const pageLayoutMap = useRef<Map<number, number>>(new Map());
  const hasScrolledToTarget = useRef(false);

  const pageModeGroups = useMemo(() => groupAyahsIntoPages(pageAyahs), [pageAyahs]);

  const pagesByJuz = useMemo(() => {
    const juzMap = new Map<number, typeof pageModeGroups>();
    for (const page of pageModeGroups) {
      const juz = page.ayahs[0]?.juz || 1;
      if (!juzMap.has(juz)) juzMap.set(juz, []);
      juzMap.get(juz)!.push(page);
    }
    return Array.from(juzMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [pageModeGroups]);

  const nextJuzToLoad = useMemo(() => {
    if (!isPageMode) return null;
    const loaded = Array.from(loadedJuzSet).sort((a, b) => a - b);
    if (loaded.length === 0) return null;
    const maxLoaded = loaded[loaded.length - 1];
    if (maxLoaded < 30) return maxLoaded + 1;
    return null;
  }, [loadedJuzSet, isPageMode]);

  // Fetch initial data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    hasScrolledToTarget.current = false;
    pageLayoutMap.current.clear();

    if (isPageMode) {
      quranService
        .getPageWithTranslation(targetPage)
        .then((data) => {
          if (!cancelled) {
            setPageAyahs(data.ayahs);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.message || 'Failed to load page');
            setLoading(false);
          }
        });
    } else if (isJuzContext) {
      quranService
        .getJuzWithTranslation(targetJuz)
        .then((data) => {
          if (!cancelled) {
            setJuzAyahs(data.ayahs);
            setSelectedAyah(data.ayahs[0]?.numberInSurah || 1);
            setReaderMode('mushaf');
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.message || 'Failed to load Juz');
            setLoading(false);
          }
        });
    } else {
      quranService
        .getSurahWithTranslation(targetSurah)
        .then((data) => {
          if (!cancelled) {
            setSurah(data);
            // setSelectedAyah(1);
            setReaderMode(initialMode);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.message || 'Failed to load Surah');
            setLoading(false);
          }
        });
    }

    return () => { cancelled = true; };
  }, [targetSurah, targetJuz, targetPage, isPageMode, isJuzContext, initialMode]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!isPageMode || loadingJuzNum || !nextJuzToLoad) return;
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 400;
      if (isNearBottom) {
        loadJuz(nextJuzToLoad);
      }
    },
    [isPageMode, loadingJuzNum, nextJuzToLoad]
  );

  function loadJuz(juzNum: number) {
    if (loadedJuzSet.has(juzNum) || loadingJuzNum) return;
    setLoadingJuzNum(juzNum);
    quranService
      .getJuzWithTranslation(juzNum)
      .then((data) => {
        setPageAyahs((prev) => {
          const existing = new Set(prev.map((a) => a.number));
          const merged = [...prev, ...data.ayahs.filter((a) => !existing.has(a.number))];
          return merged;
        });
        setLoadedJuzSet((prev) => {
          const next = new Set(prev);
          next.add(juzNum);
          return next;
        });
      })
      .catch(() => {})
      .finally(() => setLoadingJuzNum(null));
  }

  function handleRetry() {
    setLoading(true);
    setError(null);
    hasScrolledToTarget.current = false;
    pageLayoutMap.current.clear();

    if (isPageMode) {
      quranService
        .getPageWithTranslation(targetPage)
        .then((data) => setPageAyahs(data.ayahs))
        .catch((err) => setError(err.message || 'Failed to load'))
        .finally(() => setLoading(false));
    } else if (isJuzContext) {
      quranService
        .getJuzWithTranslation(targetJuz)
        .then((data) => {
          setJuzAyahs(data.ayahs);
          setSelectedAyah(data.ayahs[0]?.numberInSurah || 1);
        })
        .catch((err) => setError(err.message || 'Failed to load'))
        .finally(() => setLoading(false));
    } else {
      quranService
        .getSurahWithTranslation(targetSurah)
        .then((data) => {
          setSurah(data);
          setSelectedAyah(1);
        })
        .catch((err) => setError(err.message || 'Failed to load'))
        .finally(() => setLoading(false));
    }
  }

  function goToPrevSurah() {
    if (targetSurah > 1) {
      router.replace({
        pathname: '/quran-reader',
        params: { surahNumber: String(targetSurah - 1), mode: 'ayah' },
      });
    }
  }

  function goToNextSurah() {
    if (targetSurah < 114) {
      router.replace({
        pathname: '/quran-reader',
        params: { surahNumber: String(targetSurah + 1), mode: 'ayah' },
      });
    }
  }

  function goToPrevJuz() {
    if (targetJuz > 1) {
      router.replace({
        pathname: '/quran-reader',
        params: { juzNumber: String(targetJuz - 1), mode: 'mushaf' },
      });
    }
  }

  function goToNextJuz() {
    if (targetJuz < 30) {
      router.replace({
        pathname: '/quran-reader',
        params: { juzNumber: String(targetJuz + 1), mode: 'mushaf' },
      });
    }
  }

  function goToPrevPage() {
    if (targetPage > 1) {
      router.replace({
        pathname: '/quran-reader',
        params: { pageNumber: String(targetPage - 1), mode: 'page' },
      });
    }
  }

  function goToNextPage() {
    if (targetPage < TOTAL_MUSHAF_PAGES) {
      router.replace({
        pathname: '/quran-reader',
        params: { pageNumber: String(targetPage + 1), mode: 'page' },
      });
    }
  }

  const headerTitle = isPageMode
    ? `Page ${targetPage}`
    : isJuzContext
    ? `Juz ${targetJuz}`
    : surah?.englishName || 'Quran';

  const headerSubtitle = isPageMode
    ? `of ${TOTAL_MUSHAF_PAGES}`
    : isJuzContext
    ? `${juzAyahs.length} Ayahs`
    : surah
    ? `${surah.revelationType} · ${surah.ayahCount} Ayahs`
    : '';

  return {
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
    showArabic, 
    setShowArabic,
    selectedAyah,
    setSelectedAyah,
    goToPrevSurah,
    goToNextSurah,
    goToPrevJuz,
    goToNextJuz,
    goToPrevPage,
    goToNextPage,
    loadedJuzSet,
    loadingJuzNum,
    loadJuz,
    handleScroll,
    pageLayoutMap,
    hasScrolledToTarget,
    headerTitle,
    headerSubtitle,
    isPageMode,
    isJuzContext,
    targetSurah,
    targetJuz,
    targetPage,
    pageModeGroups,
    pagesByJuz,
  };
}