/**
 * Bookmark Service
 *
 * Unified persistence for all bookmark categories via AsyncStorage.
 * - Quran ayah bookmarks
 * - Position (juz/page) bookmarks
 * - Hadith bookmarks
 *
 * Each category has its own storage key and namespaced methods.
 * UI components should never import AsyncStorage directly.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuranBookmark, PositionBookmark } from '../types/bookmark';
import { Hadith } from '../types/hadith';

// ============================================
// STORAGE KEYS
// ============================================

const QURAN_BOOKMARKS_KEY = 'deen_quran_bookmarks';
const POSITION_BOOKMARKS_KEY = 'deen_position_bookmarks';
const HADITH_BOOKMARKS_KEY = '@deen_companion_hadith_bookmarks_v1';


const DUAS_BOOKMARKS_KEY = '@deen_companion_dua_bookmarks_v1';

// ============================================
// DUA BOOKMARK TYPES
// ============================================

export interface DuaData {
  id: string;
  categoryId: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
}

export interface DuaBookmark extends DuaData {
  savedAt: number;
}

// ============================================
// HADITH BOOKMARK TYPE
// ============================================

export interface HadithBookmark extends Hadith {
  savedAt: number; // timestamp ms
}

// ============================================
// INTERNAL LOADERS
// ============================================

async function loadAll<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function saveAll<T>(key: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

// ============================================
// PUBLIC API
// ============================================

export const bookmarkService = {
  // ── Quran Ayah Bookmarks ──

  async getAllQuran(): Promise<QuranBookmark[]> {
    const all = await loadAll<QuranBookmark>(QURAN_BOOKMARKS_KEY);
    return all.sort(
      (a, b) => new Date(b.dateSaved).getTime() - new Date(a.dateSaved).getTime(),
    );
  },

  async getAllQuranIds(): Promise<Set<string>> {
    const all = await loadAll<QuranBookmark>(QURAN_BOOKMARKS_KEY);
    return new Set(all.map((b) => b.id));
  },

  async addQuran(bookmark: QuranBookmark): Promise<void> {
    const all = await loadAll<QuranBookmark>(QURAN_BOOKMARKS_KEY);
    const idx = all.findIndex((b) => b.id === bookmark.id);
    if (idx >= 0) {
      all[idx] = bookmark;
    } else {
      all.push(bookmark);
    }
    await saveAll(QURAN_BOOKMARKS_KEY, all);
  },

  async removeQuran(id: string): Promise<void> {
    const all = await loadAll<QuranBookmark>(QURAN_BOOKMARKS_KEY);
    await saveAll(QURAN_BOOKMARKS_KEY, all.filter((b) => b.id !== id));
  },

  async getQuranCount(): Promise<number> {
    const all = await loadAll<QuranBookmark>(QURAN_BOOKMARKS_KEY);
    return all.length;
  },

  // ── Position (Juz/Page) Bookmarks ──

  async getAllPositions(): Promise<PositionBookmark[]> {
    const all = await loadAll<PositionBookmark>(POSITION_BOOKMARKS_KEY);
    return all.sort(
      (a, b) => new Date(b.dateSaved).getTime() - new Date(a.dateSaved).getTime(),
    );
  },

  async getAllPositionIds(): Promise<Set<string>> {
    const all = await loadAll<PositionBookmark>(POSITION_BOOKMARKS_KEY);
    return new Set(all.map((b) => b.id));
  },

  async addPosition(bookmark: PositionBookmark): Promise<void> {
    const all = await loadAll<PositionBookmark>(POSITION_BOOKMARKS_KEY);
    const idx = all.findIndex((b) => b.id === bookmark.id);
    if (idx >= 0) {
      all[idx] = bookmark;
    } else {
      all.push(bookmark);
    }
    await saveAll(POSITION_BOOKMARKS_KEY, all);
  },

  async removePosition(id: string): Promise<void> {
    const all = await loadAll<PositionBookmark>(POSITION_BOOKMARKS_KEY);
    await saveAll(POSITION_BOOKMARKS_KEY, all.filter((b) => b.id !== id));
  },

  async getPositionCount(): Promise<number> {
    const all = await loadAll<PositionBookmark>(POSITION_BOOKMARKS_KEY);
    return all.length;
  },

  // ── Hadith Bookmarks ──

  async getAllHadith(): Promise<HadithBookmark[]> {
    const all = await loadAll<HadithBookmark>(HADITH_BOOKMARKS_KEY);
    return all.sort((a, b) => b.savedAt - a.savedAt);
  },

  async isHadithBookmarked(hadithId: string): Promise<boolean> {
    const all = await loadAll<HadithBookmark>(HADITH_BOOKMARKS_KEY);
    return all.some((b) => b.id === hadithId);
  },

  async saveHadith(hadith: Hadith): Promise<void> {
    const all = await loadAll<HadithBookmark>(HADITH_BOOKMARKS_KEY);
    const idx = all.findIndex((b) => b.id === hadith.id);
    if (idx >= 0) {
      all[idx].savedAt = Date.now();
    } else {
      all.push({ ...hadith, savedAt: Date.now() });
    }
    await saveAll(HADITH_BOOKMARKS_KEY, all);
  },

  async removeHadith(hadithId: string): Promise<void> {
    const all = await loadAll<HadithBookmark>(HADITH_BOOKMARKS_KEY);
    await saveAll(HADITH_BOOKMARKS_KEY, all.filter((b) => b.id !== hadithId));
  },

  async toggleHadith(hadith: Hadith): Promise<boolean> {
    const isBookmarked = await this.isHadithBookmarked(hadith.id);
    if (isBookmarked) {
      await this.removeHadith(hadith.id);
      return false;
    } else {
      await this.saveHadith(hadith);
      return true;
    }
  },

  async getHadithCount(): Promise<number> {
    const all = await loadAll<HadithBookmark>(HADITH_BOOKMARKS_KEY);
    return all.length;
  },

  // ── Combined ──

    async getTotalCount(): Promise<number> {
    const [quran, position, hadith, duas] = await Promise.all([
      this.getQuranCount(),
      this.getPositionCount(),
      this.getHadithCount(),
      this.getDuaCount(),
    ]);
    return quran + position + hadith + duas;
  },



  // ── Dua Bookmarks ──

  async getAllDuas(): Promise<DuaBookmark[]> {
    const all = await loadAll<DuaBookmark>(DUAS_BOOKMARKS_KEY);
    return all.sort((a, b) => b.savedAt - a.savedAt);
  },

  async isDuaBookmarked(duaId: string): Promise<boolean> {
    const all = await loadAll<DuaBookmark>(DUAS_BOOKMARKS_KEY);
    return all.some((b) => b.id === duaId);
  },

  async saveDua(dua: DuaData): Promise<void> {
    const all = await loadAll<DuaBookmark>(DUAS_BOOKMARKS_KEY);
    const idx = all.findIndex((b) => b.id === dua.id);
    if (idx >= 0) {
      all[idx].savedAt = Date.now();
    } else {
      all.push({ ...dua, savedAt: Date.now() });
    }
    await saveAll(DUAS_BOOKMARKS_KEY, all);
  },

  async removeDua(duaId: string): Promise<void> {
    const all = await loadAll<DuaBookmark>(DUAS_BOOKMARKS_KEY);
    await saveAll(DUAS_BOOKMARKS_KEY, all.filter((b) => b.id !== duaId));
  },

  async toggleDua(dua: DuaData): Promise<boolean> {
    const isBookmarked = await this.isDuaBookmarked(dua.id);
    if (isBookmarked) {
      await this.removeDua(dua.id);
      return false;
    } else {
      await this.saveDua(dua);
      return true;
    }
  },

  async getDuaCount(): Promise<number> {
    const all = await loadAll<DuaBookmark>(DUAS_BOOKMARKS_KEY);
    return all.length;
  }}