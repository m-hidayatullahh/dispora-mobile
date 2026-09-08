import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, type } from '../theme';
import { Tag, PrimaryButton, Divider } from '../components/common';

export default function EventDetailScreen({ route }) {
  const { event } = route.params;
  const isOpen = event.status === 'Pendaftaran dibuka';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.tags}>
        <Tag label={event.category} tone="gold" />
        <Tag label={event.status} tone={isOpen ? 'primary' : 'neutral'} />
      </View>

      <Text style={styles.title}>{event.title}</Text>

      <View style={styles.infoCard}>
        <Row icon="calendar-outline" label="Tanggal" value={event.date} />
        <Divider style={styles.rowDivider} />
        <Row icon="location-outline" label="Lokasi" value={event.location} />
        <Divider style={styles.rowDivider} />
        <Row icon="pricetag-outline" label="Kategori" value={event.category} />
      </View>

      <Text style={styles.sectionLabel}>Tentang kegiatan</Text>
      <Text style={styles.body}>{event.description}</Text>

      <PrimaryButton
        label={isOpen ? 'Daftar sekarang' : 'Lihat dokumentasi'}
        icon="arrow-forward"
        onPress={() => {}}
        style={styles.cta}
      />
    </ScrollView>
  );
}

function Row({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={17} color={colors.primary} />
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  tags: { flexDirection: 'row', gap: spacing.sm },
  title: { ...type.display, fontSize: 25, lineHeight: 31, marginTop: spacing.md },
  infoCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: { ...type.small, fontSize: 11 },
  rowValue: { ...type.subtitle, fontSize: 14, fontWeight: '600' },
  rowDivider: { marginLeft: 0 },
  sectionLabel: {
    ...type.eyebrow,
    color: colors.textFaint,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  body: { ...type.body, fontSize: 14, lineHeight: 22 },
  cta: { marginTop: spacing.xl },
});
