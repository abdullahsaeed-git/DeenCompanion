/**
 * Library Category Screen
 *
 * Displays all books within a category.
 * Route: /library-category?categoryId={id}
 */

import { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';
import { Linking } from 'react-native';

// ============================================
// TYPES
// ============================================

interface LibraryBook {
  id: string;
  title: string;
  author: string;
  language: string;
  size: string;
  categoryId: string;
  sourceUrl: string;
}

// ============================================
// CATEGORY NAMES (single source of truth for labels)
// ============================================

export const CATEGORY_NAMES: Record<string, { name: string; arabicName: string }> = {
  'quran-tafsir': { name: 'Quran & Tafsir', arabicName: 'القرآن والتفسير' },
  'hadith': { name: 'Hadith', arabicName: 'الحديث الشريف' },
  'fiqh': { name: 'Fiqh', arabicName: 'الفقه الإسلامي' },
  'aqeedah': { name: 'Aqeedah', arabicName: 'العقيدة الإسلامية' },
  'seerah': { name: 'Seerah', arabicName: 'السيرة النبوية' },
  'history': { name: 'Islamic History', arabicName: 'التاريخ الإسلامي' },
  'fatwa': { name: 'Fatwa', arabicName: 'الفتوى' },
  'kids': { name: "Children's Books", arabicName: 'كتب الأطفال' },
  'ethics': { name: 'Islamic Ethics', arabicName: 'الأخلاق الإسلامية' },
};

// ============================================
// BOOKS DATA (single source of truth)
// ============================================

// export const BOOKS: LibraryBook[] = [
//   // Quran & Tafsir
//   { id: 'q1', title: 'Tafsir Ibn Kathir', author: 'Imam Ibn Kathir', language: 'English', size: '24 MB', categoryId: 'quran-tafsir', sourceUrl: '' },
//   { id: 'q2', title: 'Tafsir al-Jalalayn', author: 'Jalal ad-Din al-Mahalli & as-Suyuti', language: 'English', size: '8 MB', categoryId: 'quran-tafsir' , sourceUrl: '' },
//   { id: 'q3', title: 'In the Shade of the Quran', author: 'Sayyid Qutb', language: 'English', size: '42 MB', categoryId: 'quran-tafsir' , sourceUrl: '' },
//   { id: 'q4', title: 'Maariful Quran', author: 'Mufti Muhammad Shafi', language: 'English', size: '35 MB', categoryId: 'quran-tafsir' , sourceUrl: '' },
//   { id: 'q5', title: 'Tafhim al-Quran', author: 'Abul A\'la Maududi', language: 'English', size: '38 MB', categoryId: 'quran-tafsir' , sourceUrl: '' },
//   { id: 'q6', title: 'Al-Quran (Uthmani Script)', author: 'King Fahd Complex', language: 'Arabic', size: '15 MB', categoryId: 'quran-tafsir', sourceUrl: ''  },

//   // Hadith
//   { id: 'h1', title: 'Sahih al-Bukhari', author: 'Imam Muhammad al-Bukhari', language: 'English', size: '28 MB', categoryId: 'hadith', sourceUrl: ''  },
//   { id: 'h2', title: 'Sahih Muslim', author: 'Imam Muslim ibn al-Hajjaj', language: 'English', size: '26 MB', categoryId: 'hadith', sourceUrl: ''  },
//   { id: 'h3', title: 'Sunan Abu Dawud', author: 'Imam Abu Dawud', language: 'English', size: '18 MB', categoryId: 'hadith' , sourceUrl: '' },
//   { id: 'h4', title: 'Jami\' at-Tirmidhi', author: 'Imam at-Tirmidhi', language: 'English', size: '16 MB', categoryId: 'hadith', sourceUrl: ''  },
//   { id: 'h5', title: 'Sunan an-Nasa\'i', author: 'Imam an-Nasa\'i', language: 'English', size: '17 MB', categoryId: 'hadith', sourceUrl: ''  },
//   { id: 'h6', title: 'Sunan Ibn Majah', author: 'Imam Ibn Majah', language: 'English', size: '15 MB', categoryId: 'hadith', sourceUrl: ''  },

//   // Fiqh
//   { id: 'f1', title: 'Reliance of the Traveller', author: 'Ahmad ibn Naqib al-Misri', language: 'English', size: '22 MB', categoryId: 'fiqh', sourceUrl: ''  },
//   { id: 'f2', title: 'Al-Muwatta', author: 'Imam Malik ibn Anas', language: 'English', size: '14 MB', categoryId: 'fiqh', sourceUrl: ''  },
//   { id: 'f3', title: 'Bulugh al-Maram', author: 'Ibn Hajar al-Asqalani', language: 'English', size: '9 MB', categoryId: 'fiqh', sourceUrl: ''  },
//   { id: 'f4', title: 'Fiqh us-Sunnah', author: 'Sayyid Sabiq', language: 'English', size: '12 MB', categoryId: 'fiqh' , sourceUrl: '' },
//   { id: 'f5', title: 'The Treatise on Rights', author: 'Imam Zain al-Abidin', language: 'English', size: '3 MB', categoryId: 'fiqh', sourceUrl: ''  },
//   { id: 'f6', title: 'Al-Umdah fi al-Fiqh', author: 'Ibn Qudamah al-Maqdisi', language: 'Arabic', size: '6 MB', categoryId: 'fiqh', sourceUrl: ''  },

//   // Aqeedah
//   { id: 'a1', title: 'The Book of Tawheed', author: 'Sheikh Muhammad ibn Abdul Wahhab', language: 'English', size: '5 MB', categoryId: 'aqeedah', sourceUrl: ''  },
//   { id: 'a2', title: 'Aqeedah at-Tahawiyyah', author: 'Imam Abu Ja\'far at-Tahawi', language: 'English', size: '4 MB', categoryId: 'aqeedah', sourceUrl: ''  },
//   { id: 'a3', title: 'Kitab al-Tawhid', author: 'Imam Ibn Khuzaymah', language: 'Arabic', size: '8 MB', categoryId: 'aqeedah', sourceUrl: ''  },
//   { id: 'a4', title: 'The Four Rules Regarding Shirk', author: 'Muhammad ibn Abdul Wahhab', language: 'English', size: '2 MB', categoryId: 'aqeedah', sourceUrl: ''  },
//   { id: 'a5', title: 'Essay on the Heart', author: 'Ibn Taymiyyah', language: 'English', size: '6 MB', categoryId: 'aqeedah' , sourceUrl: '' },

//   // Seerah
//   { id: 's1', title: 'The Sealed Nectar', author: 'Safiur Rahman Mubarakpuri', language: 'English', size: '12 MB', categoryId: 'seerah', sourceUrl: ''  },
//   { id: 's2', title: 'Ar-Raheeq Al-Makhtum', author: 'Mubarakpuri · Arabic original', language: 'Arabic', size: '18 MB', categoryId: 'seerah' , sourceUrl: '' },
//   { id: 's3', title: 'Muhammad: His Life Based on the Earliest Sources', author: 'Martin Lings', language: 'English', size: '15 MB', categoryId: 'seerah', sourceUrl: ''  },
//   { id: 's4', title: 'Ash-Shama\'il Al-Muhammadiyyah', author: 'Imam at-Tirmidhi', language: 'English', size: '9 MB', categoryId: 'seerah', sourceUrl: ''  },
//   { id: 's5', title: 'Zad al-Ma\'ad (Provisions of the Hereafter)', author: 'Ibn Qayyim al-Jawziyya', language: 'English', size: '21 MB', categoryId: 'seerah', sourceUrl: ''  },
//   { id: 's6', title: 'When the Moon Split', author: 'Safiur Rahman Mubarakpuri', language: 'English', size: '10 MB', categoryId: 'seerah' , sourceUrl: '' },

//   // Islamic History
//   { id: 'hi1', title: 'The History of the Khalifahs', author: 'Imam as-Suyuti', language: 'English', size: '7 MB', categoryId: 'history' , sourceUrl: '' },
//   { id: 'hi2', title: 'The Venture of Islam', author: 'Marshall Hodgson', language: 'English', size: '45 MB', categoryId: 'history', sourceUrl: ''  },
//   { id: 'hi3', title: 'The Decline and Fall of the Caliphate', author: 'M. A. Shakoor', language: 'English', size: '11 MB', categoryId: 'history', sourceUrl: ''  },
//   { id: 'hi4', title: 'Stories of the Prophets', author: 'Ibn Kathir', language: 'English', size: '13 MB', categoryId: 'history', sourceUrl: ''  },
//   { id: 'hi5', title: 'Futuh al-Buldan', author: 'Ahmad ibn Yahya al-Baladhuri', language: 'Arabic', size: '16 MB', categoryId: 'history', sourceUrl: ''  },

//   // Fatwa
//   { id: 'fa1', title: 'Fatawa Ibn Taymiyyah', author: 'Ibn Taymiyyah', language: 'Arabic', size: '32 MB', categoryId: 'fatwa' , sourceUrl: '' },
//   { id: 'fa2', title: 'Fatawa al-Lajnah ad-Da\'imah', author: 'Permanent Committee', language: 'Arabic', size: '28 MB', categoryId: 'fatwa', sourceUrl: ''  },
//   { id: 'fa3', title: 'Fatawa Arkan ul-Islam', author: 'Sheikh Ibn Uthaymeen', language: 'English', size: '8 MB', categoryId: 'fatwa' , sourceUrl: '' },
//   { id: 'fa4', title: 'Contemporary Legal Rulings', author: 'Sheikh Ibn Uthaymeen', language: 'English', size: '10 MB', categoryId: 'fatwa', sourceUrl: ''  },

//   // Children's Books
//   { id: 'k1', title: 'My First Quran Storybook', author: 'Saniyasnain Khan', language: 'English', size: '5 MB', categoryId: 'kids', sourceUrl: ''  },
//   { id: 'k2', title: 'Tell Me About: The Prophet Muhammad', author: 'Saniyasnain Khan', language: 'English', size: '4 MB', categoryId: 'kids', sourceUrl: ''  },
//   { id: 'k3', title: 'Goodnight Stories from the Quran', author: 'Saniyasnain Khan', language: 'English', size: '6 MB', categoryId: 'kids', sourceUrl: ''  },
//   { id: 'k4', title: 'The Greatest Stories from the Quran', author: 'Saniyasnain Khan', language: 'English', size: '7 MB', categoryId: 'kids', sourceUrl: ''  },

//   // Islamic Ethics
//   { id: 'e1', title: 'The Ethics of Disagreement', author: 'Taha Jabir Alalwani', language: 'English', size: '5 MB', categoryId: 'ethics' , sourceUrl: '' },
//   { id: 'e2', title: 'Purification of the Heart', author: 'Hamza Yusuf', language: 'English', size: '8 MB', categoryId: 'ethics' , sourceUrl: '' },
//   { id: 'e3', title: 'Inner Dimensions of Islamic Worship', author: 'Imam Ghazali', language: 'English', size: '6 MB', categoryId: 'ethics', sourceUrl: ''  },
//   { id: 'e4', title: 'The Book of Assistance', author: 'Imam al-Haddad', language: 'English', size: '5 MB', categoryId: 'ethics' , sourceUrl: '' },
//   { id: 'e5', title: 'Revival of Religious Sciences', author: 'Imam Ghazali', language: 'Arabic', size: '55 MB', categoryId: 'ethics', sourceUrl: ''  },
// ];


/**
 * Library Books Data
 *
 * sourceUrl status:
 * ✅ Free PDF or official download page — verified legitimate source
 * ⚠️  Publisher page — book may be copyrighted, URL points to purchase/info page
 * ❌ No legitimate free source found — consider removing or replacing
 *
 * IMPORTANT: Books marked ❌ or ⚠️ should be reviewed before keeping in the app.
 * The project rule states: only use content we have the legal right to distribute.
 */

export const BOOKS: LibraryBook[] = [
  // ═══════════════════════════════════════
  // QURAN & TAFSIR
  // ═══════════════════════════════════════
  {
    id: 'q1',
    title: 'Tafsir Ibn Kathir',
    author: 'Imam Ibn Kathir',
    language: 'English',
    size: '24 MB',
    categoryId: 'quran-tafsir',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF (Dar-us-Salam translation)
  },
  {
    id: 'q2',
    title: 'Tafsir al-Jalalayn',
    author: 'Jalal ad-Din al-Mahalli & as-Suyuti',
    language: 'English',
    size: '8 MB',
    categoryId: 'quran-tafsir',
    sourceUrl: 'https://www.fonsvitae.com/tafsir-al-jalalayn/', // ⚠️ Fons Vitae — copyrighted translation, purchase page
  },
  {
    id: 'q3',
    title: 'In the Shade of the Quran',
    author: 'Sayyid Qutb',
    language: 'English',
    size: '42 MB',
    categoryId: 'quran-tafsir',
    sourceUrl: '', // ❌ English translation rights held by Islamic Foundation / others — no legitimate free PDF
  },
  {
    id: 'q4',
    title: 'Maariful Quran',
    author: 'Mufti Muhammad Shafi',
    language: 'English',
    size: '35 MB',
    categoryId: 'quran-tafsir',
    sourceUrl: 'https://idara.com/', // ⚠️ Idara Isha'at-e-Diniyat — copyrighted, publisher page
  },
  {
    id: 'q5',
    title: 'Tafhim al-Quran',
    author: "Abul A'la Maududi",
    language: 'English',
    size: '38 MB',
    categoryId: 'quran-tafsir',
    sourceUrl: '', // ❌ English translation ("Towards Understanding the Quran") rights held by Islamic Foundation UK
  },
  {
    id: 'q6',
    title: 'Al-Quran (Uthmani Script)',
    author: 'King Fahd Complex',
    language: 'Arabic',
    size: '15 MB',
    categoryId: 'quran-tafsir',
    sourceUrl: 'https://www.kingfahdpdf.org/', // ✅ Official free download from King Fahd Complex
  },

  // ═══════════════════════════════════════
  // HADITH
  // ═══════════════════════════════════════
  {
    id: 'h1',
    title: 'Sahih al-Bukhari',
    author: 'Imam Muhammad al-Bukhari',
    language: 'English',
    size: '28 MB',
    categoryId: 'hadith',
    sourceUrl: 'https://sunnah.com/bukhari', // ✅ Free online reading (Dar-us-Salam translation)
  },
  {
    id: 'h2',
    title: 'Sahih Muslim',
    author: 'Imam Muslim ibn al-Hajjaj',
    language: 'English',
    size: '26 MB',
    categoryId: 'hadith',
    sourceUrl: 'https://sunnah.com/muslim', // ✅ Free online reading
  },
  {
    id: 'h3',
    title: 'Sunan Abu Dawud',
    author: 'Imam Abu Dawud',
    language: 'English',
    size: '18 MB',
    categoryId: 'hadith',
    sourceUrl: 'https://sunnah.com/abudawud', // ✅ Free online reading
  },
  {
    id: 'h4',
    title: "Jami' at-Tirmidhi",
    author: 'Imam at-Tirmidhi',
    language: 'English',
    size: '16 MB',
    categoryId: 'hadith',
    sourceUrl: 'https://sunnah.com/tirmidhi', // ✅ Free online reading
  },
  {
    id: 'h5',
    title: 'Sunan an-Nasa\'i',
    author: 'Imam an-Nasa\'i',
    language: 'English',
    size: '17 MB',
    categoryId: 'hadith',
    sourceUrl: 'https://sunnah.com/nasai', // ✅ Free online reading
  },
  {
    id: 'h6',
    title: 'Sunan Ibn Majah',
    author: 'Imam Ibn Majah',
    language: 'English',
    size: '15 MB',
    categoryId: 'hadith',
    sourceUrl: 'https://sunnah.com/ibnmajah', // ✅ Free online reading
  },

  // ═══════════════════════════════════════
  // FIQH
  // ═══════════════════════════════════════
  {
    id: 'f1',
    title: 'Reliance of the Traveller',
    author: 'Ahmad ibn Naqib al-Misri',
    language: 'English',
    size: '22 MB',
    categoryId: 'fiqh',
    sourceUrl: 'https://www.amana-publications.com/', // ⚠️ Amana Publications — copyrighted translation, purchase page
  },
  {
    id: 'f2',
    title: 'Al-Muwatta',
    author: 'Imam Malik ibn Anas',
    language: 'English',
    size: '14 MB',
    categoryId: 'fiqh',
    sourceUrl: 'https://sunnah.com/malik', // ✅ Free online reading (multiple translations)
  },
  {
    id: 'f3',
    title: 'Bulugh al-Maram',
    author: 'Ibn Hajar al-Asqalani',
    language: 'English',
    size: '9 MB',
    categoryId: 'fiqh',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF available (Dar-us-Salam translation)
  },
  {
    id: 'f4',
    title: 'Fiqh us-Sunnah',
    author: 'Sayyid Sabiq',
    language: 'English',
    size: '12 MB',
    categoryId: 'fiqh',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF available (Dar-us-Salam translation)
  },
  {
    id: 'f5',
    title: 'The Treatise on Rights',
    author: 'Imam Zain al-Abidin',
    language: 'English',
    size: '3 MB',
    categoryId: 'fiqh',
    sourceUrl: '', // ❌ Translation rights unclear — no verified free source
  },
  {
    id: 'f6',
    title: 'Al-Umdah fi al-Fiqh',
    author: 'Ibn Qudamah al-Maqdisi',
    language: 'Arabic',
    size: '6 MB',
    categoryId: 'fiqh',
    sourceUrl: 'https://shamela.ws', // ✅ Classical Arabic text, freely available on Shamela
  },

  // ═══════════════════════════════════════
  // AQEEDAH
  // ═══════════════════════════════════════
  {
    id: 'a1',
    title: 'The Book of Tawheed',
    author: 'Sheikh Muhammad ibn Abdul Wahhab',
    language: 'English',
    size: '5 MB',
    categoryId: 'aqeedah',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF (Dar-us-Salam translation)
  },
  {
    id: 'a2',
    title: 'Aqeedah at-Tahawiyyah',
    author: "Imam Abu Ja'far at-Tahawi",
    language: 'English',
    size: '4 MB',
    categoryId: 'aqeedah',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF (Dar-us-Salam translation by Ibn Attiyah)
  },
  {
    id: 'a3',
    title: 'Kitab al-Tawhid',
    author: 'Imam Ibn Khuzaymah',
    language: 'Arabic',
    size: '8 MB',
    categoryId: 'aqeedah',
    sourceUrl: 'https://shamela.ws', // ✅ Classical Arabic text, freely available on Shamela
  },
  {
    id: 'a4',
    title: 'The Four Rules Regarding Shirk',
    author: 'Muhammad ibn Abdul Wahhab',
    language: 'English',
    size: '2 MB',
    categoryId: 'aqeedah',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF (Dar-us-Salam)
  },
  {
    id: 'a5',
    title: 'Essay on the Heart',
    author: 'Ibn Taymiyyah',
    language: 'English',
    size: '6 MB',
    categoryId: 'aqeedah',
    sourceUrl: '', // ❌ English translation rights unclear — no verified free source
  },

  // ═══════════════════════════════════════
  // SEERAH
  // ═══════════════════════════════════════
  {
    id: 's1',
    title: 'The Sealed Nectar',
    author: 'Safiur Rahman Mubarakpuri',
    language: 'English',
    size: '12 MB',
    categoryId: 'seerah',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF (Dar-us-Salam, Rabita award winner)
  },
  {
    id: 's2',
    title: 'Ar-Raheeq Al-Makhtum',
    author: 'Mubarakpuri · Arabic original',
    language: 'Arabic',
    size: '18 MB',
    categoryId: 'seerah',
    sourceUrl: 'https://shamela.ws', // ✅ Classical Arabic text, freely available on Shamela
  },
  {
    id: 's3',
    title: 'Muhammad: His Life Based on the Earliest Sources',
    author: 'Martin Lings',
    language: 'English',
    size: '15 MB',
    categoryId: 'seerah',
    sourceUrl: '', // ❌ Copyrighted (originally published by George Allen & Unwin, now various publishers) — no free PDF
  },
  {
    id: 's4',
    title: "Ash-Shama'il Al-Muhammadiyyah",
    author: 'Imam at-Tirmidhi',
    language: 'English',
    size: '9 MB',
    categoryId: 'seerah',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF (Dar-us-Salam translation)
  },
  {
    id: 's5',
    title: "Zad al-Ma'ad (Provisions of the Hereafter)",
    author: 'Ibn Qayyim al-Jawziyya',
    language: 'English',
    size: '21 MB',
    categoryId: 'seerah',
    sourceUrl: '', // ❌ English translation rights held by various publishers — no verified free source
  },
  {
    id: 's6',
    title: 'When the Moon Split',
    author: 'Safiur Rahman Mubarakpuri',
    language: 'English',
    size: '10 MB',
    categoryId: 'seerah',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF (Dar-us-Salam)
  },

  // ═══════════════════════════════════════
  // ISLAMIC HISTORY
  // ═══════════════════════════════════════
  {
    id: 'hi1',
    title: 'The History of the Khalifahs',
    author: 'Imam as-Suyuti',
    language: 'English',
    size: '7 MB',
    categoryId: 'history',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF (Dar-us-Salam translation by Habib Ur Rahman Siddique Kandhalvi)
  },
  {
    id: 'hi2',
    title: 'The Venture of Islam',
    author: 'Marshall Hodgson',
    language: 'English',
    size: '45 MB',
    categoryId: 'history',
    sourceUrl: '', // ❌ Copyrighted academic work (University of Chicago Press) — no free PDF
  },
  {
    id: 'hi3',
    title: 'The Decline and Fall of the Caliphate',
    author: 'M. A. Shakoor',
    language: 'English',
    size: '11 MB',
    categoryId: 'history',
    sourceUrl: '', // ❌ Copyright status unclear — no verified free source
  },
  {
    id: 'hi4',
    title: 'Stories of the Prophets',
    author: 'Ibn Kathir',
    language: 'English',
    size: '13 MB',
    categoryId: 'history',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF (Dar-us-Salam translation)
  },
  {
    id: 'hi5',
    title: 'Futuh al-Buldan',
    author: 'Ahmad ibn Yahya al-Baladhuri',
    language: 'Arabic',
    size: '16 MB',
    categoryId: 'history',
    sourceUrl: 'https://shamela.ws', // ✅ Classical Arabic text, freely available on Shamela
  },

  // ═══════════════════════════════════════
  // FATWA
  // ═══════════════════════════════════════
  {
    id: 'fa1',
    title: 'Fatawa Ibn Taymiyyah',
    author: 'Ibn Taymiyyah',
    language: 'Arabic',
    size: '32 MB',
    categoryId: 'fatwa',
    sourceUrl: 'https://shamela.ws', // ✅ Classical Arabic text, freely available on Shamela (Majmu al-Fatawa)
  },
  {
    id: 'fa2',
    title: "Fatawa al-Lajnah ad-Da'imah",
    author: 'Permanent Committee',
    language: 'Arabic',
    size: '28 MB',
    categoryId: 'fatwa',
    sourceUrl: 'https://www.alifta.net/', // ✅ Official website of the Permanent Committee (Saudi Arabia)
  },
  {
    id: 'fa3',
    title: 'Fatawa Arkan ul-Islam',
    author: 'Sheikh Ibn Uthaymeen',
    language: 'English',
    size: '8 MB',
    categoryId: 'fatwa',
    sourceUrl: 'https://kalamullah.com/Books.html', // ✅ Free PDF (Dar-us-Salam)
  },
  {
    id: 'fa4',
    title: 'Contemporary Legal Rulings',
    author: 'Sheikh Ibn Uthaymeen',
    language: 'English',
    size: '10 MB',
    categoryId: 'fatwa',
    sourceUrl: '', // ❌ Translation rights unclear — no verified free source
  },

  // ═══════════════════════════════════════
  // CHILDREN'S BOOKS
  // ═══════════════════════════════════════
  {
    id: 'k1',
    title: 'My First Quran Storybook',
    author: 'Saniyasnain Khan',
    language: 'English',
    size: '5 MB',
    categoryId: 'kids',
    sourceUrl: '', // ❌ Copyrighted (Goodword Books) — no free PDF
  },
  {
    id: 'k2',
    title: 'Tell Me About: The Prophet Muhammad',
    author: 'Saniyasnain Khan',
    language: 'English',
    size: '4 MB',
    categoryId: 'kids',
    sourceUrl: '', // ❌ Copyrighted (Goodword Books) — no free PDF
  },
  {
    id: 'k3',
    title: 'Goodnight Stories from the Quran',
    author: 'Saniyasnain Khan',
    language: 'English',
    size: '6 MB',
    categoryId: 'kids',
    sourceUrl: '', // ❌ Copyrighted (Goodword Books) — no free PDF
  },
  {
    id: 'k4',
    title: 'The Greatest Stories from the Quran',
    author: 'Saniyasnain Khan',
    language: 'English',
    size: '7 MB',
    categoryId: 'kids',
    sourceUrl: '', // ❌ Copyrighted (Goodword Books) — no free PDF
  },

  // ═══════════════════════════════════════
  // ISLAMIC ETHICS
  // ═══════════════════════════════════════
  {
    id: 'e1',
    title: 'The Ethics of Disagreement',
    author: 'Taha Jabir Alalwani',
    language: 'English',
    size: '5 MB',
    categoryId: 'ethics',
    sourceUrl: '', // ❌ Copyrighted (IIIT publication) — no verified free source
  },
  {
    id: 'e2',
    title: 'Purification of the Heart',
    author: 'Hamza Yusuf',
    language: 'English',
    size: '8 MB',
    categoryId: 'ethics',
    sourceUrl: '', // ❌ Copyrighted (Sandala Publications) — no free PDF
  },
  {
    id: 'e3',
    title: 'Inner Dimensions of Islamic Worship',
    author: 'Imam Ghazali',
    language: 'English',
    size: '6 MB',
    categoryId: 'ethics',
    sourceUrl: '', // ❌ Translation rights unclear — no verified free source
  },
  {
    id: 'e4',
    title: 'The Book of Assistance',
    author: 'Imam al-Haddad',
    language: 'English',
    size: '5 MB',
    categoryId: 'ethics',
    sourceUrl: 'https://www.fonsvitae.com/the-book-of-assistance/', // ⚠️ Fons Vitae — copyrighted translation, purchase page
  },
  {
    id: 'e5',
    title: 'Revival of Religious Sciences',
    author: 'Imam Ghazali',
    language: 'Arabic',
    size: '55 MB',
    categoryId: 'ethics',
    sourceUrl: 'https://shamela.ws', // ✅ Classical Arabic text (Ihya Ulum al-Din), freely available on Shamela
  },
];
// ============================================
// ICONS
// ============================================

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke={colors.secondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M9 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z"
        stroke={colors.secondary}
        strokeWidth={1.8}
      />
      <Path
        d="M13 13l3.5 3.5"
        stroke={colors.secondary}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BookIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.6} strokeLinejoin="round">
      <Path d="M12 6c-2-1.4-4.5-1.5-7-.6V19c2.5-.9 5-.8 7 .6 2-1.4 4.5-1.5 7-.6V5.4c-2.5-.9-5-.8-7 .6Z" />
      <Path d="M12 6v13.6" />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke={alpha(colors.secondary, 0.35)}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ============================================
// BOOK CARD
// ============================================

function BookCard({ book }: { book: LibraryBook }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
       onPress={() => {
    if (book.sourceUrl) {
      Linking.openURL(book.sourceUrl);
    }
  }}
    >
      <View style={styles.cover}>
        <BookIcon />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author}
        </Text>
        <Text style={styles.bookMeta}>
          {book.language} · {book.size}
        </Text>
      </View>
      <ChevronRightIcon />
    </Pressable>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function LibraryCategoryScreen() {
  const insets = useSafeAreaInsets();
  const { categoryId } = useLocalSearchParams();
   const appCategoryId = (categoryId as string) || 'seerah';

  const [query, setQuery] = useState('');

  // Derive everything from the actual BOOKS array
  const categoryBooks = useMemo(
    () => BOOKS.filter((b) => b.categoryId === appCategoryId),
    [appCategoryId]
  );

  const categoryInfo = CATEGORY_NAMES[appCategoryId] || {
    name: 'Unknown',
    arabicName: '',
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return categoryBooks;
    const q = query.toLowerCase();
    return categoryBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
    );
  }, [categoryBooks, query]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <BackIcon />
          </Pressable>
                    <View style={styles.titleBlock}>
            <Text style={styles.title}>{categoryInfo.name}</Text>
            {categoryInfo.arabicName ? (
              <Text style={styles.arabicTitle}>
                {categoryInfo.arabicName}
              </Text>
            ) : null}
            <Text style={styles.bookCount}>
              {categoryBooks.length} books
            </Text>
          </View>
          <Pressable style={styles.iconButton}>
            <SearchIcon />
          </Pressable>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search books or authors…"
            placeholderTextColor={alpha(colors.secondary, 0.4)}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Book list */}
        <View style={styles.list}>
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>No books found</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 12 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 22,
    color: colors.secondary,
    letterSpacing: -0.01,
    textAlign: 'center',
  },
  arabicTitle: {
    fontFamily: 'Amiri',
    fontSize: 17,
    color: colors.primary,
    marginTop: 3,
    textAlign: 'center',
  },
  bookCount: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },

  // Search
  searchContainer: {
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.secondary,
    padding: 0,
  },

  // List
  list: {
    marginTop: 4,
    gap: 12,
    paddingBottom: 6,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 15,
    color: colors.textSecondary,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.pressedBg,
  },
  cover: {
    width: 46,
    height: 62,
    borderRadius: 8,
    backgroundColor: alpha(colors.primary, 0.08),
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.25),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  bookTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.secondary,
    lineHeight: 14.5 * 1.3,
  },
  bookAuthor: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bookMeta: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
});