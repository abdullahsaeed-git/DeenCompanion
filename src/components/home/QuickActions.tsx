/**
 * Quick Actions Grid
 *
 * 4 equal-width buttons: Quran, Hadith, Tasbih
 * Each has an SVG icon and a label.
 *
 * Layout: flexDirection:'row' with flex:1 on each item
 * creates equal-width columns (mimics CSS grid 4-column).
 *
 * onPress handlers are no-ops for now — will navigate
 * to respective screens once they're built.
 */

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ColorValue,
  TextInput,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors, alpha } from "../../constants/theme";
import { router } from "expo-router";
import {
  BookmarkIcon,
  ChevronRightIcon,
  DuaIcon,
  HijriIcon,
  SearchIcon,
  TasbihIcon,
} from "../Icons";

/** Quran icon — open book */
function QuranIcon() {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 20 20"
      fill="none"
      stroke="#0F6B50"
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Path d="M10 6C8 4.6 5.5 4.5 3 5.4V15c2.5-.9 5-.8 7 .6 2-1.4 4.5-1.5 7-.6V5.4C14.5 4.5 12 4.6 10 6Z" />
      <Path d="M10 6v9.6" />
    </Svg>
  );
}

/** Hadith icon — book with text lines */
function HadithIcon() {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 20 20"
      fill="none"
      stroke="#0F6B50"
      strokeWidth={1.7}
      strokeLinejoin="round"
    >
      <Path d="M6 2.8h8.5A2.5 2.5 0 0 1 17 5.3v11.4a2.5 2.5 0 0 1-2.5 2.5H6a2 2 0 0 1-2-2V4.8a2 2 0 0 1 2-2Z" />
      <Path d="M7.5 7.5h5M7.5 10.5h5M7.5 13.5h3" strokeLinecap="round" />
    </Svg>
  );
}

/** Tasbih icon — prayer beads arrangement */

/** Right arrow icon — used in Continue/Read More buttons */
export function ArrowRightIcon({ size = 14 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M4 10h11M11 5.5 15.5 10 11 14.5"
        stroke="#0F6B50"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function QuickActions() {
  return (
    <View style={styles.quickActionsSection}>
      {/* Quick Actions */}
      <View style={styles.quickActionsHeader}>
        <Text style={styles.quickActionsLabel}>Quick Actions</Text>
        <Pressable
          style={({ pressed }) => [
            styles.moreButton,
            pressed && styles.moreButtonPressed,
          ]}
          onPress={() => router.push("/features")}
        >
          <Text style={styles.moreText}>More</Text>
          <ChevronRightIcon size={14} color={colors.primary} />
        </Pressable>
      </View>
      {/* <QuickActions /> */}

      <>
        {
          <Pressable style={[styles.searchWrap]} onPress = {() => router.push("/search")}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder={"Search Deen"}
              placeholderTextColor={colors.textMuted}
              editable={false}
            />
          </Pressable>
        }
        <View style={styles.grid}>
          <Pressable
            style={({ pressed }) => [
              styles.action,
              pressed && styles.actionPressed,
            ]}
            onPress={() => {
              router.push("/dua-collection");
            }}
          >
            <View style={styles.actionIcon}>
              <DuaIcon  size = {22} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Duas</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.action,
              pressed && styles.actionPressed,
            ]}
            onPress={() => {
              router.push("/islamic-calendar");
            }}
          >
            <View style={styles.actionIcon}>
              <HijriIcon size = {22} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Calender</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.action,
              pressed && styles.actionPressed,
            ]}
            onPress={() => {
              router.push("./bookmarks");
            }}
          >
            <View style={styles.actionIcon}>
              <BookmarkIcon size = {22} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Bookmarks</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.action,
              pressed && styles.actionPressed,
            ]}
            onPress={() => {
              router.push("/tasbih");
            }}
          >
            <View style={styles.actionIcon}>
              <TasbihIcon size = {22} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Tasbih</Text>
          </Pressable>
        </View>
      </>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsSection: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9E4D8",
    borderRadius: 16,
    padding: 14,
    // flexDirection: 'row',
    // alignItems: 'center',
    gap: 12,
    shadowColor: "rgba(16, 42, 67, 0.04)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  quickActionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  quickActionsLabel: {
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: "uppercase",
    color: colors.textMuted,
    fontWeight: "600",
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  moreButtonPressed: {
    opacity: 0.7,
  },
  moreText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.primary,
  },
  // HTML: display:grid, grid-template-columns:repeat(4,1fr), gap:12px
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    // borderWidth: 1,
    // gap: 12,
  },

  searchWrap: {
    // marginTop: 14,
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.12),
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    shadowColor: alpha(colors.secondary, 0.9),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
    // marginBottom: 12,
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
    height: "100%",
    fontSize: 15,
    color: colors.secondary,
    backdropFilter: "blur(10px)",
    fontFamily: "Inter",
  },
  // HTML: background:#fff, border:1px solid #E9E4D8, border-radius:16px,
  //       height:84px, flex-direction:column, align/justify:center, gap:8px,
  //       box-shadow:0 2px 10px rgba(16,42,67,.04)
  action: {
    flex: 1,
    backgroundColor: colors.surface,
    // borderWidth: 1,
    // borderColor: "#E9E4D8",
    // borderRadius: 16,
    // height: 84,
    flexDirection: "column",
    alignItems: "center",
    // justifyContent: "center",
    gap: 8,
    // shadowColor: alpha(colors.secondary, 0.04),
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 1,
    // shadowRadius: 10,
    // elevation: 2,
    // padding: 10,
  },
  actionIcon: {
    borderWidth: 1,
    borderColor: "#E9E4D8",
    backgroundColor: alpha(colors.surface , 0.9),
    borderRadius: 16,
    shadowColor: alpha(colors.secondary, 0.9),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
    padding: 15,
  },
  actionPressed: {
    transform: [{ scale: 0.94 }],
  },
  // HTML: font-size:12px, font-weight:500, color:#102A43
  actionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#102A43",
    textAlign: "center",
  },
});
