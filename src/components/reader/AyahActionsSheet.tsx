/**
 * AyahActionsSheet
 *
 * Bottom sheet with actions for a selected ayah.
 * Actions: Bookmark/Remove Verse, Copy Verse, Mark as Last Read.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors, alpha } from '../../constants/theme';
import { Ayah } from '../../types/quran';

interface AyahActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  ayah: Ayah | null;
  surahName: string;
  isBookmarked: boolean;
  onBookmark: () => void;
  onCopy: () => void;
  onMarkLastRead: () => void;
}

const SLIDE_DISTANCE = 500;

export function AyahActionsSheet({
  visible,
  onClose,
  ayah,
  surahName,
  isBookmarked,
  onBookmark,
  onCopy,
  onMarkLastRead,
}: AyahActionsSheetProps) {
  const slideAnim = useRef(new Animated.Value(SLIDE_DISTANCE)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const animateOpen = useCallback(() => {
    closingRef.current = false;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 280,
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
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [slideAnim, backdropAnim, onClose]);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SLIDE_DISTANCE);
      backdropAnim.setValue(0);
      setShowFeedback(false);
      animateOpen();
    }
  }, [visible, slideAnim, backdropAnim, animateOpen]);

  const handleAction = (action: () => void, feedback: string) => {
    action();
    setFeedbackText(feedback);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      animateClose();
    }, 800);
  };

  const ayahRef = ayah ? `${surahName} ${ayah.numberInSurah}` : '';

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
          {/* Close button */}
          <Pressable style={styles.closeBtn} onPress={animateClose}>
            <Svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={colors.textSecondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M5 5l10 10M15 5L5 15" />
            </Svg>
          </Pressable>

          {/* Content */}
          <View style={styles.sheetContent}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Ayah reference header */}
            <View style={styles.header}>
              <Text style={styles.headerRef}>{ayahRef}</Text>
              {ayah?.text ? (
                <Text style={styles.headerPreview} numberOfLines={1}>
                  {ayah.text.replace(/\n$/, '')}
                </Text>
              ) : null}
            </View>

            <View style={styles.divider} />

            {/* Actions */}
            <View style={styles.actions}>
              {/* Bookmark / Remove Bookmark */}
              <Pressable
                style={styles.actionRow}
                onPress={() =>
                  handleAction(
                    onBookmark,
                    isBookmarked ? 'Bookmark removed' : 'Bookmark added',
                  )
                }
              >
                <View style={[
                  styles.actionIcon,
                  isBookmarked && styles.actionIconWarning,
                ]}>
                  {isBookmarked ? (
                    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <Path
                        d="M5 3h10v14l-5-3L5 17Z"
                        stroke={colors.error}
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M8 8.5l4 4M12 8.5l-4 4"
                        stroke={colors.error}
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  ) : (
                    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <Path
                        d="M5 3h10v14l-5-3L5 17Z"
                        stroke={colors.primary}
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </View>
                <View style={styles.actionMid}>
                  <Text style={[
                    styles.actionTitle,
                    isBookmarked && styles.actionTitleWarning,
                  ]}>
                    {isBookmarked ? 'Remove Bookmark' : 'Bookmark Verse'}
                  </Text>
                  <Text style={styles.actionSub}>
                    {isBookmarked ? 'Remove from your bookmarks' : 'Save to your bookmarks'}
                  </Text>
                </View>
                <Svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <Path
                    d="M7.5 4.5 13 10l-5.5 5.5"
                    stroke={alpha(colors.secondary, 0.3)}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>

              {/* Copy Verse */}
              <Pressable
                style={styles.actionRow}
                onPress={() =>
                  handleAction(onCopy, 'Copied to clipboard')
                }
              >
                <View style={styles.actionIcon}>
                  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <Rect
                      x="5.5"
                      y="5.5"
                      width="11"
                      height="11"
                      rx="2"
                      stroke={colors.primary}
                      strokeWidth="1.7"
                    />
                    <Path
                      d="M4 15V4.5A1.5 1.5 0 0 1 5.5 3H14"
                      stroke={colors.primary}
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>
                <View style={styles.actionMid}>
                  <Text style={styles.actionTitle}>Copy Verse</Text>
                  <Text style={styles.actionSub}>Arabic text & translation</Text>
                </View>
                <Svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <Path
                    d="M7.5 4.5 13 10l-5.5 5.5"
                    stroke={alpha(colors.secondary, 0.3)}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>

              {/* Mark as Last Read */}
              <Pressable
                style={[styles.actionRow, styles.actionRowLast]}
                onPress={() =>
                  handleAction(onMarkLastRead, 'Marked as last read')
                }
              >
                <View style={styles.actionIcon}>
                  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <Path
                      d="M4 4.5h9.5A1.5 1.5 0 0 1 15 6v8.5a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 4 4.5Z"
                      stroke={colors.primary}
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M6 8h5M6 10.5h5M6 13h2.5"
                      stroke={colors.primary}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <Path
                      d="M15 8l2-.6 2.5 9.5-2 .6Z"
                      stroke={colors.primary}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </Svg>
                </View>
                <View style={styles.actionMid}>
                  <Text style={styles.actionTitle}>Mark as Last Read</Text>
                  <Text style={styles.actionSub}>Update your reading progress</Text>
                </View>
                <Svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <Path
                    d="M7.5 4.5 13 10l-5.5 5.5"
                    stroke={alpha(colors.secondary, 0.3)}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
            </View>

            {/* Feedback toast */}
            {showFeedback && (
              <View style={styles.feedback}>
                <Svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <Path
                    d="M5 10l3.5 3.5L15 7"
                    stroke={colors.primary}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.feedbackText}>{feedbackText}</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    // ...StyleSheet.absoluteFillObject,
    flex:1,
  },
  backdropVisual: {
    // ...StyleSheet.absoluteFillObject,
    flex: 1,
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
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
  },
  header: {
    marginBottom: 12,
  },
  headerRef: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 15,
    color: colors.secondary,
    marginBottom: 2,
  },
  headerPreview: {
    fontFamily: 'Amiri',
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: 4,
  },
  actions: {
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  actionRowLast: {
    borderBottomWidth: 0,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  actionIconWarning: {
    backgroundColor: alpha(colors.error, 0.08),
  },
  actionMid: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    color: colors.secondary,
  },
  actionTitleWarning: {
    color: colors.error,
  },
  actionSub: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: colors.textSecondary,
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: alpha(colors.primary, 0.08),
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  feedbackText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 13,
    color: colors.primary,
  },
});