import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { io, Socket } from 'socket.io-client';
import { chatApi } from '../../../src/api/endpoints';
import { getToken, getUser } from '../../../src/auth/session';
import Alert from '../../../src/components/Alert';
import { colors, radius, typography, gradients } from '../../../src/constants/theme';

export default function ChatScreen() {
  const { idCita } = useLocalSearchParams<{ idCita: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!idCita) return;
    (async () => {
      const token = await getToken();
      const u = await getUser();
      setUser(u);
      if (!token) { router.replace('/login'); return; }
      try {
        const res = await chatApi.history(Number(idCita));
        setMessages(res.data?.mensajes || []);
      } catch (e: any) {
        setError(e?.message || 'Error al cargar historial');
      } finally {
        setLoading(false);
      }
      const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000', { auth: { token } });
      socketRef.current = socket;
      socket.on('connect', () => socket.emit('join_room', { id_cita: Number(idCita) }));
      socket.on('receive_message', (msg: any) => setMessages((prev) => [...prev, msg]));
      socket.on('error_message', (err: any) => setError(err?.error || 'Error de socket'));
      return () => { socket.disconnect(); };
    })();
  }, [idCita]);

  const sendMessage = async () => {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', { id_cita: Number(idCita), tipo_content: 'text', contenido: text.trim() });
    setText('');
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      await uploadMedia(result.assets[0].uri, 'image');
    }
  };

  const uploadMedia = async (uri: string, tipo: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('id_cita', idCita as string);
      formData.append('tipo_content', tipo);
      const filename = uri.split('/').pop() || 'media.jpg';
      formData.append('archivo', { uri, name: filename, type: 'image/jpeg' } as any);
      const res = await chatApi.upload(formData);
      if (res.data?.mensaje) {
        setMessages((prev) => [...prev, res.data.mensaje]);
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const isImageUrl = (url: string) => url?.startsWith('http') && (url?.includes('.jpg') || url?.includes('.jpeg') || url?.includes('.png') || url?.includes('.webp'));

  const openReceta = () => {
    router.push(`/recetas?id_cita=${idCita}`);
  };

  const openHistorial = () => {
    router.push(`/historial?id_cita=${idCita}`);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Chat #{idCita}</Text>
        {user?.rol === 'medico' && (
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <TouchableOpacity onPress={openHistorial}>
              <MaterialCommunityIcons name="file-document-outline" size={24} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openReceta}>
              <MaterialCommunityIcons name="file-document-plus" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
        {user?.rol !== 'medico' && <View style={{ width: 24 }} />}
      </LinearGradient>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.messages} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />}
        {messages.map((m, i) => {
          const isMe = m.emisor_id === user?.id;
          const isImage = m.tipo_content === 'image' || isImageUrl(m.contenido);
          return (
            <View key={i} style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
              {isImage ? (
                <Image source={{ uri: m.contenido }} style={styles.image} resizeMode="cover" />
              ) : (
                <Text style={isMe ? styles.textMe : styles.textOther}>{m.contenido}</Text>
              )}
              <Text style={styles.time}>{m.creado_en ? new Date(m.creado_en).toLocaleTimeString() : ''}</Text>
            </View>
          );
        })}
      </ScrollView>

      {error ? <Alert type="error" message={error} /> : null}

      <View style={styles.inputBar}>
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          <MaterialCommunityIcons name="image" size={24} color={uploading ? colors.muted : colors.primary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={colors.muted}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={uploading}>
          <MaterialCommunityIcons name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  topbar: {
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl,
  },
  topbarTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.black, color: colors.white },
  messages: { padding: 16, paddingBottom: 20, gap: 10 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: radius.lg },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: colors.card },
  textMe: { color: colors.white },
  textOther: { color: colors.text },
  image: { width: 200, height: 200, borderRadius: radius.md, marginBottom: 6 },
  time: { fontSize: typography.sizes.xs, color: colors.muted, marginTop: 4 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: typography.sizes.base, color: colors.text,
  },
  sendBtn: {
    backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
});
