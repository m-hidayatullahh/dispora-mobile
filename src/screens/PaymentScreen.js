import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Clipboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

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
import { FadeInUp, PressableScale } from '../components/anim';

const STEPS = {
  qris: [
    'Buka aplikasi bank atau e-wallet yang mendukung QRIS.',
    'Pilih menu Scan / Bayar QRIS.',
    'Arahkan kamera ke kode QR di atas.',
    'Periksa nama merchant dan nominalnya, lalu konfirmasi.',
  ],
  va_bank_dki: [
    'Buka JakOne Mobile atau ATM Bank DKI.',
    'Pilih menu Transfer, lalu Virtual Account.',
    'Masukkan nomor Virtual Account di atas.',
    'Periksa nominalnya, lalu konfirmasi.',
  ],
  transfer_bank_dki: [
    'Transfer ke rekening Bank DKI di atas.',
    'Pastikan nominalnya tepat sampai tiga digit terakhir.',
    'Digit unik dipakai untuk mencocokkan transfer kamu.',
    'Simpan bukti transfer, verifikasi maksimal 1x24 jam.',
  ],
};

export default function PaymentScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const { t, lang } = useI18n();
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
  const [copied, setCopied] = useState(null);
  const [now, setNow] = useState(Date.now());
  const timer = useRef(null);

  useEffect(() => {
    if (!charge || charge.status !== 'PENDING') return undefined;
    timer.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer.current);
  }, [charge]);

  const method = PAYMENT_METHODS.find((m) => m.id === methodId);
  const total = order.amount + (method?.fee || 0);

  const copy = (value, key) => {
    Clipboard.setString(String(value));
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  };

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

  // ---------- Sukses ----------
  if (charge?.status === 'PAID') {
    return (
      <ScrollView style={s.screen} contentContainerStyle={s.content}>
        <FadeInUp>
          <View style={s.successIcon}>
            <Ionicons name="checkmark" size={38} color="#FFFFFF" />
          </View>
          <Text style={s.successTitle}>{t('pay.successTitle')}</Text>
          <Text style={s.successMsg}>{t('pay.successMsg')}</Text>
        </FadeInUp>

        <View style={s.card}>
          <Row s={s} label="Order ID" value={charge.orderId} />
          <Divider />
          <Row s={s} label={t('pay.item')} value={charge.item} />
          <Divider />
          <Row s={s} label={t('pay.method')} value={t(method?.labelKey || 'pay.qris')} />
          <Divider />
          <Row s={s} label={t('pay.amount')} value={formatRupiah(charge.total)} strong />
        </View>

        <Notice text={t('pay.simulation')} tone="gold" icon="flask-outline" />

        <PrimaryButton
          label={lang === 'en' ? 'View my transactions' : 'Lihat transaksi saya'}
          icon="receipt-outline"
          variant="ghost"
          onPress={() => navigation.replace('Transactions')}
          style={{ marginTop: spacing.md }}
        />
        <PrimaryButton
          label={t('pay.done')}
          onPress={() => navigation.popToTop()}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    );
  }

  // ---------- Instruksi pembayaran ----------
  if (charge) {
    const remaining = charge.expiredAt - now;
    const expired = charge.status === 'EXPIRED' || remaining <= 0;
    const steps = STEPS[charge.methodId] || STEPS.qris;

    return (
      <ScrollView style={s.screen} contentContainerStyle={s.content}>
        <Notice text={t('pay.simulation')} tone="gold" icon="flask-outline" />

        {/* QRIS */}
        {charge.methodId === 'qris' ? (
          <FadeInUp>
            <View style={s.qrisCard}>
              <View style={s.qrisHead}>
                <Text style={s.qrisBrand}>QRIS</Text>
                <Text style={s.qrisSub}>{charge.merchantName}</Text>
                <Text style={s.qrisNmid}>NMID {charge.nmid}</Text>
              </View>

              <View style={s.qrBox}>
                <QRCode
                  value={charge.qrPayload}
                  size={208}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                />
              </View>

              <Text style={s.qrisAmount}>{formatRupiah(charge.total)}</Text>
              <Text style={s.qrisNote}>
                {lang === 'en'
                  ? 'Demo QR — not readable by real banking apps'
                  : 'QR demo — tidak terbaca oleh aplikasi bank sungguhan'}
              </Text>
            </View>
          </FadeInUp>
        ) : null}

        {/* Virtual Account */}
        {charge.methodId === 'va_bank_dki' ? (
          <FadeInUp>
            <View style={s.vaCard}>
              <View style={s.bankRow}>
                <View style={s.bankBadge}>
                  <Text style={s.bankBadgeText}>{charge.bank}</Text>
                </View>
                <Tag
                  label={expired ? 'EXPIRED' : t('pay.pendingMsg')}
                  tone={expired ? 'neutral' : 'gold'}
                />
              </View>
              <Text style={s.fieldLabel}>{t('pay.vaNumber')}</Text>
              <Text style={s.bigNumber}>{charge.vaNumber}</Text>
              <CopyButton
                s={s}
                colors={colors}
                copied={copied === 'va'}
                label={copied === 'va' ? t('pay.copied') : t('pay.copy')}
                onPress={() => copy(charge.vaNumber, 'va')}
              />
            </View>
          </FadeInUp>
        ) : null}

        {/* Transfer manual */}
        {charge.methodId === 'transfer_bank_dki' ? (
          <FadeInUp>
            <View style={s.vaCard}>
              <View style={s.bankRow}>
                <View style={s.bankBadge}>
                  <Text style={s.bankBadgeText}>{charge.bank}</Text>
                </View>
                <Tag
                  label={expired ? 'EXPIRED' : t('pay.pendingMsg')}
                  tone={expired ? 'neutral' : 'gold'}
                />
              </View>

              <Text style={s.fieldLabel}>
                {lang === 'en' ? 'ACCOUNT NUMBER' : 'NOMOR REKENING'}
              </Text>
              <Text style={s.bigNumber}>{charge.accountNumber}</Text>
              <CopyButton
                s={s}
                colors={colors}
                copied={copied === 'acc'}
                label={copied === 'acc' ? t('pay.copied') : t('pay.copy')}
                onPress={() => copy(charge.accountNumber, 'acc')}
              />

              <View style={s.accBox}>
                <Text style={s.fieldLabel}>
                  {lang === 'en' ? 'ACCOUNT NAME' : 'ATAS NAMA'}
                </Text>
                <Text style={s.accName}>{charge.accountName}</Text>
                <Text style={s.accBranch}>{charge.branch}</Text>
              </View>

              <View style={s.uniqueBox}>
                <Ionicons name="alert-circle-outline" size={15} color={colors.gold} />
                <Text style={s.uniqueText}>
                  {lang === 'en'
                    ? `Transfer the exact amount including the unique code ${charge.uniqueCode}.`
                    : `Transfer tepat sampai tiga digit terakhir. Kode unik: ${charge.uniqueCode}.`}
                </Text>
              </View>
            </View>
          </FadeInUp>
        ) : null}

        {/* Ringkasan */}
        <View style={s.card}>
          <Row s={s} label={t('pay.item')} value={charge.item} />
          <Divider />
          <Row s={s} label="Order ID" value={charge.orderId} />
          <Divider />
          <Row s={s} label={t('pay.amount')} value={formatRupiah(charge.total)} strong />
          <Divider />
          <Row
            s={s}
            label={t('pay.expiry')}
            value={expired ? '00:00' : formatCountdown(remaining)}
            strong
          />
        </View>

        {/* Cara bayar */}
        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>{lang === 'en' ? 'How to pay' : 'Cara bayar'}</Text>
          {steps.map((step, i) => (
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

  // ---------- Pilih metode ----------
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Notice text={t('pay.simulation')} tone="gold" icon="flask-outline" />

      <Text style={s.sectionLabel}>{t('pay.item')}</Text>
      <View style={s.card}>
        <Row s={s} label={order.item} value={formatRupiah(order.amount)} />
        {order.detail && order.detail !== '-' ? (
          <>
            <Divider />
            <Row s={s} label={lang === 'en' ? 'Note' : 'Keterangan'} value={order.detail} />
          </>
        ) : null}
      </View>

      <Text style={s.sectionLabel}>{t('pay.method')}</Text>
      <View style={s.methods}>
        {PAYMENT_METHODS.map((m, i) => {
          const active = m.id === methodId;
          return (
            <FadeInUp key={m.id} delay={i * 70}>
              <PressableScale onPress={() => setMethodId(m.id)} scaleTo={0.98}>
                <View style={[s.method, active && s.methodActive]}>
                  <View style={[s.methodIcon, active && s.methodIconActive]}>
                    <Ionicons
                      name={m.icon}
                      size={18}
                      color={active ? '#FFFFFF' : colors.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.methodLabel}>{t(m.labelKey)}</Text>
                    <Text style={s.methodHint}>{m.hint}</Text>
                    <Text style={s.methodFee}>
                      {m.fee > 0
                        ? `${lang === 'en' ? 'Service fee' : 'Biaya layanan'} ${formatRupiah(m.fee)}`
                        : lang === 'en'
                          ? 'No service fee'
                          : 'Tanpa biaya layanan'}
                    </Text>
                  </View>
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={19}
                    color={active ? colors.primary : colors.textFaint}
                  />
                </View>
              </PressableScale>
            </FadeInUp>
          );
        })}
      </View>

      <View style={s.totalRow}>
        <Text style={s.totalLabel}>{t('pay.amount')}</Text>
        <Text style={s.totalValue}>{formatRupiah(total)}</Text>
      </View>

      <PrimaryButton label={t('pay.pay')} icon="arrow-forward" loading={creating} onPress={start} />
    </ScrollView>
  );
}

function Row({ s, label, value, strong }) {
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

function CopyButton({ s, colors, onPress, label, copied }) {
  return (
    <PressableScale onPress={onPress} style={s.copyButton} scaleTo={0.94}>
      <Ionicons
        name={copied ? 'checkmark' : 'copy-outline'}
        size={14}
        color={copied ? colors.success : colors.primary}
      />
      <Text style={[s.copyText, copied && { color: colors.success }]}>{label}</Text>
    </PressableScale>
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
  methodActive: { borderColor: c.primary, borderWidth: 2 },
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
  methodHint: { ...t.small, fontSize: 11, marginTop: 1 },
  methodFee: { color: c.gold, fontSize: 11, fontWeight: '700', marginTop: 2 },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  totalLabel: { ...t.body, fontSize: 13 },
  totalValue: { color: c.text, fontSize: 22, fontWeight: '900' },

  // QRIS
  qrisCard: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  qrisHead: { alignItems: 'center', gap: 2 },
  qrisBrand: { color: c.primary, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  qrisSub: { ...t.subtitle, fontSize: 13 },
  qrisNmid: { ...t.small, fontSize: 10 },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  qrisAmount: { color: c.text, fontSize: 24, fontWeight: '900' },
  qrisNote: { ...t.small, fontSize: 10, textAlign: 'center' },

  // VA & transfer
  vaCard: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.primary,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  bankBadge: {
    backgroundColor: c.blueSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  bankBadgeText: { color: c.blue, fontSize: 12, fontWeight: '900' },
  fieldLabel: { ...t.small, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  bigNumber: { color: c.text, fontSize: 24, fontWeight: '900', letterSpacing: 1.5 },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  copyText: { color: c.primary, fontSize: 11, fontWeight: '800' },

  accBox: {
    backgroundColor: c.base,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 3,
    marginTop: spacing.xs,
  },
  accName: { ...t.subtitle, fontSize: 14 },
  accBranch: { ...t.small, fontSize: 11 },

  uniqueBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: c.goldSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  uniqueText: { color: c.gold, flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600' },

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