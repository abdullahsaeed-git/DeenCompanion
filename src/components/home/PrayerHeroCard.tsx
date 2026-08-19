/**
 * Prayer Hero Card
 *
 * Green card showing the next prayer with real data.
 * Now accepts all values as props.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';

interface PrayerHeroCardProps {
  nextPrayerName: string;
  nextPrayerTime: string;
  prevPrayerName: string;
  prevPrayerTime: string;
  countdown: string;
  progressPercent: number;
  locationName: string;
}

export function PrayerHeroCard({
  nextPrayerName,
  nextPrayerTime,
  prevPrayerName,
  prevPrayerTime,
  countdown,
  progressPercent,
  locationName,
}: PrayerHeroCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {/* Faint mosque silhouette */}
      <View style={styles.artPosition}>
        <Svg
          width={190}
          height={150}
          viewBox="0 0 190 150"
          fill="none"
          stroke="#fff"
          strokeWidth={1.5}
        >
          <Path d="M45 150 v-42 c0-26 22-38 50-54 28 16 50 28 50 54 v42" />
          <Path d="M95 54 v-14" />
          <Circle cx={95} cy={37} r={3} />
          <Path d="M20 150 v-52" />
          <Path d="M14 98 l6-10 6 10" />
          <Path d="M170 150 v-52" />
          <Path d="M164 98 l6-10 6 10" />
          <Path d="M10 150 h170" />
        </Svg>
      </View>

      {/* Row 1: Label + Location */}
      <View style={styles.row1}>
        <Text style={styles.label}>Next Prayer</Text>
        <View style={styles.location}>
          <Svg width={12} height={12} viewBox="0 0 20 20" fill="none">
            <Path
              d="M10 2.5c-3.3 0-5.5 2.4-5.5 5.5 0 4 5.5 9.5 5.5 9.5s5.5-5.5 5.5-9.5c0-3.1-2.2-5.5-5.5-5.5Z"
              stroke="#fff"
              strokeWidth={1.8}
            />
            <Circle cx={10} cy={8} r={2} fill="#fff" />
          </Svg>
          <Text style={styles.locationText}>{locationName}</Text>
        </View>
      </View>

      {/* Row 2: Prayer name/time + Countdown */}
      <View style={styles.row2}>
        <View>
          <Text style={styles.prayerName}>{nextPrayerName}</Text>
          <Text style={styles.prayerTime}>{nextPrayerTime}</Text>
        </View>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdown}>{countdown}</Text>
          <Text style={styles.countdownLabel}>remaining</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${progressPercent}%` }]}>
          <View style={styles.trackDot} />
        </View>
      </View>

      {/* Time labels */}
      <View style={styles.trackLabels}>
        <Text style={styles.trackLabelText}>{prevPrayerName} · {prevPrayerTime}</Text>
        <Text style={styles.trackLabelText}>{nextPrayerName} · {nextPrayerTime}</Text>
      </View>
    </Pressable>
  );
}

// Need to import Svg for the art
import Svg, { Circle, Path } from 'react-native-svg';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F6B50',
    borderRadius: 20,
    padding: 18,
    paddingBottom: 16,
    shadowColor: 'rgba(15, 107, 80, 0.25)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 14,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.95, transform: [{ scale: 0.99 }] },
  artPosition: {
    position: 'absolute',
    right: -16,
    bottom: -14,
    opacity: 0.1,
  },
  row1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.62)',
    fontWeight: '600',
  },
  location: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  locationText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.78)' },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  prayerName: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 26,
    lineHeight: 26,
    color: '#FFFFFF',
  },
  prayerTime: { marginTop: 6, fontSize: 13.5, fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)' },
  countdownContainer: { alignItems: 'flex-end' },
  countdown: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 28,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  countdownLabel: {
    marginTop: 6,
    fontSize: 11,
    letterSpacing: 0.06,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  track: { marginTop: 16, height: 6, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.18)' },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  trackDot: {
    position: 'absolute',
    right: -5,
    top: '50%',
    marginTop: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  trackLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  trackLabelText: { fontSize: 10.5, fontWeight: '500', color: 'rgba(255, 255, 255, 0.55)' },
});