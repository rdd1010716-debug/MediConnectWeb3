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
import { authApi } from '../../src/api/endpoints';
import { isValidEmail } from '../../src/utils/helpers';
import BrandPanel from '../../src/components/BrandPanel';
import PrimaryButton from '../../src/components/PrimaryButton';
import Alert from '../../src/components/Alert';
import { colors, radius, typography } from '../../src/constants/theme';

export default function RegisterScreen() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'paciente' });
  const [status, setStatus] = useState({ type: 'success' as 'success' | 'error', message: '' });
  const [loading, setLoading] = useState(false);

  const validate = (): string => {
    if (form.nombre.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (!isValidEmail(form.email)) return 'Ingresa un correo válido.';
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    return '';
  };

  const handleRegister = async () => {
    setStatus({ type: 'success', message: '' });
    const validation = validate();
    if (validation) return setStatus({ type: 'error', message: validation });

    setLoading(true);
    try {
      await authApi.register({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
        rol: form.rol,
      });
      setStatus({ type: 'success', message: 'Cuenta creada correctamente. Ya puedes iniciar sesión.' });
      setTimeout(() => router.replace('/login'), 1000);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'No se pudo crear la cuenta';
      setStatus({ type: 'error', message: msg });
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
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>
              Regístrate como paciente o médico. Las cuentas administrativas solo se gestionan internamente.
            </Text>
          </View>

          <Alert type={status.type} message={status.message} />

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                value={form.nombre}
                onChangeText={(v) => setForm({ ...form, nombre: v })}
                placeholder="Nombre completo"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(v) => setForm({ ...form, email: v })}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(v) => setForm({ ...form, password: v })}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.muted}
                secureTextEntry
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Rol</Text>
              <View style={styles.rolRow}>
                <TouchableOpacity
                  style={[styles.rolPill, form.rol === 'paciente' && styles.rolPillActive]}
                  onPress={() => setForm({ ...form, rol: 'paciente' })}
                >
                  <Text style={[styles.rolText, form.rol === 'paciente' && styles.rolTextActive]}>
                    Paciente
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rolPill, form.rol === 'medico' && styles.rolPillActive]}
                  onPress={() => setForm({ ...form, rol: 'medico' })}
                >
                  <Text style={[styles.rolText, form.rol === 'medico' && styles.rolTextActive]}>
                    Médico
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <PrimaryButton
              title={loading ? 'Creando...' : 'Crear cuenta'}
              loading={loading}
              onPress={handleRegister}
            />
          </View>

          <View style={styles.links}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>Volver al login</Text>
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
  rolRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rolPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  rolPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rolText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  rolTextActive: {
    color: colors.white,
  },
  links: {
    alignItems: 'center',
    marginTop: 22,
  },
  linkText: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.base,
  },
});
