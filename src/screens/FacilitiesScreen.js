import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, type } from '../theme';
import { facilities, facilityAreas } from '../data/content';
import { FacilityCard } from '../components/cards';
import { EmptyState } from '../components/common';

export default function FacilitiesScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('Semua');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return facilities.filter((f) => {
      const matchArea = area === 'Semua' || f.area === area;
      const matchQuery =
        !q || f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q);
      return matchArea && matchQuery;
    });
  }, [query, area]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.head}>
        <Text style={styles.title}>Fasilitas</Text>
        <Text style={styles.caption}>
          {filtered.length} fasilitas olahraga milik Dispora siap dipesan.
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={17} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cari fasilitas..."
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsWrap}
      >
        {facilityAreas.map((a) => {
          const active = a === area;
          return (
            <Pressable
              key={a}
              onPress={() => setArea(a)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{a}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <FacilityCard item={item} onPress={() => {}} />}
        ListEmptyComponent={
          <EmptyState
            title="Fasilitas tidak ditemukan"
            hint="Coba kata kunci lain atau pilih wilayah yang berbeda."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.base,
  },
  head: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...type.display,
    fontSize: 28,
  },
  caption: {
    ...type.body,
    marginTop: spacing.xs,
  },
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
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    padding: 0,
  },
  chipsWrap: {
    flexGrow: 0,
    marginTop: spacing.md,
  },
  chips: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#fff',
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
});
