// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, expect, it, vi } from 'vitest';
import type { FeedItem, MeetDto, ProjectDto } from 'entities';
vi.mock('../providers/auth-context.ts', () => ({ useAuth: () => ({ role: 'guest', passport: null }) }));
vi.mock('../requests.ts', () => ({ fetchProject: vi.fn(), fetchPlace: vi.fn() }));
vi.mock('../features/project/ui/ProjectCard.tsx', () => ({ default: ({ project, detailed }: { project: ProjectDto; detailed: boolean }) => <h1>{project.title} {detailed ? project.description : ''}</h1> }));
vi.mock('../features/meets/MeetCard.tsx', () => ({ default: ({ meet }: { meet: MeetDto }) => <div data-meet={meet.id}>{meet.id}</div> }));
vi.mock('../features/feed/Feed.tsx', () => ({ Feed: ({ items }: { items: FeedItem[] }) => <div data-history>{items.map(item => <span key={item.id}>{item.id}</span>)}</div> }));
vi.mock('../features/meets/CreateMeet.tsx', () => ({ default: () => null }));
import { fetchProject, fetchPlace } from '../requests.ts';
import ProjectPage from './ProjectPage.tsx';

beforeEach(() => { vi.resetAllMocks(); Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); });
async function render(path: string, check: (host: HTMLDivElement) => void) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const host = globalThis.document.createElement('div'); globalThis.document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><Routes><Route path="project/:id" element={<ProjectPage />} /></Routes></MemoryRouter></QueryClientProvider>));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    check(host);
  } finally { await act(async () => root.unmount()); client.clear(); host.remove(); }
}

it('puts future published meetings first, preserves other events and needs no second centre request for a guest', async () => {
  const meets = [
    { id: 3, startedAt: '2099-02-07T10:00:00Z', status: 'published', deletedAt: null },
    { id: 2, startedAt: '2099-01-07T10:00:00Z', status: 'published', deletedAt: null },
    { id: 1, startedAt: '2000-01-07T10:00:00Z', status: 'published', deletedAt: null },
    { id: 4, startedAt: '2099-03-07T10:00:00Z', status: 'cancelled', deletedAt: null },
  ] as MeetDto[];
  const project = { id: 1, title: 'Робот', description: 'Полное описание', passport: { id: 3 }, place: { id: 4 }, meets,
    feeds: [{ id: 'join1', type: 'join', createdAt: '2026-01-01' }, { id: 'meet2', type: 'meet', createdAt: meets[1].startedAt, meet: meets[1] }] } as ProjectDto;
  vi.mocked(fetchProject).mockResolvedValue(project);
  await render('/project/1', host => {
    expect(host.querySelector('h1')?.textContent).toContain('Полное описание');
    expect([...host.querySelectorAll('[data-meet]')].map(element => element.getAttribute('data-meet'))).toEqual(['2', '3']);
    expect(host.querySelector('[data-history]')?.textContent).toContain('meet1');
    expect(host.querySelector('[data-history]')?.textContent).toContain('meet4');
    expect(host.querySelector('[data-history]')?.textContent).toContain('join1');
    expect(host.querySelector('[data-history]')?.textContent).not.toContain('meet2');
    expect(fetchPlace).not.toHaveBeenCalled();
    expect(project.meets.map(meet => meet.id)).toEqual([3, 2, 1, 4]);
  });
});

it('shows a retryable project error instead of a blank screen', async () => {
  vi.mocked(fetchProject).mockRejectedValue(new Error('Offline'));
  await render('/project/1', host => {
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Не удалось загрузить проект');
    expect(host.querySelector('button')?.textContent).toBe('Повторить');
  });
});

it('rejects invalid links without sending a project request', async () => {
  await render('/project/invalid', host => {
    expect(host.textContent).toContain('Проект не найден');
    expect(fetchProject).not.toHaveBeenCalled();
  });
});
