import React from "react";
import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarDays, Edit3, ShieldCheck, Stethoscope, Trash2, UsersRound, X } from 'lucide-react';
import { citaApi, especialidadApi, userApi } from '../api/endpoints.js';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatCard from '../components/StatCard.jsx';
import { formatDate, messageFromError, normalizeArray, statusLabel } from '../utils/helpers.js';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [form, setForm] = useState({ id: '', nombre: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeAppointments = useMemo(() => appointments.filter((cita) => cita.estado !== 'cancelada').length, [appointments]);
  const editing = Boolean(form.id);

  const loadData = async () => {
    setLoading(true);
    try {
      const [medicosResponse, citasResponse, especialidadesResponse] = await Promise.allSettled([
        userApi.doctors(), citaApi.mine(), especialidadApi.list()
      ]);
      if (medicosResponse.status === 'fulfilled') setDoctors(normalizeArray(medicosResponse.value.data, ['medicos', 'usuarios', 'data']));
      if (citasResponse.status === 'fulfilled') setAppointments(normalizeArray(citasResponse.value.data, ['citas', 'data']));
      if (especialidadesResponse.status === 'fulfilled') setSpecialties(normalizeArray(especialidadesResponse.value.data, ['especialidades', 'data']));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ id: '', nombre: '' });
  };

  const saveSpecialty = async (event) => {
    event.preventDefault();
    setStatus({ type: '', text: '' });
    const cleanName = form.nombre.trim();
    if (cleanName.length < 3) return setStatus({ type: 'error', text: 'La especialidad debe tener al menos 3 caracteres.' });
    const duplicated = specialties.some((item) => item.nombre?.toLowerCase() === cleanName.toLowerCase() && Number(item.id) !== Number(form.id));
    if (duplicated) return setStatus({ type: 'error', text: 'Esa especialidad ya está registrada.' });
    setSaving(true);
    try {
      if (editing) {
        await especialidadApi.update(form.id, { nombre: cleanName });
        setStatus({ type: 'success', text: `Especialidad “${cleanName}” actualizada correctamente.` });
      } else {
        await especialidadApi.create({ nombre: cleanName });
        setStatus({ type: 'success', text: `Especialidad “${cleanName}” creada correctamente.` });
      }
      resetForm();
      loadData();
    } catch (err) {
      setStatus({ type: 'error', text: messageFromError(err, editing ? 'No se pudo actualizar la especialidad' : 'No se pudo crear la especialidad') });
    } finally {
      setSaving(false);
    }
  };

  const editSpecialty = (item) => {
    setStatus({ type: '', text: '' });
    setForm({ id: item.id, nombre: item.nombre || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSpecialty = async (item) => {
    setStatus({ type: '', text: '' });
    const accepted = window.confirm(`¿Eliminar la especialidad “${item.nombre}”?`);
    if (!accepted) return;
    try {
      await especialidadApi.remove(item.id);
      setStatus({ type: 'success', text: `Especialidad “${item.nombre}” eliminada correctamente.` });
      if (Number(form.id) === Number(item.id)) resetForm();
      loadData();
    } catch (err) {
      setStatus({ type: 'error', text: messageFromError(err, 'No se pudo eliminar la especialidad') });
    }
  };

  return (
    <main className="page-content">
      <section className="hero-card admin-hero compact-hero">
        <div>
          <p>Panel administrativo</p>
          <h1>Control general de MediConnect</h1>
          <span>Supervisa médicos, especialidades, citas visibles por permisos y operación principal del sistema.</span>
        </div>
        <div className="hero-badge">Admin</div>
      </section>

      <section className="stats-grid">
        <StatCard label="Médicos" value={doctors.length} detail="Registrados" icon={<UsersRound size={22} />} />
        <StatCard label="Citas" value={appointments.length} detail="Visibles" icon={<CalendarDays size={22} />} />
        <StatCard label="Activas" value={activeAppointments} detail="Operativas" icon={<Activity size={22} />} />
        <StatCard label="Especialidades" value={specialties.length} detail="Áreas" icon={<ShieldCheck size={22} />} />
      </section>

      <Alert type={status.type}>{status.text}</Alert>

      <section className="content-grid two-columns">
        <article className="panel-card">
          <div className="section-title">
            <div><p>Especialidades</p><h2>{editing ? 'Editar especialidad' : 'Nueva especialidad'}</h2></div>{loading && <span className="soft-label">Cargando...</span>}
          </div>
          <form onSubmit={saveSpecialty} className="inline-form spaced specialty-form">
            <input placeholder="Ej. Cardiología" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            <button className="primary-button" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Actualizar' : 'Agregar'}</button>
            {editing && <button type="button" className="ghost-button" onClick={resetForm}><X size={16} /> Cancelar</button>}
          </form>
          <div className="helper-card">Las especialidades ayudan a clasificar médicos y a que el paciente encuentre mejor el servicio que necesita.</div>
        </article>

        <article className="panel-card">
          <div className="section-title"><div><p>Profesionales</p><h2>Médicos disponibles</h2></div></div>
          <div className="doctor-list">
            {doctors.length ? doctors.map((doctor) => <div key={doctor.id} className="doctor-item"><span><Stethoscope size={18} /></span><div><b>{doctor.nombre}</b><small>{doctor.email}</small></div></div>) : <EmptyState title="Sin médicos" text="Registra médicos para verlos en el panel." />}
          </div>
        </article>
      </section>

      <section className="panel-card">
        <div className="section-title"><div><p>CRUD</p><h2>Especialidades registradas</h2></div></div>
        {specialties.length === 0 ? <EmptyState title="Sin especialidades" text="Agrega la primera especialidad médica." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Especialidad</th><th>Acciones</th></tr></thead>
              <tbody>
                {specialties.map((item) => (
                  <tr key={item.id || item.nombre}>
                    <td>#{item.id || '-'}</td>
                    <td>{item.nombre}</td>
                    <td className="actions">
                      <button className="secondary-button small" onClick={() => editSpecialty(item)}><Edit3 size={15} /> Editar</button>
                      <button className="ghost-button danger" onClick={() => deleteSpecialty(item)}><Trash2 size={15} /> Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel-card">
        <div className="section-title"><div><p>Monitoreo</p><h2>Citas registradas</h2></div></div>
        {appointments.length === 0 ? <EmptyState title="Sin citas visibles" text="El backend devuelve citas según el rol autenticado y sus permisos." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Paciente</th><th>Médico</th><th>Fecha</th><th>Hora</th><th>Estado</th></tr></thead>
              <tbody>{appointments.map((cita) => <tr key={cita.id}><td>#{cita.id}</td><td>Paciente #{cita.id_paciente}</td><td>Médico #{cita.id_medico}</td><td>{formatDate(cita.fecha)}</td><td>{cita.hora}</td><td><span className={`status ${cita.estado}`}>{statusLabel(cita.estado)}</span></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
