export const todayISO = () => new Date().toISOString().slice(0, 10);

export const isFutureOrToday = (dateValue) => {
  if (!dateValue) return false;
  return dateValue >= todayISO();
};

export const isValidTimeRange = (start, end) => {
  if (!start || !end) return false;
  return end > start;
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

export const messageFromError = (error, fallback = 'No se pudo completar la operación') => {
  const data = error?.response?.data;
  return data?.error || data?.message || error?.message || fallback;
};

export const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: '2-digit' });
};

export const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
};

export const statusLabel = (status) => {
  const labels = {
    programada: 'Programada',
    cancelada: 'Cancelada',
    finalizada: 'Finalizada',
    pendiente: 'Pendiente',
    en_progreso: 'En progreso'
  };
  return labels[status] || status || 'Sin estado';
};

export const normalizeArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

export const doctorName = (doctors, id) => {
  const doctor = doctors.find((item) => Number(item.id) === Number(id));
  return doctor?.nombre || `Médico #${id}`;
};

export const appointmentTitle = (cita, doctors = []) => {
  if (!cita) return 'Seleccionar cita';
  const name = cita.id_medico ? doctorName(doctors, cita.id_medico) : `Paciente #${cita.id_paciente}`;
  return `Cita #${cita.id} · ${name} · ${formatDate(cita.fecha)} ${cita.hora || ''}`;
};

export const fileSizeMb = (file) => file ? file.size / (1024 * 1024) : 0;
