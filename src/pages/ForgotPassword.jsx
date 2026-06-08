import React from "react";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/endpoints.js';
import Alert from '../components/Alert.jsx';
import AuthShell from '../components/AuthShell.jsx';
import { isValidEmail, messageFromError } from '../utils/helpers.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', text: '' });
    setToken('');
    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) return setStatus({ type: 'error', text: 'Ingresa un correo válido.' });
    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword({ email: cleanEmail });
      setToken(data.token || '');
      setStatus({ type: 'success', text: data.message || 'Solicitud generada correctamente.' });
    } catch (err) {
      setStatus({ type: 'error', text: messageFromError(err, 'No se pudo generar la recuperación') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Recuperar contraseña" subtitle="Genera un token temporal para cambiar tu contraseña.">
      <form onSubmit={submit} className="form-stack">
        <Alert type={status.type}>{status.text}</Alert>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required /></label>
        <button className="primary-button" disabled={loading}>{loading ? 'Procesando...' : 'Generar recuperación'}</button>
      </form>
      {token && <div className="token-box"><b>Token generado</b><p>{token}</p><Link className="secondary-button" to={`/reset-password/${token}`}>Cambiar contraseña</Link></div>}
      <div className="auth-links"><Link to="/login">Volver al login</Link></div>
    </AuthShell>
  );
}
