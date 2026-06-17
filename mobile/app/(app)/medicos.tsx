import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { userApi, especialidadApi } from '../../src/api/endpoints';
import Alert from '../../src/components/Alert';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function MedicosScreen() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dr, sr] = await Promise.all([userApi.doctors(), especialidadApi.list()]);
      setDoctors(dr.data?.medicos || dr.data || []);
      setSpecialties(sr.data?.especialidades || sr.data || []);
    } catch (e: any) { setError(e?.response?.data?.error || 'Error'); }
  };

  const filtered = doctors.filter((d) => {
    const matchName = !search || (d.nombre || '').toLowerCase().includes(search.toLowerCase());
    const matchSpec = !filterSpec || String(d.id_especialidad) === filterSpec;
    return matchName && matchSpec;
  });

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <Text style={styles.topbarTitle}>Buscar Médico</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Alert type="error" message={error} /> : null}
        <TextInput style={styles.input} placeholder="Buscar por nombre..." value={search} onChangeText={setSearch} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <TouchableOpacity style={[styles.chip, !filterSpec && styles.chipActive]} onPress={() => setFilterSpec('')}>
            <Text style={[styles.chipText, !filterSpec && styles.chipTextActive]}>Todas</Text>
          </TouchableOpacity>
          {specialties.map((s) => (
            <TouchableOpacity key={s.id} style={[styles.chip, filterSpec === String(s.id) && styles.chipActive]} onPress={() => setFilterSpec(String(s.id))}>
              <Text style={[styles.chipText, filterSpec === String(s.id) && styles.chipTextActive]}>{s.nombre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {filtered.map((d) => (
          <View key={d.id} style={styles.card}>
            <MaterialCommunityIcons name="doctor" size={32} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{d.nombre}</Text>
              <Text style={styles.email}>{d.email}</Text>
              <Text style={styles.spec}>{d.especialidad || 'Médico general'}</Text>
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
  input: { backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 12, fontSize: typography.sizes.base, color: colors.text },
  chips: { flexDirection: 'row', gap: 8, paddingBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.text },
  chipTextActive: { color: colors.white },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 16 },
  name: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.text },
  email: { fontSize: typography.sizes.sm, color: colors.muted },
  spec: { fontSize: typography.sizes.xs, fontWeight: typography.weights.extrabold, color: colors.primaryDark, marginTop: 2 },
});
