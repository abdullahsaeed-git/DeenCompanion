/**
 * Language Service
 *
 * Single source of truth for the app's display language.
 * Both quranService and hadithService read from here.
 *
 * - initLanguage()  → call once on app start (reads AsyncStorage)
 * - setLanguage()   → call when user saves in Language Settings
 * - getQuranEdition() / getHadithEdition() → used by services to pick API edition
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_KEY = 'app_language';

export let currentLang: string = 'en';

// ── Cache invalidation registry ───────────────────────────────────────
// Services register their cache-clearing functions here.
// When setLanguage() is called, all caches are flushed automatically.

type CacheClearer = () => void;
const clearers: CacheClearer[] = [];

export function registerCacheClearer(fn: CacheClearer): void {
  clearers.push(fn);
}

// ── Public API ───────────────────────────────────────────────────────

/** Read the current language (sync — returns whatever is in memory) */
export function getLanguage(): string {
  return currentLang;
}

/** Load language from AsyncStorage into memory. Call once on app start. */
export async function initLanguage(): Promise<string> {
  const saved = await AsyncStorage.getItem(LANG_KEY);
  currentLang = saved || 'en';
  return currentLang;
}

/**
 * Change the language.
 * - Updates in-memory value immediately
 * - Persists to AsyncStorage
 * - Clears all registered translation caches
 */
export async function setLanguage(lang: string): Promise<void> {
  currentLang = lang;
  await AsyncStorage.setItem(LANG_KEY, lang);
//   clearers.forEach((fn) => fn());
  await Promise.all(clearers.map(fn => fn()));
}

// ── Edition mappers ──────────────────────────────────────────────────
// Add new languages here, then add the row to the Language Settings page.

export function getQuranEdition(): string {
  switch (currentLang) {
    case 'ur':
      return 'ur.maududi';
    // case 'ar': return 'ar.alafasy';
    // case 'fr': return 'fr.hamidullah';
    default:
      return 'en.sahih';
  }
}

export function getHadithEdition(): string {
  switch (currentLang) {
    case 'ur':
      return 'urd';
    // case 'ar': return 'ara';
    default:
      return 'eng';
  }
}