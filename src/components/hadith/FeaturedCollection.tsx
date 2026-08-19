/**
 * Featured Collection Card
 *
 * A prominent green card highlighting one Hadith collection.
 * Contains:
 * - Faint mosque silhouette art (bottom-right, clipped)
 * - "Featured Collection" label
 * - Collection name and hadith count
 * - Short description
 * - "Browse Collection" CTA button
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { HadithCollection } from '../../types/hadith';

interface FeaturedCollectionProps {
  collection: HadithCollection;
  onPress?: () => void;
}

export function FeaturedCollection({ collection, onPress }: FeaturedCollectionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Faint mosque silhouette art */}
      <View style={styles.artPosition}>
        <Svg
          width={180}
          height={140}
          viewBox="0 0 190 150"
          fill="none"
          stroke="#fff"
          strokeWidth={1.5}
        >
          <Path d="M45 150 v-42 c0-26 22-38 50-54 28 16 50 28 50 54 v42" />
          <Path d="M95 54 v-14" />
          <Circle cx={95} cy={37} r={3} />
          <Path d="M20 150 v-52" />
          <Path d="M14 98 l6-10 6 10" />
          <Path d="M170 150 v-52" />
          <Path d="M164 98 l6-10 6 10" />
          <Path d="M10 150 h170" />
        </Svg>
      </View>

      {/* Label */}
      <Text style={styles.label}>Featured Collection</Text>

      {/* Collection name */}
      <Text style={styles.name}>{collection.name}</Text>

      {/* Hadith count */}
      <Text style={styles.meta}>
        {collection.hadithCount.toLocaleString()} Hadith
      </Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {collection.shortDescription}
      </Text>

      {/* CTA button */}
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Browse Collection</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // HTML: .feat — background:#0F6B50, border-radius:20px, padding:18px,
  //       color:#fff, box-shadow:0 14px 30px rgba(15,107,80,.25)
  card: {
    backgroundColor: '#0F6B50',
    borderRadius: 20,
    padding: 18,
    color: '#FFFFFF',
    shadowColor: 'rgba(15, 107, 80, 0.25)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 14,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },

  // HTML: .art — position:absolute, right:-12px, bottom:-8px, opacity:.12
  artPosition: {
    position: 'absolute',
    right: -12,
    bottom: -8,
    opacity: 0.12,
  },

  // HTML: .fcap — font-size:10.5px, letter-spacing:.14em,
  //       text-transform:uppercase, color:rgba(255,255,255,.6), font-weight:600
  label: {
    fontSize: 10.5,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },

  // HTML: .feat h2 — margin-top:8px, font-family:Poppins, font-weight:600, font-size:22px
  name: {
    marginTop: 8,
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 22,
    color: '#FFFFFF',
  },

  // HTML: .fmeta — margin-top:4px, font-size:12.5px, color:rgba(255,255,255,.8)
  meta: {
    marginTop: 4,
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // HTML: .fdesc — margin-top:6px, font-size:12.5px, line-height:1.55,
  //       color:rgba(255,255,255,.68), max-width:238px
  description: {
    marginTop: 6,
    fontSize: 12.5,
    lineHeight: 12.5 * 1.55,
    color: 'rgba(255, 255, 255, 0.68)',
    maxWidth: 238,
  },

  // HTML: .fbtn — margin-top:14px, height:44px, padding:0 20px, border:0,
  //       border-radius:12px, background:#fff, color:#0F6B50,
  //       font-family:Poppins, font-weight:600, font-size:13.5px,
  //       box-shadow:0 6px 16px rgba(0,0,0,.18)
  buttonContainer: {
    marginTop: 14,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    shadowColor: 'rgba(0, 0, 0, 0.18)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  buttonText: {
    color: '#0F6B50',
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 13.5,
  },
});