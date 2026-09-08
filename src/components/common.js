import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme';

export function SectionHeading({ title, accentWord, caption, actionLabel, onAction }) {
  return (
    <View style={styles.headingWrap}>
      <View style={styles.headingRow}>
        <Text style={styles.headingText}>
          {title}
          {accentWord ? <Text style={styles.headingAccent}>{accentWord}</Text> : null}
          <Text style={styles.headingDot}>.</Text>
        </Text>
        {actionLabel ? (
          <Pressable hitSlop={8} onPress={onAction} style={styles.headingAction}>
            <Text style={styles.headingActionText}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={13} color={colors.gold} />
          </Pressable>
        ) : null}
      </View>
      {caption ? <Text style={styles.headingCaption}>{caption}</Text> : null}
    </View>
  );
}

export function Tag({ label, tone = 'primary', style }) {
  const tones = {
    primary: { bg: colors.primarySoft, fg: colors.primary },
    gold: { bg: colors.goldSoft, fg: colors.gold },
    blue: { bg: colors.blueSoft, fg: '#7DA2FF' },
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
  };
  const t = tones[tone] || tones.primary;
  return (
    <View style={[styles.tag, { backgroundColor: t.bg }, style]}>
      <Text style={[styles.tagText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function StatBox({ label, value, unit }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress, icon, variant = 'solid', style }) {
  const isSolid = variant === 'solid';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSolid ? styles.buttonSolid : styles.buttonGhost,
        pressed && styles.buttonPressed,
        style,
      ]}
    >
      <Text style={[styles.buttonText, !isSolid && { color: colors.text }]}>{label}</Text>
      {icon ? (
        <Ionicons name={icon} size={15} color={isSolid ? '#fff' : colors.text} />
      ) : null}
    </Pressable>
  );
}

export function EmptyState({ icon = 'search-outline', title, hint }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={30} color={colors.textFaint} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
    </View>
  );
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  headingWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headingText: {
    ...type.title,
    fontSize: 24,
    flexShrink: 1,
  },
  headingAccent: {
    color: colors.primary,
  },
  headingDot: {
    color: colors.primary,
  },
  headingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: spacing.sm,
  },
  headingActionText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  headingCaption: {
    ...type.body,
    marginTop: spacing.xs,
    paddingRight: spacing.xl,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statBox: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statUnit: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  statLabel: {
    ...type.small,
    marginTop: spacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  },
  buttonSolid: {
    backgroundColor: colors.primary,
  },
  buttonGhost: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'transparent',
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...type.subtitle,
    fontSize: 15,
    textAlign: 'center',
  },
  emptyHint: {
    ...type.body,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
  },
});
