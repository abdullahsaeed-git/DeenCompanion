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
  HadithSearchResult,
} from '../types/hadith';
import { COLLECTION_META, HADITH_API_BASE } from '../constants/hadith';
import { getHadithEdition, registerCacheClearer } from './languageService';

registerCacheClearer(() => { resultCache.clear(); });
// import { useState } from 'react';

// const [LANG, SET_LANG] = useState('en'); // Default language is English

// ── Layer 1: Raw JSON cache (network response cache) ────────────────────────
const rawCache = new Map<string, any>();

// ── Layer 2: In-flight request deduplication ────────────────────────────────
// Prevents duplicate network calls when multiple functions request the same URL
// simultaneously (e.g. getCollection() + getCollectionBooks() both need info.json)
const inFlight = new Map<string, Promise<any>>();

// ── Layer 3: Transformed result cache ───────────────────────────────────────
// Caches expensive .map() / .filter() / object-building operations so we never
// re-transform the same raw data twice in a session.
const resultCache = new Map<string, any>();

// ── Special: Global info.json cache ─────────────────────────────────────────
// info.json is ~200KB and needed by almost every screen. Cache it once and
// never re-fetch within the same app session.
let infoJsonCache: Record<string, any> | null = null;


// Add these constants near the top of hadithService.ts
const SUPABASE_URL = 'https://nfutyruqkniacecederr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mdXR5cnVxa25pYWNlY2VkZXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1Njg3MjYsImV4cCI6MjEwMzE0NDcyNn0.jNSojtF1MyFJH3sUR-z1SsgE5bmVU1G6lmT42OLLmC8';
const SEARCH_ENDPOINT = `${SUPABASE_URL}/functions/v1/search-hadith`;

export interface HadithSearchResponse {
  results: HadithSearchResult[];
  total_count: number;
  has_more: boolean;
  page: number;
}

async function fetchJson<T>(url: string): Promise<T> {

  console.log(`Fetching JSON: ${url}`);
  // 1. Check raw cache first
  if (rawCache.has(url)) {
    
    console.log(`Fetching cache: ${url}`);
    return rawCache.get(url) as T;
  }

  // 2. Check if another call is already fetching this URL
  if (inFlight.has(url)) {
    return inFlight.get(url) as Promise<T>;
  }

  // 3. Start the fetch and register it as in-flight
  const promise = (async () => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    rawCache.set(url, json);
    return json;
  })();

  inFlight.set(url, promise);

  try {
    const result = await promise;
    return result as T;
  } finally {
    // Clean up in-flight tracker regardless of success/failure
    inFlight.delete(url);
  }
}

/** Fetch info.json with aggressive session-level caching */
async function getInfoJson(): Promise<Record<string, any>> {
  if (infoJsonCache) {
    console.log('Returning cached info.json');
    return infoJsonCache;
  }
  infoJsonCache = await fetchJson<Record<string, any>>(
    `${HADITH_API_BASE}/info.min.json`
  );
  return infoJsonCache;
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
    const cacheKey = 'collections';
    if (resultCache.has(cacheKey)) {
      return resultCache.get(cacheKey) as HadithCollection[];
    }

    const data = await getInfoJson();
    const result = Object.keys(data)
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

    resultCache.set(cacheKey, result);
    return result;
  },

  /** Get a single collection with its metadata */
  getCollection: async (collectionId: string): Promise<HadithCollection | null> => {
    const cacheKey = `collection:${collectionId}`;
    if (resultCache.has(cacheKey)) {
      return resultCache.get(cacheKey) as HadithCollection | null;
    }

    const meta = COLLECTION_META[collectionId];
    if (!meta) return null;

    const data = await getInfoJson();
    const coll = data[collectionId];
    if (!coll) return null;

    const result: HadithCollection = {
      id: collectionId,
      name: coll.metadata.name || meta.name,
      hadithCount: coll.metadata.last_hadithnumber || coll.hadiths.length,
      shortDescription: meta.description,
      languages: ['Arabic', 'English'],
      isFeatured: meta.isFeatured,
      authorInfo: meta.authorInfo,
      arabicTitle: meta.arabicTitle,
    };

    resultCache.set(cacheKey, result);
    return result;
  },

  /** Get all Books (sections) within a collection */
  getCollectionBooks: async (collectionId: string): Promise<HadithBook[]> => {
    const cacheKey = `books:${collectionId}`;
    if (resultCache.has(cacheKey)) {
      return resultCache.get(cacheKey) as HadithBook[];
    }

    const data = await getInfoJson();
    const coll = data[collectionId];
    if (!coll) throw new Error(`Unknown collection: ${collectionId}`);

    const sections = coll.metadata.sections || {};
    const details = coll.metadata.section_details || {};

    const result = Object.keys(sections)
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

    resultCache.set(cacheKey, result);
    return result;
  },

  /** Fetch all hadiths within a Book (section) — both English and Arabic */
  getBookHadiths: async (
    collectionId: string,
    bookNumber: number
  ): Promise<Hadith[]> => {
    const cacheKey = `bookHadiths:${collectionId}:${bookNumber}`;
    if (resultCache.has(cacheKey)) {
      console.log(`Returning cached book hadiths for ${collectionId} book ${bookNumber}`);
      return resultCache.get(cacheKey) as Hadith[];
    }

    const edition = getHadithEdition();

    const [eng, ara] = await Promise.all([
      fetchJson<{ metadata: any; hadiths: any[] }>(
        `${HADITH_API_BASE}/editions/${edition}-${collectionId}/sections/${bookNumber}.min.json`
      ),
      fetchJson<{ metadata: any; hadiths: any[] }>(
        `${HADITH_API_BASE}/editions/ara-${collectionId}/sections/${bookNumber}.min.json`
      ).catch(() => null),
    ]);

    const arabicMap = new Map<number, string>();
    if (ara?.hadiths) {
      for (const h of ara.hadiths) {
        arabicMap.set(h.hadithnumber, h.text || '');
      }
    }

    const result = (eng.hadiths || []).map((h) => ({
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

    resultCache.set(cacheKey, result);
    return result;
  },

  /** Fetch a single hadith with Arabic + English text */
  getHadith: async (collectionId: string, hadithNumber: number): Promise<Hadith> => {
    const cacheKey = `hadith:${collectionId}:${hadithNumber}`;
    if (resultCache.has(cacheKey)) {
      console.log(`Returning cached hadith ${collectionId} #${hadithNumber}`);
      return resultCache.get(cacheKey) as Hadith;
    }


    const edition = getHadithEdition();

    const [eng, ara] = await Promise.all([
      fetchJson<{ metadata: any; hadiths: any[] }>(
        `${HADITH_API_BASE}/editions/${edition}-${collectionId}/${hadithNumber}.min.json`
      ),
      fetchJson<{ metadata: any; hadiths: any[] }>(
        `${HADITH_API_BASE}/editions/ara-${collectionId}/${hadithNumber}.min.json`
      ).catch(() => null),
    ]);

    const h = eng.hadiths?.[0];
    if (!h) throw new Error('Hadith not found');

    const arabicHadith = ara?.hadiths?.[0];
    const bookNum = h.reference?.book || 0;
    const text = h.text || '';

    const result: Hadith = {
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

    resultCache.set(cacheKey, result);
    return result;
  },

  /**
   * Search Hadiths via Supabase Edge Function
   */
  searchHadiths: async (
    query: string,
    collections: string[],
    page: number = 1
  ): Promise<HadithSearchResponse> => {
    const response = await fetch(SEARCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query, collections, page }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: HTTP ${response.status}`);
    }

    return response.json();

  },
};