import React from "react";
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../api/endpoints.js';
import Alert from '../components/Alert.jsx';
import AuthShell from '../components/AuthShell.jsx';
import { messageFromError } from '../utils/helpers.js';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ nueva_password: '', confirmacion: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', text: '' });
    if (passwords.nueva_password.length < 6) return setStatus({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    if (passwords.nueva_password !== passwords.confirmacion) return setStatus({ type: 'error', text: 'Las contraseñas no coinciden.' });
    setLoading(true);
    try {
      const { data } = await authApi.resetPassword(token, { nueva_password: passwords.nueva_password });
      setStatus({ type: 'success', text: data.message || 'Contraseña actualizada correctamente.' });
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setStatus({ type: 'error', text: messageFromError(err, 'No se pudo cambiar la contraseña') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Cambiar contraseña" subtitle="Define una nueva contraseña para tu cuenta.">
      <form onSubmit={submit} className="form-stack">
        <Alert type={status.type}>{status.text}</Alert>
        <label>Nueva contraseña<input type="password" value={passwords.nueva_password} onChange={(e) => setPasswords({ ...passwords, nueva_password: e.target.value })} required /></label>
        <label>Confirmar contraseña<input type="password" value={passwords.confirmacion} onChange={(e) => setPasswords({ ...passwords, confirmacion: e.target.value })} required /></label>
        <button className="primary-button" disabled={loading}>{loading ? 'Guardando...' : 'Guardar nueva contraseña'}</button>
      </form>
      <div className="auth-links"><Link to="/login">Volver al login</Link></div>
    </AuthShell>
  );
}
