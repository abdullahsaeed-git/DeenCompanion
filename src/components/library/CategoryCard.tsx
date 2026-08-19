/**
 * Category Card
 *
 * A single card in the 2-column library grid showing:
 * - Category-specific icon in a green-tinted rounded square
 * - Category name (pushed to bottom via flex)
 * - Book count
 *
 * Contains all 9 category icons as inline SVGs.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { LibraryCategory } from '../../types/library';

// ============================================
// CATEGORY ICONS
// ============================================

/** Quran & Tafsir — open book */
function TafsirIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <Path d="M12 7C10 5.6 7.5 5.5 5 6.4V17c2.5-.9 5-.8 7 .6 2-1.4 4.5-1.5 7-.6V6.4C16.5 5.5 14 5.6 12 7Z" />
      <Path d="M12 7v10.6" />
    </Svg>
  );
}

/** Hadith — book with text lines */
function HadithIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <Rect x={6} y={3.5} width={12} height={17} rx={2} />
      <Path d="M9.5 8.5h5M9.5 12h5M9.5 15.5h3.5" />
    </Svg>
  );
}

/** Fiqh — scales of justice */
function FiqhIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <Path d="M12 4.5v14M8.5 19.5h7M5.5 7h13" />
      <Path d="M5.5 7 3.2 12a2.6 2.6 0 0 0 4.6 0Z" />
      <Path d="M18.5 7 16.2 12a2.6 2.6 0 0 0 4.6 0Z" />
    </Svg>
  );
}

/** Aqeedah — shield with star */
function AqeedahIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M12 3l7 2.6V11c0 4.6-3 7.9-7 9.4-4-1.5-7-4.8-7-9.4V5.6Z" />
      <Path d="M12 8.2l1 2.3 2.3 1-2.3 1-1 2.3-1-2.3-2.3-1 2.3-1Z" />
    </Svg>
  );
}

/** Seerah — crescent moon */
function SeerahIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M14.8 4.2a8.2 8.2 0 1 0 5 13.6A9.3 9.3 0 0 1 14.8 4.2Z" />
    </Svg>
  );
}

/** Islamic History — hourglass/pillars */
function HistoryIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <Path d="M7 3.5h10M7 20.5h10M8 3.5v3c0 2.6 4 4 4 5.5 0-1.5 4-2.9 4-5.5v-3M8 20.5v-3c0-2.6 4-4 4-5.5 0 1.5 4 2.9 4 5.5v3" />
    </Svg>
  );
}

/** Fatwa — document with folded corner */
function FatwaIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <Path d="M7 3.5h7l4 4v13H7Z" />
      <Path d="M14 3.5V8h4M10 12.5h5M10 16h5" />
    </Svg>
  );
}

/** Children's Books — diamond/kite with tail */
function KidsIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <Path d="M12 3.5 17 9l-5 5.5L7 9Z" />
      <Path d="M12 14.5c.3 2.8-2.2 3.6-2 6" />
    </Svg>
  );
}

/** Islamic Ethics — heart */
function EthicsIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M12 19s-7-4.6-7-9.5C5 6.6 7 5 9.2 5c1.3 0 2.3.6 2.8 1.6C12.5 5.6 13.5 5 14.8 5 17 5 19 6.6 19 9.5c0 4.9-7 9.5-7 9.5Z" />
    </Svg>
  );
}

/** Maps category ID to its icon component */
const iconMap: Record<string, () => React.ReactNode> = {
  'quran-tafsir': TafsirIcon,
  'hadith': HadithIcon,
  'fiqh': FiqhIcon,
  'aqeedah': AqeedahIcon,
  'seerah': SeerahIcon,
  'history': HistoryIcon,
  'fatwa': FatwaIcon,
  'kids': KidsIcon,
  'ethics': EthicsIcon,
};

// ============================================
// CATEGORY CARD COMPONENT
// ============================================

interface CategoryCardProps {
  category: LibraryCategory;
  onPress?: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const IconComponent = iconMap[category.id];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Icon container */}
      <View style={styles.iconContainer}>
        {IconComponent ? <IconComponent /> : null}
      </View>

      {/* Name — pushed to bottom with margin-top:auto */}
      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>

      {/* Book count */}
      <Text style={styles.count}>
        {category.bookCount} books
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // HTML: .cat — background:#fff, border:1px solid #E9E4D8, border-radius:16px,
  //       padding:14px, flex-direction:column, align-items:flex-start,
  //       gap:0, height:112px, box-shadow:0 2px 10px rgba(16,42,67,.04)
  card: {
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'column',
    alignItems: 'flex-start',
    height: 112,
    shadowColor: 'rgba(16, 42, 67, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },

  // HTML: .cicon — width:40px, height:40px, border-radius:12px,
  //       background:rgba(15,107,80,.08), display:flex,
  //       align-items:center, justify-content:center
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 107, 80, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // HTML: .cat strong — margin-top:auto, font-size:14px,
  //       font-weight:600, color:#102A43, line-height:1.3
  name: {
    marginTop: 'auto',
    fontSize: 14,
    fontWeight: '600',
    color: '#102A43',
    lineHeight: 14 * 1.3,
  },

  // HTML: .cat em — font-style:normal, font-size:11.5px,
  //       color:#52616F, margin-top:2px
  count: {
    marginTop: 2,
    fontSize: 11.5,
    color: '#52616F',
  },
});