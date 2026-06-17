import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { disponibilidadApi } from '../../src/api/endpoints';
import { getUser } from '../../src/auth/session';
import Alert from '../../src/components/Alert';
import PrimaryButton from '../../src/components/PrimaryButton';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

const DIAS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

interface DiaHorario {
  activo: boolean;
  hora_inicio: string;
  hora_fin: string;
}

export default function DisponibilidadScreen() {
  const [user, setUser] = useState<any>(null);
  const [horarios, setHorarios] = useState<Record<string, DiaHorario>>(() => {
    const init: Record<string, DiaHorario> = {};
    DIAS.forEach((d) => { init[d.key] = { activo: false, hora_inicio: '08:00', hora_fin: '17:00' }; });
    return init;
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUser().then((u) => setUser(u));
  }, []);

  const toggleDia = (key: string) => {
    setHorarios((prev) => ({ ...prev, [key]: { ...prev[key], activo: !prev[key].activo } }));
  };

  const setHora = (key: string, campo: 'hora_inicio' | 'hora_fin', valor: string) => {
    setHorarios((prev) => ({ ...prev, [key]: { ...prev[key], [campo]: valor } }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    const activos = DIAS.filter((d) => horarios[d.key].activo);
    if (activos.length === 0) return setError('Selecciona al menos un día.');

    setLoading(true);
    try {
      // Guardar cada día como un registro. Usamos fecha base del próximo lunes como referencia
      const hoy = new Date();
      const diaSemana = hoy.getDay(); // 0=dom, 1=lun
      const lunesActual = new Date(hoy);
      lunesActual.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));

      const diaIndex: Record<string, number> = { lunes:0, martes:1, miercoles:2, jueves:3, viernes:4, sabado:5, domingo:6 };

      for (const d of activos) {
        const fechaReg = new Date(lunesActual);
        fechaReg.setDate(lunesActual.getDate() + diaIndex[d.key]);
        const fechaStr = fechaReg.toISOString().split('T')[0];
        await disponibilidadApi.set({
          id_medico: user?.id || 0,
          fecha: fechaStr,
          hora_inicio: horarios[d.key].hora_inicio,
          hora_fin: horarios[d.key].hora_fin,
        });
      }
      setSuccess('Disponibilidad semanal guardada.');
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
        <Text style={styles.topbarTitle}>Mi Disponibilidad Semanal</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        <Text style={styles.desc}>Marca los días que atenderás y define tu horario. Puedes modificarlo cuando quieras.</Text>

        {DIAS.map((d) => (
          <View key={d.key} style={styles.dayCard}>
            <TouchableOpacity style={styles.dayHeader} onPress={() => toggleDia(d.key)}>
              <MaterialCommunityIcons
                name={horarios[d.key].activo ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={26}
                color={horarios[d.key].activo ? colors.primary : colors.muted}
              />
              <Text style={[styles.dayLabel, horarios[d.key].activo && styles.dayLabelActive]}>{d.label}</Text>
            </TouchableOpacity>

            {horarios[d.key].activo && (
              <View style={styles.horasRow}>
                <View style={styles.horaField}>
                  <Text style={styles.horaLabel}>Inicio</Text>
                  <TextInput
                    style={styles.horaInput}
                    value={horarios[d.key].hora_inicio}
                    onChangeText={(v) => setHora(d.key, 'hora_inicio', v)}
                    placeholder="HH:MM"
                  />
                </View>
                <View style={styles.horaField}>
                  <Text style={styles.horaLabel}>Fin</Text>
                  <TextInput
                    style={styles.horaInput}
                    value={horarios[d.key].hora_fin}
                    onChangeText={(v) => setHora(d.key, 'hora_fin', v)}
                    placeholder="HH:MM"
                  />
                </View>
              </View>
            )}
          </View>
        ))}

        <PrimaryButton title={loading ? 'Guardando...' : 'Guardar disponibilidad'} loading={loading} onPress={handleSave} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  topbar: { paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  topbarTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.white },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  desc: { fontSize: typography.sizes.base, color: colors.muted, lineHeight: 22 },
  dayCard: { backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 16, gap: 12 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayLabel: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.text },
  dayLabelActive: { color: colors.primary },
  horasRow: { flexDirection: 'row', gap: 12, paddingLeft: 38 },
  horaField: { flex: 1 },
  horaLabel: { fontSize: typography.sizes.xs, fontWeight: typography.weights.extrabold, color: colors.muted, textTransform: 'uppercase', marginBottom: 4 },
  horaInput: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: typography.sizes.base, color: colors.text },
});
