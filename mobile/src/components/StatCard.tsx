import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography, shadows } from '../constants/theme';

interface Props {
  label: string;
  value: string | number;
  detail?: string;
  icon: React.ReactNode;
}

export default function StatCard({ label, value, detail, icon }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>{icon}</View>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...shadows.statCard,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.statIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: colors.muted,
    marginBottom: 2,
  },
  value: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: colors.text,
    letterSpacing: -1,
  },
  detail: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: 1,
  },
});