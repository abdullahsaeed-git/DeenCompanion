/**
 * Settings Screen
 *
 * App preferences, prayer settings, appearance, and account info.
 * Route: /settings
 */

import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';

// ============================================
// ROW ICONS
// ============================================

function GlobeIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7}>
      <Circle cx={12} cy={12} r={8} />
      <Path d="M4 12h16M12 4c2.5 2.4 3.8 5.2 3.8 8S14.5 17.6 12 20c-2.5-2.4-3.8-5.2-3.8-8S9.5 6.4 12 4Z" />
    </Svg>
  );
}

function BookIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M12 6.5C10.4 5.3 8.2 5.2 6 6v12c2.2-.8 4.4-.7 6 .5 1.6-1.2 3.8-1.3 6-.5V6c-2.2-.8-4.4-.7-6 .5Z" />
      <Path d="M12 6.5v12" />
    </Svg>
  );
}

function AudioIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round">
      <Path d="M9 18V7l9-2.5V15" />
      <Circle cx={7} cy={18} r={2.4} />
      <Circle cx={16} cy={15} r={2.4} />
    </Svg>
  );
}

function ArabicFontIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 17 9 7l4 10M6.4 13.8h5.2M14.5 17l3-7.5 3 7.5M15.6 14.6h3.8" />
    </Svg>
  );
}

function BellIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round">
      <Path d="M12 4c-3.3 0-5 2.5-5 5.7v3l-1.5 2.3h13L17 12.7v-3c0-3.2-1.7-5.7-5-5.7Z" />
      <Path d="M10.3 17.5a1.8 1.8 0 0 0 3.4 0" />
    </Svg>
  );
}

function CalcIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round">
      <Path d="M6 8h12M6 12h12M6 16h12M9 6v12M15 6v12" />
    </Svg>
  );
}

function PinIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7}>
      <Path d="M12 3c-3.8 0-6.3 2.8-6.3 6.3 0 4.6 6.3 11 6.3 11s6.3-6.4 6.3-11C18.3 5.8 15.8 3 12 3Z" />
      <Circle cx={12} cy={9.2} r={2.3} fill={colors.primary} stroke="none" />
    </Svg>
  );
}

function DownloadIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 4v9M8.8 9.8 12 13l3.2-3.2" />
      <Path d="M5 15v2.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V15" />
    </Svg>
  );
}

function OfflineIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 15a4 4 0 0 1 .6-8 5 5 0 0 1 9.6 1.2A3.4 3.4 0 0 1 17 15Z" />
      <Path d="M9 18.5h6" />
    </Svg>
  );
}

function ShieldIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M12 3l7 2.6V11c0 4.6-3 7.9-7 9.4-4-1.5-7-4.8-7-9.4V5.6Z" />
    </Svg>
  );
}

function InfoIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round">
      <Circle cx={12} cy={12} r={8} />
      <Path d="M12 11v5M12 7.8v.2" />
    </Svg>
  );
}

function StarIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M12 4l2.4 5 5.6.7-4.1 3.8 1.1 5.5-5-2.8-5 2.8 1.1-5.5L4 9.7 9.6 9Z" />
    </Svg>
  );
}

function ShareIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 13V4M8.8 7.2 12 4l3.2 3.2" />
      <Path d="M6 10H5.5A1.5 1.5 0 0 0 4 11.5v6A1.5 1.5 0 0 0 5.5 19h13a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 18.5 10H18" />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke={alpha(colors.secondary, 0.35)}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ============================================
// TOGGLE SWITCH
// ============================================

function ToggleSwitch({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.switch, value && styles.switchOn]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View style={[styles.switchKnob, value && styles.switchKnobOn]} />
    </Pressable>
  );
}

// ============================================
// REUSABLE COMPONENTS
// ============================================

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel} numberOfLines={1}>
        {label}
      </Text>
      {value !== undefined ? (
        <View style={styles.rowValue}>
          <Text style={styles.rowValueText} numberOfLines={1}>
            {value}
          </Text>
          {/* <ChevronRightIcon /> */}
        </View>
      ) : (
        // <ChevronRightIcon />
        <></>
      )}
    </Pressable>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel} numberOfLines={1}>
        {label}
      </Text>
      <ToggleSwitch value={value} onToggle={onToggle} />
    </View>
  );
}

function SegmentedControl({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map((option, i) => (
        <Pressable
          key={option}
          style={[styles.segButton, i === selected && styles.segButtonActive]}
          onPress={() => onSelect(i)}
          accessibilityRole="radio"
          accessibilityState={{ checked: i === selected }}
        >
          <Text style={[styles.segText, i === selected && styles.segTextActive]}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [prayerNotifications, setPrayerNotifications] = useState(true);
  const [theme, setTheme] = useState(2); // 0: Light, 1: Dark, 2: System

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}

{/* Header */}
<View style={styles.header}>
  <Pressable style={styles.backBtn} onPress={() => router.back()}>
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 4.5 7 10l5.5 5.5"
        stroke={colors.secondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </Pressable>
  <Text style={styles.title}>Settings</Text>
  <View style={styles.headerSpacer} />
</View>

        {/* Profile card */}
        {/* <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>H</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Hassan Ali</Text>
            <Text style={styles.profileSub}>Member since 2026</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed,
            ]}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </Pressable>
        </View> */}

        {/* Preferences */}
        <SectionHeader label="Preferences" />
        <SettingsCard>
          <SettingRow icon={<GlobeIcon />} label="Language" value="English" />
          <SettingRow
            icon={<BookIcon />}
            label="Quran Translation"
            value="Sahih International"
          />
          <SettingRow
            icon={<AudioIcon />}
            label="Quran Reciter"
            value="Mishary Alafasy"
          />
          <SettingRow
            icon={<ArabicFontIcon />}
            label="Arabic Font Size"
            value="Medium (22)"
          />
        </SettingsCard>

       {/* Prayer */}
<SectionHeader label="Prayer" />
<SettingsCard>
  {/* <ToggleRow
    icon={<BellIcon />}
    label="Prayer Notifications"
    value={prayerNotifications}
    onToggle={() => setPrayerNotifications((v) => !v)}
  /> */}
  {/* <SettingRow
    icon={<CalcIcon />}
    label="Calculation Method"
    value="Karachi"
  />
  <SettingRow
    icon={<PinIcon />}
    label="Location"
    value="Wah, Pakistan"
  /> */}
 <Pressable
  style={({ pressed }) => [
    styles.prayerSettingsBtn,
    pressed && styles.prayerSettingsBtnPressed,
  ]}
  onPress={() => router.push('/prayer-settings')}
>
  <Text style={styles.prayerSettingsBtnText}>Prayer Settings</Text>
  <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke={colors.surface}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
</Pressable>
</SettingsCard>

        {/* App */}
        <SectionHeader label="App" />
        <SettingsCard>
          {/* <SettingRow
            icon={<DownloadIcon />}
            label="Downloads"
            value="3 books · 45 MB"
          />
          <SettingRow
            icon={<OfflineIcon />}
            label="Offline Content"
            value="210 MB"
          /> */}
          {/* <SettingRow icon={<ShieldIcon />} label="Privacy" /> */}
          <SettingRow icon={<InfoIcon />} label="About" value="v1.0.0"  />
          {/* <SettingRow icon={<StarIcon />} label="Rate App" /> */}
          {/* <SettingRow icon={<ShareIcon />} label="Share App" /> */}
        </SettingsCard>

        {/* Appearance */}
        {/* <SectionHeader label="Appearance" />
        <SegmentedControl
          options={['Light', 'Dark', 'System']}
          selected={theme}
          onSelect={setTheme}
        /> */}

        {/* Footer */}
        <Text style={styles.footer}>Deen Companion · v1.0.0</Text>
      </ScrollView>
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
  content: {
    paddingHorizontal: 20,
    gap: 0,
  },

  

  // Header
header: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  paddingBottom: 4,
},
backBtn: {
  width: 44,
  height: 44,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
},
title: {
  fontFamily: 'Poppins',
  fontWeight: '600',
  fontSize: 26,
  letterSpacing: -0.01,
  color: colors.secondary,
},
headerSpacer: {
  width: 44,
},

  // Profile card
  profileCard: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    paddingLeft: 14,
    paddingRight: 14,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: alpha(colors.primary, 0.1),
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 18,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 15.5,
    fontWeight: '600',
    color: colors.secondary,
  },
  profileSub: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  editButton: {
    backgroundColor: alpha(colors.primary, 0.08),
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 10,
  },
  editButtonPressed: {
    backgroundColor: alpha(colors.primary, 0.14),
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },

  // Section header
  sectionHeader: {
    marginTop: 18,
    marginHorizontal: 4,
    marginBottom: 8,
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },

  // Row
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '500',
    color: colors.secondary,
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValueText: {
    fontSize: 13,
    color: '#52616F',
  },

  // Divider between rows
  // (handled by card overflow + row borders below)

  // Toggle switch
  switch: {
    width: 46,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D5DBE1',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingStart: 3,
    flexShrink: 0,
  },
  switchOn: {
    backgroundColor: colors.primary,
    justifyContent: 'flex-end',
    paddingEnd: 3,
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  switchKnobOn: {
    // No extra styles — position handled by parent justifyContent
  },

  // Segmented control
  segmented: {
    marginTop: 2,
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
    elevation: 4,
  },
  segText: {
    fontWeight: '600',
    fontSize: 13.5,
    color: '#52616F',
  },
  segTextActive: {
    color: '#FFFFFF',
  },

  // Footer
  footer: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 11,
    color: colors.textDisabled,
    paddingBottom: 4,
  },

  //prayer

  prayerSettingsBtn: {
  marginHorizontal: 12,
  marginTop: 10,
  marginBottom: 12,
  height: 48,
  borderRadius: 12,
  backgroundColor: colors.primary,
  flexDirection: 'row',
  gap: 10,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: alpha(colors.primary, 0.28),
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 20,
  elevation: 6,
},
prayerSettingsBtnPressed: {
  transform: [{ scale: 0.98 }],
  opacity: 0.9,
},
prayerSettingsBtnText: {
  fontFamily: 'Poppins',
  fontWeight: '600',
  fontSize: 14,
  color: '#FFFFFF',
},
});