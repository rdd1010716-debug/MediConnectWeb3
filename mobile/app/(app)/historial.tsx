import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { historiaApi } from '../../src/api/endpoints';
import { getUser } from '../../src/auth/session';
import Alert from '../../src/components/Alert';
import PrimaryButton from '../../src/components/PrimaryButton';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function HistorialScreen() {
  const { id_cita } = useLocalSearchParams<{ id_cita?: string }>();
  const [user, setUser] = useState<any>(null);
  const [historia, setHistoria] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form fields for médico
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
      if (!id_cita) { setLoading(false); return; }
      try {
        const res = await historiaApi.getByCita(Number(id_cita));
        setHistoria(res.data);
        setDiagnostico(res.data?.diagnostico || '');
        setTratamiento(res.data?.tratamiento || '');
        setNotas(res.data?.notas_medicas || '');
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Historia no encontrada');
      } finally {
        setLoading(false);
      }
    })();
  }, [id_cita]);

  const handleSave = async () => {
    setError('');
    if (!id_cita) return setError('Falta ID de cita');
    try {
      await historiaApi.create({
        id_cita: Number(id_cita),
        diagnostico,
        tratamiento,
        notas_medicas: notas,
      });
      const res = await historiaApi.getByCita(Number(id_cita));
      setHistoria(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudo guardar la historia');
    }
  };

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Historial clínico</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Alert type="error" message={error} /> : null}

        {historia && (
          <View style={styles.card}>
            <Text style={styles.label}>Diagnóstico</Text>
            <Text style={styles.value}>{historia.diagnostico || '—'}</Text>
            <Text style={styles.label}>Tratamiento</Text>
            <Text style={styles.value}>{historia.tratamiento || '—'}</Text>
            <Text style={styles.label}>Notas médicas</Text>
            <Text style={styles.value}>{historia.notas_medicas || '—'}</Text>
          </View>
        )}

        {user?.rol === 'medico' && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Registrar / Actualizar</Text>
            <Text style={styles.label}>Diagnóstico</Text>
            <TextInput style={styles.input} value={diagnostico} onChangeText={setDiagnostico} multiline />
            <Text style={styles.label}>Tratamiento</Text>
            <TextInput style={styles.input} value={tratamiento} onChangeText={setTratamiento} multiline />
            <Text style={styles.label}>Notas médicas</Text>
            <TextInput style={styles.input} value={notas} onChangeText={setNotas} multiline />
            <PrimaryButton title="Guardar historia" onPress={handleSave} />
          </View>
        )}
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
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  card: {
    backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xxl, padding: 18, gap: 10,
  },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text },
  label: { fontSize: typography.sizes.base, fontWeight: typography.weights.extrabold, color: colors.primaryDark },
  value: { fontSize: typography.sizes.base, color: colors.text },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: typography.sizes.base, color: colors.text, minHeight: 80,
  },
});
