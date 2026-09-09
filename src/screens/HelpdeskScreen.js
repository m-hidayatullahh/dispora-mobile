import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, useThemedStyles, spacing, radius } from '../theme';
import { useI18n } from '../i18n/i18n';
import { fetchHelpdeskTickets } from '../api/dispora';
import { TicketCard } from '../components/cards';
import { EmptyState, Loader, Notice, PrimaryButton } from '../components/common';

// Dipakai kalau endpoint admin menolak akses.
const SAMPLE_TICKETS = [
  {
    id: 1042,
    ticketNumber: 'HD-2026-1042',
    subject: 'Kendala login akun POPB',
    message: 'Sudah daftar tapi tidak bisa masuk, muncul pesan email belum terverifikasi.',
    name: 'Andi Pratama',
    status: 'OPEN',
    createdAt: '2026-09-05T08:12:00.000Z',
  },
  {
    id: 1041,
    ticketNumber: 'HD-2026-1041',
    subject: 'Permohonan peralatan olahraga lewat Sidasi',
    message: 'Ingin menanyakan status pengajuan bola voli untuk klub di Jakarta Barat.',
    name: 'Klub Voli Kembangan',
    status: 'IN_PROGRESS',
    createdAt: '2026-09-04T02:40:00.000Z',
  },
  {
    id: 1039,
    ticketNumber: 'HD-2026-1039',
    subject: 'Jadwal pemakaian GOR Ciracas',
    message: 'Apakah slot akhir pekan masih tersedia untuk bulan depan?',
    name: 'Rina Kusuma',
    status: 'CLOSED',
    createdAt: '2026-09-01T11:05:00.000Z',
  },
];

const FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'];

export default function HelpdeskScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useI18n();
  const s = useThemedStyles(makeStyles);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingSample, setUsingSample] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(async () => {
    try {
      const data = await fetchHelpdeskTickets();
      setTickets(data);
      setUsingSample(false);
    } catch (e) {
      // 401/403 atau HTML login page — pakai contoh supaya demo tetap jalan
      setTickets(SAMPLE_TICKETS);
      setUsingSample(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    filter === 'ALL'
      ? tickets
      : tickets.filter((x) => String(x.status || '').toUpperCase().includes(filter));

  const labelFor = (f) => {
    if (f === 'ALL') return t('common.all');
    if (f === 'OPEN') return t('helpdesk.open');
    if (f === 'IN_PROGRESS') return t('helpdesk.pending');
    return t('helpdesk.closed');
  };

  if (loading) return <Loader label={t('common.loading')} />;

  return (
    <View style={s.screen}>
      <View style={s.head}>
        <Text style={s.caption}>{t('helpdesk.caption')}</Text>
        {usingSample ? (
          <Notice text={t('helpdesk.authError')} tone="gold" icon="lock-closed-outline" />
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chips}
        style={s.chipsWrap}
      >
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[s.chip, active && s.chipActive]}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>{labelFor(f)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => String(item.id ?? item.ticketNumber ?? i)}
        contentContainerStyle={[s.list, { paddingBottom: insets.bottom + spacing.xxl }]}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <TicketCard item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="ticket-outline"
            title={t('helpdesk.empty')}
            action={<PrimaryButton label={t('common.retry')} variant="ghost" onPress={load} />}
          />
        }
      />
    </View>
  );
}

const makeStyles = (c, t) => ({
  screen: { flex: 1, backgroundColor: c.base },
  head: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.md },
  caption: { ...t.body },
  chipsWrap: { flexGrow: 0 },
  chips: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
  },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { color: c.textMuted, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: c.onPrimary },
  list: { padding: spacing.lg },
});
