import React from "react";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { FileUp, Image, MessageCircle, Send } from 'lucide-react';
import { chatApi } from '../api/endpoints.js';
import { getToken, getUser } from '../auth/session.js';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { fileSizeMb, formatDateTime, messageFromError } from '../utils/helpers.js';

export default function ChatRoom() {
  const { idCita } = useParams();
  const user = getUser();
  const token = getToken();
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimer = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [typing, setTyping] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const canLoadMore = useMemo(() => messages.length < total, [messages.length, total]);

  const loadHistory = async (targetPage = 1, appendTop = false) => {
    try {
      const { data } = await chatApi.history(idCita, targetPage, limit);
      const incoming = data.mensajes || [];
      setTotal(data.total_mensajes_en_bd || incoming.length);
      setMessages((current) => appendTop ? [...incoming, ...current] : incoming);
      setPage(targetPage);
    } catch (err) {
      setStatus({ type: 'error', text: messageFromError(err, 'No se pudo cargar el historial del chat') });
    }
  };

  useEffect(() => {
    loadHistory(1, false);
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', { auth: { token } });
    socketRef.current = socket;
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_room', { id_cita: Number(idCita) });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('receive_message', (message) => setMessages((current) => [...current, message]));
    socket.on('user_typing', (data) => setTyping(data?.mensaje || 'escribiendo...'));
    socket.on('user_stopped_typing', () => setTyping(''));
    socket.on('error_message', (data) => setStatus({ type: 'error', text: data?.error || 'Error en el chat' }));
    return () => {
      socket.disconnect();
      clearTimeout(typingTimer.current);
    };
  }, [idCita]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const sendMessage = (event) => {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return setStatus({ type: 'error', text: 'Escribe un mensaje antes de enviar.' });
    if (!connected || !socketRef.current) return setStatus({ type: 'error', text: 'El chat no está conectado al servidor.' });
    socketRef.current.emit('send_message', { id_cita: Number(idCita), tipo_content: 'text', contenido: cleanText });
    socketRef.current.emit('stop_typing', { id_cita: Number(idCita) });
    setText('');
  };

  const onTyping = (value) => {
    setText(value);
    if (!socketRef.current || !connected) return;
    socketRef.current.emit('typing', { id_cita: Number(idCita) });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socketRef.current?.emit('stop_typing', { id_cita: Number(idCita) }), 900);
  };

  const validateFile = () => {
    if (!file) return 'Selecciona un archivo para subir.';
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'audio/mpeg', 'audio/wav', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) return 'Archivo no permitido. Usa imagen, PDF, audio o video MP4.';
    if (fileSizeMb(file) > 12) return 'El archivo no debe superar los 12 MB.';
    return '';
  };

  const uploadFile = async (event) => {
    event.preventDefault();
    setStatus({ type: '', text: '' });
    const validation = validateFile();
    if (validation) return setStatus({ type: 'error', text: validation });
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('id_cita', idCita);
      formData.append('archivo', file);
      formData.append('tipo_content', file.type.startsWith('image') ? 'image' : file.type.startsWith('audio') ? 'audio' : file.type.startsWith('video') ? 'video' : 'file');
      const { data } = await chatApi.upload(formData);
      const uploadedMessage = data.mensaje;
      if (uploadedMessage) setMessages((current) => [...current, uploadedMessage]);
      setFile(null);
      event.target.reset();
      setStatus({ type: 'success', text: 'Archivo enviado correctamente.' });
    } catch (err) {
      setStatus({ type: 'error', text: messageFromError(err, 'No se pudo subir el archivo') });
    } finally {
      setUploading(false);
    }
  };

  const loadMore = () => {
    if (canLoadMore) loadHistory(page + 1, true);
  };

  const renderMessageContent = (message) => {
    const type = message.tipo_content || message.tipo_contenido || 'text';
    if (type === 'image') return <a className="media-link" href={message.contenido} target="_blank" rel="noreferrer"><Image size={18} /> Ver imagen</a>;
    if (type === 'audio') return <audio controls src={message.contenido} />;
    if (type === 'video') return <video controls src={message.contenido} />;
    if (type === 'file') return <a className="media-link" href={message.contenido} target="_blank" rel="noreferrer"><FileUp size={18} /> Ver archivo</a>;
    return <p>{message.contenido}</p>;
  };

  return (
    <main className="page-content chat-page">
      <section className="chat-header">
        <div>
          <p>Sistema de telemedicina</p>
          <h1>Chat de cita #{idCita}</h1>
          <span>Canal privado protegido con JWT y Socket.io.</span>
        </div>
        <div className={`connection ${connected ? 'on' : 'off'}`}>{connected ? 'Conectado' : 'Desconectado'}</div>
      </section>

      <Alert type={status.type}>{status.text}</Alert>

      <section className="chat-card">
        <div className="chat-toolbar">
          <strong><MessageCircle size={18} /> Conversación médica</strong>
          <button className="ghost-button" disabled={!canLoadMore} onClick={loadMore}>{canLoadMore ? 'Cargar anteriores' : 'Historial completo'}</button>
        </div>

        <div className="messages-area">
          {messages.length === 0 ? <EmptyState title="No hay mensajes todavía" text="Envía el primer mensaje de la consulta." /> : messages.map((message, index) => {
            const mine = Number(message.emisor_id) === Number(user?.id);
            return <div className={`message-row ${mine ? 'mine' : ''}`} key={message.id || `${message.creado_en}-${index}`}><div className="message-bubble"><div className="message-meta"><span>{mine ? 'Tú' : `Usuario #${message.emisor_id}`}</span><small>{formatDateTime(message.creado_en)}</small></div>{renderMessageContent(message)}</div></div>;
          })}
          <div ref={bottomRef} />
        </div>

        {typing && <div className="typing-line">El otro usuario está {typing}</div>}

        <div className="chat-actions">
          <form className="send-form" onSubmit={sendMessage}>
            <input value={text} onChange={(e) => onTyping(e.target.value)} placeholder="Escribe un mensaje médico..." />
            <button className="primary-button"><Send size={17} /> Enviar</button>
          </form>
          <form className="upload-form" onSubmit={uploadFile}>
            <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf,audio/mpeg,audio/wav,video/mp4" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button className="secondary-button" disabled={uploading}>{uploading ? 'Subiendo...' : 'Subir archivo'}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
