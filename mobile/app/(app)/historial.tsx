import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { historiaApi, citaApi, chatApi } from '../../src/api/endpoints';
import { getUser } from '../../src/auth/session';
import Alert from '../../src/components/Alert';
import PrimaryButton from '../../src/components/PrimaryButton';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function HistorialScreen() {
  const { id_cita } = useLocalSearchParams<{ id_cita?: string }>();
  const [user, setUser] = useState<any>(null);
  const [historia, setHistoria] = useState<any>(null);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [citas, setCitas] = useState<any[]>([]);
  const [selectedCitaId, setSelectedCitaId] = useState<number | null>(null);
  const [showCitaPicker, setShowCitaPicker] = useState(false);

  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
      try {
        const cr = await citaApi.mine();
        const lista = cr.data?.citas || cr.data || [];
        setCitas(lista);
        const initialId = id_cita ? Number(id_cita) : null;
        if (initialId) {
          setSelectedCitaId(initialId);
          await loadHistoria(initialId);
        } else if (lista.length === 1) {
          setSelectedCitaId(lista[0].id);
          await loadHistoria(lista[0].id);
        }
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Error al cargar citas');
      } finally {
        setLoading(false);
      }
    })();
  }, [id_cita]);

  const loadHistoria = async (citaId: number) => {
    try {
      const res = await historiaApi.getByCita(citaId);
      setHistoria(res.data);
      setExists(true);
      setDiagnostico(res.data?.diagnostico || '');
      setTratamiento(res.data?.tratamiento || '');
      setNotas(res.data?.notas_medicas || '');
    } catch {
      setHistoria(null);
      setExists(false);
      setDiagnostico('');
      setTratamiento('');
      setNotas('');
    }
  };

  const handleSelectCita = async (cid: number) => {
    setSelectedCitaId(cid);
    setShowCitaPicker(false);
    await loadHistoria(cid);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!selectedCitaId) return setError('Selecciona una cita medica');
    setSaving(true);
    try {
      if (exists) {
        await historiaApi.update(selectedCitaId, { diagnostico, tratamiento, notas_medicas: notas });
      } else {
        await historiaApi.create({ id_cita: selectedCitaId, diagnostico, tratamiento, notas_medicas: notas });
        setExists(true);
      }
      const res = await historiaApi.getByCita(selectedCitaId);
      setHistoria(res.data);
      setSuccess('Historia guardada correctamente');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudo guardar la historia');
    } finally {
      setSaving(false);
    }
  };

  const handleSendToChat = async () => {
    if (!selectedCitaId) return;
    setSending(true);
    try {
      const resumen = `📋 *Historial actualizado*\n\n*Diagnostico:* ${diagnostico || '—'}\n*Tratamiento:* ${tratamiento || '—'}\n*Notas:* ${notas || '—'}`;
      await chatApi.enviar({ id_cita: selectedCitaId, contenido: resumen });
      setSuccess('Resumen enviado al chat');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudo enviar al chat');
    } finally {
      setSending(false);
    }
  };

  const selectedCita = citas.find((c) => c.id === selectedCitaId);

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Historial clinico</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cita medica</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCitaPicker((v) => !v)}>
            <Text style={styles.pickerBtnText}>
              {selectedCita ? `Cita #${selectedCita.id} - ${selectedCita.fecha} ${selectedCita.hora}` : 'Seleccionar cita...'}
            </Text>
            <MaterialCommunityIcons name={showCitaPicker ? 'chevron-up' : 'chevron-down'} size={22} color={colors.primary} />
          </TouchableOpacity>

          {showCitaPicker && (
            <View style={styles.pickerList}>
              {citas.length === 0 && <Text style={styles.pickerEmpty}>No tienes citas registradas</Text>}
              {citas.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.pickerItem, selectedCitaId === c.id && styles.pickerItemActive]}
                  onPress={() => handleSelectCita(c.id)}
                >
                  <Text style={[styles.pickerItemText, selectedCitaId === c.id && styles.pickerItemTextActive]}>
                    #{c.id} — {c.fecha} {c.hora}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {selectedCita && historia && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Historial registrado</Text>
            <Text style={styles.label}>Diagnostico</Text>
            <Text style={styles.value}>{historia.diagnostico || '—'}</Text>
            <Text style={styles.label}>Tratamiento</Text>
            <Text style={styles.value}>{historia.tratamiento || '—'}</Text>
            <Text style={styles.label}>Notas medicas</Text>
            <Text style={styles.value}>{historia.notas_medicas || '—'}</Text>
          </View>
        )}

        {user?.rol === 'medico' && selectedCita && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Registrar / Actualizar</Text>
            <Text style={styles.label}>Diagnostico</Text>
            <TextInput style={styles.input} value={diagnostico} onChangeText={setDiagnostico} multiline />
            <Text style={styles.label}>Tratamiento</Text>
            <TextInput style={styles.input} value={tratamiento} onChangeText={setTratamiento} multiline />
            <Text style={styles.label}>Notas medicas</Text>
            <TextInput style={styles.input} value={notas} onChangeText={setNotas} multiline />
            <PrimaryButton title={saving ? 'Guardando...' : 'Guardar historia'} loading={saving} onPress={handleSave} />
            <TouchableOpacity style={styles.sendChatBtn} onPress={handleSendToChat} disabled={sending}>
              <MaterialCommunityIcons name="chat-processing" size={18} color={colors.primary} />
              <Text style={styles.sendChatText}>{sending ? 'Enviando...' : 'Enviar resumen al chat'}</Text>
            </TouchableOpacity>
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
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 14,
  },
  pickerBtnText: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.text },
  pickerList: { marginTop: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerItemActive: { backgroundColor: colors.primaryLight },
  pickerItemText: { fontSize: typography.sizes.base, color: colors.text },
  pickerItemTextActive: { fontWeight: typography.weights.bold, color: colors.primary },
  pickerEmpty: { padding: 14, color: colors.muted, fontSize: typography.sizes.base },
  sendChatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 8, paddingVertical: 12, borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  sendChatText: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.primary },
});
