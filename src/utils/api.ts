import { ACCESS_TOKEN_STORAGE_KEY, getActiveContext } from './providers/helper.ts';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const AUTH_401_EVENT = 'auth:401';

const api = async function <T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  const activeContext = getActiveContext();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ['X-Role']: activeContext.role,
      ...(activeContext.role === 'user' ? { ['X-User-Id']: String(activeContext.userId) } : {}),
      ...(activeContext.role === 'place' ? { ['X-Place-Id']: String(activeContext.placeId) } : {}),
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

function json(method: 'POST' | 'PUT' | 'PATCH') {
  return async function <T>(url: string, body: any): Promise<T> {
    return api<T>(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };
}

const get = <T>(url: string) => api<T>(url);
const post = json('POST');
const put = json('PUT');
const patch = json('PATCH');
async function del<T>(url: string): Promise<T> {
  return api<T>(url, {
    method: 'DELETE',
  });
}

function toQuery(params?: Record<string, any>) {
  if (!params) return '';

  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.append(key, String(value));
    }
  });

  return '?' + search.toString();
}

export { get, post, put, patch, del, toQuery };