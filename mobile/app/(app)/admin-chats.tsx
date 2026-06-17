import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert as RNAlert } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUser } from '../../src/auth/session';
import { citaApi } from '../../src/api/endpoints';
import Alert from '../../src/components/Alert';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function AdminChatsScreen() {
  const [user, setUser] = useState<any>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [password, setPassword] = useState('');
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getUser().then((u) => { setUser(u); if (u?.rol === 'admin') loadCitas(); });
  }, []);

  const loadCitas = async () => {
    try {
      const res = await citaApi.mine();
      setCitas(res.data?.citas || res.data || []);
    } catch (e: any) { setError(e?.response?.data?.error || 'Error'); }
  };

  const verify = () => {
    setError('');
    if (!password.trim()) return setError('Ingresa la contraseña de administrador.');
    // Simulación: la contraseña es la misma que usó para login (no la tenemos encriptada aquí)
    // En producción debería verificar contra el backend
    setVerified(true);
  };

  if (!verified) {
    return (
      <View style={styles.shell}>
        <StatusBar style="light" />
        <LinearGradient colors={gradients.heroAdmin} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
          <Text style={styles.topbarTitle}>Chats (Admin)</Text>
        </LinearGradient>
        <View style={styles.center}>
          <MaterialCommunityIcons name="shield-account" size={64} color={colors.primary} />
          <Text style={styles.lockTitle}>Acceso Restringido</Text>
          <Text style={styles.lockDesc}>Ingresa la contraseña de administrador para ver los chats.</Text>
          {error ? <Alert type="error" message={error} /> : null}
          <TextInput style={styles.input} placeholder="Contraseña admin" secureTextEntry value={password} onChangeText={setPassword} />
          <TouchableOpacity style={styles.btn} onPress={verify}>
            <Text style={styles.btnText}>Verificar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroAdmin} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <Text style={styles.topbarTitle}>Chats (Solo lectura)</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        {citas.filter((c) => c.estado !== 'cancelada').map((c) => (
          <TouchableOpacity key={c.id} style={styles.card} onPress={() => router.push(`/chats/detail?idCita=${c.id}`)}>
            <View style={styles.row}>
              <Text style={styles.id}>Chat Cita #{c.id}</Text>
              <MaterialCommunityIcons name="eye" size={20} color={colors.primary} />
            </View>
            <Text style={styles.info}>Paciente #{c.id_paciente} ↔ Médico #{c.id_medico}</Text>
            <Text style={styles.date}>{c.fecha} · {c.hora}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  topbar: { paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  topbarTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 14 },
  lockTitle: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.black, color: colors.text },
  lockDesc: { fontSize: typography.sizes.base, color: colors.muted, textAlign: 'center' },
  input: { width: '100%', backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 14, fontSize: typography.sizes.base, color: colors.text },
  btn: { width: '100%', backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: colors.white, fontWeight: typography.weights.bold, fontSize: typography.sizes.base },
  content: { padding: 18, paddingBottom: 40, gap: 12 },
  card: { backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 16, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.primaryDark },
  info: { fontSize: typography.sizes.base, color: colors.text },
  date: { fontSize: typography.sizes.sm, color: colors.muted },
});
