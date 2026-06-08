import React from "react";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints.js';
import { roleHome, saveSession } from '../auth/session.js';
import Alert from '../components/Alert.jsx';
import AuthShell from '../components/AuthShell.jsx';
import { isValidEmail, messageFromError } from '../utils/helpers.js';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const email = form.email.trim();
    if (!isValidEmail(email)) return setError('Ingresa un correo válido.');
    if (!form.password.trim()) return setError('Ingresa tu contraseña.');
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password: form.password });
      saveSession(data.token, data.user);
      navigate(roleHome(data.user.rol), { replace: true });
    } catch (err) {
      setError(messageFromError(err, 'No se pudo iniciar sesión'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Iniciar sesión" subtitle="Accede a tu espacio médico seguro de MediConnect.">
      <form onSubmit={submit} className="form-stack">
        <Alert type="error">{error}</Alert>
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" required /></label>
        <label>Contraseña<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tu contraseña" required /></label>
        <button className="primary-button" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
      </form>
      <div className="auth-links">
        <Link to="/forgot-password">Recuperar contraseña</Link>
        <Link to="/register">Crear cuenta</Link>
      </div>
    </AuthShell>
  );
}
