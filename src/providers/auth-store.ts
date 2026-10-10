import { getBrowser } from '../shared/lib/browser.ts';
import { ACCESS_TOKEN_STORAGE_KEY, ACTIVE_CONTEXT_STORAGE_KEY, type ActiveContext } from './helper.ts';

const AUTH_STATE_EVENT = 'auth:state';
export const getStoredToken = () => getBrowser()?.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? null;
export const getStoredContext = () => getBrowser()?.localStorage.getItem(ACTIVE_CONTEXT_STORAGE_KEY) ?? null;
export const getServerAuthSnapshot = () => null;

export function subscribeAuth(listener: () => void): () => void {
  const browser = getBrowser();
  browser?.addEventListener('storage', listener);
  browser?.addEventListener(AUTH_STATE_EVENT, listener);
  return () => {
    browser?.removeEventListener('storage', listener);
    browser?.removeEventListener(AUTH_STATE_EVENT, listener);
  };
}

export function storeAuth(token: string | null, context?: ActiveContext): void {
  const browser = getBrowser();
  if (!browser) return;
  if (token) browser.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  else browser.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  if (context) browser.localStorage.setItem(ACTIVE_CONTEXT_STORAGE_KEY, JSON.stringify(context));
  else browser.localStorage.removeItem(ACTIVE_CONTEXT_STORAGE_KEY);
  browser.dispatchEvent(new Event(AUTH_STATE_EVENT));
}
