/**
 * Hadith Data Types
 *
 * Aligned with fawazahmed0/hadith-api response shapes.
 */

/** A Hadith collection (e.g., Sahih al-Bukhari) */
export interface HadithCollection {
  id: string;
  name: string;
  hadithCount: number;
  shortDescription?: string;
  languages: string[];
  isFeatured?: boolean;
  authorInfo?: string;
  arabicTitle?: string;
}

/** A Book (Section/Kitab) within a collection */
export interface HadithBook {
  id: string;
  collectionId: string;
  number: number;
  englishName: string;
  arabicName: string;
  hadithCount: number;
  firstHadithNumber: number;
  lastHadithNumber: number;
}

/** A single grade evaluation */
export interface HadithGrade {
  name: string;
  grade: string;
}

/** A single Hadith */
export interface Hadith {
  id: string;
  hadithNumber: number;
  arabicNumber: number;
  numberInBook: number;
  bookNumber: number;
  narrator: string;
  grades: HadithGrade[];
  displayGrade: string;
  arabicText: string;
  translation: string;
  reference: string;
  bookName: string;
  chapterName: string;
  collectionId: string;
}

export type HadithDisplayMode = 'arabic' | 'both' | 'translation';