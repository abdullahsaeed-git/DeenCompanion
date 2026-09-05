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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HadithIcon, HomeIcon, LibraryIcon, MainHomeIcon, MosqueIcon, QuranIcon, SearchIcon } from '@/components/Icons';


// ============================================
// TAB LAYOUT
// ============================================

export default function TabLayout() {
  const insets = useSafeAreaInsets();
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
          paddingBottom:12,
          height: insets.bottom ? insets.bottom + 60 : 70,
          
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
          tabBarIcon: ({ color }) => <MainHomeIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: 'Quran',
          tabBarIcon: ({ color }) => <QuranIcon color={color} size={24}  />,
        }}
      />
     
      <Tabs.Screen
        name="hadith"
        options={{
          title: 'Hadith',
          tabBarIcon: ({ color }) => <HadithIcon color={color} size={24}  />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <LibraryIcon color={color} size={24}  />,
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: 'Prayer',
          tabBarIcon: ({ color }) => <MosqueIcon color={color} size={24}  />,
        }}
      />
    </Tabs>
  );
}