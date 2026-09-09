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

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const s = useThemedStyles(makeStyles);
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError(t('auth.errRequired'));
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      navigation.goBack();
    } catch (e) {
      setError(t('auth.errNotFound'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>{t('auth.loginTitle')}</Text>
        <Text style={s.subtitle}>{t('auth.loginSubtitle')}</Text>

        {error ? <Notice text={error} tone="primary" icon="alert-circle-outline" /> : null}

        <View style={s.field}>
          <Text style={s.label}>{t('auth.email')}</Text>
          <View style={s.inputBox}>
            <Ionicons name="mail-outline" size={17} color={colors.textFaint} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              keyboardType="email-address"
              style={s.input}
            />
          </View>
        </View>

        <View style={s.field}>
          <Text style={s.label}>{t('auth.password')}</Text>
          <View style={s.inputBox}>
            <Ionicons name="lock-closed-outline" size={17} color={colors.textFaint} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••"
              placeholderTextColor={colors.textFaint}
              secureTextEntry={!showPassword}
              style={s.input}
              onSubmitEditing={submit}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={17}
                color={colors.textFaint}
              />
            </Pressable>
          </View>
        </View>

        <PrimaryButton
          label={t('auth.loginTitle')}
          loading={loading}
          onPress={submit}
          style={{ marginTop: spacing.md }}
        />

        <Pressable onPress={() => navigation.replace('Register')} style={s.switchLink}>
          <Text style={s.switchText}>{t('auth.noAccount')}</Text>
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
