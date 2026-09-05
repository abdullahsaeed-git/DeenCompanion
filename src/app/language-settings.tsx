/**
 * Language Settings Screen
 *
 * Lets the user pick the app display language.
 * Selection is local until "Save Changes" is tapped.
 * Save stores to AsyncStorage and navigates back.
 */

import {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, alpha } from '../constants/theme';
import Svg, { Circle, Defs, G, Mask, Path, Rect } from "react-native-svg";
import { BackIcon } from '@/components/Icons';
import { setLanguage } from '../services/languageService';
import { settingsService } from '@/services/settingsService';

// ─── Constants ──────────────────────────────────────────────────────────

const LANG_KEY = 'app_language';

interface Language {
  id: string;
  name: string;
  nativeName: string;
  badgeChar: string;
  badgeFont?: string;
  nativeFont?: string;
  isRTL?: boolean;
}

const LANGUAGES: Language[] = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    badgeChar: 'E',
  },
  {
    id: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    badgeChar: 'ا',
    badgeFont: 'Amiri',
    nativeFont: 'Amiri',
    isRTL: true,
  },
  // Add more here:
  // { id: 'arabic', name: 'Arabic', nativeName: 'العربية', badgeChar: 'ع', badgeFont: 'Amiri', nativeFont: 'Amiri', isRTL: true },
  // { id: 'malay',  name: 'Malay',  nativeName: 'Bahasa Melayu', badgeChar: 'M' },
  // { id: 'turkish', name: 'Turkish', nativeName: 'Türkçe', badgeChar: 'T' },
  // { id: 'french', name: 'French', nativeName: 'Français', badgeChar: 'F' },
];

// ─── Screen ─────────────────────────────────────────────────────────────

export default function LanguageSettingsScreen() {
  const insets = useSafeAreaInsets();
  const searchRef = useRef<TextInput>(null);

  const [savedLanguage, setSavedLanguage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((val) => {
      const lang = val || 'en';
      setSavedLanguage(lang);
      setSelectedId(lang);
    });
  }, []);

  // Filter languages by search
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return LANGUAGES;
    const q = searchQuery.toLowerCase();
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.includes(q) ||
        l.id.includes(q),
    );
  }, [searchQuery]);

  // Derived state
  const hasChanges = selectedId !== null && selectedId !== savedLanguage;

  // ── Handlers ────────────────────────────────────────────

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    Keyboard.dismiss();
  }, []);

   const handleSave = useCallback(async () => {
    if (!hasChanges || !selectedId || saving) return;
    setSaving(true);

    try {
      await setLanguage(selectedId); // saves to storage + clears caches
      
      // Reset translation font size based on the newly selected language
      const newDefaultSize = selectedId === 'ur' ? 17 : 14;
      await settingsService.setTranslationFontSize(newDefaultSize);

      setSavedLanguage(selectedId);
      router.back();
    } catch {
      // Storage write failed — stay on screen
    } finally {
      setSaving(false);
    }
  }, [hasChanges, selectedId, saving]);

  // ── Render ──────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 8,
            paddingBottom: insets.bottom + 90,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.iconBtnPressed,
            ]}
            onPress={() => router.back()}
            accessibilityLabel="Back to Settings"
          >
            <BackIcon />
          </Pressable>
          <Text style={styles.headerTitle}>Language</Text>
          <Pressable
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.iconBtnPressed,
            ]}
            onPress={() => searchRef.current?.focus()}
            accessibilityLabel="Focus search"
          >
            <SearchIcon />
          </Pressable>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <RefreshIcon />
          <Text style={styles.infoText}>
            Changing language will restart the app to apply the new
            language.
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <SearchIcon muted />
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            placeholder="Search language…"
            placeholderTextColor={alpha(colors.secondary, 0.4)}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="done"
            autoCorrect={false}
            accessibilityLabel="Search language"
          />
        </View>

        {/* Language list */}
        <View style={styles.list} role="radiogroup">
          {filtered.map((lang) => {
            const isSelected = selectedId === lang.id;
            return (
              <Pressable
                key={lang.id}
                style={({ pressed }) => [
                  styles.row,
                  isSelected && styles.rowSelected,
                  pressed && styles.rowPressed,
                ]}
                onPress={() => handleSelect(lang.id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${lang.name} — ${lang.nativeName}`}
              >
                {/* Badge */}
                <View style={styles.badge}>
                  <Text
                    style={[
                      styles.badgeChar,
                      lang.badgeFont && { fontFamily: lang.badgeFont },
                    ]}
                  >
                    {lang.badgeChar}
                  </Text>
                </View>

                {/* Names */}
                <View style={styles.names}>
                  <Text style={styles.nameText}>{lang.name}</Text>
                  <Text
                    style={[
                      styles.nativeText,
                      lang.nativeFont && { fontFamily: lang.nativeFont },
                    ]}
                  >
                    {lang.nativeName}
                  </Text>
                </View>

                {/* Check indicator */}
                <View
                  style={[
                    styles.checkCircle,
                    isSelected && styles.checkCircleFilled,
                  ]}
                >
                  {isSelected && <CheckIcon />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom || 30 },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            !hasChanges && styles.saveBtnOff,
            pressed && hasChanges && styles.saveBtnPressed,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
          accessibilityLabel={
            hasChanges ? 'Save language changes' : 'No changes to save'
          }
        >
          <Text style={[styles.saveBtnText, !hasChanges && styles.saveBtnTextOff]}>
            {hasChanges ? 'Save Changes' : 'No changes'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Inline Icons ───────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 15.5 13 10 7.5 4.5"
        stroke={colors.secondary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({ muted }: { muted?: boolean }) {
  const color = muted
    ? alpha(colors.primary, 0.55)
    : colors.secondary;
  return (
    <Svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <Circle
        cx="9"
        cy="9"
        r="6.5"
        stroke={color}
        strokeWidth="1.8"
      />
      <Path
        d="M14 14 L18 18"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function RefreshIcon() {
  return (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 10a7.5 7.5 0 1 1 1.6 4.7"
        stroke="#A9822B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 6v4.5h4.5"
        stroke="#A9822B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <Path
        d="M1 4l2.6 2.6L9 1.2"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F6F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    backgroundColor: alpha(colors.primary, 0.05),
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 20,
    letterSpacing: -0.01,
    color: colors.secondary,
  },

  // Info banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: alpha('#D4AF37', 0.14),
    borderWidth: 1,
    borderColor: alpha('#D4AF37', 0.35),
    borderRadius: 14,
    padding: 11,
    paddingRight: 13,
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#6B5A1E',
    fontWeight: '500',
  },

  // Search
  searchBox: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 14,
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
    fontFamily: 'Inter',
  },

  // List
  list: {
    flexDirection: 'column',
    gap: 10,
  },
  row: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingLeft: 12,
  },
  rowSelected: {
    backgroundColor: alpha(colors.primary, 0.06),
    borderColor: colors.primary,
    shadowColor: alpha(colors.primary, 0.4),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
    // Simulate box-shadow: 0 0 0 1px
    borderWidth: 1,
  },
  rowPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#FBF9F3',
  },

  // Badge
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeChar: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },

  // Names
  names: {
    flex: 1,
    minWidth: 0,
  },
  nameText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: colors.secondary,
  },
  nativeText: {
    marginTop: 2,
    fontSize: 13,
    color: '#52616F',
  },

  // Check Circle
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: alpha(colors.secondary, 0.22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  // Footer
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  saveBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: alpha(colors.primary, 0.28),
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 14,
  },
  saveBtnOff: {
    backgroundColor: '#D5DBE1',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  saveBtnPressed: {
    transform: [{ scale: 0.98 }],
  },
  saveBtnText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 15,
    color: '#fff',
  },
  saveBtnTextOff: {
    color: '#7A828C',
  },
});