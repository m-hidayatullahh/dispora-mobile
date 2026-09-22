import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Linking, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, useThemedStyles, spacing, radius } from '../theme';
import { useI18n } from '../i18n/i18n';
import { Tag, PrimaryButton } from '../components/common';
import { FadeInUp, PressableScale, stagger } from '../components/anim';

const SITE = 'https://dispora.jakarta.go.id';

export default function NewsDetailScreen({ route }) {
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const s = useThemedStyles(makeStyles);
  const { article } = route.params;
  const [sharing, setSharing] = useState(false);

  const paragraphs = String(article.body || article.excerpt || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  const onShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const url = article.registrationUrl || (article.id ? `${SITE}/news/${article.id}` : SITE);
      const intro = article.excerpt ? `\n\n${article.excerpt}` : '';
      const message = `${article.title}${intro}\n\n${url}`;

      const result = await Share.share(
        { title: article.title, message },
        { dialogTitle: t('news.share'), subject: article.title }
      );

      if (result.action === Share.dismissedAction) {
        // pengguna menutup sheet, tidak perlu pesan apa pun
      }
    } catch (e) {
      Alert.alert(
        t('news.share'),
        lang === 'en' ? 'Failed to open the share sheet.' : 'Gagal membuka menu berbagi.'
      );
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {article.image ? (
        <FadeInUp>
          <Image source={{ uri: article.image }} style={s.cover} resizeMode="cover" />
        </FadeInUp>
      ) : null}

      <FadeInUp delay={60}>
        <View style={s.metaTop}>
          <Tag label={article.category} tone="primary" />
          {article.date ? <Text style={s.date}>{article.date}</Text> : null}
        </View>

        <Text style={s.title}>{article.title}</Text>
      </FadeInUp>

      {article.excerpt ? (
        <FadeInUp delay={110}>
          <View style={s.lead}>
            <View style={s.leadBar} />
            <Text style={s.leadText}>{article.excerpt}</Text>
          </View>
        </FadeInUp>
      ) : null}

      {paragraphs.map((p, i) => (
        <FadeInUp key={i} delay={stagger(i + 3, 45, 320)}>
          <Text style={s.paragraph}>{p}</Text>
        </FadeInUp>
      ))}

      {article.registrationUrl ? (
        <PrimaryButton
          label={t('home.ctaRegister')}
          icon="open-outline"
          onPress={() => Linking.openURL(article.registrationUrl).catch(() => {})}
          style={{ marginTop: spacing.lg }}
        />
      ) : null}

      <PressableScale onPress={onShare} style={s.share} scaleTo={0.95}>
        <Ionicons name="share-social-outline" size={16} color={colors.gold} />
        <Text style={s.shareText}>{t('news.share')}</Text>
      </PressableScale>
    </ScrollView>
  );
}

const makeStyles = (c, t) => ({
  screen: { flex: 1, backgroundColor: c.base },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  cover: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    backgroundColor: c.surfaceAlt,
  },
  metaTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  date: { ...t.small },
  title: { ...t.display, fontSize: 25, lineHeight: 32, marginTop: spacing.md },
  lead: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.lg },
  leadBar: { width: 3, borderRadius: 2, backgroundColor: c.primary },
  leadText: { ...t.body, flex: 1, fontSize: 15, lineHeight: 23 },
  paragraph: { ...t.body, fontSize: 14, lineHeight: 23, marginBottom: spacing.md },
  share: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.line,
  },
  shareText: { color: c.text, fontSize: 13, fontWeight: '700' },
});
