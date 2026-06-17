import React from 'react';
import { Stack } from 'expo-router';
import Drawer from '../../src/components/Drawer';

export default function AppLayout() {
  return (
    <Drawer>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="medicos" />
        <Stack.Screen name="citas" />
        <Stack.Screen name="agendar" />
        <Stack.Screen name="disponibilidad" />
        <Stack.Screen name="chats/index" />
        <Stack.Screen name="chats/[idCita]" />
        <Stack.Screen name="admin-chats" />
        <Stack.Screen name="admin-medicos" />
        <Stack.Screen name="admin-especialidades" />
        <Stack.Screen name="admin-citas" />
        <Stack.Screen name="historial" />
      </Stack>
    </Drawer>
  );
}
