import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it, vi } from 'vitest';

function worker() {
  const listeners = new Map<string, (event: unknown) => void>();
  const addAll = vi.fn().mockResolvedValue(undefined);
  const caches = {
    open: vi.fn().mockResolvedValue({ addAll }),
    keys: vi.fn().mockResolvedValue(['quantum-pwa-v1', 'quantum-pwa-v2', 'quantum-pwa-v3', 'quantum-pwa-v4', 'quantum-pwa-v5', 'other-app']),
    delete: vi.fn().mockResolvedValue(true),
    match: vi.fn().mockResolvedValue(undefined),
  };
  const self = {
    location: { origin: 'https://quantum.test' },
    addEventListener: (name: string, listener: (event: unknown) => void) => listeners.set(name, listener),
    skipWaiting: vi.fn(),
    registration: { showNotification: vi.fn().mockResolvedValue(undefined) },
    clients: { claim: vi.fn().mockResolvedValue(undefined) },
  };
  const fetch = vi.fn().mockRejectedValue(new Error('Offline'));
  runInNewContext(readFileSync('public/sw.js', 'utf8'), { self, caches, fetch, URL, Response, navigator: {} });
  return { listeners, caches, addAll, self, fetch };
}

it('removes only obsolete Quantum caches before taking control', async () => {
  const { listeners, caches, self } = worker();
  let completion: Promise<unknown> | undefined;
  listeners.get('activate')!({ waitUntil: (promise: Promise<unknown>) => { completion = promise; } });
  await completion;
  expect(caches.delete.mock.calls.map(([name]) => name)).toEqual(['quantum-pwa-v1', 'quantum-pwa-v2', 'quantum-pwa-v3', 'quantum-pwa-v4']);
  expect(self.clients.claim).toHaveBeenCalledOnce();
});

it('installs the local heading font alongside the new manifest', async () => {
  const { listeners, caches, addAll } = worker();
  let completion: Promise<unknown> | undefined;
  listeners.get('install')!({ waitUntil: (promise: Promise<unknown>) => { completion = promise; } });
  await completion;
  expect(caches.open).toHaveBeenCalledWith('quantum-pwa-v5');
  expect(addAll.mock.calls[0][0]).toEqual(expect.arrayContaining(['/manifest.webmanifest', '/brand-mark.svg', '/icons/maskable-512.png', '/icons/notification-badge.png', '/fonts/nunito.css', '/fonts/nunito-800.ttf']));
});

it('uses the monochrome Quantum mark for the Android notification badge', async () => {
  const { listeners, self } = worker();
  let completion: Promise<unknown> | undefined;
  listeners.get('push')!({ data: { json: () => ({ title: 'Бронирование подтверждено', body: 'Зал подтверждён', url: '/project/1' }) }, waitUntil: (promise: Promise<unknown>) => { completion = promise; } });
  await completion;
  expect(self.registration.showNotification).toHaveBeenCalledWith('Бронирование подтверждено', expect.objectContaining({
    icon: '/icons/192.png', badge: '/icons/notification-badge.png',
  }));
});

it('returns cached resources offline and an error response for a cache miss', async () => {
  const { listeners, caches } = worker();
  const respondWith = vi.fn();
  const request = { method: 'GET', url: 'https://quantum.test/fonts/nunito.css' };
  const cached = new Response('font css');
  caches.match.mockResolvedValueOnce(cached);
  listeners.get('fetch')!({ request, respondWith });
  expect(await respondWith.mock.calls[0][0]).toBe(cached);
  listeners.get('fetch')!({ request, respondWith });
  expect((await respondWith.mock.calls[1][0]).type).toBe('error');
});

it('leaves external requests and writes to the browser', () => {
  const { listeners } = worker();
  const respondWith = vi.fn();
  listeners.get('fetch')!({ request: { method: 'GET', url: 'https://api.test/passport' }, respondWith });
  listeners.get('fetch')!({ request: { method: 'POST', url: 'https://quantum.test/project' }, respondWith });
  expect(respondWith).not.toHaveBeenCalled();
});
