/**
 * Hadith Search Results
 *
 * Route: /search/hadith?q={query}
 *
 * Connects to Supabase Edge Function for hybrid search.
 * Features: Pagination, Collection filters, Advanced highlighting.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../constants/theme';
import { hadithService } from '../../services/hadithService';
import { HadithSearchResult } from '../../types/hadith';
import { getLanguage } from '@/services/languageService';
import { FONT_SIZE_CONFIG, getDefaultTranslationSize, settingsService } from '@/services/settingsService';

/* ------------------------------------------------------------------ */
/*  Constants & Helpers                                                */
/* ------------------------------------------------------------------ */

type ScopeKey = 'all' | 'arabic' | 'translation';



const SCOPE_FILTERS: { key: ScopeKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'arabic', label: 'Arabic' },
  { key: 'translation', label: 'Translation' },
];

const COLLECTION_FILTERS = [
  'bukhari',
  'muslim',
  'nasai',
  'abudawud',
  'tirmidhi',
  'ibnmajah',
];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
  'under', 'again', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or',
  'if', 'while', 'about', 'up', 'it', 'its', 'this', 'that', 'these',
  'those', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his',
  'she', 'her', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
]);

function getHighlightStems(word: string): string[] {
  const w = word.toLowerCase();
  const stems = [w];
  const suffixes = [
    'ingly', 'ically', 'ation', 'ition', 'ness', 'ment', 'able', 'ible',
    'ious', 'eous', 'ical', 'ally', 'ful', 'less', 'ous', 'ive', 'ing',
    'ied', 'ies', 'ize', 'ise', 'ify', 'tion', 'sion', 'ely', 'ity',
    'ism', 'ist', 'ary', 'ory', 'ly', 'ed', 'er', 'es', 'al', 'en', 's', 'y',
  ];

  for (const suffix of suffixes) {
    if (w.endsWith(suffix) && w.length > suffix.length + 2) {
      const root = w.slice(0, -suffix.length);
      if (root.length >= 3 && !stems.includes(root)) {
        stems.push(root);
      }
      break;
    }
  }
  return stems;
}

function HighlightedText({
  text,
  query,
  baseStyle,
  highlightStyle,
  fontsize,
}: {
  text: string;
  query: string;
  baseStyle: TextStyle;
  highlightStyle: TextStyle;
  fontsize?: number;
}) {
  if (!query?.trim() || !text) return <Text style={baseStyle}>{text}</Text>;

  const strip = (s: string) => s.replace(/[\u200C\u200D\u200B\uFEFF]/g, '');
  const cleanText = strip(text);

  const queryWords = strip(query)
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  if (queryWords.length === 0) return <Text style={baseStyle}>{cleanText}</Text>;

  const exactSet = new Set<string>();
  const stemSet = new Set<string>();

  for (const word of queryWords) {
    if (word.length <= 3) {
      exactSet.add(word);
    } else {
      getHighlightStems(word).forEach((s) => stemSet.add(s));
    }
  }

  if (exactSet.size === 0 && stemSet.size === 0) return <Text style={baseStyle}>{cleanText}</Text>;

  const WORD_RE = /[\p{L}\p{N}]+/gu;
  const tokens: { text: string; isWord: boolean }[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = WORD_RE.exec(cleanText)) !== null) {
    if (m.index > lastIdx) {
      tokens.push({ text: cleanText.slice(lastIdx, m.index), isWord: false });
    }
    tokens.push({ text: m[0], isWord: true });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < cleanText.length) {
    tokens.push({ text: cleanText.slice(lastIdx), isWord: false });
  }

  return (
    <Text style={[baseStyle, fontsize ? { fontSize: fontsize, lineHeight: fontsize*2 } : {}]}>
      {tokens.map((token, i) => {
        if (!token.isWord) return token.text;

        const lower = token.text.toLowerCase();
        const isMatch =
          exactSet.has(lower) || [...stemSet].some((s) => lower.startsWith(s));

        if (isMatch) {
          return <Text key={i} style={highlightStyle}>{token.text}</Text>;
        }
        return token.text;
      })}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M12.5 4.5 7 10l5.5 5.5" stroke="#102A43" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SearchBarIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <Circle cx="9" cy="9" r="6.5" stroke={colors.primary} strokeWidth={1.8} opacity={0.7} />
      <Path d="M14 14L18 18" stroke={colors.primary} strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />
    </Svg>
  );
}

function ClearIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 12 12" fill="none">
      <Path d="M2 2l8 8M10 2l-8 8" stroke="#52616F" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function BookmarkOutline() {
  return (
    <Svg width={17} height={17} viewBox="0 0 20 20" fill="none">
      <Path d="M6 3h8v14l-4-3.2L6 17Z" stroke="#98A2AE" strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

export default function HadithSearchScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const initialQuery = (params.q as string) || '';
  const paramLang = (params.lang as string) || '';
  

  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(true);
  const [activeScope, setActiveScope] = useState<ScopeKey>('all');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const [results, setResults] = useState<HadithSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const [lang, setLang] = useState('en');
 const [arFont, setArFont] = useState<number>(FONT_SIZE_CONFIG.arabic.default);
  const [trFont, setTrFont] = useState<number>(getDefaultTranslationSize);

  const doSearch = useCallback(async (searchQuery: string, collections: string[], pageNum: number) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      setTotalCount(0);
      setHasMore(false);
      setIsFallback(false);
      return;
    }

    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await hadithService.searchHadiths(trimmed, collections, pageNum);
      setLang(paramLang)
      if (pageNum === 1) {
        setResults(data.results || []);
      } else {
        setResults((prev) => [...prev, ...(data.results || [])]);
      }
      
      setTotalCount(data.total_count || 0);
      setHasMore(data.has_more || false);
      setPage(data.page || 1);
      
      const fallback = (data.results || []).every((r) => r.similarity_score === 0);
      setIsFallback(fallback);
      
    } catch (err: any) {
      console.error('Search error:', err);
      if (pageNum === 1) {
        setResults([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial search on mount
  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, [], 1);
    }
  }, []);

  const handleSubmit = () => {
    doSearch(query, selectedCollections, 1);
  };

  const toggleCollection = (col: string) => {
    const newCollections = selectedCollections.includes(col)
      ? selectedCollections.filter((c) => c !== col)
      : [...selectedCollections, col];
    
    setSelectedCollections(newCollections);
    doSearch(query, newCollections, 1);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    doSearch(query, selectedCollections, page + 1);
  };


useFocusEffect(
  useCallback(() => {
    const fetchLang = async () => {
      const l = await getLanguage();
      setLang(l === 'ur' ? 'ur' : 'en');
    };
    fetchLang();
     settingsService.getArabicFontSize().then(setArFont);
    settingsService.getTranslationFontSize().then(setTrFont);
  }, [])
);



  useFocusEffect(
  useCallback(() => {
    settingsService.getArabicFontSize().then(setArFont);
    settingsService.getTranslationFontSize().then(setTrFont);
  }, []),
);


  const renderItem = ({ item }: { item: HadithSearchResult }) => {
    const semPct = Math.round(item.similarity_score * 100);
    const keyPct = Math.round(item.keyword_score * 100);

    // Safely determine the translation text based on language
    const translationText = lang === 'ur' ? (item.ur || '') : (item.en || '');

    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push({
          pathname: '/hadith-reader',
          params: { collectionId: item.collection, hadithNumber: item.hadith_number },
        })}
      >
        <View style={styles.cardRow}>
          <View style={styles.collectionBadge}>
            <Text style={styles.collectionBadgeText}>{item.collection}</Text>
          </View>
          <View style={styles.numberBadge}>
            <Text style={styles.numberBadgeText}>#{item.hadith_number}</Text>
          </View>
          
          {/* Scores */}
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, semPct > 0 ? styles.semScore : styles.mutedScore]}>{semPct}%</Text>
            <Text style={styles.scoreLabel}>sem</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreText, keyPct > 0 ? styles.keyScore : styles.mutedScore]}>{keyPct}%</Text>
            <Text style={styles.scoreLabel}>key</Text>
          </View>

          <Pressable style={styles.bmkBtn}>
            <BookmarkOutline />
          </Pressable>
        </View>

        {/* Arabic */}
        {item.ar && (activeScope === 'all' || activeScope === 'arabic') && (
          <HighlightedText
            text={item.ar}
            query={query}
            baseStyle={styles.arabic}
            highlightStyle={styles.arabicHighlight}
            fontsize={arFont}
          />
        )}

        {/* Translation */}
        {translationText.length > 0 && (activeScope === 'all' || activeScope === 'translation') && (
          <HighlightedText
            text={translationText}
            query={query}
            baseStyle={styles.translation}
            highlightStyle={styles.translationHighlight}
            fontsize={trFont}
          />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: 8, paddingBottom: insets.bottom + 20 }]}>
        {/* Search row */}
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
                placeholder="Search hadith…"
                placeholderTextColor="rgba(16, 42, 67, 0.4)"
                returnKeyType="search"
                onSubmitEditing={handleSubmit}
                autoFocus
              />
              {query.length > 0 && (
                <Pressable style={styles.clearBtn} onPress={() => { setQuery(''); setResults([]); }}>
                  <ClearIcon />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <View>

          {/* Collection chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={COLLECTION_FILTERS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.collectionContent}
          renderItem={({ item }) => {
            const active = selectedCollections.includes(item);
            return (
              <Pressable
                style={[styles.colChip, active && styles.colChipActive]}
                onPress={() => toggleCollection(item)}
              >
                <Text style={[styles.colChipText, active && styles.colChipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
          

        {/* Scope chips */}
        <View style={styles.scopeChips}>
          {SCOPE_FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.scopeChip, activeScope === f.key && styles.scopeChipActive]}
              onPress={() => setActiveScope(f.key)}
            >
              <Text style={[styles.scopeChipText, activeScope === f.key && styles.scopeChipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        
        
        </View>

        {/* Fallback banner */}
        {isFallback && !loading && results.length > 0 && (
          <View style={styles.fallbackBanner}>
            <Text style={styles.fallbackText}>Semantic search unavailable — showing keyword results only</Text>
          </View>
        )}

        {/* Results Area */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching…</Text>
          </View>
        ) : (
          <View style={styles.resultsArea}>
            {results.length > 0 && (
              <Text style={styles.count}>
                Showing {results.length} of {totalCount} results for{' '}
                <Text style={styles.countBold}>"{query}"</Text>
              </Text>
            )}

            <FlatList
              data={results}
              keyExtractor={(item) => `${item.collection}-${item.hadith_number}`}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                query.trim() ? (
                  <View style={styles.centered}>
                    <Text style={styles.emptyTitle}>No results found</Text>
                    <Text style={styles.emptySub}>Try a different search term</Text>
                  </View>
                ) : null
              }
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
                ) : hasMore ? (
                  <Pressable style={styles.loadMoreBtn} onPress={handleLoadMore}>
                    <Text style={styles.loadMoreText}>Load More</Text>
                  </Pressable>
                ) : null
              }
            />
          </View>
        )}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 20, gap: 0 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  barRing: { flex: 1, padding: 3, borderRadius: 17 },
  barRingFocused: { backgroundColor: 'rgba(15, 107, 80, 0.12)' },
  bar: {
    flex: 1, height: 52, backgroundColor: '#fff', borderWidth: 1,
    borderColor: '#E9E4D8', borderRadius: 14, flexDirection: 'row',
    alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 10,
  },
  barFocused: { borderColor: colors.primary },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.secondary, fontFamily: 'Inter', padding: 0 },
  clearBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(16, 42, 67, 0.07)', alignItems: 'center', justifyContent: 'center' },

  scopeChips: { marginTop: 12, flexDirection: 'row', gap: 8 },
  scopeChip: { height: 34, paddingHorizontal: 14, borderRadius: 11, borderWidth: 1, borderColor: '#E9E4D8', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  scopeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  scopeChipText: { fontFamily: 'Inter', fontWeight: '600', fontSize: 12.5, color: '#52616F' },
  scopeChipTextActive: { color: '#fff' },

  collectionContent: { gap: 8, paddingHorizontal: 2, marginTop: 8 },
  colChip: { height: 30, paddingHorizontal: 12, borderRadius: 9, backgroundColor: 'rgba(16, 42, 67, 0.05)', alignItems: 'center', justifyContent: 'center' },
  colChipActive: { backgroundColor: 'rgba(15, 107, 80, 0.1)' },
  colChipText: { fontSize: 11.5, fontWeight: '600', color: '#52616F', textTransform: 'capitalize' },
  colChipTextActive: { color: colors.primary },

  fallbackBanner: {
    marginTop: 12, marginBottom: 8, padding: 10, borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.1)', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  fallbackText: { color: colors.accent, fontSize: 11, fontWeight: '500' },

  resultsArea: { flex: 1 },
  count: { marginTop: 12, marginBottom: 8, marginHorizontal: 2, fontSize: 12.5, color: '#52616F' },
  countBold: { color: colors.secondary, fontWeight: '600' },

  card: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E9E4D8', borderRadius: 16,
    padding: 14, paddingHorizontal: 16, marginBottom: 12,
    shadowColor: 'rgba(16, 42, 67, 0.04)', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 10, elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  collectionBadge: { backgroundColor: 'rgba(16, 42, 67, 0.06)', paddingVertical: 3, paddingHorizontal: 9, borderRadius: 8 },
  collectionBadgeText: { fontSize: 11, fontWeight: '600', color: colors.secondary, textTransform: 'capitalize' },
  numberBadge: { backgroundColor: 'rgba(15, 107, 80, 0.08)', paddingVertical: 3, paddingHorizontal: 9, borderRadius: 8 },
  numberBadgeText: { fontSize: 11, fontWeight: '600', color: colors.primary },

  scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  scoreText: { fontSize: 10, fontWeight: '700' },
  semScore: { color: '#3B82F6' }, // Sky blue for semantic
  keyScore: { color: '#F59E0B' }, // Amber for keyword
  mutedScore: { color: '#CBD5E1' },
  scoreLabel: { fontSize: 9, color: '#94A3B8' },

  bmkBtn: { marginLeft: 'auto', width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  arabic: {
    marginTop: 10, fontFamily: 'Amiri', fontSize: 18, lineHeight: 34,
    color: colors.secondary, textAlign: 'right', writingDirection: 'rtl' as const,
  },
  arabicHighlight: { backgroundColor: 'rgba(15, 107, 80, 0.14)', color: colors.primary, borderRadius: 4 },
  translation: { marginTop: 6, fontSize: 13, lineHeight: 21, color: '#52616F' },
  translationHighlight: { backgroundColor: 'rgba(15, 107, 80, 0.14)', color: colors.primary, fontWeight: '600', borderRadius: 4 },

  loadingText: { marginTop: 8, fontSize: 14, color: '#52616F' },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.secondary },
  emptySub: { fontSize: 13, color: '#7A828C' },

  loadMoreBtn: {
    marginTop: 10, marginBottom: 20, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(15, 107, 80, 0.3)', alignItems: 'center',
  },
  loadMoreText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
});