import { ACCESS_TOKEN_STORAGE_KEY } from './providers/AuthProvider.tsx';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const AUTH_401_EVENT = 'auth:401';

const api = async function (path: string, options: RequestInit = {}) {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    window.dispatchEvent(new Event(AUTH_401_EVENT));
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error('Ошибка запроса');
  }

  return response.json();
};

export { api };