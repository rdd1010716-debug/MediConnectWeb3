import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUser, logoutUser } from '../src/auth/session';
import { userApi, especialidadApi, citaApi } from '../src/api/endpoints';
import StatCard from '../src/components/StatCard';
import Alert from '../src/components/Alert';
import { colors, radius, typography, shadows, gradients } from '../src/constants/theme';
import type { User, Doctor, Cita, Especialidad } from '../src/types';

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [specialties, setSpecialties] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u) { router.replace('/login'); return; }
      setUser(u);
      loadData();
    })();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dr, ar, sr] = await Promise.allSettled([
        userApi.doctors(),
        citaApi.mine(),
        especialidadApi.list(),
      ]);

      if (dr.status === 'fulfilled') {
        const payload = dr.value.data;
        setDoctors(payload.medicos || payload.data || []);
      }
      if (ar.status === 'fulfilled') {
        const payload = ar.value.data;
        setAppointments(payload.citas || payload.data || []);
      }
      if (sr.status === 'fulfilled') {
        const payload = sr.value.data;
        setSpecialties(payload.especialidades || payload.data || []);
      }
    } catch (e: any) {
      setError(e?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const activeAppointments = appointments.filter((c) => c.estado !== 'cancelada');
  const role = user?.rol || 'paciente';

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/login');
  };

  const statusStyle = (estado: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      cancelada: { bg: colors.statusCancelBg, color: colors.statusCancelText },
      programada: { bg: colors.statusDoneBg, color: colors.statusDoneText },
      finalizada: { bg: colors.statusFinalBg, color: colors.statusFinalText },
      en_progreso: { bg: colors.statusProgressBg, color: colors.statusProgressText },
    };
    return map[estado] || { bg: colors.statusDefaultBg, color: colors.statusDefaultText };
  };

  const heroGradient = role === 'medico' ? gradients.heroDoctor : role === 'admin' ? gradients.heroAdmin : gradients.heroPatient;
  const heroTitle = role === 'medico' ? 'Panel médico' : role === 'admin' ? 'Panel administrativo' : 'Agenda y seguimiento médico';
  const heroOverline = role === 'medico' ? 'Portal médico' : role === 'admin' ? 'Portal administrativo' : 'Portal paciente';
  const heroBadge = role === 'medico' ? 'Médico' : role === 'admin' ? 'Admin' : 'Paciente';

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />

      <LinearGradient
        colors={heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topbar}
      >
        <View>
          <Text style={styles.topbarOverline}>Sistema de Telemedicina</Text>
          <Text style={styles.topbarTitle}>Panel {role}</Text>
        </View>
        <View style={styles.profilePill}>
          <MaterialCommunityIcons name="account-circle" size={20} color={colors.primaryDark} />
          <Text style={styles.profileName} numberOfLines={1}>
            {user?.nombre || 'Usuario'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroText}>
            <Text style={styles.heroOverline}>{heroOverline}</Text>
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroDesc}>
              {role === 'medico'
                ? 'Gestiona tus citas, disponibilidad y atenciones médicas.'
                : role === 'admin'
                ? 'Monitorea usuarios, citas y especialidades del sistema.'
                : 'Selecciona un médico, agenda una cita según disponibilidad y revisa tu historial clínico.'}
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{heroBadge}</Text>
          </View>
        </LinearGradient>

        {error ? <Alert type="error" message={error} /> : null}

        <View style={styles.statsRow}>
          <StatCard
            label="Citas activas"
            value={activeAppointments.length}
            detail="Programadas"
            icon={<MaterialCommunityIcons name="calendar-check" size={22} color={colors.primaryDark} />}
          />
          <StatCard
            label="Médicos"
            value={doctors.length}
            detail="Disponibles"
            icon={<MaterialCommunityIcons name="stethoscope" size={22} color={colors.primaryDark} />}
          />
          <StatCard
            label="Especialidades"
            value={specialties.length}
            detail="Áreas médicas"
            icon={<MaterialCommunityIcons name="account-group" size={22} color={colors.primaryDark} />}
          />
        </View>

        {role === 'paciente' && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/agendar')}>
            <MaterialCommunityIcons name="calendar-plus" size={20} color={colors.white} />
            <Text style={styles.actionBtnText}>Agendar nueva cita</Text>
          </TouchableOpacity>
        )}

        {role === 'medico' && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/disponibilidad')}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.white} />
            <Text style={styles.actionBtnText}>Configurar disponibilidad</Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Citas</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : appointments.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="calendar-blank" size={40} color={colors.muted} />
              <Text style={styles.emptyTitle}>No tienes citas</Text>
              <Text style={styles.emptyText}>Agenda una consulta para iniciar tu atención médica.</Text>
            </View>
          ) : (
            appointments.map((cita) => {
              const s = statusStyle(cita.estado);
              return (
                <View key={cita.id} style={styles.appointmentRow}>
                  <View style={styles.apptInfo}>
                    <Text style={styles.apptId}>#{cita.id}</Text>
                    <Text style={styles.apptDoctor}>
                      {cita.medico_nombre || cita.medico || `Médico #${cita.id_medico}`}
                    </Text>
                    <Text style={styles.apptDate}>{cita.fecha} · {cita.hora}</Text>
                  </View>
                  <View style={styles.apptActions}>
                    <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
                      <Text style={[styles.statusText, { color: s.color }]}>
                        {cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1)}
                      </Text>
                    </View>
                    {(cita.estado === 'programada' || cita.estado === 'en_progreso') && (
                      <TouchableOpacity onPress={() => router.push(`/chat/${cita.id}`)}>
                        <MaterialCommunityIcons name="chat-processing" size={22} color={colors.primaryDark} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => router.push(`/historial?id_cita=${cita.id}`)}>
                      <MaterialCommunityIcons name="file-document-outline" size={22} color={colors.primaryDark} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topbar: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  topbarOverline: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extrabold,
    color: colors.white,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  topbarTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
    color: colors.white,
    textTransform: 'capitalize',
    letterSpacing: -0.5,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: 180,
  },
  profileName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.black,
    color: colors.text,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
    gap: 18,
  },
  heroCard: {
    borderRadius: radius.xxl,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.card,
  },
  heroText: {
    flex: 1,
    marginRight: 12,
  },
  heroOverline: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extrabold,
    color: colors.white,
    opacity: 0.78,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: colors.white,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    opacity: 0.9,
    lineHeight: 20,
  },
  heroBadge: {
    backgroundColor: colors.white18,
    borderWidth: 1,
    borderColor: colors.white30,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroBadgeText: {
    color: colors.white,
    fontWeight: typography.weights.black,
    fontSize: typography.sizes.xs,
  },
  statsRow: {
    gap: 10,
  },
  section: {
    backgroundColor: colors.cardTranslucent,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    padding: 18,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.8,
    marginBottom: 14,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 10,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  apptInfo: {
    flex: 1,
  },
  apptId: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.black,
    color: colors.primaryDark,
  },
  apptDoctor: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 2,
  },
  apptDate: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: 1,
  },
  apptActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primaryDark,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  actionBtnText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.base,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: colors.logoutBg,
    borderRadius: radius.md,
  },
  logoutText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.black,
    color: colors.danger,
  },
});
