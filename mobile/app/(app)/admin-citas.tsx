import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { citaApi } from '../../src/api/endpoints';
import Alert from '../../src/components/Alert';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function AdminCitasScreen() {
  const [citas, setCitas] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    citaApi.mine().then((r) => setCitas(r.data?.citas || r.data || [])).catch((e) => setError(e?.response?.data?.error || 'Error'));
  }, []);

  const statusStyle = (estado: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      cancelada: { bg: colors.statusCancelBg, color: colors.statusCancelText },
      programada: { bg: colors.statusDoneBg, color: colors.statusDoneText },
      finalizada: { bg: colors.statusFinalBg, color: colors.statusFinalText },
      en_progreso: { bg: colors.statusProgressBg, color: colors.statusProgressText },
    };
    return map[estado] || { bg: colors.statusDefaultBg, color: colors.statusDefaultText };
  };

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroAdmin} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <Text style={styles.topbarTitle}>Citas Registradas</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Alert type="error" message={error} /> : null}
        {citas.map((c) => {
          const s = statusStyle(c.estado);
          return (
            <View key={c.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.id}>#{c.id}</Text>
                <View style={[styles.pill, { backgroundColor: s.bg }]}>
                  <Text style={[styles.pillText, { color: s.color }]}>{c.estado}</Text>
                </View>
              </View>
              <Text style={styles.info}>Paciente #{c.id_paciente} → Médico #{c.id_medico}</Text>
              <Text style={styles.date}>{c.fecha} · {c.hora}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  topbar: { paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  topbarTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.white },
  content: { padding: 18, paddingBottom: 40, gap: 12 },
  card: { backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 16, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontSize: typography.sizes.md, fontWeight: typography.weights.black, color: colors.primaryDark },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  pillText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.black },
  info: { fontSize: typography.sizes.base, color: colors.text },
  date: { fontSize: typography.sizes.sm, color: colors.muted },
});
