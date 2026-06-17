import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUser } from '../../../src/auth/session';
import { citaApi } from '../../../src/api/endpoints';
import Alert from '../../../src/components/Alert';
import { colors, radius, typography, gradients } from '../../../src/constants/theme';

export default function ChatsIndexScreen() {
  const [user, setUser] = useState<any>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getUser().then((u) => { setUser(u); if (u) loadCitas(); });
  }, []);

  const loadCitas = async () => {
    try {
      const res = await citaApi.mine();
      const all = res.data?.citas || res.data || [];
      setCitas(all.filter((c: any) => c.estado !== 'cancelada'));
    } catch (e: any) { setError(e?.response?.data?.error || 'Error'); }
  };

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <Text style={styles.topbarTitle}>Mis Chats</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Alert type="error" message={error} /> : null}
        {citas.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="chat-remove" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>No tienes chats activos</Text>
            <Text style={styles.emptyText}>Agenda una cita para iniciar un chat con tu médico.</Text>
          </View>
        ) : citas.map((c) => (
          <TouchableOpacity key={c.id} style={styles.card} onPress={() => router.push(`/chats/detail?idCita=${c.id}`)}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="chat-processing" size={24} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Cita #{c.id}</Text>
              <Text style={styles.sub}>{c.fecha} · {c.hora}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.muted} />
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
  content: { padding: 18, paddingBottom: 40, gap: 12 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.muted, marginTop: 12 },
  emptyText: { fontSize: typography.sizes.base, color: colors.muted, marginTop: 4, textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.text },
  sub: { fontSize: typography.sizes.sm, color: colors.muted },
});
