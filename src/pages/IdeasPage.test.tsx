// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
vi.mock('../requests.ts', () => ({ fetchIdeas: vi.fn(async () => []) }));
vi.mock('../features/idea/ui/IdeaGrids.tsx', () => ({ default: () => null }));
import { fetchIdeas } from '../requests';
import IdeasPage from './IdeasPage';

it('keeps legacy map, nearby and date URLs on the idea cards without applying meeting filters', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const host = globalThis.document.createElement('div');
  const root = createRoot(host);
  try {
    await act(async () => {
      root.render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/ideas?sort=nearby&view=map&when=today']}>
        <IdeasPage />
      </MemoryRouter></QueryClientProvider>);
    });
    expect(fetchIdeas).toHaveBeenLastCalledWith({ sort: 'new' });
    expect(host.querySelector('[aria-label="Карточки"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelector('[aria-label="Центры на карте"]')).toBeNull();
    expect(host.querySelector('[aria-label="Дата встречи"]')).toBeNull();
  } finally { await act(async () => root.unmount()); client.clear(); }
});
