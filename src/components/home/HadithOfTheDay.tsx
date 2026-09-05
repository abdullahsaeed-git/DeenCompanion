/**
 * Hadith of the Day Card
 *
 * Displays a daily Hadith with narrator, text, and reference.
 */

import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, fontSize } from '../../constants/theme';
import { ArrowRightIcon } from './QuickActions';
import { FONT_SIZE_CONFIG, getDefaultTranslationSize, settingsService } from '@/services/settingsService';
import { useCallback, useState } from 'react';

interface HadithOfTheDayProps {
  narrator: string;
  translation: string;
  reference: string;
  grade: string;
  collectionId: string;
  hadithNumber: number;
  onRefresh?: () => void;
  refreshing?: boolean;
}

/** Gold ornament: line — diamond — line */
function GoldOrnament() {
  return (
    <View style={styles.ornament}>
      <View style={styles.ornamentLine} />
      <View style={styles.ornamentDiamond} />
      <View style={styles.ornamentLine} />
    </View>
  );
}

function RefreshIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 4v6h-6" />
      <Path d="M1 20v-6h6" />
      <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </Svg>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  return (
    <View style={styles.gradeBadge}>
      <Text style={styles.gradeText}>{grade}</Text>
    </View>
  );
}

export function HadithOfTheDay({
  narrator,
  translation,
  reference,
  grade,
  collectionId,
  hadithNumber,
  onRefresh,
  refreshing,
}: HadithOfTheDayProps) {


   const [arFont, setArFont] = useState<number>(FONT_SIZE_CONFIG.arabic.default);
    const [trFont, setTrFont] = useState<number>(getDefaultTranslationSize);

     useFocusEffect(
       useCallback(() => {
         settingsService.getArabicFontSize().then(setArFont);
         settingsService.getTranslationFontSize().then(setTrFont);
       }, []),
     );
     

  function handleReadMore() {
    router.push({
      pathname: '/hadith-reader',
      params: { collectionId, hadithNumber: String(hadithNumber) },
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Hadith of the Day</Text>
        <View style={styles.headerRight}>
          <GoldOrnament />
          {onRefresh && (
            <Pressable
              style={({ pressed }) => [styles.refreshBtn, pressed && styles.refreshBtnPressed]}
              onPress={onRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <RefreshIcon />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {narrator ? (
        <Text style={styles.narrator}>Narrated by {narrator}</Text>
      ) : null}

      <Text style={[styles.translation , {fontSize : trFont , lineHeight: arFont * 1.3, textAlign: "justify"}]} numberOfLines={4} ellipsizeMode="tail">
        "{translation}"
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.reference}>{reference}</Text>
        <GradeBadge grade={grade} />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.moreButton,
          pressed && styles.moreButtonPressed,
        ]}
        onPress={handleReadMore}
      >
        <Text style={styles.moreButtonText}>Read Full Hadith</Text>
        <ArrowRightIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 20,
    padding: 16,
    paddingHorizontal: 18,
    paddingBottom: 10,
    shadowColor: 'rgba(16, 42, 67, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: '#7A828C',
    fontWeight: '600',
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ornamentLine: {
    width: 22,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.55)',
  },
  ornamentDiamond: {
    width: 5,
    height: 5,
    backgroundColor: '#D4AF37',
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 6,
    borderRadius: 1,
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnPressed: {
    backgroundColor: 'rgba(15, 107, 80, 0.08)',
  },
  narrator: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F6B50',
  },
  translation: {
    marginTop: 8,
    fontSize: 13.5,
    lineHeight: 13.5 * 1.65,
    color: '#52616F',
  },
  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  reference: {
    fontSize: 11.5,
    color: '#7A828C',
    flex: 1,
  },
  gradeBadge: {
    backgroundColor: 'rgba(15, 107, 80, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 107, 80, 0.15)',
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0F6B50',
  },
  moreButton: {
    marginTop: 8,
    alignSelf: 'center',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  moreButtonPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: 'rgba(15, 107, 80, 0.08)',
  },
  moreButtonText: {
    color: '#0F6B50',
    fontWeight: '600',
    fontSize: 13.5,
  },
});