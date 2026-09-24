import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, useThemedStyles, spacing, radius } from '../theme';
import { useI18n } from '../i18n/i18n';
import { useAuth } from '../context/AuthContext';
import { contact, quickLinks } from '../data/content';
import { Divider, PrimaryButton } from '../components/common';

export default function MoreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, preference, setPreference, toggle } = useTheme();
  const { t, lang, setLang } = useI18n();
  const { user, isLoggedIn, logout } = useAuth();
  const s = useThemedStyles(makeStyles);

  const services = [
    {
      id: 'chat',
      icon: 'chatbubble-ellipses-outline',
      title: t('more.chat'),
      desc: t('more.chatDesc'),
      onPress: () => navigation.navigate('Chat'),
    },
    {
      id: 'helpdesk',
      icon: 'ticket-outline',
      title: t('more.helpdesk'),
      desc: t('more.helpdeskDesc'),
      onPress: () => navigation.navigate('Helpdesk'),
    },
    {
      id: 'transactions',
      icon: 'receipt-outline',
      title: lang === 'en' ? 'My transactions' : 'Transaksi saya',
      desc: lang === 'en' ? 'Booking & payment status' : 'Status pemesanan & pembayaran',
      onPress: () => navigation.navigate('Transactions'),
    },
    {
      id: 'payment',
      icon: 'card-outline',
      title: t('more.payment'),
      desc: t('more.paymentDesc'),
      onPress: () => navigation.navigate('Fasilitas'),
    },
  ];

  const confirmLogout = () => {
    Alert.alert(t('more.logout'), '?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('more.logout'), style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={[s.content, { paddingTop: insets.top + spacing.sm }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.title}>{t('more.title')}</Text>
      <Text style={s.caption}>{t('more.caption')}</Text>

      {/* Akun */}
      <Text style={s.sectionLabel}>{t('more.account')}</Text>
      <View style={s.card}>
        {isLoggedIn ? (
          <>
            <View style={s.userRow}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{(user.name || '?').charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>{user.name}</Text>
                <Text style={s.userMeta}>{user.email}</Text>
              </View>
            </View>
            <Divider />
            <Pressable onPress={confirmLogout} style={s.rowButton}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              <Text style={[s.rowButtonText, { color: colors.danger }]}>{t('more.logout')}</Text>
            </Pressable>
          </>
        ) : (
          <View style={s.authBox}>
            <Text style={s.authHint}>{t('auth.loginSubtitle')}</Text>
            <View style={s.authButtons}>
              <PrimaryButton
                label={t('more.login')}
                onPress={() => navigation.navigate('Login')}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label={t('more.register')}
                variant="ghost"
                onPress={() => navigation.navigate('Register')}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </View>

      {/* Layanan */}
      <Text style={s.sectionLabel}>{t('more.services')}</Text>
      <View style={s.card}>
        {services.map((item, i) => (
          <View key={item.id}>
            <Pressable onPress={item.onPress} style={s.serviceRow}>
              <View style={s.serviceIcon}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.serviceTitle}>{item.title}</Text>
                <Text style={s.serviceDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
            </Pressable>
            {i < services.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </View>

      {/* Tampilan */}
      <Text style={s.sectionLabel}>{t('more.appearance')}</Text>
      <View style={s.card}>
        <View style={s.switchRow}>
          <Ionicons name="moon-outline" size={18} color={colors.textMuted} />
          <Text style={s.switchLabel}>{t('more.darkMode')}</Text>
          <Switch
            value={isDark}
            onValueChange={toggle}
            trackColor={{ false: colors.line, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        <Divider />
        <View style={s.switchRow}>
          <Ionicons name="phone-portrait-outline" size={18} color={colors.textMuted} />
          <Text style={s.switchLabel}>{t('more.followSystem')}</Text>
          <Switch
            value={preference === 'system'}
            onValueChange={(v) => setPreference(v ? 'system' : isDark ? 'dark' : 'light')}
            trackColor={{ false: colors.line, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Bahasa */}
      <Text style={s.sectionLabel}>{t('more.language')}</Text>
      <View style={s.langRow}>
        {[
          { id: 'id', label: 'Bahasa Indonesia' },
          { id: 'en', label: 'English' },
        ].map((l) => {
          const active = lang === l.id;
          return (
            <Pressable
              key={l.id}
              onPress={() => setLang(l.id)}
              style={[s.langChip, active && s.langChipActive]}
            >
              <Text style={[s.langChipText, active && s.langChipTextActive]}>{l.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tautan cepat */}
      <View style={s.grid}>
        {quickLinks.map((l) => (
          <Pressable key={l.id} style={s.tile} onPress={() => {}}>
            <View style={s.tileIcon}>
              <Ionicons name={l.icon} size={19} color={colors.primary} />
            </View>
            <Text style={s.tileLabel}>{l.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Kontak */}
      <Text style={s.sectionLabel}>{t('more.contact')}</Text>
      <View style={s.card}>
        <View style={s.contactBox}>
          <Text style={s.office}>{contact.office}</Text>
          <View style={s.metaRow}>
            <Ionicons name="location-outline" size={16} color={colors.textFaint} />
            <Text style={s.metaText}>{contact.address}</Text>
          </View>
          <Pressable
            style={s.metaRow}
            onPress={() => Linking.openURL(`mailto:${contact.email}`)}
          >
            <Ionicons name="mail-outline" size={16} color={colors.textFaint} />
            <Text style={[s.metaText, s.link]}>{contact.email}</Text>
          </Pressable>
        </View>
      </View>

      {/* Sosial */}
      <Text style={s.sectionLabel}>{t('more.social')}</Text>
      <View style={s.card}>
        {contact.socials.map((so, i) => (
          <View key={so.id}>
            <View style={s.serviceRow}>
              <Ionicons name={so.icon} size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={s.serviceTitle}>{so.platform}</Text>
                <Text style={s.serviceDesc}>{so.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color={colors.textFaint} />
            </View>
            {i < contact.socials.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </View>

      <Text style={s.footer}>{t('more.demoNote')}</Text>
    </ScrollView>
  );
}

const makeStyles = (c, t) => ({
  screen: { flex: 1, backgroundColor: c.base },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl * 2 },
  title: { ...t.display, fontSize: 28 },
  caption: { ...t.body, marginTop: spacing.xs },

  sectionLabel: {
    ...t.eyebrow,
    color: c.textFaint,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },

  card: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    paddingHorizontal: spacing.lg,
  },

  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: c.onPrimary, fontSize: 18, fontWeight: '900' },
  userName: { ...t.subtitle, fontSize: 15 },
  userMeta: { ...t.small },

  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  rowButtonText: { fontSize: 14, fontWeight: '700' },

  authBox: { paddingVertical: spacing.lg, gap: spacing.md },
  authHint: { ...t.body, fontSize: 13 },
  authButtons: { flexDirection: 'row', gap: spacing.sm },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: c.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: { ...t.subtitle, fontSize: 14 },
  serviceDesc: { ...t.small },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  switchLabel: { ...t.subtitle, fontSize: 14, flex: 1 },

  langRow: { flexDirection: 'row', gap: spacing.sm },
  langChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
  },
  langChipActive: { backgroundColor: c.primary, borderColor: c.primary },
  langChipText: { color: c.textMuted, fontSize: 13, fontWeight: '700' },
  langChipTextActive: { color: c.onPrimary },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xl },
  tile: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: c.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { ...t.subtitle, fontSize: 14 },

  contactBox: { paddingVertical: spacing.lg, gap: spacing.md },
  office: { ...t.subtitle, fontSize: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  metaText: { ...t.body, flex: 1, fontSize: 13 },
  link: { color: c.gold, fontWeight: '700' },

  footer: { ...t.small, textAlign: 'center', marginTop: spacing.xxl },
});