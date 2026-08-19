/**
 * HadithNumberBadge
 *
 * Small green badge showing hadith number (e.g., #1, #2).
 */

import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

interface HadithNumberBadgeProps {
  number: number;
  prefix?: string;
  size?: 'sm' | 'md';
}

export function HadithNumberBadge({
  number,
  prefix = '#',
  size = 'md',
}: HadithNumberBadgeProps) {
  const isSmall = size === 'sm';
  return (
    <View style={[styles.container, isSmall && styles.containerSmall]}>
      <Text style={[styles.text, isSmall && styles.textSmall]}>
        {prefix}
        {number}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 107, 80, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  containerSmall: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  textSmall: {
    fontSize: 11,
  },
});