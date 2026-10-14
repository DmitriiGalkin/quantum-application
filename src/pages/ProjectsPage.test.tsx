// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';

vi.mock('../requests.ts', () => ({ fetchProjects: vi.fn() }));
vi.mock('../shared/lib/useLocation.ts', () => ({ useLocation: () => ({ status: 'error' }) }));
vi.mock('../features/project/ui/Projects.tsx', () => ({ default: () => <div>Каталог</div> }));
import { fetchProjects } from '../requests.ts';
import ProjectsPage from './ProjectsPage.tsx';

function Location() {
  return <output>{useLocation().search}</output>;
}

it('keeps filters available during loading and errors and preserves them when clearing search', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  let rejectRequest!: (error: Error) => void;
  vi.mocked(fetchProjects).mockImplementationOnce(() => new Promise((_, reject) => { rejectRequest = reject; }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const host = globalThis.document.createElement('div');
  const root = createRoot(host);
  const flush = () => new Promise(resolve => setTimeout(resolve, 20));
  try {
    await act(async () => root.render(<QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/?q=wood&sort=popular&view=table&when=tomorrow']}>
        <ProjectsPage /><Location />
      </MemoryRouter>
    </QueryClientProvider>));
    expect(host.querySelector('[role="combobox"]')).not.toBeNull();
    expect(host.querySelector('[aria-label="Таблица"]')).not.toBeNull();
    expect(host.textContent).toContain('Загрузка проектов');
    expect(fetchProjects).toHaveBeenCalledWith({ q: 'wood', upcomingOnly: true, sort: 'popular', when: 'tomorrow' });
    await act(async () => { rejectRequest(new Error('Offline')); await flush(); });
    expect(host.textContent).toContain('Не удалось загрузить проекты');
    expect(host.querySelector('[role="combobox"]')).not.toBeNull();
    vi.mocked(fetchProjects).mockResolvedValue([]);
    await act(async () => {
      [...host.querySelectorAll('button')].find(button => button.textContent === 'Очистить поиск')!.click();
      await flush();
    });
    const params = new URLSearchParams(host.querySelector('output')!.textContent!);
    expect(params.has('q')).toBe(false);
    expect(Object.fromEntries(params)).toEqual({ sort: 'popular', view: 'table', when: 'tomorrow' });
    expect(host.querySelector('input')!.value).toBe('');
    expect(fetchProjects).toHaveBeenLastCalledWith({ q: '', upcomingOnly: true, sort: 'popular', when: 'tomorrow' });
  } finally { await act(async () => root.unmount()); client.clear(); }
});
