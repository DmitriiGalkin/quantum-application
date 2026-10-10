import type { PassportExtendedDto } from 'entities';
import { getBrowser } from '../shared/lib/browser.ts';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export const ACCESS_TOKEN_STORAGE_KEY = 'access_token';
export const ACTIVE_CONTEXT_STORAGE_KEY = 'active_context';

export const STRATEGIES = [
  {
    title: 'Yandex',
    href: `${API_URL}/login/yandex`,
    icon: 'Я',
  },
];

export const getActiveContext = (): ActiveContext => {
  return parseActiveContext(getBrowser()?.localStorage.getItem(ACTIVE_CONTEXT_STORAGE_KEY) ?? null) ?? { role: 'guest' };
};

export function parseActiveContext(value: string | null): ActiveContext | null {
  if (value) {
    try {
      const context: unknown = JSON.parse(value);
      if (typeof context !== 'object' || context === null || !('role' in context)) return null;
      if (context.role === 'guest' || context.role === 'teacher') return { role: context.role };
      if (
        context.role === 'user' &&
        'userId' in context &&
        typeof context.userId === 'number' &&
        Number.isSafeInteger(context.userId) &&
        context.userId > 0
      )
        return { role: 'user', userId: context.userId };
      if (
        context.role === 'place' &&
        'placeId' in context &&
        typeof context.placeId === 'number' &&
        Number.isSafeInteger(context.placeId) &&
        context.placeId > 0
      )
        return { role: 'place', placeId: context.placeId };
    } catch {
      return null;
    }
  }
  return null;
}

export type ActiveContext =
  | {
      role: 'guest';
    }
  | {
      role: 'user';
      userId: number;
    }
  | {
      role: 'teacher';
    }
  | {
      role: 'place';
      placeId: number;
    };

export const getContext = (data: PassportExtendedDto): ActiveContext => {
  if (data.users.length) {
    return {
      role: 'user',
      userId: data.users?.[0]?.id || 0,
    };
  }

  if (data.isTeacher) {
    return {
      role: 'teacher',
    };
  }

  if (data.places.length) {
    return {
      role: 'place',
      placeId: data.places?.[0]?.id,
    };
  }

  return {
    role: 'guest',
  };
};

export const getTokenFromUrl = () => {
  const browser = getBrowser();
  if (!browser) {
    return null;
  }

  const url = new URL(browser.location.href);
  const token = url.searchParams.get('access_token');

  if (!token) return null;

  url.searchParams.delete('access_token');
  browser.history.replaceState({}, browser.document.title, url.toString());

  return token;
};
