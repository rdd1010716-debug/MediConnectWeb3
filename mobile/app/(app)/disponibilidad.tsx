import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { disponibilidadApi } from '../../src/api/endpoints';
import { getUser } from '../../src/auth/session';
import Alert from '../../src/components/Alert';
import PrimaryButton from '../../src/components/PrimaryButton';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function DisponibilidadScreen() {
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!fecha.trim()) return setError('Ingresa la fecha.');
    if (!horaInicio.trim()) return setError('Ingresa hora inicio.');
    if (!horaFin.trim()) return setError('Ingresa hora fin.');

    setLoading(true);
    try {
      const user = await getUser();
      await disponibilidadApi.set({
        id_medico: user?.id || 0,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
      });
      setSuccess('Disponibilidad guardada.');
      setFecha('');
      setHoraInicio('');
      setHoraFin('');
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroDoctor} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Disponibilidad</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        <Text style={styles.label}>Fecha</Text>
        <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />

        <Text style={styles.label}>Hora inicio</Text>
        <TextInput style={styles.input} placeholder="HH:MM" value={horaInicio} onChangeText={setHoraInicio} />

        <Text style={styles.label}>Hora fin</Text>
        <TextInput style={styles.input} placeholder="HH:MM" value={horaFin} onChangeText={setHoraFin} />

        <PrimaryButton title={loading ? 'Guardando...' : 'Guardar disponibilidad'} loading={loading} onPress={handleSave} />
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
  topbarTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.black, color: colors.white },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  label: { fontSize: typography.sizes.base, fontWeight: typography.weights.extrabold, color: colors.primaryDark },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: typography.sizes.md, color: colors.text,
  },
});
