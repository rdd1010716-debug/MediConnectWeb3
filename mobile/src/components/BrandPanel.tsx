import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, typography, gradients } from '../constants/theme';

export default function BrandPanel() {
  return (
    <LinearGradient
      colors={gradients.authBrand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.brandMark}>
        <MaterialCommunityIcons name="stethoscope" size={34} color={colors.white} />
      </View>

      <Text style={styles.overline}>Sistema de Telemedicina</Text>
      <Text style={styles.title}>MediConnect</Text>
      <Text style={styles.description}>
        Atención médica digital, segura y organizada para pacientes, médicos y administradores.
      </Text>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="shield-check-outline" size={22} color={colors.white} />
          <Text style={styles.gridTitle}>JWT</Text>
          <Text style={styles.gridSub}>Acceso seguro</Text>
        </View>
        <View style={styles.gridItem}>
          <MaterialCommunityIcons name="pulse" size={22} color={colors.white} />
          <Text style={styles.gridTitle}>Tiempo real</Text>
          <Text style={styles.gridSub}>Chat médico</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 34,
    paddingTop: 60,
    paddingBottom: 44,
    borderBottomLeftRadius: radius.huge,
    borderBottomRightRadius: radius.huge,
    overflow: 'hidden',
  },
  brandMark: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: colors.white18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  overline: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extrabold,
    color: colors.white,
    opacity: 0.78,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: '900' as const,
    color: colors.white,
    letterSpacing: -2,
    marginBottom: 16,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.white,
    opacity: 0.88,
    lineHeight: 26,
    marginBottom: 36,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  gridItem: {
    flex: 1,
    backgroundColor: colors.white15,
    borderWidth: 1,
    borderColor: colors.white30,
    borderRadius: 22,
    padding: 18,
    gap: 6,
  },
  gridTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  gridSub: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    opacity: 0.82,
  },
});