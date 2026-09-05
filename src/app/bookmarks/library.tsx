/**
 * Library Bookmarks Screen
 *
 * Displays saved Library bookmarks.
 * Route: /bookmarks/library
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, alpha } from '../../constants/theme';
import { CATEGORY_NAMES } from '../../constants/library';
import { bookmarkService } from '../../services/bookmarkService';
import type { LibraryBookmark } from '../../types/bookmark';
import { BackIcon, BookIcon, LibraryIcon, RemoveIcon } from '@/components/Icons';

// ============================================
// ICONS
// ============================================


// ============================================
// BOOKMARK CARD
// ============================================

function BookmarkCard({
  bookmark,
  onRemove,
}: {
  bookmark: LibraryBookmark;
  onRemove: () => void;
}) {
  const categoryInfo = CATEGORY_NAMES[bookmark.categoryId];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/book-detail?bookId=${bookmark.id}`)}
    >
      <View style={styles.cover}>
        <BookIcon size={22} color={colors.primary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {bookmark.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {bookmark.author}
        </Text>
        <View style={styles.cardMeta}>
          {categoryInfo && (
            <View style={styles.metaTag}>
              <Text style={styles.metaTagText}>{categoryInfo.name}</Text>
            </View>
          )}
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}
        onPress={onRemove}
      >
        <RemoveIcon size = {16} color={colors.textMuted}/>
      </Pressable>
    </Pressable>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function LibraryBookmarksScreen() {
  const insets = useSafeAreaInsets();
  const [bookmarks, setBookmarks] = useState<LibraryBookmark[]>([]);

  const loadBookmarks = useCallback(async () => {
    const all = await bookmarkService.getAllLibrary();
    setBookmarks(all);
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  async function handleRemove(id: string) {
    await bookmarkService.removeLibrary(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop:  16, paddingBottom: insets.bottom + 34 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerBtn} onPress={() => router.back()}>
         <BackIcon/>
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Library Bookmarks</Text>
            <Text style={styles.headerSubtitle}>
              {bookmarks.length > 0 ? `${bookmarks.length} saved` : 'Your saved books'}
            </Text>
          </View>
          <View style={styles.headerBtn} />
        </View>

        {/* Empty state */}
        {bookmarks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <LibraryIcon size={40} color={colors.textMuted}/>
            </View>
            <Text style={styles.emptyTitle}>No bookmarks yet</Text>
            <Text style={styles.emptySubtitle}>
              Save books you want to read later. They'll appear here.
            </Text>
          </View>
        ) : (
          /* Bookmarks list */
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onRemove={() => handleRemove(bookmark.id)}
              />
            ))}
          </ScrollView>
        )}
      </View>
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
  content: {
    flex: 1,
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
    fontSize: 20,
    letterSpacing: -0.01,
    color: colors.secondary,
  },
  headerSubtitle: {
    // marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },

  // List
  list: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    gap: 12,
    paddingBottom: 6,
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
  cardMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  metaTag: {
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnPressed: {
    backgroundColor: alpha(colors.error || '#E53E3E', 0.08),
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: alpha(colors.secondary, 0.04),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 17,
    color: colors.secondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});