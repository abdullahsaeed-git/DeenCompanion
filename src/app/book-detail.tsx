/**
 * Library Book Detail Screen
 *
 * Shows book info and about section.
 * Route: /book-detail?bookId={id}
 */

import { View, Text, Pressable, ScrollView, StyleSheet, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { colors, alpha } from "../constants/theme";
import { CATEGORY_NAMES, getBookById } from "../constants/library";
import { useEffect, useState } from "react";
import { bookmarkService } from "@/services/bookmarkService";
import { BookCoverIcon } from "@/components/Icons";

// ============================================
// ICONS
// ============================================

function ShareIcon() {
  return (
    <Svg
      width={19}
      height={19}
      viewBox="0 0 20 20"
      fill="none"
      stroke={colors.secondary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M10 12V3.5M6.8 6.2 10 3l3.2 3.2" />
      <Path d="M5 9H4.5A1.5 1.5 0 0 0 3 10.5v5A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 15.5 9H15" />
    </Svg>
  );
}

// function BookCoverIcon() {
//   return (
//     <Svg
//       width={40}
//       height={40}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={colors.primary}
//       strokeWidth={1.6}
//       strokeLinejoin="round"
//     >
//       <Path d="M12 6c-2-1.4-4.5-1.5-7-.6V19c2.5-.9 5-.8 7 .6 2-1.4 4.5-1.5 7-.6V5.4c-2.5-.9-5-.8-7 .6Z" />
//       <Path d="M12 6v13.6" />
//     </Svg>
//   );
// }

// ============================================
// MAIN SCREEN
// ============================================

export default function BookDetailScreen() {
  const insets = useSafeAreaInsets();
  const { bookId } = useLocalSearchParams();
  const appBookId = (bookId as string) || "s1";

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    bookmarkService.isLibraryBookmarked(appBookId).then(setSaved);
  }, [appBookId]);

  const book = getBookById(appBookId);

  if (!book) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.notFoundText}>Book not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const categoryInfo = CATEGORY_NAMES[book.categoryId];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 8 }]}>
        <Pressable style={styles.headerBtn} onPress={() => router.back()}>
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
              d="M12.5 4.5 7 10l5.5 5.5"
              stroke={colors.secondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <Pressable
          style={styles.headerBtn}
          onPress={async () => {
            const newState = await bookmarkService.toggleLibrary({
              id: book.id,
              title: book.title,
              author: book.author,
              categoryId: book.categoryId,
            });
            setSaved(newState);
          }}
        >
          <Svg
            width={19}
            height={19}
            viewBox="0 0 20 20"
            fill={saved ? colors.accent : "none"}
          >
            <Path
              d="M6 3h8v14l-4-3.2L6 17Z"
              stroke={saved ? colors.accent : colors.secondary}
              strokeWidth={1.7}
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 68, paddingBottom: insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={styles.hero}>
          <View style={styles.cover}>
            <View style={styles.coverSpine} />
            <BookCoverIcon />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={styles.heroAuthor}>{book.author}</Text>
            {book.arabicTitle ? (
              <Text style={styles.heroArabic}>{book.arabicTitle}</Text>
            ) : null}
            <View style={styles.tags}>
              {categoryInfo && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{categoryInfo.name}</Text>
                </View>
              )}
              <View style={styles.tagAlt}>
                <Text style={styles.tagAltText}>{book.language}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* About — only show if we have it */}
        {book.about ? (
          <>
            <Text style={styles.sectionLabel}>About this book</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutText}>{book.about}</Text>
            </View>
          </>
        ) : null}

        {book.sourceUrl ? (
          <Pressable
            style={({ pressed }) => [
              styles.openBookBtn,
              pressed && styles.openBookBtnPressed,
            ]}
            onPress={() => book.sourceUrl && Linking.openURL(book.sourceUrl)}
          >
            <Text style={styles.openBookBtnText}>Open Book</Text>
            <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
              <Path
                d="M7.5 4.5 13 10l-5.5 5.5"
                stroke={colors.surface}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        ) : (
          <>
            {/* Coming soon */}
            <View style={styles.comingSoonCard}>
              <View style={styles.comingSoonIconWrap}>
                <Svg
                  width={28}
                  height={28}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <Path d="M12 4c-3.3 0-5 2.5-5 5.7v3l-1.5 2.3h13L17 12.7v-3c0-3.2-1.7-5.7-5-5.7Z" />
                  <Path d="M10.3 17.5a1.8 1.8 0 0 0 3.4 0" />
                  <Circle
                    cx={18}
                    cy={6}
                    r={3}
                    fill={colors.accent}
                    stroke="none"
                  />
                </Svg>
              </View>
              <Text style={styles.comingSoonTitle}>Coming Soon</Text>
              <Text style={styles.comingSoonText}>
                Download and in-app reading features are on their way — in shaa
                Allah, in a future update.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  notFoundText: { fontSize: 15, color: colors.textSecondary },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: alpha(colors.primary, 0.09),
    borderRadius: 10,
  },
  backButtonText: { color: colors.primary, fontWeight: "600", fontSize: 14 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 0 },

  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingBottom: 4,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 16,
    color: colors.secondary,
    textAlign: "center",
  },

  // Hero
  hero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    shadowColor: alpha(colors.secondary, 0.05),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  cover: {
    width: 84,
    height: 116,
    borderRadius: 10,
    backgroundColor: alpha(colors.primary, 0.1),
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.3),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  coverSpine: {
    position: "absolute",
    left: 7,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: alpha(colors.primary, 0.35),
  },
  heroInfo: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  heroTitle: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 18,
    color: colors.secondary,
    lineHeight: 18 * 1.25,
  },
  heroAuthor: {
    fontSize: 13,
    color: "#52616F",
  },
  heroArabic: {
    fontFamily: "Amiri",
    fontSize: 13,
    color: colors.primary,
  },
  tags: {
    marginTop: "auto",
    flexDirection: "row",
    gap: 6,
  },
  tag: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: "center",
    justifyContent: "center",
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
  },
  tagAlt: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: alpha(colors.secondary, 0.06),
    alignItems: "center",
    justifyContent: "center",
  },
  tagAltText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#52616F",
  },

  // Section label
  sectionLabel: {
    marginTop: 20,
    marginHorizontal: 2,
    marginBottom: 8,
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.textMuted,
    fontWeight: "600",
  },

  // About
  aboutCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    paddingLeft: 16,
    paddingRight: 16,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 13 * 1.65,
    color: "#52616F",
  },

  // Coming soon
  comingSoonCard: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  comingSoonIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: "center",
    justifyContent: "center",
  },
  comingSoonTitle: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 18,
    color: colors.secondary,
    marginTop: 14,
  },
  comingSoonText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 13 * 1.6,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 260,
  },

  // Open book Btn
  openBookBtn: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 12,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: alpha(colors.primary, 0.28),
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  openBookBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  openBookBtnText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 14,
    color: "#FFFFFF",
  },
});
