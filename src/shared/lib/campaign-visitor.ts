import { getBrowser } from './browser.ts';

const KEY = 'quantum:campaign-visitor';

export function campaignVisitorId(create = false): string | undefined {
  const browser = getBrowser();
  if (!browser) return undefined;
  try {
    const saved = browser.localStorage.getItem(KEY);
    if (saved) return saved;
    if (create) {
      const id = browser.crypto.randomUUID();
      browser.localStorage.setItem(KEY, id);
      return id;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
