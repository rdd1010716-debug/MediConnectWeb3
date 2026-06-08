const TOKEN_KEY = 'mediconnect_token';
const USER_KEY = 'mediconnect_user';

export const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const logoutUser = (redirect = true) => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (redirect) window.location.href = '/login';
};

export const roleHome = (role) => {
  if (role === 'medico') return '/medico';
  if (role === 'admin') return '/admin';
  return '/paciente';
};
