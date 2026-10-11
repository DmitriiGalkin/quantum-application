// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import type { ProjectDto } from '../../../entities/project.ts';
vi.mock('../../../providers/auth-context.ts', () => ({ useAuth: () => ({ passport: { id: 20 }, userId: 7, role: 'user', authHandler: vi.fn(), refetch: vi.fn() }) }));
vi.mock('../../../requests.ts', () => ({ fetchCreateProjectUser: vi.fn().mockResolvedValue(1), fetchCreateUser: vi.fn(), fetchProjectLeave: vi.fn(), fetchUpdateProject: vi.fn() }));
vi.mock('../../../components/ChatDialog.tsx', () => ({ default: () => null }));
import { fetchCreateProjectUser } from '../../../requests.ts';
import ProjectCard from './ProjectCard.tsx';

function Location() { return <output>{useLocation().pathname}</output>; }
it.each([null, { id: 5, title: 'мастерская' }])('hydrates a card with hall %j; join does not navigate, picture does', async location => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const project: ProjectDto = { id: 100, title: 'Robot workshop', description: 'A detailed workshop description', image: '/catalog/toy-001-generated-cover-v1.png',
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
    expect(host.querySelector('a[aria-label="Исходная идея"]')?.getAttribute('href')).toBe('/idea/54');
    await act(async () => { pictureAction.click(); });
    expect(host.querySelector('output')?.textContent).toBe('/project/100');
  } finally { await act(async () => root.unmount()); host.remove(); queryClient.clear(); }
});
