/**
 * Quran Search Results
 *
 * Route: /search/quran?q={query}
 *
 * Connects to Al Quran Cloud search API.
 * After initial search, enriches results with the "other" text
 * (e.g. if searching English, also fetches Arabic per surah).
 *
 * Filters:
 *   All / Translation → search English, enrich with Arabic
 *   Arabic            → search Arabic, enrich with English
 *   Surah             → local filter of 114 surahs by name
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "../../constants/theme";
import { quranService } from "../../services/quranService";
import { QuranSearchResult, Surah } from "../../types/quran";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type FilterKey = "all" | "arabic" | "translation" | "surah";

/** Enriched result — arabic/translation populated after fetch */
type SearchResultItem = QuranSearchResult & {
  arabic?: string;
  translation?: string;
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "arabic", label: "Arabic" },
  { key: "translation", label: "Translation" },
  { key: "surah", label: "Surah" },
];

/** Process items in small batches with delays to avoid rate limits */
async function batchFetch<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  batchSize = 3,
  delayMs = 600,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    if (i + batchSize < items.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return results;
}

/** Max unique surahs to enrich (limits extra API calls) */
const MAX_ENRICH_SURAHS = 15;

/* ------------------------------------------------------------------ */
/*  HighlightedText helper                                             */
/* ------------------------------------------------------------------ */

function HighlightedText({
  text,
  query,
  baseStyle,
  highlightStyle,
}: {
  text: string;
  query: string;
  baseStyle: TextStyle;
  highlightStyle: TextStyle;
}) {
  if (!query.trim()) return <Text style={baseStyle}>{text}</Text>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return (
    <Text style={baseStyle}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} style={highlightStyle}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke="#102A43"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchBarIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <Circle
        cx="9"
        cy="9"
        r="6.5"
        stroke={colors.primary}
        strokeWidth={1.8}
        opacity={0.7}
      />
      <Path
        d="M14 14L18 18"
        stroke={colors.primary}
        strokeWidth={1.8}
        strokeLinecap="round"
        opacity={0.7}
      />
    </Svg>
  );
}

function ClearIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 12 12" fill="none">
      <Path
        d="M2 2l8 8M10 2l-8 8"
        stroke="#52616F"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BookmarkOutline() {
  return (
    <Svg width={17} height={17} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6 3h8v14l-4-3.2L6 17Z"
        stroke="#98A2AE"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

export default function QuranSearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const initialQuery = (params.q as string) || "";

  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [surahResults, setSurahResults] = useState<Surah[]>([]);
  const [allSurahs, setAllSurahs] = useState<Surah[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchIdRef = useRef(0);
  const allSurahsRef = useRef<Surah[]>([]);

  useEffect(() => {
    allSurahsRef.current = allSurahs;
  }, [allSurahs]);

  /* ---- Core search + enrichment ---- */
  const doSearch = useCallback(
    async (searchQuery: string, filter: FilterKey) => {
      const trimmed = searchQuery.trim();

      if (!trimmed) {
        setResults([]);
        setSurahResults([]);
        setResultCount(0);
        return;
      }

      if (filter === "surah") {
        const surahs = allSurahsRef.current;
        if (surahs.length === 0) return;
        const q = trimmed.toLowerCase();
        const filtered = surahs.filter(
          (s) =>
            s.englishName.toLowerCase().includes(q) ||
            s.arabicName.includes(trimmed) ||
            String(s.number) === trimmed,
        );
        setSurahResults(filtered);
        setResults([]);
        setResultCount(0);
        return;
      }

      if (trimmed.length < 2) {
        setResults([]);
        setResultCount(0);
        return;
      }

      const currentId = ++searchIdRef.current;
      setLoading(true);
      setError(null);

      const isArabicSearch = filter === "arabic";
      const edition = isArabicSearch ? "quran-uthmani" : "en.sahih";

      let matches: QuranSearchResult[] = [];

      // ── Phase 1: Search (only this can fail and show error state) ──
      try {
        const data = await quranService.searchQuran(trimmed, edition);
        if (currentId !== searchIdRef.current) return;
        matches = data.matches;
      } catch (err: any) {
        if (currentId !== searchIdRef.current) return;
        setError(err.message || "Search failed");
        setResults([]);
        setResultCount(0);
        setLoading(false);
        return;
      }

      // ── Phase 2: Show results immediately with matched text ──
      const initialResults: SearchResultItem[] = matches.map((m) => ({
        ...m,
        arabic: isArabicSearch ? m.text : undefined,
        translation: isArabicSearch ? undefined : m.text,
      }));
      setResults(initialResults);
      setResultCount(matches.length);
      setSurahResults([]);
      setLoading(false);

      // ── Enrich in background (non-blocking, retry on failure) ──
      const uniqueSurahs = [...new Set(matches.map((m) => m.surah.number))];

      if (uniqueSurahs.length === 0) return;

      const field: "arabic" | "translation" = isArabicSearch
        ? "translation"
        : "arabic";

     for (const sn of uniqueSurahs) {
  if (currentId !== searchIdRef.current) return;

  try {
    const map = isArabicSearch
      ? await quranService.getSurahTranslationMap(sn)
      : await quranService.getSurahArabicMap(sn);

    if (currentId !== searchIdRef.current) return;

    setResults((prev) =>
      prev.map((item) => {
        if (item.surah.number !== sn) {
          return item;
        }

        const newVal = map.get(item.numberInSurah);

        if (!newVal) {
          return item;
        }

        return {
          ...item,
          [field]: newVal,
        };
      })
    );

    console.log(
      `[enrichment] surah ${sn} loaded: ${map.size} ayahs`
    );
  } catch (err) {
    console.warn(
      `[enrichment] surah ${sn} failed`,
      err
    );
  }
}
    },
    [],
  );

  /* ---- Effects ---- */

  useEffect(() => {
    quranService.getAllSurahs().then(setAllSurahs);
    if (initialQuery) {
      doSearch(initialQuery, "all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (query.trim()) {
      doSearch(query, activeFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  /* ---- Handlers ---- */

  function handleSubmit() {
    doSearch(query, activeFilter);
  }

  function handleResultPress(result: QuranSearchResult) {
    router.push({
      pathname: "/quran-reader",
      params: { surahNumber: String(result.surah.number), mode: "ayah" },
    });
  }

  function handleSurahPress(surahNumber: number) {
    router.push({
      pathname: "/quran-reader",
      params: { surahNumber: String(surahNumber), mode: "ayah" },
    });
  }

  /* ---- Derived ---- */

  const isSurahMode = activeFilter === "surah";
  const showAyahResults =
    !loading && !error && !isSurahMode && results.length > 0;
  const showAyahEmpty =
    !loading &&
    !error &&
    !isSurahMode &&
    query.trim().length >= 2 &&
    results.length === 0;
  const showSurahResults =
    !loading && !error && isSurahMode && surahResults.length > 0;
  const showSurahEmpty =
    !loading &&
    !error &&
    isSurahMode &&
    query.trim() &&
    surahResults.length === 0;

  /* ---- Render ---- */

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.content,
          { paddingTop:  8, paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* ── Search row ── */}
        <View style={styles.searchRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <BackIcon />
          </Pressable>
          <View style={[styles.barRing, focused && styles.barRingFocused]}>
            <View style={[styles.bar, focused && styles.barFocused]}>
              <SearchBarIcon />
              <TextInput
                style={styles.input}
                value={query}
                onChangeText={setQuery}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search the Quran…"
                placeholderTextColor="rgba(16, 42, 67, 0.4)"
                returnKeyType="search"
                onSubmitEditing={handleSubmit}
                autoFocus
              />
              {query.length > 0 && (
                <Pressable
                  style={styles.clearBtn}
                  onPress={() => {
                    setQuery("");
                    setResults([]);
                    setSurahResults([]);
                    setResultCount(0);
                  }}
                >
                  <ClearIcon />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* ── Filter chips ── */}
        <View style={styles.chips}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.chip, activeFilter === f.key && styles.chipActive]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === f.key && styles.chipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Results area ── */}
        <View style={styles.resultsArea}>
          {loading && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Searching…</Text>
            </View>
          )}

          {!loading && error && (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable
                style={styles.retryButton}
                onPress={() => doSearch(query, activeFilter)}
              >
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}

          {showSurahResults && (
            <FlatList
              data={surahResults}
              keyExtractor={(item) => String(item.number)}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.surahRow}
                  onPress={() => handleSurahPress(item.number)}
                >
                  <View style={styles.surahNumBadge}>
                    <Text style={styles.surahNumText}>{item.number}</Text>
                  </View>
                  <View style={styles.surahInfo}>
                    <Text style={styles.surahArName}>{item.arabicName}</Text>
                    <Text style={styles.surahEnName}>{item.englishName}</Text>
                    <Text style={styles.surahMeta}>
                      {item.ayahCount} Ayahs · {item.revelationType}
                    </Text>
                  </View>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}

          {showSurahEmpty && (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No surahs found</Text>
              <Text style={styles.emptySub}>Try a different search term</Text>
            </View>
          )}

          {showAyahResults && (
            <View style={styles.ayahListWrap}>
              <Text style={styles.count}>
                {resultCount} result{resultCount !== 1 ? "s" : ""} for{" "}
                <Text style={styles.countBold}>"{query}"</Text>
              </Text>
              <FlatList
                data={results}
                keyExtractor={(item) => String(item.number)}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.card}
                    onPress={() => handleResultPress(item)}
                  >
                    <View style={styles.cardRow}>
                      <Text style={styles.surahName}>
                        {item.surah.englishName}
                      </Text>
                      <View style={styles.ayahBadge}>
                        <Text style={styles.ayahBadgeText}>
                          {item.numberInSurah}
                        </Text>
                      </View>
                      <Pressable style={styles.bmkBtn} onPress={() => {}}>
                        <BookmarkOutline />
                      </Pressable>
                    </View>

                    {item.arabic ? (
                      <HighlightedText
                        text={item.arabic}
                        query={query}
                        baseStyle={styles.arabic}
                        highlightStyle={styles.arabicHighlight}
                      />
                    ) : null}

                    {item.translation ? (
                      <HighlightedText
                        text={item.translation}
                        query={query}
                        baseStyle={styles.translation}
                        highlightStyle={styles.translationHighlight}
                      />
                    ) : null}
                  </Pressable>
                )}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}

          {showAyahEmpty && (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySub}>Try a different search term</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 20, gap: 12 },

  /* Search row */
  searchRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  barRing: { flex: 1, padding: 3, borderRadius: 17 },
  barRingFocused: { backgroundColor: "rgba(15, 107, 80, 0.12)" },
  bar: {
    flex: 1,
    height: 52,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E9E4D8",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 16,
    paddingRight: 10,
  },
  barFocused: { borderColor: colors.primary },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: colors.secondary,
    fontFamily: "Inter",
    padding: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(16, 42, 67, 0.07)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Filter chips */
  chips: { flexDirection: "row", gap: 8 },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9E4D8",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: "rgba(15, 107, 80, 0.25)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  chipText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
    color: "#52616F",
  },
  chipTextActive: { color: "#fff" },

  /* Results area */
  resultsArea: { flex: 1 },

  /* Centered states */
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { marginTop: 8, fontSize: 14, color: "#52616F" },
  errorText: {
    fontSize: 14,
    color: "#E12D39",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "rgba(15, 107, 80, 0.09)",
    borderRadius: 10,
  },
  retryText: { color: colors.primary, fontWeight: "600", fontSize: 14 },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: colors.secondary },
  emptySub: { fontSize: 13, color: "#7A828C" },

  /* Surah results */
  surahRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E9E4D8",
    borderRadius: 16,
    marginBottom: 8,
  },
  surahNumBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(15, 107, 80, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  surahNumText: { fontSize: 14, fontWeight: "600", color: colors.primary },
  surahInfo: { flex: 1, minWidth: 0 },
  surahArName: {
    fontSize: 18,
    color: colors.secondary,
    textAlign: "right",
    lineHeight: 28,
  },
  surahEnName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
    marginTop: 2,
  },
  surahMeta: { fontSize: 12, color: "#7A828C", marginTop: 2 },
  divider: { height: 0 },

  /* Ayah results */
  ayahListWrap: { flex: 1 },
  count: { fontSize: 12.5, color: "#52616F", marginBottom: 8 },
  countBold: { color: colors.secondary, fontWeight: "600" },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E9E4D8",
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "rgba(16, 42, 67, 0.04)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  surahName: { fontSize: 13.5, fontWeight: "600", color: colors.secondary },
  ayahBadge: {
    backgroundColor: "rgba(15, 107, 80, 0.08)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  ayahBadgeText: { fontSize: 11, fontWeight: "600", color: colors.primary },
  bmkBtn: {
    marginLeft: "auto",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Text content */
  arabic: {
    marginTop: 8,
    fontFamily: "Amiri",
    fontSize: 18,
    lineHeight: 34,
    color: colors.secondary,
    textAlign: "right",
    writingDirection: "rtl" as const,
  },
  arabicHighlight: {
    backgroundColor: "rgba(15, 107, 80, 0.14)",
    color: colors.primary,
    borderRadius: 4,
  },
  translation: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 21,
    color: "#52616F",
  },
  translationHighlight: {
    backgroundColor: "rgba(15, 107, 80, 0.14)",
    color: colors.primary,
    fontWeight: "600",
    borderRadius: 4,
  },
});
