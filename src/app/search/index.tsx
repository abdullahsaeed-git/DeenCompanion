/**
 * Search — Landing Page
 *
 * Entry point for global search.
 * Route: /search
 *
 * - Main Tabs: Quran / Hadith
 * - Quran: Emblem, Search, Trending
 * - Hadith: Sub-tabs for "By Text" (search) and "By Number" (direct navigation)
 */

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Svg, { Circle, Path, Rect, G } from "react-native-svg";
import { colors } from "../../constants/theme";
import { useLocalSearchParams } from "expo-router";

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */

// type MainTab = "quran" | "hadith";
type HadithMode = "text" | "number";

interface TrendingItem {
  query: string;
  tag: string;
}

const TRENDING_QURAN: TrendingItem[] = [
  { query: "mercy", tag: "AYAH" },
  { query: "patience", tag: "AYAH" },
];

const TRENDING_HADITH: TrendingItem[] = [
  // { query: "intentions", tag: "BUKHARI" },
  // { query: "mercy to children", tag: "TIRMIDHI" },
  // { query: "good character", tag: "MUSLIM" },
];

const TRENDING_HADITH_UR: TrendingItem[] = [
  // { query: "اعمال کا دارومدار نیتوں پر", tag: "بخاری" },
  // { query: "چھوٹوں پر رحم کرو", tag: "ترمذی" },
  // { query: "اچھے اخلاق اختیار کرو", tag: "مسلم" },
];

// Book metadata for "By Number" mode
const BOOKS = [
  { key: "bukhari", full: "Sahih al-Bukhari", max: 7563 },
  { key: "muslim", full: "Sahih Muslim", max: 7500 },
  { key: "abudawud", full: "Sunan Abu Dawood", max: 5274 },
  { key: "tirmidhi", full: "Jami' at-Tirmidhi", max: 3956 },
  { key: "nasai", full: "Sunan an-Nasa'i", max: 5758 },
  { key: "ibnmajah", full: "Sunan Ibn Majah", max: 4341 },
];

/* ------------------------------------------------------------------ */
/*  Icon components                                                    */
/* ------------------------------------------------------------------ */

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke="#102A43"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function VoiceIcon() {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke="#102A43"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Rect x="7.5" y="3" width="5" height="9" rx="2.5" />
      <Path d="M5 10a5 5 0 0 0 10 0" />
      <Path d="M10 15v2.5" />
    </Svg>
  );
}

function SearchBarIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Circle
        cx="9"
        cy="9"
        r="6.5"
        stroke={colors.primary}
        strokeWidth={1.8}
        strokeOpacity={0.7}
      />
      <Path
        d="M14 14L18 18"
        stroke={colors.primary}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeOpacity={0.7}
      />
    </Svg>
  );
}

function TrendingIcon() {
  return (
    <Svg
      width={16}
      height={16}
      viewBox="0 0 20 20"
      fill="none"
      stroke={colors.primary}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 15l5-5 3 3 6-7" />
      <Path d="M13 6h4v4" />
    </Svg>
  );
}

function SearchEmblem() {
  return (
    <Svg width={110} height={110} viewBox="0 0 110 110" fill="none">
      <Circle cx="55" cy="55" r="50" fill={colors.primary} fillOpacity={0.05} />
      <Circle
        cx="55"
        cy="55"
        r="50"
        stroke={colors.primary}
        strokeOpacity={0.12}
        strokeWidth={1.5}
      />
      <G stroke={colors.primary} strokeOpacity={0.18} strokeWidth={1.5}>
        <Rect x="30" y="30" width="50" height="50" rx="7" />
        <G
          transform={[
            { translateX: 55 },
            { translateY: 55 },
            { rotate: "45deg" },
            { translateX: -55 },
            { translateY: -55 },
          ]}
        >
          <Rect x="30" y="30" width="50" height="50" rx="7" />
        </G>
      </G>
      <Circle
        cx="51"
        cy="51"
        r="13"
        stroke={colors.primary}
        strokeWidth={2.5}
      />
      <Path
        d="M60.5 60.5L70 70"
        stroke={colors.primary}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Circle cx="76" cy="34" r="4" fill="#D4AF37" />
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

export default function SearchLandingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const initialTab = (params.mode as string) || "quran";
  const [mainTab, setMainTab] = useState<string>(initialTab);

  // Hadith state
  const [hadithMode, setHadithMode] = useState<HadithMode>("text");
  const [hadithLang, setHadithLang] = useState<"en" | "ur">("en");
  const [textQuery, setTextQuery] = useState("");
  const [numQuery, setNumQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(BOOKS[0]);
  const [numFocused, setNumFocused] = useState(false);

  const [activeMode, setActiveMode] = useState<string>('quran')

  const activeBook = BOOKS.find((b) => b.key === selectedBook.key) || BOOKS[0];
  const numValue = parseInt(numQuery, 10);
  const isNumValid =
    !isNaN(numValue) && numValue >= 1 && numValue <= activeBook.max;

  function handleQuranSubmit() {
    const trimmed = textQuery.trim();
    if (!trimmed) return;
    router.push({ pathname: "/search/quran", params: { q: trimmed } });
  }

  function handleHadithTextSubmit() {
    const trimmed = textQuery.trim();
    if (!trimmed) return;
    router.push({ pathname: "/search/hadith", params: { q: trimmed, lang: hadithLang } });
  }

  function handleGoToHadith() {
    if (!isNumValid) return;
    router.push({
      pathname: "/hadith-reader",
      params: { collectionId: activeBook.key, hadithNumber: String(numValue) },
    });
  }

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.content,
          { paddingTop: 8, paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* ── Top bar ── */}
        {/* <View style={styles.topbar}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <BackIcon />
          </Pressable>

          <Pressable style={styles.iconButton}>
            <VoiceIcon />
          </Pressable>
        </View> */}

         {/* Header */}
                <View style={styles.header}>
                  <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <BackIcon />
                  </Pressable>
                  <Text style={styles.title}>Search</Text>
                  <View style={styles.headerSpacer} />
                </View>

        {/* ── Main Tabs ── */}
        <View style={styles.mainTabs}>
          <Pressable
            style={[
              styles.mainTab,
              mainTab === "quran" && styles.mainTabActive,
            ]}
            onPress={() => setMainTab("quran")}
          >
            <Text
              style={[
                styles.mainTabText,
                mainTab === "quran" && styles.mainTabTextActive,
              ]}
            >
              Quran
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.mainTab,
              mainTab === "hadith" && styles.mainTabActive,
            ]}
            onPress={() => setMainTab("hadith")}
          >
            <Text
              style={[
                styles.mainTabText,
                mainTab === "hadith" && styles.mainTabTextActive,
              ]}
            >
              Hadith
            </Text>
          </Pressable>
        </View>

        {/* ── Quran Pane ── */}
        {mainTab === "quran" && (
          <ScrollView
            style={styles.pane}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={styles.engine}>
              <SearchEmblem />
              <Text style={styles.engineTitle}>Quran</Text>
              <Text style={styles.engineSub}>
                Type in the exact word
              </Text>

              <View style={styles.barRing}>
                <View style={styles.bar}>
                  <SearchBarIcon />
                  <TextInput
                    style={styles.input}
                    value={textQuery}
                    onChangeText={setTextQuery}
                    placeholder="Search the Quran…"
                    placeholderTextColor="rgba(16, 42, 67, 0.4)"
                    returnKeyType="search"
                    onSubmitEditing={handleQuranSubmit}
                  />
                </View>
              </View>
              {/* Search Button */}
              <Pressable style={styles.searchButton} onPress={handleQuranSubmit}>
                <Text style={styles.searchButtonText}>Search</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionLabel}>Trending in Quran</Text>
            {TRENDING_QURAN.map((item, i) => (
              <Pressable
                key={item.query}
                style={[styles.trendingRow, i > 0 && styles.trendingRowBorder]}
                onPress={() => setTextQuery(item.query)}
              >
                <TrendingIcon />
                <Text style={styles.trendingText} numberOfLines={1}>
                  {item.query}
                </Text>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* ── Hadith Pane ── */}
        {mainTab === "hadith" && (
          <ScrollView
            style={styles.pane}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Sub-chips for mode */}

            <View style={styles.engine}>
              <SearchEmblem />
              <Text style={styles.engineTitle}>Hadiths</Text>
            </View>
            <View style={styles.subChips}>
              <Pressable
                style={[
                  styles.subChip,
                  hadithMode === "text" && styles.subChipActive,
                ]}
                onPress={() => {
                  setHadithMode("text");
                  setTextQuery("");
                }}
              >
                <Text
                  style={[
                    styles.subChipText,
                    hadithMode === "text" && styles.subChipTextActive,
                  ]}
                >
                  By Text
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.subChip,
                  hadithMode === "number" && styles.subChipActive,
                ]}
                onPress={() => {
                  setHadithMode("number");
                  setNumQuery("");
                }}
              >
                <Text
                  style={[
                    styles.subChipText,
                    hadithMode === "number" && styles.subChipTextActive,
                  ]}
                >
                  By Number
                </Text>
              </Pressable>
            </View>

            {/* ── Text Mode ── */}
            {hadithMode === "text" && (
              <View style={{ flex: 1, marginTop: 18 }}>
                {/* Language Tabs */}
                <View style={styles.langChips}>
                  <Pressable
                    style={[styles.langChip, hadithLang === "en" && styles.langChipActive]}
                    onPress={() => setHadithLang("en")}
                  >
                    <Text style={[styles.langChipText, hadithLang === "en" && styles.langChipTextActive]}>English</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.langChip, hadithLang === "ur" && styles.langChipActive]}
                    onPress={() => setHadithLang("ur")}
                  >
                    <Text style={[styles.langChipText, hadithLang === "ur" && styles.langChipTextActive]}>اردو</Text>
                  </Pressable>
                </View>

                <View style={styles.barRing}>
                  <View style={styles.bar}>
                    <SearchBarIcon />
                    <TextInput
                      style={[styles.input, hadithLang === "ur" && styles.inputRTL]}
                      value={textQuery}
                      onChangeText={setTextQuery}
                      placeholder={hadithLang === "en" ? "Search Hadiths…" : "حدیث تلاش کریں…"}
                      placeholderTextColor="rgba(16, 42, 67, 0.4)"
                      returnKeyType="search"
                      onSubmitEditing={handleHadithTextSubmit}
                    />
                  </View>
                </View>

                {/* Search Button */}
                <Pressable style={styles.searchButton} onPress={handleHadithTextSubmit}>
                  <Text style={styles.searchButtonText}>Search</Text>
                </Pressable>

                {/* <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
                  Trending in Hadith
                </Text>
                {(hadithLang === "ur" ? TRENDING_HADITH_UR : TRENDING_HADITH).map((item, i) => (
                  <Pressable
                    key={item.query}
                    style={[
                      styles.trendingRow,
                      i > 0 && styles.trendingRowBorder,
                    ]}
                    onPress={() => setTextQuery(item.query)}
                  >
                    <TrendingIcon />
                    <Text 
                      style={[
                        styles.trendingText, 
                        hadithLang === "ur" && { textAlign: "right", fontFamily: "Amiri", fontSize: 16 }
                      ]} 
                      numberOfLines={1}
                    >
                      {item.query}
                    </Text>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.tag}</Text>
                    </View>
                  </Pressable>
                ))} */}
              </View>
            )}

            {/* ── Number Mode ── */}
            {hadithMode === "number" && (
              <View style={{ flex: 1, marginTop: 18 }}>
                <View
                  style={[styles.barRing, numFocused && styles.barRingFocused]}
                >
                  <View style={[styles.bar, numFocused && styles.barFocused]}>
                    <SearchBarIcon />
                    <TextInput
                      style={styles.input}
                      value={numQuery}
                      onChangeText={setNumQuery}
                      onFocus={() => setNumFocused(true)}
                      onBlur={() => setNumFocused(false)}
                      placeholder={`Hadith no. (1–${activeBook.max})`}
                      placeholderTextColor="rgba(16, 42, 67, 0.4)"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Collection Horizontal Scroll */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 14 }}
                  contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
                >
                  {BOOKS.map((book) => {
                    const active = selectedBook.key === book.key;
                    return (
                      <Pressable
                        key={book.key}
                        style={[
                          styles.bookChip,
                          active && styles.bookChipActive,
                        ]}
                        onPress={() => {
                          setSelectedBook(book);
                          setNumQuery("");
                        }}
                      >
                        <Text
                          style={[
                            styles.bookChipText,
                            active && styles.bookChipTextActive,
                          ]}
                        >
                          {book.full
                            .replace("Sahih ", "")
                            .replace("Sunan ", "")
                            .replace("Jami' at-", "")}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Text style={styles.bookNameText}>
                  Searching in:{" "}
                  <Text style={styles.bookNameBold}>{activeBook.full}</Text>
                </Text>

                <Pressable
                  style={[
                    styles.goButton,
                    !isNumValid && styles.goButtonDisabled,
                  ]}
                  onPress={handleGoToHadith}
                  disabled={!isNumValid}
                >
                  <Text style={styles.goButtonText}>Go to Hadith</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
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
  content: { flex: 1, paddingHorizontal: 24 },

  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 4 },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 18, letterSpacing: -0.01, color: colors.secondary },
  headerSpacer: { width: 44 },

  mainTabs: {
    marginTop: 10,
    height: 48,
    backgroundColor: "rgba(16, 42, 67, 0.06)",
    borderRadius: 14,
    flexDirection: "row",
    padding: 4,
    gap: 4,
  },
  mainTab: {
    flex: 1,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  mainTabActive: {
    backgroundColor: colors.primary,
    shadowColor: "rgba(15, 107, 80, 0.25)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  mainTabText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14.5,
    color: "#52616F",
  },
  mainTabTextActive: { color: "#fff" },

  pane: { flex: 1, marginTop: 10 },

  engine: {
    alignItems: "center",
    paddingTop: 20,
  },
  engineTitle: {
    marginTop: 14,
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 22,
    letterSpacing: -0.3,
    color: colors.secondary,
  },
  engineSub: {
    marginTop: 5,
    fontSize: 13,
    color: "#52616F",
  },

  barRing: {
    marginTop: 18,
    width: "100%",
    padding: 3,
    borderRadius: 21,
  },
  barRingFocused: {
    backgroundColor: "rgba(15, 107, 80, 0.12)",
  },
  bar: {
    width: "100%",
    height: 56,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E9E4D8",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 18,
    paddingRight: 14,
    shadowColor: "rgba(16, 42, 67, 0.08)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
  },
  barFocused: { borderColor: colors.primary },
  input: {
    flex: 1,
    fontSize: 15.5,
    color: colors.secondary,
    fontFamily: "Inter",
    padding: 0,
  },
  inputRTL: {
    textAlign: "right",
  },

  // Search Button
  searchButton: {
    marginTop: 14,
    width: "100%",
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(15, 107, 80, 0.28)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
  },
  searchButtonText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 15,
    color: "#fff",
  },

  // Subchips (Text / Number)
  subChips: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  subChip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E9E4D8",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  subChipActive: {
    backgroundColor: "rgba(15, 107, 80, 0.09)",
    borderColor: colors.primary,
  },
  subChipText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 12.5,
    color: "#52616F",
  },
  subChipTextActive: { color: colors.primary },

  // Language Chips
  langChips: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  langChip: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E9E4D8",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  langChipActive: {
    backgroundColor: "rgba(15, 107, 80, 0.09)",
    borderColor: colors.primary,
  },
  langChipText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 12.5,
    color: "#52616F",
  },
  langChipTextActive: { color: colors.primary },

  sectionLabel: {
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: "uppercase" as const,
    color: "#7A828C",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 16,
  },

  trendingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  trendingRowBorder: { borderTopWidth: 1, borderTopColor: "#F4F0E7" },
  trendingText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.secondary,
  },
  tag: {
    backgroundColor: "rgba(15, 107, 80, 0.1)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 7,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: colors.primary,
  },

  bookChip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E9E4D8",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bookChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bookChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#52616F",
  },
  bookChipTextActive: { color: "#fff" },

  bookNameText: {
    marginTop: 12,
    fontSize: 12.5,
    color: "#52616F",
    textAlign: "center",
  },
  bookNameBold: { color: colors.primary, fontWeight: "600" },

  goButton: {
    marginTop: 16,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(15, 107, 80, 0.28)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
  },
  goButtonDisabled: {
    backgroundColor: "#D5DBE1",
    color: "#7A828C",
    shadowColor: "transparent",
    elevation: 0,
  },
  goButtonText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 15,
    color: "#fff",
  },
});