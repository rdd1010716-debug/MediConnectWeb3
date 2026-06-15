import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../constants/theme';

interface Props {
  type?: 'error' | 'success' | 'info';
  message?: string;
}

const alertStyles = {
  error: { bg: colors.alertErrorBg, text: colors.alertErrorText, border: colors.alertErrorBorder },
  success: { bg: colors.alertSuccessBg, text: colors.alertSuccessText, border: colors.alertSuccessBorder },
  info: { bg: colors.alertInfoBg, text: colors.alertInfoText, border: colors.alertInfoBorder },
};

export default function Alert({ type = 'info', message }: Props) {
  if (!message) return null;
  const style = alertStyles[type];

  return (
    <View style={[styles.container, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.text, { color: style.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
  },
  text: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.extrabold,
    lineHeight: 20,
  },
});