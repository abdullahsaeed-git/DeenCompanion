/**
 * Dua Collection Screen
 *
 * Browse duas by category. Each dua shows:
 * - Arabic text (RTL, Amiri font)
 * - Transliteration
 * - English translation
 * - Source reference
 *
 * Route: /dua-collection
 */

import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ColorValue,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';
import { bookmarkService } from '../services/bookmarkService';
import { CloudIcon, CupIcon, HeartIcon, HomeIcon, MatIcon, MoonIcon, PlaneIcon, ShieldIcon, SunIcon } from '@/components/Icons';

// ============================================
// TYPES
// ============================================

interface DuaCategory {
  id: string;
  name: string;
  count: number;
}

interface Dua {
  id: string;
  categoryId: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  bookmarked: boolean;
}

// ============================================
// CATEGORY ICONS
// ============================================

// function SunIcon({ size = 18 }: { size?: number }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round">
//       <Circle cx={12} cy={12} r={4} />
//       <Path d="M12 3.5V5M12 19v1.5M3.5 12H5M19 12h1.5M6 6l1.1 1.1M16.9 16.9 18 18M18 6l-1.1 1.1M7.1 16.9 6 18" />
//     </Svg>
//   );
// }

// function MoonIcon({ size = 18 }: { size?: number }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
//       <Path d="M16.5 5.2a8 8 0 1 0 4.8 13.1A9 9 0 0 1 16.5 5.2Z" />
//     </Svg>
//   );
// }

// function PlaneIcon({ size = 18 }: { size?: number }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
//       <Path d="M3.5 11.5 20.5 4.5l-7 16-2.4-7.2Z" />
//     </Svg>
//   );
// }

// function CupIcon({ size = 18 }: { size?: number }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
//       <Path d="M5 10h11v4a5.5 5.5 0 0 1-11 0Z" />
//       <Path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 7c0-1 .8-1 .8-2M12 7c0-1 .8-1 .8-2" />
//     </Svg>
//   );
// }

// function MatIcon({ size = 18 }: { size?: number }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
//       <Rect x={5.5} y={4} width={13} height={16} rx={2} />
//       <Path d="M12 8c-2 1.4-3 2.6-3 4.5V16h6v-3.5c0-1.9-1-3.1-3-4.5Z" />
//     </Svg>
//   );
// }

// function ShieldIcon({ size = 18 }: { size?: number }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
//       <Path d="M12 3l7 2.6V11c0 4.6-3 7.9-7 9.4-4-1.5-7-4.8-7-9.4V5.6Z" />
//     </Svg>
//   );
// }

// function HeartIcon({ size = 18 }: { size?: number }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
//       <Path d="M12 19s-7-4.6-7-9.5C5 6.6 7 5 9.2 5c1.3 0 2.3.6 2.8 1.6C12.5 5.6 13.5 5 14.8 5 17 5 19 6.6 19 9.5c0 4.9-7 9.5-7 9.5Z" />
//     </Svg>
//   );
// }

// function HomeIcon({ size = 18 }: { size?: number }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
//       <Path d="M5 11 12 5l7 6v9H5Z" />
//       <Path d="M10 20v-5h4v5" />
//     </Svg>
//   );
// }

// function CloudIcon({ size = 18 }: { size?: number }) {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
//       <Path d="M7 15a4 4 0 0 1 .6-8 5 5 0 0 1 9.6 1.2A3.4 3.4 0 0 1 17 15Z" />
//       <Path d="M12 17v4M9.5 18.5 12 21l2.5-2.5" />
//     </Svg>
//   );
// }

const CATEGORY_ICONS: Record<string, React.FC<{ size?: number }>> = {
  'morning-evening': SunIcon,
  'before-sleeping': MoonIcon,
  'travel': PlaneIcon,
  'eating-drinking': CupIcon,
  'prayer': MatIcon,
  'protection': ShieldIcon,
  'forgiveness': HeartIcon,
  'family': HomeIcon,
  'difficult-times': CloudIcon,
};

// ============================================
// DATA
// ============================================

const CATEGORIES: DuaCategory[] = [
  { id: 'morning-evening', name: 'Morning & Evening', count: 12 },
  { id: 'before-sleeping', name: 'Before Sleeping', count: 8 },
  { id: 'travel', name: 'Travel', count: 6 },
  { id: 'eating-drinking', name: 'Eating & Drinking', count: 7 },
  { id: 'prayer', name: 'Prayer', count: 10 },
  { id: 'protection', name: 'Protection', count: 9 },
  { id: 'forgiveness', name: 'Forgiveness', count: 8 },
  { id: 'family', name: 'Family', count: 6 },
  { id: 'difficult-times', name: 'Difficult Times', count: 7 },
];

const DUAS: Dua[] = [
  {
    id: '1',
    categoryId: 'morning-evening',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: 'Asbahna wa asbahal-mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la sharika lah.',
    translation: '"We have entered the morning and the whole kingdom belongs to Allah. All praise is for Allah. None has the right to be worshipped but Allah alone, without partner."',
    source: 'Sahih Muslim · 2723',
    bookmarked: true,
  },
  {
    id: '2',
    categoryId: 'morning-evening',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    transliteration: 'Allahumma bika asbahna wa bika amsayna, wa bika nahya wa bika namut, wa ilaykan-nushur.',
    translation: '"O Allah, by You we enter the morning and by You we enter the evening; by You we live and by You we die, and to You is the resurrection."',
    source: "Jami' at-Tirmidhi · 3391",
    bookmarked: false,
  },
  {
    id: '3',
    categoryId: 'morning-evening',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: "A'udhu bikalimatil-lahit-tammati min sharri ma khalaq.",
    translation: '"I seek refuge in the perfect words of Allah from the evil of what He has created."',
    source: 'Sahih Muslim · 2708',
    bookmarked: false,
  },
  {
    id: '4',
    categoryId: 'before-sleeping',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya.',
    translation: '"In Your name, O Allah, I die and I live."',
    source: 'Sahih al-Bukhari · 6324',
    bookmarked: false,
  },
  {
    id: '5',
    categoryId: 'before-sleeping',
    arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    transliteration: 'Allahumma qini adhabaka yawma tab\'athu ibadak.',
    translation: '"O Allah, protect me from Your punishment on the day You resurrect Your servants."',
    source: 'Sunan Abu Dawood · 5050',
    bookmarked: false,
  },
  {
    id: '6',
    categoryId: 'travel',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ',
    transliteration: 'Subhanalladhi sakhkhara lana hadha wa ma kunna lahu muqrinin.',
    translation: '"Glory be to Him who has subjected this to us, and we could never have it by our own efforts."',
    source: 'Quran · 43:13',
    bookmarked: false,
  },
  {
    id: '7',
    categoryId: 'eating-drinking',
    arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ',
    transliteration: 'Allahumma barik lana fihi wa zidna minhu.',
    translation: '"O Allah, bless it for us and give us more of it."',
    source: "Jami' at-Tirmidhi · 3458",
    bookmarked: false,
  },
  {
    id: '8',
    categoryId: 'prayer',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ',
    transliteration: 'Allahumma inni audhu bika min adhabil-qabr.',
    translation: '"O Allah, I seek refuge in You from the punishment of the grave."',
    source: 'Sahih al-Bukhari · 832',
    bookmarked: false,
  },
  {
    id: '9',
    categoryId: 'protection',
    arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    transliteration: "A'udhu billahi minash-shaytanir-rajim.",
    translation: '"I seek refuge in Allah from the accursed Satan."',
    source: 'Quran · 16:98',
    bookmarked: false,
  },
  {
    id: '10',
    categoryId: 'forgiveness',
    arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
    transliteration: 'Rabbigh-fir li wa liwalidayya wa lil-mumineena yawma yaqumul-hisab.',
    translation: '"My Lord, forgive me and my parents and the believers on the Day the account is established."',
    source: 'Quran · 14:41',
    bookmarked: false,
  },
  {
    id: '11',
    categoryId: 'family',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ',
    transliteration: 'Rabbana hab lana min azwajina wa dhurriyyatina qurrata ayyun.',
    translation: '"Our Lord, grant us from among our wives and offspring comfort to our eyes."',
    source: 'Quran · 25:74',
    bookmarked: false,
  },
  {
    id: '12',
    categoryId: 'difficult-times',
    arabic: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: 'La ilaha illa anta subhanaka inni kuntu minaz-zalimin.',
    translation: '"There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers."',
    source: 'Quran · 21:87',
    bookmarked: false,
  },
];

// ============================================
// ICONS
// ============================================

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M12.5 4.5 7 10l5.5 5.5" stroke={colors.secondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 20 20" fill="none">
      <Circle cx={9} cy={9} r={6.5} stroke={colors.secondary} strokeWidth={1.8} />
      <Path d="M14 14 L18 18" stroke={colors.secondary} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function BookmarkIcon({ filled = false, header = false }: { filled?: boolean , header?: boolean}) {
  return filled ? (
    <Svg width={17} height={17} viewBox="0 0 20 20" fill="none">
      <Path d="M6 3h8v14l-4-3.2L6 17Z" fill={colors.accent} />
    </Svg>
  ) : (
    <Svg width={17} height={17} viewBox="0 0 20 20" fill="none">
      <Path d="M6 3h8v14l-4-3.2L6 17Z" stroke={header ? colors.secondary : colors.textSecondary} strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  );
}

function ShareIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 20 20" fill="none" stroke={colors.textSecondary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10 12V3.5M6.8 6.2 10 3l3.2 3.2" />
      <Path d="M5 9H4.5A1.5 1.5 0 0 0 3 10.5v5A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 15.5 9H15" />
    </Svg>
  );
}

function BookIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 20 20" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M6 2.8h8.5A2.5 2.5 0 0 1 17 5.3v11.4a2.5 2.5 0 0 1-2.5 2.5H6a2 2 0 0 1-2-2V4.8a2 2 0 0 1 2-2Z" />
    </Svg>
  );
}

// ============================================
// COMPONENTS
// ============================================

function CategoryChip({
  category,
  selected,
  onPress,
}: {
  category: DuaCategory;
  selected: boolean;
  onPress: () => void;
}) {
  const Icon = CATEGORY_ICONS[category.id];
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <View style={styles.chipIcon}>
        {Icon ? <Icon /> : null}
      </View>
      <Text style={[styles.chipName, selected && styles.chipNameSelected]} numberOfLines={2}>
        {category.name}
      </Text>
      <Text style={[styles.chipCount, selected && styles.chipCountSelected]}>
        {/* {category.count} duas */}
      </Text>
    </Pressable>
  );
}

function DuaCard({ dua, onToggleBookmark, isBookmarked }: { dua: Dua; onToggleBookmark: () => void; isBookmarked: boolean }) {
  return (
    <View style={styles.duaCard}>
      {/* Top actions */}
      <View style={styles.duaTop}>
        <Pressable
          style={({ pressed }) => [styles.duaBtn, pressed && styles.duaBtnPressed, isBookmarked && styles.duaBtnActive]}
          onPress={onToggleBookmark}
        >
          <BookmarkIcon filled={isBookmarked} />
        </Pressable>
        <Pressable style={styles.duaBtn}>
          <ShareIcon />
        </Pressable>
      </View>

      {/* Arabic */}
      <Text style={styles.duaArabic}>
        {dua.arabic}
      </Text>

      {/* Transliteration */}
      <Text style={styles.duaTransliteration}>
        {dua.transliteration}
      </Text>

      {/* Translation */}
      <Text style={styles.duaTranslation}>
        {dua.translation}
      </Text>

      {/* Source */}
      <View style={styles.duaSource}>
        <BookIcon />
        <Text style={styles.duaSourceText}>{dua.source}</Text>
      </View>
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function DuaCollectionScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('morning-evening');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
  async function loadBookmarks() {
    const all = await bookmarkService.getAllDuas();
    setBookmarkedIds(new Set(all.map((b) => b.id)));
  }
  loadBookmarks();
}, []);

  const filteredDuas = useMemo(
    () => DUAS.filter((d) => d.categoryId === selectedCategory),
    [selectedCategory]
  );

  const selectedCategoryData = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop:  8 }]}>
        <View style = {{flexDirection: "row", alignItems: "center"}}>

        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <BackIcon />
        </Pressable>
        <Text style={styles.title}>Duas</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <SearchIcon />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => router.push('/bookmarks/duas')}>
            <BookmarkIcon header = {true} />
          </Pressable>
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
        style={styles.chipsScroll}
      >
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.id}
            category={cat}
            selected={cat.id === selectedCategory}
            onPress={() => setSelectedCategory(cat.id)}
          />
        ))}
      </ScrollView>

      {/* Dua list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>
          {selectedCategoryData?.name} · {selectedCategoryData?.count} duas
        </Text>

            {filteredDuas.map((dua) => (
          <DuaCard
            key={dua.id}
            dua={dua}
            isBookmarked={bookmarkedIds.has(dua.id)}
            onToggleBookmark={async () => {
              const newState = await bookmarkService.toggleDua(dua);
              setBookmarkedIds((prev) => {
                const next = new Set(prev);
                if (newState) {
                  next.add(dua.id);
                } else {
                  next.delete(dua.id);
                }
                return next;
              });
            }}
          />
        ))}

        {filteredDuas.length === 0 && (
          <Text style={styles.emptyText}>No duas in this category yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 20,
    letterSpacing: -0.01,
    color: colors.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },

  // Chips
  chipsScroll: {
    maxHeight: 120,
    paddingTop: 8,
  },
  chipsContent: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    gap: 10,
  },
  chip: {
    width: 132,
    height: 92,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: alpha(colors.primary, 0.06),
    borderColor: colors.primary,
    shadowColor: alpha(colors.primary, 0.08),
  },
  chipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipName: {
    marginTop: 'auto',
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.secondary,
    lineHeight: 12.5 * 1.25,
  },
  chipNameSelected: {
    color: colors.primary,
  },
  chipCount: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  chipCountSelected: {
    color: alpha(colors.primary, 0.7),
  },

  // List
  list: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 8,
  },
  listContent: {
    gap: 14,
  },
  sectionLabel: {
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 15,
    color: colors.textSecondary,
  },

  // Dua card
  duaCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: alpha(colors.secondary, 0.05),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  duaTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 2,
  },
  duaBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duaArabic: {
    fontFamily: 'Amiri',
    fontSize: 20,
    lineHeight: 20 * 2.05,
    color: colors.secondary,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 4,
  },
  duaTransliteration: {
    marginTop: 8,
    fontSize: 12.5,
    fontStyle: 'italic',
    color: colors.textMuted,
    lineHeight: 12.5 * 1.6,
  },
  duaTranslation: {
    marginTop: 8,
    fontSize: 13.5,
    lineHeight: 13.5 * 1.65,
    color: colors.textSecondary,
  },
  duaSource: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  duaSourceText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.primary,
  },
    duaBtnPressed: {
    backgroundColor: alpha(colors.primary, 0.06),
  },
  duaBtnActive: {
    backgroundColor: alpha(colors.primary, 0.1),
  },
});