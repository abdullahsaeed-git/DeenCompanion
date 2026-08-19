/**
 * Verse of the Day Card
 *
 * Displays a daily Quran verse with:
 * - "Verse of the Day" label + gold ornament
 * - Arabic text (RTL, centered)
 * - English translation (centered)
 * - Reference (green, centered)
 * - "Read More" button
 *
 * Data is hardcoded for V1.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ArrowRightIcon } from './QuickActions';

/** Gold ornament: line — diamond — line */
function GoldOrnament() {
  return (
    <View style={styles.ornament}>
      <View style={styles.ornamentLine} />
      <View style={styles.ornamentDiamond} />
      <View style={styles.ornamentLine} />
    </View>
  );
}

export function VerseOfTheDay() {
  return (
    <View style={styles.card}>
      {/* Header row: label + ornament */}
      <View style={styles.header}>
        <Text style={styles.label}>Verse of the Day</Text>
        <GoldOrnament />
      </View>

      {/* Arabic verse — RTL, centered */}
      <Text style={styles.arabic} >
        أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
      </Text>

      {/* English translation */}
      <Text style={styles.translation}>
        "Verily, in the remembrance of Allah do hearts find rest."
      </Text>

      {/* Reference */}
      <Text style={styles.reference}>Ar-Ra'd 13:28</Text>

      {/* Read More button */}
      <Pressable
        style={({ pressed }) => [
          styles.moreButton,
          pressed && styles.moreButtonPressed,
        ]}
        onPress={() => {}}
      >
        <Text style={styles.moreButtonText}>Read More</Text>
        <ArrowRightIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // HTML: background:#fff, border:1px solid #E9E4D8, border-radius:20px,
  //       padding:16px 18px 10px, box-shadow:0 2px 10px rgba(16,42,67,.04)
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9E4D8',
    borderRadius: 20,
    padding: 16,
    paddingHorizontal: 18,
    paddingBottom: 10,
    shadowColor: 'rgba(16, 42, 67, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },

  // Header row
  // HTML: display:flex, justify-content:space-between, align-items:center
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  // Gold ornament: line — diamond — line
  // HTML: display:flex, align-items:center
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // HTML: width:22px, height:1px, background:rgba(212,175,55,.55)
  ornamentLine: {
    width: 22,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.55)',
  },
  // HTML: width:5px, height:5px, background:#D4AF37,
  //       transform:rotate(45deg), margin:0 6px, border-radius:1px
  ornamentDiamond: {
    width: 5,
    height: 5,
    backgroundColor: '#D4AF37',
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 6,
    borderRadius: 1,
  },

  // Arabic text
  // HTML: margin-top:12px, font-family:Amiri,serif, font-size:21px,
  //       line-height:2, text-align:center, color:#102A43, dir:rtl
  arabic: {
    marginTop: 12,
    fontFamily: 'Amiri',
    fontSize: 21,
    lineHeight: 21 * 2,
    textAlign: 'center',
    color: '#102A43',
  },

  // English translation
  // HTML: margin-top:6px, font-size:13px, line-height:1.6,
  //       color:#52616F, text-align:center
  translation: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 13 * 1.6,
    color: '#52616F',
    textAlign: 'center',
  },

  // Reference
  // HTML: margin-top:6px, font-size:11.5px, font-weight:600,
  //       color:#0F6B50, text-align:center
  reference: {
    marginTop: 6,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F6B50',
    textAlign: 'center',
  },

  // Read More button
  // HTML: margin:6px auto 0, height:44px, display:flex, align-items:center,
  //       gap:6px, color:#0F6B50, font-weight:600, font-size:13.5px,
  //       padding:0 14px, border-radius:12px
  moreButton: {
    marginTop: 6,
    alignSelf: 'center',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  moreButtonPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: 'rgba(15, 107, 80, 0.08)',
  },
  moreButtonText: {
    color: '#0F6B50',
    fontWeight: '600',
    fontSize: 13.5,
  },
});