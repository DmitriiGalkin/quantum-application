// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
const auth = vi.hoisted(() => ({ role: 'guest', passport: null as null | { id: number }, authHandler: vi.fn() }));
vi.mock('../providers/auth-context.ts', () => ({ useAuth: () => auth }));
import HeaderView from './Header.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
vi.mock('../requests.ts', () => ({ fetchConversations: vi.fn().mockResolvedValue([]), fetchNotifications: vi.fn().mockResolvedValue([]) }));
function Header() { return <QueryClientProvider client={new QueryClient({ defaultOptions:{queries:{retry:false}} })}><HeaderView /></QueryClientProvider>; }
import Menu from './Menu.tsx';
import ProjectsRedirect from '../pages/ProjectsRedirect.tsx';
import { Footer } from './Footer2.tsx';

it('links the active application footer to the showcase and idea library', () => {
  const host = globalThis.document.createElement('div');
  host.innerHTML = renderToString(<Footer />);
  expect(host.querySelector('a[href="/"]')?.textContent).toBe('Проекты');
  expect(host.querySelector('a[href="/ideas"]')?.textContent).toBe('Библиотека идей');
  expect(host.querySelector('a[href="/craft-school-program"]')?.textContent).toBe('Программа ремесла');
});

it.each(['guest', 'user', 'teacher', 'place'])('shows account navigation only to authenticated %s', role => {
  auth.role = role;
  auth.passport = role === 'guest' ? null : { id: 1 };
  const host = globalThis.document.createElement('div');
  host.innerHTML = renderToString(<MemoryRouter><Header /><Menu setIsMenuOpen={() => {}} /></MemoryRouter>);
  expect([...host.querySelectorAll('a[href="/"]')].some(a => a.textContent === 'Проекты')).toBe(true);
  expect(host.textContent).not.toContain('Платформа');
  expect(Boolean(host.querySelector('[aria-label="Открыть меню"]'))).toBe(role !== 'guest');
  expect(Boolean(host.querySelector('[aria-label="Мой кабинет"]'))).toBe(role !== 'guest');
  if (role !== 'guest') expect(host.textContent).toContain('Мой кабинет');
  if (role === 'teacher') expect(host.querySelector('a[href="/ideas"]')).not.toBeNull();
  expect(host.querySelector('[aria-label="Сообщения"]')).not.toBeNull();
});
it('asks a guest to log in with the messages return path', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  auth.role = 'guest';
  auth.passport = null;
  const host = globalThis.document.createElement('div'); const root = createRoot(host);
  try {
    await act(async () => root.render(<MemoryRouter><Header /></MemoryRouter>));
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Сообщения"]')!.click());
    expect(auth.authHandler).toHaveBeenCalledWith('/chats');
  } finally { await act(async () => root.unmount()); }
});
it.each(['user', 'teacher', 'place'])('renders compact navigation with an active dashboard for %s', role => {
  auth.role = role;
  auth.passport = { id: 1 };
  const host = globalThis.document.createElement('div');
  host.innerHTML = renderToString(<MemoryRouter initialEntries={[`/${role}`]}><Menu compact /></MemoryRouter>);
  expect(host.querySelector('a[aria-current="page"]')?.getAttribute('href')).toBe(`/${role}`);
  expect(host.querySelector('.MuiListItemText-root')).toBeNull();
  expect(host.querySelectorAll('a[aria-label]').length).toBeGreaterThan(3);
  expect(host.textContent).not.toContain('Платформа');
});
it('redirects old project catalog links without losing query or anchor', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  function Location() { const location = useLocation(); return <output>{location.pathname + location.search + location.hash}</output>; }
  const host = globalThis.document.createElement('div'); const root = createRoot(host);
  try {
    await act(async () => root.render(<MemoryRouter initialEntries={['/projects?view=table&q=wood&sort=popular#results']}><ProjectsRedirect /><Location /></MemoryRouter>));
    expect(host.querySelector('output')!.textContent).toBe('/?view=table&q=wood&sort=popular#results');
  } finally { await act(async () => root.unmount()); }
});
