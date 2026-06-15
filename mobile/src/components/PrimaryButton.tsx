import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, typography, shadows } from '../constants/theme';

interface Props extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export default function PrimaryButton({ title, loading, disabled, style, ...props }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      style={[styles.wrapper, (disabled || loading) && styles.disabled, style]}
      {...props}
    >
      <LinearGradient
        colors={[colors.btnGradientStart, colors.btnGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.button,
  },
  gradient: {
    minHeight: 46,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  text: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.black,
    letterSpacing: -0.2,
  },
  disabled: {
    opacity: 0.55,
  },
});