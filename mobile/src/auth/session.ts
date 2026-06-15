import * as SecureStore from 'expo-secure-store';
import type { User } from '../types';

const TOKEN_KEY = 'mediconnect_token';
const USER_KEY = 'mediconnect_user';

export async function saveSession(token: string, user: User): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getUser(): Promise<User | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export function roleHome(role: string): string {
  if (role === 'medico') return '/dashboard';
  if (role === 'admin') return '/dashboard';
  return '/dashboard';
}