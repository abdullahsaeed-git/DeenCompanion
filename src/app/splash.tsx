/**
 * Splash Screen
 *
 * The first screen the user sees after the native splash.
 * Contains the brand logo, app name, ornament, tagline,
 * a subtle background pattern, a soft glow, and a spinner.
 *
 * After animations complete (~2.5s), it auto-navigates to Home.
 *
 * Later, this will navigate to Onboarding instead of Home
 * for first-time users.
 */

import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import Svg, {
  Circle,
  Defs,
  G,
  Mask,
  Path,
  Pattern,
  Rect,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { colors, alpha } from '../constants/theme';

// ============================================
// ANIMATION HOOK
// ============================================

function useRiseAnimation(delayMs: number, durationMs: number = 600) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(value, {
      toValue: 1,
      duration: durationMs,
      delay: delayMs,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [value, delayMs, durationMs]);

  const translateY = value.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  return {
    opacity: value as any,
    transform: [{ translateY }] as any,
  };
}

// ============================================
// SVG COMPONENTS
// ============================================

function LogoSvg() {
  return (
    <Svg width={118} height={118} viewBox="0 0 120 120" fill="none">
      <Circle cx={60} cy={60} r={55} stroke={colors.primary} strokeOpacity={0.08} />
      <Circle cx={60} cy={60} r={45} fill={colors.primary} opacity={0.05} />

      <Defs>
        <Mask id="cres">
          <Rect width={120} height={120} fill="black" />
          <Circle cx={60} cy={30} r={14} fill="white" />
          <Circle cx={66} cy={27} r={12} fill="black" />
        </Mask>
      </Defs>
      <Circle cx={60} cy={30} r={14} fill={colors.accent} mask="url(#cres)" />

      <Path
        d="M81 21.5 L82.4 24.6 L85.5 26 L82.4 27.4 L81 30.5 L79.6 27.4 L76.5 26 L79.6 24.6 Z"
        fill={colors.accent}
      />

      <Path
        d="M60 63 C52 57.5 40 55.5 27 57.5 L27 87 C40 85 52 87 60 93 C68 87 80 85 93 87 L93 57.5 C80 55.5 68 57.5 60 63 Z"
        fill={colors.primary}
      />

      <Path
        d="M60 64 L60 92"
        stroke={colors.background}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.9}
      />

      <G
        stroke={colors.background}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.5}
        fill="none"
      >
        <Path d="M33.5 66.5 C41 65.5 49 67 54.5 70.5" />
        <Path d="M33.5 73.5 C41 72.5 49 74 54.5 77.5" />
      </G>

      <G
        stroke={colors.background}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.5}
        fill="none"
      >
        <Path d="M86.5 66.5 C79 65.5 71 67 65.5 70.5" />
        <Path d="M86.5 73.5 C79 72.5 71 74 65.5 77.5" />
      </G>
    </Svg>
  );
}

function BackgroundPattern() {
  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern
          id="geo"
          x="0"
          y="0"
          width={120}
          height={120}
          patternUnits="userSpaceOnUse"
        >
          <G fill="none" stroke={colors.primary} strokeWidth="1" opacity="0.04">
            <Rect x={30} y={30} width={60} height={60} />
            <Rect
              x={30}
              y={30}
              width={60}
              height={60}
              transform="rotate(45 60 60)"
            />
            <Circle cx={60} cy={60} r={5} />
          </G>
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#geo)" />
    </Svg>
  );
}

function GlowEffect() {
  return (
    <View style={styles.glowPosition}>
      <Svg width={440} height={440} viewBox="0 0 440 440">
        <Defs>
          <RadialGradient
            id="glowGradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.07} />
            <Stop offset="72%" stopColor={colors.primary} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={220} cy={220} r={220} fill="url(#glowGradient)" />
      </Svg>
    </View>
  );
}

function LoaderSpinner({
  spin,
  opacity,
}: {
  spin: Animated.AnimatedInterpolation<string | number>;
  opacity: Animated.Value;
}) {
  return (
    <Animated.View
      style={[
        styles.loaderPosition,
        {
          opacity: opacity as any,
          transform: [{ rotate: spin }],
        },
      ]}
    >
      <Svg width={30} height={30} viewBox="0 0 30 30">
        <Circle
          cx={15}
          cy={15}
          r={12.5}
          stroke={alpha(colors.primary, 0.14)}
          strokeWidth={2.5}
          fill="none"
        />
        <Circle
          cx={15}
          cy={15}
          r={12.5}
          stroke={colors.primary}
          strokeWidth={2.5}
          fill="none"
          strokeDasharray="20 59"
          strokeLinecap="round"
          transform="rotate(-90 15 15)"
        />
      </Svg>
    </Animated.View>
  );
}

// ============================================
// MAIN SCREEN COMPONENT
// ============================================

export default function SplashScreen() {
  const logoAnim = useRiseAnimation(0);
  const nameAnim = useRiseAnimation(120);
  const ornamentAnim = useRiseAnimation(220, 550);
  const taglineAnim = useRiseAnimation(300, 550);

  const spinValue = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    ).start();

    Animated.timing(loaderOpacity, {
      toValue: 1,
      duration: 500,
      delay: 500,
      useNativeDriver: true,
    }).start();
  }, [spinValue, loaderOpacity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <BackgroundPattern />
      <GlowEffect />

      <View style={styles.lockup}>
        <Animated.View style={logoAnim}>
          <LogoSvg />
        </Animated.View>

        <Animated.View style={[styles.nameContainer, nameAnim]}>
          <Text style={styles.appName}>Deen Companion</Text>
        </Animated.View>

        <Animated.View style={[styles.ornament, ornamentAnim]}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDiamond} />
          <View style={styles.ornamentLine} />
        </Animated.View>

        <Animated.View style={[styles.taglineContainer, taglineAnim]}>
          <Text style={styles.tagline}>Your Companion in Faith</Text>
        </Animated.View>
      </View>

      <LoaderSpinner spin={spin} opacity={loaderOpacity} />
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
    overflow: 'hidden',
  },
  glowPosition: {
    position: 'absolute',
    top: '44%',
    alignSelf: 'center',
    marginTop: -220,
  },
  lockup: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '46%',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  nameContainer: {
    marginTop: 26,
  },
  appName: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 28,
    letterSpacing: 0.01,
    color: colors.primary,
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  ornamentLine: {
    width: 26,
    height: 1,
    backgroundColor: alpha(colors.accent, 0.55),
  },
  ornamentDiamond: {
    width: 5,
    height: 5,
    backgroundColor: colors.accent,
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
  },
  taglineContainer: {
    marginTop: 12,
  },
  tagline: {
    fontFamily: 'Inter',
    fontWeight: '300',
    fontSize: 13.5,
    letterSpacing: 0.09,
    color: colors.textSecondary,
  },
  loaderPosition: {
    position: 'absolute',
    bottom: 78,
    alignSelf: 'center',
  },
});