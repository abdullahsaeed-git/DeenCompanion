/**
 * Hadith Subchapter Screen — DEPRECATED
 *
 * This screen is no longer used in the new navigation flow.
 * It redirects to the collection detail screen (hadith-book).
 */

import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../constants/theme';

export default function HadithSubchapterScreen() {
  const { collectionId } = useLocalSearchParams();

  useEffect(() => {
    // Redirect to the new collection detail screen
    router.replace({
      pathname: '/hadith-book',
      params: { collectionId: (collectionId as string) || 'bukhari' },
    });
  }, [collectionId]);

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});