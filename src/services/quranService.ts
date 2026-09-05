/**
 * Quran Data Service
 *
 * Wraps the Al Quran Cloud API (https://alquran.cloud/api).
 * Free, no authentication required.
 */

// import { useState } from "react"
import { getQuranEdition, registerCacheClearer } from "./languageService";
import { Surah, SurahDetail, Ayah, QuranSearchResult } from "../types/quran";

const BASE_URL = "https://api.alquran.cloud/v1";
// const [LANG, SET_LANG] = useState("ur"); // Default language is English


 // Register cache clearer — called automatically when language changes
registerCacheClearer(() => { cache.clear(); });

// In-memory cache
const cache = new Map<string, any>();

interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

async function fetchWithCache<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    console.log(`[memory-cache] HIT: ${url}`);
    return cache.get(url) as T;
  }

  console.log(`[memory-cache] MISS: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const json: ApiResponse<T> = await response.json();

  if (json.code !== 200) {
    throw new Error(json.status || "API Error");
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
  revelationType: "Meccan" | "Madani";
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
    revelationType: api.revelationType === "Meccan" ? "Makki" : "Madani",
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

async function fetchWithRetry<T>(
  url: string,
  maxRetries = 3,
  initialDelay = 2000,
  multiplier = 3,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchWithCache<T>(url);
    } catch (err) {
      console.warn(
        `[cache] Fetch failed (attempt ${attempt + 1}/${maxRetries}) for ${url.slice(-80)}`,
        err,
      );

      if (attempt === maxRetries - 1) {
        throw err;
      }

      const delay = initialDelay * Math.pow(multiplier, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts`);
}

export const quranService = {
  /** Fetch all 114 Surahs */
  getAllSurahs: async (): Promise<Surah[]> => {
    const data = await fetchWithCache<ApiSurah[]>(`${BASE_URL}/surah`);
    return data.map(mapApiSurah);
  },

  /** Fetch one Surah with Arabic + English translation */
  getSurahWithTranslation: async (
    surahNumber: number,
  ): Promise<SurahDetail> => {
    const edition = getQuranEdition();
    const [arabic, translation] = await Promise.all([
      fetchWithCache<ApiSurahDetail>(`${BASE_URL}/surah/${surahNumber}`),
      fetchWithCache<ApiSurahDetail>(
        `${BASE_URL}/surah/${surahNumber}/${edition}`,
      ),
    ]);

    const surah = mapApiSurah(arabic);
    const translationMap = new Map(
      translation.ayahs.map((a) => [a.numberInSurah, a.text]),
    );

    const ayahs = arabic.ayahs.map((ayah) => ({
      ...mapApiAyah(ayah),
      surahNumber: surah.number,
      surahName: surah.englishName,
      translation: translationMap.get(ayah.numberInSurah) || "",
    }));

    return {
      ...surah,
      ayahs,
      englishNameTranslation: arabic.englishNameTranslation,
    };
  },

  /** Fetch one Juz with Arabic + English translation */
  getJuzWithTranslation: async (
    juzNumber: number,
  ): Promise<{ number: number; ayahs: Ayah[] }> => {
    const edition = getQuranEdition();
    const [arabic, translation] = await Promise.all([
      fetchWithCache<ApiJuz>(`${BASE_URL}/juz/${juzNumber}`),
      fetchWithCache<ApiJuz>(`${BASE_URL}/juz/${juzNumber}/${edition}`),
    ]);

    const translationMap = new Map(
      translation.ayahs.map((a) => [a.number, a.text]),
    );

    return {
      number: arabic.number,
      ayahs: arabic.ayahs.map((ayah) => ({
        ...mapApiAyah(ayah),
        translation: translationMap.get(ayah.number) || "",
      })),
    };
  },

  /** Fetch one Mushaf page with Arabic + English translation */
  getPageWithTranslation: async (
    pageNumber: number,
  ): Promise<{ number: number; ayahs: Ayah[] }> => {
    const [arabic, translation] = await Promise.all([
      fetchWithCache<ApiPage>(`${BASE_URL}/page/${pageNumber}`),
      fetchWithCache<ApiPage>(`${BASE_URL}/page/${pageNumber}/${getQuranEdition()}`),
    ]);

    const translationMap = new Map(
      translation.ayahs.map((a) => [a.number, a.text]),
    );

    return {
      number: arabic.number,
      ayahs: arabic.ayahs.map((ayah) => ({
        ...mapApiAyah(ayah),
        translation: translationMap.get(ayah.number) || "",
      })),
    };
  },

  /** Search the Quran by text */
  searchQuran: async (
    query: string,
    edition: string = "en",
  ): Promise<{ count: number; matches: QuranSearchResult[] }> => {
    const encoded = encodeURIComponent(query);
    return fetchWithCache<{ count: number; matches: QuranSearchResult[] }>(
      `${BASE_URL}/search/${encoded}/all/${edition}`,
    );
  },

  /** Fetch all Arabic ayah texts for a surah as a numberInSurah → text map */
  getSurahArabicMap: async (
    surahNumber: number,
  ): Promise<Map<number, string>> => {
    const data = await fetchWithRetry<ApiSurahDetail>(
      `${BASE_URL}/surah/${surahNumber}/quran-uthmani`,
    );

    const map = new Map<number, string>();

    for (const ayah of data.ayahs) {
      map.set(ayah.numberInSurah, ayah.text);
    }

    return map;
  },

  /** Fetch all English ayah texts for a surah as a numberInSurah → text map */
  getSurahTranslationMap: async (
    surahNumber: number,
  ): Promise<Map<number, string>> => {
    const data = await fetchWithRetry<ApiSurahDetail>(
        `${BASE_URL}/surah/${surahNumber}/${getQuranEdition()}`,
    );

    const map = new Map<number, string>();

    for (const ayah of data.ayahs) {
      map.set(ayah.numberInSurah, ayah.text);
    }

    return map;
  },

  /** Fetch a single ayah's text in the given edition */
  getAyahText: async (ayahNumber: number, edition: string): Promise<string> => {
    const data = await fetchWithCache<{ number: number; text: string }>(
      `${BASE_URL}/ayah/${ayahNumber}/${edition}`,
    );
    return data.text;
  },
};
