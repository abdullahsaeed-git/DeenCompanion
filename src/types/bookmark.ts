/**
 * Bookmark types
 *
 * Shared types for all bookmark categories.
 */

export interface QuranBookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahGlobalNumber: number;
  arabicText: string;
  translation?: string;
  page: number;
  juz: number;
  dateSaved: string;
  note?: string;
}

export interface PositionBookmark {
  id: string;
  type: 'juz' | 'page';
  juzNumber: number;
  pageNumber: number;
  title: string;
  subtitle: string;
  dateSaved: string;
}

/** Info passed from reader to the page actions sheet */
export interface PageActionInfo {
  pageNumber: number;
  juzNumber: number;
  surahName?: string;
  type: 'juz' | 'page';
}