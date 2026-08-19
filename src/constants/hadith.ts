/**
 * Hadith API Configuration
 *
 * Uses fawazahmed0/hadith-api (https://github.com/fawazahmed0/hadith-api)
 * Base: https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1
 */

export const HADITH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

export const COLLECTION_META: Record<string, {
  name: string;
  arabicTitle: string;
  authorInfo: string;
  description: string;
  isFeatured: boolean;
}> = {
  bukhari: {
    name: 'Sahih al-Bukhari',
    arabicTitle: 'صحيح البخاري',
    authorInfo: 'Imam Muhammad al-Bukhari · 810–870 CE',
    description: 'The most authentic collection of Hadith, compiled by Imam Muhammad al-Bukhari. Considered the most authentic book after the Quran.',
    isFeatured: true,
  },
  muslim: {
    name: 'Sahih Muslim',
    arabicTitle: 'صحيح مسلم',
    authorInfo: 'Imam Muslim ibn al-Hajjaj · 815–875 CE',
    description: 'The second most authentic collection of Hadith, compiled by Imam Muslim ibn al-Hajjaj.',
    isFeatured: false,
  },
  abudawud: {
    name: 'Sunan Abu Dawood',
    arabicTitle: 'سنن أبي داود',
    authorInfo: 'Imam Abu Dawood al-Sijistani · 817–889 CE',
    description: 'One of the six major Hadith collections, compiled by Imam Abu Dawood al-Sijistani.',
    isFeatured: false,
  },
  tirmidhi: {
    name: "Jami' at-Tirmidhi",
    arabicTitle: 'جامع الترمذي',
    authorInfo: 'Imam Muhammad at-Tirmidhi · 824–892 CE',
    description: 'Compiled by Imam Muhammad at-Tirmidhi. Known for including both Sahih and Hasan hadiths.',
    isFeatured: false,
  },
  nasai: {
    name: "Sunan an-Nasa'i",
    arabicTitle: 'سنن النسائي',
    authorInfo: "Imam Ahmad an-Nasa'i · 829–915 CE",
    description: "One of the six major Hadith collections, compiled by Imam Ahmad an-Nasa'i.",
    isFeatured: false,
  },
  ibnmajah: {
    name: 'Sunan Ibn Majah',
    arabicTitle: 'سنن ابن ماجه',
    authorInfo: 'Imam Muhammad ibn Majah · 824–887 CE',
    description: 'One of the six major Hadith collections, compiled by Imam Muhammad ibn Majah.',
    isFeatured: false,
  },
  malik: {
    name: 'Muwatta Malik',
    arabicTitle: 'موطأ مالك',
    authorInfo: 'Imam Malik ibn Anas · 711–795 CE',
    description: 'One of the earliest written collections of Hadith, compiled by Imam Malik ibn Anas.',
    isFeatured: false,
  },
};