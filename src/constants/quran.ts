/**
 * Quran Structural Constants
 */

export const JUZ_BOUNDARIES = [
  { number: 1, fromSurahNumber: 1, fromAyah: 1, toSurahNumber: 2, toAyah: 141 },
  { number: 2, fromSurahNumber: 2, fromAyah: 142, toSurahNumber: 2, toAyah: 252 },
  { number: 3, fromSurahNumber: 2, fromAyah: 253, toSurahNumber: 3, toAyah: 92 },
  { number: 4, fromSurahNumber: 3, fromAyah: 93, toSurahNumber: 4, toAyah: 23 },
  { number: 5, fromSurahNumber: 4, fromAyah: 24, toSurahNumber: 4, toAyah: 147 },
  { number: 6, fromSurahNumber: 4, fromAyah: 148, toSurahNumber: 5, toAyah: 81 },
  { number: 7, fromSurahNumber: 5, fromAyah: 82, toSurahNumber: 6, toAyah: 110 },
  { number: 8, fromSurahNumber: 6, fromAyah: 111, toSurahNumber: 7, toAyah: 87 },
  { number: 9, fromSurahNumber: 7, fromAyah: 88, toSurahNumber: 8, toAyah: 40 },
  { number: 10, fromSurahNumber: 8, fromAyah: 41, toSurahNumber: 9, toAyah: 92 },
  { number: 11, fromSurahNumber: 9, fromAyah: 93, toSurahNumber: 11, toAyah: 5 },
  { number: 12, fromSurahNumber: 11, fromAyah: 6, toSurahNumber: 12, toAyah: 52 },
  { number: 13, fromSurahNumber: 12, fromAyah: 53, toSurahNumber: 14, toAyah: 52 },
  { number: 14, fromSurahNumber: 15, fromAyah: 1, toSurahNumber: 16, toAyah: 128 },
  { number: 15, fromSurahNumber: 17, fromAyah: 1, toSurahNumber: 18, toAyah: 74 },
  { number: 16, fromSurahNumber: 18, fromAyah: 75, toSurahNumber: 20, toAyah: 135 },
  { number: 17, fromSurahNumber: 21, fromAyah: 1, toSurahNumber: 22, toAyah: 78 },
  { number: 18, fromSurahNumber: 23, fromAyah: 1, toSurahNumber: 25, toAyah: 20 },
  { number: 19, fromSurahNumber: 25, fromAyah: 21, toSurahNumber: 27, toAyah: 55 },
  { number: 20, fromSurahNumber: 27, fromAyah: 56, toSurahNumber: 29, toAyah: 45 },
  { number: 21, fromSurahNumber: 29, fromAyah: 46, toSurahNumber: 33, toAyah: 30 },
  { number: 22, fromSurahNumber: 33, fromAyah: 31, toSurahNumber: 36, toAyah: 27 },
  { number: 23, fromSurahNumber: 36, fromAyah: 28, toSurahNumber: 39, toAyah: 31 },
  { number: 24, fromSurahNumber: 39, fromAyah: 32, toSurahNumber: 41, toAyah: 46 },
  { number: 25, fromSurahNumber: 41, fromAyah: 47, toSurahNumber: 45, toAyah: 37 },
  { number: 26, fromSurahNumber: 46, fromAyah: 1, toSurahNumber: 51, toAyah: 30 },
  { number: 27, fromSurahNumber: 51, fromAyah: 31, toSurahNumber: 57, toAyah: 29 },
  { number: 28, fromSurahNumber: 58, fromAyah: 1, toSurahNumber: 66, toAyah: 12 },
  { number: 29, fromSurahNumber: 67, fromAyah: 1, toSurahNumber: 77, toAyah: 50 },
  { number: 30, fromSurahNumber: 78, fromAyah: 1, toSurahNumber: 114, toAyah: 6 },
];

/** Standard 604-page Uthmani Mushaf: page ranges per Juz */
const JUZ_PAGE_RANGES: [number, number][] = [
  [1, 21], [22, 41], [42, 61], [62, 81], [82, 101],
  [102, 121], [122, 141], [142, 161], [162, 181], [182, 201],
  [202, 221], [222, 241], [242, 261], [262, 281], [282, 301],
  [302, 321], [322, 341], [342, 361], [362, 381], [382, 401],
  [402, 421], [422, 441], [442, 461], [462, 481], [482, 501],
  [502, 521], [522, 541], [542, 561], [562, 581], [582, 604],
];

/** Total pages in standard Mushaf */
export const TOTAL_MUSHAF_PAGES = 604;

/** Given a page number (1-604), return which Juz contains it */
export function getJuzForPage(page: number): number {
  if (page < 1) return 1;
  if (page > TOTAL_MUSHAF_PAGES) return 30;
  for (let i = 0; i < JUZ_PAGE_RANGES.length; i++) {
    if (page >= JUZ_PAGE_RANGES[i][0] && page <= JUZ_PAGE_RANGES[i][1]) {
      return i + 1;
    }
  }
  return 1;
}

/** Get the approximate first page of a Juz */
export function getFirstPageOfJuz(juz: number): number {
  if (juz < 1) return 1;
  if (juz > 30) return 582;
  return JUZ_PAGE_RANGES[juz - 1][0];
}