// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PassportExtendedDto } from 'entities';

vi.mock('../requests.ts', () => ({ fetchPassport: vi.fn() }));
import { fetchPassport } from '../requests.ts';
import { AuthProvider } from './AuthProvider.tsx';
import { useAuth } from './auth-context.ts';
import { storeAuth } from './auth-store.ts';

const profile: PassportExtendedDto = { id: 1, title: 'Parent', description: null, isTeacher: true, places: [], users: [{ id: 2, title: 'Child', age: null, image: null }] };
let root: Root | undefined;
beforeEach(() => {
  vi.clearAllMocks();
  globalThis.localStorage.clear();
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.mocked(fetchPassport).mockResolvedValue(profile);
});
afterEach(async () => {
  await act(async () => { root?.unmount(); });
  root = undefined;
  globalThis.document.body.innerHTML = '';
});

function Status() {
  const auth = useAuth();
  return <div><span data-role={auth.role}>{auth.passport?.title ?? 'Guest'}</span><button onClick={auth.switchTeacher}>Teacher</button><button onClick={auth.logout}>Logout</button></div>;
}
function app(client: QueryClient) {
  return <QueryClientProvider client={client}><MemoryRouter><AuthProvider><Status /></AuthProvider></MemoryRouter></QueryClientProvider>;
}
async function flush() { await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); }); }

describe('auth rendering and cache isolation', () => {
  it('hydrates the guest snapshot before reading a stored session', async () => {
    storeAuth('session');
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const container = globalThis.document.createElement('div');
    container.innerHTML = renderToString(app(client));
    expect(container.textContent).toContain('Guest');
    globalThis.document.body.append(container);
    const onRecoverableError = vi.fn();
    await act(async () => { root = hydrateRoot(container, app(client), { onRecoverableError }); });
    await flush();
    expect(container.querySelector('span')?.textContent).toBe('Parent');
    expect(container.querySelector('span')?.getAttribute('data-role')).toBe('user');
    expect(onRecoverableError).not.toHaveBeenCalled();
  });

  it('resets cached private data when changing roles and logging out', async () => {
    storeAuth('session', { role: 'user', userId: 2 });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const container = globalThis.document.createElement('div');
    globalThis.document.body.append(container);
    await act(async () => { root = createRoot(container); root.render(app(client)); });
    await flush();
    client.setQueryData(['private-data'], { owner: 1 });
    await act(async () => { container.querySelectorAll('button')[0].click(); });
    await flush();
    expect(client.getQueryData(['private-data'])).toBeUndefined();
    expect(container.querySelector('span')?.getAttribute('data-role')).toBe('teacher');
    await act(async () => { container.querySelectorAll('button')[1].click(); });
    await flush();
    expect(container.querySelector('span')?.textContent).toBe('Guest');
    expect(globalThis.localStorage.getItem('access_token')).toBeNull();
  });
});
