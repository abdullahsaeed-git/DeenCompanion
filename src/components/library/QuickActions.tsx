/**
 * Quick Actions Grid
 *
 * 4 equal-width buttons: Quran, Hadith, Qibla, Tasbih
 * Each has an SVG icon and a label.
 *
 * Layout: flexDirection:'row' with flex:1 on each item
 * creates equal-width columns (mimics CSS grid 4-column).
 *
 * onPress handlers are no-ops for now — will navigate
 * to respective screens once they're built.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/** Quran icon — open book */
function QuranIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 20 20" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M10 6C8 4.6 5.5 4.5 3 5.4V15c2.5-.9 5-.8 7 .6 2-1.4 4.5-1.5 7-.6V5.4C14.5 4.5 12 4.6 10 6Z" />
      <Path d="M10 6v9.6" />
    </Svg>
  );
}

/** Hadith icon — book with text lines */
function HadithIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 20 20" fill="none" stroke="#0F6B50" strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M6 2.8h8.5A2.5 2.5 0 0 1 17 5.3v11.4a2.5 2.5 0 0 1-2.5 2.5H6a2 2 0 0 1-2-2V4.8a2 2 0 0 1 2-2Z" />
      <Path d="M7.5 7.5h5M7.5 10.5h5M7.5 13.5h3" strokeLinecap="round" />
    </Svg>
  );
}

/** Qibla icon — compass with needle */
function QiblaIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 20 20" fill="none" stroke="#0F6B50" strokeWidth={1.7}>
      <Circle cx={10} cy={10} r={7.2} />
      <Path d="M12.8 7.2l-1.7 4-4 1.7 1.7-4z" strokeLinejoin="round" />
    </Svg>
  );
}

/** Tasbih icon — prayer beads arrangement */
function TasbihIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 20 20" fill="#0F6B50">
      <Circle cx={10} cy={3.4} r={1.5} />
      <Circle cx={14.8} cy={5.4} r={1.5} />
      <Circle cx={16.6} cy={10.2} r={1.5} />
      <Circle cx={5.2} cy={5.4} r={1.5} />
      <Circle cx={3.4} cy={10.2} r={1.5} />
      <Circle cx={6.6} cy={13.8} r={1.5} />
      <Circle cx={13.4} cy={13.8} r={1.5} />
      <Path d="M10 15.4v2" stroke="#0F6B50" strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={10} cy={18.4} r={1.2} />
    </Svg>
  );
}

/** Right arrow icon — used in Continue/Read More buttons */
export function ArrowRightIcon({ size = 14 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M4 10h11M11 5.5 15.5 10 11 14.5"
        stroke="#0F6B50"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function QuickActions() {
  return (
    <View style={styles.grid}>
      <Pressable
        style={({ pressed }) => [
          styles.action,
          pressed && styles.actionPressed,
        ]}
        onPress={() => {}}
      >
        <QuranIcon />
        <Text style={styles.actionLabel}>Quran</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.action,
          pressed && styles.actionPressed,
        ]}
        onPress={() => {}}
      >
        <HadithIcon />
        <Text style={styles.actionLabel}>Hadith</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.action,
          pressed && styles.actionPressed,
        ]}
        onPress={() => {}}
      >
        <QiblaIcon />
        <Text style={styles.actionLabel}>Qibla</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.action,
          pressed && styles.actionPressed,
        ]}
        onPress={() => {}}
      >
        <TasbihIcon />
        <Text style={styles.actionLabel}>Tasbih</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // HTML: display:grid, grid-template-columns:repeat(4,1fr), gap:12px
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  // HTML: background:#fff, border:1px solid #E9E4D8, border-radius:16px,
  //       height:84px, flex-direction:column, align/justify:center, gap:8px,
  //       box-shadow:0 2px 10px rgba(16,42,67,.04)
  action: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 16,
    height: 84,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: 'rgba(16, 42, 67, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  actionPressed: {
    transform: [{ scale: 0.94 }],
  },
  // HTML: font-size:12px, font-weight:500, color:#102A43
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#102A43',
  },
});