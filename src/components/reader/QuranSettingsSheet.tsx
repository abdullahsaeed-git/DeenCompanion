/**
 * QuranSettingsSheet
 *
 * Bottom sheet displaying Quran module settings.
 * Ayah mode: full settings (font sizes, toggles, mode).
 * Mushaf mode: Arabic font size only.
 *
 * Kept compact so reader text remains visible behind the sheet.
 * Reader Mode is sticky at the bottom, outside the scrollable area.
 *
 * Uses a custom StepSlider (PanResponder-based) for font size selection.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, alpha } from '../../constants/theme';
import { ReaderMode } from '../../types/quran';

// ============================================
// STEP SLIDER
// ============================================

const THUMB_RADIUS = 12;
const TRACK_HEIGHT = 4;

const StepSlider = React.memo(function StepSlider({
  steps,
  value,
  onChange,
}: {
  steps: number[];
  value: number;
  onChange: (v: number) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackLayoutRef = useRef({ x: 0, width: 0 });
  const trackRef = useRef<View>(null);

  const currentIndex = Math.max(0, steps.indexOf(value));
  const fraction = steps.length > 1 ? currentIndex / (steps.length - 1) : 0;
  const thumbLeft = fraction * trackWidth;

  const valueFromX = useCallback(
    (touchX: number) => {
      const { x, width } = trackLayoutRef.current;
      const relativeX = touchX - x;
      const clampedX = Math.max(0, Math.min(relativeX, width));
      const ratio = width > 0 ? clampedX / width : 0;
      const stepIndex = Math.round(ratio * (steps.length - 1));
      const clampedStep = Math.max(0, Math.min(stepIndex, steps.length - 1));
      return steps[clampedStep];
    },
    [steps],
  );

  // Keep latest functions in refs so PanResponder never goes stale
  const valueFromXRef = useRef(valueFromX);
  valueFromXRef.current = valueFromX;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gs) => {
        setDragging(true);
        if (trackRef.current) {
          trackRef.current.measure(
            (
              _left: number,
              _top: number,
              _width: number,
              _height: number,
              pageX: number,
            ) => {
              trackLayoutRef.current = {
                x: pageX,
                width: trackLayoutRef.current.width || trackWidth,
              };
              onChangeRef.current(valueFromXRef.current(gs.x0));
            },
          );
        }
      },
      onPanResponderMove: (_, gs) => {
        onChangeRef.current(valueFromXRef.current(gs.moveX));
      },
      onPanResponderRelease: () => setDragging(false),
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => setDragging(false),
    }),
  ).current;

  return (
    <View style={sliderStyles.container}>
      {/* Labels row: min — current — max */}
      <View style={sliderStyles.labelRow}>
        <Text style={sliderStyles.labelSmall}>{steps[0]}</Text>
        <View style={sliderStyles.currentBadge}>
          <Text style={sliderStyles.labelCurrent}>{value}</Text>
        </View>
        <Text style={sliderStyles.labelSmall}>
          {steps[steps.length - 1]}
        </Text>
      </View>

      {/* Track area — entire area is tappable/draggable */}
      <View
        ref={trackRef}
        style={sliderStyles.trackArea}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          setTrackWidth(w);
          trackLayoutRef.current.width = w;
        }}
        {...panResponder.panHandlers}
      >
        {/* Background line */}
        <View style={sliderStyles.trackBg} />
        {/* Filled line */}
        <View
          style={[
            sliderStyles.trackFilled,
            { width: Math.max(THUMB_RADIUS, thumbLeft) },
          ]}
        />
        {/* Step dots */}
        {steps.map((_, i) => {
          const dotFraction =
            steps.length > 1 ? i / (steps.length - 1) : 0;
          return (
            <View
              key={i}
              style={[
                sliderStyles.stepDot,
                { left: dotFraction * trackWidth - 1.5 },
                i <= currentIndex && sliderStyles.stepDotActive,
              ]}
            />
          );
        })}
        {/* Thumb — visual only, interaction is on the track */}
        <View
          style={[
            sliderStyles.thumb,
            { left: thumbLeft - THUMB_RADIUS },
            dragging && sliderStyles.thumbActive,
          ]}
        />
      </View>
    </View>
  );
});

const sliderStyles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  labelSmall: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 11,
    color: colors.textMuted,
    minWidth: 20,
  },
  currentBadge: {
    backgroundColor: alpha(colors.primary, 0.1),
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
    minWidth: 40,
    alignItems: 'center',
  },
  labelCurrent: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 14,
    color: colors.primary,
  },
  trackArea: {
    height: 44,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 20,
    height: TRACK_HEIGHT,
    borderRadius: 2,
    backgroundColor: colors.divider,
  },
  trackFilled: {
    position: 'absolute',
    left: 0,
    top: 20,
    height: TRACK_HEIGHT,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  stepDot: {
    position: 'absolute',
    top: 20,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.divider,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  thumb: {
    position: 'absolute',
    top: 20 - THUMB_RADIUS,
    width: THUMB_RADIUS * 2,
    height: THUMB_RADIUS * 2,
    borderRadius: THUMB_RADIUS,
    backgroundColor: colors.surface,
    borderWidth: 2.5,
    borderColor: colors.primary,
    shadowColor: alpha(colors.secondary, 0.12),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  thumbActive: {
    transform: [{ scale: 1.15 }],
    shadowColor: alpha(colors.primary, 0.3),
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 3,
  },
});

// ============================================
// SHEET PROPS
// ============================================

interface QuranSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  readerMode: ReaderMode;
  arabicFontSizeAyah: number;
  setArabicFontSizeAyah: (size: number) => void;
  translationFontSize: number;
  setTranslationFontSize: (size: number) => void;
  showTranslation: boolean;
  setShowTranslation: (v: boolean) => void;
  showTafsir: boolean;
  setShowTafsir: (v: boolean) => void;
  showToolbar: boolean;
  setShowToolbar: (v: boolean) => void;
  arabicFontSizeMushaf: number;
  setArabicFontSizeMushaf: (size: number) => void;
  setReaderMode: (mode: ReaderMode) => void;
  isPageMode: boolean;
}

const ARABIC_SIZES = [18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38 , 40];
const TRANSLATION_SIZES = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

const SLIDE_DISTANCE = 500;

// ============================================
// SHEET COMPONENT
// ============================================

export function QuranSettingsSheet({
  visible,
  onClose,
  readerMode,
  arabicFontSizeAyah,
  setArabicFontSizeAyah,
  translationFontSize,
  setTranslationFontSize,
  showTranslation,
  setShowTranslation,
  showTafsir,
  setShowTafsir,
  showToolbar,
  setShowToolbar,
  arabicFontSizeMushaf,
  setArabicFontSizeMushaf,
  setReaderMode,
  isPageMode,
}: QuranSettingsSheetProps) {
  const slideAnim = useRef(new Animated.Value(SLIDE_DISTANCE)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

  const isMushafLike = readerMode === 'mushaf' || isPageMode;

  const animateOpen = useCallback(() => {
    closingRef.current = false;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, backdropAnim]);

  const animateClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SLIDE_DISTANCE,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [slideAnim, backdropAnim, onClose]);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SLIDE_DISTANCE);
      backdropAnim.setValue(0);
      animateOpen();
    }
  }, [visible, slideAnim, backdropAnim, animateOpen]);

  const currentArabicSize = isMushafLike
    ? arabicFontSizeMushaf
    : arabicFontSizeAyah;
  const setArabicSize = isMushafLike
    ? setArabicFontSizeMushaf
    : setArabicFontSizeAyah;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={animateClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Pressable style={styles.backdropPressable} onPress={animateClose}>
          <Animated.View
            style={[
              styles.backdropVisual,
              {
                opacity: backdropAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.35],
                }),
              },
            ]}
            pointerEvents="none"
          />
        </Pressable>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Sticky close button */}
          <Pressable style={styles.closeBtn} onPress={animateClose}>
            <Svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              stroke={colors.textSecondary}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d="M5 5l10 10M15 5L5 15" />
            </Svg>
          </Pressable>

          {/* Scrollable content area */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Settings</Text>

            {/* ── Font Sizes ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Font Size</Text>

              {/* Arabic slider */}
              <Text style={styles.settingLabel}>Arabic</Text>
              <StepSlider
                steps={ARABIC_SIZES}
                value={currentArabicSize}
                onChange={setArabicSize}
              />

              {/* Translation slider — ayah mode only */}
              {!isMushafLike && (
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.settingLabel}>Translation</Text>
                  <StepSlider
                    steps={TRANSLATION_SIZES}
                    value={translationFontSize}
                    onChange={setTranslationFontSize}
                  />
                </View>
              )}
            </View>

            {/* ── Display — ayah mode only ── */}
            {!isMushafLike && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Display</Text>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Show Translation</Text>
                  <Switch
                    value={showTranslation}
                    onValueChange={setShowTranslation}
                    trackColor={{
                      false: colors.divider,
                      true: colors.primary,
                    }}
                    thumbColor={
                      showTranslation ? colors.surface : colors.textMuted
                    }
                    ios_backgroundColor={colors.divider}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Show Tafsir</Text>
                  <Switch
                    value={showTafsir}
                    onValueChange={setShowTafsir}
                    trackColor={{
                      false: colors.divider,
                      true: colors.primary,
                    }}
                    thumbColor={
                      showTafsir ? colors.surface : colors.textMuted
                    }
                    ios_backgroundColor={colors.divider}
                  />
                </View>

                <View style={[styles.toggleRow, styles.toggleRowLast]}>
                  <Text style={styles.toggleLabel}>Show Toolbar</Text>
                  <Switch
                    value={showToolbar}
                    onValueChange={setShowToolbar}
                    trackColor={{
                      false: colors.divider,
                      true: colors.primary,
                    }}
                    thumbColor={
                      showToolbar ? colors.surface : colors.textMuted
                    }
                    ios_backgroundColor={colors.divider}
                  />
                </View>
              </View>
            )}

            <View style={styles.scrollBottomSpacer} />
          </ScrollView>

          {/* ── Sticky bottom: Reader Mode ── */}
          {!isPageMode && (
            <View style={styles.stickyFooter}>
              <View style={styles.footerDivider} />
              <Text style={styles.footerLabel}>Reader Mode</Text>
              <View style={styles.segmentContainer}>
                <Pressable
                  style={[
                    styles.segmentButton,
                    readerMode === 'ayah' && styles.segmentButtonActive,
                  ]}
                  onPress={() => setReaderMode('ayah')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      readerMode === 'ayah' && styles.segmentTextActive,
                    ]}
                  >
                    Ayah
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.segmentButton,
                    readerMode === 'mushaf' && styles.segmentButtonActive,
                  ]}
                  onPress={() => setReaderMode('mushaf')}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      readerMode === 'mushaf' && styles.segmentTextActive,
                    ]}
                  >
                    Mushaf
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================
// SHEET STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    // ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  backdropVisual: {
    // ...StyleSheet.absoluteFillObject,
    // flex: 1,
    backgroundColor: colors.secondary,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: alpha(colors.secondary, 0.12),
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 16,
    maxHeight: '46%',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(colors.secondary, 0.06),
    zIndex: 10,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 2,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 14,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginBottom: 8,
  },
  settingLabel: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 13,
    color: colors.secondary,
    marginBottom: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  toggleRowLast: {
    borderBottomWidth: 0,
  },
  toggleLabel: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 13,
    color: colors.secondary,
  },
  scrollBottomSpacer: {
    height: 4,
  },
  stickyFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: 10,
  },
  footerLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginBottom: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: alpha(colors.secondary, 0.04),
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: alpha(colors.secondary, 0.08),
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 12,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
  },
});