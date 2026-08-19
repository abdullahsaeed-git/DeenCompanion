/**
 * Hadith Data Service
 *
 * Uses fawazahmed0/hadith-api (https://github.com/fawazahmed0/hadith-api)
 * Base URL: https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1
 *
 * Endpoints:
 * - info.json                              → All collections metadata
 * - editions/eng-{collection}/{n}.json     → Single hadith (English)
 * - editions/ara-{collection}/{n}.json     → Single hadith (Arabic)
 * - editions/eng-{collection}/sections/{n}.json → All hadiths in a section
 */

import {
  HadithCollection,
  HadithBook,
  Hadith,
  HadithGrade,
} from '../types/hadith';
import { COLLECTION_META, HADITH_API_BASE } from '../constants/hadith';

const cache = new Map<string, any>();

async function fetchJson<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const json = await res.json();
  cache.set(url, json);
  return json;
}

function normalizeGrade(grades: HadithGrade[], collectionId: string): string {
  if (grades.length > 0) {
    return grades[0].grade;
  }
  // Bukhari and Muslim are universally Sahih; API grades array is empty for them
  if (collectionId === 'bukhari' || collectionId === 'muslim') {
    return 'Sahih';
  }
  return 'Unknown';
}

/** Extract narrator from English text: "Narrated 'Umar bin Al-Khattab: ..." */
function extractNarrator(text: string): string {
  const match = text.match(/^Narrated\s+([^:]+):/i);
  return match ? match[1].trim() : '';
}

export const hadithService = {
  /** Get all available collections with metadata */
  getCollections: async (): Promise<HadithCollection[]> => {
    const data = await fetchJson<Record<string, any>>(`${HADITH_API_BASE}/info.json`);
    return Object.keys(data)
      .filter((id) => COLLECTION_META[id])
      .map((id) => {
        const meta = data[id].metadata;
        const hadiths = data[id].hadiths || [];
        return {
          id,
          name: meta.name || COLLECTION_META[id].name,
          hadithCount: meta.last_hadithnumber || hadiths.length,
          shortDescription: COLLECTION_META[id].description,
          languages: ['Arabic', 'English'],
          isFeatured: COLLECTION_META[id].isFeatured,
          authorInfo: COLLECTION_META[id].authorInfo,
          arabicTitle: COLLECTION_META[id].arabicTitle,
        };
      });
  },

  /** Get a single collection with its metadata */
  getCollection: async (collectionId: string): Promise<HadithCollection | null> => {
    const meta = COLLECTION_META[collectionId];
    if (!meta) return null;
    const data = await fetchJson<Record<string, any>>(`${HADITH_API_BASE}/info.json`);
    const coll = data[collectionId];
    if (!coll) return null;
    return {
      id: collectionId,
      name: coll.metadata.name || meta.name,
      hadithCount: coll.metadata.last_hadithnumber || coll.hadiths.length,
      shortDescription: meta.description,
      languages: ['Arabic', 'English'],
      isFeatured: meta.isFeatured,
      authorInfo: meta.authorInfo,
      arabicTitle: meta.arabicTitle,
    };
  },

  /** Get all Books (sections) within a collection */
  getCollectionBooks: async (collectionId: string): Promise<HadithBook[]> => {
    const data = await fetchJson<Record<string, any>>(`${HADITH_API_BASE}/info.json`);
    const coll = data[collectionId];
    if (!coll) throw new Error(`Unknown collection: ${collectionId}`);

    const sections = coll.metadata.sections || {};
    const details = coll.metadata.section_details || {};

    return Object.keys(sections)
      .filter((key) => key !== '0' && sections[key])
      .map((key) => {
        const num = parseInt(key, 10);
        const detail = details[key] || {};
        const count =
          (detail.hadithnumber_last || 0) - (detail.hadithnumber_first || 0) + 1;
        return {
          id: `${collectionId}-book-${num}`,
          collectionId,
          number: num,
          englishName: sections[key],
          arabicName: '',
          hadithCount: Math.max(0, count),
          firstHadithNumber: detail.hadithnumber_first || 0,
          lastHadithNumber: detail.hadithnumber_last || 0,
        };
      })
      .sort((a, b) => a.number - b.number);
  },

  /** Fetch all hadiths within a Book (section) */
   /** Fetch all hadiths within a Book (section) — both English and Arabic */
  getBookHadiths: async (
    collectionId: string,
    bookNumber: number
  ): Promise<Hadith[]> => {
    const [eng, ara] = await Promise.all([
      fetchJson<{ metadata: any; hadiths: any[] }>(
        `${HADITH_API_BASE}/editions/eng-${collectionId}/sections/${bookNumber}.json`
      ),
      fetchJson<{ metadata: any; hadiths: any[] }>(
        `${HADITH_API_BASE}/editions/ara-${collectionId}/sections/${bookNumber}.json`
      ).catch(() => null),
    ]);

    const arabicMap = new Map<number, string>();
    if (ara?.hadiths) {
      for (const h of ara.hadiths) {
        arabicMap.set(h.hadithnumber, h.text || '');
      }
    }

    return (eng.hadiths || []).map((h) => ({
      id: `${collectionId}-${h.hadithnumber}`,
      hadithNumber: h.hadithnumber,
      arabicNumber: h.arabicnumber,
      numberInBook: h.reference?.hadith || h.hadithnumber,
      bookNumber: h.reference?.book || bookNumber,
      narrator: extractNarrator(h.text || ''),
      grades: (h.grades || []).map((g: any) => ({
        name: g.name || '',
        grade: g.grade || '',
      })),
      displayGrade: normalizeGrade(h.grades || [], collectionId),
      arabicText: arabicMap.get(h.hadithnumber) || '',
      translation: h.text || '',
      reference: `${eng.metadata?.name || ''} · Book ${h.reference?.book || bookNumber}, Hadith ${h.reference?.hadith || h.hadithnumber}`,
      bookName: eng.metadata?.section?.[String(bookNumber)] || '',
      chapterName: '',
      collectionId,
    }));
  },

  
  /** Fetch a single hadith with Arabic + English text */
  getHadith: async (collectionId: string, hadithNumber: number): Promise<Hadith> => {
    const [eng, ara] = await Promise.all([
      fetchJson<{ metadata: any; hadiths: any[] }>(
        `${HADITH_API_BASE}/editions/eng-${collectionId}/${hadithNumber}.json`
      ),
      fetchJson<{ metadata: any; hadiths: any[] }>(
        `${HADITH_API_BASE}/editions/ara-${collectionId}/${hadithNumber}.json`
      ).catch(() => null),
    ]);

    const h = eng.hadiths?.[0];
    if (!h) throw new Error('Hadith not found');

    const arabicHadith = ara?.hadiths?.[0];
    const bookNum = h.reference?.book || 0;
    const text = h.text || '';

    return {
      id: `${collectionId}-${h.hadithnumber}`,
      hadithNumber: h.hadithnumber,
      arabicNumber: h.arabicnumber,
      numberInBook: h.reference?.hadith || h.hadithnumber,
      bookNumber: bookNum,
      narrator: extractNarrator(text),
      grades: (h.grades || []).map((g: any) => ({
        name: g.name || '',
        grade: g.grade || '',
      })),
      displayGrade: normalizeGrade(h.grades || [], collectionId),
      arabicText: arabicHadith?.text || '',
      translation: text,
      reference: `${eng.metadata?.name || ''} · Book ${bookNum}, Hadith ${h.reference?.hadith || h.hadithnumber}`,
      bookName: eng.metadata?.section?.[String(bookNum)] || '',
      chapterName: '',
      collectionId,
    };
  },
};