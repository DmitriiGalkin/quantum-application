// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, expect, it, vi } from 'vitest';
import type { MeetDto, ProjectDto } from 'entities';
const auth = vi.hoisted(() => ({ userId: 7 as number | undefined, role: 'user', passport: { users: [{ id: 7, title: 'Ребёнок' }] } }));
vi.mock('../../providers/auth-context.ts', () => ({ useAuth: () => auth }));
vi.mock('../../requests.ts', () => ({ fetchMeets: vi.fn(), fetchUserDashboard: vi.fn() }));
vi.mock('../../features/user/FamilyAccess.tsx', () => ({ default: ({ children }: { children: import('react').ReactNode }) => children }));
vi.mock('../../features/project/ui/Projects.tsx', () => ({ default: () => <div>Список проектов</div> }));
vi.mock('../../features/meets/MeetCard.tsx', () => ({ default: ({ meet }: { meet: MeetDto }) => <div data-next={meet.id}>{meet.projectTitle}</div> }));
import { fetchMeets, fetchUserDashboard } from '../../requests.ts';
import UserHomePage from './UserHomePage.tsx';

beforeEach(() => { vi.resetAllMocks(); auth.userId = 7; auth.role = 'user'; Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); });
async function render(check: (host: HTMLDivElement) => void) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const host = globalThis.document.createElement('div'); const root = createRoot(host);
  try {
    await act(async () => root.render(<QueryClientProvider client={client}><MemoryRouter><UserHomePage /></MemoryRouter></QueryClientProvider>));
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
    check(host);
  } finally { await act(async () => root.unmount()); client.clear(); }
}

it('takes the next meeting from actual enrolments and shows its unpaid next step', async () => {
  const unrelated = { id: 99, startedAt: '2098-01-01', status: 'published', duration: 60 } as MeetDto;
  vi.mocked(fetchUserDashboard).mockResolvedValue({ projects: [{ meets: [unrelated] } as ProjectDto] });
  vi.mocked(fetchMeets).mockResolvedValue([{ id: 1, projectId: 2, projectTitle: 'Встреча ребёнка', startedAt: '2099-01-01', status: 'published', duration: 60, price: 500, isPaid: false } as MeetDto]);
  await render(host => {
    expect(host.querySelector('[data-next]')?.getAttribute('data-next')).toBe('1');
    expect(host.textContent).toContain('Проверить участие и оплату');
    expect(host.querySelector('a[href="/project/2#meet-1"]')).not.toBeNull();
    expect(host.textContent).not.toContain('Здесь будет');
  });
});

it('shows a real empty start and loading errors instead of hiding the whole dashboard', async () => {
  vi.mocked(fetchUserDashboard).mockRejectedValue(new Error('Offline'));
  vi.mocked(fetchMeets).mockResolvedValue([]);
  await render(host => {
    expect(host.textContent).toContain('Ближайших подтверждённых встреч пока нет');
    expect(host.textContent).toContain('Найти проект для ребёнка');
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Не удалось загрузить проекты');
  });
});

it('waits for the child context before asking for private data on a direct link', async () => {
  auth.userId = undefined; auth.role = 'guest';
  await render(() => {
    expect(fetchUserDashboard).not.toHaveBeenCalled();
    expect(fetchMeets).not.toHaveBeenCalled();
  });
});
