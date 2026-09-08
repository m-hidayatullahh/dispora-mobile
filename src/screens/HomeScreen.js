import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, type } from '../theme';
import {
  heroQuotes,
  programs,
  events,
  news,
  athletes,
  stats,
  helpdesk,
  marqueeWords,
} from '../data/content';
import { SectionHeading, PrimaryButton, StatBox, Tag } from '../components/common';
import { ProgramCard, EventCard, NewsCard, AthleteCard } from '../components/cards';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [quoteIndex, setQuoteIndex] = useState(0);

  const onQuoteScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (width - spacing.lg * 2 + spacing.md));
    if (i !== quoteIndex) setQuoteIndex(i);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>D</Text>
          </View>
          <View>
            <Text style={styles.brandName}>DISPORA</Text>
            <Text style={styles.brandSub}>DKI Jakarta</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} hitSlop={6}>
            <Text style={styles.langText}>ID</Text>
          </Pressable>
          <Pressable style={styles.iconButton} hitSlop={6}>
            <Ionicons name="notifications-outline" size={19} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <LinearGradient
          colors={['rgba(213,28,41,0.20)', 'rgba(11,12,16,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.heroEyebrow}>PEMBERDAYAAN PEMUDA &amp; OLAHRAGA</Text>
        <Text style={styles.heroTitle}>
          Membangun masa depan Jakarta melalui{' '}
          <Text style={styles.heroTitleAccent}>pemuda &amp; olahraga</Text>
        </Text>
        <Text style={styles.heroBody}>
          Memberdayakan generasi atlet dan pemimpin masa depan melalui fasilitas kelas dunia dan
          program olahraga terintegrasi.
        </Text>
        <View style={styles.heroButtons}>
          <PrimaryButton
            label="Lihat event"
            icon="arrow-forward"
            onPress={() => navigation.navigate('Acara')}
          />
          <PrimaryButton
            label="Tonton aktivitas"
            variant="ghost"
            icon="play-circle-outline"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* Kutipan pimpinan */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onQuoteScroll}
        contentContainerStyle={styles.quoteScroll}
      >
        {heroQuotes.map((q) => (
          <View key={q.id} style={[styles.quoteCard, { width: width - spacing.lg * 2 }]}>
            <Ionicons name="chatbox-ellipses" size={18} color={colors.gold} />
            <Text style={styles.quoteText}>{q.quote}</Text>
            <Text style={styles.quoteName}>{q.name}</Text>
            <Text style={styles.quoteRole}>{q.role}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {heroQuotes.map((q, i) => (
          <View key={q.id} style={[styles.dot, i === quoteIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Program unggulan */}
      <View style={styles.section}>
        <SectionHeading
          title="PROGRAM "
          accentWord="UNGGULAN"
          caption="Program pembinaan dan layanan kepemudaan serta olahraga di DKI Jakarta yang dapat diakses masyarakat."
          actionLabel="Semua program"
          onAction={() => {}}
        />
        <FlatList
          horizontal
          data={programs}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => <ProgramCard item={item} onPress={() => {}} />}
        />
      </View>

      {/* Helpdesk */}
      <View style={[styles.section, styles.helpdesk]}>
        <Tag label="Layanan tambahan" tone="blue" />
        <Text style={styles.helpdeskTitle}>Helpdesk Dispora</Text>
        <Text style={styles.helpdeskBody}>
          Lihat alur tiket layanan, SLA penanganan, dan pusat bantuan digital Dispora DKI Jakarta.
        </Text>
        <View style={styles.helpdeskStats}>
          <View style={styles.helpdeskStat}>
            <Text style={styles.helpdeskValue}>{helpdesk.openTicket}</Text>
            <Text style={styles.helpdeskLabel}>Tiket terbuka</Text>
          </View>
          <View style={styles.helpdeskDivider} />
          <View style={styles.helpdeskStat}>
            <Text style={styles.helpdeskValue}>{helpdesk.avgSla}</Text>
            <Text style={styles.helpdeskLabel}>Rata-rata SLA</Text>
          </View>
          <View style={styles.helpdeskDivider} />
          <View style={styles.helpdeskStat}>
            <Text style={styles.helpdeskValue}>{helpdesk.channels.length}</Text>
            <Text style={styles.helpdeskLabel}>Channel aktif</Text>
          </View>
        </View>
        <PrimaryButton label="Buka helpdesk" icon="arrow-forward" onPress={() => {}} />
      </View>

      {/* Kegiatan */}
      <View style={styles.section}>
        <SectionHeading
          title="KEGIATAN"
          actionLabel="Lihat jadwal"
          onAction={() => navigation.navigate('Acara')}
        />
        <FlatList
          horizontal
          data={events}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => (
            <EventCard
              item={item}
              onPress={() => navigation.navigate('EventDetail', { event: item })}
            />
          )}
        />
      </View>

      {/* Marquee statis */}
      <View style={styles.marquee}>
        {marqueeWords.map((w, i) => (
          <View key={w} style={styles.marqueeItem}>
            <Text style={styles.marqueeText}>{w}</Text>
            {i < marqueeWords.length - 1 ? <View style={styles.marqueeDot} /> : null}
          </View>
        ))}
      </View>

      {/* Profil inspirasi */}
      <View style={styles.section}>
        <SectionHeading
          title="PROFIL "
          accentWord="INSPIRASI"
          caption="Wajah-wajah bertalenta dan semangat keunggulan dari Jakarta."
        />
        <FlatList
          horizontal
          data={athletes}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => <AthleteCard item={item} />}
        />
      </View>

      {/* Dispora terkini */}
      <View style={styles.section}>
        <SectionHeading
          title="DISPORA TERKINI"
          actionLabel="Semua berita"
          onAction={() => navigation.navigate('Berita')}
        />
        <View style={styles.newsList}>
          {news.slice(0, 3).map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              onPress={() => navigation.navigate('NewsDetail', { article: item })}
            />
          ))}
        </View>
      </View>

      {/* Media sosial */}
      <View style={styles.section}>
        <SectionHeading
          title="MEDIA SOSIAL"
          caption="Cerita atlet, kegiatan komunitas, dan program yang sedang berlangsung."
        />
        <View style={styles.socialCard}>
          <Image
            source={{
              uri: 'https://fs.dispora.id/image-uploader/assets/img/product_product/ImageIg350.png',
            }}
            style={styles.socialImage}
            resizeMode="cover"
          />
          <View style={styles.socialBody}>
            <Text style={styles.socialHandle}>@disporadkijkt</Text>
            <Text style={styles.socialText} numberOfLines={3}>
              Selamat kepada seluruh finalis dan para juara Duta Pora 2026. Malam final boleh
              selesai, tapi perjalanan kalian baru dimulai.
            </Text>
          </View>
        </View>
      </View>

      {/* Trafik realtime */}
      <View style={styles.section}>
        <SectionHeading title="TRAFIK REALTIME" caption="Dispora active stats" />
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <StatBox key={s.id} label={s.label} value={s.value} unit={s.unit} />
          ))}
        </View>
      </View>

      <Text style={styles.copyright}>© 2026 Dinas Pemuda dan Olahraga DKI Jakarta</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  brandName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  brandSub: {
    ...type.small,
    fontSize: 11,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },

  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  heroEyebrow: {
    ...type.eyebrow,
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...type.display,
    fontSize: 30,
    lineHeight: 36,
  },
  heroTitleAccent: {
    color: colors.primary,
  },
  heroBody: {
    ...type.body,
    marginTop: spacing.md,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    flexWrap: 'wrap',
  },

  quoteScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  quoteText: {
    ...type.body,
    color: '#D5D9E4',
    fontStyle: 'italic',
  },
  quoteName: {
    ...type.subtitle,
    fontSize: 15,
    marginTop: spacing.xs,
  },
  quoteRole: {
    ...type.small,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },

  section: {
    marginTop: spacing.xxl,
  },
  hList: {
    paddingHorizontal: spacing.lg,
  },

  helpdesk: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.md,
  },
  helpdeskTitle: {
    ...type.title,
    fontSize: 20,
  },
  helpdeskBody: {
    ...type.body,
    fontSize: 13,
  },
  helpdeskStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.base,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  helpdeskStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  helpdeskDivider: {
    width: 1,
    height: 26,
    backgroundColor: colors.line,
  },
  helpdeskValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  helpdeskLabel: {
    ...type.small,
    fontSize: 10,
  },

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
    borderColor: colors.line,
  },
  marqueeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  marqueeText: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  marqueeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  newsList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  socialCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  socialImage: {
    width: '100%',
    height: 190,
    backgroundColor: colors.surfaceAlt,
  },
  socialBody: {
    padding: spacing.lg,
    gap: 6,
  },
  socialHandle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  socialText: {
    ...type.body,
    fontSize: 13,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  copyright: {
    ...type.small,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
