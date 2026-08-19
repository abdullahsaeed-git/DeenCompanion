/**
 * Home Data Service
 *
 * Manages Verse of the Day, Hadith of the Day, and Continue Reading progress.
 * All daily content is cached in AsyncStorage by date.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { quranService } from './quranService';
import { hadithService } from './hadithService';

const VOTD_KEY = '@deen_companion_votd';
const HOTD_KEY = '@deen_companion_hotd';
const READING_KEY = '@deen_companion_reading_progress';

export interface VerseOfTheDayData {
  arabic: string;
  translation: string;
  reference: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
}

export interface HadithOfTheDayData {
  narrator: string;
  translation: string;
  reference: string;
  grade: string;
  collectionId: string;
  hadithNumber: number;
}

export interface ReadingProgressData {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  progressPercent: number;
  lastReadAt: string;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export const homeService = {
  /** Fetch or return cached Verse of the Day */
  async getVerseOfTheDay(): Promise<VerseOfTheDayData | null> {
    const today = getTodayKey();
    const cacheKey = `${VOTD_KEY}_${today}`;

    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);

      const surahs = await quranService.getAllSurahs();
      const dayOfYear = getDayOfYear();

      let cumulative = 0;
      let targetSurah = surahs[0];
      let targetAyahNumber = 1;
      const totalAyahs = surahs.reduce((sum, s) => sum + s.ayahCount, 0);
      const targetIndex = ((dayOfYear - 1) % totalAyahs) + 1;

      for (const surah of surahs) {
        if (cumulative + surah.ayahCount >= targetIndex) {
          targetSurah = surah;
          targetAyahNumber = targetIndex - cumulative;
          break;
        }
        cumulative += surah.ayahCount;
      }

      const surahDetail = await quranService.getSurahWithTranslation(targetSurah.number);
      const ayah = surahDetail.ayahs[targetAyahNumber - 1];
      if (!ayah) return null;

      const data: VerseOfTheDayData = {
        arabic: ayah.text,
        translation: ayah.translation || '',
        reference: `${surahDetail.englishName} ${surahDetail.number}:${ayah.numberInSurah}`,
        surahName: surahDetail.englishName,
        surahNumber: surahDetail.number,
        ayahNumber: ayah.numberInSurah,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    } catch {
      return null;
    }
  },

  /** Fetch or return cached Hadith of the Day */
  async getHadithOfTheDay(): Promise<HadithOfTheDayData | null> {
    const today = getTodayKey();
    const cacheKey = `${HOTD_KEY}_${today}`;

    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);

      const dayOfYear = getDayOfYear();
      let hadithNumber = ((dayOfYear - 1) % 7000) + 1;

      let hadith = null;
      let attempts = 0;
      while (!hadith && attempts < 5) {
        try {
          hadith = await hadithService.getHadith('bukhari', hadithNumber);
        } catch {
          hadithNumber = (hadithNumber % 7000) + 1;
          attempts++;
        }
      }
      if (!hadith) return null;

      const data: HadithOfTheDayData = {
        narrator: hadith.narrator,
        translation: hadith.translation,
        reference: hadith.reference,
        grade: hadith.displayGrade,
        collectionId: 'bukhari',
        hadithNumber: hadith.hadithNumber,
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    } catch {
      return null;
    }
  },


    /** Fetch a random verse (for manual refresh) */
  async getRandomVerse(): Promise<VerseOfTheDayData | null> {
    try {
      const surahs = await quranService.getAllSurahs();
      const randomIndex = Math.floor(Math.random() * surahs.length);
      const targetSurah = surahs[randomIndex];
      const targetAyahNumber = Math.floor(Math.random() * targetSurah.ayahCount) + 1;

      const surahDetail = await quranService.getSurahWithTranslation(targetSurah.number);
      const ayah = surahDetail.ayahs[targetAyahNumber - 1];
      if (!ayah) return null;

      return {
        arabic: ayah.text,
        translation: ayah.translation || '',
        reference: `${surahDetail.englishName} ${surahDetail.number}:${ayah.numberInSurah}`,
        surahName: surahDetail.englishName,
        surahNumber: surahDetail.number,
        ayahNumber: ayah.numberInSurah,
      };
    } catch {
      return null;
    }
  },

  /** Fetch a random hadith (for manual refresh) */
  async getRandomHadith(): Promise<HadithOfTheDayData | null> {
    try {
      let hadithNumber = Math.floor(Math.random() * 7000) + 1;
      let hadith = null;
      let attempts = 0;
      while (!hadith && attempts < 10) {
        try {
          hadith = await hadithService.getHadith('bukhari', hadithNumber);
        } catch {
          hadithNumber = Math.floor(Math.random() * 7000) + 1;
          attempts++;
        }
      }
      if (!hadith) return null;

      return {
        narrator: hadith.narrator,
        translation: hadith.translation,
        reference: hadith.reference,
        grade: hadith.displayGrade,
        collectionId: 'bukhari',
        hadithNumber: hadith.hadithNumber,
      };
    } catch {
      return null;
    }
  },

  /** Read saved reading progress */
  async getContinueReading(): Promise<ReadingProgressData | null> {
    try {
      const json = await AsyncStorage.getItem(READING_KEY);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  },

  /** Save reading progress from the Quran Reader */
  async saveReadingProgress(
    progress: Omit<ReadingProgressData, 'lastReadAt'>
  ): Promise<void> {
    const data: ReadingProgressData = {
      ...progress,
      lastReadAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(READING_KEY, JSON.stringify(data));
  },
};