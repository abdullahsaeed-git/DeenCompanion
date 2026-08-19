/**
 * HadithHeader
 *
 * Shared header used across all Hadith stack screens.
 * Back button (left) · Centered title block · Right element (optional)
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface HadithHeaderProps {
  title: string;
  arabicTitle?: string;
  subtitle?: string;
  titleSize?: number;
  rightElement?: React.ReactNode;
  onBack?: () => void;
}

export function HadithHeader({
  title,
  arabicTitle,
  subtitle,
  titleSize = 18,
  rightElement,
  onBack,
}: HadithHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.backBtn}
        onPress={onBack || (() => router.back())}
      >
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Path
            d="M12.5 4.5 7 10l5.5 5.5"
            stroke={colors.secondary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

      <View style={styles.titleBlock}>
        <Text style={[styles.title, { fontSize: titleSize }]} numberOfLines={1}>
          {title}
        </Text>
        {arabicTitle ? (
          <Text style={styles.arabicTitle} numberOfLines={1}>
            {arabicTitle}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightElement ? (
        <View style={styles.right}>{rightElement}</View>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtn: {
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
    color: colors.secondary,
    lineHeight: 22,
  },
  arabicTitle: {
    fontFamily: 'Amiri',
    fontSize: 16,
    color: colors.primary,
    marginTop: 3,
  },
  subtitle: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spacer: {
    width: 44,
  },
});