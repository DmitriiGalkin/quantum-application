import { ACTIVE_CONTEXT_STORAGE_KEY, type ActiveContext } from './AuthProvider.tsx';

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