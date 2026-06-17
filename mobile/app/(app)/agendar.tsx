import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { userApi, especialidadApi, citaApi } from '../../src/api/endpoints';
import { getUser } from '../../src/auth/session';
import Alert from '../../src/components/Alert';
import PrimaryButton from '../../src/components/PrimaryButton';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function AgendarScreen() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      const u = await getUser();
      if (!u || u.rol !== 'paciente') {
        router.replace('/dashboard');
        return;
      }
      try {
        const [dr, sr] = await Promise.all([userApi.doctors(), especialidadApi.list()]);
        setDoctors(dr.data?.medicos || dr.data || []);
        setSpecialties(sr.data?.especialidades || sr.data || []);
      } catch (e: any) {
        setError(e?.message || 'Error al cargar datos');
      }
    })();
  }, []);

  const handleBook = async () => {
    setError('');
    setSuccess('');
    if (!selectedDoctor) return setError('Selecciona un médico.');
    if (!fecha.trim()) return setError('Ingresa la fecha (YYYY-MM-DD).');
    if (!hora.trim()) return setError('Ingresa la hora (HH:MM).');

    setLoading(true);
    try {
      await citaApi.book({ id_medico: selectedDoctor, fecha, hora });
      setSuccess('Cita agendada con éxito.');
      setSelectedDoctor(null);
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

        <Text style={styles.sectionTitle}>Médico</Text>
        {doctors.map((d) => (
          <TouchableOpacity
            key={d.id}
            style={[styles.chip, selectedDoctor === d.id && styles.chipActive]}
            onPress={() => setSelectedDoctor(d.id)}
          >
            <Text style={[styles.chipText, selectedDoctor === d.id && styles.chipTextActive]}>
              {d.nombre}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Fecha</Text>
        <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />

        <Text style={styles.sectionTitle}>Hora</Text>
        <TextInput style={styles.input} placeholder="HH:MM" value={hora} onChangeText={setHora} />

        <PrimaryButton title={loading ? 'Agendando...' : 'Agendar cita'} loading={loading} onPress={handleBook} />
      </ScrollView>
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
  chip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill,
    backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: typography.weights.bold },
  chipTextActive: { color: colors.white },
});
