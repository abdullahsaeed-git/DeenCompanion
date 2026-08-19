/**
 * Library Bookmarks Screen
 *
 * Displays saved Library bookmarks.
 * Empty state — no bookmarks yet.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, alpha } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LibraryBookmarksScreen() {
  const insets = useSafeAreaInsets();

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
            <Text style={styles.headerTitle}>Library Bookmarks</Text>
            <Text style={styles.headerSubtitle}>Your saved books</Text>
          </View>

          <Pressable
            style={styles.headerBtn}
            onPress={() => {}}
          >
            <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <Circle
                cx="9"
                cy="9"
                r="6.5"
                stroke={colors.secondary}
                strokeWidth="1.8"
              />
              <Path
                d="M14 14 L18 18"
                stroke={colors.secondary}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        </View>

        {/* Empty state */}
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 3.5h3v17H5ZM10.5 3.5h3v17h-3Z"
                stroke={colors.textMuted}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Path
                d="M16 4.5l3-.8 4 16-3 .8Z"
                stroke={colors.textMuted}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptySubtitle}>
            Save books you want to read later. They'll appear here.
          </Text>
        </View>
      </View>
    </View>
  );
}

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
    fontSize: 24,
    letterSpacing: -0.01,
    color: colors.secondary,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
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