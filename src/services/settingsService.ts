import AsyncStorage from '@react-native-async-storage/async-storage';

import { getLanguage } from './languageService';

const PRAYER_SETTINGS_KEY = '@deen_companion_prayer_settings_v1';

  // ── add to your KEYS object ──
const ARABIC_FONT_SIZE_KEY = 'settings_arabic_font_size';
const TRANSLATION_FONT_SIZE_KEY =  'settings_translation_font_size';



// ── add defaults (or export them for reuse in readers) ──
export const FONT_DEFAULTS = {
  ARABIC: 22,
  TRANSLATION: 14,
} as const;


// ── centralized font size config (single source of truth) ──
export const FONT_SIZE_CONFIG = {
  arabic: { min: 16, max: 40, default: 22 },
  // Remove the 'default' key from here to avoid confusion
  translation: { min: 12, max: 28 }, 
} as const;

// Helper to get the default translation size based on language
export function getDefaultTranslationSize(): number {
  try {
    const lang = getLanguage(); 
    return lang === 'ur' ? 15 : 14;
  } catch {
    return 14; // Fallback
  }
}




export interface PrayerSettings {
  city: string;
  country: string;
  method: number;
  school: number;
  notificationsEnabled: boolean;
  use24HourFormat: boolean;
  arabicFontSize: number;
  translationFontSize: number;
}

export const DEFAULT_PRAYER_SETTINGS: PrayerSettings = {
  city: 'Wah',
  country: 'Pakistan',
  method: 1,
  school: 1,
  notificationsEnabled: true,
  use24HourFormat: false,
  arabicFontSize: 22,
  translationFontSize: 14,
};

export const settingsService = {
  async loadPrayerSettings(): Promise<PrayerSettings> {
    try {
      const json = await AsyncStorage.getItem(PRAYER_SETTINGS_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        return { ...DEFAULT_PRAYER_SETTINGS, ...parsed };
      }
    } catch {
      // Silently fall back to defaults
    }
    return { ...DEFAULT_PRAYER_SETTINGS };
  },

  async savePrayerSettings(settings: PrayerSettings): Promise<void> {
    await AsyncStorage.setItem(PRAYER_SETTINGS_KEY, JSON.stringify(settings));
  },


// ── add these methods to your service object ──

async getArabicFontSize(): Promise<number> {
  const raw = await AsyncStorage.getItem(ARABIC_FONT_SIZE_KEY);
  return raw ? parseInt(raw, 10) : FONT_DEFAULTS.ARABIC;
},

async setArabicFontSize(size: number): Promise<void> {
  await AsyncStorage.setItem(ARABIC_FONT_SIZE_KEY, String(size));
},


async setTranslationFontSize(size: number): Promise<void> {
  await AsyncStorage.setItem(TRANSLATION_FONT_SIZE_KEY, String(size));
},

async getTranslationFontSize(): Promise<number> {
  const raw = await AsyncStorage.getItem(TRANSLATION_FONT_SIZE_KEY);
  // If nothing is saved, return the dynamic default based on current language
  return raw ? parseInt(raw, 10) : getDefaultTranslationSize();
},

async resetFontSizes(): Promise<void> {
  await AsyncStorage.multiRemove([
    ARABIC_FONT_SIZE_KEY,
    TRANSLATION_FONT_SIZE_KEY,
  ]);
},

};