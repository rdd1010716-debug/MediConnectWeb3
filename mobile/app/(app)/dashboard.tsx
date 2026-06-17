import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUser } from '../../src/auth/session';
import { citaApi, userApi, especialidadApi } from '../../src/api/endpoints';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ doctors: 0, citas: 0, specialties: 0 });

  useEffect(() => {
    getUser().then((u) => {
      setUser(u);
      if (u?.rol === 'admin') loadAdminStats();
    });
  }, []);

  const loadAdminStats = async () => {
    try {
      const [dr, cr, sr] = await Promise.allSettled([userApi.doctors(), citaApi.mine(), especialidadApi.list()]);
      setStats({
        doctors: dr.status === 'fulfilled' ? (dr.value.data?.medicos?.length || dr.value.data?.length || 0) : 0,
        citas: cr.status === 'fulfilled' ? (cr.value.data?.citas?.length || cr.value.data?.length || 0) : 0,
        specialties: sr.status === 'fulfilled' ? (sr.value.data?.especialidades?.length || sr.value.data?.length || 0) : 0,
      });
    } catch {}
  };

  const role = user?.rol || 'paciente';

  if (role === 'admin') {
    return (
      <View style={styles.shell}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.heroAdmin} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
          <Text style={styles.topbarTitle}>Panel Admin</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.welcome}>Bienvenido, {user?.nombre || 'Admin'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}><MaterialCommunityIcons name="doctor" size={28} color={colors.primary} /><Text style={styles.statValue}>{stats.doctors}</Text><Text style={styles.statLabel}>Médicos</Text></View>
            <View style={styles.statCard}><MaterialCommunityIcons name="calendar-check" size={28} color={colors.accent} /><Text style={styles.statValue}>{stats.citas}</Text><Text style={styles.statLabel}>Citas</Text></View>
            <View style={styles.statCard}><MaterialCommunityIcons name="hospital-building" size={28} color={colors.warning} /><Text style={styles.statValue}>{stats.specialties}</Text><Text style={styles.statLabel}>Especialidades</Text></View>
          </View>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/admin-medicos')}><MaterialCommunityIcons name="doctor" size={32} color={colors.primary} /><Text style={styles.quickText}>Ver Médicos</Text></TouchableOpacity>
            <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/admin-citas')}><MaterialCommunityIcons name="clipboard-list" size={32} color={colors.accent} /><Text style={styles.quickText}>Citas</Text></TouchableOpacity>
            <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/admin-especialidades')}><MaterialCommunityIcons name="hospital-building" size={32} color={colors.warning} /><Text style={styles.quickText}>Especialidades</Text></TouchableOpacity>
            <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/admin-chats')}><MaterialCommunityIcons name="chat-processing" size={32} color={colors.danger} /><Text style={styles.quickText}>Chats</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (role === 'medico') {
    return (
      <View style={styles.shell}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.heroDoctor} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
          <Text style={styles.topbarTitle}>Portal Médico</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heroCard}>
            <MaterialCommunityIcons name="stethoscope" size={48} color={colors.white} />
            <Text style={styles.heroTitle}>MediConnect para Médicos</Text>
            <Text style={styles.heroDesc}>
              Gestiona tu disponibilidad semanal, atiende consultas mediante chat seguro, 
              registra historiales clínicos digitales y emite recetas médicas oficiales. 
              Todo en una plataforma centralizada para brindar atención de calidad.
            </Text>
          </View>
          <View style={styles.features}>
            <Feature icon="clock-outline" title="Disponibilidad" desc="Configura tus días y horarios de atención semanal." />
            <Feature icon="chat-processing" title="Chat Seguro" desc="Comunícate en tiempo real con tus pacientes." />
            <Feature icon="file-document-outline" title="Historial Clínico" desc="Registra diagnósticos, tratamientos y notas médicas." />
            <Feature icon="calendar-check" title="Citas" desc="Revisa las citas agendadas contigo." />
          </View>
        </ScrollView>
      </View>
    );
  }

  // paciente
  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <Text style={styles.topbarTitle}>Bienvenido a MediConnect</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <MaterialCommunityIcons name="heart-pulse" size={48} color={colors.white} />
          <Text style={styles.heroTitle}>Tu Salud, Nuestra Prioridad</Text>
          <Text style={styles.heroDesc}>
            Evita la automedicación. Agenda consultas con especialistas certificados, 
            accede a tu historial clínico digital y comunícate de forma segura con tu médico. 
            MediConnect centraliza toda tu atención médica en un solo lugar.
          </Text>
        </View>
        <View style={styles.features}>
          <Feature icon="magnify" title="Buscar Médico" desc="Encuentra especialistas por nombre o área médica." />
          <Feature icon="calendar-plus" title="Agendar Citas" desc="Reserva consultas según la disponibilidad real del médico." />
          <Feature icon="chat-processing" title="Consulta Online" desc="Chatea con tu médico de forma privada y segura." />
          <Feature icon="file-document-outline" title="Historial Digital" desc="Consulta tu historial clínico y recetas en cualquier momento." />
        </View>
      </ScrollView>
    </View>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.featureCard}>
      <MaterialCommunityIcons name={icon as any} size={28} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
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
  heroCard: { backgroundColor: colors.primary, borderRadius: radius.xxl, padding: 28, gap: 12, alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '900' as const, color: colors.white, textAlign: 'center' },
  heroDesc: { fontSize: typography.sizes.base, color: colors.white, opacity: 0.95, textAlign: 'center', lineHeight: 22 },
  features: { gap: 12 },
  featureCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 16 },
  featureTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.text },
  featureDesc: { fontSize: typography.sizes.sm, color: colors.muted, marginTop: 2 },
});
