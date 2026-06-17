import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { especialidadApi } from '../../src/api/endpoints';
import Alert from '../../src/components/Alert';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function AdminEspecialidadesScreen() {
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    especialidadApi.list().then((r) => setSpecialties(r.data?.especialidades || r.data || [])).catch((e) => setError(e?.response?.data?.error || 'Error'));
  }, []);

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroAdmin} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <Text style={styles.topbarTitle}>Especialidades</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Alert type="error" message={error} /> : null}
        {specialties.map((s) => (
          <View key={s.id} style={styles.card}>
            <MaterialCommunityIcons name="hospital-building" size={24} color={colors.primary} />
            <Text style={styles.name}>{s.nombre}</Text>
            <View style={[styles.badge, s.activo ? styles.active : styles.inactive]}>
              <Text style={styles.badgeText}>{s.activo ? 'Activa' : 'Inactiva'}</Text>
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
  content: { padding: 18, paddingBottom: 40, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 16 },
  name: { flex: 1, fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.text },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  active: { backgroundColor: colors.statusDoneBg },
  inactive: { backgroundColor: colors.statusCancelBg },
  badgeText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.black },
});
