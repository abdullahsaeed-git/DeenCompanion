/**
 * Quran Bookmarks Screen
 *
 * Displays saved Quran ayahs and position (juz/page) bookmarks.
 * Both tabs load real data from bookmarkService.
 * Tapping a position bookmark navigates to the reader at that page.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, alpha } from '../../constants/theme';
import { QuranBookmark, PositionBookmark } from '../../types/bookmark';
import { bookmarkService } from '../../services/bookmarkService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackIcon, ClockIcon, DeleteIcon, EmptyPositionIcon, MoreIcon, QuranIcon, RemoveIcon, SearchIcon } from '@/components/Icons';

// ============================================
// HELPERS
// ============================================

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `Saved ${date.getDate()} ${months[date.getMonth()]}`;
}

// ============================================
// ICONS
// ============================================


// ============================================
// DELETE CONFIRMATION SHEET
// ============================================

const SLIDE_DISTANCE = 400;

function DeleteSheet({
  visible,
  onClose,
  onDelete,
  label,
}: {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  label: string;
}) {
  const slideAnim = useRef(new Animated.Value(SLIDE_DISTANCE)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

  const animateOpen = useCallback(() => {
    closingRef.current = false;
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [slideAnim, backdropAnim]);

  const animateClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SLIDE_DISTANCE, duration: 200, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  }, [slideAnim, backdropAnim, onClose]);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SLIDE_DISTANCE);
      backdropAnim.setValue(0);
      animateOpen();
    }
  }, [visible, slideAnim, backdropAnim, animateOpen]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={animateClose} statusBarTranslucent>
      <View style={deleteSheetStyles.container}>
        <Pressable style={deleteSheetStyles.backdropPressable} onPress={animateClose}>
          <Animated.View
            style={[
              deleteSheetStyles.backdropVisual,
              { opacity: backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }) },
            ]}
            pointerEvents="none"
          />
        </Pressable>

        <Animated.View style={[deleteSheetStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={deleteSheetStyles.sheetContent}>
            <View style={deleteSheetStyles.handleContainer}>
              <View style={deleteSheetStyles.handle} />
            </View>

            <Text style={deleteSheetStyles.title}>Remove Bookmark</Text>
            <Text style={deleteSheetStyles.subtitle}>{label}</Text>

            <View style={deleteSheetStyles.divider} />

            <Pressable
              style={deleteSheetStyles.deleteBtn}
              onPress={() => {
                animateClose();
                // Delay delete slightly so the close animation plays first
                setTimeout(onDelete, 250);
              }}
            >
            
              <DeleteIcon size={18} color={colors.error} opacity={0.7}/>
              <Text style={deleteSheetStyles.deleteBtnText}>Delete</Text>
            </Pressable>

            <Pressable style={deleteSheetStyles.cancelBtn} onPress={animateClose}>
              <Text style={deleteSheetStyles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const deleteSheetStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  backdropPressable: { flex: 1 },
  backdropVisual: { flex: 1, backgroundColor: colors.secondary },
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
  sheetContent: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 10 },
  handleContainer: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  handle: { width: 32, height: 4, borderRadius: 2, backgroundColor: colors.divider },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: { height: 1, backgroundColor: colors.divider, marginBottom: 12 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: alpha(colors.error, 0.08),
    borderWidth: 1,
    borderColor: alpha(colors.error, 0.2),
  },
  deleteBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 15,
    color: colors.error,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: alpha(colors.secondary, 0.05),
  },
  cancelBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 15,
    color: colors.textSecondary,
  },
});

// ============================================
// AYAH BOOKMARK CARD
// ============================================

function AyahBookmarkCard({
  bookmark,
  onMorePress,
}: {
  bookmark: QuranBookmark;
  onMorePress: () => void;
}) {
  return (
    <View style={styles.ayahCard}>
      <View style={styles.ayahRow1}>
        <Text style={styles.surahName}>{bookmark.surahName}</Text>
        <View style={styles.ayahRefBadge}>
          <Text style={styles.ayahRefText}>{bookmark.surahNumber}:{bookmark.ayahNumber}</Text>
        </View>
        <Pressable style={styles.moreBtn} onPress={onMorePress}>
          <MoreIcon size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.arabicText}>{bookmark.arabicText}</Text>

      {bookmark.translation ? (
        <Text style={styles.translationText} numberOfLines={2}>
          {bookmark.translation}
        </Text>
      ) : null}

      <View style={styles.ayahFooter}>
        <View style={styles.dateRow}>
          <ClockIcon size={12} color={colors.textMuted} />
          <Text style={styles.dateText}>{formatDate(bookmark.dateSaved)}</Text>
        </View>
        {bookmark.note ? (
          <View style={styles.noteBadge}>
            <Text style={styles.noteText}>{bookmark.note}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// ============================================
// POSITION BOOKMARK ROW
// ============================================

function PositionBookmarkRow({
  bookmark,
  onMorePress,
}: {
  bookmark: PositionBookmark;
  onMorePress: () => void;
}) {
  const isJuz = bookmark.type === 'juz';
  const displayNumber = isJuz ? bookmark.juzNumber : bookmark.pageNumber;

  const handlePress = () => {
    if (isJuz) {
      router.push({
        pathname: '/quran-reader',
        params: {
          juzNumber: String(bookmark.juzNumber),
          scrollToPage: String(bookmark.pageNumber),
        },
      });
    } else {
      router.push({
        pathname: '/quran-reader',
        params: { pageNumber: String(bookmark.pageNumber), mode: 'page' },
      });
    }
  };

  return (
    <Pressable style={styles.positionRow} onPress={handlePress}>
      {/* <NumberBadge number={displayNumber} /> */}

      <View style={styles.positionMid}>
        <Text style={styles.positionTitle}>{bookmark.title} {isJuz && `(p-${bookmark.pageNumber})`}</Text>
        <Text style={styles.positionSubtitle} numberOfLines={1}>
          {bookmark.subtitle}
        </Text>
      </View>

      <View style={[styles.typeTag, isJuz ? styles.typeTagJuz : styles.typeTagPage]}>
        <Text style={[styles.typeTagText, isJuz ? styles.typeTagTextJuz : styles.typeTagTextPage]}>
          {isJuz ? 'JUZ' : 'PAGE'}
        </Text>
      </View>

      <Pressable style={styles.positionMoreBtn} onPress={onMorePress}>
        <MoreIcon />
      </Pressable>
    </Pressable>
  );
}
// ============================================
// SCREEN
// ============================================

type TabType = 'ayahs' | 'positions';

export default function QuranBookmarksScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('ayahs');
  const [ayahBookmarks, setAyahBookmarks] = useState<QuranBookmark[]>([]);
  const [positionBookmarks, setPositionBookmarks] = useState<PositionBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete sheet state
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'ayah' | 'position'>('ayah');
  const [deleteLabel, setDeleteLabel] = useState('');

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    const [ayahs, positions] = await Promise.all([
      bookmarkService.getAllQuran(),
      bookmarkService.getAllPositions(),
    ]);
    setAyahBookmarks(ayahs);
    setPositionBookmarks(positions);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const openDeleteSheet = useCallback((id: string, type: 'ayah' | 'position', label: string) => {
    setDeleteId(id);
    setDeleteType(type);
    setDeleteLabel(label);
    setShowDeleteSheet(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    if (deleteType === 'ayah') {
      await bookmarkService.removeQuran(deleteId);
      setAyahBookmarks((prev) => prev.filter((b) => b.id !== deleteId));
    } else {
      await bookmarkService.removePosition(deleteId);
      setPositionBookmarks((prev) => prev.filter((b) => b.id !== deleteId));
    }
    setDeleteId(null);
  }, [deleteId, deleteType]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerBtn} onPress={() => router.back()}>
           <BackIcon/>
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Quran Bookmarks</Text>
            <Text style={styles.headerSubtitle}>Your saved ayahs & positions</Text>
          </View>
          <Pressable style={styles.headerBtn} onPress={() => {}}>
           <SearchIcon  size={20}/>
          </Pressable>
        </View>

        {/* Segmented control */}
        <View style={styles.segContainer}>
          <Pressable
            style={[styles.segButton, activeTab === 'ayahs' && styles.segButtonActive]}
            onPress={() => setActiveTab('ayahs')}
          >
            <Text style={[styles.segText, activeTab === 'ayahs' && styles.segTextActive]}>Ayahs</Text>
          </Pressable>
          <Pressable
            style={[styles.segButton, activeTab === 'positions' && styles.segButtonActive]}
            onPress={() => setActiveTab('positions')}
          >
            <Text style={[styles.segText, activeTab === 'positions' && styles.segTextActive]}>Juz / Page</Text>
          </Pressable>
        </View>

        {/* Ayahs tab */}
        {activeTab === 'ayahs' && (
          <View style={styles.pane}>
            {loading ? (
              <Text style={styles.loadingText}>Loading…</Text>
            ) : ayahBookmarks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <QuranIcon size={40} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No ayah bookmarks yet</Text>
                <Text style={styles.emptySubtitle}>
                  Tap any ayah in the reader and select "Bookmark Verse" to save it here.
                </Text>
              </View>
            ) : (
              ayahBookmarks.map((bookmark) => (
                <AyahBookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onMorePress={() =>
                    openDeleteSheet(
                      bookmark.id,
                      'ayah',
                      `${bookmark.surahName} ${bookmark.surahNumber}:${bookmark.ayahNumber}`,
                    )
                  }
                />
              ))
            )}
          </View>
        )}

        {/* Juz / Page tab */}
        {activeTab === 'positions' && (
          <View style={styles.pane}>
            {loading ? (
              <Text style={styles.loadingText}>Loading…</Text>
            ) : positionBookmarks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <EmptyPositionIcon size={40} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No page bookmarks yet</Text>
                <Text style={styles.emptySubtitle}>
                  Tap any page in mushaf or page mode and select "Bookmark Page" to save it here.
                </Text>
              </View>
            ) : (
              positionBookmarks.map((bookmark) => (
                <PositionBookmarkRow
                  key={bookmark.id}
                  bookmark={bookmark}
                  onMorePress={() =>
                    openDeleteSheet(
                      bookmark.id,
                      'position',
                      `${bookmark.title}${bookmark.subtitle ? ` · ${bookmark.subtitle}` : ''}`,
                    )
                  }
                />
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Delete confirmation sheet */}
      <DeleteSheet
        visible={showDeleteSheet}
        onClose={() => setShowDeleteSheet(false)}
        onDelete={handleDelete}
        label={deleteLabel}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
    fontSize: 14,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 20,
    letterSpacing: -0.01,
    color: colors.secondary,
  },
  headerSubtitle: {
    // marginTop: 2,
    fontSize: 12.5,
    color: colors.textSecondary,
  },

  // ── Segmented control ──
  segContainer: {
    marginTop: 14,
    height: 46,
    backgroundColor: alpha(colors.secondary, 0.06),
    borderRadius: 14,
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  segButton: {
    flex: 1,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: alpha(colors.primary, 0.25),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  segText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  segTextActive: {
    color: '#fff',
  },

  // ── Pane ──
  pane: {
    marginTop: 14,
    flexDirection: 'column',
    gap: 12,
    paddingBottom: 6,
  },

  // ── Empty state ──
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: alpha(colors.secondary, 0.04),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 17,
    color: colors.secondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ── Ayah bookmark card ──
  ayahCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  ayahRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  surahName: {
    fontSize: 15.5,
    fontWeight: '600',
    color: colors.secondary,
  },
  ayahRefBadge: {
    backgroundColor: alpha(colors.primary, 0.08),
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  ayahRefText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  moreBtn: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicText: {
    marginTop: 8,
    fontFamily: 'Amiri',
    fontSize: 18,
    lineHeight: 34,
    color: colors.secondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translationText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  ayahFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  noteBadge: {
    marginLeft: 'auto',
    backgroundColor: alpha(colors.primary, 0.06),
    borderRadius: 9,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  noteText: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: '500',
  },

  // ── Position bookmark row ──
    numBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: alpha(colors.primary, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  numBadgeText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 15,
    color: colors.primary,
  },
  positionRow: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    paddingHorizontal: 14,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  positionMid: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  positionTitle: {
    fontFamily: 'Inter',
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.secondary,
  },
  positionSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: colors.textSecondary,
  },
  positionMoreBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTag: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  typeTagJuz: {
    backgroundColor: alpha(colors.primary, 0.1),
  },
  typeTagPage: {
    backgroundColor: alpha(colors.secondary, 0.06),
  },
  typeTagText: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.06,
  },
  typeTagTextJuz: {
    color: colors.primary,
  },
  typeTagTextPage: {
    color: colors.textSecondary,
  },
});