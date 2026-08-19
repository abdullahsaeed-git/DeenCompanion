/**
 * Library Data Types
 *
 * Later, these will match the shape of data from our API or database.
 */

/** A library category (e.g., Quran & Tafsir, Hadith, Fiqh) */
export interface LibraryCategory {
  id: string;
  name: string;
  bookCount: number;
}