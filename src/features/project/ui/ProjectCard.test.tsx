// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import type { ProjectDto } from '../../../entities/project.ts';
const auth = vi.hoisted(() => ({ passport: { id: 20 } as { id: number } | null, userId: 7, role: 'user', authHandler: vi.fn(), refetch: vi.fn() }));
vi.mock('../../../providers/auth-context.ts', () => ({ useAuth: () => auth }));
vi.mock('../../../requests.ts', () => ({ fetchCreateProjectUser: vi.fn().mockResolvedValue(1), fetchCreateUser: vi.fn(), fetchProjectLeave: vi.fn(), fetchUpdateProject: vi.fn() }));
vi.mock('../../../components/ChatDialog.tsx', () => ({ default: ({ open, teacherId }: { open: boolean; teacherId: number }) => open ? <output data-chat>{teacherId}</output> : null }));
import { fetchCreateProjectUser } from '../../../requests.ts';
import ProjectCard from './ProjectCard.tsx';

it('keeps project exit on details and removes it from listing cards', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const project = { id: 10, title: 'Project', description: '', image: null,
    passport: { id: 42, title: 'Teacher', description: null }, place: { id: 3, title: 'Center', address: 'Full address', description: null, latitude: 0, longitude: 0, priceFrom: null },
    meets: [], users: [{ id: 7, title: 'Child', age: null, image: null }], idea: null } satisfies ProjectDto;
  const client = new QueryClient(); const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  const root = createRoot(host);
  const render = (detailed: boolean) => <QueryClientProvider client={client}><MemoryRouter><ProjectCard project={project} detailed={detailed} /></MemoryRouter></QueryClientProvider>;
  try {
    await act(async () => root.render(render(false)));
    expect(host.querySelector('button[aria-haspopup="menu"]')).toBeNull();
    await act(async () => root.render(render(true)));
    const menu = host.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]');
    expect(menu).not.toBeNull();
    await act(async () => menu!.click());
    expect(globalThis.document.body.textContent).toContain('Выйти из проекта');
    expect(host.querySelector('[aria-label^="Полный адрес"]')).toBeNull();
  } finally { await act(async () => root.unmount()); host.remove(); client.clear(); }
});

function Location() { return <output>{useLocation().pathname}</output>; }
it.each([null, { id: 5, title: 'мастерская' }])('hydrates a card with hall %j; join does not navigate, picture does', async location => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const project: ProjectDto = { id: 100, title: 'Robot workshop', description: 'A detailed workshop description', image: 'https://storage.yandexcloud.net/quantum-education/idea-catalog/toy-001-generated-cover-v1.png',
    passport: { id: 42, title: 'Master', description: null },
    place: { id: 575, title: 'Center', address: 'Address', description: null, latitude: 55.75, longitude: 37.62, priceFrom: null },
    location, meets: [], users: [], idea: { id: 54, title: 'Robot', user: null, today: false, image: null, photos: [] } };
  const queryClient = new QueryClient();
  const render = () => <QueryClientProvider client={queryClient}><MemoryRouter><ProjectCard project={project} /><Location /></MemoryRouter></QueryClientProvider>;
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  host.innerHTML = renderToString(render());
  const errors: unknown[] = [];
  const root = hydrateRoot(host, render(), { onRecoverableError: error => errors.push(error) });
  try {
    await act(async () => {});
    expect(errors).toEqual([]);
    const pictureAction = host.querySelector<HTMLButtonElement>('[aria-label="Открыть проект Robot workshop"]')!;
    expect(pictureAction.querySelector('img')).not.toBeNull();
    expect(pictureAction.querySelector('a')).toBeNull();
    expect(host.textContent).toContain('Master'); expect(host.textContent).toContain('Center'); expect(host.textContent).toContain('Address');
    if (location) expect(host.textContent).toContain(`Center · ${location.title}`);
    else expect(host.textContent).not.toContain('Center ·');
    const join = [...host.querySelectorAll('button')].find(button => button.textContent === 'Вступить')!;
    await act(async () => { join.click(); });
    expect(fetchCreateProjectUser).toHaveBeenCalledWith({ userId: 7, projectId: 100 }, expect.anything());
    expect(host.querySelector('output')?.textContent).toBe('/');
    expect(host.querySelector('a[aria-label="Исходная идея"]')).toBeNull();
    await act(async () => { pictureAction.click(); });
    expect(host.querySelector('output')?.textContent).toBe('/project/100');
  } finally { await act(async () => root.unmount()); host.remove(); queryClient.clear(); }
});

it('restores a guest chat on the matching card after authentication and hides the teacher’s own chat button', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const project: ProjectDto = { id: 100, title: 'Project', description: null, image: null,
    passport: { id: 42, title: 'Teacher', description: null },
    place: { id: 9, title: 'Center', address: 'Address', description: null, latitude: 0, longitude: 0, priceFrom: null },
    users: Array.from({ length: 13 }, (_, id) => ({ id, title: `User ${id}`, age: null, image: `/users/${id}.jpg` })), meets: [], idea: null };
  const queryClient = new QueryClient();
  const host = globalThis.document.createElement('div');
  const root = createRoot(host);
  const render = () => <QueryClientProvider client={queryClient}><MemoryRouter>
    <ProjectCard project={{ ...project, id: 99 }} /><ProjectCard project={project} />
  </MemoryRouter></QueryClientProvider>;
  auth.passport = null;
  auth.role = 'guest';
  try {
    await act(async () => root.render(render()));
    expect(host.querySelectorAll('img[src^="/users/"]')).toHaveLength(20);
    expect(host.textContent).toContain('+3');
    expect(host.querySelector('a[aria-label="Исходная идея"]')).toBeNull();
    await act(async () => host.querySelectorAll<HTMLButtonElement>('[aria-label="Написать учителю"]')[1].click());
    expect(auth.authHandler).toHaveBeenCalled();
    expect(JSON.parse(globalThis.sessionStorage.getItem('post_auth_action')!)).toMatchObject({ type: 'project-chat', payload: { projectId: 100 } });
    auth.passport = { id: 20 };
    await act(async () => root.render(render()));
    expect(host.querySelectorAll('[data-chat]')).toHaveLength(1);
    expect(host.querySelector('[data-chat]')?.textContent).toBe('42');
    expect(globalThis.sessionStorage.getItem('post_auth_action')).toBeNull();
    auth.passport = { id: 42 };
    auth.role = 'teacher';
    await act(async () => root.render(render()));
    expect(host.querySelector('[aria-label="Написать учителю"]')).toBeNull();
  } finally {
    await act(async () => root.unmount()); queryClient.clear();
    auth.passport = { id: 20 }; auth.role = 'user'; globalThis.sessionStorage.clear();
  }
});
