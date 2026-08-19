/**
 * Quran Tab Screen
 *
 * Surah list, Juz list, and Page input.
 * All navigate to quran-reader with appropriate params.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, alpha } from '../../constants/theme';
import { quranService } from '../../services/quranService';
import { SurahRow } from '../../components/quran/SurahRow';
import { JuzRow } from '../../components/quran/JuzRow';
import { Surah } from '../../types/quran';

type Tab = 'surah' | 'juz' | 'page';

// ── JUZ DATA ───────────────────────────────────────────
interface JuzItem {
  number: number;
  name: string;
  meta: string;
}

const JUZ_DATA: JuzItem[] = [
  { number: 1, name: 'Juz 1', meta: 'Al-Fatihah 1 → Al-Baqarah 141' },
  { number: 2, name: 'Juz 2', meta: 'Al-Baqarah 142 → 252' },
  { number: 3, name: 'Juz 3', meta: 'Al-Baqarah 253 → Aal-Imran 92' },
  { number: 4, name: 'Juz 4', meta: 'Aal-Imran 93 → An-Nisa 23' },
  { number: 5, name: 'Juz 5', meta: 'An-Nisa 24 → 147' },
  { number: 6, name: 'Juz 6', meta: 'An-Nisa 148 → Al-Ma\'idah 81' },
  { number: 7, name: 'Juz 7', meta: 'Al-Ma\'idah 82 → Al-An\'am 110' },
  { number: 8, name: 'Juz 8', meta: 'Al-An\'am 111 → Al-A\'raf 87' },
  { number: 9, name: 'Juz 9', meta: 'Al-A\'raf 88 → 170' },
  { number: 10, name: 'Juz 10', meta: 'Al-A\'raf 171 → Al-Anfal 40' },
  { number: 11, name: 'Juz 11', meta: 'Al-Anfal 41 → At-Taubah 92' },
  { number: 12, name: 'Juz 12', meta: 'At-Taubah 93 → Hud 5' },
  { number: 13, name: 'Juz 13', meta: 'Hud 6 → Yusuf 52' },
  { number: 14, name: 'Juz 14', meta: 'Yusuf 53 → Ibrahim 52' },
  { number: 15, name: 'Juz 15', meta: 'Al-Hijr 1 → An-Nahl 128' },
  { number: 16, name: 'Juz 16', meta: 'Al-Isra 1 → Al-Kahf 74' },
  { number: 17, name: 'Juz 17', meta: 'Al-Kahf 75 → Ta-Ha 135' },
  { number: 18, name: 'Juz 18', meta: 'Al-Anbiya 1 → Al-Hajj 78' },
  { number: 19, name: 'Juz 19', meta: 'Al-Mu\'minun 1 → Al-Furqan 20' },
  { number: 20, name: 'Juz 20', meta: 'Al-Furqan 21 → An-Naml 55' },
  { number: 21, name: 'Juz 21', meta: 'An-Naml 56 → Al-Ankabut 45' },
  { number: 22, name: 'Juz 22', meta: 'Al-Ankabut 46 → Al-Ahzab 30' },
  { number: 23, name: 'Juz 23', meta: 'Al-Ahzab 31 → Ya-Sin 27' },
  { number: 24, name: 'Juz 24', meta: 'Ya-Sin 28 → Az-Zumar 31' },
  { number: 25, name: 'Juz 25', meta: 'Az-Zumar 32 → Fussilat 46' },
  { number: 26, name: 'Juz 26', meta: 'Fussilat 47 → Al-Jathiyah 37' },
  { number: 27, name: 'Juz 27', meta: 'Al-Ahqaf 1 → Adh-Dhariyat 30' },
  { number: 28, name: 'Juz 28', meta: 'Adh-Dhariyat 31 → Al-Hadid 29' },
  { number: 29, name: 'Juz 29', meta: 'Al-Mujadilah 1 → At-Tahrim 12' },
  { number: 30, name: 'Juz 30', meta: 'Al-Mulk 1 → An-Nas 6' },
];

// ── ICONS ──────────────────────────────────────────────
function SearchIcon({ color = colors.primary, opacity = 0.55 }: { color?: string; opacity?: number }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <Circle cx={9} cy={9} r={6.5} stroke={color} strokeWidth={1.8} opacity={opacity} />
      <Path d="M14 14 L18 18" stroke={color} strokeWidth={1.8} strokeLinecap="round" opacity={opacity} />
    </Svg>
  );
}

function BookmarkIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 20 20" fill="none">
      <Path d="M6 3h8v14l-4-3.2L6 17Z" stroke={colors.secondary} strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  );
}

// ── MAIN SCREEN ────────────────────────────────────────
export default function QuranScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('surah');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState(true);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const [pageError, setPageError] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  // Load surahs once
  useEffect(() => {
    quranService.getAllSurahs().then((data) => {
      setSurahs(data);
      setLoadingSurahs(false);
    });
  }, []);

  // Filtered surahs
  const filteredSurahs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || activeTab !== 'surah') return surahs;
    return surahs.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.arabicName.toLowerCase().includes(q) ||
        String(s.number).includes(q)
    );
  }, [search, surahs, activeTab]);

  // Filtered juz
  const filteredJuz = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || activeTab !== 'juz') return JUZ_DATA;
    return JUZ_DATA.filter(
      (j) =>
        j.name.toLowerCase().includes(q) ||
        j.meta.toLowerCase().includes(q) ||
        String(j.number).includes(q)
    );
  }, [search, activeTab]);

  const handleSurahPress = useCallback((surahNumber: number) => {
    router.push({
      pathname: '/quran-reader',
      params: { surahNumber: String(surahNumber), mode: 'ayah' },
    });
  }, []);

  const handleJuzPress = useCallback((juzNumber: number) => {
    router.push({
      pathname: '/quran-reader',
      params: { juzNumber: String(juzNumber), mode: 'mushaf' },
    });
  }, []);

  const handleGoToPage = useCallback(() => {
    const page = parseInt(pageInput, 10);
    if (isNaN(page) || page < 1 || page > 604) {
      setPageError('Please enter a number between 1 and 604');
      return;
    }
    setPageError('');
    router.push({
      pathname: '/quran-reader',
      params: { pageNumber: String(page), mode: 'page' },
    });
  }, [pageInput]);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  // const searchPlaceholder = activeTab === 'surah' ? 'Search Surah…' : 'Search Juz…';
  const searchPlaceholder = 'Search Quran';

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quran</Text>
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={focusSearch}
          >
            <SearchIcon color={colors.secondary} opacity={1} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={() => router.push('/bookmarks/quran')}
          >
            <BookmarkIcon />
          </Pressable>
        </View>
      </View>

      {/* Search — hidden on Page tab */}
      {(
        <View style={[styles.searchWrap, searchFocused && styles.searchWrapFocused]}>
          <SearchIcon />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </View>
      )}

      {/* Tabs */}
      <View style={styles.seg}>
        {(['surah', 'juz', 'page'] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.segButton, activeTab === tab && styles.segButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
                       <Text
              style={[
                styles.segButtonText,
                activeTab === tab && styles.segButtonTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── CONTENT AREA ─────────────────────────────────── */}
      <View style={styles.contentArea}>
        {/* Surah tab */}
        <View style={[styles.tabPanel, activeTab !== 'surah' && styles.tabHidden]}>
          {loadingSurahs ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.listCard}>
              <FlatList
                data={filteredSurahs}
                keyExtractor={(item) => String(item.number)}
                renderItem={({ item }) => (
                  <SurahRow
                    surah={item}
                    onPress={() => handleSurahPress(item.number)}
                  />
                )}
                ItemSeparatorComponent={() => <View style={styles.divider} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                initialNumToRender={12}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
              />
            </View>
          )}
        </View>

        {/* Juz tab */}
        <View style={[styles.tabPanel, activeTab !== 'juz' && styles.tabHidden]}>
          <View style={styles.listCard}>
            <FlatList
              data={filteredJuz}
              keyExtractor={(item) => String(item.number)}
              renderItem={({ item }) => (
                <JuzRow
                  number={item.number}
                  name={item.name}
                  meta={item.meta}
                  onPress={() => handleJuzPress(item.number)}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
            />
          </View>
        </View>

       {/* Page tab */}
<View style={[styles.tabPanel, activeTab !== 'page' && styles.tabHidden, styles.pageTabPanel]}>
  <View style={styles.pageCard}>
    <Text style={styles.pageTitle} numberOfLines={1}>
      Go to Page
    </Text>
    <Text style={styles.pageSubtitle} numberOfLines={2}>
      Enter a page number between 1 and 604
    </Text>

    <View style={styles.pageInputWrap}>
      <TextInput
        style={styles.pageInput}
        placeholder="e.g. 255"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        maxLength={3}
        value={pageInput}
        onChangeText={(text) => {
          setPageInput(text);
          setPageError('');
        }}
        onSubmitEditing={handleGoToPage}
      />
      <Pressable
        style={({ pressed }) => [
          styles.pageButton,
          pressed && styles.pageButtonPressed,
        ]}
        onPress={handleGoToPage}
      >
        <Text style={styles.pageButtonText}>Go</Text>
      </Pressable>
    </View>

    {pageError ? (
      <Text style={styles.pageError}>{pageError}</Text>
    ) : null}
  </View>
</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 26,
    letterSpacing: -0.01,
    color: colors.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  iconButtonPressed: {
    backgroundColor: '#FBF9F3',
    transform: [{ scale: 0.96 }],
  },
  searchWrap: {
    marginTop: 14,
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  searchWrapFocused: {
    borderColor: colors.primary,
    shadowColor: alpha(colors.primary, 0.12),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.secondary,
    fontFamily: 'Inter',
  },
  seg: {
    marginTop: 14,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  segButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: alpha(colors.primary, 0.25),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  segButtonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  segButtonTextActive: {
    color: colors.surface,
  },
  contentArea: {
    flex: 1,
    marginTop: 16,
  },
  tabPanel: {
    flex:1
  },
  tabHidden: {
    display: 'none',
  },
  listCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: alpha(colors.secondary, 0.05),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  listContent: {
    paddingBottom: 16,
  },
  divider: {
    marginLeft: 72,
    marginRight: 16,
    height: 1,
    backgroundColor: '#EFEAE0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── PAGE INPUT ───────────────────────────────────────
 pageTabPanel: {
  flex: 1,
  // justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 20,
},
pageCard: {
  width: '100%',
  maxWidth: 360,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 20,
  padding: 24,
  shadowColor: alpha(colors.secondary, 0.05),
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 12,
  elevation: 2,
},
pageTitle: {
  fontFamily: 'Poppins',
  fontWeight: '600',
  fontSize: 18,
  color: colors.secondary,
  textAlign: 'center',
},
pageSubtitle: {
  fontSize: 13,
  color: colors.textMuted,
  textAlign: 'center',
  marginTop: 4,
  marginBottom: 20,
},
pageInputWrap: {
  flexDirection: 'row',
  gap: 12,
  alignItems: 'center',
  width: '100%',
},
pageInput: {
  flex: 1,
  minWidth: 0,
  height: 52,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 14,
  paddingHorizontal: 16,
  fontSize: 16,
  color: colors.secondary,
  fontFamily: 'Inter',
  textAlign: 'center',
},
pageButton: {
  height: 52,
  paddingHorizontal: 24,
  borderRadius: 14,
  backgroundColor: colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  shadowColor: alpha(colors.primary, 0.25),
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 10,
  elevation: 3,
},
pageButtonPressed: {
  opacity: 0.9,
  transform: [{ scale: 0.96 }],
},
pageButtonText: {
  fontFamily: 'Inter',
  fontWeight: '600',
  fontSize: 15,
  color: colors.surface,
},
pageError: {
  marginTop: 12,
  fontSize: 13,
  color: colors.error,
  textAlign: 'center',
},
});