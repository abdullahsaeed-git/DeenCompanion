/**
 * GradeBadge
 *
 * Displays hadith authenticity grade with a shield + check icon.
 * Used in hadith list cards and reader.
 */

import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface GradeBadgeProps {
  grade: string;
  size?: 'sm' | 'md';
}

export function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  const isSmall = size === 'sm';
  return (
    <View style={[styles.container, isSmall && styles.containerSmall]}>
      <Svg
        width={isSmall ? 11 : 12}
        height={isSmall ? 11 : 12}
        viewBox="0 0 24 24"
        fill="none"
      >
        <Path
          d="M12 2.5 L19.5 5.3 V10 c0 4.8 -3.2 8.2 -7.5 9.8 C7.7 18.2 4.5 14.8 4.5 10 V5.3 Z"
          stroke={colors.primary}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path
          d="M8.8 10.4 l2.3 2.3 l4.2 -4.2"
          stroke={colors.primary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text style={[styles.text, isSmall && styles.textSmall]}>{grade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 107, 80, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 8,
  },
  containerSmall: {
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  text: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.primary,
  },
  textSmall: {
    fontSize: 10.5,
  },
});