import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadow, type } from '../theme';
import { Tag } from './common';

export function ProgramCard({ item, onPress }) {
  const accentColor =
    item.accent === 'gold' ? colors.gold : item.accent === 'blue' ? colors.blue : colors.primary;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.program, pressed && styles.pressed]}>
      <View style={styles.programMedia}>
        <Image source={{ uri: item.image }} style={styles.programImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(11,12,16,0.35)', colors.surface]}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.programStripe, { backgroundColor: accentColor }]} />
      </View>

      <View style={styles.programBody}>
        <Tag label={item.tag} tone={item.accent} />
        <Text style={styles.programTitle}>{item.title}</Text>
        <Text style={styles.programDesc} numberOfLines={3}>
          {item.description}
        </Text>

        {item.children?.length ? (
          <View style={styles.programChildren}>
            {item.children.map((c) => (
              <View key={c.code} style={styles.childRow}>
                <Text style={[styles.childCode, { color: accentColor }]}>{c.code}</Text>
                <Text style={styles.childLabel}>{c.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.programFooter}>
          <Text style={styles.programLink}>Selengkapnya</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.text} />
        </View>
      </View>
    </Pressable>
  );
}

export function EventCard({ item, onPress, wide = false }) {
  const isOpen = item.status === 'Pendaftaran dibuka';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.event, wide && styles.eventWide, pressed && styles.pressed]}
    >
      <View style={styles.eventTop}>
        <Tag label={item.category} tone="gold" />
        <Tag label={item.status} tone={isOpen ? 'primary' : 'neutral'} />
      </View>
      <Text style={styles.eventTitle} numberOfLines={3}>
        {item.title}
      </Text>
      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={13} color={colors.textFaint} />
        <Text style={styles.metaText}>{item.date}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={13} color={colors.textFaint} />
        <Text style={styles.metaText} numberOfLines={2}>
          {item.location}
        </Text>
      </View>
    </Pressable>
  );
}

export function NewsCard({ item, onPress, compact = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.news, compact && styles.newsCompact, pressed && styles.pressed]}
    >
      <View style={styles.newsAccent} />
      <View style={styles.newsBody}>
        <View style={styles.newsTop}>
          <Tag label={item.category} tone="primary" />
          <Text style={styles.newsDate}>{item.date}</Text>
        </View>
        <Text style={styles.newsTitle} numberOfLines={compact ? 2 : 3}>
          {item.title}
        </Text>
        <Text style={styles.newsExcerpt} numberOfLines={compact ? 2 : 3}>
          {item.excerpt}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsLink}>Baca selengkapnya</Text>
          <Ionicons name="arrow-forward" size={13} color={colors.gold} />
        </View>
      </View>
    </Pressable>
  );
}

export function FacilityCard({ item, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.facility, pressed && styles.pressed]}>
      <View style={styles.facilityIcon}>
        <Ionicons name="business-outline" size={20} color={colors.primary} />
      </View>
      <View style={styles.facilityBody}>
        <Text style={styles.facilityName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={colors.textFaint} />
          <Text style={styles.metaText}>
            {item.area} · {item.type}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={12} color={colors.textFaint} />
          <Text style={styles.metaText}>{item.open}</Text>
        </View>
        <Text style={styles.facilityPrice}>{item.price}</Text>
      </View>
    </Pressable>
  );
}

export function AthleteCard({ item }) {
  return (
    <View style={styles.athlete}>
      <Image source={{ uri: item.image }} style={styles.athleteImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(11,12,16,0.55)', 'rgba(11,12,16,0.95)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.athleteBody}>
        <Text style={styles.athleteAchievement}>{item.achievement}</Text>
        <Text style={styles.athleteName}>{item.name}</Text>
        <Text style={styles.athleteQuote} numberOfLines={3}>
          {item.quote}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },

  // Program
  program: {
    width: 268,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    ...shadow.card,
  },
  programMedia: {
    height: 128,
    backgroundColor: colors.surfaceAlt,
  },
  programImage: {
    width: '100%',
    height: '100%',
  },
  programStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  programBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  programTitle: {
    ...type.subtitle,
    fontSize: 18,
    fontWeight: '900',
  },
  programDesc: {
    ...type.body,
    fontSize: 13,
  },
  programChildren: {
    gap: 6,
    paddingTop: 2,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  childCode: {
    fontSize: 11,
    fontWeight: '900',
    width: 44,
  },
  childLabel: {
    ...type.small,
    flex: 1,
  },
  programFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  programLink: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },

  // Event
  event: {
    width: 250,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: 6,
  },
  eventWide: {
    width: '100%',
  },
  eventTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  eventTitle: {
    ...type.subtitle,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: spacing.xs,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...type.small,
    flex: 1,
  },

  // News
  news: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  newsCompact: {
    width: 290,
  },
  newsAccent: {
    width: 4,
    backgroundColor: colors.primary,
  },
  newsBody: {
    flex: 1,
    padding: spacing.lg,
    gap: 6,
  },
  newsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newsDate: {
    ...type.small,
    fontSize: 11,
  },
  newsTitle: {
    ...type.subtitle,
    fontSize: 15,
    lineHeight: 21,
  },
  newsExcerpt: {
    ...type.body,
    fontSize: 13,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  newsLink: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },

  // Facility
  facility: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
  },
  facilityIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityBody: {
    flex: 1,
    gap: 5,
  },
  facilityName: {
    ...type.subtitle,
    fontSize: 15,
  },
  facilityPrice: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },

  // Athlete
  athlete: {
    width: 220,
    height: 280,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.line,
  },
  athleteImage: {
    width: '100%',
    height: '100%',
  },
  athleteBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    gap: 4,
  },
  athleteAchievement: {
    ...type.eyebrow,
    letterSpacing: 0.8,
  },
  athleteName: {
    ...type.subtitle,
    fontSize: 18,
    fontWeight: '900',
  },
  athleteQuote: {
    ...type.body,
    fontSize: 12,
    color: '#C9CDDA',
    fontStyle: 'italic',
  },
});
