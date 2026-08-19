/**
 * Quran Data Service
 *
 * Wraps the Al Quran Cloud API (https://alquran.cloud/api).
 * Free, no authentication required.
 */

import { Surah, SurahDetail, Ayah } from '../types/quran';

const BASE_URL = 'https://api.alquran.cloud/v1';

// In-memory cache
const cache = new Map<string, any>();

interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

async function fetchWithCache<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json: ApiResponse<T> = await response.json();
  if (json.code !== 200) {
    throw new Error(json.status || 'API Error');
  }

  cache.set(url, json.data);
  return json.data;
}

// ============================================
// API INTERFACES
// ============================================

interface ApiSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Madani';
}

interface ApiAyah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  sajda: boolean;
  surah?: ApiSurah;
}

interface ApiSurahDetail extends ApiSurah {
  ayahs: ApiAyah[];
}

interface ApiJuz {
  number: number;
  ayahs: ApiAyah[];
}

interface ApiPage {
  number: number;
  ayahs: ApiAyah[];
}

// ============================================
// MAPPERS
// ============================================

function mapApiSurah(api: ApiSurah): Surah {
  return {
    number: api.number,
    englishName: api.englishName,
    arabicName: api.name,
    ayahCount: api.numberOfAyahs,
    revelationType: api.revelationType === 'Meccan' ? 'Makki' : 'Madani',
  };
}

function mapApiAyah(api: ApiAyah): Ayah {
  return {
    number: api.number,
    text: api.text,
    numberInSurah: api.numberInSurah,
    juz: api.juz,
    page: api.page,
    sajda: api.sajda,
    surahNumber: api.surah?.number,
    surahName: api.surah?.englishName,
  };
}

// ============================================
// PUBLIC API
// ============================================

export const quranService = {
  /** Fetch all 114 Surahs */
  getAllSurahs: async (): Promise<Surah[]> => {
    const data = await fetchWithCache<ApiSurah[]>(`${BASE_URL}/surah`);
    return data.map(mapApiSurah);
  },

  /** Fetch one Surah with Arabic + English translation */
 // In quranService.ts — getSurahWithTranslation
getSurahWithTranslation: async (surahNumber: number): Promise<SurahDetail> => {
    const [arabic, translation] = await Promise.all([
      fetchWithCache<ApiSurahDetail>(`${BASE_URL}/surah/${surahNumber}`),
      fetchWithCache<ApiSurahDetail>(`${BASE_URL}/surah/${surahNumber}/en.sahih`),
    ]);

    const surah = mapApiSurah(arabic);
    const translationMap = new Map(
      translation.ayahs.map((a) => [a.numberInSurah, a.text])
    );

    const ayahs = arabic.ayahs.map((ayah) => ({
      ...mapApiAyah(ayah),
      // The /surah/{n} API does not include `surah` inside each ayah.
      // We must inject it from the parent response.
      surahNumber: surah.number,
      surahName: surah.englishName,
      translation: translationMap.get(ayah.numberInSurah) || '',
    }));

    return {
      ...surah,
      ayahs,
      englishNameTranslation: arabic.englishNameTranslation,
    };
  },

  /** Fetch one Juz with Arabic + English translation */
  getJuzWithTranslation: async (juzNumber: number): Promise<{ number: number; ayahs: Ayah[] }> => {
    const [arabic, translation] = await Promise.all([
      fetchWithCache<ApiJuz>(`${BASE_URL}/juz/${juzNumber}`),
      fetchWithCache<ApiJuz>(`${BASE_URL}/juz/${juzNumber}/en.sahih`),
    ]);

    const translationMap = new Map(
      translation.ayahs.map((a) => [a.number, a.text])
    );

    return {
      number: arabic.number,
      ayahs: arabic.ayahs.map((ayah) => ({
        ...mapApiAyah(ayah),
        translation: translationMap.get(ayah.number) || '',
      })),
    };
  },

  /** Fetch one Mushaf page with Arabic + English translation */
  getPageWithTranslation: async (pageNumber: number): Promise<{ number: number; ayahs: Ayah[] }> => {
    const [arabic, translation] = await Promise.all([
      fetchWithCache<ApiPage>(`${BASE_URL}/page/${pageNumber}`),
      fetchWithCache<ApiPage>(`${BASE_URL}/page/${pageNumber}/en.sahih`),
    ]);

    const translationMap = new Map(
      translation.ayahs.map((a) => [a.number, a.text])
    );

    return {
      number: arabic.number,
      ayahs: arabic.ayahs.map((ayah) => ({
        ...mapApiAyah(ayah),
        translation: translationMap.get(ayah.number) || '',
      })),
    };
  },

  /** Search the Quran (English translation) */
  search: async (query: string) => {
    const encoded = encodeURIComponent(query);
    return fetchWithCache<any>(`${BASE_URL}/search/${encoded}/en.sahih/all`);
  },
};
