import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUser } from '../../src/auth/session';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUser().then((u) => setUser(u));
  }, []);

  const items = [
    { label: 'Nombre', value: user?.nombre || '—', icon: 'account' },
    { label: 'Correo', value: user?.email || '—', icon: 'email' },
    { label: 'Rol', value: user?.rol?.toUpperCase() || '—', icon: 'shield-account' },
    { label: 'ID Usuario', value: String(user?.id || '—'), icon: 'identifier' },
  ];

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <Text style={styles.topbarTitle}>Mi Cuenta</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarCard}>
          <MaterialCommunityIcons name="account-circle" size={80} color={colors.primary} />
          <Text style={styles.name}>{user?.nombre || 'Usuario'}</Text>
          <Text style={styles.role}>{user?.rol?.toUpperCase()}</Text>
        </View>
        {items.map((item) => (
          <View key={item.label} style={styles.row}>
            <MaterialCommunityIcons name={item.icon as any} size={22} color={colors.primaryDark} />
            <View style={styles.rowText}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  topbar: { paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  topbarTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.white },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  avatarCard: { alignItems: 'center', paddingVertical: 30, backgroundColor: colors.cardTranslucent, borderRadius: radius.xxl, borderWidth: 1, borderColor: colors.border },
  name: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.black, color: colors.text, marginTop: 12 },
  role: { fontSize: typography.sizes.base, fontWeight: typography.weights.extrabold, color: colors.primaryDark, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 16 },
  rowText: { flex: 1 },
  label: { fontSize: typography.sizes.xs, fontWeight: typography.weights.extrabold, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.text, marginTop: 2 },
});
