import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getUser } from '../../src/auth/session';
import { citaApi } from '../../src/api/endpoints';
import Alert from '../../src/components/Alert';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function CitasScreen() {
  const [user, setUser] = useState<any>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUser().then((u) => { setUser(u); loadCitas(); });
  }, []);

  const loadCitas = async () => {
    setLoading(true);
    try {
      const res = await citaApi.mine();
      setCitas(res.data?.citas || res.data?.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = (estado: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      cancelada: { bg: colors.statusCancelBg, color: colors.statusCancelText },
      programada: { bg: colors.statusDoneBg, color: colors.statusDoneText },
      finalizada: { bg: colors.statusFinalBg, color: colors.statusFinalText },
      en_progreso: { bg: colors.statusProgressBg, color: colors.statusProgressText },
    };
    return map[estado] || { bg: colors.statusDefaultBg, color: colors.statusDefaultText };
  };

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <Text style={styles.topbarTitle}>Mis Citas</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.content}>
        {error ? <Alert type="error" message={error} /> : null}
        {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : citas.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>No tienes citas</Text>
          </View>
        ) : citas.map((c) => {
          const s = statusStyle(c.estado);
          return (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardId}>Cita #{c.id}</Text>
                <View style={[styles.pill, { backgroundColor: s.bg }]}>
                  <Text style={[styles.pillText, { color: s.color }]}>{c.estado}</Text>
                </View>
              </View>
              <Text style={styles.cardDate}>{c.fecha} · {c.hora}</Text>
              <View style={styles.cardActions}>
                {(c.estado === 'programada' || c.estado === 'en_progreso') && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/chats/${c.id}`)}>
                    <MaterialCommunityIcons name="chat-processing" size={18} color={colors.white} />
                    <Text style={styles.actionText}>Chat</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionBtnOutline} onPress={() => router.push(`/historial?id_cita=${c.id}`)}>
                  <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.primaryDark} />
                  <Text style={styles.actionTextOutline}>Historial</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.bg },
  topbar: { paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  topbarTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.white },
  content: { padding: 18, paddingBottom: 40, gap: 14 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.muted, marginTop: 12 },
  card: { backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, padding: 18, gap: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardId: { fontSize: typography.sizes.md, fontWeight: typography.weights.black, color: colors.primaryDark },
  cardDate: { fontSize: typography.sizes.base, color: colors.muted },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  pillText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.black },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md },
  actionText: { color: colors.white, fontWeight: typography.weights.bold, fontSize: typography.sizes.base },
  actionBtnOutline: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md },
  actionTextOutline: { color: colors.primaryDark, fontWeight: typography.weights.bold, fontSize: typography.sizes.base },
});
