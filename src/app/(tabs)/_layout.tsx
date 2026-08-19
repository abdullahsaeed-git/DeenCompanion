/**
 * Tab Layout
 *
 * Configures the bottom tab navigation bar.
 * Uses custom SVG icons from the design system.
 */

import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../constants/theme';

// ============================================
// TAB ICONS
// ============================================

function HomeIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 20 20" fill={color}>
      <Path d="M4 10.2 10 4.4l6 5.8v6.4h-4.4v-4h-3.2v4H4Z" />
    </Svg>
  );
}

function QuranIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M10 6C8 4.6 5.5 4.5 3 5.4V15c2.5-.9 5-.8 7 .6 2-1.4 4.5-1.5 7-.6V5.4C14.5 4.5 12 4.6 10 6Z" />
      <Path d="M10 6v9.6" />
    </Svg>
  );
}

function HadithIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M6 2.8h8.5A2.5 2.5 0 0 1 17 5.3v11.4a2.5 2.5 0 0 1-2.5 2.5H6a2 2 0 0 1-2-2V4.8a2 2 0 0 1 2-2Z" />
      <Path d="M7.5 7.5h5M7.5 10.5h5M7.5 13.5h3" strokeLinecap="round" />
    </Svg>
  );
}

function LibraryIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M6.5 3.5h7V17l-3.5-2.8L6.5 17Z" />
    </Svg>
  );
}

function PrayerIcon({ color }: { color: ColorValue }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth={1.7} strokeLinejoin="round">
      <Path d="M5.5 16.5v-4c0-2.7 2-3.8 4.5-5.9 2.5 2.1 4.5 3.2 4.5 5.9v4" />
      <Path d="M3.5 16.5h13" />
    </Svg>
  );
}

// ============================================
// TAB LAYOUT
// ============================================

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 6,
          paddingBottom: 12,
          height:70,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: 'Quran',
          tabBarIcon: ({ color }) => <QuranIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="hadith"
        options={{
          title: 'Hadith',
          tabBarIcon: ({ color }) => <HadithIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <LibraryIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: 'Prayer',
          tabBarIcon: ({ color }) => <PrayerIcon color={color} />,
        }}
      />
    </Tabs>
  );
}