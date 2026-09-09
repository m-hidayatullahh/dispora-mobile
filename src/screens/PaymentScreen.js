import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, useThemedStyles, spacing, radius } from '../theme';
import { useI18n } from '../i18n/i18n';
import { useAuth } from '../context/AuthContext';
import {
  PAYMENT_METHODS,
  createCharge,
  checkStatus,
  formatRupiah,
  formatCountdown,
} from '../api/payment';
import { PrimaryButton, Notice, Divider, Tag } from '../components/common';

export default function PaymentScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const s = useThemedStyles(makeStyles);
  const { user, isLoggedIn } = useAuth();

  const order = route.params?.order || {
    item: 'Sewa fasilitas olahraga',
    amount: 150000,
    detail: '-',
  };

  const [methodId, setMethodId] = useState(PAYMENT_METHODS[0].id);
  const [charge, setCharge] = useState(null);
  const [creating, setCreating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [now, setNow] = useState(Date.now());
  const timer = useRef(null);

  useEffect(() => {
    if (!charge || charge.status === 'PAID') return undefined;
    timer.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer.current);
  }, [charge]);

  const method = PAYMENT_METHODS.find((m) => m.id === methodId);
  const total = order.amount + (method?.fee || 0);

  const start = async () => {
    if (!isLoggedIn) {
      Alert.alert(t('pay.title'), t('pay.needLogin'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('more.login'), onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    setCreating(true);
    try {
      const c = await createCharge({
        methodId,
        amount: order.amount,
        item: order.item,
        customer: user,
      });
      setCharge(c);
    } finally {
      setCreating(false);
    }
  };

  const verify = async () => {
    if (!charge) return;
    setChecking(true);
    try {
      const updated = await checkStatus(charge.orderId);
      setCharge({ ...updated });
    } catch (e) {
      // biarkan status tetap
    } finally {
      setChecking(false);
    }
  };

  // Layar sukses
  if (charge?.status === 'PAID') {
    return (
      <ScrollView style={s.screen} contentContainerStyle={s.content}>
        <View style={s.successIcon}>
          <Ionicons name="checkmark" size={38} color={colors.onPrimary} />
        </View>
        <Text style={s.successTitle}>{t('pay.successTitle')}</Text>
        <Text style={s.successMsg}>{t('pay.successMsg')}</Text>

        <View style={s.card}>
          <Row label="Order ID" value={charge.orderId} />
          <Divider />
          <Row label={t('pay.item')} value={charge.item} />
          <Divider />
          <Row label={t('pay.amount')} value={formatRupiah(charge.total)} strong />
        </View>

        <Notice text={t('pay.simulation')} tone="gold" icon="flask-outline" />

        <PrimaryButton
          label={t('pay.done')}
          onPress={() => navigation.popToTop()}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    );
  }

  // Layar instruksi pembayaran
  if (charge) {
    const remaining = charge.expiredAt - now;
    const expired = remaining <= 0;

    return (
      <ScrollView style={s.screen} contentContainerStyle={s.content}>
        <Notice text={t('pay.simulation')} tone="gold" icon="flask-outline" />

        <View style={s.vaCard}>
          <Text style={s.vaLabel}>{t('pay.vaNumber')}</Text>
          <Text style={s.vaNumber}>{charge.vaNumber}</Text>
          <View style={s.vaBankRow}>
            <View style={s.bankBadge}>
              <Text style={s.bankBadgeText}>Bank DKI</Text>
            </View>
            <Tag label={expired ? 'EXPIRED' : t('pay.pendingMsg')} tone={expired ? 'neutral' : 'gold'} />
          </View>
        </View>

        <View style={s.card}>
          <Row label={t('pay.item')} value={charge.item} />
          <Divider />
          <Row label="Order ID" value={charge.orderId} />
          <Divider />
          <Row label={t('pay.amount')} value={formatRupiah(charge.total)} strong />
          <Divider />
          <Row
            label={t('pay.expiry')}
            value={expired ? '00:00' : formatCountdown(remaining)}
            strong
          />
        </View>

        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>Cara bayar</Text>
          {[
            'Buka aplikasi JakOne Mobile atau ATM Bank DKI.',
            'Pilih menu Transfer, lalu Virtual Account.',
            `Masukkan nomor ${charge.vaNumber}.`,
            `Pastikan nominal ${formatRupiah(charge.total)} lalu konfirmasi.`,
          ].map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <PrimaryButton
          label={checking ? t('pay.checking') : t('pay.checkStatus')}
          loading={checking}
          onPress={verify}
          disabled={expired}
        />
        <PrimaryButton
          label={t('common.cancel')}
          variant="ghost"
          onPress={() => setCharge(null)}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    );
  }

  // Layar pilih metode
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Notice text={t('pay.simulation')} tone="gold" icon="flask-outline" />

      <Text style={s.sectionLabel}>{t('pay.item')}</Text>
      <View style={s.card}>
        <Row label={order.item} value={formatRupiah(order.amount)} />
        {order.detail && order.detail !== '-' ? (
          <>
            <Divider />
            <Row label="Keterangan" value={order.detail} />
          </>
        ) : null}
      </View>

      <Text style={s.sectionLabel}>{t('pay.method')}</Text>
      <View style={s.methods}>
        {PAYMENT_METHODS.map((m) => {
          const active = m.id === methodId;
          return (
            <Pressable
              key={m.id}
              onPress={() => setMethodId(m.id)}
              style={[s.method, active && s.methodActive]}
            >
              <View style={[s.methodIcon, active && s.methodIconActive]}>
                <Ionicons
                  name={m.icon}
                  size={18}
                  color={active ? colors.onPrimary : colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.methodLabel}>{t(m.labelKey)}</Text>
                <Text style={s.methodFee}>
                  {m.fee > 0 ? `Biaya layanan ${formatRupiah(m.fee)}` : 'Tanpa biaya layanan'}
                </Text>
              </View>
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={19}
                color={active ? colors.primary : colors.textFaint}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={s.totalRow}>
        <Text style={s.totalLabel}>{t('pay.amount')}</Text>
        <Text style={s.totalValue}>{formatRupiah(total)}</Text>
      </View>

      <PrimaryButton
        label={t('pay.pay')}
        icon="arrow-forward"
        loading={creating}
        onPress={start}
      />
    </ScrollView>
  );
}

function Row({ label, value, strong }) {
  const s = useThemedStyles(makeStyles);
  return (
    <View style={s.row}>
      <Text style={s.rowLabel} numberOfLines={2}>
        {label}
      </Text>
      <Text style={[s.rowValue, strong && s.rowValueStrong]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (c, t) => ({
  screen: { flex: 1, backgroundColor: c.base },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.md },

  sectionLabel: { ...t.eyebrow, color: c.textFaint, marginTop: spacing.md },

  card: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowLabel: { ...t.body, fontSize: 13, flex: 1 },
  rowValue: { ...t.subtitle, fontSize: 14, textAlign: 'right', flexShrink: 0, maxWidth: '55%' },
  rowValueStrong: { color: c.primary, fontWeight: '900' },

  methods: { gap: spacing.sm },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
  },
  methodActive: { borderColor: c.primary },
  methodIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconActive: { backgroundColor: c.primary },
  methodLabel: { ...t.subtitle, fontSize: 14 },
  methodFee: { ...t.small, fontSize: 11 },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  totalLabel: { ...t.body, fontSize: 13 },
  totalValue: { color: c.text, fontSize: 22, fontWeight: '900' },

  vaCard: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.primary,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  vaLabel: { ...t.small, fontSize: 11 },
  vaNumber: { color: c.text, fontSize: 26, fontWeight: '900', letterSpacing: 2 },
  vaBankRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  bankBadge: {
    backgroundColor: c.blueSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  bankBadgeText: { color: c.blue, fontSize: 11, fontWeight: '900' },

  stepsCard: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  stepsTitle: { ...t.subtitle, fontSize: 14 },
  stepRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: c.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: c.primary, fontSize: 11, fontWeight: '900' },
  stepText: { ...t.body, flex: 1, fontSize: 13 },

  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: c.success,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  successTitle: { ...t.title, fontSize: 22, textAlign: 'center', marginTop: spacing.md },
  successMsg: { ...t.body, textAlign: 'center', marginBottom: spacing.md },
});
