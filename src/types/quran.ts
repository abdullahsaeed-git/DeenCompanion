/**
 * Quran Data Types
 */

export interface Surah {
  number: number;
  englishName: string;
  arabicName: string;
  ayahCount: number;
  revelationType: 'Makki' | 'Madani';
  recentlyRead?: boolean;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  sajda: boolean;
  translation?: string;
  transliteration?: string;
  surahNumber?: number;
  surahName?: string;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
  englishNameTranslation?: string;
}

export interface Juz {
  number: number;
  fromSurah: string;
  fromAyah: number;
  toSurah: string;
  toAyah: number;
  recentlyRead?: boolean;
}

export type QuranBrowseMode = 'surah' | 'juz' | 'page';
export type ReaderMode = 'ayah' | 'mushaf' | 'page';


export interface QuranSearchResult {
  number: number;
  numberInSurah: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  };
  juz: number;
  page: number;
}