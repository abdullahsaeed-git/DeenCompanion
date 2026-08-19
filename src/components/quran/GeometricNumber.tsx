/**
 * Geometric Number Badge
 *
 * A decorative number indicator used in Quran lists.
 * Two overlapping rounded rectangles (one rotated 45°)
 * with the number centered on top.
 *
 * Used in both Surah and Juz list rows.
 */

import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface GeometricNumberProps {
  number: number;
}

export function GeometricNumber({ number }: GeometricNumberProps) {
  return (
    <View style={styles.container}>
      {/* Geometric SVG background */}
      <Svg style={styles.svg} viewBox="0 0 44 44" fill="none">
        <Rect
          x={11} y={11} width={22} height={22} rx={5}
          stroke="#0F6B50" strokeOpacity={0.55} strokeWidth={1.5}
        />
        <Rect
          x={11} y={11} width={22} height={22} rx={5}
          stroke="#0F6B50" strokeOpacity={0.55} strokeWidth={1.5}
          transform="rotate(45 22 22)"
        />
      </Svg>

      {/* Number overlaid on top */}
      <Text style={styles.number}>{number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 44,
    height: 44,
    flexShrink: 0,
  },
  svg: {
    position: 'absolute',
    inset: 0,
  },
  // HTML: position:absolute, inset:0, display:flex,
  //       align-items:center, justify-content:center,
  //       font-size:13px, font-weight:600, color:#0F6B50
  number: {
    position: 'absolute',
    inset: 0,
    textAlign: 'center',
    textAlignVertical: 'center', // Android centering
    lineHeight: 44, // Matches container height for vertical centering
    fontSize: 13,
    fontWeight: '600',
    color: '#0F6B50',
  },
});