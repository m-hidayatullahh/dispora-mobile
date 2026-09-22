import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, useThemedStyles, spacing, radius } from '../theme';
import { useI18n } from '../i18n/i18n';
import { news } from '../data/content';
import { NewsCard } from '../components/cards';
import { EmptyState } from '../components/common';
import { FadeInUp, stagger } from '../components/anim';

export default function NewsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useI18n();
  const s = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return news;
    return news.filter(
      (n) => n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)
    );
  }, [query]);

  const header = (
    <View style={s.headerWrap}>
      <Text style={s.title}>{t('news.title')}</Text>
      <Text style={s.caption}>{t('news.caption')}</Text>

      <View style={s.searchBox}>
        <Ionicons name="search" size={17} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('news.searchPlaceholder')}
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
    </View>
  );

  return (
    <View style={[s.screen, { paddingTop: insets.top + spacing.sm }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        contentContainerStyle={s.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <FadeInUp delay={stagger(index)}>
            <NewsCard
              item={item}
              readLabel={t('common.readMore')}
              onPress={() => navigation.navigate('NewsDetail', { article: item })}
            />
          </FadeInUp>
        )}
        ListEmptyComponent={<EmptyState icon="newspaper-outline" title={t('news.empty')} />}
      />
    </View>
  );
}

const makeStyles = (c, t) => ({
  screen: { flex: 1, backgroundColor: c.base },
  headerWrap: { gap: spacing.xs, marginBottom: spacing.lg },
  title: { ...t.display, fontSize: 28 },
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
    marginTop: spacing.md,
  },
  searchInput: { flex: 1, color: c.text, fontSize: 14, padding: 0 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl * 2 },
});
