import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, type } from '../theme';
import { news } from '../data/content';
import { NewsCard } from '../components/cards';
import { EmptyState } from '../components/common';

export default function NewsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return news;
    return news.filter(
      (n) => n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.head}>
        <Text style={styles.title}>Berita</Text>
        <Text style={styles.caption}>Kabar terbaru dari Dispora DKI Jakarta.</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={17} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cari berita..."
          placeholderTextColor={colors.textFaint}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={17} color={colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NewsCard
            item={item}
            onPress={() => navigation.navigate('NewsDetail', { article: item })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="newspaper-outline"
            title="Berita tidak ditemukan"
            hint="Coba kata kunci lain."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  head: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: { ...type.display, fontSize: 28 },
  caption: { ...type.body, marginTop: spacing.xs },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 46,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, padding: 0 },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
});
