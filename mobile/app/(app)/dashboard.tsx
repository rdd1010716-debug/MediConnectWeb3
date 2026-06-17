import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUser } from '../../src/auth/session';
import { citaApi, userApi, especialidadApi } from '../../src/api/endpoints';
import Alert from '../../src/components/Alert';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function AdminDashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [doctors, setDoctors] = useState(0);
  const [citas, setCitas] = useState(0);
  const [specialties, setSpecialties] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then((u) => { setUser(u); loadData(); });
  }, []);

  const loadData = async () => {
    try {
      const [dr, cr, sr] = await Promise.allSettled([userApi.doctors(), citaApi.mine(), especialidadApi.list()]);
      if (dr.status === 'fulfilled') setDoctors(dr.value.data?.medicos?.length || dr.value.data?.length || 0);
      if (cr.status === 'fulfilled') setCitas(cr.value.data?.citas?.length || cr.value.data?.length || 0);
      if (sr.status === 'fulfilled') setSpecialties(sr.value.data?.especialidades?.length || sr.value.data?.length || 0);
    } finally { setLoading(false); }
  };

  const stats = [
    { label: 'Médicos', value: doctors, icon: 'doctor', color: colors.primary },
    { label: 'Citas', value: citas, icon: 'calendar-check', color: colors.accent },
    { label: 'Especialidades', value: specialties, icon: 'hospital-building', color: colors.warning },
  ];

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroAdmin} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <Text style={styles.topbarTitle}>Panel Admin</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>Bienvenido, {user?.nombre || 'Admin'}</Text>
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <MaterialCommunityIcons name={s.icon as any} size={28} color={s.color} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/admin-medicos')}>
            <MaterialCommunityIcons name="doctor" size={32} color={colors.primary} />
            <Text style={styles.quickText}>Ver Médicos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/admin-citas')}>
            <MaterialCommunityIcons name="clipboard-list" size={32} color={colors.accent} />
            <Text style={styles.quickText}>Citas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/admin-especialidades')}>
            <MaterialCommunityIcons name="hospital-building" size={32} color={colors.warning} />
            <Text style={styles.quickText}>Especialidades</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/admin-chats')}>
            <MaterialCommunityIcons name="chat-processing" size={32} color={colors.danger} />
            <Text style={styles.quickText}>Chats</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  topbar: { paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  topbarTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.white },
  content: { padding: 20, paddingBottom: 40, gap: 18 },
  welcome: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 18, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 28, fontWeight: '900' as const, color: colors.text },
  statLabel: { fontSize: typography.sizes.xs, fontWeight: typography.weights.extrabold, color: colors.muted, textTransform: 'uppercase' },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: { width: '47%', backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 20, alignItems: 'center', gap: 10 },
  quickText: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.text },
});
