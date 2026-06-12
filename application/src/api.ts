import { ACCESS_TOKEN_STORAGE_KEY } from './providers/AuthProvider.tsx';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

const api = async function <T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401) {
    //logout();
    throw new Error('Требуется повторная авторизация');
  }

  if (!response.ok) {
    throw new Error('Ошибка запроса');
  }

  return response.json();
};

export { api };