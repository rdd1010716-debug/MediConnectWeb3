import api from './http.js';

export const authApi = {
  register: (payload) => api.post('/api/auth/register', payload),
  login: (payload) => api.post('/api/auth/login', payload),
  forgotPassword: (payload) => api.post('/api/auth/forgot-password', payload),
  resetPassword: (token, payload) => api.post(`/api/auth/reset-password/${token}`, payload)
};

export const userApi = {
  doctors: () => api.get('/api/usuarios/medicos')
};

export const citaApi = {
  book: (payload) => api.post('/api/citas/agendar', payload),
  mine: () => api.get('/api/citas/mis-citas'),
  cancel: (id) => api.put(`/api/citas/cancelar/${id}`)
};

export const disponibilidadApi = {
  create: (payload) => api.post('/api/disponibilidad/establecer', payload),
  byDoctor: (id_medico) => api.get(`/api/disponibilidad/medico/${id_medico}`)
};
export const chatApi = {
  history: (idCita, page = 1, limit = 20) => api.get(`/api/chat/historial/${idCita}?page=${page}&limit=${limit}`),
  upload: (formData) => api.post('/api/chat/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
};

export const especialidadApi = {
  list: () => api.get('/api/especialidades'),
  create: (payload) => api.post('/api/especialidades', payload),
  update: (id, payload) => api.put(`/api/especialidades/${id}`, payload),
  remove: (id) => api.delete(`/api/especialidades/${id}`)
};

export const historiaApi = {
  create: (payload) => api.post('/api/historias', payload),
  getByCita: (idCita) => api.get(`/api/historias/${idCita}`)
};

export const recetaApi = {
  upload: (formData) => api.post('/api/recetas/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
};
