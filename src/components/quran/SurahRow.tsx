/**
 * Surah Row
 *
 * A single row in the Surah list.
 * No divider logic here — dividers are handled by FlatList's
 * ItemSeparatorComponent to avoid layout side effects.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GeometricNumber } from './GeometricNumber';
import { Surah } from '../../types/quran';

interface SurahRowProps {
  surah: Surah;
  onPress?: () => void;
}

export function SurahRow({ surah, onPress }: SurahRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
      onPress={onPress}
    >
      <GeometricNumber number={surah.number} />

      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>
          {surah.englishName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {surah.ayahCount} Ayahs · {surah.revelationType}
          {surah.recentlyRead && (
            <Text style={styles.recentlyRead}> · Recently read</Text>
          )}
        </Text>
      </View>

      <Text style={styles.arabic} numberOfLines={1}>
        {surah.arabicName}
      </Text>

      <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
        <Path
          d="M7.5 4.5 13 10l-5.5 5.5"
          stroke="rgba(16, 42, 67, 0.35)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  rowPressed: {
    backgroundColor: 'rgba(15, 107, 80, 0.03)',
  },
  mid: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  name: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#102A43',
  },
  meta: {
    fontSize: 12.5,
    color: '#52616F',
  },
  recentlyRead: {
    color: '#0F6B50',
    fontWeight: '600',
  },
  arabic: {
    flexShrink: 0,
    fontFamily: 'Amiri',
    fontSize: 19,
    color: '#102A43',
  },
});