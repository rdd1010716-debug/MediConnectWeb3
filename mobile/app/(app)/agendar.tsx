import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { userApi, especialidadApi, citaApi, disponibilidadApi } from '../../src/api/endpoints';
import { getUser } from '../../src/auth/session';
import Alert from '../../src/components/Alert';
import PrimaryButton from '../../src/components/PrimaryButton';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function AgendarScreen() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState<any[]>([]);
  const [loadingDisp, setLoadingDisp] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u || u.rol !== 'paciente') {
        router.replace('/dashboard');
        return;
      }
      try {
        const [dr, sr] = await Promise.all([userApi.doctors(), especialidadApi.list()]);
        const meds = dr.data?.medicos || dr.data || [];
        const specs = sr.data?.especialidades || sr.data || [];
        setDoctors(meds);
        setSpecialties(specs);
      } catch (e: any) {
        setError(e?.message || 'Error al cargar datos');
      }
    })();
  }, []);

  const filtered = doctors.filter((d) =>
    d.nombre?.toLowerCase().includes(search.trim().toLowerCase()) ||
    d.correo?.toLowerCase().includes(search.trim().toLowerCase())
  );

  const getSpecialtyName = (id: number) => specialties.find((s) => s.id === id)?.nombre || '';

  const handleSelectDoctor = async (doc: any) => {
    setSelectedDoctor(doc);
    setSearch(doc.nombre);
    setShowModal(true);
    setLoadingDisp(true);
    try {
      const res = await disponibilidadApi.getByMedico(doc.id);
      setDisponibilidad(res.data?.disponibilidades || []);
    } catch {
      setDisponibilidad([]);
    } finally {
      setLoadingDisp(false);
    }
  };

  const confirmDoctor = () => {
    setShowModal(false);
  };

  const handleBook = async () => {
    setError('');
    setSuccess('');
    if (!selectedDoctor) return setError('Selecciona un médico.');
    if (!fecha.trim()) return setError('Ingresa la fecha (YYYY-MM-DD).');
    if (!hora.trim()) return setError('Ingresa la hora (HH:MM).');

    setLoading(true);
    try {
      await citaApi.book({ id_medico: selectedDoctor.id, fecha, hora });
      setSuccess('Cita agendada con éxito.');
      setSelectedDoctor(null);
      setSearch('');
      setFecha('');
      setHora('');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'No se pudo agendar la cita';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <Text style={styles.topbarTitle}>Agendar cita</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        <Text style={styles.sectionTitle}>Buscar médico</Text>
        <View style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Escribe nombre o correo..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={(t) => { setSearch(t); setSelectedDoctor(null); }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setSelectedDoctor(null); }}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {!selectedDoctor && search.trim().length > 0 && (
          <View style={styles.dropdown}>
            {filtered.length === 0 && <Text style={styles.dropdownEmpty}>Sin resultados</Text>}
            {filtered.map((d) => (
              <TouchableOpacity key={d.id} style={styles.dropdownItem} onPress={() => handleSelectDoctor(d)}>
                <Text style={styles.dropdownItemName}>{d.nombre}</Text>
                <Text style={styles.dropdownItemMeta}>{getSpecialtyName(d.id_especialidad)} • {d.correo}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedDoctor && (
          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <MaterialCommunityIcons name="doctor" size={32} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>{selectedDoctor.nombre}</Text>
              <Text style={styles.doctorMeta}>{getSpecialtyName(selectedDoctor.id_especialidad)}</Text>
              <Text style={styles.doctorMeta}>{selectedDoctor.correo}</Text>
            </View>
            <TouchableOpacity onPress={() => { setSelectedDoctor(null); setSearch(''); }}>
              <MaterialCommunityIcons name="close" size={22} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Fecha</Text>
        <TextInput style={styles.input} placeholder="Ej: 2026-06-25" value={fecha} onChangeText={setFecha} />

        <Text style={styles.sectionTitle}>Hora</Text>
        <TextInput style={styles.input} placeholder="Ej: 14:30" value={hora} onChangeText={setHora} />

        <PrimaryButton title={loading ? 'Agendando...' : 'Agendar cita'} loading={loading} onPress={handleBook} />
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LinearGradient colors={gradients.heroDoctor} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalHeader}>
              <MaterialCommunityIcons name="doctor" size={48} color={colors.white} />
              <Text style={styles.modalName}>{selectedDoctor?.nombre}</Text>
              <Text style={styles.modalSpec}>{getSpecialtyName(selectedDoctor?.id_especialidad)}</Text>
            </LinearGradient>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.modalRow}>
                <MaterialCommunityIcons name="email-outline" size={20} color={colors.primary} />
                <Text style={styles.modalText}>{selectedDoctor?.correo || selectedDoctor?.email || '—'}</Text>
              </View>
              <Text style={styles.modalSection}>Disponibilidad</Text>
              {loadingDisp ? (
                <ActivityIndicator color={colors.primary} />
              ) : disponibilidad.length === 0 ? (
                <Text style={styles.modalEmpty}>No hay disponibilidad registrada</Text>
              ) : (
                disponibilidad.map((d, i) => (
                  <View key={i} style={styles.dispRow}>
                    <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
                    <Text style={styles.dispText}>{d.fecha} · {d.hora_inicio} - {d.hora_fin}</Text>
                  </View>
                ))
              )}
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmDoctor}>
                <Text style={styles.modalConfirmText}>Seleccionar este medico</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalClose} onPress={() => { setShowModal(false); setSelectedDoctor(null); setSearch(''); }}>
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  topbar: {
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl,
  },
  topbarTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.white },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text, marginTop: 8 },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: typography.sizes.md, color: colors.text,
  },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: typography.sizes.base, color: colors.text },
  dropdown: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, overflow: 'hidden', marginTop: 4,
  },
  dropdownEmpty: { padding: 14, color: colors.muted, fontSize: typography.sizes.base },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownItemName: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.text },
  dropdownItemMeta: { fontSize: typography.sizes.sm, color: colors.muted, marginTop: 2 },
  doctorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.primary,
    borderRadius: radius.xxl, padding: 16,
  },
  doctorAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  doctorName: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.text },
  doctorMeta: { fontSize: typography.sizes.sm, color: colors.muted, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxHeight: '80%', backgroundColor: colors.card, borderRadius: radius.xxl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  modalHeader: { paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center', gap: 10 },
  modalName: { fontSize: 22, fontWeight: '900' as const, color: colors.white },
  modalSpec: { fontSize: typography.sizes.base, color: colors.white, opacity: 0.9 },
  modalBody: { padding: 24, gap: 14 },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalText: { fontSize: typography.sizes.base, color: colors.text },
  modalSection: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text, marginTop: 8 },
  modalEmpty: { color: colors.muted, fontSize: typography.sizes.base, marginTop: 4 },
  dispRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  dispText: { fontSize: typography.sizes.base, color: colors.text },
  modalConfirm: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: 8 },
  modalConfirmText: { color: colors.white, fontWeight: typography.weights.bold, fontSize: typography.sizes.base },
  modalClose: { backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: 8 },
  modalCloseText: { color: colors.text, fontWeight: typography.weights.bold, fontSize: typography.sizes.base },
});
