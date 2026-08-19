/**
 * Root Layout
 *
 * Stack navigator with routes:
 * 1. "splash"      — animated splash screen (entry point)
 * 2. "onboarding"   — 3-slide onboarding flow
 * 3. "(tabs)"       — main 5-tab application
 * 4. "quran-reader" — Quran reading screen (stack, hides tabs)
 * 5. "hadith-book"  — Hadith collection detail (paginated hadiths)
 * 6. "hadith-reader" — Single hadith detail
 * 7. "prayer-calendar" — Monthly prayer calendar
 * 8. "qibla-compass"   — Qibla direction compass
 * 9. "prayer-settings" — Prayer configuration settings
 *
 * Fonts are loaded here. The native splash stays visible until ready.
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  useFonts as usePoppinsFonts,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import {
  useFonts as useAmiriFonts,
  Amiri_400Regular,
} from '@expo-google-fonts/amiri';
import { colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded] = useInterFonts({
    'Inter': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  const [poppinsLoaded] = usePoppinsFonts({
    'Poppins': Poppins_600SemiBold,
    'Poppins-Medium': Poppins_500Medium,
  });

  const [amiriLoaded] = useAmiriFonts({
    'Amiri': Amiri_400Regular,
  });

  const fontsLoaded = interLoaded && poppinsLoaded && amiriLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
      initialRouteName="splash"
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="quran-reader" />
      <Stack.Screen name="hadith-book" />
      <Stack.Screen name="hadith-chapter" />
      <Stack.Screen name="hadith-reader" />
      <Stack.Screen name="prayer-calendar" />
      <Stack.Screen name="qibla-compass" />
      <Stack.Screen name="prayer-settings" />
      <Stack.Screen name="features" />
      <Stack.Screen name="dua-collection" />
      <Stack.Screen name="tasbih" />
      <Stack.Screen name="zakat-calculator" />
      <Stack.Screen name="islamic-calendar" />
      <Stack.Screen name="names-of-allah" />
      <Stack.Screen name="library-category" />
      <Stack.Screen name="book-reader" />
      <Stack.Screen name="bookmarks" />
      <Stack.Screen name="bookmarks/quran" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="about" />
    </Stack>
  );
}