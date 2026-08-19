/**
 * ReaderHeader
 *
 * Sticky header for the Quran Reader.
 * Contains: back button, title/subtitle, mode toggle (ayah/mushaf), settings button.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, alpha } from '../../constants/theme';
import { ReaderMode } from '../../types/quran';

interface ReaderHeaderProps {
  headerTitle: string;
  headerSubtitle: string;
  isPageMode: boolean;
  readerMode: ReaderMode;
  setReaderMode: (mode: ReaderMode) => void;
  topInset: number;
  onSettingsPress: () => void;
}

export function ReaderHeader({
  headerTitle,
  headerSubtitle,
  isPageMode,
  readerMode,
  setReaderMode,
  topInset,
  onSettingsPress,
}: ReaderHeaderProps) {
  return (
    <View style={[styles.stickyHeader, { paddingTop: topInset + 8, paddingBottom: 10 }]}>
      <Pressable style={styles.headerBtn} onPress={() => router.back()}>
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Path d="M12.5 4.5 7 10l5.5 5.5" stroke={colors.secondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>

      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
      </View>

      {/* Mode toggle — hidden in page mode */}
      {!isPageMode && (
        <Pressable
          style={[styles.headerBtn, readerMode === 'mushaf' && styles.headerBtnActive]}
          onPress={() => setReaderMode(readerMode === 'mushaf' ? 'ayah' : 'mushaf')}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={readerMode === 'mushaf' ? colors.primary : colors.secondary} strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
            {readerMode === 'mushaf' ? (
              <Path d="M6 7h12M6 11h10M6 15h12M6 19h8" />
            ) : (
              <>
                <Path d="M4 5.5c2.2-.8 4.8-.7 7 .6 2.2-1.3 4.8-1.4 7-.6v14c-2.2-.8-4.8-.7-7 .6-2.2-1.3-4.8-1.4-7-.6Z" />
                <Path d="M11 6.1v14" />
                <Path d="M7 9h2M7 12h2M14 9h2M14 12h2" opacity={0.7} />
              </>
            )}
          </Svg>
        </Pressable>
      )}

      {isPageMode && <View style={styles.headerBtn} />}

      <Pressable style={styles.headerBtn} onPress={onSettingsPress}>
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    zIndex: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnActive: {
    backgroundColor: alpha(colors.primary, 0.08),
    shadowColor: alpha(colors.primary, 0.35),
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    shadowOpacity: 1,
    elevation: 2,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: colors.secondary,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
});