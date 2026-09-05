/**
 * Library Category Screen
 *
 * Displays all books within a category.
 * Route: /library-category?categoryId={id}
 */

import { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';
import { CATEGORY_NAMES, getBooksByCategory, type LibraryBook } from '../constants/library';
import { BackIcon, BookIcon, ChevronRightIcon, SearchIcon } from '@/components/Icons';

// ============================================
// ICONS
// ============================================

// function BackIcon() {
//   return (
//     <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
//       <Path
//         d="M12.5 4.5 7 10l5.5 5.5"
//         stroke={colors.secondary}
//         strokeWidth={2}
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </Svg>
//   );
// }

// function SearchIcon() {
//   return (
//     <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
//       <Path
//         d="M9 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z"
//         stroke={colors.secondary}
//         strokeWidth={1.8}
//       />
//       <Path
//         d="M13 13l3.5 3.5"
//         stroke={colors.secondary}
//         strokeWidth={1.8}
//         strokeLinecap="round"
//       />
//     </Svg>
//   );
// }

// function BookIcon() {
//   return (
//     <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.6} strokeLinejoin="round">
//       <Path d="M12 6c-2-1.4-4.5-1.5-7-.6V19c2.5-.9 5-.8 7 .6 2-1.4 4.5-1.5 7-.6V5.4c-2.5-.9-5-.8-7 .6Z" />
//       <Path d="M12 6v13.6" />
//     </Svg>
//   );
// }

// function ChevronRightIcon() {
//   return (
//     <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
//       <Path
//         d="M7.5 4.5 13 10l-5.5 5.5"
//         stroke={alpha(colors.secondary, 0.35)}
//         strokeWidth={2}
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </Svg>
//   );
// }

// ============================================
// BOOK CARD
// ============================================

function BookCard({ book }: { book: LibraryBook }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/book-detail?bookId=${book.id}`)}
    >
      <View style={styles.cover}>
        <BookIcon color={colors.primary}/>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author}
        </Text>
        <Text style={styles.bookMeta}>
          {book.language} · {book.size}
        </Text>
      </View>
      <ChevronRightIcon />
    </Pressable>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function LibraryCategoryScreen() {
  const insets = useSafeAreaInsets();
  const { categoryId } = useLocalSearchParams();
  const appCategoryId = (categoryId as string) || 'seerah';

  const [query, setQuery] = useState('');

  const categoryBooks = useMemo(
    () => getBooksByCategory(appCategoryId),
    [appCategoryId],
  );

  const categoryInfo = CATEGORY_NAMES[appCategoryId] || {
    name: 'Unknown',
    arabicName: '',
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return categoryBooks;
    const q = query.toLowerCase();
    return categoryBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q),
    );
  }, [categoryBooks, query]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 8, paddingBottom: insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <BackIcon />
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{categoryInfo.name}</Text>
            {categoryInfo.arabicName ? (
              <Text style={styles.arabicTitle}>
                {categoryInfo.arabicName}
              </Text>
            ) : null}
            <Text style={styles.bookCount}>
              {categoryBooks.length} books
            </Text>
          </View>
          <Pressable style={styles.iconButton}>
            <SearchIcon />
          </Pressable>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books or authors…"
            placeholderTextColor={alpha(colors.secondary, 0.4)}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Book list */}
        <View style={styles.list}>
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>No books found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 12 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 20,
    color: colors.secondary,
    letterSpacing: -0.01,
    textAlign: 'center',
  },
  arabicTitle: {
    fontFamily: 'Amiri',
    fontSize: 17,
    color: colors.primary,
    // marginTop: 3,
    textAlign: 'center',
  },
  bookCount: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },

  // Search
  searchContainer: {
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.secondary,
    padding: 0,
  },

  // List
  list: {
    marginTop: 4,
    gap: 12,
    paddingBottom: 6,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 15,
    color: colors.textSecondary,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.pressedBg,
  },
  cover: {
    width: 46,
    height: 62,
    borderRadius: 8,
    backgroundColor: alpha(colors.primary, 0.08),
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.25),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  bookTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.secondary,
    lineHeight: 14.5 * 1.3,
  },
  bookAuthor: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bookMeta: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
});