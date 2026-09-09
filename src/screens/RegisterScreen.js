import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, useThemedStyles, spacing, radius } from '../theme';
import { useI18n } from '../i18n/i18n';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton, Notice } from '../components/common';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const s = useThemedStyles(makeStyles);
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    setError('');
    const { name, email, phone, password, confirm } = form;

    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirm) {
      setError(t('auth.errRequired'));
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError(t('auth.errEmail'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.errPassword'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.errMatch'));
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, phone, password });
      navigation.goBack();
    } catch (e) {
      setError(e.code === 'EXISTS' ? t('auth.errExists') : t('auth.errRequired'));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: t('auth.name'), icon: 'person-outline', placeholder: 'Nama lengkap' },
    {
      key: 'email',
      label: t('auth.email'),
      icon: 'mail-outline',
      placeholder: 'nama@email.com',
      keyboardType: 'email-address',
      autoCapitalize: 'none',
    },
    {
      key: 'phone',
      label: t('auth.phone'),
      icon: 'call-outline',
      placeholder: '08xxxxxxxxxx',
      keyboardType: 'phone-pad',
    },
    {
      key: 'password',
      label: t('auth.password'),
      icon: 'lock-closed-outline',
      placeholder: 'Minimal 6 karakter',
      secure: true,
    },
    {
      key: 'confirm',
      label: t('auth.confirmPassword'),
      icon: 'lock-closed-outline',
      placeholder: 'Ulangi kata sandi',
      secure: true,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>{t('auth.registerTitle')}</Text>
        <Text style={s.subtitle}>{t('auth.registerSubtitle')}</Text>

        {error ? <Notice text={error} tone="primary" icon="alert-circle-outline" /> : null}

        {fields.map((f) => (
          <View key={f.key} style={s.field}>
            <Text style={s.label}>{f.label}</Text>
            <View style={s.inputBox}>
              <Ionicons name={f.icon} size={17} color={colors.textFaint} />
              <TextInput
                value={form[f.key]}
                onChangeText={set(f.key)}
                placeholder={f.placeholder}
                placeholderTextColor={colors.textFaint}
                secureTextEntry={!!f.secure}
                keyboardType={f.keyboardType}
                autoCapitalize={f.autoCapitalize || 'sentences'}
                style={s.input}
              />
            </View>
          </View>
        ))}

        <PrimaryButton
          label={t('auth.registerTitle')}
          loading={loading}
          onPress={submit}
          style={{ marginTop: spacing.md }}
        />

        <Pressable onPress={() => navigation.replace('Login')} style={s.switchLink}>
          <Text style={s.switchText}>{t('auth.haveAccount')}</Text>
        </Pressable>

        <Text style={s.note}>{t('auth.localOnly')}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c, t) => ({
  screen: { flex: 1, backgroundColor: c.base },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.md },
  title: { ...t.display, fontSize: 28 },
  subtitle: { ...t.body, marginBottom: spacing.sm },
  field: { gap: 6 },
  label: { ...t.small, fontSize: 12, color: c.textMuted, fontWeight: '700' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 50,
    paddingHorizontal: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
  },
  input: { flex: 1, color: c.text, fontSize: 14, padding: 0 },
  switchLink: { alignSelf: 'center', paddingVertical: spacing.md },
  switchText: { color: c.gold, fontSize: 13, fontWeight: '700' },
  note: { ...t.small, textAlign: 'center' },
});
