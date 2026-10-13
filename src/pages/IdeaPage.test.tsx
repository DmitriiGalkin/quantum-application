// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import type { IdeaDashboard } from '../entities/idea.ts';

vi.mock('../providers/auth-context.ts', () => ({ useAuth: () => ({ passport: null, role: 'guest', authHandler: vi.fn() }) }));
vi.mock('../requests.ts', () => ({ fetchIdea: vi.fn(), fetchCreateProject: vi.fn(), generateImage: vi.fn(), fetchCreateProjectUser: vi.fn(), fetchCreateUser: vi.fn(), fetchProjectLeave: vi.fn(), fetchUpdateProject: vi.fn() }));
vi.mock('../components/ChatDialog.tsx', () => ({ default: () => null }));
import IdeaPage from './IdeaPage.tsx';

it('hydrates the full idea and gallery before projects, defaults to table and preserves explicit module mode', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const idea: IdeaDashboard = { id: 54, title: 'Robot idea', description: 'Full idea description '.repeat(30), image: '/one.jpg',
    userId: 0, passportId: null, userCount: 0, isLiked: 0, createdAt: '', today: false, user: null,
    photos: [{ id: 'one', fileName: 'one.jpg', url: '/one.jpg', isCover: true }, { id: 'two', fileName: 'two.jpg', url: '/two.jpg', isCover: false }],
    projects: [{ id: 100, title: 'Robot project', description: null, image: null, passport: { id: 42, title: 'Teacher', description: null },
      place: { id: 9, title: 'Center', address: 'Address', description: null, latitude: 0, longitude: 0, priceFrom: null }, users: [], meets: [], idea: null }] };
  idea.projects.push({ ...idea.projects[0], id: 101, title: 'Second project' });
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
  client.setQueryData(['idea', '54', { view: 'table', sort: 'new', when: undefined }], idea);
  client.setQueryData(['idea', '54', { view: 'module', sort: 'new', when: undefined }], idea);
  const page = (search = '') => <QueryClientProvider client={client}><MemoryRouter initialEntries={['/idea/54' + search]}><Routes><Route path="/idea/:id" element={<IdeaPage />} /></Routes></MemoryRouter></QueryClientProvider>;
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  host.innerHTML = renderToString(page());
  const errors: unknown[] = [];
  const root = hydrateRoot(host, page(), { onRecoverableError: error => errors.push(error) });
  try {
    await act(async () => {});
    expect(errors).toEqual([]);
    expect(host.querySelector('h1')?.textContent).toBe(idea.title);
    expect(host.textContent).toContain(idea.description);
    expect(host.textContent!.indexOf(idea.description)).toBeLessThan(host.textContent!.indexOf('Проекты по этой идее'));
    expect(host.querySelectorAll('button[aria-label^="Фотография "]')).toHaveLength(2);
    expect(host.querySelector('[aria-label="Таблица проектов"]')).not.toBeNull();
    const projectLinks = () => [...host.querySelectorAll('a[href^="/project/"]')].map(a => a.getAttribute('href'));
    expect(projectLinks()).toEqual(['/project/100', '/project/101']);
    await act(async () => host.querySelector<HTMLButtonElement>('button[aria-label="module"]')!.click());
    expect(host.querySelector('[aria-label="Таблица проектов"]')).toBeNull();
    expect(projectLinks()).toEqual(['/project/100', '/project/101']);
    await act(async () => host.querySelector<HTMLButtonElement>('button[aria-label="Таблица"]')!.click());
    expect(projectLinks()).toEqual(['/project/100', '/project/101']);
    const moduleHost = globalThis.document.createElement('div');
    moduleHost.innerHTML = renderToString(page('?view=module'));
    expect(moduleHost.querySelector('[aria-label="Таблица проектов"]')).toBeNull();
    expect(moduleHost.querySelector('[aria-label="Открыть проект Robot project"]')).not.toBeNull();
  } finally { await act(async () => root.unmount()); host.remove(); client.clear(); }
});
