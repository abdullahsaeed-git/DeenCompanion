/**
 * Duas Bookmarks Screen
 *
 * Displays saved Dua bookmarks with ability to open or delete.
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
import { DuaBookmark, bookmarkService } from '../../services/bookmarkService';

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
  onDelete,
}: {
  bookmark: DuaBookmark;
  onDelete: () => void;
}) {
  return (
    <View style={styles.card}>
      {/* Top row: source + delete */}
      <View style={styles.cardHeader}>
        <Text style={styles.source} numberOfLines={1}>{bookmark.source}</Text>
        <Pressable
          style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
          onPress={onDelete}
        >
          <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
            <Path
              d="M6 5h8M8 5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5 5l.8 12a1 1 0 0 0 1 .9h6.4a1 1 0 0 0 1-.9L15 5"
              stroke={colors.error}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </View>

      {/* Arabic text */}
      <Text style={styles.arabic} numberOfLines={3} ellipsizeMode="tail">
        {bookmark.arabic}
      </Text>

      {/* Translation */}
      <Text style={styles.translation} numberOfLines={3}>
        "{truncateText(bookmark.translation, 150)}"
      </Text>

      {/* Footer: time */}
      <View style={styles.cardFooter}>
        <Text style={styles.timeAgo}>{formatTimeAgo(bookmark.savedAt)}</Text>
      </View>
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function DuasBookmarksScreen() {
  const insets = useSafeAreaInsets();
  const [bookmarks, setBookmarks] = useState<DuaBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    const data = await bookmarkService.getAllDuas();
    setBookmarks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  async function handleDelete(id: string) {
    await bookmarkService.removeDua(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerBtn} onPress={() => router.back()}>
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Path
                d="M12.5 4.5 7 10l5.5 5.5"
                stroke={colors.secondary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Dua Bookmarks</Text>
            <Text style={styles.headerSubtitle}>
              {bookmarks.length > 0
                ? `${bookmarks.length} saved dua${bookmarks.length !== 1 ? 's' : ''}`
                : 'No saved duas yet'}
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
              <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 19s-7-4.6-7-9.5C5 6.6 7 5 9.2 5c1.3 0 2.3.6 2.8 1.6C12.5 5.6 13.5 5 14.8 5 17 5 19 6.6 19 9.5c0 4.9-7 9.5-7 9.5Z"
                  stroke={colors.textMuted}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text style={styles.emptyTitle}>No bookmarks yet</Text>
            <Text style={styles.emptySubtitle}>
              Save duas you want to revisit later. They'll appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: insets.top +20 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <BookmarkCard
                bookmark={item}
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
    fontSize: 24,
    letterSpacing: -0.01,
    color: colors.secondary,
  },
  headerSubtitle: {
    marginTop: 2,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  source: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
    marginRight: 8,
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
  arabic: {
    fontFamily: 'Amiri',
    fontSize: 18,
    lineHeight: 18 * 2,
    color: colors.secondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translation: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 13 * 1.6,
    color: colors.textSecondary,
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  timeAgo: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
});