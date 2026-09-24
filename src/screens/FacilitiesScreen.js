import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, useThemedStyles, spacing, radius } from '../theme';
import { useI18n } from '../i18n/i18n';
import { facilityList, facilityAreas, formatRupiah } from '../data/facilities';
import { EmptyState } from '../components/common';
import { BrandHeader } from '../components/Logo';
import { FadeInUp, PressableScale, stagger } from '../components/anim';
import SmartImage from '../components/SmartImage';

export default function FacilitiesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const s = useThemedStyles(makeStyles);

  const [query, setQuery] = useState('');
  const [area, setArea] = useState('Semua');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return facilityList.filter((f) => {
      const matchArea = area === 'Semua' || f.area === area;
      const matchQuery =
        !q || f.name.toLowerCase().includes(q) || f.sport.toLowerCase().includes(q);
      return matchArea && matchQuery;
    });
  }, [query, area]);

  const open = (item) => navigation.navigate('FacilityDetail', { facilityId: item.id });

  // Search dan chip dipasang sebagai header daftar supaya tidak pernah
  // terpotong oleh FlatList dan ikut ter-scroll.
  const header = (
    <View style={s.headerWrap}>
      <BrandHeader size={34} subtitle={t('tab.facilities')} />
      <Text style={s.title}>{t('facilities.title')}</Text>
      <Text style={s.caption}>{t('facilities.caption')}</Text>
      <View style={s.regionPill}>
        <Ionicons name="location" size={12} color={colors.primary} />
        <Text style={s.regionText}>Jakarta Barat</Text>
      </View>

      <View style={s.searchBox}>
        <Ionicons name="search" size={17} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('facilities.searchPlaceholder')}
          placeholderTextColor={colors.textFaint}
          style={s.searchInput}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={17} color={colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      <View style={s.chipsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chips}
        >
          {facilityAreas.map((a) => {
            const active = a === area;
            return (
              <Pressable
                key={a}
                onPress={() => setArea(a)}
                style={[s.chip, active && s.chipActive]}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {a === 'Semua' ? t('common.all') : a}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Text style={s.resultCount}>
        {filtered.length} {lang === 'en' ? 'facilities' : 'fasilitas'}
      </Text>
    </View>
  );

  const renderCard = ({ item, index }) => (
    <FadeInUp delay={stagger(index)}>
      <PressableScale onPress={() => open(item)} style={s.card}>
        <View style={s.media}>
          <SmartImage
            uri={item.image}
            style={s.image}
            icon="business-outline"
            label={item.name}
            showLoader={false}
          />
          <LinearGradient
            colors={['rgba(11,12,16,0.25)', 'transparent', 'rgba(11,12,16,0.8)']}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
          <View style={s.badgeRow}>
            <View style={s.categoryBadge}>
              <Text style={s.categoryText}>{item.category}</Text>
            </View>
            {item.ebooking ? (
              <View style={s.ebookingBadge}>
                <View style={s.ebookingDot} />
                <Text style={s.ebookingText}>E-BOOKING</Text>
              </View>
            ) : null}
          </View>
          <View style={s.mediaBody}>
            <Text style={s.cardName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={s.addrRow}>
              <Ionicons name="location" size={11} color="#D5D9E4" />
              <Text style={s.addrText} numberOfLines={1}>
                {item.area}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.cardBody}>
          <View style={s.metaGrid}>
            <View style={s.metaItem}>
              <Ionicons name="time-outline" size={13} color={colors.textFaint} />
              <Text style={s.metaText}>{item.operationalHours}</Text>
            </View>
            <View style={s.metaItem}>
              <Ionicons name="grid-outline" size={13} color={colors.textFaint} />
              <Text style={s.metaText}>
                {item.subCount} {lang === 'en' ? 'arenas' : 'arena'}
              </Text>
            </View>
            <View style={s.metaItem}>
              <Ionicons name="football-outline" size={13} color={colors.textFaint} />
              <Text style={s.metaText}>{item.sport}</Text>
            </View>
            {item.rating ? (
              <View style={s.metaItem}>
                <Ionicons name="star" size={13} color={colors.gold} />
                <Text style={s.metaText}>
                  {item.rating} {lang === 'en' ? 'on Google Maps' : 'di Google Maps'}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={s.cardFooter}>
            <View>
              <Text style={s.priceLabel}>{lang === 'en' ? 'From' : 'Mulai'}</Text>
              <Text style={s.priceValue}>{formatRupiah(item.priceFrom)}</Text>
            </View>
            <View style={s.detailButton}>
              <Text style={s.detailButtonText}>{lang === 'en' ? 'Detail' : 'Lihat detail'}</Text>
              <Ionicons name="arrow-forward" size={13} color={colors.onPrimary} />
            </View>
          </View>
        </View>
      </PressableScale>
    </FadeInUp>
  );

  return (
    <View style={[s.screen, { paddingTop: insets.top + spacing.sm }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        showsVerticalScrollIndicator={false}
        renderItem={renderCard}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState title={t('facilities.empty')} hint={t('facilities.emptyHint')} />
        }
      />
    </View>
  );
}

const makeStyles = (c, t) => ({
  screen: { flex: 1, backgroundColor: c.base },

  headerWrap: { gap: spacing.sm, marginBottom: spacing.lg },
  title: { ...t.display, fontSize: 28, marginTop: spacing.sm },
  caption: { ...t.body },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 46,
    backgroundColor: c.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.line,
    marginTop: spacing.sm,
  },
  searchInput: { flex: 1, color: c.text, fontSize: 14, padding: 0 },

  // Tinggi dikunci supaya baris chip tidak ikut mengecil.
  chipsRow: { height: 38, marginTop: spacing.xs },
  chips: { gap: spacing.sm, alignItems: 'center' },
  chip: {
    paddingHorizontal: spacing.md,
    height: 34,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
  },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { color: c.textMuted, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: c.onPrimary },

  resultCount: { ...t.small, fontSize: 11, marginTop: spacing.xs },
  regionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: c.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  regionText: { color: c.primary, fontSize: 11, fontWeight: '800' },

  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl * 2 },

  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    overflow: 'hidden',
  },
  media: { height: 168, backgroundColor: c.surfaceAlt, justifyContent: 'flex-end' },
  image: { position: 'absolute', width: '100%', height: '100%' },
  badgeRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  categoryBadge: {
    backgroundColor: c.primary,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  categoryText: { color: c.onPrimary, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  ebookingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(11,12,16,0.72)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  ebookingDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  ebookingText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: 0.6 },

  mediaBody: { padding: spacing.lg, gap: 4 },
  cardName: { fontSize: 19, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.4 },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addrText: { fontSize: 11, color: '#D5D9E4', flex: 1 },

  cardBody: { padding: spacing.lg, gap: spacing.md },
  metaGrid: { gap: 7 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metaText: { ...t.small, fontSize: 12, flex: 1 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingTop: spacing.md,
  },
  priceLabel: { ...t.small, fontSize: 10 },
  priceValue: { color: c.gold, fontSize: 16, fontWeight: '900' },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  detailButtonText: { color: c.onPrimary, fontSize: 12, fontWeight: '800' },
});