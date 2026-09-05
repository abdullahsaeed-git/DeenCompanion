/**
 * 99 Names of Allah Screen
 *
 * Displays Asma ul-Husna with Arabic, transliteration, and meaning.
 * Route: /names-of-allah
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
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';
import { BackIcon, SearchIcon } from '@/components/Icons';

// ============================================
// DATA — Asma ul-Husna
// ============================================

interface NameOfAllah {
  number: number;
  arabic: string;
  transliteration: string;
  meaning: string;
}

const NAMES: NameOfAllah[] = [
  { number: 1, arabic: 'الرَّحْمَنُ', transliteration: 'Ar-Rahman', meaning: 'The Most Gracious' },
  { number: 2, arabic: 'الرَّحِيمُ', transliteration: 'Ar-Raheem', meaning: 'The Most Merciful' },
  { number: 3, arabic: 'الْمَلِكُ', transliteration: 'Al-Malik', meaning: 'The King' },
  { number: 4, arabic: 'الْقُدُّوسُ', transliteration: 'Al-Quddus', meaning: 'The Most Holy' },
  { number: 5, arabic: 'السَّلاَمُ', transliteration: 'As-Salam', meaning: 'The Source of Peace' },
  { number: 6, arabic: 'الْمُؤْمِنُ', transliteration: 'Al-Mumin', meaning: 'The Guardian of Faith' },
  { number: 7, arabic: 'الْمُهَيْمِنُ', transliteration: 'Al-Muhaymin', meaning: 'The Protector' },
  { number: 8, arabic: 'الْعَزِيزُ', transliteration: 'Al-Aziz', meaning: 'The Almighty' },
  { number: 9, arabic: 'الْجَبَّارُ', transliteration: 'Al-Jabbar', meaning: 'The Compeller' },
  { number: 10, arabic: 'الْمُتَكَبِّرُ', transliteration: 'Al-Mutakabbir', meaning: 'The Greatest' },
  { number: 11, arabic: 'الْخَالِقُ', transliteration: 'Al-Khaliq', meaning: 'The Creator' },
  { number: 12, arabic: 'الْبَارِئُ', transliteration: 'Al-Bari', meaning: 'The Maker' },
  { number: 13, arabic: 'الْمُصَوِّرُ', transliteration: 'Al-Musawwir', meaning: 'The Fashioner' },
  { number: 14, arabic: 'الْغَفَّارُ', transliteration: 'Al-Ghaffar', meaning: 'The Forgiver' },
  { number: 15, arabic: 'الْقَهَّارُ', transliteration: 'Al-Qahhar', meaning: 'The Subduer' },
  { number: 16, arabic: 'الْوَهَّابُ', transliteration: 'Al-Wahhab', meaning: 'The Bestower' },
  { number: 17, arabic: 'الرَّزَّاقُ', transliteration: 'Ar-Razzaq', meaning: 'The Provider' },
  { number: 18, arabic: 'الْفَتَّاحُ', transliteration: 'Al-Fattah', meaning: 'The Opener' },
  { number: 19, arabic: 'اَلْعَلِيمُ', transliteration: 'Al-Alim', meaning: 'The All-Knowing' },
  { number: 20, arabic: 'الْقَابِضُ', transliteration: 'Al-Qabid', meaning: 'The Constrictor' },
  { number: 21, arabic: 'الْبَاسِطُ', transliteration: 'Al-Basit', meaning: 'The Expander' },
  { number: 22, arabic: 'الْخَافِضُ', transliteration: 'Al-Khafid', meaning: 'The Abaser' },
  { number: 23, arabic: 'الرَّافِعُ', transliteration: 'Ar-Rafi', meaning: 'The Exalter' },
  { number: 24, arabic: 'الْمُعِزُّ', transliteration: 'Al-Muizz', meaning: 'The Giver of Honour' },
  { number: 25, arabic: 'الْمُذِلُّ', transliteration: 'Al-Mudhill', meaning: 'The Giver of Dishonour' },
  { number: 26, arabic: 'السَّمِيعُ', transliteration: 'As-Sami', meaning: 'The All-Hearing' },
  { number: 27, arabic: 'الْبَصِيرُ', transliteration: 'Al-Basir', meaning: 'The All-Seeing' },
  { number: 28, arabic: 'الْحَكَمُ', transliteration: 'Al-Hakam', meaning: 'The Judge' },
  { number: 29, arabic: 'الْعَدْلُ', transliteration: 'Al-Adl', meaning: 'The Just' },
  { number: 30, arabic: 'اللَّطِيفُ', transliteration: 'Al-Latif', meaning: 'The Subtle' },
  { number: 31, arabic: 'الْخَبِيرُ', transliteration: 'Al-Khabir', meaning: 'The Aware' },
  { number: 32, arabic: 'الْحَلِيمُ', transliteration: 'Al-Halim', meaning: 'The Forbearing' },
  { number: 33, arabic: 'الْعَظِيمُ', transliteration: 'Al-Azim', meaning: 'The Magnificent' },
  { number: 34, arabic: 'الْغَفُورُ', transliteration: 'Al-Ghafur', meaning: 'The Forgiving' },
  { number: 35, arabic: 'الشَّكُورُ', transliteration: 'Ash-Shakur', meaning: 'The Appreciative' },
  { number: 36, arabic: 'الْعَلِيُّ', transliteration: 'Al-Ali', meaning: 'The Most High' },
  { number: 37, arabic: 'الْكَبِيرُ', transliteration: 'Al-Kabir', meaning: 'The Greatest' },
  { number: 38, arabic: 'الْحَفِيظُ', transliteration: 'Al-Hafiz', meaning: 'The Preserver' },
  { number: 39, arabic: 'الْمُقِيتُ', transliteration: 'Al-Muqit', meaning: 'The Sustainer' },
  { number: 40, arabic: 'الْحَسِيبُ', transliteration: 'Al-Hasib', meaning: 'The Reckoner' },
  { number: 41, arabic: 'الْجَلِيلُ', transliteration: 'Al-Jalil', meaning: 'The Majestic' },
  { number: 42, arabic: 'الْكَرِيمُ', transliteration: 'Al-Karim', meaning: 'The Generous' },
  { number: 43, arabic: 'الرَّقِيبُ', transliteration: 'Ar-Raqib', meaning: 'The Watchful' },
  { number: 44, arabic: 'الْمُجِيبُ', transliteration: 'Al-Mujib', meaning: 'The Responsive' },
  { number: 45, arabic: 'الْوَاسِعُ', transliteration: 'Al-Wasi', meaning: 'The All-Encompassing' },
  { number: 46, arabic: 'الْحَكِيمُ', transliteration: 'Al-Hakim', meaning: 'The Wise' },
  { number: 47, arabic: 'الْوَدُودُ', transliteration: 'Al-Wadud', meaning: 'The Loving' },
  { number: 48, arabic: 'الْمَجِيدُ', transliteration: 'Al-Majid', meaning: 'The Glorious' },
  { number: 49, arabic: 'الْبَاعِثُ', transliteration: 'Al-Baith', meaning: 'The Resurrector' },
  { number: 50, arabic: 'الشَّهِيدُ', transliteration: 'Ash-Shahid', meaning: 'The Witness' },
  { number: 51, arabic: 'الْحَقُّ', transliteration: 'Al-Haqq', meaning: 'The Truth' },
  { number: 52, arabic: 'الْوَكِيلُ', transliteration: 'Al-Wakil', meaning: 'The Trustee' },
  { number: 53, arabic: 'الْقَوِيُّ', transliteration: 'Al-Qawiyy', meaning: 'The Strong' },
  { number: 54, arabic: 'الْمَتِينُ', transliteration: 'Al-Matin', meaning: 'The Firm' },
  { number: 55, arabic: 'الْوَلِيُّ', transliteration: 'Al-Wali', meaning: 'The Protecting Friend' },
  { number: 56, arabic: 'الْحَمِيدُ', transliteration: 'Al-Hamid', meaning: 'The Praiseworthy' },
  { number: 57, arabic: 'الْمُحْصِي', transliteration: 'Al-Muhsi', meaning: 'The Counter' },
  { number: 58, arabic: 'الْمُبْدِئُ', transliteration: 'Al-Mubdi', meaning: 'The Originator' },
  { number: 59, arabic: 'الْمُعِيدُ', transliteration: 'Al-Muid', meaning: 'The Restorer' },
  { number: 60, arabic: 'الْمُحْيِي', transliteration: 'Al-Muhyi', meaning: 'The Giver of Life' },
  { number: 61, arabic: 'الْمُمِيتُ', transliteration: 'Al-Mumit', meaning: 'The Bringer of Death' },
  { number: 62, arabic: 'الْحَيُّ', transliteration: 'Al-Hayy', meaning: 'The Ever-Living' },
  { number: 63, arabic: 'الْقَيُّومُ', transliteration: 'Al-Qayyum', meaning: 'The Self-Subsisting' },
  { number: 64, arabic: 'الْوَاجِدُ', transliteration: 'Al-Wajid', meaning: 'The Finder' },
  { number: 65, arabic: 'الْمَاجِدُ', transliteration: 'Al-Majid', meaning: 'The Noble' },
  { number: 66, arabic: 'الْوَاحِدُ', transliteration: 'Al-Wahid', meaning: 'The One' },
  { number: 67, arabic: 'الْأَحَدُ', transliteration: 'Al-Ahad', meaning: 'The Unique' },
  { number: 68, arabic: 'الصَّمَدُ', transliteration: 'As-Samad', meaning: 'The Eternal' },
  { number: 69, arabic: 'الْقَادِرُ', transliteration: 'Al-Qadir', meaning: 'The Able' },
  { number: 70, arabic: 'الْمُقْتَدِرُ', transliteration: 'Al-Muqtadir', meaning: 'The Powerful' },
  { number: 71, arabic: 'الْمُقَدِّمُ', transliteration: 'Al-Muqaddim', meaning: 'The Expediter' },
  { number: 72, arabic: 'الْمُؤَخِّرُ', transliteration: 'Al-Muakhkhir', meaning: 'The Delayer' },
  { number: 73, arabic: 'الْأَوَّلُ', transliteration: 'Al-Awwal', meaning: 'The First' },
  { number: 74, arabic: 'الْآخِرُ', transliteration: 'Al-Akhir', meaning: 'The Last' },
  { number: 75, arabic: 'الظَّاهِرُ', transliteration: 'Az-Zahir', meaning: 'The Manifest' },
  { number: 76, arabic: 'الْبَاطِنُ', transliteration: 'Al-Batin', meaning: 'The Hidden' },
  { number: 77, arabic: 'الْوَالِي', transliteration: 'Al-Wali', meaning: 'The Governor' },
  { number: 78, arabic: 'الْمُتَعَالِي', transliteration: 'Al-Mutaali', meaning: 'The Most Exalted' },
  { number: 79, arabic: 'الْبَرُّ', transliteration: 'Al-Barr', meaning: 'The Source of Goodness' },
  { number: 80, arabic: 'التَّوَّابُ', transliteration: 'At-Tawwab', meaning: 'The Acceptor of Repentance' },
  { number: 81, arabic: 'الْمُنْتَقِمُ', transliteration: 'Al-Muntaqim', meaning: 'The Avenger' },
  { number: 82, arabic: 'العَفُوُّ', transliteration: 'Al-Afuww', meaning: 'The Pardoner' },
  { number: 83, arabic: 'الرَّؤُوفُ', transliteration: 'Ar-Rauf', meaning: 'The Compassionate' },
  { number: 84, arabic: 'مَالِكُ الْمُلْكِ', transliteration: 'Malik-ul-Mulk', meaning: 'The Owner of All' },
  { number: 85, arabic: 'ذُوالْجَلَالِ وَالْإِكْرَامِ', transliteration: 'Dhu-al-Jalal wal-Ikram', meaning: 'The Lord of Majesty and Honour' },
  { number: 86, arabic: 'الْمُقْسِطُ', transliteration: 'Al-Muqsit', meaning: 'The Equitable' },
  { number: 87, arabic: 'الْجَامِعُ', transliteration: 'Al-Jami', meaning: 'The Gatherer' },
  { number: 88, arabic: 'الْغَنِيُّ', transliteration: 'Al-Ghani', meaning: 'The Self-Sufficient' },
  { number: 89, arabic: 'الْمُغْنِي', transliteration: 'Al-Mughni', meaning: 'The Enricher' },
  { number: 90, arabic: 'الْمَانِعُ', transliteration: 'Al-Mani', meaning: 'The Preventer' },
  { number: 91, arabic: 'الضَّارُّ', transliteration: 'Ad-Darr', meaning: 'The Distressor' },
  { number: 92, arabic: 'النَّافِعُ', transliteration: 'An-Nafi', meaning: 'The Benefactor' },
  { number: 93, arabic: 'النُّورُ', transliteration: 'An-Nur', meaning: 'The Light' },
  { number: 94, arabic: 'الْهَادِي', transliteration: 'Al-Hadi', meaning: 'The Guide' },
  { number: 95, arabic: 'الْبَدِيعُ', transliteration: 'Al-Badi', meaning: 'The Incomparable' },
  { number: 96, arabic: 'الْبَاقِي', transliteration: 'Al-Baqi', meaning: 'The Everlasting' },
  { number: 97, arabic: 'الْوَارِثُ', transliteration: 'Al-Warith', meaning: 'The Inheritor' },
  { number: 98, arabic: 'الرَّشِيدُ', transliteration: 'Ar-Rashid', meaning: 'The Guide to the Right Path' },
  { number: 99, arabic: 'الصَّبُورُ', transliteration: 'As-Sabur', meaning: 'The Patient' },
];

// ============================================
// ICONS
// ============================================

// function BackIcon() {
//   return (
//     <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
//       <Path
//         d="M12.5 4.5 7 10l5.5 5.5"
//         stroke={colors.secondary}
//         strokeWidth={2}
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </Svg>
//   );
// }

// function SearchIcon() {
//   return (
//     <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
//       <Path
//         d="M9 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z"
//         stroke={colors.textMuted}
//         strokeWidth={1.8}
//       />
//       <Path
//         d="M13 13l3.5 3.5"
//         stroke={colors.textMuted}
//         strokeWidth={1.8}
//         strokeLinecap="round"
//       />
//     </Svg>
//   );
// }

// ============================================
// NAME CARD
// ============================================

function NameCard({ name }: { name: NameOfAllah }) {
  return (
    <View style={styles.card}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{name.number}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.arabicName}>{name.arabic}</Text>
        <Text style={styles.transliteration}>{name.transliteration}</Text>
        <Text style={styles.meaning}>{name.meaning}</Text>
      </View>
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function NamesOfAllahScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return NAMES;
    const q = query.toLowerCase();
    return NAMES.filter(
      (n) =>
        n.transliteration.toLowerCase().includes(q) ||
        n.meaning.toLowerCase().includes(q) ||
        n.arabic.includes(q)
    );
  }, [query]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop:   8, paddingBottom: insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <BackIcon />
          </Pressable>
          <Text style={styles.title}>99 Names</Text>
          <View style={styles.spacer} />
        </View>

        <Text style={styles.subtitle}>Asma ul-Husna</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or meaning…"
            placeholderTextColor={alpha(colors.secondary, 0.4)}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* List */}
        <View style={styles.list}>
          {filtered.map((name) => (
            <NameCard key={name.number} name={name} />
          ))}
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>No names found</Text>
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
  content: { paddingHorizontal: 20, gap: 10 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 20,
    color: colors.secondary,
  },
  spacer: { width: 44 },
  subtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -4,
    marginBottom: 4,
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
  list: { gap: 10, marginTop: 4 },
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
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  arabicName: {
    fontFamily: 'Amiri',
    fontSize: 20,
    lineHeight: 28,
    color: colors.secondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  transliteration: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  meaning: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
});