// @vitest-environment jsdom
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import type { IdeaDto } from 'entities';

vi.mock('../requests.ts', () => ({ fetchIdeas: vi.fn() }));
import CraftSchoolProgramPage from './CraftSchoolProgramPage.tsx';
import { fetchIdeas } from '../requests.ts';
import savedIdeas from '../features/idea/data/craft-program-cards.json';

it('hydrates the program with current idea cards, unlinked products and missing-idea messages', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });
  const ideas: IdeaDto[] = [{ id: 88, title: 'Медальон из каталога', description: 'Актуальное описание', image: 'https://example.com/88.jpg',
    userId: 0, passportId: null, userCount: 0, createdAt: '2026-10-14', isLiked: 0, user: null, today: false, photos: [] }];
  client.setQueryData(['ideas', {}], ideas);
  const app = <QueryClientProvider client={client}><MemoryRouter><CraftSchoolProgramPage /></MemoryRouter></QueryClientProvider>;
  const host = globalThis.document.createElement('div');
  host.innerHTML = renderToString(app);
  const errors: unknown[] = [];
  const root = hydrateRoot(host, app, { onRecoverableError: error => errors.push(error) });
  try {
    await act(async () => {});
    expect(errors).toEqual([]);
    expect(host.querySelector('h1')?.textContent).toBe('Программа вальдорфской школы по ремеслу');
    expect(host.querySelector('img')?.getAttribute('src')).toBe('https://example.com/88.jpg');
    expect(host.textContent).toContain('Актуальное описание');
    expect(host.textContent).toContain('идея недоступна.');
    const link = host.querySelector('a[href="/idea/88"]');
    expect(link?.querySelector('img')?.getAttribute('src')).toBe('https://example.com/88.jpg');
    expect(link?.textContent).toContain('Медальон из каталога');
    expect(link?.textContent).toContain('Актуальное описание');
    expect(host.textContent).toContain('Паучёк');
    expect(host.textContent).not.toMatch(/Рукописн|Расшифровка|Связь с каталогом/);
  } finally { await act(async () => root.unmount()); client.clear(); }
});

it('keeps program text during loading and an error, and retries the catalog request', async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.mocked(fetchIdeas).mockReset().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce([]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const host = globalThis.document.createElement('div');
  const app = <QueryClientProvider client={client}><MemoryRouter><CraftSchoolProgramPage /></MemoryRouter></QueryClientProvider>;
  const initial = renderToString(app);
  expect(initial).toContain('Обновление идей программы…');
  expect(initial).toContain('Паучёк');
  host.innerHTML = initial;
  expect(host.querySelectorAll('a[href^="/idea/"]')).toHaveLength(savedIdeas.length);
  expect(host.querySelectorAll('a[href^="/idea/"] img')).toHaveLength(savedIdeas.length);
  const errors: unknown[] = [];
  const root = hydrateRoot(host, app, { onRecoverableError: error => errors.push(error) });
  try {
    await act(async () => {});
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
    expect(errors).toEqual([]);
    expect(host.textContent).toContain('Не удалось обновить идеи программы.');
    expect(host.textContent).toContain('Показана сохранённая версия каталога.');
    expect(host.querySelectorAll('a[href^="/idea/"] img')).toHaveLength(savedIdeas.length);
    expect(host.textContent).toContain('Паучёк');
    await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent === 'Повторить')!.click());
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
    expect(fetchIdeas).toHaveBeenCalledTimes(2);
    expect(host.textContent).toContain('идея недоступна.');
  } finally { await act(async () => root.unmount()); client.clear(); }
});
