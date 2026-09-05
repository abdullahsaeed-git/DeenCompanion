/**
 * Hadith Bookmarks Screen
 *
 * Displays saved hadith bookmarks with ability to open or delete.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, alpha } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HadithBookmark, bookmarkService } from '../../services/bookmarkService';
import { GradeBadge } from '../../components/hadith/GradeBadge';
import { BackIcon, DeleteIcon, HadithIcon } from '@/components/Icons';

// ============================================
// HELPERS
// ============================================

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

// ============================================
// BOOKMARK CARD
// ============================================

function BookmarkCard({
  bookmark,
  onPress,
  onDelete,
}: {
  bookmark: HadithBookmark;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      {/* Top row: number + grade + delete */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.hadithNumber}>#{bookmark.hadithNumber}</Text>
          <Text style={styles.collectionName} numberOfLines={1}>
            {bookmark.reference.split('·')[0].trim()}
          </Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <GradeBadge grade={bookmark.displayGrade} size="sm" />
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
            onPress={onDelete}
          >
            <DeleteIcon size={16} color={colors.error}/>
          </Pressable>
        </View>
      </View>

      {/* Narrator */}
      {bookmark.narrator ? (
        <Text style={styles.narrator} numberOfLines={1}>
          Narrated by {bookmark.narrator}
        </Text>
      ) : null}

      {/* Translation preview */}
      {bookmark.translation ? (
        <Text style={styles.preview} numberOfLines={2}>
          "{truncateText(bookmark.translation, 120)}"
        </Text>
      ) : bookmark.arabicText ? (
        <Text style={styles.previewArabic} numberOfLines={2}>
          {truncateText(bookmark.arabicText, 100)}
        </Text>
      ) : null}

      {/* Footer: book name + time */}
      <View style={styles.cardFooter}>
        {bookmark.bookName ? (
          <Text style={styles.bookName} numberOfLines={1}>
            {bookmark.bookName}
          </Text>
        ) : null}
        <Text style={styles.timeAgo}>{formatTimeAgo(bookmark.savedAt)}</Text>
      </View>
    </Pressable>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function LibraryBookmarksScreen() {
  const insets = useSafeAreaInsets();
  const [bookmarks, setBookmarks] = useState<HadithBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    const data = await bookmarkService.getAllHadith();
    setBookmarks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  async function handleDelete(id: string) {
    await bookmarkService.removeHadith(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  function handleOpen(bookmark: HadithBookmark) {
    router.push({
      pathname: '/hadith-reader',
      params: {
        collectionId: bookmark.collectionId,
        hadithNumber: String(bookmark.hadithNumber),
      },
    });
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop:  16 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerBtn} onPress={() => router.back()}>
            <BackIcon/>
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Hadith Bookmarks</Text>
            <Text style={styles.headerSubtitle}>
              {bookmarks.length > 0
                ? `${bookmarks.length} saved hadith${bookmarks.length !== 1 ? 's' : ''}`
                : 'No saved hadiths yet'}
            </Text>
          </View>

          <View style={styles.headerBtn} />
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : bookmarks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
                <HadithIcon size ={40} color= {colors.textMuted}/>
            </View>
            <Text style={styles.emptyTitle}>No bookmarks yet</Text>
            <Text style={styles.emptySubtitle}>
              Save hadiths you want to revisit. They'll appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 20 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <BookmarkCard
                bookmark={item}
                onPress={() => handleOpen(item)}
                onDelete={() => handleDelete(item.id)}
              />
            )}
          />
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

  // Bookmark card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: { transform: [{ scale: 0.98 }], backgroundColor: colors.pressedBg },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hadithNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  collectionName: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnPressed: {
    backgroundColor: alpha(colors.error, 0.08),
  },
  narrator: {
    marginTop: 8,
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '500',
  },
  preview: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 13 * 1.6,
    color: colors.textSecondary,
  },
  previewArabic: {
    marginTop: 6,
    fontFamily: 'Amiri',
    fontSize: 15,
    lineHeight: 15 * 1.8,
    color: colors.textSecondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookName: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '500',
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
});