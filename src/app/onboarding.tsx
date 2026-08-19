/**
 * Onboarding Screen
 *
 * A 3-slide introduction to Deen Companion.
 * Each slide has: illustration, headline, subtitle, dots, CTA button.
 *
 * Navigation:
 * - "Next" advances to next slide
 * - "Skip" goes directly to Home
 * - "Get Started" (final slide) goes to Home
 *
 * Later: this screen will only show for first-time users.
 * The splash screen will check AsyncStorage and skip this if needed.
 */

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, fontSize, borderRadius, alpha } from '../constants/theme';
import { QuranIllustration } from '../components/illustrations/QuranIllustration';
import { HadithIllustration } from '../components/illustrations/HadithIllustration';
import { PrayerIllustration } from '../components/illustrations/PrayerIllustration';

// ============================================
// SLIDE DATA
// ============================================

interface SlideData {
  illustration: React.ReactNode;
  headlineBefore: string;
  headlineAccent: string;
  subtitle: string;
  activeDotIndex: number;
  ctaType: 'next' | 'get-started';
}

const slides: SlideData[] = [
  {
    illustration: <QuranIllustration />,
    headlineBefore: 'Read. Listen.',
    headlineAccent: 'Reflect.',
    subtitle:
      'Read the Quran with translations, tafsir, bookmarks and beautiful recitations — wherever you are.',
    activeDotIndex: 0,
    ctaType: 'next',
  },
  {
    illustration: <HadithIllustration />,
    headlineBefore: 'Discover',
    headlineAccent: 'Authentic Hadith',
    subtitle:
      'Explore trusted Hadith collections, search by topic, read translations and save important narrations.',
    activeDotIndex: 1,
    ctaType: 'next',
  },
  {
    illustration: <PrayerIllustration />,
    headlineBefore: 'Never Miss',
    headlineAccent: 'a Prayer',
    subtitle:
      'Get accurate prayer times, Qibla direction and timely Adhan notifications based on your location.',
    activeDotIndex: 2,
    ctaType: 'get-started',
  },
];

// ============================================
// ARROW ICON
// ============================================

function NextArrow() {
  return (
    <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <Path
        d="M3 10h13M11 4.5 16.5 10 11 15.5"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ============================================
// MAIN SCREEN COMPONENT
// ============================================

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slide = slides[currentIndex];

  function handleNext() {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handleSkip() {
    router.replace('/(tabs)');
  }

  function handleGetStarted() {
    router.replace('/(tabs)');
  }

  function handleCtaPress() {
    if (slide.ctaType === 'next') {
      handleNext();
    } else {
      handleGetStarted();
    }
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={handleSkip} style={styles.skip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <View style={styles.hero}>{slide.illustration}</View>

      <View style={styles.copy}>
        <Text style={styles.headline}>
          {slide.headlineBefore}
          {'\n'}
          <Text style={styles.headlineAccent}>{slide.headlineAccent}</Text>
        </Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === slide.activeDotIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleCtaPress}
          style={({ pressed }) => [
            styles.cta,
            slide.ctaType === 'get-started' && styles.ctaFinal,
            pressed && styles.ctaPressed,
          ]}
        >
          <Text
            style={[
              styles.ctaText,
              slide.ctaType === 'get-started' && styles.ctaTextFinal,
            ]}
          >
            {slide.ctaType === 'next' ? 'Next' : 'Get Started'}
          </Text>
          {slide.ctaType === 'next' && <NextArrow />}
        </Pressable>
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skip: {
    position: 'absolute',
    top: 60,
    right: 14,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.02,
    color: alpha(colors.secondary, 0.6),
  },
  hero: {
    marginTop: 100,
    alignItems: 'center',
  },
  copy: {
    marginTop: 10,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  headline: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 32,
    lineHeight: 32 * 1.22,
    letterSpacing: -0.01,
    color: colors.secondary,
    textAlign: 'center',
  },
  headlineAccent: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: 15.5,
    lineHeight: 15.5 * 1.65,
    color: colors.textSecondary,
    marginTop: 14,
    maxWidth: 310,
    textAlign: 'center',
  },
  bottom: {
    marginTop: 'auto',
    paddingHorizontal: 24,
    paddingBottom: 34,
    alignItems: 'center',
    gap: 22,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: alpha(colors.secondary, 0.18),
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  cta: {
    width: '100%',
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: alpha(colors.primary, 0.28),
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
  },
  ctaFinal: {
    height: 60,
    borderRadius: 18,
    shadowColor: alpha(colors.primary, 0.34),
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 32,
    elevation: 14,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  ctaTextFinal: {
    fontWeight: '600',
    fontSize: 17,
  },
});