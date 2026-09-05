/**
 * Hadith Screen (Tab)
 *
 * The main Hadith browsing screen showing:
 * - Header with title and action buttons
 * - Featured collection card
 * - 2-column grid of other collections
 *
 * Now uses Sunnah.com API for real Hadith data.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, alpha } from '../../constants/theme';
import { HadithCollection } from '../../types/hadith';
import { hadithService } from '../../services/hadithService';
import { FeaturedCollection } from '../../components/hadith/FeaturedCollection';
import { CollectionCard } from '../../components/hadith/CollectionCard';
import { BookmarkIcon, SearchIcon } from '@/components/Icons';

export default function HadithScreen() {
  const insets = useSafeAreaInsets();
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    hadithService
      .getCollections()
      .then((data) => {
        if (!cancelled) {
          setCollections(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load Hadith collections');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  function handleRetry() {
    setLoading(true);
    setError(null);
    hadithService
      .getCollections()
      .then(setCollections)
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }

  function handleCollectionPress(collection: HadithCollection) {
    router.push({
      pathname: '/hadith-book',
      params: { collectionId: collection.id },
    });
  }

  const featured = collections.find((c) => c.isFeatured);
  const others = collections.filter((c) => !c.isFeatured);

  return (
    <View style={styles.screen}>
      {/* ========== HEADER ========== */}
      <View style={[styles.header, { paddingTop:  16 }]}>
        <Text style={styles.title}>Hadith</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
             onPress={() => router.push({pathname : '/search' , params: {mode : 'hadith'}})}
          >
            <SearchIcon color={colors.secondary}/>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
              
            ]}
            onPress={() => router.push('/bookmarks/hadith')}
          >
           <BookmarkIcon/>
          </Pressable>
        </View>
      </View>

      {/* ========== SCROLLABLE CONTENT ========== */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 88 },
        ]}
        showsVerticalScrollIndicator={false}
      >

          {/* Search — hidden on Page tab */}
              {
                <Pressable
                  style={[styles.searchWrap]}
                   onPress={() => router.push({pathname : '/search' , params: {mode : 'hadith'}})}
                >
                  <SearchIcon />
                  <TextInput
                    style={styles.searchInput}
                    placeholder={"Search Hadiths"}
                    placeholderTextColor={colors.textMuted}
                    editable= {false}
                   
                  />
                </Pressable>
              }
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading Hadith collections…</Text>
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && featured && (
          <FeaturedCollection
            collection={featured}
            onPress={() => handleCollectionPress(featured)}
          />
        )}

        {!loading && !error && (
          <View style={styles.grid}>
            {others.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onPress={() => handleCollectionPress(collection)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    // paddingTop: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 24,
    letterSpacing: -0.01,
    color: colors.secondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  iconButtonPressed: {
    backgroundColor: colors.pressedBg,
  },

  searchWrap: {
    marginTop: 14,
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  searchWrapFocused: {
    borderColor: colors.primary,
    shadowColor: alpha(colors.primary, 0.12),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: colors.secondary,
    fontFamily: "Inter",
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: alpha(colors.primary, 0.09),
    borderRadius: 10,
  },
  retryText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});