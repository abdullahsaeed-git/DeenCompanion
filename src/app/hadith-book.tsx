/**
 * Hadith Book Screen
 *
 * Displays all Books (sections) within a Hadith collection.
 * Route: /hadith-book?collectionId={id}
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, alpha } from '../constants/theme';
import { HadithCollection, HadithBook } from '../types/hadith';
import { hadithService } from '../services/hadithService';
import { HadithHeader } from '../components/hadith/HadithHeader';

function StatsCard({ collection }: { collection: HadithCollection | null }) {
  if (!collection) return null;
  return (
    <View style={styles.statsCard}>
      <View style={styles.statsIcon}>
        <Svg width={22} height={22} viewBox="0 0 20 20" fill="none" stroke={colors.primary} strokeWidth={1.7} strokeLinejoin="round">
          <Path d="M6 2.8h8.5A2.5 2.5 0 0 1 17 5.3v11.4a2.5 2.5 0 0 1-2.5 2.5H6a2 2 0 0 1-2-2V4.8a2 2 0 0 1 2-2Z" />
          <Path d="M7.5 7.5h5M7.5 10.5h5M7.5 13.5h3" strokeLinecap="round" />
        </Svg>
      </View>
      <View>
        <Text style={styles.statsTitle}>{collection.hadithCount.toLocaleString()} Hadiths</Text>
        <Text style={styles.statsSub}>{collection.languages.join(' · ')} · {collection.authorInfo}</Text>
      </View>
    </View>
  );
}

function BookCard({ book, onPress }: { book: HadithBook; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{book.number}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.bookName} numberOfLines={2}>
            {book.englishName}
          </Text>
          <Text style={styles.bookMeta}>{book.hadithCount} Hadiths</Text>
        </View>
        <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
          <Path
            d="M7.5 4.5 13 10l-5.5 5.5"
            stroke={alpha(colors.secondary, 0.35)}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </Pressable>
  );
}

export default function HadithBookScreen() {
  const insets = useSafeAreaInsets();
  const { collectionId } = useLocalSearchParams();
  const appCollectionId = (collectionId as string) || 'bukhari';

  const [collection, setCollection] = useState<HadithCollection | null>(null);
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [collData, booksData] = await Promise.all([
        hadithService.getCollection(appCollectionId),
        hadithService.getCollectionBooks(appCollectionId),
      ]);
      setCollection(collData);
      setBooks(booksData);
    } catch (err: any) {
      setError(err.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [appCollectionId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleBookPress(book: HadithBook) {
    router.push({
      pathname: '/hadith-chapter',
      params: { collectionId: appCollectionId, bookNumber: String(book.number) },
    });
  }

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
        <HadithHeader
          title={collection?.name || 'Loading…'}
          arabicTitle={collection?.arabicTitle}
          subtitle={collection?.authorInfo}
          titleSize={22}
        />

        <StatsCard collection={collection} />

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading books…</Text>
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && books.length === 0 && (
          <Text style={styles.emptyText}>No books found.</Text>
        )}

        {!error && books.length > 0 && (
          <View style={styles.list}>
            <Text style={styles.sectionLabel}>Books</Text>
            {books.map((book) => (
              <BookCard key={book.id} book={book} onPress={() => handleBookPress(book)} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  loadingText: { marginTop: 8, fontSize: 14, color: colors.textSecondary },
  errorText: { fontSize: 14, color: colors.error, textAlign: 'center', paddingHorizontal: 24 },
  retryButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: alpha(colors.primary, 0.09),
    borderRadius: 10,
  },
  retryText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  emptyText: { textAlign: 'center', paddingVertical: 40, fontSize: 15, color: colors.textSecondary },
  sectionLabel: {
    marginTop: 18,
    marginHorizontal: 2,
    marginBottom: 8,
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },
  list: { gap: 12 },
  statsCard: {
    marginTop: 16,
    backgroundColor: alpha(colors.primary, 0.06),
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.22),
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: alpha(colors.primary, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTitle: { fontSize: 14.5, fontWeight: '600', color: colors.primary },
  statsSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 16,
    shadowColor: alpha(colors.secondary, 0.04),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: { transform: [{ scale: 0.98 }], backgroundColor: colors.pressedBg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  cardBody: { flex: 1, minWidth: 0 },
  bookName: { fontSize: 14.5, fontWeight: '600', color: colors.secondary, lineHeight: 20 },
  bookMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});