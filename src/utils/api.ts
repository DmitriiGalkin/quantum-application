import { API_URL, ACCESS_TOKEN_STORAGE_KEY, getActiveContext } from '../providers/helper.ts';
import { getBrowser } from '../shared/lib/browser.ts';

export const AUTH_401_EVENT = 'auth:401';

const api = async function <T>(path: string, options: RequestInit = {}): Promise<T> {
  const browser = getBrowser();
  const token = browser?.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
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
    if (token === browser?.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)) browser?.dispatchEvent(new Event(AUTH_401_EVENT));
  }

  if (!response.ok) {
    let message = response.status === 401 ? 'Unauthorized' : 'Ошибка запроса';
    try {
      const body: unknown = await response.json();
      if (typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string') message = body.message;
    } catch {
      // Non-JSON errors still use the fallback message.
    }
    throw new Error(message);
  }

  const text = await response.text();
  return text ? JSON.parse(text) as T : undefined as T;
};

function json(method: 'POST' | 'PUT' | 'PATCH') {
  return async function <T>(url: string, body: unknown): Promise<T> {
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

function toQuery<T extends object>(params?: T) {
  if (!params) return '';

  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      search.append(key, String(value));
    }
  });

  return search.size ? '?' + search.toString() : '';
}

export { get, post, put, patch, del, toQuery };
