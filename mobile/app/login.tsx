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
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { authApi } from '../src/api/endpoints';
import { saveSession, roleHome } from '../src/auth/session';
import { isValidEmail } from '../src/utils/helpers';
import BrandPanel from '../src/components/BrandPanel';
import PrimaryButton from '../src/components/PrimaryButton';
import Alert from '../src/components/Alert';
import { colors, radius, typography } from '../src/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) return setError('Ingresa un correo válido.');
    if (!password.trim()) return setError('Ingresa tu contraseña.');

    setLoading(true);
    try {
      const { data } = await authApi.login({ email: cleanEmail, password });
      await saveSession(data.token, data.user);
      router.replace(roleHome(data.user.rol));
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'No se pudo iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <BrandPanel />

        <View style={styles.card}>
          <View style={styles.heading}>
            <Text style={styles.title}>Iniciar sesión</Text>
            <Text style={styles.subtitle}>
              Accede a tu espacio médico seguro de MediConnect.
            </Text>
          </View>

          <Alert type="error" message={error} />

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Tu contraseña"
                placeholderTextColor={colors.muted}
                secureTextEntry
              />
            </View>

            <PrimaryButton
              title={loading ? 'Ingresando...' : 'Ingresar'}
              loading={loading}
              onPress={handleLogin}
            />
          </View>

          <View style={styles.links}>
            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <Text style={styles.linkText}>Recuperar contraseña</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.linkText}>Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 40 },
  card: {
    backgroundColor: colors.cardTranslucent,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xxxl,
    marginHorizontal: 20,
    marginTop: -20,
    padding: 28,
    shadowColor: '#0f2742',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 8,
  },
  heading: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.muted,
    lineHeight: 22,
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.extrabold,
    color: '#25425d',
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  linkText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.base,
  },
});