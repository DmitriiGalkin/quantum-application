import type { PassportExtendedDto } from 'types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
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
  if (typeof window !== 'undefined') {
    const value = localStorage.getItem(ACTIVE_CONTEXT_STORAGE_KEY);

    if (value) {
      try {
        return JSON.parse(value);
      } catch {}
    }
  }

  return {
    role: 'guest',
  };
};

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
  if (Boolean(data.users.length)) {
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

  if (!!data.places.length) {
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
  if (typeof window === 'undefined') {
    return null;
  }

  const url = new URL(window.location.href);
  const token = url.searchParams.get('access_token');

  if (!token) return null;

  url.searchParams.delete('access_token');
  window.history.replaceState({}, document.title, url.toString());

  return token;
};