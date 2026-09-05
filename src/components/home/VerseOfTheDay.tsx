/**
 * Verse of the Day Card
 *
 * Displays a daily Quran verse with real data.
 */

import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../constants/theme';
import { ArrowRightIcon } from './QuickActions';
import { FONT_SIZE_CONFIG, getDefaultTranslationSize, settingsService } from '@/services/settingsService';
import { useCallback, useState } from 'react';
import { getLanguage } from '@/services/languageService';

interface VerseOfTheDayProps {
  arabic: string;
  translation: string;
  reference: string;
  surahNumber: number;
  ayahNumber: number;
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

export function VerseOfTheDay({
  arabic,
  translation,
  reference,
  surahNumber,
  ayahNumber,
  onRefresh,
  refreshing,
}: VerseOfTheDayProps) {

   const [arFont, setArFont] = useState<number>(FONT_SIZE_CONFIG.arabic.default);
  const [trFont, setTrFont] = useState<number>(getDefaultTranslationSize);
  

  function handleReadMore() {
    router.push({
      // pathname: '/(tabs)/quran',
      pathname: '/quran-reader',
      params: { surahNumber: String(surahNumber), mode: 'ayah', scrollToAyah: String(ayahNumber) },
    });
  }

  const cleanedText = (text: string) => {
  if (typeof text !== 'string') return '';
  return text.replace(/\n+$/, '');
};


  useFocusEffect(
  useCallback(() => {
    settingsService.getArabicFontSize().then(setArFont);
    settingsService.getTranslationFontSize().then(setTrFont);
  
  }, []),
);


  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>Verse of the Day</Text>
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
      <Text style={[styles.arabic, { fontSize: arFont, lineHeight: arFont * 2 }]} numberOfLines={4} ellipsizeMode="tail">
        
        {cleanedText(arabic)}
        
        </Text>
      <Text style={[styles.translation, {fontSize: trFont, lineHeight: arFont * 1.3, textAlign: "center"}]}>"{translation}"</Text>
      <Text style={styles.reference}>{reference}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.moreButton,
          pressed && styles.moreButtonPressed,
        ]}
        onPress={handleReadMore}
      >
        <Text style={styles.moreButtonText}>Read More</Text>
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
  arabic: {
    marginTop: 12,
    fontFamily: 'Amiri',
    fontSize: 21,
    lineHeight: 21 * 2,
    textAlign: 'center',
    color: '#102A43',
  },
  translation: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 13 * 1.6,
    color: '#52616F',
    textAlign: 'center',
  },
  reference: {
    marginTop: 6,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F6B50',
    textAlign: 'center',
  },
  moreButton: {
    marginTop: 6,
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