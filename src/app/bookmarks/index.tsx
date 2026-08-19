/**
 * Bookmarks Hub Screen
 *
 * Central screen showing all saved items grouped by category.
 * Quran count is dynamic; other categories are placeholder counts.
 */

import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors, alpha } from '../../constants/theme';
import { bookmarkService } from '../../services/bookmarkService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ============================================
// DATA
// ============================================

interface BookmarkCategory {
  id: string;
  title: string;
  count: number;
  countLabel: string;
}

const STATIC_CATEGORIES: Omit<BookmarkCategory, 'count'>[] = [
  {
    id: 'quran',
    title: 'Quran',
    countLabel: 'saved ayahs',
  },
  {
    id: 'hadith',
    title: 'Hadith',
    countLabel: 'saved hadiths',
  },
  {
    id: 'library',
    title: 'Islamic Library',
    countLabel: 'saved books',
  },
  {
    id: 'duas',
    title: 'Duas',
    countLabel: 'saved duas',
  },
  // {
  //   id: 'videos',
  //   title: 'Videos',
  //   countLabel: 'saved videos',
  //   lastItem: 'Tafsir Al-Fatihah',
  // },
];

const PLACEHOLDER_COUNTS: Record<string, number> = {
  hadith: 0,
  library: 0,
  duas: 0,
  videos: 0,
};

// ============================================
// ICONS
// ============================================

function QuranIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M12 6.5C10.4 5.3 8.2 5.2 6 6v12c2.2-.8 4.4-.7 6 .5 1.6-1.2 3.8-1.3 6-.5V6c-2.2-.8-4.4-.7-6 .5Z" stroke={colors.primary} strokeWidth="1.7" strokeLinejoin="round" />
      <Path d="M12 6.5v12" stroke={colors.primary} strokeWidth="1.7" strokeLinejoin="round" />
    </Svg>
  );
}

function HadithIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M6 2.8h8.5A2.5 2.5 0 0 1 17 5.3v11.4a2.5 2.5 0 0 1-2.5 2.5H6a2 2 0 0 1-2-2V4.8a2 2 0 0 1 2-2Z" stroke={colors.primary} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
      <Path d="M7.5 7.5h5M7.5 10.5h5M7.5 13.5h3" stroke={colors.primary} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

function LibraryIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M5 3.5h3v17H5ZM10.5 3.5h3v17h-3Z" stroke={colors.primary} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
      <Path d="M16 4.5l3-.8 4 16-3 .8Z" stroke={colors.primary} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

function DuaIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path d="M12 19s-7-4.6-7-9.5C5 6.6 7 5 9.2 5c1.3 0 2.3.6 2.8 1.6C12.5 5.6 13.5 5 14.8 5 17 5 19 6.6 19 9.5c0 4.9-7 9.5-7 9.5Z" stroke={colors.primary} strokeWidth="1.7" strokeLinejoin="round" />
    </Svg>
  );
}

function VideoIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="6" width="17" height="12" rx="3" stroke={colors.primary} strokeWidth="1.7" strokeLinejoin="round" />
      <Path d="M10.5 9.5v5l4.5-2.5Z" fill={colors.primary} stroke="none" />
    </Svg>
  );
}

function BookmarkSummaryIcon() {
  return (
    <Svg width="22" height="22" viewBox="0 0 20 20" fill="none">
      <Path d="M6 3h8v14l-4-3.2L6 17Z" stroke={colors.primary} strokeWidth="1.7" strokeLinejoin="round" />
    </Svg>
  );
}

const CATEGORY_ICONS: Record<string, () => React.JSX.Element> = {
  quran: QuranIcon,
  hadith: HadithIcon,
  library: LibraryIcon,
  duas: DuaIcon,
  videos: VideoIcon,
};

// ============================================
// CATEGORY CARD
// ============================================

function CategoryCard({
  category,
}: {
  category: BookmarkCategory;
  index: number;
}) {
  const IconComponent = CATEGORY_ICONS[category.id];

  return (
    <Pressable
      style={styles.categoryCard}
      onPress={() => {
        if (category.id === 'quran') {
          router.push('/bookmarks/quran');
        } else if (category.id === 'hadith') {
          router.push('/bookmarks/hadith');
        } else if (category.id === 'library') {
          router.push('/bookmarks/library');
        } else if (category.id === 'duas') {
          router.push('/bookmarks/duas');
        }
      }}
    >
      <View style={styles.categoryIcon}>
        {IconComponent && <IconComponent />}
      </View>
      <View style={styles.categoryMid}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categorySubtitle} numberOfLines={1}>
          <Text style={styles.categoryCount}>{category.count}</Text>
          {' '}{category.countLabel} 
        </Text>
      </View>
      <Svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <Path d="M7.5 4.5 13 10l-5.5 5.5" stroke={alpha(colors.secondary, 0.35)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

// ============================================
// SCREEN
// ============================================

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<BookmarkCategory[]>([]);
  const [totalItems, setTotalItems] = useState(0);


    useFocusEffect(() => {
    async function loadCounts() {
      const [quranCount, hadithCount, duaCount] = await Promise.all([
        bookmarkService.getQuranCount(),
        bookmarkService.getHadithCount(),
        bookmarkService.getDuaCount(),
      ]);

      const cats: BookmarkCategory[] = STATIC_CATEGORIES.map((cat) => {
        switch (cat.id) {
          case 'quran': return { ...cat, count: quranCount };
          case 'hadith': return { ...cat, count: hadithCount };
          case 'duas': return { ...cat, count: duaCount };
          default: return { ...cat, count: PLACEHOLDER_COUNTS[cat.id] || 0 };
        }
      });

      
      

      setCategories(cats);
      const total = cats.reduce((sum, c) => sum + c.count, 0);
      setTotalItems(total);
    }
    loadCounts();
  });
  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerBtn} onPress={() => router.back()}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path d="M12.5 4.5 7 10l5.5 5.5" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Bookmarks</Text>
            <Text style={styles.headerSubtitle}>Everything you've saved</Text>
          </View>
          <Pressable style={styles.headerBtn} onPress={() => {}}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Circle cx="9" cy="9" r="6.5" stroke={colors.secondary} strokeWidth="1.8" />
              <Path d="M14 14 L18 18" stroke={colors.secondary} strokeWidth="1.8" strokeLinecap="round" />
            </Svg>
          </Pressable>
        </View>

        {/* Summary card */}
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <BookmarkSummaryIcon />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryCount}>{totalItems} items saved</Text>
            <Text style={styles.summarySub}>across {categories.length} categories</Text>
          </View>
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>Browse by category</Text>

        {/* Category list */}
        <View style={styles.categoryList}>
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 26,
    letterSpacing: -0.01,
    color: colors.secondary,
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
  },
  summary: {
    marginTop: 16,
    backgroundColor: alpha(colors.primary, 0.06),
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.22),
    borderRadius: 18,
    padding: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: alpha(colors.primary, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
  },
  summaryCount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  summarySub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 8,
    marginHorizontal: 2,
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },
  categoryList: {
    flexDirection: 'column',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  categoryIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryMid: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  categoryTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: colors.secondary,
  },
  categorySubtitle: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  categoryCount: {
    color: colors.primary,
    fontWeight: '600',
  },
});