export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'paciente' | 'medico' | 'admin';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  rol: 'paciente' | 'medico';
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface Cita {
  id: number;
  id_paciente: number;
  id_medico: number;
  fecha: string;
  hora: string;
  estado: string;
  motivo: string;
  medico_nombre?: string;
  medico?: string;
}

export interface Especialidad {
  id: number;
  nombre: string;
}

export interface Doctor {
  id: number;
  nombre: string;
  email: string;
  especialidad?: string;
}

export interface HistoriaClinica {
  id: number;
  id_cita: number;
  diagnostico: string;
  tratamiento: string;
  notas_medicas: string;
}