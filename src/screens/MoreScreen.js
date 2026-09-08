import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, type } from '../theme';
import { quickLinks, contact } from '../data/content';
import { Divider } from '../components/common';

export default function MoreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.sm }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Lainnya</Text>
      <Text style={styles.caption}>Layanan, informasi publik, dan kontak resmi.</Text>

      <View style={styles.grid}>
        {quickLinks.map((l) => (
          <Pressable
            key={l.id}
            style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}
            onPress={() => {}}
          >
            <View style={styles.tileIcon}>
              <Ionicons name={l.icon} size={19} color={colors.primary} />
            </View>
            <Text style={styles.tileLabel}>{l.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Kontak</Text>
      <View style={styles.card}>
        <Text style={styles.office}>{contact.office}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color={colors.textFaint} />
          <Text style={styles.rowText}>{contact.address}</Text>
        </View>
        <Pressable
          style={styles.row}
          onPress={() => Linking.openURL(`mailto:${contact.email}`)}
        >
          <Ionicons name="mail-outline" size={16} color={colors.textFaint} />
          <Text style={[styles.rowText, styles.link]}>{contact.email}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>Media sosial</Text>
      <View style={styles.card}>
        {contact.socials.map((s, i) => (
          <View key={s.id}>
            <View style={styles.socialRow}>
              <Ionicons name={s.icon} size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.socialPlatform}>{s.platform}</Text>
                <Text style={styles.socialHandle}>{s.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color={colors.textFaint} />
            </View>
            {i < contact.socials.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </View>

      <Text style={styles.footer}>Demo aplikasi · Data contoh, bukan data resmi</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl * 2 },
  title: { ...type.display, fontSize: 28 },
  caption: { ...type.body, marginTop: spacing.xs },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  tile: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { ...type.subtitle, fontSize: 14 },
  sectionLabel: {
    ...type.eyebrow,
    color: colors.textFaint,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  office: { ...type.subtitle, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  rowText: { ...type.body, flex: 1, fontSize: 13 },
  link: { color: colors.gold, fontWeight: '700' },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  socialPlatform: { ...type.subtitle, fontSize: 14 },
  socialHandle: { ...type.small },
  footer: { ...type.small, textAlign: 'center', marginTop: spacing.xxl },
});
