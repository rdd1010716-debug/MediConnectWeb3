import React, { useEffect, useState } from 'react';
import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getUser } from '../src/auth/session';
import { colors } from '../src/constants/theme';
import type { User } from '../src/types';

export default function RootLayout() {
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser().then((u) => {
      setUser(u);
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="agendar" />
      <Stack.Screen name="disponibilidad" />
      <Stack.Screen name="historial" />
      <Stack.Screen name="recetas" />
      <Stack.Screen name="chat/[idCita]" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});