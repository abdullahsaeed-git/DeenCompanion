/**
 * Tasbih Counter Screen
 *
 * A digital dhikr counter with:
 * - Tap-to-count circular progress ring
 * - Dhikr selector (SubhanAllah, Alhamdulillah, Allahu Akbar, etc.)
 * - Reset, Change Dhikr, Vibration toggle, History
 * - Daily goal tracking
 * - Persistent count and history via AsyncStorage
 *
 * Route: /tasbih
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES & DATA
// ============================================

interface Dhikr {
  id: string;
  name: string;
  arabic: string;
  goal: number;
}

interface HistoryEntry {
  id: string;
  dhikrName: string;
  dhikrArabic: string;
  count: number;
  goal: number;
  timestamp: number;
}

interface TasbihState {
  count: number;
  selectedDhikrIndex: number;
  vibrationOn: boolean;
  history: HistoryEntry[];
}

const DHIKRS: Dhikr[] = [
  { id: 'subhanallah', name: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', goal: 100 },
  { id: 'alhamdulillah', name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', goal: 100 },
  { id: 'allahuakbar', name: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', goal: 100 },
  { id: 'lailaha', name: 'La ilaha illallah', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', goal: 100 },
  { id: 'astaghfirullah', name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', goal: 100 },
  { id: 'salawat', name: 'Salawat', arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', goal: 100 },
];

const STORAGE_KEY = '@deen_companion_tasbih_v1';

// // Try to load expo-haptics for vibration feedback
// let Haptics: typeof import('expo-haptics') | null = null;
// try {
//   Haptics = require('expo-haptics');
// } catch {
//   Haptics = null;
// }

// ============================================
// ICONS
// ============================================

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke={colors.secondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// function GearIcon() {
//   return (
//     <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" stroke={colors.secondary} strokeWidth={1.6} strokeLinecap="round">
//       <Circle cx={10} cy={10} r={2.7} />
//       <Path d="M10 3.2v1.6M10 15.2v1.6M3.2 10h1.6M15.2 10h1.6M5.2 5.2l1.1 1.1M13.7 13.7l1.1 1.1M14.8 5.2l-1.1 1.1M6.3 13.7l-1.1 1.1" />
//     </Svg>
//   );
// }

function BeadsIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path d="M24 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill={colors.primary} />
      <Path d="M33 6.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill={colors.primary} />
      <Path d="M39.5 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill={colors.primary} />
      <Path d="M41 22a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill={colors.primary} />
      <Path d="M15 6.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill={colors.primary} />
      <Path d="M8.5 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill={colors.primary} />
      <Path d="M7 22a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill={colors.primary} />
      <Path d="M12 30a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill={colors.primary} />
      <Path d="M36 30a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill={colors.primary} />
      <Circle cx={24} cy={37} r={3.6} fill={colors.accent} />
      <Path d="M24 40.5v4" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={24} cy={46} r={1.6} fill={colors.accent} />
    </Svg>
  );
}

function ChevronRightIcon({ color = alpha(colors.secondary, 0.35) }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ResetIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 20 20" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4.5 8a6 6 0 1 1 1 5.2M4.5 3.8V8h4.2" />
    </Svg>
  );
}

function SwapIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 20 20" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 7h10M11.5 4 14.5 7l-3 3M16 13H6M8.5 10 5.5 13l3 3" />
    </Svg>
  );
}

function VibrationIcon({ on }: { on?: boolean }) {
  const color = on ? colors.primary : colors.primary;
  return (
    <Svg width={19} height={19} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={7} y={4} width={6} height={12} rx={1.5} />
      <Path d="M4 7.5c-1.2 1.5-1.2 3.5 0 5M16 7.5c1.2 1.5 1.2 3.5 0 5" />
    </Svg>
  );
}

function HistoryIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 20 20" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round">
      <Circle cx={10} cy={10} r={7.5} />
      <Path d="M10 6v4.2l2.8 1.6" />
    </Svg>
  );
}

function TargetIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 20 20" fill="none" stroke={colors.primary} strokeWidth={1.7}>
      <Circle cx={10} cy={10} r={7.5} />
      <Circle cx={10} cy={10} r={4} />
      <Circle cx={10} cy={10} r={1} fill={colors.primary} />
    </Svg>
  );
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M4 10.5l4 4 8-8"
        stroke={colors.primary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" stroke={colors.secondary} strokeWidth={2} strokeLinecap="round">
      <Path d="M5 5l10 10M15 5L5 15" />
    </Svg>
  );
}

// ============================================
// PROGRESS RING
// ============================================

function ProgressRing({ progress }: { progress: number }) {
  const radius = 132;
  const circumference = 2 * Math.PI * radius;
  const visibleLength = Math.min(progress, 1) * circumference;

  return (
    <Svg width={280} height={280} viewBox="0 0 280 280" style={styles.ringSvg}>
      {/* Track */}
      <Circle
        cx={140}
        cy={140}
        r={radius}
        stroke={alpha(colors.primary, 0.12)}
        strokeWidth={10}
        fill="none"
      />
      {/* Progress arc */}
      <Circle
        cx={140}
        cy={140}
        r={radius}
        stroke={colors.primary}
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${visibleLength} ${circumference}`}
        transform="rotate(-90 140 140)"
      />
      {/* Inner disc */}
      <Circle
        cx={140}
        cy={140}
        r={112}
        fill={colors.surface}
        stroke={colors.border}
      />
    </Svg>
  );
}

// ============================================
// MODALS
// ============================================

function DhikrPickerModal({
  visible,
  selectedIndex,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Dhikr</Text>
            <Pressable style={styles.modalCloseBtn} onPress={onClose}>
              <CloseIcon />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {DHIKRS.map((dhikr, index) => {
              const selected = index === selectedIndex;
              return (
                <Pressable
                  key={dhikr.id}
                  style={({ pressed }) => [
                    styles.dhikrOption,
                    selected && styles.dhikrOptionSelected,
                    pressed && styles.dhikrOptionPressed,
                  ]}
                  onPress={() => onSelect(index)}
                >
                  <View style={styles.dhikrOptionText}>
                    <Text style={[styles.dhikrOptionName, selected && styles.dhikrOptionNameSelected]}>
                      {dhikr.name}
                    </Text>
                    <Text style={styles.dhikrOptionArabic}>{dhikr.arabic}</Text>
                  </View>
                  {selected && <CheckIcon size={16} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function HistoryModal({
  visible,
  history,
  onClose,
  onClear,
}: {
  visible: boolean;
  history: HistoryEntry[];
  onClose: () => void;
  onClear: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>History</Text>
            <View style={styles.modalHeaderRight}>
              {history.length > 0 && (
                <Pressable style={styles.modalClearBtn} onPress={onClear}>
                  <Text style={styles.modalClearText}>Clear</Text>
                </Pressable>
              )}
              <Pressable style={styles.modalCloseBtn} onPress={onClose}>
                <CloseIcon />
              </Pressable>
            </View>
          </View>
          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>No sessions yet.</Text>
              <Text style={styles.emptyHistorySub}>Complete a dhikr goal to see it here.</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {history.map((entry) => (
                <View key={entry.id} style={styles.historyRow}>
                  <View style={styles.historyRowLeft}>
                    <Text style={styles.historyRowName}>{entry.dhikrName}</Text>
                    <Text style={styles.historyRowArabic}>{entry.dhikrArabic}</Text>
                  </View>
                  <View style={styles.historyRowRight}>
                    <Text style={styles.historyRowCount}>
                      {entry.count}/{entry.goal}
                    </Text>
                    <Text style={styles.historyRowDate}>
                      {new Date(entry.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
  }

// ============================================
// MAIN SCREEN
// ============================================

export default function TasbihScreen() {
  const insets = useSafeAreaInsets();

  const [count, setCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [vibrationOn, setVibrationOn] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const dhikr = DHIKRS[selectedIndex];
  const goal = dhikr.goal;
  const progress = goal > 0 ? count / goal : 0;

  // Load persisted state
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        if (!json || cancelled) return;
        const parsed: TasbihState = JSON.parse(json);
        setCount(parsed.count || 0);
        setSelectedIndex(
          parsed.selectedDhikrIndex >= 0 && parsed.selectedDhikrIndex < DHIKRS.length
            ? parsed.selectedDhikrIndex
            : 0
        );
        setVibrationOn(parsed.vibrationOn !== undefined ? parsed.vibrationOn : true);
        setHistory(parsed.history || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Persist state
  useEffect(() => {
    const state: TasbihState = {
      count,
      selectedDhikrIndex: selectedIndex,
      vibrationOn,
      history,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [count, selectedIndex, vibrationOn, history]);

  const handleTap = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);

    // if (vibrationOn && Haptics) {
    //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    // }

    // When goal is reached, auto-save to history and reset
    if (newCount >= goal) {
      const entry: HistoryEntry = {
        id: `${Date.now()}-${Math.random()}`,
        dhikrName: dhikr.name,
        dhikrArabic: dhikr.arabic,
        count: newCount,
        goal,
        timestamp: Date.now(),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 50));
      setCount(0);
    }
  }, [count, goal, dhikr, vibrationOn]);

  const handleReset = useCallback(() => {
    setCount(0);
  }, []);

  const handleSelectDhikr = useCallback((index: number) => {
    setSelectedIndex(index);
    setCount(0);
    setShowPicker(false);
  }, []);

    const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <View style={styles.screen}>
      {/* Header */}
      {/* <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={[styles.headerBtn, {}]} onPress={() => router.back()}>
          <BackIcon />
        </Pressable>
        <View style= {{}}>
        <Text style={styles.title}>Tasbih</Text>
        </View>
        <Pressable style={styles.headerBtn} onPress={() => setShowPicker(true)}>
           <GearIcon /> 
        </Pressable>
      </View> */}

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
 <Pressable style={styles.headerBtn} onPress={() => router.back()}>
  <BackIcon />
</Pressable>
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text style={styles.title}>Tasbih</Text>
  </View>
</View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dhikr selector card */}
        <Pressable
          style={({ pressed }) => [styles.dhikrCard, pressed && styles.dhikrCardPressed]}
          onPress={() => setShowPicker(true)}
        >
          <View style={styles.dhikrIcon}>
            <BeadsIcon />
          </View>
          <View style={styles.dhikrText}>
            <Text style={styles.dhikrName}>{dhikr.name}</Text>
            <Text style={styles.dhikrArabic}>{dhikr.arabic}</Text>
          </View>
          <ChevronRightIcon />
        </Pressable>

        {/* Counter */}
        <Pressable
          style={({ pressed }) => [styles.counterWrap, pressed && styles.counterWrapPressed]}
          onPress={handleTap}
        >
          <ProgressRing progress={progress} />
          <View style={styles.counterTextWrap}>
            <Text style={styles.counterNumber}>{count}</Text>
            <Text style={styles.counterOf}>of {goal}</Text>
            <Text style={styles.counterLabel}>TAP TO COUNT</Text>
          </View>
        </Pressable>

        {/* Daily goal */}
        <View style={styles.goalRow}>
          <TargetIcon />
          <Text style={styles.goalText}>
            Daily Goal: <Text style={styles.goalBold}>{goal}</Text>
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsGrid}>
          <Pressable
            style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}
            onPress={handleReset}
          >
            <ResetIcon />
            <Text style={styles.controlLabel}>Reset</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}
            onPress={() => setShowPicker(true)}
          >
            <SwapIcon />
            <Text style={styles.controlLabel}>Change Dhikr</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.controlBtn,
              vibrationOn && styles.controlBtnOn,
              pressed && styles.controlBtnPressed,
            ]}
            onPress={() => setVibrationOn((v) => !v)}
          >
            <VibrationIcon on={vibrationOn} />
            <Text style={[styles.controlLabel, vibrationOn && styles.controlLabelOn]}>
              Vibration
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.controlBtn, pressed && styles.controlBtnPressed]}
            onPress={() => setShowHistory(true)}
          >
            <HistoryIcon />
            <Text style={styles.controlLabel}>History</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Modals */}
      <DhikrPickerModal
        visible={showPicker}
        selectedIndex={selectedIndex}
        onSelect={handleSelectDhikr}
        onClose={() => setShowPicker(false)}
      />

            <HistoryModal
        visible={showHistory}
        history={history}
        onClose={() => setShowHistory(false)}
        onClear={handleClearHistory}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: colors.background,
    zIndex: 1,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // alignSelf: "flex-start"
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 26,
    letterSpacing: -0.01,
    color: colors.secondary,
  },

  // Dhikr card
  dhikrCard: {
    width: '100%',
    maxWidth: 350,
    height: 64,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
    marginTop: 8,
  },
  dhikrCardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: colors.pressedBg,
  },
  dhikrIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dhikrText: {
    flex: 1,
    marginRight: 4,
  },
  dhikrName: {
    fontSize: 15.5,
    fontWeight: '600',
    color: colors.secondary,
  },
  dhikrArabic: {
    fontFamily: 'Amiri',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 1,
  },

  // Counter
  counterWrap: {
    marginTop: 26,
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterWrapPressed: {
    transform: [{ scale: 0.98 }],
  },
  ringSvg: {
    position: 'absolute',
  },
  counterTextWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  counterNumber: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 64,
    lineHeight: 68,
    color: colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  counterOf: {
    fontSize: 12.5,
    color: colors.textMuted,
    fontWeight: '500',
  },
  counterLabel: {
    marginTop: 8,
    fontSize: 9.5,
    letterSpacing: 0.16,
    color: colors.textDisabled,
    fontWeight: '600',
  },

  // Goal
  goalRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  goalText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textAction,
  },
  goalBold: {
    color: colors.primary,
  },

  // Controls
  controlsGrid: {
    marginTop: 22,
    width: '100%',
    maxWidth: 350,
    flexDirection: 'row',
    gap: 10,
  },
  controlBtn: {
    flex: 1,
    height: 68,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  controlBtnPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: colors.pressedBg,
  },
  controlBtnOn: {
    backgroundColor: alpha(colors.primary, 0.08),
    borderColor: alpha(colors.primary, 0.3),
  },
  controlLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textAction,
  },
  controlLabelOn: {
    color: colors.primary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    // ...StyleSheet.absoluteFillObject,
    flex: 1,
    // position: 'absolute',
    backgroundColor: colors.overlay,
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 34,
    maxHeight: '70%',
    shadowColor: alpha(colors.secondary, 0.12),
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: colors.secondary,
  },
  modalCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dhikr option
  dhikrOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dhikrOptionSelected: {
    backgroundColor: alpha(colors.primary, 0.05),
  },
  dhikrOptionPressed: {
    backgroundColor: colors.pressedBg,
  },
  dhikrOptionText: {
    flex: 1,
    marginRight: 12,
  },
  dhikrOptionName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.secondary,
  },
  dhikrOptionNameSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  dhikrOptionArabic: {
    fontFamily: 'Amiri',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // History
  emptyHistory: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 6,
  },
  emptyHistoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyHistorySub: {
    fontSize: 13,
    color: colors.textMuted,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  historyRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  historyRowName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  historyRowArabic: {
    fontFamily: 'Amiri',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  historyRowRight: {
    alignItems: 'flex-end',
  },
  historyRowCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  historyRowDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
    modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalClearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: alpha(colors.error, 0.08),
  },
  modalClearText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
});