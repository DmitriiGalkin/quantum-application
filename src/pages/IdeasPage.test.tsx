// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import type { FilterProps } from '../features/idea/hooks/useFilters';

const state = vi.hoisted(() => ({ location: { status: 'loading' } as { status: string; lat?: number; lng?: number } }));
vi.mock('../shared/lib/useLocation.ts', () => ({ useLocation: () => state.location }));
vi.mock('../requests.ts', () => ({ fetchIdeas: vi.fn(async () => []) }));
vi.mock('../features/place/MeetMap.tsx', () => ({ MeetMap: () => null }));
vi.mock('../features/idea/ui/IdeaGrids.tsx', () => ({ default: () => null }));
vi.mock('../features/idea/ui/Filter.tsx', () => ({ default: ({ setSort, setView }: FilterProps) => <><button onClick={() => setSort('nearby')}>nearby</button><button onClick={() => setView('map')}>map</button></> }));
import { fetchIdeas } from '../requests';
import IdeasPage from './IdeasPage';

it('keys idea requests only by API parameters, serving a fallback while location changes', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  const host = globalThis.document.createElement('div');
  const root = createRoot(host);
  const render = async () => { await act(async () => {
    root.render(<QueryClientProvider client={client}><MemoryRouter><IdeasPage /></MemoryRouter></QueryClientProvider>);
    await new Promise(resolve => setTimeout(resolve, 10));
  }); };
  const click = async (label: string) => { await act(async () => { [...host.querySelectorAll('button')].find(row => row.textContent === label)!.click(); await new Promise(resolve => setTimeout(resolve, 10)); }); };
  try {
    await render();
    expect(fetchIdeas).toHaveBeenLastCalledWith({ sort: 'new', when: undefined });
    await click('nearby');
    expect(fetchIdeas).toHaveBeenLastCalledWith({ sort: 'nearby', when: undefined });
    const fallbackCalls = vi.mocked(fetchIdeas).mock.calls.length;
    state.location = { status: 'error' }; await render(); await click('map');
    expect(vi.mocked(fetchIdeas).mock.calls.length).toBe(fallbackCalls);
    state.location = { status: 'success', lat: 55.75, lng: 37.62 }; await render();
    expect(fetchIdeas).toHaveBeenLastCalledWith({ sort: 'nearby', when: undefined, latitude: 55.75, longitude: 37.62 });
    expect(client.getQueryCache().getAll()).toHaveLength(3);
  } finally { await act(async () => root.unmount()); client.clear(); }
});
