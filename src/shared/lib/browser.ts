export function getBrowser(): Window | undefined {
  return typeof globalThis.window === 'undefined' ? undefined : globalThis.window;
}
