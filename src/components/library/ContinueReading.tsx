/**
 * Continue Reading Card
 *
 * Shows the user's last read Quran position:
 * - Circular SVG progress indicator (percentage)
 * - Surah name and ayah number
 * - "Continue" button to resume reading
 *
 * Data is hardcoded for V1.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ArrowRightIcon } from './QuickActions';

/** Circular progress ring with percentage text */
function ProgressRing({ percent }: { percent: number }) {
  // Circle: radius 20, circumference = 2 * π * 20 ≈ 125.66
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashLength = (percent / 100) * circumference;
  const dashGap = circumference - dashLength;

  return (
    <View style={styles.ringContainer}>
      <Svg width={48} height={48} viewBox="0 0 48 48">
        {/* Background track — faint green circle */}
        <Circle
          cx={24} cy={24} r={radius}
          stroke="rgba(15, 107, 80, 0.12)"
          strokeWidth={4}
          fill="none"
        />
        {/* Progress arc — green, rotated to start from top */}
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
      {/* Percentage text — overlaid on top of the SVG */}
      <Text style={styles.ringText}>{percent}%</Text>
    </View>
  );
}

export function ContinueReading() {
  return (
    <View style={styles.card}>
      <ProgressRing percent={32} />

      <View style={styles.textContainer}>
        <Text style={styles.label}>Continue Reading</Text>
        <Text style={styles.surahName}>Surah Al-Baqarah</Text>
        <Text style={styles.ayah}>Ayah 42</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => {}}
      >
        <Text style={styles.buttonText}>Continue</Text>
        <ArrowRightIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // HTML: background:#fff, border:1px solid #E9E4D8, border-radius:16px,
  //       padding:14px, display:flex, align-items:center, gap:12px,
  //       box-shadow:0 2px 10px rgba(16,42,67,.04)
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

  // Circular progress ring — positions the SVG and overlaid text
  ringContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // HTML: font-size:11px, font-weight:600, fill:#0F6B50
  ringText: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '600',
    color: '#0F6B50',
  },

  // Text section — flex:1 to take remaining space
  textContainer: {
    flex: 1,
    minWidth: 0, // Prevents text from overflowing
  },
  // HTML: font-size:10.5px, letter-spacing:.12em, text-transform:uppercase,
  //       color:#7A828C, font-weight:600
  label: {
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: '#7A828C',
    fontWeight: '600',
  },
  // HTML: display:block, margin-top:3px, font-size:15.5px, font-weight:600, color:#102A43
  surahName: {
    marginTop: 3,
    fontSize: 15.5,
    fontWeight: '600',
    color: '#102A43',
  },
  // HTML: display:block, margin-top:2px, font-style:normal,
  //       font-size:12.5px, color:#52616F
  ayah: {
    marginTop: 2,
    fontSize: 12.5,
    color: '#52616F',
  },

  // Continue button
  // HTML: height:44px, padding:0 16px, border-radius:12px,
  //       background:rgba(15,107,80,.08), color:#0F6B50,
  //       font-weight:600, font-size:13.5px, display:flex,
  //       align-items:center, gap:6px
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