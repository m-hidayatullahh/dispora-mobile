import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme, useThemedStyles, spacing, radius } from '../theme';
import { useI18n } from '../i18n/i18n';
import { listOrders, findOrder, checkStatus, formatRupiah } from '../api/payment';
import { EmptyState, Tag, PrimaryButton, Notice } from '../components/common';
import { FadeInUp, PressableScale, stagger } from '../components/anim';

const L = {
  id: {
    title: 'Transaksi Saya',
    caption: 'Riwayat pemesanan dan status pembayaran.',
    searchPlaceholder: 'Cari Order ID, misal DSP1758…',
    empty: 'Belum ada transaksi',
    emptyHint: 'Pemesanan yang kamu buat akan muncul di sini.',
    notFound: 'Order ID tidak ditemukan di perangkat ini.',
    refresh: 'Perbarui status',
    checking: 'Memeriksa...',
    paid: 'LUNAS',
    pending: 'MENUNGGU',
    expired: 'KEDALUWARSA',
    method: 'Metode',
    created: 'Dibuat',
    total: 'Total',
    localOnly: 'Riwayat disimpan di perangkat ini saja (mode demo).',
    methods: {
      qris: 'QRIS',
      va_bank_dki: 'VA Bank DKI',
      transfer_bank_dki: 'Transfer Bank DKI',
    },
  },
  en: {
    title: 'My Transactions',
    caption: 'Booking history and payment status.',
    searchPlaceholder: 'Search Order ID, e.g. DSP1758…',
    empty: 'No transactions yet',
    emptyHint: 'Bookings you create will show up here.',
    notFound: 'Order ID not found on this device.',
    refresh: 'Refresh status',
    checking: 'Checking...',
    paid: 'PAID',
    pending: 'PENDING',
    expired: 'EXPIRED',
    method: 'Method',
    created: 'Created',
    total: 'Total',
    localOnly: 'History is stored on this device only (demo mode).',
    methods: {
      qris: 'QRIS',
      va_bank_dki: 'Bank DKI VA',
      transfer_bank_dki: 'Bank DKI Transfer',
    },
  },
};

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { lang } = useI18n();
  const s = useThemedStyles(makeStyles);
  const tx = L[lang] || L.id;

  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [checkingId, setCheckingId] = useState(null);

  const load = useCallback(async () => {
    const data = await listOrders();
    setOrders(data);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onSearch = async () => {
    const q = query.trim();
    if (!q) {
      load();
      return;
    }
    const found = await findOrder(q);
    if (!found) {
      Alert.alert(tx.title, tx.notFound);
      return;
    }
    setOrders([found]);
  };

  const refreshOne = async (orderId) => {
    setCheckingId(orderId);
    try {
      await checkStatus(orderId);
      await load();
    } catch (e) {
      // biarkan
    } finally {
      setCheckingId(null);
    }
  };

  const statusInfo = (status) => {
    if (status === 'PAID') return { label: tx.paid, tone: 'success', icon: 'checkmark-circle' };
    if (status === 'EXPIRED') return { label: tx.expired, tone: 'neutral', icon: 'close-circle' };
    return { label: tx.pending, tone: 'gold', icon: 'time' };
  };

  const header = (
    <View style={s.headerWrap}>
      <Text style={s.title}>{tx.title}</Text>
      <Text style={s.caption}>{tx.caption}</Text>

      <View style={s.searchBox}>
        <Ionicons name="search" size={17} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={tx.searchPlaceholder}
          placeholderTextColor={colors.textFaint}
          style={s.searchInput}
          autoCapitalize="characters"
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        {query ? (
          <Pressable
            onPress={() => {
              setQuery('');
              load();
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={17} color={colors.textFaint} />
          </Pressable>
        ) : null}
      </View>

      <Notice text={tx.localOnly} tone="gold" icon="phone-portrait-outline" />
    </View>
  );

  return (
    <View style={s.screen}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.orderId}
        ListHeaderComponent={header}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
        renderItem={({ item, index }) => {
          const st = statusInfo(item.status);
          const busy = checkingId === item.orderId;
          return (
            <FadeInUp delay={stagger(index)}>
              <View style={s.card}>
                <View style={s.cardTop}>
                  <Text style={s.orderId}>{item.orderId}</Text>
                  <Tag label={st.label} tone={st.tone} />
                </View>

                <Text style={s.item} numberOfLines={2}>
                  {item.item}
                </Text>

                <View style={s.metaRow}>
                  <Ionicons name="card-outline" size={13} color={colors.textFaint} />
                  <Text style={s.metaText}>
                    {tx.method}: {tx.methods[item.methodId] || item.methodId}
                  </Text>
                </View>
                <View style={s.metaRow}>
                  <Ionicons name="time-outline" size={13} color={colors.textFaint} />
                  <Text style={s.metaText}>
                    {tx.created}: {new Date(item.createdAt).toLocaleString(
                      lang === 'en' ? 'en-GB' : 'id-ID'
                    )}
                  </Text>
                </View>

                <View style={s.cardFooter}>
                  <View>
                    <Text style={s.totalLabel}>{tx.total}</Text>
                    <Text style={s.totalValue}>{formatRupiah(item.total)}</Text>
                  </View>

                  {item.status === 'PENDING' ? (
                    <PressableScale
                      onPress={() => refreshOne(item.orderId)}
                      style={s.refreshButton}
                      scaleTo={0.94}
                    >
                      <Ionicons name="refresh" size={13} color={colors.onPrimary} />
                      <Text style={s.refreshText}>{busy ? tx.checking : tx.refresh}</Text>
                    </PressableScale>
                  ) : (
                    <View style={[s.statusPill, item.status === 'PAID' && s.statusPillPaid]}>
                      <Ionicons
                        name={st.icon}
                        size={14}
                        color={item.status === 'PAID' ? colors.success : colors.textFaint}
                      />
                      <Text
                        style={[
                          s.statusPillText,
                          item.status === 'PAID' && { color: colors.success },
                        ]}
                      >
                        {st.label}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </FadeInUp>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="receipt-outline" title={tx.empty} hint={tx.emptyHint} />
        }
      />
    </View>
  );
}

const makeStyles = (c, t) => ({
  screen: { flex: 1, backgroundColor: c.base },
  headerWrap: { gap: spacing.md, marginBottom: spacing.lg },
  title: { ...t.display, fontSize: 28 },
  caption: { ...t.body, marginTop: -spacing.sm },
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
  },
  searchInput: { flex: 1, color: c.text, fontSize: 14, padding: 0 },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },

  card: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    gap: 6,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderId: { color: c.primary, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  item: { ...t.subtitle, fontSize: 15, lineHeight: 21, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { ...t.small, flex: 1 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  totalLabel: { ...t.small, fontSize: 10 },
  totalValue: { color: c.text, fontSize: 17, fontWeight: '900' },

  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  refreshText: { color: c.onPrimary, fontSize: 12, fontWeight: '800' },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: c.surfaceAlt,
  },
  statusPillPaid: { backgroundColor: c.successSoft },
  statusPillText: { color: c.textFaint, fontSize: 12, fontWeight: '800' },
});