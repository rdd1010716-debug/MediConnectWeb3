import api from './http';

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    api.post('/api/auth/login', payload),

  register: (payload: { nombre: string; email: string; password: string; rol: string }) =>
    api.post('/api/auth/register', payload),

  forgotPassword: (payload: { email: string }) =>
    api.post('/api/auth/forgot-password', payload),

  resetPassword: (token: string, payload: { password: string }) =>
    api.post(`/api/auth/reset-password/${token}`, payload),
};

export const userApi = {
  doctors: () => api.get('/api/usuarios/medicos'),
};

export const especialidadApi = {
  list: () => api.get('/api/especialidades'),
};

export const citaApi = {
  mine: () => api.get('/api/citas/mis-citas'),
  book: (payload: object) => api.post('/api/citas/agendar', payload),
  cancel: (id: number) => api.put(`/api/citas/cancelar/${id}`),
};

export const historiaApi = {
  getByCita: (idCita: number) => api.get(`/api/historias/${idCita}`),
  create: (payload: { id_cita: number; diagnostico: string; tratamiento: string; notas_medicas?: string }) =>
    api.post('/api/historias', payload),
  update: (idCita: number, payload: { diagnostico: string; tratamiento: string; notas_medicas?: string }) =>
    api.put(`/api/historias/${idCita}`, payload),
};

export const recetaApi = {
  upload: (formData: FormData) => api.post('/api/recetas/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const chatApi = {
  history: (idCita: number) => api.get(`/api/chat/historial/${idCita}`),
  upload: (formData: FormData) => api.post('/api/chat/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  enviar: (payload: { id_cita: number; tipo_content?: string; contenido: string }) => api.post('/api/chat/enviar', payload),
};

export const disponibilidadApi = {
  set: (payload: { id_medico: number; fecha: string; hora_inicio: string; hora_fin: string }) =>
    api.post('/api/disponibilidad/establecer', payload),
  getByMedico: (id_medico: number) => api.get(`/api/disponibilidad/medico/${id_medico}`),
};