import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, type } from '../theme';
import { Tag } from '../components/common';

export default function NewsDetailScreen({ route }) {
  const { article } = route.params;
  const paragraphs = article.body.split('\n\n');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.metaTop}>
        <Tag label={article.category} tone="primary" />
        <Text style={styles.date}>{article.date}</Text>
      </View>

      <Text style={styles.title}>{article.title}</Text>

      <View style={styles.lead}>
        <View style={styles.leadBar} />
        <Text style={styles.leadText}>{article.excerpt}</Text>
      </View>

      {paragraphs.map((p, i) => (
        <Text key={i} style={styles.paragraph}>
          {p}
        </Text>
      ))}

      <View style={styles.share}>
        <Ionicons name="share-social-outline" size={16} color={colors.gold} />
        <Text style={styles.shareText}>Bagikan berita ini</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  metaTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  date: { ...type.small },
  title: { ...type.display, fontSize: 25, lineHeight: 32, marginTop: spacing.md },
  lead: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  leadBar: { width: 3, borderRadius: 2, backgroundColor: colors.primary },
  leadText: { ...type.body, flex: 1, color: '#D5D9E4', fontSize: 15, lineHeight: 23 },
  paragraph: { ...type.body, fontSize: 14, lineHeight: 23, marginBottom: spacing.md },
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
    borderColor: colors.line,
  },
  shareText: { color: colors.text, fontSize: 13, fontWeight: '700' },
});
