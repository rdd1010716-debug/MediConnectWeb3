import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { authApi } from '../src/api/endpoints';
import BrandPanel from '../src/components/BrandPanel';
import PrimaryButton from '../src/components/PrimaryButton';
import Alert from '../src/components/Alert';
import { colors, radius, typography } from '../src/constants/theme';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!password.trim()) return setError('Ingresa una contraseña.');
    if (password !== confirm) return setError('Las contraseñas no coinciden.');
    if (!token) return setError('Token inválido.');

    setLoading(true);
    try {
      await authApi.resetPassword(token, { password });
      setSuccess('Contraseña actualizada. Inicia sesión.');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'No se pudo restablecer la contraseña';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <BrandPanel />
        <View style={styles.card}>
          <View style={styles.heading}>
            <Text style={styles.title}>Nueva contraseña</Text>
            <Text style={styles.subtitle}>Ingresa tu nueva contraseña.</Text>
          </View>
          <Alert type="error" message={error} />
          <Alert type="success" message={success} />
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nueva contraseña</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} secureTextEntry />
            </View>
            <PrimaryButton title={loading ? 'Guardando...' : 'Guardar'} loading={loading} onPress={handleSubmit} />
          </View>
          <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backLink}>
            <Text style={styles.linkText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 40 },
  card: {
    backgroundColor: colors.cardTranslucent, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xxxl, marginHorizontal: 20, marginTop: -20, padding: 28,
  },
  heading: { marginBottom: 24 },
  title: { fontSize: 30, fontWeight: '800' as const, color: colors.text, letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: typography.sizes.base, color: colors.muted, lineHeight: 22 },
  form: { gap: 14 },
  field: { gap: 6 },
  label: { fontSize: typography.sizes.base, fontWeight: typography.weights.extrabold, color: '#25425d' },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: typography.sizes.md, color: colors.text,
  },
  backLink: { marginTop: 22, alignItems: 'center' },
  linkText: { color: colors.primaryDark, fontWeight: typography.weights.bold, fontSize: typography.sizes.base },
});
