import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, type } from '../theme';
import { events } from '../data/content';
import { EventCard } from '../components/cards';
import { EmptyState } from '../components/common';

const FILTERS = ['Semua', 'Pendaftaran dibuka', 'Akan datang', 'Selesai'];

export default function EventsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('Semua');

  const filtered = useMemo(
    () => (filter === 'Semua' ? events : events.filter((e) => e.status === filter)),
    [filter]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.head}>
        <Text style={styles.title}>Acara</Text>
        <Text style={styles.caption}>
          Jadwal kegiatan, kejuaraan, dan pelatihan yang dikelola Dispora DKI Jakarta.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsWrap}
      >
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <EventCard
            item={item}
            wide
            onPress={() => navigation.navigate('EventDetail', { event: item })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="Belum ada acara di kategori ini"
            hint="Pilih kategori lain untuk melihat jadwal yang tersedia."
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
  chipsWrap: { flexGrow: 0 },
  chips: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
});
