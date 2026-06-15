import React from "react";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints.js';
import Alert from '../components/Alert.jsx';
import AuthShell from '../components/AuthShell.jsx';
import { isValidEmail, messageFromError } from '../utils/helpers.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'paciente' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (form.nombre.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (!isValidEmail(form.email)) return 'Ingresa un correo válido.';
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (!['paciente', 'medico'].includes(form.rol)) return 'Selecciona un rol válido.';
    return '';
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', text: '' });
    const validation = validate();
    if (validation) return setStatus({ type: 'error', text: validation });
    setLoading(true);
    try {
      await authApi.register({ nombre: form.nombre.trim(), email: form.email.trim(), password: form.password, rol: form.rol });
      setStatus({ type: 'success', text: 'Cuenta creada correctamente. Ya puedes iniciar sesión.' });
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setStatus({ type: 'error', text: messageFromError(err, 'No se pudo crear la cuenta') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Crear cuenta" subtitle="Regístrate como paciente o médico. Las cuentas administrativas solo se gestionan internamente.">
      <form onSubmit={submit} className="form-stack">
        <Alert type={status.type}>{status.text}</Alert>
        <label>Nombre completo<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre completo" required /></label>
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" required /></label>
        <label>Contraseña<input type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" required /></label>
        <label>Rol<select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}><option value="paciente">Paciente</option><option value="medico">Médico</option></select></label>
        <button className="primary-button" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
      </form>
      <div className="auth-links"><Link to="/login">Volver al login</Link></div>
    </AuthShell>
  );
}
