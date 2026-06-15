import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { recetaApi } from '../src/api/endpoints';
import { getUser } from '../src/auth/session';
import Alert from '../src/components/Alert';
import PrimaryButton from '../src/components/PrimaryButton';
import { colors, radius, typography, gradients } from '../src/constants/theme';

export default function RecetasScreen() {
  const { id_historia } = useLocalSearchParams<{ id_historia?: string }>();
  const [file, setFile] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    setError('');
    setSuccess('');
    if (!id_historia) return setError('Falta ID de historia clínica');
    if (!file) return setError('Selecciona un archivo PDF');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id_historia', id_historia);
      // React Native FormData expects a specific structure
      formData.append('archivo', {
        uri: file.uri,
        name: file.name || 'receta.pdf',
        type: file.mimeType || 'application/pdf',
      } as any);

      await recetaApi.upload(formData);
      setSuccess('Receta subida con éxito');
      setFile(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Error al subir receta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Receta digital</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Alert type="error" message={error} />
        <Alert type="success" message={success} />

        <TouchableOpacity style={styles.fileBtn} onPress={pickFile}>
          <MaterialCommunityIcons name="file-upload" size={24} color={colors.primaryDark} />
          <Text style={styles.fileBtnText}>{file ? file.name : 'Seleccionar PDF de receta'}</Text>
        </TouchableOpacity>

        <PrimaryButton title={loading ? 'Subiendo...' : 'Subir receta'} loading={loading} onPress={handleUpload} />
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
  fileBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 16,
  },
  fileBtnText: { fontSize: typography.sizes.base, color: colors.text, fontWeight: typography.weights.bold },
});
