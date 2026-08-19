/**
 * Prayer Timeline
 *
 * Dynamic vertical timeline. States are computed from current time
 * and the provided nextPrayerId / prevPrayerId.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { PrayerTime, PrayerRowState } from '../../types/prayer';

const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

// ============================================
// BELL ICONS
// ============================================

function BellOn() {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4c-3.3 0-5 2.5-5 5.7v3l-1.5 2.3h13L17 12.7v-3c0-3.2-1.7-5.7-5-5.7Z" stroke="#0F6B50" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      <Path d="M10.3 17.5a1.8 1.8 0 0 0 3.4 0" stroke="#0F6B50" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function BellOff() {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4c-3.3 0-5 2.5-5 5.7v3l-1.5 2.3h13L17 12.7v-3c0-3.2-1.7-5.7-5-5.7Z" stroke="#B9C1CA" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      <Path d="M10.3 17.5a1.8 1.8 0 0 0 3.4 0" stroke="#B9C1CA" strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M5 5l14 14" stroke="#B9C1CA" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function SunIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3.6} stroke="#98A2AE" strokeWidth={1.7} />
      <Path d="M12 4v1.6M12 18.4V20M4 12h1.6M18.4 12H20M6.3 6.3l1.1 1.1M16.6 16.6l1.1 1.1M17.7 6.3l-1.1 1.1M7.4 16.6l-1.1 1.1" stroke="#98A2AE" strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

// ============================================
// ROW
// ============================================

interface PrayerRowProps {
  prayer: PrayerTime;
  state: PrayerRowState;
  onBellPress?: () => void;
}

function PrayerRow({ prayer, state, onBellPress }: PrayerRowProps) {
  const isPast = state === 'past';
  const isNext = state === 'next';

  return (
    <View style={[styles.row, isNext && styles.rowNext]}>
      {/* Dot */}
      <View
        style={[
          styles.dot,
          isPast && styles.dotPast,
          isNext && styles.dotNext,
          state === 'upcoming' && styles.dotUpcoming,
        ]}
      />

      {/* Name + NEXT chip */}
      <View style={styles.nameContainer}>
        {!prayer.isSunrise && (
          <Text style={[styles.name, isPast && styles.textPast, isNext && styles.textNext]}>
            {prayer.name}
          </Text>
        )}
        {prayer.isSunrise && (
          <View style={styles.nameWithIcon}>
            <SunIcon />
            <Text style={[styles.name, styles.textPast]}>Sunrise</Text>
          </View>
        )}
        {isNext && (
          <View style={styles.nextChip}>
            <Text style={styles.nextChipText}>NEXT</Text>
          </View>
        )}
      </View>

      {/* Time */}
      <Text style={[styles.time, isPast && styles.textPast, isNext && styles.textNext]}>
        {prayer.time}
      </Text>

      {/* Bell or spacer */}
      {prayer.isSunrise ? (
        <View style={styles.spacer} />
      ) : (
        <Pressable style={styles.bellButton} onPress={onBellPress}>
          {prayer.notificationOn ? <BellOn /> : <BellOff />}
        </Pressable>
      )}
    </View>
  );
}

// ============================================
// TIMELINE
// ============================================

interface PrayerTimelineProps {
  prayers: PrayerTime[];
  nextPrayerId: string;
  prevPrayerId: string;
  onToggleNotification: (id: string) => void;
}

function computeRowState(prayerId: string, nextPrayerId: string, prevPrayerId: string): PrayerRowState {
  if (prayerId === nextPrayerId) return 'next';

  const nextIdx = PRAYER_ORDER.indexOf(nextPrayerId);
  const prevIdx = PRAYER_ORDER.indexOf(prevPrayerId);
  const currentIdx = PRAYER_ORDER.indexOf(prayerId);

  if (nextIdx === -1 || currentIdx === -1) return 'upcoming';

  if (nextIdx > prevIdx) {
    // Normal flow: prev comes before next in the daily order
    return currentIdx <= prevIdx ? 'past' : 'upcoming';
  } else {
    // Wrapped: next is earlier than prev (e.g., prev=Isha, next=Fajr)
    // All prayers except next are past
    return currentIdx !== nextIdx ? 'past' : 'next';
  }
}

export function PrayerTimeline({ prayers, nextPrayerId, prevPrayerId, onToggleNotification }: PrayerTimelineProps) {
  return (
    <View style={styles.container}>
      <View style={styles.verticalLine} />
      {prayers.map((prayer) => (
        <PrayerRow
          key={prayer.id}
          prayer={prayer}
          state={computeRowState(prayer.id, nextPrayerId, prevPrayerId)}
          onBellPress={() => onToggleNotification(prayer.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    shadowColor: 'rgba(16, 42, 67, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  verticalLine: {
    position: 'absolute',
    left: 33,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: '#EFEAE0',
  },
  row: { flexDirection: 'row', alignItems: 'center', height: 52 },
  rowNext: {
    backgroundColor: 'rgba(15, 107, 80, 0.06)',
    borderRadius: 12,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 18, flexShrink: 0 },
  dotPast: { backgroundColor: '#C9CFD6' },
  dotNext: {
    backgroundColor: '#0F6B50',
    shadowColor: 'rgba(15, 107, 80, 0.18)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  dotUpcoming: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#C9CFD6' },
  nameContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  nameWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  name: { fontSize: 15, fontWeight: '600', color: '#102A43' },
  textPast: { color: '#98A2AE' },
  textNext: { color: '#0F6B50' },
  nextChip: {
    backgroundColor: '#0F6B50',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  nextChipText: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.08, color: '#FFFFFF' },
  time: { fontSize: 13.5, fontWeight: '600', color: '#33475C' },
  bellButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  spacer: { width: 40 },
});