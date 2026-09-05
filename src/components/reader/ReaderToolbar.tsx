/**
 * ReaderToolbar
 *
 * Sticky toolbar below the header.
 * Contains: font-size button, Translation chip, Tafsir chip, search button.
 *
 * Translation and Tafsir chips are hidden in mushaf and page modes
 * since those modes render continuous Arabic text.
 */

import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, alpha } from "../../constants/theme";
import { ReaderMode } from "../../types/quran";

interface ReaderToolbarProps {
  readerMode: ReaderMode;
  showTranslation: boolean;
  setShowTranslation: (v: boolean) => void;
  showTafsir: boolean;
  setShowTafsir: (v: boolean) => void;
  showArabic: boolean;
  setShowArabic: (v: boolean) => void;
  topInset: number;
  visible: boolean;
}

export function ReaderToolbar({
  readerMode,
  showTranslation,
  setShowTranslation,
  showTafsir,
  setShowTafsir,
  topInset,
  showArabic,
  setShowArabic,
  visible,
}: ReaderToolbarProps) {
  if (!visible) return null;

  const isAyahMode = readerMode === "ayah";

  return (
    <View style={[styles.stickyToolbar, { top: topInset + 70 }]}>
      {isAyahMode && (
        <View style={styles.toolChipsContainer}>
          {/* Translation toggle */}
          <Pressable
            style={[
              styles.chip,
              showTranslation ? styles.chipOn : styles.chipOff,
            ]}
            onPress={() => {
              if (!showArabic) {
                setShowArabic(true);
              }
              setShowTranslation(!showTranslation);
            }}
          >
            <Text
              style={[
                styles.chipText,
                !showTranslation && styles.chipTextInactive,
              ]}
            >
              Translation
            </Text>
          </Pressable>

          {/* Tafsir toggle */}
          {/* <Pressable
            style={[styles.chip, showTafsir ? styles.chipOn : styles.chipOff]}
            onPress={() => setShowTafsir(!showTafsir)}
          >
            <Text style={[styles.chipText, !showTafsir && styles.chipTextInactive]}>
              Tafsir
            </Text>
          </Pressable> */}

          {/* Arabic toggle */}
          <Pressable
            style={[styles.chip, showArabic ? styles.chipOn : styles.chipOff]}
            onPress={() => {
              if (!showTranslation) {
                setShowTranslation(true);
              }
              setShowArabic(!showArabic);
            }}
          >
            <Text
              style={[styles.chipText, !showArabic && styles.chipTextInactive]}
            >
              Arabic
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stickyToolbar: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 20,
    width: "auto",
    zIndex: 10,
  },
  toolChipsContainer: {
    borderRadius: 10,
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "row",
    gap: 6,
  },
  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  toolBtnText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 13,
    color: colors.secondary,
  },
  spacer: {
    flex: 1,
  },
  chipOn: {
    backgroundColor: alpha(colors.primary, 0.09),
  },
  chipOff: {
    backgroundColor: alpha(colors.secondary, 0.06),
  },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 11,
    justifyContent: "center",
  },
  chipText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 12.5,
    color: colors.primary,
  },
  chipTextInactive: {
    color: colors.textSecondary,
  },
});
