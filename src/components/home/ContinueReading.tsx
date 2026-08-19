/**
 * Continue Reading Card
 *
 * Shows the user's last read Quran position with real progress.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { ArrowRightIcon } from './QuickActions';

interface ContinueReadingProps {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  progressPercent: number;
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashLength = (percent / 100) * circumference;
  const dashGap = circumference - dashLength;

  return (
    <View style={styles.ringContainer}>
      <Svg width={48} height={48} viewBox="0 0 48 48">
        <Circle
          cx={24} cy={24} r={radius}
          stroke="rgba(15, 107, 80, 0.12)"
          strokeWidth={4}
          fill="none"
        />
        <Circle
          cx={24} cy={24} r={radius}
          stroke="#0F6B50"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={[dashLength, dashGap]}
          transform={`rotate(-90 24 24)`}
        />
      </Svg>
      <Text style={styles.ringText}>{percent}%</Text>
    </View>
  );
}

export function ContinueReading({
  surahNumber,
  surahName,
  ayahNumber,
  progressPercent,
}: ContinueReadingProps) {
  function handleContinue() {
    router.push({
      pathname: '/quran-reader',
      params: { surahNumber: String(surahNumber), mode: 'ayah' },
    });
  }

  return (
    <View style={styles.card}>
      <ProgressRing percent={progressPercent} />

      <View style={styles.textContainer}>
        <Text style={styles.label}>Continue Reading</Text>
        <Text style={styles.surahName}>{surahName}</Text>
        <Text style={styles.ayah}>Ayah {ayahNumber}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
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
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: 'rgba(16, 42, 67, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  ringContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '600',
    color: '#0F6B50',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: '#7A828C',
    fontWeight: '600',
  },
  surahName: {
    marginTop: 3,
    fontSize: 15.5,
    fontWeight: '600',
    color: '#102A43',
  },
  ayah: {
    marginTop: 2,
    fontSize: 12.5,
    color: '#52616F',
  },
  button: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 107, 80, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: 'rgba(15, 107, 80, 0.14)',
  },
  buttonText: {
    color: '#0F6B50',
    fontWeight: '600',
    fontSize: 13.5,
  },
});