// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import type { TeacherPublicDto } from '../entities/teacher.ts';
import type { MeetDto } from '../entities/meet.ts';

vi.mock('../providers/auth-context.ts', () => ({ useAuth: () => ({ passport: null, role: 'guest', authHandler: vi.fn() }) }));
vi.mock('../requests.ts', () => ({ fetchTeacher: vi.fn(), fetchCreateProjectUser: vi.fn(), fetchCreateUser: vi.fn(), fetchProjectLeave: vi.fn(), fetchUpdateProject: vi.fn() }));
vi.mock('../components/ChatDialog', () => ({ default: () => null }));
import { fetchTeacher } from '../requests.ts';
import TeachersPage from './TeachersPage.tsx';

const place = { id: 9, title: 'Center', address: 'Address', description: 'Center description', image: '/center.jpg', latitude: 0, longitude: 0, priceFrom: null };
const passport = { id: 42, title: 'Teacher', description: 'Teacher biography' };
const meets = Array.from({ length: 7 }, (_, id) => ({ id, projectId: 100, startedAt: `2099-01-0${id + 1}T22:00:00Z`, duration: 60, price: 0,
  status: 'published', deletedAt: null, place, passport } as MeetDto));
const teacher: TeacherPublicDto = { passport, projects: [{ id: 100, title: 'Project', description: null, image: null, place, passport, users: [], idea: null,
  meets: [...meets.toReversed(), { ...meets[0], id: 20, status: 'pending' }, { ...meets[0], id: 21, status: 'cancelled' }, { ...meets[0], id: 22, startedAt: '2000-01-01' }] }],
  centers: [place, place, { ...place, id: 10, image: null }], ideas: [], centersCount: 2, meets: 7, students: 999 };

function page(client: QueryClient, path = '/teachers/42') {
  return <QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><Routes><Route path="/teachers/:id" element={<TeachersPage />} /></Routes></MemoryRouter></QueryClientProvider>;
}

it('hydrates teacher sections in order with unique centers and no redundant meetings section', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
  client.setQueryData(['teacher', '42'], teacher);
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  host.innerHTML = renderToString(page(client));
  const errors: unknown[] = [];
  const root = hydrateRoot(host, page(client), { onRecoverableError: error => errors.push(error) });
  try {
    await act(async () => {});
    expect(errors).toEqual([]);
    const text = host.textContent!;
    const sections = ['Teacher biography', 'Центры работы', 'Проекты учителя', 'Проекты: 1'];
    for (let i = 1; i < sections.length; i++) expect(text.indexOf(sections[i])).toBeGreaterThan(text.indexOf(sections[i - 1]));
    expect(text).not.toContain('999'); expect(text).not.toContain('Ученики');
    expect(host.querySelectorAll('section')[0].querySelectorAll('a')).toHaveLength(2);
    expect(host.querySelector('img[src="/center.jpg"]')).not.toBeNull();
    expect(text).not.toContain('Ближайшие встречи');
    expect(host.querySelector('[aria-label="Таблица проектов"]')).not.toBeNull();
    expect(text).not.toContain('Идеи учителя');
    expect(text).not.toContain('Идей учителя пока нет.');
  } finally { await act(async () => root.unmount()); host.remove(); client.clear(); }
});

it('shows Russian loading, retry, missing teacher and empty sections', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  const host = globalThis.document.createElement('div');
  const root = createRoot(host);
  vi.mocked(fetchTeacher).mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(null as unknown as TeacherPublicDto);
  try {
    expect(renderToString(page(client))).toContain('Загрузка преподавателя');
    await act(async () => root.render(page(client)));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
    expect(host.textContent).toContain('Не удалось загрузить преподавателя.');
    await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
    expect(fetchTeacher).toHaveBeenCalledTimes(2);
    expect(host.textContent).toContain('Преподаватель не найден.');
    await act(async () => client.setQueryData(['teacher', '42'], { ...teacher, projects: [], centers: [], ideas: [] }));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
    expect(host.textContent).toContain('Центры работы пока не указаны.');
    expect(host.textContent).not.toContain('Ближайшие встречи');
    expect(host.textContent).toContain('Проектов пока нет.');
  } finally { await act(async () => root.unmount()); client.clear(); }
});
