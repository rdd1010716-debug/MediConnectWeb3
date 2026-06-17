import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
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
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

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

  const getSpecName = (id?: number) => specialties.find((s) => s.id === id)?.nombre || 'Medico general';

  const filtered = doctors.filter((d) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const nameMatch = (d.nombre || '').toLowerCase().includes(term);
    const specMatch = getSpecName(d.id_especialidad).toLowerCase().includes(term);
    return nameMatch || specMatch;
  });

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <Text style={styles.topbarTitle}>Buscar Medico</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Alert type="error" message={error} /> : null}
        <View style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} />
          <TextInput style={styles.searchInput} placeholder="Buscar por nombre o especialidad..." value={search} onChangeText={setSearch} placeholderTextColor={colors.muted} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {filtered.map((d) => (
          <TouchableOpacity key={d.id} style={styles.card} onPress={() => setSelected(d)}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="doctor" size={28} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{d.nombre}</Text>
              <Text style={styles.spec}>{getSpecName(d.id_especialidad)}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.muted} />
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && !error && (
          <Text style={styles.empty}>No se encontraron medicos</Text>
        )}
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LinearGradient colors={gradients.heroDoctor} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalHeader}>
              <MaterialCommunityIcons name="doctor" size={48} color={colors.white} />
              <Text style={styles.modalName}>{selected?.nombre}</Text>
              <Text style={styles.modalSpec}>{getSpecName(selected?.id_especialidad)}</Text>
            </LinearGradient>
            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <MaterialCommunityIcons name="email-outline" size={20} color={colors.primary} />
                <Text style={styles.modalText}>{selected?.correo || selected?.email || '—'}</Text>
              </View>
              <View style={styles.modalRow}>
                <MaterialCommunityIcons name="phone-outline" size={20} color={colors.primary} />
                <Text style={styles.modalText}>{selected?.telefono || '—'}</Text>
              </View>
              <View style={styles.modalRow}>
                <MaterialCommunityIcons name="card-account-details-outline" size={20} color={colors.primary} />
                <Text style={styles.modalText}>DNI: {selected?.dni || '—'}</Text>
              </View>
              <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  topbar: { paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  topbarTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.white },
  content: { padding: 18, paddingBottom: 40, gap: 12 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: typography.sizes.base, color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.text },
  spec: { fontSize: typography.sizes.sm, color: colors.muted, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40, fontSize: typography.sizes.base },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', backgroundColor: colors.card, borderRadius: radius.xxl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  modalHeader: { paddingVertical: 32, paddingHorizontal: 24, alignItems: 'center', gap: 10 },
  modalName: { fontSize: 22, fontWeight: '900' as const, color: colors.white },
  modalSpec: { fontSize: typography.sizes.base, color: colors.white, opacity: 0.9 },
  modalBody: { padding: 24, gap: 16 },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalText: { fontSize: typography.sizes.base, color: colors.text },
  modalClose: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: 8 },
  modalCloseText: { color: colors.white, fontWeight: typography.weights.bold, fontSize: typography.sizes.base },
});
