/**
 * Library Screen (Tab)
 *
 * The main Library browsing screen showing:
 * - Header with title and action buttons (solid background)
 * - Search bar
 * - "Browse by category" label
 * - 2-column grid of category cards
 *
 * Data is hardcoded for V1.
 */

import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { LibraryCategory } from '../../types/library';
import { CategoryCard } from '../../components/library/CategoryCard';
import { router } from 'expo-router';
import { BOOKS, CATEGORY_NAMES } from '../library-category';

// ============================================
// HARDCODED DATA (V1)
// ============================================

const categories = Object.entries(CATEGORY_NAMES).map(([id, info]) => ({
  id,
  name: info.name,
  bookCount: BOOKS.filter((b) => b.categoryId === id).length,
}));

// ============================================
// MAIN SCREEN COMPONENT
// ============================================

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      {/* ========== HEADER (solid background) ========== */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Islamic Library</Text>
        <View style={styles.headerActions}>
          {/* Search button */}
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
          >
            <Svg width={19} height={19} viewBox="0 0 20 20" fill="none">
              <Circle cx={9} cy={9} r={6.5} stroke="#102A43" strokeWidth={1.8} />
              <Path d="M14 14 L18 18" stroke="#102A43" strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </Pressable>

          {/* Downloads button — different from other screens */}
          {/* <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
          >
            <Svg width={19} height={19} viewBox="0 0 20 20" fill="none" stroke="#102A43" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M10 3.5V12M6.8 9.2 10 12.4l3.2-3.2" />
              <Path d="M4 13.5v2A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-2" />
            </Svg>
          </Pressable> */}
        </View>
      </View>

      {/* ========== SCROLLABLE CONTENT ========== */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 88 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
            <Circle cx={9} cy={9} r={6.5} stroke="#0F6B50" strokeWidth={1.8} opacity={0.55} />
            <Path d="M14 14 L18 18" stroke="#0F6B50" strokeWidth={1.8} strokeLinecap="round" opacity={0.55} />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books, authors or topics"
            placeholderTextColor="rgba(16, 42, 67, 0.4)"
          />
        </View>

        {/* Label */}
        <Text style={styles.label}>Browse by category</Text>

        {/* Category grid — 2 columns using flexWrap */}
        <View style={styles.grid}>
         {categories.map((category) => (
  <CategoryCard
    key={category.id}
    category={category}
    onPress={() =>
      router.push({
        pathname: '/library-category',
        params: { categoryId: category.id },
      })
    }
  />
))}
        </View>
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
    backgroundColor: '#F8F6F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // ========== HEADER ==========
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#F8F6F0',
    shadowColor: 'rgba(16, 42, 67, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  // HTML: h1 — font-family:Poppins, font-weight:600, font-size:26px,
  //       letter-spacing:-.01em, color:#102A43
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 26,
    letterSpacing: -0.01,
    color: '#102A43',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(16, 42, 67, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  iconButtonPressed: {
    backgroundColor: '#FBF9F3',
  },

  // ========== SEARCH BAR ==========
  // HTML: .search — height:52px, background:#fff, border:1px solid #E9E4D8,
  //       border-radius:14px, display:flex, align-items:center,
  //       gap:10px, padding:0 16px
  searchContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    shadowColor: 'rgba(16, 42, 67, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#102A43',
    padding: 0,
  },

  // ========== LABEL ==========
  // HTML: .lbl — margin:16px 2px 10px, font-size:10.5px, letter-spacing:.12em,
  //       text-transform:uppercase, color:#7A828C, font-weight:600
  label: {
    marginTop: 16,
    marginHorizontal: 2,
    marginBottom: 10,
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: '#7A828C',
    fontWeight: '600',
  },

  // ========== CATEGORY GRID ==========
  // HTML: .grid — display:grid, grid-template-columns:1fr 1fr, gap:12px
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});