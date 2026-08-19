/**
 * Collection Card
 *
 * A single card in the 2-column grid showing:
 * - Icon in a green-tinted circle
 * - Collection name (bold)
 * - Hadith count
 * - Language badge
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { HadithCollection } from '../../types/hadith';

interface CollectionCardProps {
  collection: HadithCollection;
  onPress?: () => void;
}

export function CollectionCard({ collection, onPress }: CollectionCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Top row: icon */}
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <Svg width={18} height={18} viewBox="0 0 20 20" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round">
            <Path d="M6 2.8h8.5A2.5 2.5 0 0 1 17 5.3v11.4a2.5 2.5 0 0 1-2.5 2.5H6a2 2 0 0 1-2-2V4.8a2 2 0 0 1 2-2Z" />
            <Path d="M7.5 7.5h5M7.5 10.5h5M7.5 13.5h3" strokeLinecap="round" />
          </Svg>
        </View>
      </View>

      {/* Collection name */}
      <Text style={styles.name} numberOfLines={2}>
        {collection.name}
      </Text>

      {/* Hadith count */}
      <Text style={styles.count}>
        {collection.hadithCount.toLocaleString()} Hadith
      </Text>

      {/* Language badge */}
      <View style={styles.langContainer}>
        <Text style={styles.langText}>
          {collection.languages.join(' · ')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // HTML: .cc — background:#fff, border:1px solid #E9E4D8, border-radius:16px,
  //       padding:14px, flex-direction:column, align-items:flex-start,
  //       box-shadow:0 2px 10px rgba(16,42,67,.04)
  card: {
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 16,
    padding: 14,
    shadowColor: 'rgba(16, 42, 67, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },

  // HTML: .crow — width:100%, display:flex, justify-content:space-between,
  //       align-items:center, margin-bottom:10px
  topRow: {
    width: '100%',
    marginBottom: 10,
  },

  // HTML: .cicon — width:36px, height:36px, border-radius:10px,
  //       background:rgba(15,107,80,.08), display:flex,
  //       align-items:center, justify-content:center
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 107, 80, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // HTML: .cc strong — font-size:14px, font-weight:600, color:#102A43, line-height:1.3
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#102A43',
    lineHeight: 14 * 1.3,
  },

  // HTML: .cc em — font-style:normal, font-size:11.5px, color:#52616F, margin-top:2px
  count: {
    marginTop: 2,
    fontSize: 11.5,
    color: '#52616F',
  },

  // HTML: .langs — margin-top:8px, font-size:10px, font-weight:600,
  //       letter-spacing:.06em, color:#7A828C,
  //       background:rgba(16,42,67,.05), padding:3px 8px, border-radius:6px
  langContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(16, 42, 67, 0.05)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  langText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.06,
    color: '#7A828C',
  },
});