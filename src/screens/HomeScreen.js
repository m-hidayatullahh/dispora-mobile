import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  FlatList,
  Dimensions,
  Image,
  Linking,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, useThemedStyles, spacing, radius } from '../theme';
import { useI18n } from '../i18n/i18n';
import { fetchHomeContent } from '../api/dispora';
import {
  heroQuotes as fallbackQuotes,
  programs as fallbackPrograms,
  events,
  news,
  athletes as fallbackAthletes,
  helpdesk,
  marqueeWords,
} from '../data/content';
import { SectionHeading, PrimaryButton, Tag, Skeleton, Notice } from '../components/common';
import { HeroCard, ProgramCard, EventCard, NewsCard, AthleteCard } from '../components/cards';
import { LogoMark } from '../components/Logo';
import {
  FadeInUp,
  PressableScale,
  AnimatedCounter,
  LiveDot,
  stagger,
} from '../components/anim';

const { width } = Dimensions.get('window');

// Angka contoh. Situs Dispora tidak mengekspos endpoint statistik,
// jadi nilainya statis dan hanya dianimasikan saat muncul.
const REALTIME_STATS = [
  { id: 's1', label: 'Aktif saat ini', labelEn: 'Active now', value: 334, unit: 'PAX' },
  { id: 's2', label: 'Kunjungan hari ini', labelEn: 'Today', value: 8956, unit: 'HITS' },
  { id: 's3', label: 'Minggu ini', labelEn: 'This week', value: 25863, unit: 'HITS' },
  { id: 's4', label: 'Bulan ini', labelEn: 'This month', value: 122313, unit: 'HITS' },
  { id: 's5', label: 'Tahun ini', labelEn: 'This year', value: 4004950, unit: 'HITS' },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, lang, setLang } = useI18n();
  const s = useThemedStyles(makeStyles);

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await fetchHomeContent();
      setContent(data);
    } catch (e) {
      setContent({ errors: { all: e } });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  // Pakai data API kalau ada isinya, kalau tidak jatuh ke data lokal.
  const pickList = (key, fallback) => {
    const v = content && content[key];
    return Array.isArray(v) && v.length > 0 ? v : fallback;
  };

  const hero = (content && content.hero) || [];
  const programs = pickList('programs', fallbackPrograms);
  const athletes = pickList('inspiration', fallbackAthletes);
  const quotes = pickList('quotes', fallbackQuotes);
  const gallery = (content && content.gallery) || [];
  const social = (content && content.social) || [];

  const heroFailed = !!(content && content.errors && content.errors.hero);

  const openHero = (item) => {
    if (item.registrationUrl) {
      Linking.openURL(item.registrationUrl).catch(() => {});
      return;
    }
    if (item.heroCtaUrl) {
      Linking.openURL(item.heroCtaUrl).catch(() => {});
      return;
    }
    navigation.navigate('NewsDetail', {
      article: {
        id: item.id,
        category: item.type || 'INFO',
        title: item.title,
        date: item.date,
        excerpt: item.excerpt,
        body: item.content || item.excerpt,
        image: item.bannerImage || item.image,
        registrationUrl: item.registrationUrl,
      },
    });
  };

  const onQuoteScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (width - spacing.lg * 2 + spacing.md));
    if (i !== quoteIndex) setQuoteIndex(i);
  };

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={s.brandRow}>
          <LogoMark size={40} />
          <View>
            <Text style={s.brandName}>
              Dispora <Text style={s.brandNameAccent}>Jakarta</Text>
            </Text>
            <Text style={s.brandSub}>DKI Jakarta</Text>
          </View>
        </View>
        <View style={s.headerActions}>
          <Pressable
            style={s.iconButton}
            hitSlop={6}
            onPress={() => setLang(lang === 'id' ? 'en' : 'id')}
          >
            <Text style={s.langText}>{lang.toUpperCase()}</Text>
          </Pressable>
          <Pressable style={s.iconButton} hitSlop={6} onPress={() => navigation.navigate('Chat')}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Hero */}
      <View style={s.heroSection}>
        <Text style={s.heroEyebrow}>{t('home.eyebrow')}</Text>

        {loading ? (
          <View style={s.heroSkeleton}>
            <Skeleton height={330} style={{ borderRadius: radius.lg }} />
          </View>
        ) : hero.length > 0 ? (
          <FlatList
            horizontal
            pagingEnabled
            data={hero}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={{ width }}>
                <HeroCard
                  item={item}
                  ctaLabel={t('home.ctaRegister')}
                  onPress={() => openHero(item)}
                />
              </View>
            )}
          />
        ) : (
          <View style={s.heroFallback}>
            {heroFailed ? <Notice text={t('common.offline')} tone="gold" /> : null}
            <Text style={s.heroFallbackTitle}>{t('home.heroFallbackTitle')}</Text>
            <Text style={s.heroFallbackBody}>{t('home.heroFallbackBody')}</Text>
            <View style={s.heroButtons}>
              <PrimaryButton
                label={t('home.ctaEvents')}
                icon="arrow-forward"
                onPress={() => navigation.navigate('Acara')}
              />
              {heroFailed ? (
                <PrimaryButton label={t('common.retry')} variant="ghost" onPress={load} />
              ) : null}
            </View>
          </View>
        )}
      </View>

      {/* Kutipan */}
      {quotes.length > 0 ? (
        <>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onQuoteScroll}
            contentContainerStyle={s.quoteScroll}
            style={{ marginTop: spacing.xl }}
          >
            {quotes.map((q) => (
              <View key={q.id} style={[s.quoteCard, { width: width - spacing.lg * 2 }]}>
                <Ionicons name="chatbox-ellipses" size={18} color={colors.gold} />
                <Text style={s.quoteText}>{q.quote}</Text>
                <Text style={s.quoteName}>{q.name}</Text>
                {q.role ? <Text style={s.quoteRole}>{q.role}</Text> : null}
              </View>
            ))}
          </ScrollView>
          <View style={s.dots}>
            {quotes.map((q, i) => (
              <View key={q.id} style={[s.dot, i === quoteIndex && s.dotActive]} />
            ))}
          </View>
        </>
      ) : null}

      {/* Program unggulan */}
      <View style={s.section}>
        <SectionHeading
          title={t('home.programs')}
          accentWord={t('home.programsAccent')}
          caption={t('home.programsCaption')}
        />
        {loading ? (
          <View style={s.hList}>
            <Skeleton height={300} style={{ borderRadius: radius.lg }} />
          </View>
        ) : (
          <FlatList
            horizontal
            data={programs}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.hList}
            ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
            renderItem={({ item }) => (
              <ProgramCard
                item={item}
                onPress={() =>
                  item.content
                    ? navigation.navigate('NewsDetail', {
                        article: {
                          id: item.id,
                          category: item.tag,
                          title: item.title,
                          date: '',
                          excerpt: item.description,
                          body: item.content,
                          image: item.image,
                        },
                      })
                    : null
                }
              />
            )}
          />
        )}
      </View>

      {/* Helpdesk */}
      <View style={[s.section, s.helpdesk]}>
        <Tag label="Helpdesk" tone="blue" />
        <Text style={s.helpdeskTitle}>{t('home.helpdesk')}</Text>
        <Text style={s.helpdeskBody}>{t('home.helpdeskBody')}</Text>
        <View style={s.helpdeskStats}>
          <View style={s.helpdeskStat}>
            <Text style={s.helpdeskValue}>{helpdesk.openTicket}</Text>
            <Text style={s.helpdeskLabel}>Tiket terbuka</Text>
          </View>
          <View style={s.helpdeskDivider} />
          <View style={s.helpdeskStat}>
            <Text style={s.helpdeskValue}>{helpdesk.avgSla}</Text>
            <Text style={s.helpdeskLabel}>Rata-rata SLA</Text>
          </View>
          <View style={s.helpdeskDivider} />
          <View style={s.helpdeskStat}>
            <Text style={s.helpdeskValue}>{helpdesk.channels.length}</Text>
            <Text style={s.helpdeskLabel}>Channel aktif</Text>
          </View>
        </View>
        <PrimaryButton
          label={t('home.openHelpdesk')}
          icon="arrow-forward"
          onPress={() => navigation.navigate('Helpdesk')}
        />
      </View>

      {/* Kegiatan */}
      <View style={s.section}>
        <SectionHeading
          title={t('home.activities')}
          actionLabel={t('home.schedule')}
          onAction={() => navigation.navigate('Acara')}
        />
        <FlatList
          horizontal
          data={events}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hList}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => (
            <EventCard
              item={item}
              onPress={() => navigation.navigate('EventDetail', { event: item })}
            />
          )}
        />
      </View>

      {/* Marquee */}
      <View style={s.marquee}>
        {marqueeWords.map((w, i) => (
          <View key={w} style={s.marqueeItem}>
            <Text style={s.marqueeText}>{w}</Text>
            {i < marqueeWords.length - 1 ? <View style={s.marqueeDot} /> : null}
          </View>
        ))}
      </View>

      {/* Profil inspirasi */}
      <View style={s.section}>
        <SectionHeading
          title={t('home.athletes')}
          accentWord={t('home.athletesAccent')}
          caption={t('home.athletesCaption')}
        />
        <FlatList
          horizontal
          data={athletes}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hList}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => <AthleteCard item={item} />}
        />
      </View>

      {/* Galeri */}
      {gallery.length > 0 ? (
        <View style={s.section}>
          <SectionHeading title="GALERI" />
          <FlatList
            horizontal
            data={gallery.slice(0, 12)}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.hList}
            ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
            renderItem={({ item }) => (
              <PressableScale
                onPress={() => (item.link ? Linking.openURL(item.link).catch(() => {}) : null)}
                style={s.galleryItem}
                scaleTo={0.94}
              >
                <Image source={{ uri: item.image }} style={s.galleryImage} resizeMode="cover" />
              </PressableScale>
            )}
          />
        </View>
      ) : null}

      {/* Berita */}
      <View style={s.section}>
        <SectionHeading
          title={t('home.latest')}
          actionLabel={t('home.allNews')}
          onAction={() => navigation.navigate('Berita')}
        />
        <View style={s.newsList}>
          {news.slice(0, 3).map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              readLabel={t('common.readMore')}
              onPress={() => navigation.navigate('NewsDetail', { article: item })}
            />
          ))}
        </View>
      </View>

      {/* Media sosial */}
      {social.length > 0 ? (
        <View style={s.section}>
          <SectionHeading title="MEDIA SOSIAL" />
          <FlatList
            horizontal
            data={social.slice(0, 8)}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.hList}
            ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
            renderItem={({ item }) => (
              <PressableScale
                onPress={() => (item.link ? Linking.openURL(item.link).catch(() => {}) : null)}
                style={s.socialCard}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={s.socialImage} resizeMode="cover" />
                ) : (
                  <View style={[s.socialImage, s.socialImageEmpty]}>
                    <Ionicons name="logo-instagram" size={28} color={colors.textFaint} />
                  </View>
                )}
                <View style={s.socialBody}>
                  <Text style={s.socialHandle}>{item.handle}</Text>
                  <Text style={s.socialText} numberOfLines={3}>
                    {item.caption}
                  </Text>
                </View>
              </PressableScale>
            )}
          />
        </View>
      ) : null}

      {/* Trafik realtime */}
      <View style={s.section}>
        <View style={s.statsHead}>
          <View style={{ flex: 1 }}>
            <SectionHeading title={t('home.stats')} caption={t('home.statsCaption')} />
          </View>
          <View style={s.livePill}>
            <LiveDot size={7} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
        </View>
        <View style={s.statsGrid}>
          {REALTIME_STATS.map((st, i) => (
            <FadeInUp key={st.id} delay={stagger(i, 70, 350)} style={s.statBox}>
              <AnimatedCounter
                value={st.value}
                delay={stagger(i, 70, 350) + 120}
                style={s.statValue}
              />
              <Text style={s.statUnit}>{st.unit}</Text>
              <Text style={s.statLabel}>{lang === 'en' ? st.labelEn : st.label}</Text>
            </FadeInUp>
          ))}
        </View>
      </View>

      <Text style={s.copyright}>© 2026 Dinas Pemuda dan Olahraga DKI Jakarta</Text>
    </ScrollView>
  );
}

const makeStyles = (c, t) => ({
  screen: { flex: 1, backgroundColor: c.base },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandName: { color: c.text, fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  brandNameAccent: { color: c.primary },
  brandSub: { ...t.small, fontSize: 11 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: { color: c.text, fontSize: 12, fontWeight: '800' },

  heroSection: { paddingTop: spacing.sm },
  heroEyebrow: { ...t.eyebrow, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  heroSkeleton: { paddingHorizontal: spacing.lg },
  heroFallback: { paddingHorizontal: spacing.lg, gap: spacing.md },
  heroFallbackTitle: { ...t.display, fontSize: 28, lineHeight: 34 },
  heroFallbackBody: { ...t.body },
  heroButtons: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },

  quoteScroll: { paddingHorizontal: spacing.lg, gap: spacing.md },
  quoteCard: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  quoteText: { ...t.body, fontStyle: 'italic' },
  quoteName: { ...t.subtitle, fontSize: 15, marginTop: spacing.xs },
  quoteRole: { ...t.small },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.line },
  dotActive: { width: 18, backgroundColor: c.primary },

  section: { marginTop: spacing.xxl },
  hList: { paddingHorizontal: spacing.lg },

  helpdesk: {
    marginHorizontal: spacing.lg,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  helpdeskTitle: { ...t.title, fontSize: 20 },
  helpdeskBody: { ...t.body, fontSize: 13 },
  helpdeskStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.base,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  helpdeskStat: { flex: 1, alignItems: 'center', gap: 2 },
  helpdeskDivider: { width: 1, height: 26, backgroundColor: c.line },
  helpdeskValue: { color: c.text, fontSize: 17, fontWeight: '900' },
  helpdeskLabel: { ...t.small, fontSize: 10 },

  marquee: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: c.line,
  },
  marqueeItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  marqueeText: { color: c.textFaint, fontSize: 13, fontWeight: '900', letterSpacing: 1.6 },
  marqueeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: c.primary },

  galleryItem: {
    width: 130,
    height: 130,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: c.surfaceAlt,
    borderWidth: 1,
    borderColor: c.line,
  },
  galleryImage: { width: '100%', height: '100%' },

  newsList: { paddingHorizontal: spacing.lg, gap: spacing.md },

  socialCard: {
    width: 260,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    overflow: 'hidden',
  },
  socialImage: { width: '100%', height: 170, backgroundColor: c.surfaceAlt },
  socialImageEmpty: { alignItems: 'center', justifyContent: 'center' },
  socialBody: { padding: spacing.lg, gap: 6 },
  socialHandle: { color: c.primary, fontSize: 13, fontWeight: '800' },
  socialText: { ...t.body, fontSize: 13 },

  statsHead: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: spacing.lg },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: c.successSoft,
  },
  liveText: { color: c.success, fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  statBox: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  statValue: { color: c.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  statUnit: { color: c.primary, fontSize: 11, fontWeight: '700', marginTop: 1 },
  statLabel: { ...t.small, marginTop: spacing.xs },

  copyright: { ...t.small, textAlign: 'center', marginTop: spacing.xxl },
});
