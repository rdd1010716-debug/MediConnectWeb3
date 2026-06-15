import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { io, Socket } from 'socket.io-client';
import { chatApi } from '../../src/api/endpoints';
import { getToken, getUser } from '../../src/auth/session';
import Alert from '../../src/components/Alert';
import { colors, radius, typography, gradients } from '../../src/constants/theme';

export default function ChatScreen() {
  const { idCita } = useLocalSearchParams<{ idCita: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const userRef = useRef<any>(null);

  useEffect(() => {
    if (!idCita) return;
    (async () => {
      const token = await getToken();
      const user = await getUser();
      userRef.current = user;
      if (!token) { router.replace('/login'); return; }

      // Load history
      try {
        const res = await chatApi.history(Number(idCita));
        setMessages(res.data?.mensajes || []);
      } catch (e: any) {
        setError(e?.message || 'Error al cargar historial');
      } finally {
        setLoading(false);
      }

      // Connect socket
      const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        auth: { token },
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join_room', { id_cita: Number(idCita) });
      });

      socket.on('receive_message', (msg: any) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on('error_message', (err: any) => {
        setError(err?.error || 'Error de socket');
      });

      return () => {
        socket.disconnect();
      };
    })();
  }, [idCita]);

  const sendMessage = async () => {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', {
      id_cita: Number(idCita),
      tipo_content: 'text',
      contenido: text.trim(),
    });
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />
      <LinearGradient colors={gradients.heroPatient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>Chat #{idCita}</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.messages} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {loading && <Text style={styles.info}>Cargando mensajes...</Text>}
        {messages.map((m, i) => {
          const isMe = m.emisor_id === userRef.current?.id;
          return (
            <View key={i} style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
              <Text style={isMe ? styles.textMe : styles.textOther}>{m.contenido}</Text>
              <Text style={styles.time}>{m.creado_en ? new Date(m.creado_en).toLocaleTimeString() : ''}</Text>
            </View>
          );
        })}
      </ScrollView>

      {error ? <Alert type="error" message={error} /> : null}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={colors.muted}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
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
  info: { color: colors.muted, textAlign: 'center', marginVertical: 20 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: radius.lg },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: colors.card },
  textMe: { color: colors.white },
  textOther: { color: colors.text },
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
